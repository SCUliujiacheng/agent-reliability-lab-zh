interface NavigationProps {
  onNavigate?: (anchor: string) => void;
}

const NAV_ITEMS = [
  { label: "运行记录", href: "#runs" },
  { label: "场景", href: "#scenarios" },
  { label: "评测", href: "#evaluations" },
] as const;

export function Navigation({ onNavigate }: NavigationProps) {
  return (
    <header className="site-header">
      <a
        className="brand"
        href="#overview"
        aria-label="Agent Reliability Lab 首页"
        onClick={(event) => {
          if (!onNavigate) return;
          event.preventDefault();
          onNavigate("#overview");
        }}
      >
        Agent Reliability Lab
      </a>
      <nav aria-label="主导航">
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                className="nav-link"
                href={item.href}
                onClick={(event) => {
                  if (!onNavigate) return;
                  event.preventDefault();
                  onNavigate(item.href);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
