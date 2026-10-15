# Security Specification & Threat Model

## 1. Data Invariants

1. **Strict Admin Wall (`/admins/{adminId}` & `/users/{userId}`)**:
   - Only authenticated users with verified emails whose UID exists in `/admins/{uid}` can read, modify, or create administrative documents, activities, cagnottes, stats, and settings.
   - Non-authenticated users or unauthorized authenticated users CANNOT read or write any `/admins` documents.
   - Non-admin users cannot grant themselves admin rights or create arbitrary admin records.

2. **Public Activities & Cagnottes Read Access (`/activities/{activityId}`, `/cagnottes/{cagnotteId}`, `/stats/{docId}`)**:
   - The public can READ published activities, cagnottes, and stats.
   - ONLY verified admins can CREATE, UPDATE, or DELETE activities, cagnottes, and stats.

3. **Public Submissions Guard (`/volunteer_applications/{applicationId}`, `/donations/{donationId}`)**:
   - Unauthenticated or authenticated public visitors can CREATE volunteer applications and donations.
   - They CANNOT read other visitors' applications or donations (PII protection: phone, email, name, location).
   - Only verified admins can LIST or READ volunteer applications and donations.
   - Document IDs must conform to `isValidId(id)` pattern. String sizes and required keys are strictly checked.

4. **Settings (`/settings/{docId}`)**:
   - The public can READ global settings (such as volunteer recruitment open/closed status).
   - Only verified admins can UPDATE settings.

5. **Test Connection (`/test/{docId}`)**:
   - Public read allowed to verify server connectivity. No writes allowed.

---

## 2. The Dirty Dozen Payloads (Designed to Fail)

1. **Unauthenticated Admin Escalation**:
   - Operation: CREATE `/admins/hacker-123`
   - Payload: `{ "email": "hacker@evil.com", "role": "superadmin" }`
   - Expected: PERMISSION_DENIED (not signed in, not admin)

2. **Authenticated Non-Admin Privilege Stealing**:
   - Auth: UID `user-456`, email `random@gmail.com` (not in `/admins`)
   - Operation: CREATE `/admins/user-456`
   - Payload: `{ "email": "random@gmail.com", "role": "superadmin" }`
   - Expected: PERMISSION_DENIED

3. **Ghost Field Injection in Activity**:
   - Auth: Admin
   - Operation: CREATE `/activities/act-1`
   - Payload: `{ "id": "act-1", "title": "Puits", "isApproved": true, "maliciousGhost": "attack" }`
   - Expected: PERMISSION_DENIED (schema strictly rejects unknown fields)

4. **Unauthenticated Public Access to Volunteer PII**:
   - Operation: GET or LIST `/volunteer_applications`
   - Expected: PERMISSION_DENIED (protects candidate personal data)

5. **Tampering with Volunteer Application by Visitor**:
   - Operation: UPDATE `/volunteer_applications/vol-123`
   - Payload: `{ "status": "contacted" }`
   - Expected: PERMISSION_DENIED (public cannot update existing submissions)

6. **Unauthenticated Donation Overwrite**:
   - Operation: UPDATE `/donations/don-123`
   - Payload: `{ "amount": 9999999 }`
   - Expected: PERMISSION_DENIED (donations cannot be modified by visitors)

7. **Oversized String Buffer Overflow / Denial of Wallet**:
   - Operation: CREATE `/volunteer_applications/vol-999`
   - Payload: `{ "name": "A" * 5000, "phone": "+22501020304", "domain": "Logistique", "availability": "Weekend" }`
   - Expected: PERMISSION_DENIED (string lengths strictly capped)

8. **Invalid Path Variable Poisoning**:
   - Operation: GET `/activities/../../secret` or with 2KB string ID
   - Expected: PERMISSION_DENIED (fails `isValidId()`)

9. **Unverified Email Impersonation**:
   - Auth: `email_verified: false`
   - Operation: WRITE `/cagnottes/cag-1`
   - Expected: PERMISSION_DENIED (unverified emails blocked from admin writes)

10. **Direct Deletion of Financial Settings by Non-Admin**:
    - Operation: DELETE `/settings/global`
    - Expected: PERMISSION_DENIED

11. **Malicious Negative Donation or Invalid Types**:
    - Operation: CREATE `/donations/don-invalid`
    - Payload: `{ "amount": -500, "method": "wave" }`
    - Expected: PERMISSION_DENIED (amount must be positive number)

12. **Public Tampering of Impact Statistics**:
    - Operation: UPDATE `/stats/main`
    - Payload: `{ "fundsM": 0 }`
    - Expected: PERMISSION_DENIED (only admins can modify stats)
