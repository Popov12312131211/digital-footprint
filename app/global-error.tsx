"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#080b14",
          color: "#e8ebf5",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Что-то пошло не так</h1>
          <p style={{ color: "#9aa3bd", lineHeight: 1.6 }}>
            Приложение не смогло загрузиться. Попробуйте ещё раз.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              borderRadius: 999,
              border: 0,
              padding: "12px 24px",
              background: "linear-gradient(135deg, #4f6bf0, #7c5ce8)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Повторить
          </button>
        </div>
      </body>
    </html>
  );
}
