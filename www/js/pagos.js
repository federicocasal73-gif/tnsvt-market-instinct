/* TNSVT Market Instinct — Módulo de Pagos
 * Abre checkout en navegador externo (deep-link), maneja retorno vía tnsvt://.
 * Métodos: Mercado Pago, Binance Pay, Crypto (NOWPayments).
 */
(function (global) {
  'use strict';

  const API = global.TNSVT_API;

  // ============================================================
  // STATE
  // ============================================================
  let pendingTournamentId = null;
  let pendingClaimToken   = null;

  // ============================================================
  // DETECTAR RETORNO DE PAGO (deep link)
  // ============================================================
  function initDeepLinkHandler() {
    // Capacitor App plugin (si está disponible)
    if (global.Capacitor && global.Capacitor.Plugins && global.Capacitor.Plugins.App) {
      global.Capacitor.Plugins.App.addListener('appUrlOpen', (event) => {
        handleDeepLink(event.url);
      });
    }

    // Fallback: detectar query string en carga inicial
    const search = window.location.search || '';
    if (search.includes('payment-success') || search.includes('tnsvt_payment=')) {
      const params = new URLSearchParams(search);
      const token = params.get('tnsvt_payment') || params.get('token');
      if (token) handleClaimToken(token);
    }

    // Visibilidad: si el usuario vuelve a la app
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && pendingTournamentId) {
        checkPaymentStatus();
      }
    });
  }

  async function handleDeepLink(url) {
    console.log('[Pagos] deep link recibido:', url);
    try {
      const u = new URL(url);
      if (u.protocol === 'tnsvt:' || url.includes('payment')) {
        const token = u.searchParams.get('token') || u.searchParams.get('tnsvt_payment');
        if (token) {
          await handleClaimToken(token);
        }
      }
    } catch (e) {
      console.error('[Pagos] deep link error:', e);
    }
  }

  async function handleClaimToken(token) {
    pendingClaimToken = token;
    try {
      const data = await API.Payments.claim(token);
      if (data && data.success) {
        showSuccess(data.tournament || {});
        pendingTournamentId = data.tournament && data.tournament.id;
      } else {
        showFailure(data && data.error || 'Pago no confirmado');
      }
    } catch (e) {
      showFailure(e.message);
    } finally {
      pendingClaimToken = null;
    }
  }

  async function checkPaymentStatus() {
    // Si hay un pago pendiente, consultar al backend
    try {
      const pendKey = 'tnsvt_pending_payment';
      const pend = localStorage.getItem(pendKey);
      if (!pend) return;
      const { token, tournament_id, ts } = JSON.parse(pend);
      // Si pasaron más de 30 min, descartar
      if (Date.now() - ts > 30 * 60 * 1000) {
        localStorage.removeItem(pendKey);
        return;
      }
      await handleClaimToken(token);
      localStorage.removeItem(pendKey);
    } catch (e) {}
  }

  // ============================================================
  // ABRIR CHECKOUT (navegador externo)
  // ============================================================
  async function openCheckout(tournamentId) {
    if (!API.isLogged()) {
      toast('Iniciá sesión para pagar', 'warn');
      if (typeof openLoginModal === 'function') openLoginModal();
      return;
    }

    pendingTournamentId = tournamentId;

    // Modal: elegir método
    const screen = ensureScreen('s-pago');
    if (screen) {
      screen.innerHTML =
        '<div style="padding:16px;background:var(--panel2);border-bottom:1px solid var(--border)">' +
          '<button class="btn btn-ghost btn-sm" onclick="goScreen(\'s-torneo\')" style="margin-bottom:12px">← Volver</button>' +
          '<div style="font-family:Cinzel,serif;font-size:18px;font-weight:700;color:var(--gold)">' +
            '💳 Elegí método de pago' +
          '</div>' +
        '</div>' +
        '<div style="padding:16px;display:flex;flex-direction:column;gap:12px">' +
          methodCard('mercadopago', '💳', 'Mercado Pago',
            'Tarjeta · Dinero en cuenta · Rapipago',
            'Comisión ~6% · Acreditación inmediata') +
          methodCard('binance', '₿', 'Binance Pay',
            'Pago con USDT desde tu wallet Binance',
            'Comisión 0% · Acreditación < 5 min') +
          methodCard('crypto', '🪙', 'Cripto (USDT/BTC/ETH)',
            'NOWPayments · 200+ monedas',
            'Comisión ~0.5% · Sin KYC') +
        '</div>' +
        '<div style="padding:0 16px 24px;text-align:center;font-size:11px;color:var(--text3)">' +
          '🔒 Pago seguro procesado fuera de la app (cumple Google Play Store policies)' +
        '</div>';

      if (typeof goScreen === 'function') goScreen('s-pago');
    }
  }

  function methodCard(method, icon, name, desc, fee) {
    return (
      '<div class="card" style="cursor:pointer;display:flex;align-items:center;gap:14px" ' +
           'onclick="TNSVT_Pagos.payWith(\'' + method + '\',' + pendingTournamentId + ')">' +
        '<div style="font-size:36px;flex-shrink:0">' + icon + '</div>' +
        '<div style="flex:1">' +
          '<div style="font-weight:700;font-size:15px;margin-bottom:3px">' + name + '</div>' +
          '<div style="font-size:12px;color:var(--text2);margin-bottom:4px">' + desc + '</div>' +
          '<div style="font-size:10px;color:var(--gold)">' + fee + '</div>' +
        '</div>' +
        '<div style="font-size:18px;color:var(--text3)">›</div>' +
      '</div>'
    );
  }

  async function payWith(method, tournamentId) {
    try {
      const data = await API.Payments.createCheckout(tournamentId, method, 'app');

      if (!data || !data.checkout_url) {
        toast('Error: no se pudo crear el checkout', 'err');
        return;
      }

      // Guardar referencia para cuando vuelva a la app
      try {
        localStorage.setItem('tnsvt_pending_payment', JSON.stringify({
          tournament_id: tournamentId,
          token: data.claim_token || null,
          ts: Date.now(),
        }));
      } catch (e) {}

      // Abrir navegador externo (deep link cumple Google Play policy)
      openExternalBrowser(data.checkout_url);
    } catch (e) {
      toast('Error iniciando pago: ' + e.message, 'err');
    }
  }

  function openExternalBrowser(url) {
    if (global.Capacitor && global.Capacitor.Plugins && global.Capacitor.Plugins.Browser) {
      // Capacitor: abre Chrome/Safari externo
      global.Capacitor.Plugins.Browser.open({
        url: url,
        windowName: '_system',
      }).catch(err => {
        console.error('[Pagos] Browser.open error:', err);
        // Fallback: window.open
        window.open(url, '_system');
      });
    } else {
      // Web fallback
      window.open(url, '_blank');
    }
  }

  // ============================================================
  // SUCCESS / FAILURE OVERLAYS
  // ============================================================
  function showSuccess(tournament) {
    const overlay = document.createElement('div');
    overlay.className = 'result-overlay';
    overlay.innerHTML =
      '<div class="result-emoji" style="color:var(--green)">🎉</div>' +
      '<div class="result-title">¡Pago confirmado!</div>' +
      '<div class="result-subtitle">Estás inscripto en ' + escapeHtml(tournament.name || 'el torneo') + '</div>' +
      '<div class="result-stats">' +
        '<div class="rs-item"><div class="rs-val">' + (tournament.entries || 1) + '</div><div class="rs-lbl">Jugadores</div></div>' +
        '<div class="rs-item"><div class="rs-val">$' + fmt(tournament.entry_fee || 0) + '</div><div class="rs-lbl">Pagado</div></div>' +
      '</div>' +
      '<button class="btn btn-primary btn-lg" onclick="TNSVT_Pagos.goToTournament(' + (tournament.id || 0) + ')">' +
        'Ver Torneo' +
      '</button>' +
      '<button class="btn btn-ghost" onclick="TNSVT_Pagos.dismissOverlay()">Volver al Inicio</button>';
    document.body.appendChild(overlay);
  }

  function showFailure(msg) {
    const overlay = document.createElement('div');
    overlay.className = 'result-overlay';
    overlay.innerHTML =
      '<div class="result-emoji" style="color:var(--red)">⚠️</div>' +
      '<div class="result-title">Pago no completado</div>' +
      '<div class="result-subtitle">' + escapeHtml(msg) + '</div>' +
      '<button class="btn btn-ghost" onclick="TNSVT_Pagos.dismissOverlay()">Cerrar</button>';
    document.body.appendChild(overlay);
  }

  function dismissOverlay() {
    document.querySelectorAll('.result-overlay').forEach(o => o.remove());
    if (typeof goScreen === 'function') goScreen('s-inicio');
  }

  function goToTournament(id) {
    document.querySelectorAll('.result-overlay').forEach(o => o.remove());
    if (id && global.TNSVT_Torneos) global.TNSVT_Torneos.open(id);
  }

  // ============================================================
  // HELPERS
  // ============================================================
  function fmt(n, d = 2) {
    return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function ensureScreen(id) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.className = 'screen';
      el.id = id;
      const app = document.getElementById('app');
      if (app) app.appendChild(el);
    }
    return el;
  }

  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind);
    else console.log('[toast]', msg);
  }

  // ============================================================
  // EXPORTS
  // ============================================================
  global.TNSVT_Pagos = {
    init: initDeepLinkHandler,
    openCheckout,
    payWith,
    showSuccess,
    showFailure,
    dismissOverlay,
    goToTournament,
  };
})(typeof window !== 'undefined' ? window : globalThis);