import { NavLink, Outlet } from "react-router-dom";

import { MODULES } from "./modules";
import "./app.css";

export function Layout() {
  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <NavLink to="/" className="app-brand">
            <span className="app-brand__logo" aria-hidden="true">
              🎲
            </span>
            Quizz
          </NavLink>
          <nav aria-label="Navigation principale">
            <ul className="app-nav">
              {MODULES.filter((module) => module.inMenu && module.path).map(
                (module) => (
                  <li key={module.id}>
                    <NavLink to={module.path ?? "/"} className="app-nav__link">
                      <module.icon aria-hidden="true" />
                      <span>{module.title}</span>
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
