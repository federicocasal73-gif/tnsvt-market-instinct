/**
 * state.js — Global game state & configuration
 * Extracted from index.html (MIG 2)
 */

// ═══════════════════════════════════════════════════════════════
// STATE — Mutable game state (survives in memory, persists partially via localStorage)
// ═══════════════════════════════════════════════════════════════
const STATE = {
  screen: 's-inicio',
  prices: {BTC:0,ETH:0,SOL:0,BNB:0,XRP:0,GOLD:0,SP500:0,NAS100:0,DXY:0,EURUSD:0},
  prevPrices: {},
  pricesLive: false,
  isVip: false,
  vipUntil: 0,
  classic: { asset:'BTC', tf:'5M', score:0, streak:0, total:0, correct:0 },
  survival: { lives:3, score:0, round:1, streak:0, data:null },
  daily: { played: false, result: null },
  arena: { rival:null, myScore:0, rivalScore:0, round:1, timer:null, chartInst:null },
  torneo: { score:0, round:1, timer:null, chartInst:null },
  hist: { filter:'all', current:null, completed:new Set(), chartInst:null },
  portfolio: null, // alias of PORT (lazy-initialized)
  liga: { tab:'global' },
  xp: 0, rank: 'NOVICIO',
  shopOwned: new Set(['a1']),
  missionsCompleted: new Set(),
  currentMode: 'classic',
  traderName: 'Trader',
};
// XP Economy versioning
const XP_ECONOMY_VERSION = 3;

const ASSETS = {
  BTC:   { sym:'BTC',    name:'Bitcoin',      emoji:'₿',  vol:0.025, base:65000  },
  ETH:   { sym:'ETH',    name:'Ethereum',     emoji:'Ξ',  vol:0.028, base:3500   },
  SOL:   { sym:'SOL',    name:'Solana',       emoji:'◎',  vol:0.04,  base:180    },
  BNB:   { sym:'BNB',    name:'BNB',          emoji:'⬡',  vol:0.022, base:620    },
  XRP:   { sym:'XRP',    name:'XRP',          emoji:'✕',  vol:0.035, base:0.55   },
  AMD:   { sym:'AMD',    name:'AMD',          emoji:'🔲', vol:0.02,  base:160    },
  MSFT:  { sym:'MSFT',   name:'Microsoft',    emoji:'⊞',  vol:0.015, base:490    },
  NVDA:  { sym:'NVDA',   name:'NVIDIA',       emoji:'🟩', vol:0.025, base:130    },
  AAPL:  { sym:'AAPL',   name:'Apple',        emoji:'🍎', vol:0.016, base:230    },
  TSLA:  { sym:'TSLA',   name:'Tesla',        emoji:'⚡', vol:0.03,  base:250    },
  GOOGL: { sym:'GOOGL',  name:'Alphabet',     emoji:'🔵', vol:0.014, base:185    },
  AMZN:  { sym:'AMZN',   name:'Amazon',       emoji:'📦', vol:0.017, base:220    },
  META:  { sym:'META',   name:'Meta',         emoji:'👤', vol:0.018, base:550    },
  SP500: { sym:'SP500',  name:'S&P 500',      emoji:'📈', vol:0.008, base:5300   },
  EURUSD:{ sym:'EURUSD', name:'EUR/USD',      emoji:'€',  vol:0.006, base:1.085  },
  GOLD:  { sym:'GOLD',   name:'Gold',         emoji:'🥇', vol:0.009, base:2385   },
  NASDAQ:{ sym:'NASDAQ', name:'Nasdaq',       emoji:'💹', vol:0.012, base:18500  },
  WTI:   { sym:'WTI',    name:'Petróleo WTI', emoji:'🛢', vol:0.018, base:82     },
};

const RANKS = [
  {name:'NOVICIO',   min:0,     color:'#6a5a8a'},
  {name:'APRENDIZ',  min:500,   color:'#60a5fa'},
  {name:'OPERADOR',  min:1500,  color:'#a78bfa'},
  {name:'ESTRATEGA', min:3500,  color:'#c8a0ff'},
  {name:'MAESTRO',   min:7000,  color:'#f0c060'},
  {name:'ORÁCULO',   min:15000, color:'#ffd700'},
];

// ═══════════════════════════════════════════════════════════════
// TNSVT_CONFIG — Backend sync configuration (persisted in localStorage)
// ═══════════════════════════════════════════════════════════════
const TNSVT_CONFIG_KEY = 'tnsvt_config_v1';
const TNSVT_CONFIG = (function(){
  try {
    const raw = localStorage.getItem(TNSVT_CONFIG_KEY);
    return raw ? JSON.parse(raw) : { serverUrl:'http://192.168.1.2:8000', code:'ADMIN01', adminPassword:'TNSVT-2026-CristoRey!', enabled:true, lastSync:0, lastError:null };
  } catch(e){ return { serverUrl:'http://192.168.1.2:8000', code:'ADMIN01', adminPassword:'TNSVT-2026-CristoRey!', enabled:true, lastSync:0, lastError:null }; }
})();