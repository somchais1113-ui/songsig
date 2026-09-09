"use client";

import { Bell, CircleGauge, Database, FileSearch, FlaskConical, Lightbulb, Menu, Radar, Settings, ShieldCheck, Sparkles, Waypoints } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const nav = [
  { href: "/overview", label: "Overview", icon: CircleGauge },
  { href: "/sources", label: "Sources", icon: Database },
  { href: "/signals", label: "Signals", icon: Radar },
  { href: "/review", label: "Human Review", icon: ShieldCheck },
  { href: "/research", label: "Research", icon: FlaskConical },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/opportunities", label: "Opportunities", icon: Waypoints },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18}/></div>
          <div>
            <div className="brand-title">Consumer<br/>Signal Engine</div>
            <div className="brand-sub">Research Intelligence</div>
          </div>
        </div>
        <div>
          <div className="nav-group-title">Workspace</div>
          <nav className="nav">
            {nav.map(({href,label,icon:Icon}) => (
              <Link key={href} href={href} className={`nav-link ${pathname===href ? "active":""}`}>
                <Icon size={18}/><span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <div className="nav-group-title">System</div>
          <nav className="nav">
            <Link href="/settings" className={`nav-link ${pathname==="/settings"?"active":""}`}>
              <Settings size={18}/><span>Settings</span>
            </Link>
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="status"><i className="status-dot"/><span>Prototype data online</span></div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <Menu size={19} className="mobile-title"/>
            <div className="workspace-pill">Workspace · Product Research</div>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" aria-label="Search"><FileSearch size={17}/></button>
            <button className="icon-btn" aria-label="Notifications"><Bell size={17}/></button>
            <div className="avatar">SC</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
