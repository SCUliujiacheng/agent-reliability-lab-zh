import { useState } from "react";

const NAV_ITEMS = [
  { label: "概览", href: "#overview" },
  { label: "运行记录", href: "#runs" },
  { label: "评测", href: "#evaluations" },
  { label: "场景", href: "#scenarios" },
] as const;

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="mobile-header">
        <a className="brand brand--mobile" href="#overview" aria-label="Agent Reliability Lab 首页">
          <span className="brand__mark" aria-hidden="true">AR</span>
          <span>Agent Reliability Lab</span>
        </a>
        <button
          className="mobile-menu"
          type="button"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true">{open ? "×" : "☰"}</span>
          <span className="sr-only">切换导航</span>
        </button>
      </header>
      <aside className={`side-rail${open ? " side-rail--open" : ""}`}>
        <a className="brand" href="#overview" aria-label="Agent Reliability Lab 首页">
          <span className="brand__mark" aria-hidden="true">AR</span>
          <span>Agent Reliability<br />Lab</span>
        </a>
        <nav id="primary-navigation" aria-label="主导航">
          <ul className="nav-list">
            {NAV_ITEMS.map((item, index) => (
              <li key={item.href}>
                <a
                  className={index === 0 ? "nav-link nav-link--active" : "nav-link"}
                  href={item.href}
                  aria-current={index === 0 ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="nav-link__index" aria-hidden="true">0{index + 1}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="rail-caption">本地评测工作台</p>
      </aside>
    </>
  );
}
