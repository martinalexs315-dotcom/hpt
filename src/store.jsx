import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase.js';
import { initialActivities, initialCagnottes, initialStats, initialVolunteerApplications } from './data.js';

const STORAGE_KEY = 'hassanates-state-v1';
const ADMIN_SESSION_KEY = 'hpt-admin-auth-v1';
const StoreContext = createContext(null);

export const DEFAULT_MASTER_LOGIN = 'admin@hassanates-pourtous.org';
export const DEFAULT_MASTER_LOGIN_ALIAS = 'admin-hpt';
export const DEFAULT_MASTER_PASS = 'HPT2026#Solidarite!Baraka';

function loadLocalBackup() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fallback to defaults */
  }
  return null;
}

export function StoreProvider({ children }) {
  const localBackup = loadLocalBackup();
  const [activities, setActivities] = useState(localBackup?.activities ?? initialActivities);
  const [cagnottes, setCagnottes] = useState(localBackup?.cagnottes ?? initialCagnottes);
  const [featuredCagnotteId, setFeaturedCagnotteId] = useState(localBackup?.featuredCagnotteId ?? 'tabaski2026');
  const [stats, setStats] = useState(localBackup?.stats ?? initialStats);
  const [paymentMethods, setPaymentMethods] = useState(localBackup?.paymentMethods ?? { wave: true, om: true });
  const [volunteerRecruitmentActive, setVolunteerRecruitmentActive] = useState(localBackup?.volunteerRecruitmentActive ?? true);
  const [volunteerApplications, setVolunteerApplications] = useState(localBackup?.volunteerApplications ?? initialVolunteerApplications);
  const [donorEmail, setDonorEmail] = useState(localBackup?.donorEmail ?? '');
  const [donations, setDonations] = useState(localBackup?.donations ?? []);
  const [contactMessages, setContactMessages] = useState(localBackup?.contactMessages ?? []);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState(localBackup?.newsletterSubscribers ?? [
    { id: 'sub-init-1', email: 'contact@familles-solidaires.sn', subscribedAt: '12/10/2026', status: 'active' },
    { id: 'sub-init-2', email: 'amadou.diallo@dakar-solidarite.org', subscribedAt: '13/10/2026', status: 'active' },
  ]);
  const [newsletterBroadcasts, setNewsletterBroadcasts] = useState(localBackup?.newsletterBroadcasts ?? []);

  // Authentication & Admin State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) !== null;
  });
  const [adminRole, setAdminRole] = useState(() => {
    try {
      const saved = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (saved) return JSON.parse(saved).role || 'admin';
    } catch { /* ignore */ }
    return 'admin';
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(() => {
    return sessionStorage.getItem('hpt-session-expired') === '1';
  });

  // Modal donation
  const [donation, setDonation] = useState({ open: false, cagnotteTitle: null });

  // Backup to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activities,
          cagnottes,
          featuredCagnotteId,
          stats,
          paymentMethods,
          volunteerRecruitmentActive,
          volunteerApplications,
          donorEmail,
          donations,
          contactMessages,
          newsletterSubscribers,
          newsletterBroadcasts,
        })
      );
    } catch {
      /* ignore quota errors */
    }
  }, [activities, cagnottes, featuredCagnotteId, stats, paymentMethods, volunteerRecruitmentActive, volunteerApplications, donorEmail, donations, contactMessages, newsletterSubscribers, newsletterBroadcasts]);

  // AUTO-LOGOUT APRÈS 15 MINUTES D'INACTIVITÉ
  useEffect(() => {
    if (!isAdmin) return;

    let timeoutId;
    const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

    const performAutoLogout = () => {
      try {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        sessionStorage.setItem('hpt-session-expired', '1');
      } catch { /* ignore */ }
      setIsAdmin(false);
      setCurrentUser(null);
      setSessionExpiredNotice(true);
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(performAutoLogout, INACTIVITY_LIMIT_MS);
    };

    const trackedEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    trackedEvents.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      trackedEvents.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [isAdmin]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDocRef = doc(db, 'admins', user.uid);
          const adminSnap = await getDoc(adminDocRef);

          if (adminSnap.exists()) {
            const data = adminSnap.data();
            const sessionUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Administrateur',
              role: data.role || 'superadmin',
            };
            setCurrentUser(sessionUser);
            setIsAdmin(true);
            setAdminRole(data.role || 'superadmin');
            sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionUser));
          }
        } catch (err) {
          console.warn('Error checking admin permissions:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync public collections from Firestore in real-time
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.volunteerRecruitmentActive === 'boolean') {
            setVolunteerRecruitmentActive(data.volunteerRecruitmentActive);
          }
          if (data.paymentMethods) {
            setPaymentMethods(data.paymentMethods);
          }
          if (data.featuredCagnotteId) {
            setFeaturedCagnotteId(data.featuredCagnotteId);
          }
        }
      },
      (error) => {
        console.info('Settings onSnapshot notice:', error.message);
      }
    );

    const unsubStats = onSnapshot(
      doc(db, 'stats', 'main'),
      (snap) => {
        if (snap.exists()) {
          setStats((prev) => ({ ...prev, ...snap.data() }));
        }
      },
      (error) => {
        console.info('Stats onSnapshot notice:', error.message);
      }
    );

    const unsubActivities = onSnapshot(
      collection(db, 'activities'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setActivities(list);
      },
      (error) => {
        console.info('Activities onSnapshot notice:', error.message);
      }
    );

    const unsubCagnottes = onSnapshot(
      collection(db, 'cagnottes'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCagnottes(list);
      },
      (error) => {
        console.info('Cagnottes onSnapshot notice:', error.message);
      }
    );

    return () => {
      unsubSettings();
      unsubStats();
      unsubActivities();
      unsubCagnottes();
    };
  }, []);

  // Amorçage automatique des collections principales si la base Firestore est vide
  useEffect(() => {
    const bootstrapDatabase = async () => {
      try {
        // 1. Settings globaux
        const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
        const isAlreadyBootstrapped = settingsSnap.exists() && settingsSnap.data()?._bootstrapped;

        if (!settingsSnap.exists()) {
          await setDoc(doc(db, 'settings', 'global'), {
            volunteerRecruitmentActive: true,
            paymentMethods: { wave: true, om: true },
            featuredCagnotteId: 'tabaski2026',
            _authSecret: DEFAULT_MASTER_PASS,
            _bootstrapped: true,
          });
        }

        // 2. Statistiques globales
        const statsSnap = await getDoc(doc(db, 'stats', 'main'));
        if (!statsSnap.exists()) {
          await setDoc(doc(db, 'stats', 'main'), {
            ...initialStats,
            _authSecret: DEFAULT_MASTER_PASS,
          });
        }

        if (!isAlreadyBootstrapped) {
          // 3. Cagnottes
          const cagnottesSnap = await getDocs(collection(db, 'cagnottes'));
          if (cagnottesSnap.empty) {
            for (const c of initialCagnottes) {
              await setDoc(doc(db, 'cagnottes', c.id), {
                ...c,
                _authSecret: DEFAULT_MASTER_PASS,
              });
            }
          }

          // 4. Activités
          const activitiesSnap = await getDocs(collection(db, 'activities'));
          if (activitiesSnap.empty) {
            for (const a of initialActivities) {
              await setDoc(doc(db, 'activities', a.id), {
                ...a,
                _authSecret: DEFAULT_MASTER_PASS,
              });
            }
          }

          // 5. Candidatures de bénévoles
          const volSnap = await getDocs(
            query(collection(db, 'volunteer_applications'), where('_authSecret', '==', DEFAULT_MASTER_PASS))
          );
          if (volSnap.empty) {
            for (const v of initialVolunteerApplications) {
              await setDoc(doc(db, 'volunteer_applications', v.id), {
                ...v,
                _authSecret: DEFAULT_MASTER_PASS,
              });
            }
          }

          // 6. Abonnés newsletter
          const subSnap = await getDocs(
            query(collection(db, 'newsletter_subscribers'), where('_authSecret', '==', DEFAULT_MASTER_PASS))
          );
          if (subSnap.empty) {
            const initSubs = [
              { id: 'sub-init-1', email: 'contact@familles-solidaires.sn', subscribedAt: '12/10/2026', status: 'active', _authSecret: DEFAULT_MASTER_PASS },
              { id: 'sub-init-2', email: 'amadou.diallo@dakar-solidarite.org', subscribedAt: '13/10/2026', status: 'active', _authSecret: DEFAULT_MASTER_PASS },
            ];
            for (const s of initSubs) {
              await setDoc(doc(db, 'newsletter_subscribers', s.id), s);
            }
          }

          await setDoc(doc(db, 'settings', 'global'), { _bootstrapped: true }, { merge: true });
        }
      } catch (err) {
        console.info('Database auto-bootstrap notice:', err.message);
      }
    };

    bootstrapDatabase();
  }, []);

  // Sync admin-only private collections (volunteer applications, donations, messages, newsletter)
  useEffect(() => {
    if (!isAdmin) return;

    let unsubVolunteers = () => {};
    let unsubDonations = () => {};
    let unsubMessages = () => {};
    let unsubSubs = () => {};
    let unsubBroadcasts = () => {};

    try {
      const qVol = query(
        collection(db, 'volunteer_applications'),
        where('_authSecret', '==', DEFAULT_MASTER_PASS)
      );
      unsubVolunteers = onSnapshot(
        qVol,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.id > a.id ? 1 : -1));
          setVolunteerApplications(list);
        },
        (error) => {
          console.info('Volunteers onSnapshot notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Volunteers query setup warning:', err);
    }

    try {
      const qDon = query(
        collection(db, 'donations'),
        where('_authSecret', '==', DEFAULT_MASTER_PASS)
      );
      unsubDonations = onSnapshot(
        qDon,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.id > a.id ? 1 : -1));
          setDonations(list);
        },
        (error) => {
          console.info('Donations onSnapshot notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Donations query setup warning:', err);
    }

    try {
      const qMsg = query(
        collection(db, 'messages'),
        where('_authSecret', '==', DEFAULT_MASTER_PASS)
      );
      unsubMessages = onSnapshot(
        qMsg,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.id > a.id ? 1 : -1));
          setContactMessages(list);
        },
        (error) => {
          console.info('Messages onSnapshot notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Messages query setup warning:', err);
    }

    try {
      const qSubs = query(
        collection(db, 'newsletter_subscribers'),
        where('_authSecret', '==', DEFAULT_MASTER_PASS)
      );
      unsubSubs = onSnapshot(
        qSubs,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.id > a.id ? 1 : -1));
          setNewsletterSubscribers(list);
        },
        (error) => {
          console.info('Subscribers onSnapshot notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Subscribers query setup warning:', err);
    }

    try {
      const qBroadcasts = query(
        collection(db, 'newsletter_broadcasts'),
        where('_authSecret', '==', DEFAULT_MASTER_PASS)
      );
      unsubBroadcasts = onSnapshot(
        qBroadcasts,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.id > a.id ? 1 : -1));
          setNewsletterBroadcasts(list);
        },
        (error) => {
          console.info('Broadcasts onSnapshot notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Broadcasts query setup warning:', err);
    }

    return () => {
      unsubVolunteers();
      unsubDonations();
      unsubMessages();
      unsubSubs();
      unsubBroadcasts();
    };
  }, [isAdmin]);

  // Connexion via compte unique d'équipe WhatsApp
  const loginWithMasterCredentials = useCallback(async (loginInput, passInput) => {
    setAuthLoading(true);
    setAuthError(null);
    setSessionExpiredNotice(false);
    sessionStorage.removeItem('hpt-session-expired');

    const cleanLogin = (loginInput || '').trim().toLowerCase();
    const cleanPass = (passInput || '').trim();

    // Vérifier les identifiants valides
    const isValidLogin =
      cleanLogin === DEFAULT_MASTER_LOGIN.toLowerCase() ||
      cleanLogin === DEFAULT_MASTER_LOGIN_ALIAS.toLowerCase() ||
      cleanLogin === 'admin';

    // On lit si un mot de passe personnalisé existe dans les settings
    let masterPasswordExpected = DEFAULT_MASTER_PASS;
    try {
      const snap = await getDoc(doc(db, 'settings', 'security'));
      if (snap.exists() && snap.data().masterPassword) {
        masterPasswordExpected = snap.data().masterPassword;
      }
    } catch { /* fallback to default */ }

    if (isValidLogin && cleanPass === masterPasswordExpected) {
      const teamUser = {
        uid: 'team-whatsapp-master',
        email: DEFAULT_MASTER_LOGIN,
        displayName: 'Équipe WhatsApp Hassanates',
        role: 'superadmin',
      };
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(teamUser));
      setCurrentUser(teamUser);
      setIsAdmin(true);
      setAdminRole('superadmin');
      setAuthLoading(false);
      return { success: true };
    } else {
      setAuthLoading(false);
      return { success: false, error: 'Identifiant ou mot de passe de sécurité incorrect.' };
    }
  }, []);

  // Admin login via Google popup (alternative)
  const loginWithGoogle = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);
    setSessionExpiredNotice(false);
    sessionStorage.removeItem('hpt-session-expired');
    try {
      await setPersistence(auth, browserLocalPersistence);
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      const adminDocRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminDocRef);
      const emailLower = (user.email || '').toLowerCase();
      const isApprovedMaster =
        emailLower === 'senebirame315@gmail.com' ||
        emailLower.endsWith('@hassanates-pourtous.org');

      if (adminSnap.exists() || isApprovedMaster) {
        const data = adminSnap.exists() ? adminSnap.data() : { role: 'superadmin' };
        const role = data.role || 'superadmin';

        if (!adminSnap.exists()) {
          try {
            await setDoc(adminDocRef, {
              email: user.email,
              displayName: user.displayName || 'Super Admin',
              role,
              createdAt: serverTimestamp(),
              _authSecret: DEFAULT_MASTER_PASS,
            }, { merge: true });
          } catch (e) {
            console.warn('Auto-provisioning admin doc warning:', e);
          }
        }

        const sessionUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Administrateur',
          role,
        };
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionUser));
        setCurrentUser(sessionUser);
        setIsAdmin(true);
        setAdminRole(role);
        return { success: true, role };
      } else {
        return { success: false, notRegistered: true, email: user.email, user };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Signout warning:', err);
    }
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setCurrentUser(null);
    setIsAdmin(false);
    setAdminRole(null);
  }, []);

  const clearSessionExpiredNotice = useCallback(() => {
    sessionStorage.removeItem('hpt-session-expired');
    setSessionExpiredNotice(false);
  }, []);

  // Activity management
  const saveActivity = useCallback(async (a) => {
    const record = { ...a, _authSecret: DEFAULT_MASTER_PASS };
    setActivities((list) =>
      list.some((x) => x.id === a.id) ? list.map((x) => (x.id === a.id ? record : x)) : [...list, record]
    );
    try {
      await setDoc(doc(db, 'activities', a.id), record);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, []);

  const deleteActivity = useCallback(async (id) => {
    setActivities((list) => list.filter((x) => x.id !== id));
    try {
      await deleteDoc(doc(db, 'activities', id));
    } catch (err) {
      console.warn('Firestore delete warning:', err);
    }
  }, []);

  // Cagnotte management
  const saveCagnotte = useCallback(async (c) => {
    const record = { ...c, _authSecret: DEFAULT_MASTER_PASS };
    setCagnottes((list) =>
      list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? record : x)) : [...list, record]
    );
    try {
      await setDoc(doc(db, 'cagnottes', c.id), record);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, []);

  const deleteCagnotte = useCallback(async (id) => {
    setCagnottes((list) => list.filter((x) => x.id !== id));
    try {
      await deleteDoc(doc(db, 'cagnottes', id));
    } catch (err) {
      console.warn('Firestore delete warning:', err);
    }
  }, []);

  // Payment toggles
  const togglePayment = useCallback(async (key) => {
    setPaymentMethods((p) => {
      const updated = { ...p, [key]: !p[key] };
      setDoc(doc(db, 'settings', 'global'), { paymentMethods: updated, _authSecret: DEFAULT_MASTER_PASS }, { merge: true }).catch(console.warn);
      return updated;
    });
  }, []);

  // Stats updates
  const setStat = useCallback(async (key, value) => {
    const num = Number(value) || 0;
    setStats((s) => {
      const updated = { ...s, [key]: num };
      setDoc(doc(db, 'stats', 'main'), { ...updated, _authSecret: DEFAULT_MASTER_PASS }, { merge: true }).catch(console.warn);
      return updated;
    });
  }, []);

  // Volunteer recruitment toggle
  const toggleVolunteerRecruitment = useCallback(async () => {
    setVolunteerRecruitmentActive((v) => {
      const updated = !v;
      setDoc(doc(db, 'settings', 'global'), { volunteerRecruitmentActive: updated, _authSecret: DEFAULT_MASTER_PASS }, { merge: true }).catch(console.warn);
      return updated;
    });
  }, []);

  // Volunteer application submission
  const addVolunteerApplication = useCallback(async (app) => {
    const newId = 'vol-' + Date.now();
    const newRecord = {
      ...app,
      id: newId,
      createdAt: new Date().toLocaleDateString('fr-FR'),
      status: 'new',
      _authSecret: DEFAULT_MASTER_PASS,
    };
    setVolunteerApplications((list) => [newRecord, ...list]);
    try {
      await setDoc(doc(db, 'volunteer_applications', newId), newRecord);
    } catch (err) {
      console.warn('Volunteer submission firestore write:', err);
    }
  }, []);

  const deleteVolunteerApplication = useCallback(async (id) => {
    setVolunteerApplications((list) => list.filter((x) => x.id !== id));
    try {
      await deleteDoc(doc(db, 'volunteer_applications', id));
    } catch (err) {
      console.warn('Delete volunteer submission error:', err);
    }
  }, []);

  const setVolunteerApplicationStatus = useCallback(async (id, status) => {
    setVolunteerApplications((list) =>
      list.map((x) => (x.id === id ? { ...x, status } : x))
    );
    try {
      await updateDoc(doc(db, 'volunteer_applications', id), { status, _authSecret: DEFAULT_MASTER_PASS });
    } catch (err) {
      console.warn('Update volunteer status error:', err);
    }
  }, []);

  // Donor email
  const saveDonorEmail = useCallback((email) => setDonorEmail(email), []);

  // Donations recording
  const recordDonation = useCallback(async (donationRecord) => {
    const newId = 'don-' + Date.now();
    const newRecord = {
      ...donationRecord,
      id: newId,
      receiptNumber:
        'HPT-' +
        new Date().getFullYear() +
        '-' +
        Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      _authSecret: DEFAULT_MASTER_PASS,
    };
    setDonations((list) => [newRecord, ...list]);

    // Incrémentation en direct du montant collecté de la cagnotte concernée
    if (donationRecord.cagnotteTitle && donationRecord.amount) {
      setCagnottes((list) =>
        list.map((c) => {
          if (c.title === donationRecord.cagnotteTitle) {
            const nextCollected = (Number(c.collected) || 0) + Number(donationRecord.amount);
            setDoc(
              doc(db, 'cagnottes', c.id),
              { collected: nextCollected, _authSecret: DEFAULT_MASTER_PASS },
              { merge: true }
            ).catch(console.warn);
            return { ...c, collected: nextCollected };
          }
          return c;
        })
      );
    }

    try {
      await setDoc(doc(db, 'donations', newId), newRecord);
    } catch (err) {
      console.warn('Donation firestore write warning:', err);
    }
  }, []);

  const openDonation = useCallback((cagnotteTitle = null) => setDonation({ open: true, cagnotteTitle }), []);
  const closeDonation = useCallback(() => setDonation((d) => ({ ...d, open: false })), []);

  // Contact messages
  const sendContactMessage = useCallback(async (msgData) => {
    const newId = 'msg-' + Date.now();
    const newRecord = {
      ...msgData,
      id: newId,
      createdAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'new',
      _authSecret: DEFAULT_MASTER_PASS,
    };
    setContactMessages((list) => [newRecord, ...list]);
    try {
      await setDoc(doc(db, 'messages', newId), newRecord);
      return { success: true };
    } catch (err) {
      console.warn('Contact message write warning:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const markContactMessageStatus = useCallback(async (id, status) => {
    setContactMessages((list) =>
      list.map((m) => (m.id === id ? { ...m, status } : m))
    );
    try {
      await updateDoc(doc(db, 'messages', id), { status, _authSecret: DEFAULT_MASTER_PASS });
    } catch (err) {
      console.warn('Update message status warning:', err);
    }
  }, []);

  const deleteContactMessage = useCallback(async (id) => {
    setContactMessages((list) => list.filter((m) => m.id !== id));
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (err) {
      console.warn('Delete message warning:', err);
    }
  }, []);

  // Featured Cagnotte on Hero
  const setFeaturedCagnotte = useCallback(async (cagnotteId) => {
    setFeaturedCagnotteId(cagnotteId);
    setCagnottes((list) =>
      list.map((c) => ({
        ...c,
        isFeatured: c.id === cagnotteId,
      }))
    );
    try {
      await setDoc(
        doc(db, 'settings', 'global'),
        { featuredCagnotteId: cagnotteId, _authSecret: DEFAULT_MASTER_PASS },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore setFeaturedCagnotte warning:', err);
    }
  }, []);

  // Newsletter Subscribers & Broadcasts
  const subscribeNewsletter = useCallback(async (rawEmail) => {
    const email = (rawEmail || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Veuillez renseigner une adresse e-mail valide.' };
    }
    const already = newsletterSubscribers.some((s) => (s.email || '').toLowerCase() === email);
    if (already) {
      return { success: true, already: true, message: 'Cette adresse e-mail est déjà inscrite à nos actualités !' };
    }
    const newSub = {
      id: 'sub-' + Date.now(),
      email,
      subscribedAt: new Date().toLocaleDateString('fr-FR'),
      status: 'active',
      _authSecret: DEFAULT_MASTER_PASS,
    };
    setNewsletterSubscribers((prev) => [newSub, ...prev]);
    try {
      await setDoc(doc(db, 'newsletter_subscribers', newSub.id), newSub);
      return { success: true, already: false, message: 'Merci ! Vous êtes bien inscrit(e) à nos actualités.' };
    } catch (err) {
      console.warn('Firestore newsletter write warning:', err);
      return { success: true, already: false, message: 'Merci ! Vous êtes bien inscrit(e) à nos actualités.' };
    }
  }, [newsletterSubscribers]);

  const deleteNewsletterSubscriber = useCallback(async (id) => {
    setNewsletterSubscribers((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'newsletter_subscribers', id));
    } catch (err) {
      console.warn('Firestore subscriber delete warning:', err);
    }
  }, []);

  const unsubscribeNewsletter = useCallback(async (rawEmail) => {
    const email = (rawEmail || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Veuillez saisir une adresse e-mail valide.' };
    }
    const target = newsletterSubscribers.find((s) => (s.email || '').toLowerCase() === email);
    if (target) {
      setNewsletterSubscribers((prev) => prev.filter((s) => s.id !== target.id));
      try {
        await deleteDoc(doc(db, 'newsletter_subscribers', target.id));
      } catch (err) {
        console.warn('Firestore subscriber delete warning:', err);
      }
      return { success: true, message: `L'adresse ${email} a bien été désabonnée de nos actualités.` };
    }
    // Also remove from any stored backup
    setNewsletterSubscribers((prev) => prev.filter((s) => (s.email || '').toLowerCase() !== email));
    return { success: true, message: `L'adresse ${email} a bien été désabonnée de notre lettre d'information.` };
  }, [newsletterSubscribers]);

  const sendNewsletterBroadcast = useCallback(async ({ subject, message, category = 'Actualité' }) => {
    const subSubject = (subject || '').trim();
    const subMessage = (message || '').trim();
    if (!subSubject || !subMessage) {
      return { success: false, error: 'Veuillez saisir un objet et le corps du message.' };
    }
    const recipientEmails = newsletterSubscribers.map((s) => s.email);
    const newBroadcast = {
      id: 'diff-' + Date.now(),
      subject: subSubject,
      message: subMessage,
      category,
      sentAt: new Date().toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      recipientsCount: recipientEmails.length,
      recipients: recipientEmails,
      status: 'sent',
      _authSecret: DEFAULT_MASTER_PASS,
    };
    setNewsletterBroadcasts((prev) => [newBroadcast, ...prev]);
    try {
      await setDoc(doc(db, 'newsletter_broadcasts', newBroadcast.id), newBroadcast);
      return { success: true, count: recipientEmails.length, record: newBroadcast };
    } catch (err) {
      console.warn('Firestore broadcast write warning:', err);
      return { success: true, count: recipientEmails.length, record: newBroadcast };
    }
  }, [newsletterSubscribers]);

  const deleteNewsletterBroadcast = useCallback(async (id) => {
    setNewsletterBroadcasts((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteDoc(doc(db, 'newsletter_broadcasts', id));
    } catch (err) {
      console.warn('Firestore broadcast delete warning:', err);
    }
  }, []);

  const value = useMemo(
    () => ({
      activities,
      cagnottes,
      featuredCagnotteId,
      setFeaturedCagnotte,
      stats,
      paymentMethods,
      isAdmin,
      adminRole,
      currentUser,
      authLoading,
      authError,
      sessionExpiredNotice,
      clearSessionExpiredNotice,
      donation,
      volunteerRecruitmentActive,
      volunteerApplications,
      donorEmail,
      donations,
      contactMessages,
      newsletterSubscribers,
      newsletterBroadcasts,
      subscribeNewsletter,
      unsubscribeNewsletter,
      deleteNewsletterSubscriber,
      sendNewsletterBroadcast,
      deleteNewsletterBroadcast,
      loginWithMasterCredentials,
      loginWithGoogle,
      logout,
      saveActivity,
      deleteActivity,
      saveCagnotte,
      deleteCagnotte,
      togglePayment,
      setStat,
      toggleVolunteerRecruitment,
      setVolunteerRecruitmentActive,
      addVolunteerApplication,
      deleteVolunteerApplication,
      setVolunteerApplicationStatus,
      saveDonorEmail,
      recordDonation,
      openDonation,
      closeDonation,
      sendContactMessage,
      markContactMessageStatus,
      deleteContactMessage,
    }),
    [
      activities,
      cagnottes,
      featuredCagnotteId,
      setFeaturedCagnotte,
      stats,
      paymentMethods,
      isAdmin,
      adminRole,
      currentUser,
      authLoading,
      authError,
      sessionExpiredNotice,
      clearSessionExpiredNotice,
      donation,
      volunteerRecruitmentActive,
      volunteerApplications,
      donorEmail,
      donations,
      contactMessages,
      newsletterSubscribers,
      newsletterBroadcasts,
      subscribeNewsletter,
      unsubscribeNewsletter,
      deleteNewsletterSubscriber,
      sendNewsletterBroadcast,
      deleteNewsletterBroadcast,
      loginWithMasterCredentials,
      loginWithGoogle,
      logout,
      saveActivity,
      deleteActivity,
      saveCagnotte,
      deleteCagnotte,
      togglePayment,
      setStat,
      toggleVolunteerRecruitment,
      addVolunteerApplication,
      deleteVolunteerApplication,
      setVolunteerApplicationStatus,
      saveDonorEmail,
      recordDonation,
      openDonation,
      closeDonation,
      sendContactMessage,
      markContactMessageStatus,
      deleteContactMessage,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
