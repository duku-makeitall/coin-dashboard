import { fetchTop50Coins, fetchCoinChartData } from './api.js';
import { MarketSummary } from './components/MarketSummary.js';
import { CryptoTable } from './components/CryptoTable.js';
import { DetailModal } from './components/DetailModal.js';

class App {
  constructor() {
    // 4단계 전역 상태
    this.state = {
      coins: [],
      loading: false,
      error: null,
      watchlist: new Set(JSON.parse(localStorage.getItem('crypto_watchlist') || '[]')),
      watchlistOnly: false,
      searchKeyword: '',
      sortConfig: { key: 'market_cap', direction: 'desc' }
    };

    // 1분(60초) 자동 폴링 타이머 상태
    this.refreshInterval = 60; // 60초
    this.secondsRemaining = this.refreshInterval;
    this.timerId = null;

    // DOM 캐싱
    this.refreshBtn = document.getElementById('refresh-btn');
    this.timerText = document.getElementById('refresh-timer');

    // 컴포넌트 마운트 초기화
    this.initComponents();

    // 수동 새로고침 및 검색/즐겨찾기 컨트롤 이벤트 바인딩
    this.bindEvents();

    // 2단계: 데이터 로드 및 폴링 타이머 시작
    this.loadData();
    this.startRefreshTimer();
  }

  initComponents() {
    const summaryMount = document.getElementById('market-summary-mount');
    const tableMount = document.getElementById('crypto-table-mount');
    const modalMount = document.getElementById('detail-modal-mount');

    this.marketSummary = new MarketSummary(summaryMount);
    
    // CryptoTable에 콜백 바인딩
    this.cryptoTable = new CryptoTable(tableMount, {
      onCoinClick: (id) => {
        const coin = this.state.coins.find(c => c.id === id);
        if (coin) {
          this.detailModal.open(coin, fetchCoinChartData);
        }
      },
      onToggleFavorite: (id) => {
        if (this.state.watchlist.has(id)) {
          this.state.watchlist.delete(id);
        } else {
          this.state.watchlist.add(id);
        }
        localStorage.setItem('crypto_watchlist', JSON.stringify([...this.state.watchlist]));
        this.render();
      },
      onSort: (sortConfig) => {
        this.state.sortConfig = sortConfig;
        this.render();
      }
    });

    this.detailModal = new DetailModal(modalMount);
  }

  async loadData() {
    if (this.state.loading) return;

    this.state.loading = true;
    this.state.error = null;
    this.updateControlsUI();

    try {
      const data = await fetchTop50Coins();
      this.state.coins = data;
      this.state.loading = false;
      this.state.error = null;

      // 타이머 리셋
      this.secondsRemaining = this.refreshInterval;
    } catch (err) {
      console.error('API 로드 실패:', err);
      this.state.loading = false;
      this.state.error = err.message || '데이터를 불러오는 데 실패했습니다.';
    }

    this.render();
    this.updateControlsUI();
  }

  render() {
    if (this.state.error) {
      this.renderErrorUI();
      return;
    }

    // 시장 요약 업데이트 (전체 코인 기준)
    this.marketSummary.update(this.state.coins);
    
    // 시세 테이블 업데이트 (필터링 및 정렬 파라미터 전달)
    this.cryptoTable.update({
      coins: this.state.coins,
      watchlist: [...this.state.watchlist],
      watchlistOnly: this.state.watchlistOnly,
      searchKeyword: this.state.searchKeyword,
      sortConfig: this.state.sortConfig
    });
  }

  /**
   * 1분 자동 갱신(Polling) 타이머 가동
   */
  startRefreshTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }

    this.timerId = setInterval(() => {
      if (this.state.loading) return; // 로드 중에는 일시 대기

      this.secondsRemaining--;
      this.updateTimerUI();

      if (this.secondsRemaining <= 0) {
        this.loadData();
      }
    }, 1000);
  }

  updateTimerUI() {
    if (this.state.loading) {
      this.timerText.textContent = '업데이트 중...';
    } else {
      const min = Math.floor(this.secondsRemaining / 60);
      const sec = this.secondsRemaining % 60;
      this.timerText.textContent = `${min}분 ${sec.toString().padStart(2, '0')}초 후 갱신`;
    }
  }

  updateControlsUI() {
    if (this.state.loading) {
      this.refreshBtn.classList.add('loading');
      this.timerText.textContent = '업데이트 중...';
    } else {
      this.refreshBtn.classList.remove('loading');
      this.updateTimerUI();
    }
  }

  /**
   * API 통신 오류 발생 시 화면 테이블 영역에 출력할 에러 UI를 직접 구성합니다.
   */
  renderErrorUI() {
    const tableMount = document.getElementById('crypto-table-mount');
    tableMount.innerHTML = `
      <div class="table-container">
        <div class="error-container">
          <svg xmlns="http://www.w3.org/2000/svg" class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div class="error-message">${this.state.error}</div>
          <button class="retry-btn" id="error-retry-btn">다시 시도</button>
        </div>
      </div>
    `;

    // 에러 UI 내에 재시도 버튼 바인딩
    document.getElementById('error-retry-btn').addEventListener('click', () => {
      this.cryptoTable.init(); // 테이블 UI 리셋
      this.loadData();
    });
  }

  bindEvents() {
    // 수동 새로고침 이벤트 바인딩
    this.refreshBtn.addEventListener('click', () => {
      this.loadData();
    });

    // 검색창 이벤트 바인딩
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchKeyword = e.target.value;
        this.render();
      });
    }

    // 즐겨찾기 토글 이벤트 바인딩
    const watchlistToggle = document.getElementById('watchlist-toggle');
    if (watchlistToggle) {
      watchlistToggle.addEventListener('change', (e) => {
        this.state.watchlistOnly = e.target.checked;
        this.render();
      });
    }
  }
}

// 돔 로드 완료 시 가동
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
