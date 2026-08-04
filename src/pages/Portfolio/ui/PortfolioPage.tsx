import { Link } from "react-router-dom";

const wrapperStyle: React.CSSProperties = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffffff",
  fontFamily: "'Exo 2', 'Segoe UI', sans-serif",
};

export const PortfolioPage = () => (
  <div style={wrapperStyle}>
    <h1
      style={{
        margin: 0,
        fontSize: 48,
        fontWeight: 800,
        color: "#0a0e17",
      }}
    >
      Portfolio
    </h1>
    <p style={{ color: "#94a3b8", marginTop: 12, fontSize: 18 }}>
      Coming soon
    </p>
    <Link
      to="/snake"
      style={{
        marginTop: 32,
        fontSize: 20,
        color: "#22c55e",
        textDecoration: "none",
        fontWeight: 700,
      }}
    >
      Play 3D Snake
    </Link>
  </div>
);
