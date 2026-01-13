// script.js — gestion badge / thèmes / overlays / ep-cards / lecteur vidéo
document.addEventListener('DOMContentLoaded', () => {
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const overlay = $('#overlay');
  const overlayInner = $('#overlay-inner');
  const overlayContent = $('#overlay-content');
  const overlayClose = $('#overlay-close');

  const newsBtn = $('#btn-news');
  const newsBadge = $('#news-badge');

  const ovalLearn = $('#oval-learn');
  const themeToggle = $('#theme-toggle');
  const THEME_KEY = 'brad_theme_pref';
  // Nouveau comportement du badge : clé simple boolean
  const NEWS_SEEN_KEY = 'brad_news_seen';

  /* NEWS badge logic (simple + robuste) */
  function refreshNewsBadge() {
    try {
      if (!newsBadge) return;
      const seen = localStorage.getItem(NEWS_SEEN_KEY);
      // Si jamais vu = 'true' -> cacher, sinon afficher (première visite ou réinitialisation)
      newsBadge.hidden = (seen === 'true');
    } catch (e) {
      // si localStorage indisponible, afficher par précaution
      if (newsBadge) newsBadge.hidden = true;
    }
  }

  function markNewsRead() {
    try {
      localStorage.setItem(NEWS_SEEN_KEY, 'true');
    } catch (e) { /* ignore */ }
    if (newsBadge) newsBadge.hidden = true;
  }

  // utilitaire pour réactiver le badge (tests / mise à jour manuelle)
  window.__brad_resetNews = () => {
    try { localStorage.removeItem(NEWS_SEEN_KEY); } catch (e) {}
    refreshNewsBadge();
    console.log('Badge "Nouveautés" réactivé (localStorage supprimé).');
  };

  // initialise le badge au chargement
  refreshNewsBadge();

  // click handlers
  if (newsBtn) {
    newsBtn.addEventListener('click', () => {
      markNewsRead();
      openPanel('news');
    });
  }
  if (newsBadge) {
    newsBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      markNewsRead();
    });
  }

  // Panels content (welcome = en savoir plus)
  const PANELS = {
    welcome: `
      <h2>En savoir plus</h2>
      <p> Ce site rassemble tout ce qui gravite autour de Brad Bitt : les expériences interactives, les épisodes, les musiques et les éléments de récit qui donnent vie à ce monde.</p>

      <p>Vous pouvez y découvrir le futur jeu et son univers, suivre les aventures de Brad à travers de courts épisodes, et explorer peu à peu l’histoire qui se dessine en arrière-plan.</p>

      <p>Certains contenus sont déjà accessibles, d’autres arriveront progressivement. L’idée est simple : offrir un point d’entrée clair pour explorer, comprendre et suivre l’évolution du projet.</p>

      <p>Utilisez les boutons « Découvrir » et « Voir » pour naviguer librement entre les contenus.</p>
    `,
    news: `
      <h2>Nouveautés</h2>
      <p>C’est ici que vous trouverez les dernières mises à jour du site et des contenus ajoutés récemment.</p>
    `,
    game: `
      <h2>Brad Bitt — Le jeu</h2>
      <p>Aperçu du jeu, mécaniques et notes de développement.</p>
    `
  };

  /* Overlay open/close + video player injection */
  let lastFocused = null;
  function openPanel(key, options = {}) {
    if (!overlay || !overlayContent || !overlayInner) return;
    const html = PANELS[key] || (options.html || `<p>Contenu à venir</p>`);
    overlayContent.innerHTML = html;
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    lastFocused = document.activeElement;
    document.body.style.overflow = 'hidden';
    overlayInner.focus();

    // If opening news panel, mark news as read
    if (key === 'news') markNewsRead();
  }
  function closePanel() {
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    // stop embedded video by clearing content
    if (overlayContent) overlayContent.innerHTML = '';
  }
  if (overlayClose) overlayClose.addEventListener('click', closePanel);
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) closePanel(); });

  /* open 'welcome' from the oval button (En savoir plus) */
  if (ovalLearn) {
    ovalLearn.addEventListener('click', () => openPanel('welcome'));
  }

  /* ep-card flip & visionner handler */
  $$('.ep-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      card.classList.toggle('flipped');
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        card.classList.toggle('flipped');
        e.preventDefault();
      }
    });
  });

  // handle Visionner / Voir button clicks (delegated)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-visionner');
    if (!btn) return;
    const videoId = btn.getAttribute('data-video') || btn.closest('.ep-card')?.getAttribute('data-video');
    if (!videoId) {
      openPanel(null, { html: '<p>Vidéo indisponible.</p>' });
      return;
    }
    const playerHtml = `
      <h2>Lecture</h2>
      <div class="video-wrap">
        <iframe src="https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1" 
                title="Vidéo" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
      </div>
      <p style="margin-top:12px;color:var(--muted)">Fermez la fenêtre pour revenir au site.</p>
    `;
    openPanel(null, { html: playerHtml });
  });

  /* Theme: robuste + logo switching (folder 'images') */
  const logoImg = document.getElementById('site-logo');

  // Mapping explicite : light -> use 'sombre' logo, dark -> use 'clair' logo
  function updateLogoForTheme(pref) {
    if (!logoImg) return;

    if (pref === 'light') {
      // light theme => use the dark (sombre) logo for contrast
      logoImg.src = 'images/logo bb site clair.png';
    } else if (pref === 'dark') {
      // dark theme => use the light (clair) logo for contrast
      logoImg.src = 'images/logo bb site sombre.png';
    } else {
      // auto: pick according to prefers-color-scheme and apply same mapping
      const mm = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
      const isLight = mm ? mm.matches : true;
      logoImg.src = isLight
        ? 'images/logo bb site clair.png'
        : 'images/logo bb site sombre.png';
    }
  }

  function applyTheme(pref = 'auto', save = false) {
    try {
      const root = document.documentElement;

      if (pref === 'light') {
        root.setAttribute('data-theme', 'light');
      } else if (pref === 'dark') {
        root.removeAttribute('data-theme');
      } else {
        // auto
        const mm = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
        const isLight = mm ? mm.matches : true;
        if (isLight) root.setAttribute('data-theme', 'light');
        else root.removeAttribute('data-theme');
      }

      // update toggle visuals
      if (themeToggle) {
        themeToggle.classList.remove('is-light','is-dark');
        if (pref === 'light') themeToggle.classList.add('is-light');
        else if (pref === 'dark') themeToggle.classList.add('is-dark');
        // title
        const title = pref === 'auto' ? 'Mode : automatique' : (pref === 'light' ? 'Mode : clair' : 'Mode : sombre');
        themeToggle.setAttribute('title', title);
        themeToggle.setAttribute('aria-label', title);
      }

      // update logo according to mapping requested
      updateLogoForTheme(pref);

      if (save) {
        try { localStorage.setItem(THEME_KEY, pref); } catch(e) {}
      }
    } catch (e) { /* ignore */ }
  }

  // initial read + apply
  try {
    const saved = localStorage.getItem(THEME_KEY) || 'auto';
    applyTheme(saved, false);
  } catch(e){ applyTheme('auto', false); }

  // cycle through modes on click: auto -> light -> dark -> auto
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = localStorage.getItem(THEME_KEY) || 'auto';
      const order = ['auto','light','dark'];
      const next = order[(order.indexOf(current) + 1) % order.length];
      applyTheme(next, true);
    });
  }

  /* --- Reveal elements on load --- */
  (function revealOnLoad() {
    const reveals = $$('.reveal');
    if (!reveals.length) return;
    reveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 80 * i);
    });
  })();

});
