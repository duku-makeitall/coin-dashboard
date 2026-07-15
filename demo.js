import { MarketSummary } from './src/components/MarketSummary.js';
import { CryptoTable } from './src/components/CryptoTable.js';
import { DetailModal } from './src/components/DetailModal.js';

// 1. 컴포넌트 렌더링에 사용될 고품질 더미 데이터 정의
const dummyCoins = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    market_cap_rank: 1,
    current_price: 82450000,
    price_change_percentage_1h_in_currency: 0.25,
    price_change_percentage_24h_in_currency: 1.52,
    price_change_percentage_7d_in_currency: 5.12,
    market_cap: 1612450000000000,
    total_volume: 38450000000000,
    high_24h: 83100000,
    low_24h: 81200000,
    sparkline_in_7d: {
      price: [80, 81, 79.5, 80.2, 81.5, 82.1, 81.8, 82.5, 82.0, 82.45].map(v => v * 1000000)
    }
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'eth',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    market_cap_rank: 2,
    current_price: 4210000,
    price_change_percentage_1h_in_currency: -0.42,
    price_change_percentage_24h_in_currency: -2.31,
    price_change_percentage_7d_in_currency: -1.25,
    market_cap: 508420000000000,
    total_volume: 19120000000000,
    high_24h: 4320000,
    low_24h: 4180000,
    sparkline_in_7d: {
      price: [43, 42.8, 42.5, 42.9, 42.1, 41.9, 42.0, 42.3, 42.1, 42.1].map(v => v * 100000)
    }
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'sol',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    market_cap_rank: 5,
    current_price: 184500,
    price_change_percentage_1h_in_currency: 1.15,
    price_change_percentage_24h_in_currency: 8.44,
    price_change_percentage_7d_in_currency: 12.35,
    market_cap: 85240000000000,
    total_volume: 4890000000000,
    high_24h: 187000,
    low_24h: 169000,
    sparkline_in_7d: {
      price: [16.2, 16.5, 16.9, 17.2, 17.0, 17.5, 18.0, 18.2, 18.3, 18.45].map(v => v * 10000)
    }
  },
  {
    id: 'ripple',
    name: 'Ripple',
    symbol: 'xrp',
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp.png',
    market_cap_rank: 7,
    current_price: 820,
    price_change_percentage_1h_in_currency: -0.05,
    price_change_percentage_24h_in_currency: -0.12,
    price_change_percentage_7d_in_currency: 2.22,
    market_cap: 45820000000000,
    total_volume: 1250000000000,
    high_24h: 835,
    low_24h: 812,
    sparkline_in_7d: {
      price: [80, 81, 79.5, 80.2, 81.5, 82.1, 81.8, 82.5, 82.0, 82.0].map(v => v * 10)
    }
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ada',
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    market_cap_rank: 10,
    current_price: 640,
    price_change_percentage_1h_in_currency: -0.82,
    price_change_percentage_24h_in_currency: -5.40,
    price_change_percentage_7d_in_currency: -8.54,
    market_cap: 22840000000000,
    total_volume: 85000000000,
    high_24h: 685,
    low_24h: 635,
    sparkline_in_7d: {
      price: [70, 69, 68.2, 67.5, 66.0, 65.2, 64.8, 64.2, 63.8, 64.0].map(v => v * 10)
    }
  },
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'doge',
    image: 'https://assets.coingecko.com/coins/images/325/large/dogecoin.png',
    market_cap_rank: 9,
    current_price: 210,
    price_change_percentage_1h_in_currency: 3.52,
    price_change_percentage_24h_in_currency: 15.20,
    price_change_percentage_7d_in_currency: 22.05,
    market_cap: 30450000000000,
    total_volume: 3200000000000,
    high_24h: 225,
    low_24h: 180,
    sparkline_in_7d: {
      price: [17, 17.5, 17.2, 18.0, 18.5, 19.2, 20.0, 20.5, 20.8, 21.0].map(v => v * 10)
    }
  }
];

// 2. 데모용 시세 대시보드 상태 객체 (State)
const state = {
  coins: dummyCoins,
  watchlist: new Set(JSON.parse(localStorage.getItem('crypto_watchlist_demo') || '[]')),
  watchlistOnly: false,
  searchKeyword: '',
  sortConfig: { key: 'market_cap', direction: 'desc' }
};

// 3. 컴포넌트 인스턴스 초기화
const summaryContainer = document.getElementById('market-summary-mount');
const tableContainer = document.getElementById('crypto-table-mount');
const modalContainer = document.getElementById('detail-modal-mount');

// MarketSummary 마운트
const marketSummary = new MarketSummary(summaryContainer);

// CryptoTable 마운트
const cryptoTable = new CryptoTable(tableContainer, {
  onCoinClick: (id) => {
    const coin = state.coins.find(c => c.id === id);
    if (coin) {
      detailModal.open(coin, loadDemoChartData);
    }
  },
  onToggleFavorite: (id) => {
    if (state.watchlist.has(id)) {
      state.watchlist.delete(id);
    } else {
      state.watchlist.add(id);
    }
    // LocalStorage 동기화
    localStorage.setItem('crypto_watchlist_demo', JSON.stringify([...state.watchlist]));
    updateApp();
  },
  onSort: (sortConfig) => {
    state.sortConfig = sortConfig;
    updateApp();
  }
});

// DetailModal 마운트
const detailModal = new DetailModal(modalContainer, {
  onClose: () => {
    console.log('상세 모달이 닫혔습니다.');
  }
});

// 4. 모달용 가상의 7일 차트 세밀 데이터 로드 함수 (GET /coins/{id}/market_chart?days=7 모의)
function loadDemoChartData(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const coin = state.coins.find(c => c.id === id);
      const currentPrice = coin ? coin.current_price : 1000;
      const change7d = coin ? coin.price_change_percentage_7d_in_currency : 0;
      
      const prices = [];
      const now = Date.now();
      const oneHourMs = 60 * 60 * 1000;

      // 168시간(7일) 단위 더미 가격 목록 생성
      for (let i = 168; i >= 0; i--) {
        const time = now - i * oneHourMs;
        // 시간 흐름에 따른 변동 연출 (등락 추이에 연동되도록 난수 생성)
        const progress = (168 - i) / 168; // 0 -> 1
        const trend = (change7d / 100) * progress; // 7일 변동률 흐름 추적
        const noise = (Math.random() - 0.5) * 0.05; // 잔소음 ±2.5%
        
        const price = currentPrice * (1 - (change7d / 100) + trend + noise);
        prices.push([time, price]);
      }

      resolve({ prices });
    }, 400); // 0.4초 딜레이로 로딩 인디케이터 연출
  });
}

// 5. 전체 상태 전파 및 화면 업데이트 통합 함수
function updateApp() {
  // 1) 시장 현황 요약 업데이트
  marketSummary.update(state.coins);

  // 2) 시세 테이블 업데이트
  cryptoTable.update({
    coins: state.coins,
    watchlist: [...state.watchlist],
    watchlistOnly: state.watchlistOnly,
    searchKeyword: state.searchKeyword,
    sortConfig: state.sortConfig
  });
}

// 6. 상단 컨트롤 헤더(검색바, 즐겨찾기 토글) 이벤트 수신 연결
const searchInput = document.getElementById('demo-search');
searchInput.addEventListener('input', (e) => {
  state.searchKeyword = e.target.value;
  updateApp();
});

const watchlistToggle = document.getElementById('demo-watchlist-toggle');
watchlistToggle.addEventListener('change', (e) => {
  state.watchlistOnly = e.target.checked;
  updateApp();
});

// 초기 구동
updateApp();
