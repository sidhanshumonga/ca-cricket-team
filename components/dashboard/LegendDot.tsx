interface LegendDotProps {
  color: string;
  border?: string;
  label: string;
}

export function LegendDot({ color, border, label }: LegendDotProps) {
  return (
    <div className="row gap-6">
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          background: color,
          border: border ? `1px solid ${border}` : "none",
        }}
      />
      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{label}</div>
    </div>
  );
}
