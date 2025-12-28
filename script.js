// script.js
// Hub site logic: overlays, news badge persistence, theme toggle, ep-card interactions.

document.addEventListener('DOMContentLoaded', () => {
  // helpers
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
    /* ---------------------------
     SPA-like main swap (Game page)
     --------------------------- */

  const main = $('#app-main');
  const homeHTML = main.innerHTML;


  const overlay = $('#overlay');
  const overlayInner = $('#overlay-inner');
  const overlayContent = $('#overlay-content');
  const overlayClose = $('#overlay-close');

  const warn = $('#external-warn');
  const warnMsg = $('#warn-msg');
  const warnClose = $('#warn-close');
  const warnCont = $('#warn-cont');
  const warnCancel = $('#warn-cancel');
  let warnTarget = null;

  const newsBadge = $('#news-badge');
  const btnNews = $('#btn-news');

  const THEME_KEY = 'brad_theme_pref'; // 'auto' | 'light' | 'dark'
  const NEWS_KEY = 'brad_news_seen';   // stores ISO date when read

  /* ---------------------------
     Panels content map (editable)
     --------------------------- */
  const PANELS = {
    welcome: `<h2>Bienvenue</h2><p>Ce site centralise tout l'univers Brad Bitt : jeu, Épisodes, musiques et lore.</p>`,
    game: `<h2>Brad Bitt, mais le jeu</h2><p>Aperçu du jeu, mécaniques et teasing. (Screens, sprites & notes de dev.)</p>`,
    lore: `<h2>L'histoire de Bitt</h2><p>Le lore complet : origines, chronologie et influences.</p>`,
    ep1: `<h2>Épisode 1 — La soirée</h2> 
    ep2: `<h2>Épisode 2 - ” Changement de programme</h2>
    ep3: `<h2>Épisode 3 - ” Retard</h2>
 news: `<h2>Nouveautés</h2>
<div id="news-content">
  <p id="news-text">
    Ici, vous découvrirez les nouveautés en ce qui concerne des ajouts ou correctifs du site.
  </p>
</div>`
  let text = seen
  ? "Aucune nouveauté pour le moment."
  : "Ici, vous découvrirez les nouveautés en ce qui concerne des ajouts ou correctifs du site.";
  let content = `
  <h2>Nouveautés</h2>
  <div id="news-content">
    <p>${text}</p>
  </div>
`;
-- */
  function openPanel(key) {
    overlayContent.innerHTML = PANELS[key] || `<p>Contenu Ã  venir</p>`;
    overlay.classList.remove('hidden');
    // small delay to ensure focusable
    setTimeout(() => overlayInner.focus(), 50);
    document.body.style.overflow = 'hidden';
  }
  function closePanel() {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
  overlayClose.addEventListener('click', closePanel);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });

  /* Map buttons -> panels */
  $$('[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.getAttribute('data-panel');
      if (k === 'news') { markNewsSeen(); showNewsPanel(); }
      else openPanel(k);
    });
  });
    /* Game page override */
  const discoverBtn = document.querySelector('#game .btn');

  if (discoverBtn) {
    discoverBtn.addEventListener('click', () => {
      main.innerHTML = GAME_PAGE;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('visible');
        io.observe(el);
      });
    });
  }

  // oval hero
  $('#oval-learn').addEventListener('click', () => openPanel('welcome'));

  // ep-card flip: on mobile toggle .flipped; on desktop hover removed to avoid hover-bug â€” flip only via class (click)
  $$('.ep-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // toggle flip on tap/click (useful for mobile)
      card.classList.toggle('flipped');
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });

  /* ---------------------------
     NEWS: badge handling + persistence
     --------------------------- */
  function isNewsSeen() {
    return !!localStorage.getItem(NEWS_KEY);
  }
  function markNewsSeen() {
    // store ISO date (e.g. "2025-11-01T12:34:56.789Z")
    const d = new Date().toISOString();
    localStorage.setItem(NEWS_KEY, d);
    renderNewsBadge();
  }
  function renderNewsBadge() {
    const seen = isNewsSeen();
    if (seen) {
      newsBadge.style.display = 'none';
    } else {
      newsBadge.style.display = 'inline-block';
    }
  }
  function showNewsPanel() {
    // include date if seen
    const seen = localStorage.getItem(NEWS_KEY);
    let content = PANELS['news'];
    if (seen) {
      const date = new Date(seen).toLocaleString();
      content += `<p class="news-date">DerniÃ¨re visite : ${date}</p>`;
    } else {
      content += `<p class="news-date">Nouvelle mise Ã  jour</p>`;
    }
    overlayContent.innerHTML = content;
    overlay.classList.remove('hidden');
    setTimeout(() => overlayInner.focus(), 60);
    document.body.style.overflow = 'hidden';
  }

  renderNewsBadge();

  /* ---------------------------
     THEME: auto + manual toggle
     --------------------------- */
  const htmlRoot = document.documentElement;
  const themeToggle = $('#theme-toggle');

  // load stored preference
  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || 'auto';
  }
  function setStoredTheme(v) {
    localStorage.setItem(THEME_KEY, v);
  }

  function applyTheme(pref) {
    // pref: 'auto' | 'light' | 'dark'
    if (pref === 'light') {
      htmlRoot.setAttribute('data-theme', 'light');
      themeToggle.title = 'Mode : clair';
    } else if (pref === 'dark') {
      htmlRoot.removeAttribute('data-theme');
      themeToggle.title = 'Mode : sombre';
    } else {
      // auto: follow system
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      if (mq.matches) htmlRoot.setAttribute('data-theme', 'light');
      else htmlRoot.removeAttribute('data-theme');
      themeToggle.title = 'Mode : automatique';
    }
    renderThemeIcons(pref);
  }

  function renderThemeIcons(pref) {
    themeToggle.dataset.mode = pref;
    // For accessibility: update aria-label
    themeToggle.setAttribute('aria-label', `Mode thÃ¨me : ${pref}`);
  }

  // init: determine pref
  let themePref = getStoredTheme();
  applyTheme(themePref);

  // click cycle: auto -> light -> dark -> auto ...
  themeToggle.addEventListener('click', () => {
    if (themePref === 'auto') themePref = 'light';
    else if (themePref === 'light') themePref = 'dark';
    else themePref = 'auto';
    setStoredTheme(themePref);
    applyTheme(themePref);
  });

  // listen system change if pref is 'auto'
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (getStoredTheme() === 'auto') applyTheme('auto');
  });

  /* ---------------------------
     keyboard: esc closes overlays
     --------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!overlay.classList.contains('hidden')) closePanel();
      if (!warn.classList.contains('hidden')) closeWarn();
    }
  });

  /* accessibility: trap focus naive for overlay (basic) */
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      // naive: keep subtle focus inside overlay-inner
      const focusable = overlayInner.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])');
      if (focusable.length) {
        focusable[0].focus();
        e.preventDefault();
      }
    }
  });

  /* reveal elements that are in view */
  const reveals = $$('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) en.target.classList.add('visible');
      else en.target.classList.remove('visible');
    });
  }, { threshold: 0.12 });
  reveals.forEach(r => io.observe(r));

  /* ensure news badge initial render (in case stored) */
  renderNewsBadge();

  /* small: when opening news via nav button toggle seen */
  btnNews.addEventListener('click', () => {
    markNewsSeen();
    showNewsPanel();
  });
  /* Logo = retour accueil */
  const logo = document.querySelector('.brand');

  logo.addEventListener('click', () => {
    main.innerHTML = homeHTML;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.remove('visible');
      io.observe(el);
    });
  });
  
  // final: small UX improvement â€” clicking outside overlay closes handled above

});


Style 

:root{
  --bg:#0b0b0f; --card:#0f1113; --muted:#9aa3b2;
  --accent:#32C0C1; --accent-2:#F53098; --text:#e9eef6;
  --glass: rgba(255,255,255,0.035);
  --radius:12px; --maxw:1100px; --container-pad:20px;
}

/* Light theme overrides (will be toggled with [data-theme="light"] on <html>) */
:root[data-theme="light"]{
  background: linear-gradient(180deg,#f7f9fc 0%, #eef2f6 50%);
  --bg: #f6f7fb;
  --card: #ffffff;
  --muted: #58606b;
  --text: #071014;
  --glass: rgba(7,16,20,0.03);
}

/* Basic reset */
*{box-sizing:border-box}
html,body{height:100%;margin:0;background:
  linear-gradient(180deg,#07070a 0%, #0e1114 50%);color:var(--text);
  font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}

/* When theme light, update background */
:root[data-theme="light"] body{
  background: linear-gradient(180deg,#f7f9fc 0%, #eef2f6 50%);
}

/* Container */
.container{max-width:var(--maxw);margin:0 auto;padding:32px var(--container-pad);}

/* HEADER */
.site-header{position:sticky;top:0;z-index:50;background:linear-gradient(180deg,rgba(6,6,8,0.55),rgba(6,6,8,0.25));
  backdrop-filter:blur(6px);border-bottom:1px solid rgba(255,255,255,0.03);}
:root[data-theme="light"] .site-header{ background:linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.8)); border-bottom:1px solid rgba(7,16,20,0.04); }
.header-inner{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.brand{display:flex;align-items:center;gap:12px}
.logo{width:48px;height:48px;border-radius:10px;background:linear-gradient(90deg,var(--accent),var(--accent-2));
 display:flex;align-items:center;justify-content:center;font-weight:800;color:#071014}
.brand-text .title{font-weight:700;font-size:14px;letter-spacing:0.6px}
.brand-text .subtitle{font-size:11px;color:var(--muted)}

/* NAV */
.mini-nav{display:flex;gap:12px;align-items:center}
.nav-item{background:transparent;border:0;color:var(--text);padding:8px 10px;border-radius:8px;cursor:pointer;
  position:relative;font-weight:600}
.nav-item:focus{outline:2px solid rgba(255,255,255,0.06);outline-offset:3px}
.nav-item::after{content:"";position:absolute;left:12px;right:12px;bottom:6px;height:2px;background:transparent;transition:all .22s;transform-origin:center}
.nav-item:hover::after{background:linear-gradient(90deg,var(--accent),var(--accent-2));transform:scaleX(1)}
.badge{display:inline-block;background:#ff4d6d;color:#fff;border-radius:8px;padding:2px 6px;font-size:11px;margin-left:8px}

/* external small arrow alignment (tilted to ~130deg) */
.external-arrow{display:inline-block;margin-left:6px; transform: rotate(315deg) translateY(-1px); display:inline-block; font-weight:700; opacity:0.95;}

/* THEME TOGGLE */
.theme-toggle{display:inline-flex;align-items:center;gap:8px;padding:6px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:var(--text);cursor:pointer}
.theme-toggle svg{opacity:0.6}
:root[data-theme="light"] body{
  background: linear-gradient(180deg,#f7f9fc 0%, #eef2f6 50%);
}

/* HERO */
.hero{display:flex;flex-direction:column;align-items:flex-start;gap:18px;padding-top:42px;padding-bottom:42px}
.hero h1{font-size:32px;margin:0}
.hero-lead{color:var(--muted);margin:0;max-width:720px}

/* OVAL BUTTON */
.oval-btn{
  background:#fff;color:#071014;border-radius:999px;padding:12px 22px;border:0;font-weight:700;cursor:pointer;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);transition:all .18s;font-size:14px}
.oval-btn:hover,.oval-btn:focus{background:#071014;color:#fff;transform:translateY(-2px)}
:root[data-theme="light"] .oval-btn{ background: linear-gradient(90deg,var(--accent),var(--accent-2)); color:#071014; }
:root[data-theme="light"] .oval-btn:hover{ background:#071014; color:#fff }

/* CONTENT GRID */
.content{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;padding-bottom:60px}
.card{
  background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  padding:12px;border-radius:var(--radius);
  box-shadow:0 8px 28px rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.03);
  display:flex; flex-direction:column;
}
.card-inner{display:flex;flex-direction:column;gap:12px;flex:1}
.card-top{ /* content block */ }
.card-actions{ display:flex; gap:8px; margin-top:auto; } /* ensures actions are at bottom */

.card h2{margin:0 0 8px 0;font-size:18px}
.card p{color:var(--muted);margin:0 0 12px 0}

/* EP GRID & cards */
.ep-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px}
.ep-card{background:var(--glass);height:120px;border-radius:12px;cursor:pointer;position:relative;perspective:1000px;
  transform-style:preserve-3d;transition:transform .6s;display:flex;align-items:center;justify-content:center;overflow:hidden}
.ep-card .ep-front,.ep-card .ep-back{position:absolute;inset:0;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;backface-visibility:hidden}
.ep-front{background:linear-gradient(180deg,#0c1a2a,#07344a);color:#fff;font-weight:700}
.ep-front span{display:block;font-weight:400;font-size:13px;color:var(--muted)}
.ep-back{background:linear-gradient(180deg,#111315,#0b0b0f);color:var(--text);transform:rotateY(180deg);text-align:center;font-size:13px;padding:16px}
.ep-card.flipped{transform:rotateY(180deg)}

/* important: remove auto-hover flip (prevents hover bugs). flip only via .flipped class (click/tap) */
/* previously we had .ep-card:hover transform â€” removed to avoid bug on some devices */

/* buttons */
.btn{background:transparent;border:1px solid rgba(255,255,255,0.06);padding:8px 12px;border-radius:8px;color:var(--text);cursor:pointer;font-weight:700}
.btn.small{padding:6px 8px;font-size:13px}
.btn.disabled{opacity:0.45;cursor:default;border-style:dashed}

/* FOOTER */
.site-footer{border-top:1px solid rgba(255,255,255,0.03);padding:18px 0;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.05))}
.footer-inner{display:flex;justify-content:space-between;color:var(--muted);font-size:13px}

/* OVERLAY */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:200}
.overlay.hidden{display:none}
.overlay-inner{
  background:linear-gradient(180deg,#0b0b0f,#0f1113);
  padding:28px;border-radius:12px;max-width:880px;width:92%;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.6);
  color:var(--text);
}
:root[data-theme="light"] .overlay-inner{
  background: linear-gradient(180deg,#ffffff,#f7f8fb);
  color:var(--text);
  border:1px solid rgba(7,16,20,0.06);
}
.overlay .close{position:absolute;top:12px;right:12px;border:0;background:transparent;color:var(--muted);font-size:20px;cursor:pointer}
.overlay-content{max-height:70vh;overflow:auto;padding-right:6px}

/* make sure overlay text is readable in light theme */
:root[data-theme="light"] .overlay-content{ color:var(--text); }

/* reveal animations */
.reveal{opacity:0;transform:translateY(14px);transition:all .6s cubic-bezier(.2,.9,.2,1)}
.reveal.visible{opacity:1;transform:none}

/* Responsive */
@media (max-width:880px){
  .content{grid-template-columns:1fr; padding:12px 20px}
  .ep-grid{grid-template-columns:repeat(2,1fr)}
  .hero h1{font-size:26px}
  .header-inner{padding:12px 0}
  .logo{width:44px;height:44px}
}
@media (max-width:480px){
  .ep-grid{grid-template-columns:1fr}
  .brand-text .title{font-size:13px}
  .oval-btn{width:100%}
  .mini-nav{gap:6px}
  .nav-item{font-size:13px;padding:6px 8px}
}

