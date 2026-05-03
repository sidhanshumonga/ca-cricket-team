interface ContextBannerProps {
  status?: string;
  match?: any;
}

export function ContextBanner({ status, match }: ContextBannerProps) {
  if (!match) return null;
  
  let cfg: {
    bg: string;
    fg: string;
    icon: string;
    text: React.ReactNode;
  };
  
  if (!status) {
    cfg = {
      bg: "var(--amber-soft)",
      fg: "var(--amber)",
      icon: "⚡",
      text: (
        <>
          Match in <strong>{match.daysAway} days</strong> — please mark availability.
        </>
      ),
    };
  } else if (status === "available") {
    cfg = {
      bg: "var(--green-soft)",
      fg: "var(--green)",
      icon: "✓",
      text: (
        <>
          You're in for <strong>{match.opponent}</strong>. We'll see you there.
        </>
      ),
    };
  } else if (status === "backup") {
    cfg = {
      bg: "var(--blue-soft)",
      fg: "var(--blue)",
      icon: "◆",
      text: (
        <>
          Logged as <strong>backup</strong>. Stay loose.
        </>
      ),
    };
  } else {
    cfg = {
      bg: "var(--red-soft)",
      fg: "var(--red)",
      icon: "×",
      text: (
        <>
          You're out for <strong>{match.opponent}</strong>. Captain's been notified.
        </>
      ),
    };
  }
  
  return (
    <div
      className="row gap-12 fade-in"
      style={{
        background: cfg.bg,
        color: cfg.fg,
        borderRadius: 16,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          color: cfg.fg,
          flexShrink: 0,
        }}
      >
        {cfg.icon}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.4, color: "var(--ink)" }}>
        {cfg.text}
      </div>
    </div>
  );
}
