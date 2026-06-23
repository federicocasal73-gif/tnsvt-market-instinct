/* TNSVT Market Instinct — API Client
 * Conecta con backend Symfony (tnsvt-symfony) en HOSTINGER o LAN.
 * Maneja JWT, refresh, retry y sincronización offline.
 */
(function (global) {
  'use strict';

  // ============================================================
  // CONFIG
  // ============================================================
  const API_CONFIG = {
    // Cambiar según entorno:
    // - Producción: https://tudominio.com
    // - LAN dev:    http://192.168.1.2:8000
    baseUrl: 'https://tudominio.com',
    lanUrl: 'http://192.168.1.2:8000',
    timeout: 15000,
    retryCount: 2,
    tokenKey: 'tnsvt_auth_token',
    userKey:  'tnsvt_user_data',
  };

  // Detección automática LAN vs producción (heurística simple)
  if (location.hostname === 'localhost' || location.hostname.startsWith('192.168.')) {
    API_CONFIG.baseUrl = API_CONFIG.lanUrl;
  }

  // ============================================================
  // STATE
  // ============================================================
  let authToken = null;
  let userData  = null;
  let refreshPromise = null;

  // Cargar token de localStorage al iniciar
  try {
    authToken = localStorage.getItem(API_CONFIG.tokenKey) || null;
    const ud  = localStorage.getItem(API_CONFIG.userKey);
    userData  = ud ? JSON.parse(ud) : null;
  } catch (e) {
    console.warn('[API] localStorage no disponible', e);
  }

  // ============================================================
  // FETCH WRAPPER
  // ============================================================
  async function request(path, options = {}) {
    const url = API_CONFIG.baseUrl + path;
    const headers = Object.assign(
      {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      options.headers || {}
    );

    if (authToken && !options.skipAuth) {
      headers['Authorization'] = 'Bearer ' + authToken;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const resp = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timer);

      // 401 → intentar refresh una vez
      if (resp.status === 401 && authToken && !options.skipAuth && !options._retried) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          return request(path, { ...options, _retried: true });
        }
        clearAuth();
      }

      const text = await resp.text();
      const data = text ? safeJSON(text) : null;

      if (!resp.ok) {
        const err = new Error((data && data.error) || resp.statusText);
        err.status = resp.status;
        err.data = data;
        throw err;
      }
      return data;
    } catch (e) {
      clearTimeout(timer);
      if (e.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado');
      }
      throw e;
    }
  }

  function safeJSON(text) {
    try { return JSON.parse(text); }
    catch (e) { return { raw: text }; }
  }

  // ============================================================
  // AUTH
  // ============================================================
  async function login(username, password) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    });
    setAuth(data.token, data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
    setAuth(data.token, data.user);
    return data.user;
  }

  async function tryRefreshToken() {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
      try {
        if (!authToken) return false;
        const data = await request('/api/auth/refresh', {
          method: 'POST',
          skipAuth: true,
        });
        setAuth(data.token, data.user || userData);
        return true;
      } catch (e) {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
    return refreshPromise;
  }

  function setAuth(token, user) {
    authToken = token;
    userData = user;
    try {
      localStorage.setItem(API_CONFIG.tokenKey, token);
      localStorage.setItem(API_CONFIG.userKey, JSON.stringify(user));
    } catch (e) {}
  }

  function clearAuth() {
    authToken = null;
    userData = null;
    try {
      localStorage.removeItem(API_CONFIG.tokenKey);
      localStorage.removeItem(API_CONFIG.userKey);
    } catch (e) {}
  }

  function isLogged() {
    return !!authToken;
  }

  function getUser() {
    return userData;
  }

  // ============================================================
  // ENDPOINTS — TORNEOS
  // ============================================================
  const Tournaments = {
    list: (filters = {}) => {
      const q = new URLSearchParams(filters).toString();
      return request('/api/tournament/list' + (q ? '?' + q : ''));
    },
    get: (id) => request('/api/tournament/' + id),
    join: (id, code) => request('/api/tournament/' + id + '/join', {
      method: 'POST',
      body: JSON.stringify({ invite_code: code || null }),
    }),
    joinPaid: (id, paymentMethod) => request('/api/tournament/' + id + '/join-paid', {
      method: 'POST',
      body: JSON.stringify({ payment_method: paymentMethod }),
    }),
    leaderboard: (id) => request('/api/tournament/' + id + '/leaderboard'),
    trade: (id, payload) => request('/api/tournament/' + id + '/trade', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    myEntries: () => request('/api/tournament/my-entries'),
  };

  // ============================================================
  // ENDPOINTS — WALLET
  // ============================================================
  const Wallet = {
    get: () => request('/api/wallet/me'),
    transactions: (limit = 50) => request('/api/wallet/transactions?limit=' + limit),
    sync: (state) => request('/api/wallet/sync', {
      method: 'POST',
      body: JSON.stringify(state),
    }),
  };

  // ============================================================
  // ENDPOINTS — MERCADO
  // ============================================================
  const Market = {
    quote: (symbol) => request('/api/market/quote/' + encodeURIComponent(symbol)),
    quotes: (symbols) => request('/api/market/quotes?symbols=' + symbols.join(',')),
    history: (symbol, interval = '15m', limit = 100) =>
      request('/api/market/candles?symbol=' + encodeURIComponent(symbol) +
              '&interval=' + interval + '&limit=' + limit),
    search: (q) => request('/api/market/search?q=' + encodeURIComponent(q)),
  };

  // ============================================================
  // ENDPOINTS — LEADERBOARD
  // ============================================================
  const Leaderboard = {
    global: (limit = 50) => request('/api/leaderboard?limit=' + limit),
    weekly: () => request('/api/leaderboard/weekly'),
    aroundMe: (limit = 10) => request('/api/leaderboard/around-me?limit=' + limit),
  };

  // ============================================================
  // ENDPOINTS — PAGOS (deep-link)
  // ============================================================
  const Payments = {
    createCheckout: (tournamentId, method, returnTo = 'app') =>
      request('/api/checkout/tournament/' + tournamentId + '/create', {
        method: 'POST',
        body: JSON.stringify({ method, return_to: returnTo }),
        skipAuth: true,
      }),
    claim: (token) => request('/api/checkout/claim', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  };

  // ============================================================
  // SYNC OFFLINE → ONLINE
  // ============================================================
  async function syncWithBackend(localState) {
    if (!isLogged()) {
      throw new Error('No autenticado');
    }
    return Wallet.sync({
      balance: localState.balance,
      holdings: localState.holdings || [],
      last_sync: localState.lastSync || null,
      trades: localState.recentTrades || [],
    });
  }

  // ============================================================
  // EXPORTS
  // ============================================================
  global.TNSVT_API = {
    config: API_CONFIG,
    request,
    setBaseUrl(url) { API_CONFIG.baseUrl = url; },

    // Auth
    login, register, logout: clearAuth, isLogged, getUser,
    setAuth, clearAuth,

    // Recursos
    Tournaments, Wallet, Market, Leaderboard, Payments,

    // Util
    syncWithBackend,
  };
})(typeof window !== 'undefined' ? window : globalThis);