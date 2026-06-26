/**
 * router.js — Navigation router with history, a11y & template cloning (MIG 4)
 */
window.Router = {
  current: null,
  history: [],
  navMap: {'s-inicio':'nav-inicio','s-modos':'nav-modos','s-liga':'nav-liga','s-perfil':'nav-perfil'},

  _ensureScreen(id) {
    var el = document.getElementById(id);
    if (el) return el;
    var tmpl = document.getElementById('tmpl-' + id);
    if (!tmpl) return null;
    var clone = tmpl.content.cloneNode(true);
    document.getElementById('app').appendChild(clone);
    return document.getElementById(id);
  },

  _runScreenInit(id) {
    if (id === 's-liga')      { if (window.initLiga)      initLiga(); }
    else if (id === 's-modos') { if (window.initModos)    initModos(); }
    else if (id === 's-misiones') { if (window.initMisiones) initMisiones(); }
    else if (id === 's-perfil') { if (window.initPerfil)  initPerfil(); }
    else if (id === 's-historico') { if (window.initHist) initHist(); }
    else if (id === 's-portfolio') { if (window.initPortfolio) initPortfolio(); }
    else if (id === 's-daily')  { if (window.initDaily)   initDaily(); }
    else if (id === 's-arena')  { if (window.initArena)   initArena(); }
    else if (id === 's-glosario') { if (window.initGlosario) initGlosario(); }
    else if (id === 's-fractal') {
      var fl = document.getElementById('fractal-lobby');
      var fg = document.getElementById('fractal-game');
      if (fl) fl.style.display = 'block';
      if (fg) fg.style.display = 'none';
    }
    else if (id === 's-torneos') {
      var tl = document.getElementById('torneo-lobby');
      var tg = document.getElementById('torneo-game');
      if (tl) tl.style.display = '';
      if (tg) tg.style.display = 'none';
      if (typeof loadActiveTorneos === 'function') loadActiveTorneos();
      var abtn = document.getElementById('admin-torneo-btn');
      if (abtn) abtn.style.display = (TNSVT_CONFIG.enabled && TNSVT_CONFIG.adminPassword) ? 'flex' : 'none';
      var rbtn = document.getElementById('btn-resume-torneo');
      if (rbtn) rbtn.style.display = (typeof torneoState !== 'undefined' && torneoState.active) ? 'block' : 'none';
    }
  },

  navigate(id, opts) {
    if (!id || typeof id !== 'string' || !id.startsWith('s-')) return;

    this.current = id;
    if (!opts || !opts.replace) this.history.push(id);

    // hide all
    document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });

    // ensure target screen exists (clone from template if first time)
    var el = this._ensureScreen(id);

    // show target
    if (el) el.classList.add('active');
    STATE.screen = id;

    // nav highlight
    document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
    if (this.navMap[id]) {
      var navEl = document.getElementById(this.navMap[id]);
      if (navEl) navEl.classList.add('active');
    }

    // screen init
    this._runScreenInit(id);

    // apply i18n translations to cloned template
    if (window.applyI18n) setTimeout(applyI18n, 0);

    // refresh nav badges
    if (window.updateNavBadges) setTimeout(updateNavBadges, 0);

    // post-init
    if (window.applyPro3DClass) setTimeout(applyPro3DClass, 50);
    // Stop coverflow auto-rotation when leaving s-inicio; setupCoverflow re-starts it when entering
    if (id !== 's-inicio' && window.stopCoverflowAuto) stopCoverflowAuto();
    if (id === 's-inicio' && window.setupCoverflow) setTimeout(setupCoverflow, 80);
    // Home-specific renderers
    if (id === 's-inicio') {
      if (window.renderDayStreakHome) setTimeout(renderDayStreakHome, 30);
      if (window.renderHomeAchievements) setTimeout(renderHomeAchievements, 40);
    }

    // a11y
    var announcer = document.getElementById('a11y-announcer');
    if (announcer) {
      var label = (el && el.querySelector('[data-i18n]') ? el.querySelector('[data-i18n]').textContent : id.replace('s-','').replace(/-/g,' ')).trim();
      announcer.textContent = 'Pantalla: ' + label;
    }
    window.scrollTo({top:0});
  },

  back() {
    if (this.history.length > 1) {
      this.history.pop(); // current
      var prev = this.history[this.history.length - 1];
      this.navigate(prev, {replace: true});
    }
  },

  init(startScreen) {
    var self = this;
    window.goScreen = function(id, callback) {
      if (!id || typeof id !== 'string' || !id.startsWith('s-')) return;
      self.navigate(id);
      if (callback) callback();
      window.scrollTo({top:0});
    };
    document.addEventListener('click', function(e) {
      var link = e.target.closest('[data-nav]');
      if (link) { e.preventDefault(); window.goScreen(link.getAttribute('data-nav')); }
    });
    // Navigate to initial screen (cloned from template)
    var navResult = self.navigate(startScreen || 's-inicio');
    var dbg = document.getElementById('debug-diagnostics');
    if (dbg) {
      var afterEl = document.getElementById(startScreen || 's-inicio');
      dbg.textContent += '\\n[Router] init done. screen=' + (startScreen || 's-inicio') + ' found=' + (afterEl ? 'YES' : 'NULL');
    }
    console.log('[Router] Initialized');
  }
};
