import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container" style={{ textAlign: "center" }}>
      <h1
        style={{ fontSize: "clamp(3rem, 12vw, 6rem)", color: "var(--magenta)" }}
      >
        404
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
        Такой страницы нет
      </p>
      <Link to="/">Вернуться на главную</Link>
    </div>
  );
}

export default NotFound;
