document.addEventListener('DOMContentLoaded', () => {

  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  /* ---------------------------
     OVERLAY PRINCIPAL
  --------------------------- */
  const overlay = $('#overlay');
  const overlayInner = $('#overlay-inner');
  const overlayContent = $('#overlay-content');
  const overlayClose = $('#overlay-close');

  function openPanel(key) {
    overlayContent.innerHTML = PANELS[key] || `<p>Contenu à venir.</p>`;
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => overlayInner.focus(), 50);
  }

  function closePanel() {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  overlayClose.addEventListener('click', closePanel);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePanel();
  });

  /* ---------------------------
     PANELS
  --------------------------- */
  const PANELS = {
    welcome: `
      <h2>Bienvenue</h2>
      <p>Ce site centralise tout l’univers de Brad Bitt : jeu, épisodes, musiques et lore.</p>
    `,
    game: `
      <h2>Brad Bitt — Le jeu</h2>
      <p>
        Brad Bitt est un jeu narratif mêlant exploration, énigmes et narration visuelle.
        Le joueur incarne Brad dans un univers étrange, entre réalité et fiction.
      </p>
      <p>
        Le projet s’appuie sur une direction artistique forte et une IA utilisée uniquement
        comme outil d’assistance créative (aide à l’idéation, pas de génération brute de contenu final).
      </p>
    `,
    lore: `
      <h2>L’histoire de Bitt</h2>
      <p>
        Découvrez le lore, la chronologie et les inspirations de l’univers Brad Bitt.
      </p>
    `,
    contact: `
      <h2>Contact</h2>
      <p>contact (at) bradbitt.example</p>
    `,
    news: `
      <h2>Nouveautés</h2>
      <p>Corrections visuelles, améliorations mobile et stabilité générale du site.</p>
    `,
    ep1: `<h2>Épisode 1 — La soirée</h2><p>Brad se rend à une soirée…</p>`,
    ep2: `<h2>Épisode 2 — Changement de programme</h2><p>Une forêt, une disparition.</p>`,
    ep3: `<h2>Épisode 3 — Retard</h2><p>La suite arrive bientôt.</p>`
  };

  /* ---------------------------
     BOUTONS → PANELS
  --------------------------- */
  $$('[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      openPanel(btn.dataset.panel);
    });
  });

  $('#oval-learn')?.addEventListener('click', () => {
    openPanel('welcome');
  });

  /* ---------------------------
     CARTES ÉPISODES (FLIP AU CLIC)
  --------------------------- */
  $$('.ep-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });

  /* ---------------------------
     LIEN EXTERNE (DON)
  --------------------------- */
  const warn = $('#external-warn');
  const warnMsg = $('#warn-msg');
  const warnClose = $('#warn-close');
  const warnCancel = $('#warn-cancel');
  const warnCont = $('#warn-cont');
  let warnTarget = null;

  $$('.external').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      warnTarget = btn.dataset.external;
      warnMsg.textContent = `Vous allez être redirigé vers : ${warnTarget}`;
      warn.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeWarn() {
    warn.classList.add('hidden');
    document.body.style.overflow = '';
    warnTarget = null;
  }

  warnClose.addEventListener('click', closeWarn);
  warnCancel.addEventListener('click', closeWarn);
  warnCont.addEventListener('click', () => {
    if (warnTarget) window.open(warnTarget, '_blank', 'noopener');
    closeWarn();
  });

  /* ---------------------------
     BADGE NOUVEAUTÉS
  --------------------------- */
  const NEWS_KEY = 'brad_news_seen';
  const newsBadge = $('#news-badge');
  const btnNews = $('#btn-news');

  function renderBadge() {
    if (localStorage.getItem(NEWS_KEY)) {
      newsBadge.style.display = 'none';
    }
  }

  btnNews.addEventListener('click', () => {
    localStorage.setItem(NEWS_KEY, 'true');
    renderBadge();
  });

  renderBadge();

  /* ---------------------------
     THEME TOGGLE (IDENTIQUE)
  --------------------------- */
  const THEME_KEY = 'brad_theme_pref';
  const themeToggle = $('#theme-toggle');
  const html = document.documentElement;

  function applyTheme(pref) {
    if (pref === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }
  }

  let theme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(theme);

  themeToggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  });

  /* ---------------------------
     ESC → FERMER
  --------------------------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!overlay.classList.contains('hidden')) closePanel();
      if (!warn.classList.contains('hidden')) closeWarn();
    }
  });

});
