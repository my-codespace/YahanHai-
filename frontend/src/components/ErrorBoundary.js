import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled rendering crash:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #1976d2 0%, #63a4ff 100%)",
            padding: 24,
            fontFamily: "Inter, Arial, sans-serif",
            color: "#333",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              borderRadius: 24,
              padding: 40,
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
            <h2
              style={{
                margin: "0 0 12px 0",
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "#1976d2",
              }}
            >
              Oops, Something went wrong
            </h2>
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: "1rem",
                lineHeight: "1.6",
                color: "#555",
              }}
            >
              An unexpected rendering issue occurred on the map or layout view. Don't worry, your data is safe. Let's try reloading the application.
            </p>
            {process.env.NODE_ENV !== "production" && this.state.error && (
              <pre
                style={{
                  textAlign: "left",
                  background: "rgba(0, 0, 0, 0.05)",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 12,
                  overflowX: "auto",
                  marginBottom: 24,
                  maxHeight: 120,
                  color: "#d32f2f",
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "12px 32px",
                fontSize: "1.05rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(25, 118, 210, 0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => (e.target.style.transform = "scale(1.03)")}
              onMouseOut={(e) => (e.target.style.transform = "scale(1.0)")}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
