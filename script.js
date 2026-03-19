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

  // ← Incrémente cette valeur à chaque nouvelle MàJ pour réafficher le badge
  const NEWS_VERSION = '1.2';
  const NEWS_SEEN_KEY = 'brad_news_seen_v';

  /* NEWS badge logic */
  function refreshNewsBadge() {
    if (!newsBadge) return;
    const seen = localStorage.getItem(NEWS_SEEN_KEY);
    if (seen === NEWS_VERSION) {
      newsBadge.hidden = true;
    } else {
      newsBadge.hidden = false;
    }
  }

  function markNewsRead() {
    if (newsBadge) {
      newsBadge.hidden = true;
      localStorage.setItem(NEWS_SEEN_KEY, NEWS_VERSION);
    }
  }

  // initialize badge
  refreshNewsBadge();

  // --- NEWS history data ---
  const NEWS_HISTORY = [
    {
      version: '1.2',
      date: '04-04-2026',
      teaser: 'Cette mise à jour améliore l\'expérience générale du site avec des ajustements visuels et interactifs pensés pour une navigation plus naturelle et plus lisible.',
      detailHtml: `<p>Le mode de thème affiche désormais l'indication « auto » lors de la première visite ou lorsqu'il est actif. L'interface mobile a été optimisée avec un logo mieux adapté aux téléphones, et une animation met en évidence l'interactivité des cartes. Le comportement du badge de "nouveautés" a également été corrigé pour une utilisation plus intuitive. Enfin, le site dispose maintenant d'une icône dédiée lors de l'ajout en favori ou sur l'écran d'accueil.</p>`
    },
    {
      version: '1.1',
      date: '14-02-2026',
      teaser: 'Cette mise à jour apporte plusieurs améliorations importantes pour rendre l\'expérience plus claire, plus moderne et plus agréable à utiliser.',
      detailHtml: `<p>Amélioration de la rubrique "Nouveautés", avec un affichage plus clair des versions. Correction du badge « 1 », qui disparaît désormais lorsqu'il est consulté. Ajout d'un bouton "Suivi du jeu" dans la section "Brad Bitt, mais le jeu" pour accéder directement au développement du projet. Optimisation générale de l'interface sur ordinateur.</p>`
    },
    {
      version: '1.0',
      date: '14-01-2026',
      teaser: 'Lancement initial du site.',
      detailHtml: `<p>Première version publique contenant la page principale, les cartes Episodes/Musiques/Lore et le lecteur intégré pour les épisodes.</p>`
    }
  ];

  // Panels content
  const PANELS = {
    welcome: `
      <h2>En savoir plus</h2>
      <p>Ce site rassemble tout ce qui gravite autour de Brad Bitt : les expériences interactives, les épisodes, les ambiances sonores et les éléments de récit qui donnent vie à ce monde.</p>
      <p>Vous pouvez y découvrir le futur jeu et son univers, suivre les aventures de Brad à travers de courts épisodes, et explorer peu à peu l'histoire qui se dessine en arrière-plan.</p>
      <p>Certains contenus sont déjà accessibles, d'autres arriveront progressivement. L'idée est simple : offrir un point d'entrée clair pour explorer, comprendre et suivre l'évolution du projet.</p>
      <p>Utilisez les boutons « Découvrir » et « Voir » pour naviguer librement entre les contenus.</p>
    `
  };

  function buildNewsHtml() {
    const items = NEWS_HISTORY.map((n, idx) => `
      <article class="news-card" tabindex="0" data-index="${idx}" aria-expanded="false">
        <div class="meta">
          <div class="version">v${n.version}</div>
          <div class="date">${n.date}</div>
        </div>
        <div class="teaser">${n.teaser}</div>
        <div class="detail">${n.detailHtml}</div>
      </article>
    `).join('');
    return `<h2>Nouveautés</h2><div class="news-list">${items}</div>`;
  }

  function attachNewsHandlers() {
    const cards = Array.from(overlayContent.querySelectorAll('.news-card'));
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const expanded = card.classList.toggle('expanded');
        card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const expanded = card.classList.toggle('expanded');
          card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        }
      });
    });
  }

  /* Overlay open/close */
  let lastFocused = null;
  function openPanel(key, options = {}) {
    if (!overlay || !overlayContent || !overlayInner) return;
    let html;
    if (key === 'news') {
      html = buildNewsHtml();
    } else {
      html = (PANELS[key] || (options.html || `<p>Contenu à venir</p>`));
    }
    overlayContent.innerHTML = html;
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    lastFocused = document.activeElement;
    document.body.style.overflow = 'hidden';
    overlayInner.focus();
    if (key === 'news') {
      markNewsRead();
      requestAnimationFrame(() => attachNewsHandlers());
    }
  }

  function closePanel() {
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    if (overlayContent) overlayContent.innerHTML = '';
  }

  if (overlayClose) overlayClose.addEventListener('click', closePanel);
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) closePanel(); });

  if (ovalLearn) {
    ovalLearn.addEventListener('click', () => openPanel('welcome'));
  }

  /* ep-card flip */
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

  // Visionner button
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

  /* Theme */
  const logoImg = document.getElementById('site-logo');

  function updateLogoForTheme(pref) {
    if (!logoImg) return;
    if (pref === 'light') {
      logoImg.src = 'images/logo bb site clair.png';
    } else if (pref === 'dark') {
      logoImg.src = 'images/logo bb site sombre.png';
    } else {
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
        const mm = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
        const isLight = mm ? mm.matches : true;
        if (isLight) root.setAttribute('data-theme', 'light');
        else root.removeAttribute('data-theme');
      }
      if (themeToggle) {
        themeToggle.classList.remove('is-light','is-dark');
        if (pref === 'light') themeToggle.classList.add('is-light');
        else if (pref === 'dark') themeToggle.classList.add('is-dark');
        const title = pref === 'auto' ? 'Mode : automatique' : (pref === 'light' ? 'Mode : clair' : 'Mode : sombre');
        themeToggle.setAttribute('title', title);
        themeToggle.setAttribute('aria-label', title);
        const modeLabel = document.getElementById('theme-mode-label');
        if (modeLabel) {
          if (pref === 'auto') {
            modeLabel.textContent = 'auto';
            modeLabel.offsetHeight;
            modeLabel.classList.add('visible');
          } else {
            modeLabel.classList.remove('visible');
          }
        }
      }
      updateLogoForTheme(pref);
      if (save) {
        try { localStorage.setItem(THEME_KEY, pref); } catch(e) {}
      }
    } catch (e) {}
  }

  try {
    const saved = localStorage.getItem(THEME_KEY) || 'auto';
    applyTheme(saved, false);
  } catch(e){ applyTheme('auto', false); }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = localStorage.getItem(THEME_KEY) || 'auto';
      const order = ['auto','light','dark'];
      const next = order[(order.indexOf(current) + 1) % order.length];
      applyTheme(next, true);
    });
  }

  /* Reveal on load */
  (function revealOnLoad() {
    const reveals = $$('.reveal');
    if (!reveals.length) return;
    reveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 80 * i);
    });
  })();

  /* Auto-flip first episode card */
  (function autoFlipFirstCard() {
    const firstCard = document.querySelector('.ep-card');
    if (!firstCard) return;
    setTimeout(() => {
      firstCard.classList.add('flipped');
      setTimeout(() => {
        firstCard.classList.remove('flipped');
      }, 600);
    }, 500);
  })();

  /* News button */
  if (newsBtn) {
    newsBtn.addEventListener('click', () => {
      markNewsRead();
      openPanel('news');
    });
  }
  if (newsBadge) {
    newsBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      markNewsRead();
      openPanel('news');
    });
  }

});
