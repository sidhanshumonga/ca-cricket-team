interface AvatarProps {
  player: {
    name: string;
    photoURL?: string;
  };
  size?: number;
  index?: number;
}

export function Avatar({ player, size = 40, index = 0 }: AvatarProps) {
  const firstInitial = player.name[0]?.toUpperCase() || "";

  // Alternate colors based on player position in list
  const isOrange = index % 2 === 0;
  const bgColor = isOrange ? "var(--orange-soft)" : "var(--teal-soft)";
  const textColor = isOrange ? "var(--orange-deep)" : "var(--teal-deep)";

  return (
    <div
      className="av"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        background: bgColor,
        color: textColor,
      }}
    >
      {player.photoURL ? (
        <img
          src={player.photoURL}
          alt={player.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ) : (
        firstInitial
      )}
    </div>
  );
}
