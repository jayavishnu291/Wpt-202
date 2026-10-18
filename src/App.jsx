import { useState } from "react";
import { appConfig } from "./config/appConfig.js";
import { t } from "./utils/text.js";

export default function App() {
  const [continued, setContinued] = useState(false);

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">✿</div>
        <div>
          <p className="brand-name">{appConfig.appName}</p>
          <p className="brand-caption">Focus by day. Rest by night.</p>
        </div>
        <span className="status-pill">Sprint 1</span>
      </header>

      <section className="hero-card" aria-labelledby="welcome-title">
        <div className="flower-art" aria-hidden="true">
          <span className="sun"></span>
          <span className="petal p1"></span>
          <span className="petal p2"></span>
          <span className="petal p3"></span>
          <span className="petal p4"></span>
          <span className="petal p5"></span>
          <span className="flower-center"></span>
          <span className="stem"></span>
          <span className="leaf leaf-left"></span>
          <span className="leaf leaf-right"></span>
        </div>

        <p className="eyebrow">{t("sample.eyebrow")}</p>
        <h1 id="welcome-title">{t("s01.title")}</h1>
        <p className="supporting-copy">{t("sample.languageNote")}</p>

        <button className="primary-button" onClick={() => setContinued(true)}>
          {t("s01.primaryAction")}
          <span aria-hidden="true">→</span>
        </button>

        {continued && (
          <p className="success-message" role="status">
            {t("sample.actionSuccess")}
          </p>
        )}
      </section>

      <footer className="footer-note">
        <span className="check-dot" aria-hidden="true">✓</span>
        {t("sample.helperStatus")}
      </footer>
    </main>
  );
}