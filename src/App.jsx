function App() {
  return (
    <div className="container">
      <h1
        style={{
          fontSize: "clamp(2rem, 6vw, 3.5rem)",
          color: "var(--neon)",
          textShadow: "0 0 16px rgba(0, 240, 255, 0.5)",
          paddingTop: "var(--space-7)",
        }}
      >
        NeonScreen
      </h1>
      <p style={{ color: "var(--text-muted)", marginTop: "var(--space-2)" }}>
        Каталог фильмов на данных TMDB
      </p>
    </div>
  );
}

export default App;
