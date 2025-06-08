import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { motion, AnimatePresence } from "framer-motion";
import UseAnimations from "react-useanimations";
import arrowDown from "react-useanimations/lib/arrowDown";
import infinity from "react-useanimations/lib/infinity";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- Scroll Progress Bar ---
function ScrollProgressBar() {
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScroll(scrolled);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: 5,
        zIndex: 2000,
        background: "rgba(25, 118, 210, 0.07)",
      }}
    >
      <div
        style={{
          width: `${scroll}%`,
          height: "100%",
          background: "linear-gradient(90deg, #1976d2 70%, #63a4ff 100%)",
          borderRadius: 4,
          transition: "width 0.1s",
        }}
      />
    </div>
  );
}

// --- Sticky CTA Button ---
function StickyCTA({ role }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 80 }}
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 2001,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Link
        to="/register"
        className="button-hover"
        style={{
          background: "#1976d2",
          color: "#fff",
          padding: "16px 30px",
          borderRadius: 32,
          fontWeight: 700,
          fontSize: "1.1rem",
          textDecoration: "none",
          boxShadow: "0 4px 16px #1976d233",
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "none",
          outline: "none",
        }}
        as={motion.a}
        whileHover={{ scale: 1.08, boxShadow: "0 6px 24px #1976d244" }}
      >
        <UseAnimations animation={arrowDown} size={32} strokeColor="#fff" />
        {role === "customer" ? "Join as Customer" : "Join as Retailer"}
      </Link>
    </motion.div>
  );
}

// --- Role Switcher ---
function RoleSwitcher({ role, setRole }) {
    return (
      <div
        style={{
          position: "fixed",
          top: 80,
          right: 32,
          zIndex: 2002,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 2px 8px #1976d222",
          padding: "4px 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontWeight: 600,
        }}
      >
        <span style={{ color: "#1976d2" }}>View as:</span>
        <button
          onClick={() => setRole("customer")}
          className={`role-btn${role === "customer" ? " selected" : ""}`}
        >
          Customer
        </button>
        <button
          onClick={() => setRole("retailer")}
          className={`role-btn${role === "retailer" ? " selected" : ""}`}
        >
          Retailer
        </button>
      </div>
    );
  }
  

// --- Live User Activity Feed ---
const fakeEvents = [
  "Priya from Mumbai just signed up!",
  "Amit from Delhi is viewing the map demo.",
  "5 people are exploring features right now.",
  "New retailer joined from Bangalore!",
  "Customer from Pune just followed a retailer.",
  "2 users are reading testimonials.",
  "Retailer from Chennai updated their profile.",
  "Someone is unlocking features!",
];

function LiveActivityFeed() {
  const [eventIdx, setEventIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setEventIdx((i) => (i + 1) % fakeEvents.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        left: 24,
        bottom: 32,
        zIndex: 2002,
        background: "#fff",
        color: "#1976d2",
        borderRadius: 16,
        boxShadow: "0 2px 16px #1976d222",
        padding: "14px 22px",
        fontWeight: 500,
        fontSize: "1.07rem",
        minWidth: 220,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={eventIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <UseAnimations
            animation={arrowDown}
            size={24}
            strokeColor="#1976d2"
            style={{ verticalAlign: "middle", marginRight: 10 }}
          />
          {fakeEvents[eventIdx]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- Gamified Blurred Feature Cards ---
const allFeatures = {
  customer: [
    {
      icon: <UseAnimations animation={infinity} size={44} strokeColor="#1976d2" />,
      title: "Find Nearby Retailers",
      desc: "Easily discover shops and services around you in real time.",
    },
    {
      icon: <UseAnimations animation={arrowDown} size={44} strokeColor="#1976d2" />,
      title: "Follow Favorites",
      desc: "Get notified when your favorite retailers are nearby.",
    },
    {
      icon: <span role="img" aria-label="privacy" style={{ fontSize: 44 }}>🔒</span>,
      title: "Full Privacy Control",
      desc: "You choose when and how to share your location.",
    },
    {
      icon: <span role="img" aria-label="map" style={{ fontSize: 44 }}>🗺️</span>,
      title: "Interactive Map",
      desc: "See all your options on a beautiful, live map.",
    },
  ],
  retailer: [
    {
      icon: <UseAnimations animation={infinity} size={44} strokeColor="#1976d2" />,
      title: "Reach Local Customers",
      desc: "Show up instantly to customers nearby.",
    },
    {
      icon: <span role="img" aria-label="verified" style={{ fontSize: 44 }}>✅</span>,
      title: "Verified Profile",
      desc: "Build trust with a verified business profile.",
    },
    {
      icon: <span role="img" aria-label="feature" style={{ fontSize: 44 }}>✨</span>,
      title: "Real-Time Notifications",
      desc: "Get notified when customers are interested.",
    },
    {
      icon: <span role="img" aria-label="support" style={{ fontSize: 44 }}>💬</span>,
      title: "Easy Communication",
      desc: "Chat and connect with your customers directly.",
    },
  ],
};

function GamifiedFeatures({ role }) {
  const [revealed, setRevealed] = useState(Array(allFeatures[role].length).fill(false));
  const handleReveal = (idx) => {
    setRevealed((prev) => {
      const copy = [...prev];
      copy[idx] = true;
      return copy;
    });
  };

  return (
    <section id="features" style={{ marginBottom: 48 }}>
      <h2 style={{ textAlign: "center", fontWeight: 700, marginBottom: 24, userSelect: "none" }}>
        {role === "customer" ? "Customer Features" : "Retailer Features"}
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "center",
        }}
      >
        {allFeatures[role].map((f, i) => (
          <motion.div
            key={f.title}
            className="card-hover"
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px #0001",
              padding: "24px 20px",
              width: 240,
              textAlign: "center",
              userSelect: "none",
              filter: revealed[i] ? "none" : "blur(3px) grayscale(0.7)",
              opacity: revealed[i] ? 1 : 0.7,
              cursor: revealed[i] ? "default" : "pointer",
              position: "relative",
              transition: "filter 0.3s, opacity 0.3s",
            }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={revealed[i] ? {} : { scale: 1.08 }}
            onMouseEnter={() => !revealed[i] && handleReveal(i)}
            onTouchStart={() => !revealed[i] && handleReveal(i)}
          >
            {!revealed[i] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1976d2",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  background: "rgba(255,255,255,0.8)",
                  borderRadius: 12,
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              >
                Hover to unlock
              </motion.div>
            )}
            <div style={{ marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: 6 }}>{f.title}</div>
            <div style={{ color: "#444", fontSize: "0.99rem" }}>{f.desc}</div>
            {revealed[i] && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                style={{
                  position: "absolute",
                  top: -16,
                  right: -16,
                  background: "#1976d2",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  boxShadow: "0 2px 8px #1976d233",
                  zIndex: 3,
                }}
              >
                🎉
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- Flip Card for Testimonials ---
function FlipCard({ front, back }) {
  const [flipped, setFlipped] = useState(false);

  // SVG: Monitor-style arrow cursor, blinking
  const ArrowMouseIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
      style={{
        animation: 'blink 1.2s infinite',
        verticalAlign: 'middle'
      }}
      xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L28 16L18 18L22 28L4 4Z" fill="#1976d2" stroke="#111" strokeWidth="2" />
    </svg>
  );

  useEffect(() => {
    if (!document.getElementById('flipcard-blink-style')) {
      const style = document.createElement('style');
      style.id = 'flipcard-blink-style';
      style.innerHTML = `
        @keyframes blink {
          0%, 60%, 100% { opacity: 1; }
          30% { opacity: 0.2; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const styles = {
    container: {
      perspective: '1000px',
      width: '260px',
      height: '180px',
      cursor: 'pointer',
      margin: '12px',
      position: 'relative',
      display: 'inline-block',
    },
    flipper: {
      position: 'relative',
      width: '100%',
      height: '100%',
      textAlign: 'center',
      transition: 'transform 0.8s cubic-bezier(0.4,0.2,0.2,1)',
      transformStyle: 'preserve-3d',
      transform: flipped ? 'rotateY(180deg)' : 'none',
      boxShadow: '0 4px 16px rgba(25,118,210,0.18)',
      borderRadius: '12px',
    },
    front: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden',
      backgroundColor: '#fff',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      color: '#333',
      padding: '16px',
      boxSizing: 'border-box',
      boxShadow: flipped ? 'none' : '0 2px 8px #1976d211',
      transition: 'box-shadow 0.3s',
    },
    back: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden',
      backgroundColor: '#1976d2',
      color: '#fff',
      transform: 'rotateY(180deg)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      padding: '16px',
      boxSizing: 'border-box',
      boxShadow: '0 4px 16px #1976d244',
    },
    overlay: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      width: '100%',
      textAlign: 'center',
      opacity: flipped ? 0 : 1,
      pointerEvents: 'none',
      transition: 'opacity 0.3s',
      display: 'flex',
      justifyContent: 'center',
    }
  };

  return (
    <div
      style={styles.container}
      onClick={() => setFlipped(f => !f)}
      title="Click to flip"
    >
      <div style={styles.flipper}>
        <div style={styles.front}>
          {front}
          <div style={styles.overlay}>
            <ArrowMouseIcon />
          </div>
        </div>
        <div style={styles.back}>{back}</div>
      </div>
    </div>
  );
}

// --- FAQ Accordion (Pull to Reveal) ---
function FAQAccordion({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        margin: "16px 0",
        borderRadius: 8,
        boxShadow: "0 2px 8px #1976d211",
        background: "#fff",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          cursor: "pointer",
          padding: "16px 20px",
          fontWeight: 600,
          color: "#1976d2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "1.08rem",
          userSelect: "none",
        }}
      >
        {question}
        <span
          style={{
            marginLeft: 12,
            fontSize: 22,
            transition: "transform 0.3s",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            color: "#1976d2",
          }}
        >
          ▶
        </span>
      </div>
      <div
        style={{
          maxHeight: open ? 500 : 0,
          overflow: "hidden",
          background: "#e3f2fd",
          color: "#333",
          padding: open ? "16px 20px" : "0 20px",
          fontSize: "1.01rem",
          transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {open && answer}
      </div>
    </div>
  );
}

// --- Testimonials, FAQ, Tech Stack, About, Contact Data ---
const testimonials = [
  {
    name: "Amit Sharma",
    role: "Retailer, Delhi",
    text: "This app helped my shop get discovered by more local customers. The real-time map is amazing!",
  },
  {
    name: "Priya Singh",
    role: "Customer, Mumbai",
    text: "I love how easy it is to find and follow my favorite stores. Privacy controls are top-notch.",
  },
];

const faqs = [
  {
    q: "Is my location data private?",
    a: "Yes! You control when and how your location is shared. We never track you without permission.",
  },
  {
    q: "Who can use this app?",
    a: "Anyone! Customers, retailers, delivery partners, and more.",
  },
  {
    q: "Can I use this on my phone?",
    a: "Absolutely. The app is fully responsive and works on all devices.",
  },
  {
    q: "How do I contact support?",
    a: "Use the contact form below or email us anytime.",
  },
];

const techStack = [
  { name: "React", color: "#61dafb" },
  { name: "Node.js", color: "#8cc84b" },
  { name: "MongoDB", color: "#47a248" },
  { name: "Socket.IO", color: "#010101" },
  { name: "OpenStreetMap", color: "#7cb342" },
  { name: "Express", color: "#404d59" },
];

export default function LandingPage() {
  const [role, setRole] = useState("customer");
  const [usersOnline, setUsersOnline] = useState(12);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsersOnline(10 + Math.floor(Math.random() * 10));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ScrollProgressBar />
      <StickyCTA role={role} />
      <RoleSwitcher role={role} setRole={setRole} />
      <LiveActivityFeed />
      <SimpleBar style={{ maxHeight: "100vh" }}>
        <div
          style={{
            fontFamily: "Inter, Arial, sans-serif",
            background: "#f8fafc",
            minHeight: "100vh",
          }}
        >
          {/* Fixed Header/Menu */}
          <header
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              background: "#1976d2",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 56px 0 32px",
              height: 68,
              zIndex: 1000,
              boxShadow: "0 2px 8px #0001",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src="/my-map-icon.png"
                alt="App Logo"
                style={{
                  height: 40,
                  marginRight: 16,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
                draggable={false}
              />
              <span
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  letterSpacing: 1,
                  userSelect: "none",
                }}
              >
                Yahan Hai!
              </span>
            </div>
            <nav>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  gap: 32,
                  margin: 0,
                  padding: 0,
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  userSelect: "none",
                  marginRight: 32,
                }}
              >
                <li>
                  <a href="#about" className="link-hover" style={navLinkStyle}>
                    About
                  </a>
                </li>
                <li>
                  <a href="#features" className="link-hover" style={navLinkStyle}>
                    Features
                  </a>
                </li>
                <li>
                  <a href="#contact" className="link-hover" style={navLinkStyle}>
                    Contact
                  </a>
                </li>
                <li>
                  <Link to="/login" className="link-hover" style={navLinkStyle}>
                    Login
                  </Link>
                </li>
                <li>
                <Link
                    to="/register"
                    className="header-btn header-btn-outline"
                    style={{
                        ...navLinkStyle,
                        border: "2px solid #1976d2",
                        color: "#1976d2",
                        background: "#fff",
                        borderRadius: 20,
                        padding: "6px 18px",
                        fontWeight: 600
                    }}
                    >
                    Register
                </Link>

                </li>
              </ul>
            </nav>
          </header>
          <main
            style={{
              maxWidth: 900,
              margin: "0 auto",
              padding: "100px 16px 32px 16px",
              boxSizing: "border-box",
            }}
          >
            {/* Personalized Welcome */}
            <section
              id="about"
              style={{
                textAlign: "center",
                marginBottom: 40,
                userSelect: "none",
              }}
            >
              <h1
                className={scrolled ? "gradient-text" : ""}
                style={{ fontSize: "2.3rem", fontWeight: 700, marginBottom: 10 }}
              >
                {role === "customer"
                  ? "Discover Local Retailers Instantly"
                  : "Grow Your Business, Reach More Customers"}
              </h1>
              <p style={{ fontSize: "1.2rem", color: "#444" }}>
                {role === "customer"
                  ? "Find, follow, and connect with your favorite local shops in real time—always with full privacy control."
                  : "Show up to customers the moment they need you, build trust, and grow your loyal base."}
              </p>
              <div style={{ margin: "24px 0" }}>
                <Link
                  to="/register"
                  className="button-hover"
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    padding: "12px 32px",
                    borderRadius: 24,
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    textDecoration: "none",
                    marginRight: 16,
                    boxShadow: "0 2px 8px #1976d222",
                  }}
                >
                  {role === "customer" ? "Join as Customer" : "Join as Retailer"}
                </Link>
                <Link
                    to="/login"
                    className="header-btn header-btn-outline"
                    style={{
                        border: "2px solid #1976d2",
                        color: "#1976d2",
                        background: "#fff",
                        borderRadius: 24,
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        padding: "12px 32px",
                        marginLeft: 16,
                        textDecoration: "none"
                    }}
                    >
                    Login
                </Link>

              </div>
              {/* Interactive Map Preview */}
              <div
                style={{
                  margin: "32px auto 0 auto",
                  maxWidth: 500,
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 2px 16px #1976d222",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <MapContainer
                  center={[28.6139, 77.2090]}
                  zoom={13}
                  style={{ height: 300, width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker position={[28.6139, 77.2090]}>
                    <Popup>Live Map Preview</Popup>
                  </Marker>
                </MapContainer>
                <div
                  style={{
                    background: "#fff",
                    padding: "8px",
                    fontSize: "0.95rem",
                    color: "#1976d2",
                    textAlign: "center",
                  }}
                >
                  <span role="img" aria-label="map">
                    🗺️
                  </span>{" "}
                  Real-time map preview (try it live after sign up!)
                </div>
              </div>
            </section>
            {/* Users online */}
            <section style={{ textAlign: "center", marginBottom: 32 }}>
              <span
                style={{
                  background: "#fff2",
                  borderRadius: 8,
                  padding: "4px 16px",
                  fontSize: "1.2rem",
                  color: "#1976d2",
                  userSelect: "none",
                }}
              >
                <b>{usersOnline}</b> users online right now!
              </span>
            </section>
            {/* Gamified Features */}
            <GamifiedFeatures role={role} />
            {/* Why Choose Us */}
            <section style={{ marginBottom: 48 }}>
              <h2
                style={{
                  textAlign: "center",
                  fontWeight: 700,
                  marginBottom: 20,
                  userSelect: "none",
                }}
              >
                Why Choose Us?
              </h2>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 16,
                  fontSize: "1.05rem",
                }}
              >
                <div
                  className="card-hover"
                  style={{
                    background: "#e3f2fd",
                    borderRadius: 12,
                    padding: "16px 24px",
                    minWidth: 220,
                    boxShadow: "0 2px 8px #1976d211",
                    userSelect: "none",
                  }}
                >
                  <b>✔️ Real-time Map</b>
                  <br />
                  <span style={{ color: "#1976d2" }}>Competitors: ❌</span>
                </div>
                <div
                  className="card-hover"
                  style={{
                    background: "#e3f2fd",
                    borderRadius: 12,
                    padding: "16px 24px",
                    minWidth: 220,
                    boxShadow: "0 2px 8px #1976d211",
                    userSelect: "none",
                  }}
                >
                  <b>✔️ Full Privacy Control</b>
                  <br />
                  <span style={{ color: "#1976d2" }}>Competitors: Limited</span>
                </div>
                <div
                  className="card-hover"
                  style={{
                    background: "#e3f2fd",
                    borderRadius: 12,
                    padding: "16px 24px",
                    minWidth: 220,
                    boxShadow: "0 2px 8px #1976d211",
                    userSelect: "none",
                  }}
                >
                  <b>✔️ Custom Avatars & Profiles</b>
                  <br />
                  <span style={{ color: "#1976d2" }}>Competitors: ❌</span>
                </div>
                <div
                  className="card-hover"
                  style={{
                    background: "#e3f2fd",
                    borderRadius: 12,
                    padding: "16px 24px",
                    minWidth: 220,
                    boxShadow: "0 2px 8px #1976d211",
                    userSelect: "none",
                  }}
                >
                  <b>✔️ OpenStreetMap Powered</b>
                  <br />
                  <span style={{ color: "#1976d2" }}>Competitors: Google only</span>
                </div>
              </div>
            </section>
            {/* Testimonials */}
            <section style={{ marginBottom: 48 }}>
              <h2
                style={{
                  textAlign: "center",
                  fontWeight: 700,
                  marginBottom: 20,
                  userSelect: "none",
                }}
              >
                What Our Users Say
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 32,
                  flexWrap: "wrap",
                }}
              >
                {testimonials.map((t) => (
                  <FlipCard
                    key={t.name}
                    front={
                      <div>
                        <strong>{t.name}</strong>
                        <br />
                        <em>{t.role}</em>
                        <br />
                        <small></small>
                      </div>
                    }
                    back={<div>{t.text}</div>}
                  />
                ))}
              </div>
            </section>
            {/* FAQ Accordion */}
            <section style={{ marginBottom: 48 }}>
              <h2
                style={{
                  textAlign: "center",
                  fontWeight: 700,
                  marginBottom: 20,
                  userSelect: "none",
                }}
              >
                FAQ
              </h2>
              <div style={{ maxWidth: 700, margin: "0 auto" }}>
                {faqs.map((faq) => (
                  <FAQAccordion
                    key={faq.q}
                    question={faq.q}
                    answer={faq.a}
                  />
                ))}
              </div>
            </section>
            {/* Tech Stack */}
            <section style={{ marginBottom: 48 }}>
              <h2
                style={{
                  textAlign: "center",
                  fontWeight: 700,
                  marginBottom: 20,
                  userSelect: "none",
                }}
              >
                Our Tech Stack
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 18,
                  flexWrap: "wrap",
                }}
              >
                {techStack.map((tech) => (
                  <span
                    key={tech.name}
                    style={{
                      background: tech.color,
                      color: "#fff",
                      borderRadius: 8,
                      padding: "8px 18px",
                      fontWeight: 600,
                      fontSize: "1.03rem",
                      marginBottom: 8,
                      boxShadow: "0 2px 8px #0001",
                      userSelect: "none",
                    }}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </section>
            {/* About the Creator */}
            <section
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px #0001",
                padding: "32px 24px",
                marginBottom: 48,
                maxWidth: 650,
                margin: "0 auto 48px auto",
                userSelect: "none",
              }}
            >
              <h2 style={{ marginBottom: 10, fontWeight: 700 }}>
                About the Creator
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <img
                  src="https://avatars.githubusercontent.com/u/583231?v=4"
                  alt="Creator"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    border: "3px solid #1976d2",
                  }}
                  draggable={false}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    Chirag G
                  </div>
                  <div style={{ color: "#1976d2", fontSize: "0.98rem" }}>
                    Full Stack Developer & Map Enthusiast
                  </div>
                  <div style={{ color: "#444", marginTop: 4 }}>
                    Passionate about open source, privacy, and building tools
                    that empower local businesses and communities.
                  </div>
                </div>
              </div>
            </section>
            {/* Contact Section */}
            <section
              id="contact"
              style={{
                background: "#e3f2fd",
                borderRadius: 12,
                boxShadow: "0 2px 8px #1976d211",
                padding: "32px 24px",
                maxWidth: 650,
                margin: "0 auto 48px auto",
                userSelect: "none",
              }}
            >
              <h2 style={{ marginBottom: 10, fontWeight: 700 }}>Contact</h2>
              <div style={{ marginBottom: 8 }}>Have questions or feedback?</div>
              <div style={{ marginBottom: 8 }}>
                <b>Email:</b>{" "}
                <a href="mailto:in.freetimenow@gmail.com" className="link-hover" style={{ color: "#1976d2" }}>
                  in.freetimenow@gmail.com
                </a>
              </div>
              <div>
                <b>LinkedIn:</b>{" "}
                <a
                  href="https://www.linkedin.com/in/chirag-gaurav-a7a006286/"
                  className="link-hover"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1976d2" }}
                >
                  linkedin
                </a>
              </div>
            </section>
            {/* Call to Action */}
            <section
              style={{
                textAlign: "center",
                marginBottom: 48,
                userSelect: "none",
              }}
            >
              <Link
                to="/register"
                className="button-hover"
                style={{
                  background: "#1976d2",
                  color: "#fff",
                  padding: "16px 48px",
                  borderRadius: 32,
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  textDecoration: "none",
                  boxShadow: "0 2px 8px #1976d222",
                }}
              >
                Try the App Now
              </Link>
            </section>
          </main>
          <footer
            style={{
                background: "#1976d2",
                color: "#fff",
                textAlign: "center",
                padding: "18px 0",
                fontSize: "1rem",
                letterSpacing: "0.5px",
                userSelect: "none",
                marginTop: 32
            }}
            >
            &copy; {new Date().getFullYear()} YahanHai! &mdash; Made with ❤️ by Chirag Gaurav
            </footer>

        </div>
        
      </SimpleBar>
    </>
  );
}

const navLinkStyle = {
  color: "#fff",
  textDecoration: "none",
  padding: "6px 0",
  transition: "color 0.2s",
  cursor: "pointer",
  userSelect: "none",
};
