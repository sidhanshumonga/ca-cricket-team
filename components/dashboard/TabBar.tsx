"use client";

import { Icons } from "@/components/ui-new/icons";

interface TabBarProps {
  active: string;
  onNav: (tab: string) => void;
}

export function TabBar({ active, onNav }: TabBarProps) {
  const tabs = [
    { id: "dashboard", label: "Dash", icon: Icons.home },
    { id: "umpiring", label: "Umpire", icon: Icons.whistle },
    { id: "profile", label: "Profile", icon: Icons.user },
  ];

  return (
    <div className="tabbar">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onNav(t.id)}
          className={`tab ${active === t.id ? "active" : ""}`}
        >
          <span style={{ width: 20, height: 20 }}>{t.icon}</span>
          <span>{t.label}</span>
          <span className="dot" />
        </button>
      ))}
    </div>
  );
}
