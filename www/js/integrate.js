/* TNSVT Market Instinct — Integration Layer (v2 - JWT + Enhanced)
 * Capa adicional que coexiste con el código existente (TNSVT_CONFIG).
 * Agrega: auth JWT, deep-link de pagos, claim tokens, sync offline.
 *
 * Se inicializa DESPUÉS de los scripts existentes.
 */
(function (global) {
  'use strict';

  // ============================================================
  // ESPERAR A QUE EL DOM ESTÉ LISTO
  // ============================================================
  function whenReady(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      cb();
    }
  }

  whenReady(function () {
    try {
      // 1. Configurar base URL de la API desde TNSVT_CONFIG si existe
      if (global.TNSVT_CONFIG && global.TNSVT_CONFIG.serverUrl) {
        global.TNSVT_API.setBaseUrl(global.TNSVT_CONFIG.serverUrl);
        console.log('[TNSVT-v2] API base:', global.TNSVT_CONFIG.serverUrl);
      }

      // 2. Si ya hay un game code en TNSVT_CONFIG, intentar login automático
      //    (no rompe nada; simplemente pre-carga el usuario)
      if (global.TNSVT_CONFIG && global.TNSVT_CONFIG.code && global.TNSVT_API) {
        console.log('[TNSVT-v2] Game code detectado:', global.TNSVT_CONFIG.code);
      }

      // 3. Inicializar handler de deep links para pagos
      if (global.TNSVT_Pagos && typeof global.TNSVT_Pagos.init === 'function') {
        global.TNSVT_Pagos.init();
        console.log('[TNSVT-v2] Deep link handler activo');
      }

      // 4. Inicializar FCM push (no rompe el existente)
      if (global.TNSVT_FCM && typeof global.TNSVT_FCM.init === 'function') {
        setTimeout(() => {
          global.TNSVT_FCM.init().catch(e =>
            console.warn('[TNSVT-v2] FCM init:', e.message)
          );
        }, 2000);
      }

      // 5. Inicializar auto-sync de wallet
      if (global.TNSVT_Wallet && typeof global.TNSVT_Wallet.initAutoSync === 'function') {
        global.TNSVT_Wallet.initAutoSync();
      }

      // 6. Agregar botón "Torneos" en la nav-bar si existe
      injectTorneosButton();

      // 7. Hookear la pantalla de torneos existente para usar el nuevo módulo
      hookTorneosScreen();

      console.log('[TNSVT-v2] Integration layer v2 cargada');
    } catch (e) {
      console.error('[TNSVT-v2] Init error:', e);
    }
  });

  // ============================================================
  // INJECT BOTÓN "TORNEOS" EN NAV (si hay espacio)
  // ============================================================
  function injectTorneosButton() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    // Solo agregar si no existe ya un botón "torneos"
    if (document.getElementById('nav-btn-torneos')) return;

    // Buscar un slot libre o agregar al final
    const btn = document.createElement('button');
    btn.id = 'nav-btn-torneos';
    btn.className = 'nav-btn';
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>' +
        '<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>' +
        '<path d="M4 22h16"/>' +
        '<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>' +
        '<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>' +
        '<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>' +
      '</svg>' +
      '<span>Torneos</span>';

    btn.onclick = () => {
      if (typeof goScreen === 'function') goScreen('s-torneos');
    };

    // Insertar antes del último botón (que suele ser perfil/settings)
    const lastBtn = nav.children[nav.children.length - 1];
    nav.insertBefore(btn, lastBtn);
  }

  // ============================================================
  // HOOK A LA PANTALLA DE TORNEOS EXISTENTE
  // ============================================================
  function hookTorneosScreen() {
    // La pantalla s-torneos ya existe (línea 1262 del index.html).
    // Agregamos un banner en la parte superior si el usuario está logueado vía JWT
    // para mostrar balance sincronizado.

    const screen = document.getElementById('s-torneos');
    if (!screen || !global.TNSVT_Wallet) return;

    // Observar cuando se muestra esta pantalla
    const observer = new MutationObserver(() => {
      if (screen.classList.contains('active')) {
        // Inyectar banner de sync al inicio si no está
        if (!document.getElementById('tnsvt-v2-sync-banner') && global.TNSVT_API.isLogged()) {
          const banner = document.createElement('div');
          banner.id = 'tnsvt-v2-sync-banner';
          banner.style.cssText = 'padding:12px 16px;background:var(--panel2);border-bottom:1px solid var(--border)';
          const container = document.createElement('div');
          banner.appendChild(container);
          screen.insertBefore(banner, screen.firstChild);
          global.TNSVT_Wallet.renderSyncCard(container);
        }
      }
    });
    observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
  }
})(typeof window !== 'undefined' ? window : globalThis);