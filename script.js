// script.js
// Hub site logic: overlays, news badge persistence, theme toggle, ep-card interactions.

document.addEventListener('DOMContentLoaded', () => {
  // helpers
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  function bindHomeInteractions() {
  // data-panel buttons
  $$('[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.getAttribute('data-panel');
      if (k === 'news') { markNewsSeen(); showNewsPanel(); }
      else openPanel(k);
    });
  });

  // ep-card flip
  $$('.ep-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });

  // discover button
  const discoverBtn = document.querySelector('#btn-discover');
  if (discoverBtn) {
    discoverBtn.addEventListener('click', () => {
      main.innerHTML = GAME_PAGE;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      observeReveals();
    });
  }
}
    /* ---------------------------
     SPA-like main swap (Game page)
     --------------------------- */

  const main = $('#app-main');
  const homeHTML = main.innerHTML;

  const GAME_PAGE = `
    <section class="hero container reveal">
      <h1>Brad Bitt — Le jeu</h1>
      <p class="hero-lead">
        Un projet narratif et interactif, à la frontière entre jeu, série et expérience.
      </p>
    </section>

    <section class="content container">
      <article class="card reveal">
        <div class="card-inner">
          <h2>Le concept</h2>
          <p>
            Brad Bitt est un jeu narratif centré sur l’ambiance, la progression lente
            et le mystère. Chaque élément est pensé pour servir l’histoire.
          </p>
        </div>
      </article>

      <article class="card reveal">
        <div class="card-inner">
          <h2>Inspirations</h2>
          <p>
            Séries indépendantes, récits fragmentés, jeux à narration environnementale
            et expériences minimalistes.
          </p>
        </div>
      </article>

      <article class="card reveal">
        <div class="card-inner">
          <h2>Technologie & IA</h2>
          <p>
            Utilisation réfléchie de l’IA pour l’aide à l’écriture, la génération d’idées
            et certains outils de développement — jamais pour remplacer la vision.
          </p>
        </div>
      </article>
    </section>
  `;

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
    welcome: `<h2>Bienvenue</h2><p>Ce site centralise tout l'univers Brad Bitt : jeu, épisodes, musiques et lore.</p>`,
    game: `<h2>Brad Bitt — Le jeu</h2><p>Aperçu du jeu, mécaniques et teasing. (Screens, sprites & notes de dev.)</p>`,
    lore: `<h2>L'histoire de Bitt</h2><p>Le lore complet : origines, chronologie et influences.</p>`,
    ep1: `<h2>Épisode 1 — La soirée</h2><p>Brad se rend à une soirée — la tension monte sans qu'il s'en doute.</p>`,
    ep2: `<h2>Épisode 2 — Changement de programme</h2><p>Brad entre dans une forêt étrange et disparaît dans un mystère croissant.</p>`,
    ep3: `<h2>Épisode 3 — Retard</h2><p>Brad découvre une salle mystérieuse... la suite vous attend.</p>`,
    contact: `<h2>Contact</h2><p>Pour un message : contact (at) bradbitt.example</p>`,
    news: `<h2>Nouveautés</h2><div id="news-content"><p>Optimisation mobile — corrections de transitions menu → jeu.</p></div>`
  };

  /* ---------------------------
     Overlay open / close
     --------------------------- */
  function openPanel(key) {
    overlayContent.innerHTML = PANELS[key] || `<p>Contenu à venir</p>`;
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
 const discoverBtn = document.querySelector('#btn-discover');

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

  // ep-card flip: on mobile toggle .flipped; on desktop hover removed to avoid hover-bug — flip only via class (click)
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
     External link warning
     --------------------------- */
  $$('.mini-nav .external').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      warn.classList.remove('hidden');
      warnTarget = btn.getAttribute('data-external');
      warnMsg.textContent = `En cliquant sur continuer, vous quitterez bradbitt.example pour aller vers : ${warnTarget}`;
      document.body.style.overflow = 'hidden';
    });
  });
  warnClose.addEventListener('click', closeWarn);
  warnCancel.addEventListener('click', closeWarn);
  warnCont.addEventListener('click', () => {
    if (warnTarget) window.open(warnTarget, '_blank', 'noopener');
    closeWarn();
  });
  function closeWarn() { warn.classList.add('hidden'); document.body.style.overflow = ''; warnTarget = null; }

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
      content += `<p class="news-date">Dernière visite : ${date}</p>`;
    } else {
      content += `<p class="news-date">Nouvelle mise à jour</p>`;
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
    themeToggle.setAttribute('aria-label', `Mode thème : ${pref}`);
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
/* reveal observer */
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) en.target.classList.add('visible');
    else en.target.classList.remove('visible');
  });
}, { threshold: 0.12 });

function observeReveals() {
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.remove('visible');
    io.observe(el);
  });
}

  /* ensure news badge initial render (in case stored) */
  renderNewsBadge();

  /* small: when opening news via nav button toggle seen */
  btnNews.addEventListener('click', () => {
    markNewsSeen();
    showNewsPanel();
  });
  /* Logo = retour accueil */
 /* Logo = retour accueil */
const logo = document.querySelector('.brand');

logo.addEventListener('click', () => {
  main.innerHTML = homeHTML;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 🔧 REBRANCHER LES INTERACTIONS PERDUES
  bindHomeInteractions();

  // 🔧 RELANCER LES ANIMATIONS reveal
  observeReveals();
});

  // final: small UX improvement — clicking outside overlay closes handled above

});
