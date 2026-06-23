/* TNSVT Market Instinct — Módulo Wallet Sync
 * Sincroniza balance y portfolio local con backend Symfony.
 * Estrategia: local-first, sync cuando hay red.
 */
(function (global) {
  'use strict';

  const API = global.TNSVT_API;

  // ============================================================
  // LOCAL STATE (localStorage)
  // ============================================================
  const KEYS = {
    balance:    'tnsvt_wallet_balance',
    holdings:   'tnsvt_wallet_holdings',
    lastSync:   'tnsvt_wallet_last_sync',
    syncStatus: 'tnsvt_wallet_sync_status', // 'idle' | 'pending' | 'synced' | 'error'
    txnCache:   'tnsvt_wallet_transactions',
  };

  function getLocal() {
    try {
      return {
        balance:  parseFloat(localStorage.getItem(KEYS.balance)) || 0,
        holdings: JSON.parse(localStorage.getItem(KEYS.holdings) || '[]'),
        lastSync: parseInt(localStorage.getItem(KEYS.lastSync) || '0'),
        syncStatus: localStorage.getItem(KEYS.syncStatus) || 'idle',
        transactions: JSON.parse(localStorage.getItem(KEYS.txnCache) || '[]'),
      };
    } catch (e) {
      return { balance: 0, holdings: [], lastSync: 0, syncStatus: 'idle', transactions: [] };
    }
  }

  function setLocal(state) {
    try {
      if (state.balance !== undefined)
        localStorage.setItem(KEYS.balance, String(state.balance));
      if (state.holdings !== undefined)
        localStorage.setItem(KEYS.holdings, JSON.stringify(state.holdings));
      if (state.lastSync !== undefined)
        localStorage.setItem(KEYS.lastSync, String(state.lastSync));
      if (state.syncStatus !== undefined)
        localStorage.setItem(KEYS.syncStatus, state.syncStatus);
      if (state.transactions !== undefined)
        localStorage.setItem(KEYS.txnCache, JSON.stringify(state.transactions));
    } catch (e) {}
  }

  // ============================================================
  // SYNC ONLINE
  // ============================================================
  async function sync(force = false) {
    if (!API.isLogged()) {
      return { ok: false, reason: 'not_logged_in' };
    }
    if (!navigator.onLine) {
      return { ok: false, reason: 'offline' };
    }

    const local = getLocal();
    if (!force && local.syncStatus === 'synced' && Date.now() - local.lastSync < 30000) {
      // Sync reciente, no repetir
      return { ok: true, cached: true };
    }

    setLocal({ syncStatus: 'pending' });

    try {
      // 1. Pull: traer estado actual del backend
      const remote = await API.Wallet.get();

      // 2. Push: enviar cambios locales si hay
      if (local.syncStatus === 'pending' || (Date.now() - local.lastSync) > 5*60*1000) {
        await API.syncWithBackend({
          balance: local.balance,
          holdings: local.holdings,
          lastSync: local.lastSync,
        });
      }

      // 3. Cachear transacciones remotas
      let txns = [];
      try {
        const tx = await API.Wallet.transactions(50);
        txns = tx.transactions || [];
      } catch (e) {}

      // 4. Actualizar local con datos remotos (server wins para balance final)
      setLocal({
        balance: remote.balance ?? local.balance,
        holdings: remote.holdings ?? local.holdings,
        lastSync: Date.now(),
        syncStatus: 'synced',
        transactions: txns,
      });

      return { ok: true, balance: remote.balance, holdings: remote.holdings };
    } catch (e) {
      setLocal({ syncStatus: 'error' });
      return { ok: false, reason: 'error', message: e.message };
    }
  }

  // ============================================================
  // MUTATIONS LOCALES (queue de cambios offline)
  // ============================================================
  const pendingChanges = [];

  function trackChange(type, payload) {
    pendingChanges.push({
      type,
      payload,
      ts: Date.now(),
    });
    setLocal({ syncStatus: 'pending' });
  }

  async function flushPendingChanges() {
    if (!API.isLogged() || !navigator.onLine) return;
    while (pendingChanges.length > 0) {
      const ch = pendingChanges.shift();
      try {
        switch (ch.type) {
          case 'trade':
            // Si hay endpoint específico, llamar; si no, batch sync
            break;
          case 'credit':
            await API.Wallet.sync({ credit: ch.payload });
            break;
        }
      } catch (e) {
        // Re-queue si falla
        pendingChanges.unshift(ch);
        break;
      }
    }
  }

  // ============================================================
  // UI HELPERS
  // ============================================================
  function getStatusBadge() {
    const s = getLocal().syncStatus;
    const map = {
      idle:    { icon: '○', text: 'Sin sincronizar', color: 'var(--text3)' },
      pending: { icon: '◐', text: 'Cambios pendientes', color: 'var(--gold)' },
      synced:  { icon: '●', text: 'Sincronizado', color: 'var(--green)' },
      error:   { icon: '⚠', text: 'Error de sync', color: 'var(--red)' },
    };
    return map[s] || map.idle;
  }

  function getLastSyncAgo() {
    const ts = getLocal().lastSync;
    if (!ts) return 'Nunca';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'hace ' + diff + 's';
    if (diff < 3600) return 'hace ' + Math.floor(diff/60) + 'm';
    if (diff < 86400) return 'hace ' + Math.floor(diff/3600) + 'h';
    return 'hace ' + Math.floor(diff/86400) + 'd';
  }

  async function renderSyncCard(container) {
    if (!container) return;
    const local = getLocal();
    const badge = getStatusBadge();

    let serverInfo = '';
    if (API.isLogged()) {
      try {
        const me = await API.Wallet.get();
        serverInfo =
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">' +
            '<div class="stat-box"><div class="stat-val">$' + fmt(local.balance) + '</div><div class="stat-lbl">Local</div></div>' +
            '<div class="stat-box"><div class="stat-val gold">$' + fmt(me.balance) + '</div><div class="stat-lbl">Server</div></div>' +
          '</div>';
      } catch (e) {
        serverInfo = '<div style="font-size:11px;color:var(--red);margin-top:8px">⚠️ No se pudo conectar</div>';
      }
    } else {
      serverInfo =
        '<div style="font-size:12px;color:var(--text3);margin-top:8px">Iniciá sesión para sincronizar</div>';
    }

    container.innerHTML =
      '<div class="card" style="margin-bottom:12px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div>' +
            '<div style="font-family:Cinzel,serif;font-size:14px;font-weight:700">🔄 Sync TNSVT</div>' +
            '<div style="font-size:11px;color:' + badge.color + ';margin-top:2px">' +
              badge.icon + ' ' + badge.text + ' · ' + getLastSyncAgo() +
            '</div>' +
          '</div>' +
          '<button class="btn btn-primary btn-sm" onclick="TNSVT_Wallet.userSync()">↻</button>' +
        '</div>' +
        serverInfo +
      '</div>';
  }

  function fmt(n, d = 2) {
    return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  // ============================================================
  // AUTO-SYNC
  // ============================================================
  function initAutoSync() {
    // Cada 60 seg si está logueado
    setInterval(() => {
      if (API.isLogged() && navigator.onLine && getLocal().syncStatus === 'pending') {
        sync().catch(() => {});
      }
    }, 60000);

    // Al volver online
    window.addEventListener('online', () => {
      if (API.isLogged()) sync().catch(() => {});
    });
  }

  // ============================================================
  // EXPORTS
  // ============================================================
  global.TNSVT_Wallet = {
    get: getLocal,
    set: setLocal,
    sync,
    userSync: () => sync(true),
    flushPendingChanges,
    trackChange,
    renderSyncCard,
    initAutoSync,
  };
})(typeof window !== 'undefined' ? window : globalThis);