import React, { useState, useEffect } from 'react';

const taglines = [
  'Finding local shops near you…',
  'Connecting you to your neighbourhood…',
  'Tracking your favourite retailers…',
  'Mapping the local world around you…',
  'Almost ready — hang tight! 🎯',
];

const PIN_ICON = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill="currentColor"
    />
    <circle cx="12" cy="9" r="2.5" fill="white" />
  </svg>
);

export default function AppLoadingScreen() {
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setTaglineIdx(prev => (prev + 1) % taglines.length);
        setFadeIn(true);
      }, 350);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="app-loading-screen"
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1340a8 0%, #1976d2 45%, #63a4ff 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

        @keyframes floatPin1 {
          0%, 100% { transform: translateY(0px) rotate(-15deg); opacity: 0.18; }
          50% { transform: translateY(-22px) rotate(-15deg); opacity: 0.28; }
        }
        @keyframes floatPin2 {
          0%, 100% { transform: translateY(0px) rotate(20deg); opacity: 0.14; }
          50% { transform: translateY(-18px) rotate(20deg); opacity: 0.22; }
        }
        @keyframes floatPin3 {
          0%, 100% { transform: translateY(0px) rotate(-8deg); opacity: 0.12; }
          60% { transform: translateY(-28px) rotate(-8deg); opacity: 0.2; }
        }
        @keyframes ripple {
          0% { transform: scale(0.7); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes bounce-pin {
          0%, 100% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-12px) scale(1.08); }
          60% { transform: translateY(-4px) scale(0.97); }
        }
        @keyframes spin-ring {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .loading-tagline-enter { animation: fadeSlideUp 0.35s ease forwards; }
        .loading-tagline-exit { opacity: 0; transition: opacity 0.35s ease; }
      `}</style>

      {/* Decorative floating pins */}
      <div style={{ position: 'absolute', top: '12%', left: '8%', width: 52, height: 52, color: 'rgba(255,255,255,0.2)', animation: 'floatPin1 3.5s ease-in-out infinite' }}>
        {PIN_ICON}
      </div>
      <div style={{ position: 'absolute', top: '20%', right: '10%', width: 40, height: 40, color: 'rgba(255,255,255,0.16)', animation: 'floatPin2 4.2s ease-in-out infinite' }}>
        {PIN_ICON}
      </div>
      <div style={{ position: 'absolute', bottom: '22%', left: '14%', width: 34, height: 34, color: 'rgba(255,255,255,0.13)', animation: 'floatPin3 3.8s ease-in-out infinite 0.8s' }}>
        {PIN_ICON}
      </div>
      <div style={{ position: 'absolute', bottom: '18%', right: '9%', width: 44, height: 44, color: 'rgba(255,255,255,0.15)', animation: 'floatPin1 5s ease-in-out infinite 1.2s' }}>
        {PIN_ICON}
      </div>
      <div style={{ position: 'absolute', top: '55%', left: '4%', width: 30, height: 30, color: 'rgba(255,255,255,0.1)', animation: 'floatPin2 4.6s ease-in-out infinite 2s' }}>
        {PIN_ICON}
      </div>
      <div style={{ position: 'absolute', top: '60%', right: '5%', width: 38, height: 38, color: 'rgba(255,255,255,0.12)', animation: 'floatPin3 3.2s ease-in-out infinite 0.5s' }}>
        {PIN_ICON}
      </div>

      {/* Main content card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: 28,
          padding: '48px 52px',
          boxShadow: '0 24px 64px rgba(10, 40, 120, 0.28)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          minWidth: 300,
          maxWidth: 380,
          zIndex: 1,
        }}
      >
        {/* Animated pin icon with ripple */}
        <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 24 }}>
          {/* Ripple rings */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 70, height: 70,
            marginTop: -35, marginLeft: -35,
            borderRadius: '50%',
            border: '2.5px solid rgba(255,255,255,0.45)',
            animation: 'ripple 2s ease-out infinite',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 70, height: 70,
            marginTop: -35, marginLeft: -35,
            borderRadius: '50%',
            border: '2.5px solid rgba(255,255,255,0.3)',
            animation: 'ripple 2s ease-out infinite 0.65s',
          }} />
          {/* Pin */}
          <div style={{
            width: 60, height: 60,
            margin: '0 auto',
            color: '#fff',
            animation: 'bounce-pin 2s ease-in-out infinite',
            filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.25))',
          }}>
            {PIN_ICON}
          </div>
        </div>

        {/* App name */}
        <div style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.5px',
          lineHeight: 1,
          marginBottom: 6,
          textShadow: '0 2px 12px rgba(0,0,0,0.15)',
        }}>
          YahanHai!
        </div>
        <div style={{
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.7)',
          fontWeight: 500,
          marginBottom: 28,
          letterSpacing: '0.3px',
        }}>
          Live Local Discovery
        </div>

        {/* Rotating tagline */}
        <div style={{
          minHeight: 28,
          marginBottom: 28,
          overflow: 'hidden',
          width: '100%',
        }}>
          <div
            className={fadeIn ? 'loading-tagline-enter' : 'loading-tagline-exit'}
            style={{
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.88)',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {taglines[taglineIdx]}
          </div>
        </div>

        {/* Spinning loader ring */}
        <div style={{
          width: 40, height: 40,
          borderRadius: '50%',
          border: '3.5px solid rgba(255,255,255,0.18)',
          borderTopColor: '#fff',
          animation: 'spin-ring 0.9s linear infinite',
          marginBottom: 20,
        }} />

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 7, height: 7,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.8)',
                animation: `pulse-dot 1.4s ease-in-out infinite ${i * 0.22}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <div style={{
        position: 'absolute',
        bottom: 28,
        color: 'rgba(255,255,255,0.45)',
        fontSize: '0.8rem',
        fontWeight: 500,
        letterSpacing: '0.4px',
      }}>
        Connecting you to your local world 🌏
      </div>
    </div>
  );
}
