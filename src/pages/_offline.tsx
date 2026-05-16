export default function OfflinePage() {
  return (
    <main
      style={{
        alignItems: "center",
        background:
          "radial-gradient(circle at top left, rgba(241,109,59,0.2), transparent 30%), linear-gradient(180deg, #f7ecd8 0%, #ead9c1 100%)",
        color: "#111111",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(17,17,17,0.08)",
          borderRadius: "28px",
          boxShadow: "0 24px 80px rgba(17,17,17,0.12)",
          maxWidth: "420px",
          padding: "28px",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#111111",
            borderRadius: "999px",
            color: "#f4e7d7",
            display: "inline-block",
            fontFamily: "monospace",
            fontSize: "11px",
            letterSpacing: "0.18em",
            marginBottom: "16px",
            padding: "8px 12px",
            textTransform: "uppercase",
          }}
        >
          Offline Mode
        </div>
        <h1
          style={{
            fontSize: "34px",
            fontWeight: 900,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          Koneksi putus.
        </h1>
        <p
          style={{
            color: "rgba(17,17,17,0.68)",
            fontSize: "15px",
            lineHeight: 1.7,
            marginTop: "14px",
          }}
        >
          PocketFirewall masih hidup, tapi halaman ini belum ada di cache lokal.
          Saat koneksi balik, buka ulang untuk sinkron penuh.
        </p>
      </div>
    </main>
  )
}
