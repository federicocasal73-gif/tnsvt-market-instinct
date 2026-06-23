/* TNSVT Market Instinct — Módulo FCM Push Notifications
 * Usa Capacitor PushNotifications plugin.
 * Registra token en backend Symfony (tnsvt-symfony).
 */
(function (global) {
  'use strict';

  const API = global.TNSVT_API;

  // ============================================================
  // INIT
  // ============================================================
  async function init() {
    if (!global.Capacitor || !global.Capacitor.Plugins) {
      console.log('[FCM] No Capacitor, push deshabilitado');
      return;
    }
    const Push = global.Capacitor.Plugins.PushNotifications;
    if (!Push) {
      console.log('[FCM] Push plugin no instalado');
      return;
    }

    // 1. Pedir permisos
    let permStatus = await Push.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await Push.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
      console.warn('[FCM] Permiso denegado');
      return;
    }

    // 2. Registrar para push
    await Push.register();

    // 3. Listeners
    Push.addListener('registration', onRegistration);
    Push.addListener('registrationError', onRegistrationError);
    Push.addListener('pushNotificationReceived', onPushReceived);
    Push.addListener('pushNotificationActionPerformed', onPushAction);

    console.log('[FCM] Inicializado correctamente');
  }

  // ============================================================
  // HANDLERS
  // ============================================================
  async function onRegistration(token) {
    console.log('[FCM] Token recibido:', token.value);
    try {
      localStorage.setItem('tnsvt_fcm_token', token.value);
    } catch (e) {}

    if (API.isLogged()) {
      try {
        await API.request('/api/auth/device/register', {
          method: 'POST',
          body: JSON.stringify({
            fcm_token: token.value,
            platform: 'android',
            app: 'market_instinct',
          }),
        });
        console.log('[FCM] Token registrado en backend');
      } catch (e) {
        console.error('[FCM] Error registrando token:', e);
      }
    }
  }

  function onRegistrationError(error) {
    console.error('[FCM] Registration error:', error);
  }

  function onPushReceived(notification) {
    console.log('[FCM] Push recibido:', notification);
    const data = notification.notification.data || {};
    showInAppBanner(notification.notification.title, notification.notification.body, data);
  }

  function onPushAction(notification) {
    console.log('[FCM] Push action:', notification);
    const data = notification.notification.data || {};
    handleNotificationData(data);
  }

  // ============================================================
  // IN-APP BANNER (cuando llega push con app en foreground)
  // ============================================================
  function showInAppBanner(title, body, data) {
    const banner = document.createElement('div');
    banner.style.cssText = [
      'position:fixed',
      'top:60px',
      'left:16px',
      'right:16px',
      'background:var(--panel2)',
      'border:1px solid var(--violet)',
      'border-radius:12px',
      'padding:14px 16px',
      'box-shadow:0 8px 32px rgba(0,0,0,.5)',
      'z-index:999',
      'cursor:pointer',
      'animation:slide-down .3s ease',
    ].join(';');

    banner.innerHTML =
      '<div style="display:flex;align-items:flex-start;gap:10px">' +
        '<div style="font-size:24px">🔔</div>' +
        '<div style="flex:1">' +
          '<div style="font-weight:700;font-size:14px;color:var(--violet3)">' + escapeHtml(title) + '</div>' +
          '<div style="font-size:12px;color:var(--text2);margin-top:3px">' + escapeHtml(body) + '</div>' +
        '</div>' +
        '<div style="color:var(--text3);font-size:18px;cursor:pointer" onclick="this.parentElement.parentElement.remove()">✕</div>' +
      '</div>';

    banner.onclick = (e) => {
      if (e.target.tagName !== 'DIV' || !e.target.textContent.includes('✕')) {
        handleNotificationData(data);
        banner.remove();
      }
    };

    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 6000);
  }

  // ============================================================
  // ACCIONES POR TIPO DE NOTIFICACIÓN
  // ============================================================
  function handleNotificationData(data) {
    const type = data.type;
    switch (type) {
      case 'tournament_invite':
        if (data.tournament_id && global.TNSVT_Torneos) {
          global.TNSVT_Torneos.open(data.tournament_id);
        }
        break;
      case 'tournament_starting':
        if (data.tournament_id && global.TNSVT_Torneos) {
          global.TNSVT_Torneos.open(data.tournament_id);
        }
        break;
      case 'leaderboard_rank':
        if (typeof goScreen === 'function') goScreen('s-leaderboard');
        break;
      case 'wallet_credit':
        if (typeof goScreen === 'function') goScreen('s-perfil');
        if (global.TNSVT_Wallet) global.TNSVT_Wallet.userSync();
        break;
      case 'promo':
        if (typeof goScreen === 'function') goScreen('s-torneos');
        break;
      default:
        if (typeof goScreen === 'function') goScreen('s-inicio');
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  // ============================================================
  // EXPORTS
  // ============================================================
  global.TNSVT_FCM = {
    init,
  };
})(typeof window !== 'undefined' ? window : globalThis);