interface SquadStackProps {
  players: any[];
  count?: number;
}

export function SquadStack({ players, count }: SquadStackProps) {
  const displayCount = count || players.length;
  const shown = Math.min(displayCount, 4);
  const displayPlayers = players.slice(0, shown);

  return (
    <div className="row" style={{ marginRight: 4 }}>
      {displayPlayers.map((player, i) => {
        const initials = player.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div
            key={player.id || i}
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background:
                i % 2 === 0 ? "var(--orange-soft)" : "var(--teal-soft)",
              color: i % 2 === 0 ? "var(--orange-deep)" : "var(--teal-deep)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              fontWeight: 700,
              border: "1.5px solid #fff",
              marginLeft: i === 0 ? 0 : -6,
            }}
          >
            {initials}
          </div>
        );
      })}
    </div>
  );
}
