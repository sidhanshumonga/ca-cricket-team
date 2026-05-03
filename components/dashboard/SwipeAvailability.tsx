interface SwipeAvailabilityProps {
  current?: string;
  onChange: (status: string) => void;
  match: any;
}

export function SwipeAvailability({
  current,
  onChange,
  match,
}: SwipeAvailabilityProps) {
  const opts = [
    { id: "available", label: "In", icon: "✓", color: "var(--green)" },
    { id: "backup", label: "Backup", icon: "◆", color: "var(--blue)" },
    { id: "unavailable", label: "Out", icon: "×", color: "var(--red)" },
  ];
  const idx = opts.findIndex((o) => o.id === current);
  const active = idx >= 0;

  return (
    <div>
      <div className="swipe-track">
        {active && (
          <div
            className="swipe-knob"
            style={{
              left: `calc(${(idx * 100) / 3}% + 4px)`,
              width: `calc(${100 / 3}% - 4px)`,
              background: opts[idx].color,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            }}
          />
        )}
        {opts.map((o, i) => (
          <div
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`swipe-opt ${current === o.id ? "active" : ""}`}
          >
            <span style={{ fontSize: 16 }}>{o.icon}</span>
            <span>{o.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
