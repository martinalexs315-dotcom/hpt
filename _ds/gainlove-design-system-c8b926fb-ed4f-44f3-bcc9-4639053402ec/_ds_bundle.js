/* @ds-bundle: {"format":4,"namespace":"GainLoveDesignSystem_c8b926","components":[{"name":"CampaignCard","sourcePath":"components/cards/CampaignCard.jsx"},{"name":"FeatureCard","sourcePath":"components/cards/FeatureCard.jsx"},{"name":"ProgressBadge","sourcePath":"components/feedback/ProgressBadge.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"}],"sourceHashes":{"components/cards/CampaignCard.jsx":"b6b3b8a13f50","components/cards/FeatureCard.jsx":"b0ceabf755fe","components/feedback/ProgressBadge.jsx":"e7946bb7c761","components/forms/Button.jsx":"24e3fb109cba","components/navigation/NavBar.jsx":"7b2880caeb27","ui_kits/homepage/HomePage.jsx":"db28ed1ec81d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.GainLoveDesignSystem_c8b926 = window.GainLoveDesignSystem_c8b926 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/cards/FeatureCard.jsx
try { (() => {
function FeatureCard({
  icon,
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      padding: '32px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '14px',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: 'var(--gl-orange-tint)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: icon,
    alt: "",
    style: {
      width: 26,
      height: 26
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--text-lg)',
      color: 'var(--text-primary)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-secondary)'
    }
  }, children));
}
Object.assign(__ds_scope, { FeatureCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/FeatureCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBadge.jsx
try { (() => {
function ProgressBadge({
  raised,
  goal,
  percent
}) {
  const pct = percent ?? Math.round(raised / goal * 100);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }
  }, "Current"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, "$", raised.toLocaleString())), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '54px',
      height: '54px',
      borderRadius: '50%',
      background: 'var(--gl-orange)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '15px',
      color: 'var(--text-on-orange)'
    }
  }, pct, "%"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }
  }, "Target"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, "$", goal.toLocaleString())));
}
Object.assign(__ds_scope, { ProgressBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBadge.jsx", error: String((e && e.message) || e) }); }

// components/cards/CampaignCard.jsx
try { (() => {
function CampaignCard({
  image,
  raised,
  goal,
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '160px',
      background: `center/cover no-repeat url(${image})`,
      backgroundColor: 'var(--gl-gray-200)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.ProgressBadge, {
    raised: raised,
    goal: goal
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--text-h4)',
      color: 'var(--text-primary)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-secondary)'
    }
  }, children), /*#__PURE__*/React.createElement("button", {
    style: {
      alignSelf: 'flex-end',
      width: '38px',
      height: '38px',
      borderRadius: '50%',
      background: 'var(--accent-primary)',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "https://unpkg.com/lucide-static@latest/icons/plus.svg",
    alt: "",
    style: {
      width: 16,
      height: 16
    }
  }))));
}
Object.assign(__ds_scope, { CampaignCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/CampaignCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  ...rest
}) {
  const base = {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: size === 'sm' ? '13px' : '14px',
    letterSpacing: '0.02em',
    borderRadius: 'var(--radius-pill)',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: size === 'sm' ? '10px 18px' : '14px 26px',
    transition: 'background .15s ease, transform .1s ease, box-shadow .15s ease'
  };
  const variants = {
    primary: {
      background: 'var(--gl-black)',
      color: 'var(--text-on-dark)'
    },
    accent: {
      background: 'var(--accent-primary)',
      color: 'var(--text-on-orange)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--gl-black)',
      border: '1.5px solid var(--gl-black)'
    }
  };
  if (variant === 'icon-ghost') {
    return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: '14px',
        color: 'var(--gl-black)',
        padding: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        background: 'var(--accent-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, icon || /*#__PURE__*/React.createElement("img", {
      src: "https://unpkg.com/lucide-static@latest/icons/play.svg",
      alt: "",
      style: {
        width: 14,
        height: 14,
        filter: 'invert(1)'
      }
    })), children);
  }
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    style: {
      ...base,
      ...variants[variant]
    },
    onMouseEnter: e => {
      if (variant === 'accent') e.currentTarget.style.background = 'var(--accent-primary-hover)';
    },
    onMouseLeave: e => {
      if (variant === 'accent') e.currentTarget.style.background = 'var(--accent-primary)';
    }
  }), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      width: 16,
      height: 16
    }
  }, icon), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
function NavBar({
  links = ['Home', 'Campaigns', 'About', 'Blog', 'Pages', 'Contact Us'],
  onDonate
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 40px',
      background: 'var(--surface-page)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '24px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--gl-black)'
    }
  }, "Gain"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent-primary)'
    }
  }, "love")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '28px'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      color: 'var(--text-primary)',
      textDecoration: 'none',
      fontSize: '13px',
      fontWeight: 500,
      letterSpacing: '0.03em',
      textTransform: 'uppercase'
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "https://unpkg.com/lucide-static@latest/icons/phone.svg",
    alt: "",
    style: {
      width: 16,
      height: 16
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      color: 'var(--text-primary)'
    }
  }, "(04) 1800 700 999"), /*#__PURE__*/React.createElement("img", {
    src: "https://unpkg.com/lucide-static@latest/icons/search.svg",
    alt: "",
    style: {
      width: 16,
      height: 16
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "https://unpkg.com/lucide-static@latest/icons/user.svg",
    alt: "",
    style: {
      width: 16,
      height: 16
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onDonate,
    style: {
      background: 'var(--accent-primary)',
      color: 'var(--text-on-orange)',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      padding: '10px 20px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "DONATE NOW")));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/homepage/HomePage.jsx
try { (() => {
const {
  useState
} = React;
const {
  NavBar,
  Button,
  FeatureCard,
  CampaignCard
} = window.GainLoveDesignSystem_c8b926;
const features = [{
  icon: 'globe',
  title: 'Free Access',
  body: "A group of donors cover our operating costs so 100% of your money can fund water projects."
}, {
  icon: 'id-card',
  title: 'Locals For Locals',
  body: "A group of donors cover our operating costs so 100% of your money can fund water projects."
}, {
  icon: 'layers',
  title: 'Real Impact',
  body: "A group of donors cover our operating costs so 100% of your money can fund water projects."
}, {
  icon: 'heart-handshake',
  title: 'Safety Net',
  body: "A group of donors cover our operating costs so 100% of your money can fund water projects."
}];
const campaigns = [{
  image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=500',
  title: 'Youth In Action Against'
}, {
  image: 'https://images.unsplash.com/photo-1524069290683-0457abfe42c3?w=500',
  title: 'Youth In Action Against'
}, {
  image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=500',
  title: 'Youth In Action Against'
}];
function HomePage() {
  const [donateOpen, setDonateOpen] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-page)',
      fontFamily: 'var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement(NavBar, {
    onDonate: () => setDonateOpen(true)
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '40px 60px 60px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '460px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-h1)',
      lineHeight: 'var(--lh-tight)',
      fontWeight: 700,
      margin: '0 0 20px'
    }
  }, "Justice begins where inequality ends"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 'var(--text-body)',
      lineHeight: 'var(--lh-normal)',
      margin: '0 0 28px'
    }
  }, "We're building a world where everyone has the power to shape their lives."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => setDonateOpen(true),
    icon: /*#__PURE__*/React.createElement("img", {
      src: "https://unpkg.com/lucide-static@latest/icons/heart.svg",
      style: {
        width: 14,
        height: 14,
        filter: 'invert(1)'
      },
      alt: ""
    })
  }, "DONATE NOW")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '420px',
      height: '360px',
      borderRadius: '50% 50% 45% 45% / 55% 55% 45% 45%',
      overflow: 'hidden',
      backgroundImage: 'url(https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=700)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '40px 60px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-eyebrow)',
      color: 'var(--accent-primary)',
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      fontWeight: 600
    }
  }, "Who We Are"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-h2)',
      margin: '10px 0 12px'
    }
  }, "Make a Difference"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      maxWidth: '520px',
      margin: '0 auto 40px',
      lineHeight: 'var(--lh-normal)'
    }
  }, "It's through mistakes that you actually can grow. You get rid of everything that is not essential to make it good."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
      textAlign: 'left'
    }
  }, features.map(f => /*#__PURE__*/React.createElement(FeatureCard, {
    key: f.title,
    icon: `https://unpkg.com/lucide-static@latest/icons/${f.icon}.svg`,
    title: f.title
  }, f.body)))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '40px 60px',
      display: 'flex',
      alignItems: 'center',
      gap: '60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '320px',
      height: '320px',
      borderRadius: '50%',
      flexShrink: 0,
      backgroundImage: 'url(https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=500)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-eyebrow)',
      color: 'var(--accent-primary)',
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      fontWeight: 600
    }
  }, "About Us"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-h2)',
      margin: '10px 0 16px'
    }
  }, "Changing Lives with Knowledge"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      lineHeight: 'var(--lh-normal)',
      maxWidth: '460px',
      marginBottom: '28px'
    }
  }, "Our promise that your giving is doing what it's supposed to: changing lives. Today, we will work to deliver life-saving aid to millions of people living on the edge of survival."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '28px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline"
  }, "LEARN MORE"), /*#__PURE__*/React.createElement(Button, {
    variant: "icon-ghost"
  }, "WATCH VIDEO")))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '40px 60px 80px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-eyebrow)',
      color: 'var(--accent-primary)',
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      fontWeight: 600
    }
  }, "We Need Your Help"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-h2)',
      margin: '10px 0 40px'
    }
  }, "Featured Campaigns"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
      textAlign: 'left'
    }
  }, campaigns.map((c, i) => /*#__PURE__*/React.createElement(CampaignCard, {
    key: i,
    image: c.image,
    raised: 5000,
    goal: 65000,
    title: c.title
  }, "Lorem ipsum is simply dummy text of the printing and typesetting industry.")))), donateOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(24,21,17,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10
    },
    onClick: () => setDonateOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      padding: '40px',
      width: '360px',
      textAlign: 'center'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '22px',
      marginBottom: '8px'
    }
  }, "Thank you"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      marginBottom: '24px'
    }
  }, "This is a design-system demo \u2014 donation flow is not wired up."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => setDonateOpen(false)
  }, "CLOSE"))));
}
window.HomePage = HomePage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/homepage/HomePage.jsx", error: String((e && e.message) || e) }); }

__ds_ns.CampaignCard = __ds_scope.CampaignCard;

__ds_ns.FeatureCard = __ds_scope.FeatureCard;

__ds_ns.ProgressBadge = __ds_scope.ProgressBadge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.NavBar = __ds_scope.NavBar;

})();
