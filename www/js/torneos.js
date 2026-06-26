/* TNSVT Market Instinct — Módulo de Torneos
 * Lista, detalle, unirse, leaderboard y trade dentro de torneo.
 */
(function (global) {
  'use strict';

  const API = global.TNSVT_API;

  // ============================================================
  // STATE
  // ============================================================
  let currentTournament = null;
  let tournamentPollHandle = null;

  // ============================================================
  // RENDER HELPERS
  // ============================================================
  function fmt(n, decimals = 2) {
    const v = Number(n);
    if (!isFinite(v)) return '0';
    return v.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function fmtPct(n) {
    const v = Number(n);
    const sign = v >= 0 ? '+' : '';
    return sign + v.toFixed(2) + '%';
  }

  function statusBadge(status) {
    const map = {
      pending:  { c: 'gold',   t: '⏳ Pendiente' },
      active:   { c: 'green',  t: '🟢 En curso' },
      closed:   { c: 'gold',   t: '🏁 Cerrado' },
      finished: { c: 'violet3',t: '🏆 Finalizado' },
      cancelled:{ c: 'red',    t: '❌ Cancelado' },
    };
    const m = map[status] || { c: 'text3', t: status };
    return '<span class="badge badge-' + m.c + '">' + m.t + '</span>';
  }

  // ============================================================
  // LIST
  // ============================================================
  async function renderList(container) {
    if (!container) return;
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando torneos...</div>';

    try {
      const data = await API.Tournaments.list();
      const tournaments = data.tournaments || [];

      if (tournaments.length === 0) {
        container.innerHTML =
          '<div class="card" style="text-align:center;padding:32px">' +
            '<div style="font-size:48px;margin-bottom:12px">🏆</div>' +
            '<div style="font-weight:600;margin-bottom:6px">Sin torneos activos</div>' +
            '<div style="color:var(--text2);font-size:13px">Volvé pronto, organizamos nuevos cada semana</div>' +
          '</div>';
        return;
      }

      container.innerHTML = tournaments.map(t => {
        const pool = Number(t.current_prize_pool || t.prize_pool || 0);
        const fee  = Number(t.entry_fee || 0);
        const pct  = (t.current_entries / t.max_players * 100) || 0;
        return (
          '<div class="card" style="margin-bottom:12px;cursor:pointer" onclick="TNSVT_Torneos.open(' + t.id + ')">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">' +
              '<div>' +
                '<div style="font-family:Cinzel,serif;font-size:16px;font-weight:700;color:var(--gold)">' +
                  escapeHtml(t.name) +
                '</div>' +
                '<div style="font-size:11px;color:var(--text3);margin-top:2px">' +
                  escapeHtml(t.description || '') +
                '</div>' +
              '</div>' +
              statusBadge(t.status) +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">' +
              '<div>' +
                '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Entry</div>' +
                '<div style="font-family:JetBrains Mono,monospace;font-weight:700;font-size:15px">$' + fmt(fee) + '</div>' +
              '</div>' +
              '<div>' +
                '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Pool</div>' +
                '<div style="font-family:JetBrains Mono,monospace;font-weight:700;font-size:15px;color:var(--gold)">$' + fmt(pool) + '</div>' +
              '</div>' +
              '<div>' +
                '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Jugadores</div>' +
                '<div style="font-family:JetBrains Mono,monospace;font-weight:600">' +
                  t.current_entries + ' / ' + t.max_players +
                '</div>' +
              '</div>' +
              '<div>' +
                '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Termina</div>' +
                '<div style="font-size:13px">' + formatDate(t.end_date) + '</div>' +
              '</div>' +
            '</div>' +
            '<div style="margin-top:10px">' +
              '<div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:' + pct + '%"></div></div>' +
            '</div>' +
          '</div>'
        );
      }).join('');
    } catch (e) {
      container.innerHTML =
        '<div class="card" style="text-align:center;padding:24px">' +
          '<div style="color:var(--red);margin-bottom:8px">⚠️ Error de conexión</div>' +
          '<div style="font-size:12px;color:var(--text2)">' + escapeHtml(e.message) + '</div>' +
          '<button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="TNSVT_Torneos.refresh()">Reintentar</button>' +
        '</div>';
    }
  }

  // ============================================================
  // DETAIL
  // ============================================================
  async function open(id) {
    const screen = ensureScreen('s-torneos');
    if (!screen) return;

    showScreen('s-torneos');
    screen.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando torneo...</div>';

    try {
      const data = await API.Tournaments.get(id);
      currentTournament = data.tournament;
      const t = currentTournament;
      const isEntered = !!data.entry;

      const dist = (t.prize_distribution || '60,30,10').split(',').map(Number);

      screen.innerHTML =
        // Header
        '<div style="padding:16px;background:var(--panel2);border-bottom:1px solid var(--border)">' +
          '<button class="btn btn-ghost btn-sm" onclick="goScreen(\'s-torneos\')" style="margin-bottom:12px">← Volver</button>' +
          '<div style="font-family:Cinzel,serif;font-size:20px;font-weight:700;color:var(--gold);margin-bottom:4px">' +
            escapeHtml(t.name) +
          '</div>' +
          statusBadge(t.status) +
          '<div style="font-size:13px;color:var(--text2);margin-top:10px">' +
            escapeHtml(t.description || '') +
          '</div>' +
        '</div>' +
        // Stats
        '<div style="padding:16px">' +
          '<div class="stat-grid">' +
            statBox('Entry Fee', '$' + fmt(t.entry_fee)) +
            statBox('Pool', '$' + fmt(t.current_prize_pool || t.prize_pool), 'gold') +
            statBox('Jugadores', t.current_entries + '/' + t.max_players) +
            statBox('Dura', t.duration_days + 'd') +
            statBox('Inicia', formatDate(t.start_date)) +
            statBox('Termina', formatDate(t.end_date)) +
          '</div>' +
        '</div>' +
        // Distribución de premios
        '<div class="sec-hdr"><span class="sec-title">🏆 Distribución de Premios</span></div>' +
        '<div class="card" style="margin:0 16px 16px">' +
          dist.map((pct, i) =>
            '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">' +
              '<div>🥇 Posición ' + (i + 1) + '</div>' +
              '<div style="font-family:JetBrains Mono,monospace;color:var(--gold)">' + pct + '% = $' +
                fmt((Number(t.current_prize_pool || t.prize_pool) * pct / 100)) +
              '</div>' +
            '</div>'
          ).join('') +
          '<div style="display:flex;justify-content:space-between;padding:8px 0;color:var(--text3);font-size:12px">' +
            '<div>Comisión plataforma</div>' +
            '<div>20% (no se muestra, ya restado del pool)</div>' +
          '</div>' +
        '</div>' +
        // Action buttons
        '<div style="padding:0 16px 24px">' +
          (isEntered
            ? actionEntered(t, data.entry)
            : actionJoin(t)
          ) +
        '</div>' +
        // Leaderboard si ya entró
        (isEntered ? '<div id="t-leaderboard-container"></div>' : '') +
        '';

      if (isEntered) {
        startLeaderboardPolling(id);
      }
    } catch (e) {
      screen.innerHTML =
        '<div class="card" style="margin:16px">' +
          '<div style="color:var(--red)">⚠️ ' + escapeHtml(e.message) + '</div>' +
        '</div>';
    }
  }

  function actionJoin(t) {
    const fee = Number(t.entry_fee || 0);
    if (fee === 0) {
      // Torneo gratis → join directo
      return '<button class="btn btn-primary btn-lg" style="width:100%" onclick="TNSVT_Torneos.joinFree(' + t.id + ')">' +
        '✦ Entrar al Torneo (GRATIS)' +
      '</button>';
    }
    return (
      '<div style="display:flex;flex-direction:column;gap:8px">' +
        '<button class="btn btn-gold btn-lg" onclick="TNSVT_Pagos.openCheckout(' + t.id + ')">' +
          '💎 Pagar entrada ($' + fmt(fee) + ')' +
        '</button>' +
        '<div style="font-size:11px;color:var(--text3);text-align:center">' +
          'Acepta Mercado Pago, Binance Pay, Cripto' +
        '</div>' +
      '</div>'
    );
  }

  function actionEntered(t, entry) {
    const pnl = entry.pnl_pct || 0;
    return (
      '<div class="card" style="margin-bottom:12px">' +
        '<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">' +
          'Tu posición' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div style="font-family:Cinzel,serif;font-size:24px;font-weight:700">#' + (entry.rank || '—') + '</div>' +
          '<div style="font-family:JetBrains Mono,monospace;font-size:22px;font-weight:700;color:' +
            (pnl >= 0 ? 'var(--green)' : 'var(--red)') + '">' +
            fmtPct(pnl) +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button class="btn btn-primary btn-lg" style="width:100%" onclick="goScreen(\'s-classic\')">' +
        '🎮 Operar en el Torneo' +
      '</button>'
    );
  }

  function statBox(label, value, color) {
    return (
      '<div class="stat-box">' +
        '<div class="stat-val' + (color ? ' ' + color : '') + '">' + value + '</div>' +
        '<div class="stat-lbl">' + label + '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // JOIN FREE
  // ============================================================
  async function joinFree(id) {
    if (!API.isLogged()) {
      if (typeof openLoginModal === 'function') openLoginModal();
      else if (typeof goScreen === 'function') goScreen('s-perfil');
      toast('Iniciá sesión primero', 'warn');
      return;
    }
    try {
      const data = await API.Tournaments.join(id);
      toast('🎉 ¡Inscripto en el torneo!', 'ok');
      open(id);
    } catch (e) {
      toast('Error: ' + e.message, 'err');
    }
  }

  // ============================================================
  // LEADERBOARD POLLING
  // ============================================================
  function startLeaderboardPolling(id) {
    stopLeaderboardPolling();
    const tick = async () => {
      const container = document.getElementById('t-leaderboard-container');
      if (!container) return;
      try {
        const data = await API.Tournaments.leaderboard(id);
        renderLeaderboard(container, data.leaderboard || []);
      } catch (e) {}
    };
    tick();
    tournamentPollHandle = setInterval(tick, 8000);
  }

  function stopLeaderboardPolling() {
    if (tournamentPollHandle) {
      clearInterval(tournamentPollHandle);
      tournamentPollHandle = null;
    }
  }

  function renderLeaderboard(container, lb) {
    if (!lb.length) {
      container.innerHTML = '<div class="sec-hdr"><span class="sec-title">Leaderboard</span></div>' +
        '<div style="text-align:center;padding:24px;color:var(--text3)">Sin datos aún</div>';
      return;
    }
    container.innerHTML =
      '<div class="sec-hdr"><span class="sec-title">📊 Leaderboard</span></div>' +
      lb.map((row, i) => {
        const pnl = Number(row.pnl_pct || 0);
        const me  = row.is_me ? ' is-me' : '';
        return (
          '<div class="rank-row' + me + '">' +
            '<div class="rank-pos ' + (i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '') + '">' + (i + 1) + '</div>' +
            '<div class="rank-avatar">' + (row.avatar || '👤') + '</div>' +
            '<div class="rank-info">' +
              '<div class="rank-name">' + escapeHtml(row.username || 'Anon') + '</div>' +
              '<div class="rank-sub">$' + fmt(row.current_equity || 0) + '</div>' +
            '</div>' +
            '<div class="rank-score" style="color:' + (pnl >= 0 ? 'var(--green)' : 'var(--red)') + '">' +
              fmtPct(pnl) +
            '</div>' +
          '</div>'
        );
      }).join('');
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

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const hh = String(d.getHours()).padStart(2,'0');
      const mi = String(d.getMinutes()).padStart(2,'0');
      return dd + '/' + mm + ' ' + hh + ':' + mi;
    } catch(e) { return iso; }
  }

  function showScreen(id) {
    if (typeof goScreen === 'function') goScreen(id);
    else {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
    }
  }

  function ensureScreen(id) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.className = 'screen';
      el.id = id;
      document.getElementById('app').appendChild(el);
    }
    return el;
  }

  function toast(msg, kind) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, kind);
    } else {
      console.log('[toast]', msg);
    }
  }

  // ============================================================
  // EXPORTS
  // ============================================================
  global.TNSVT_Torneos = {
    renderList,
    open,
    joinFree,
    refresh: () => renderList(document.getElementById('s-torneos-list')),
    stopPolling: stopLeaderboardPolling,
  };
})(typeof window !== 'undefined' ? window : globalThis);