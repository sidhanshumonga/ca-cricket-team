import React from "react";

interface CricketGroundProps {
  className?: string;
}

export function CricketGround({ className }: CricketGroundProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Outer boundary - oval shape */}
      <ellipse
        cx="50"
        cy="50"
        rx="48"
        ry="48"
        fill="#2d5016"
        stroke="#1a3d0a"
        strokeWidth="0.5"
      />

      {/* Inner circle (30-yard circle) */}
      <circle
        cx="50"
        cy="50"
        r="25"
        fill="none"
        stroke="#4a7c2c"
        strokeWidth="0.3"
        strokeDasharray="1,1"
      />

      {/* Pitch - rectangular area in center */}
      <rect
        x="47"
        y="35"
        width="6"
        height="30"
        fill="#c9b896"
        stroke="#a89968"
        strokeWidth="0.2"
      />

      {/* Pitch creases */}
      <line
        x1="47"
        y1="38"
        x2="53"
        y2="38"
        stroke="#8b7355"
        strokeWidth="0.15"
      />
      <line
        x1="47"
        y1="62"
        x2="53"
        y2="62"
        stroke="#8b7355"
        strokeWidth="0.15"
      />

      {/* Stumps at bowling end (bottom) */}
      <g transform="translate(50, 62)">
        <rect x="-0.3" y="0" width="0.2" height="1.5" fill="#654321" />
        <rect x="-0.05" y="0" width="0.2" height="1.5" fill="#654321" />
        <rect x="0.2" y="0" width="0.2" height="1.5" fill="#654321" />
      </g>

      {/* Stumps at batting end (top) */}
      <g transform="translate(50, 38)">
        <rect x="-0.3" y="-1.5" width="0.2" height="1.5" fill="#654321" />
        <rect x="-0.05" y="-1.5" width="0.2" height="1.5" fill="#654321" />
        <rect x="0.2" y="-1.5" width="0.2" height="1.5" fill="#654321" />
      </g>

      {/* Boundary rope */}
      <ellipse
        cx="50"
        cy="50"
        rx="47"
        ry="47"
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.4"
      />
    </svg>
  );
}
