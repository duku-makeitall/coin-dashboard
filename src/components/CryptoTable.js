/**
 * CryptoTable Component
 * 
 * 암호화폐 50개 목록을 표 형태로 보여줍니다.
 * 검색, 정렬, 즐겨찾기 필터링(LocalStorage 연동)이 클라이언트 단에서 수행됩니다.
 * 7일 스파크라인을 내장 SVG 그래픽으로 렌더링합니다.
 */
export class CryptoTable {
  /**
   * @param {HTMLElement} container - 컴포넌트가 삽입될 부모 엘리먼트
   * @param {Object} options
   * @param {Function} options.onCoinClick - 테이블 행(Row) 클릭 시 상세 모달을 띄우는 콜백
   * @param {Function} options.onToggleFavorite - 즐겨찾기 별표 클릭 시 상태를 알리는 콜백
   * @param {Function} options.onSort - 헤더 클릭 시 정렬 방식을 변경하는 콜백
   */
  constructor(container, { onCoinClick, onToggleFavorite, onSort }) {
    this.container = container;
    this.onCoinClick = onCoinClick;
    this.onToggleFavorite = onToggleFavorite;
    this.onSort = onSort;

    this.coins = [];
    this.watchlist = new Set();
    this.watchlistOnly = false;
    this.searchKeyword = '';
    this.sortConfig = { key: 'market_cap', direction: 'desc' }; // 기본정렬: 시가총액 높은순

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="table-container">
        <table class="crypto-table">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">관심</th>
              <th style="width: 60px;">순위</th>
              <th class="sortable" data-sort="name">코인<span class="sort-icon" id="sort-name"></span></th>
              <th class="sortable" data-sort="current_price" style="text-align: right;">현재 가격 (KRW)<span class="sort-icon" id="sort-current_price"></span></th>
              <th class="sortable" data-sort="price_change_percentage_1h_in_currency" class="col-change-1h" style="text-align: right;">1H<span class="sort-icon" id="sort-price_change_percentage_1h_in_currency"></span></th>
              <th class="sortable" data-sort="price_change_percentage_24h_in_currency" style="text-align: right;">24H<span class="sort-icon" id="sort-price_change_percentage_24h_in_currency"></span></th>
              <th class="sortable" data-sort="price_change_percentage_7d_in_currency" class="col-change-7d" style="text-align: right;">7D<span class="sort-icon" id="sort-price_change_percentage_7d_in_currency"></span></th>
              <th class="sortable col-mcap" data-sort="market_cap" style="text-align: right;">시가총액<span class="sort-icon" id="sort-market_cap"></span></th>
              <th class="col-sparkline" style="width: 120px; text-align: center;">7일 추이</th>
            </tr>
          </thead>
          <tbody id="crypto-table-body">
            <tr>
              <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                데이터를 로드하는 중입니다...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    this.tbody = this.container.querySelector('#crypto-table-body');
    this.bindEvents();
  }

  /**
   * 테이블 상태를 변경하고 UI를 다시 렌더링합니다.
   */
  update({ coins, watchlist, watchlistOnly, searchKeyword, sortConfig }) {
    if (coins !== undefined) this.coins = coins;
    if (watchlist !== undefined) this.watchlist = new Set(watchlist);
    if (watchlistOnly !== undefined) this.watchlistOnly = watchlistOnly;
    if (searchKeyword !== undefined) this.searchKeyword = searchKeyword.toLowerCase().trim();
    if (sortConfig !== undefined) this.sortConfig = sortConfig;

    this.render();
    this.updateSortHeaders();
  }

  render() {
    // 1. 클라이언트 사이드 필터링 (즐겨찾기 토글 및 검색 키워드)
    let filteredCoins = this.coins.filter(coin => {
      // 즐겨찾기 필터링
      if (this.watchlistOnly && !this.watchlist.has(coin.id)) {
        return false;
      }
      // 검색어 필터링 (코인 한글/영문 이름 또는 심볼)
      if (this.searchKeyword) {
        const name = (coin.name || '').toLowerCase();
        const symbol = (coin.symbol || '').toLowerCase();
        if (!name.includes(this.searchKeyword) && !symbol.includes(this.searchKeyword)) {
          return false;
        }
      }
      return true;
    });

    // 즐겨찾기 목록이 활성화되었으나 비어 있는 상태 예외 처리
    if (this.watchlistOnly && filteredCoins.length === 0 && this.watchlist.size === 0) {
      this.tbody.innerHTML = `
        <tr>
          <td colspan="9">
            <div class="empty-watchlist-container">
              <svg xmlns="http://www.w3.org/2000/svg" class="empty-watchlist-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
              <div style="font-weight: 600; font-size: 0.95rem;">즐겨찾기한 코인이 없습니다.</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">관심 있는 코인의 별표를 눌러 등록해 보세요.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // 일반 검색어 매칭 실패 예외 처리
    if (filteredCoins.length === 0) {
      this.tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
            검색 결과와 일치하는 코인이 없습니다.
          </td>
        </tr>
      `;
      return;
    }

    // 2. 클라이언트 사이드 정렬
    if (this.sortConfig.key) {
      const { key, direction } = this.sortConfig;
      filteredCoins.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        // undefined 방어 코드
        if (valA === undefined || valA === null) valA = direction === 'desc' ? -Infinity : Infinity;
        if (valB === undefined || valB === null) valB = direction === 'desc' ? -Infinity : Infinity;

        if (typeof valA === 'string') {
          return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return direction === 'asc' ? valA - valB : valB - valA;
        }
      });
    }

    // 3. 렌더링 HTML 생성
    this.tbody.innerHTML = filteredCoins.map(coin => {
      const isFav = this.watchlist.has(coin.id);
      const formattedPrice = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(coin.current_price);
      
      const change1h = coin.price_change_percentage_1h_in_currency || 0;
      const change24h = coin.price_change_percentage_24h_in_currency || 0;
      const change7d = coin.price_change_percentage_7d_in_currency || 0;

      const class1h = change1h > 0 ? 'up-trend' : (change1h < 0 ? 'down-trend' : 'flat-trend');
      const class24h = change24h > 0 ? 'up-trend' : (change24h < 0 ? 'down-trend' : 'flat-trend');
      const class7d = change7d > 0 ? 'up-trend' : (change7d < 0 ? 'down-trend' : 'flat-trend');

      // 시가총액 단위 포맷 (조 / 억 단위)
      const mCap = coin.market_cap || 0;
      let formattedMCap = '-';
      if (mCap >= 1e12) {
        formattedMCap = `${(mCap / 1e12).toFixed(1)}조 원`;
      } else if (mCap >= 1e8) {
        formattedMCap = `${(mCap / 1e8).toFixed(0)}억 원`;
      } else {
        formattedMCap = new Intl.NumberFormat('ko-KR').format(mCap) + ' 원';
      }

      // 7일 스파크라인 가격 추출
      const prices = coin.sparkline_in_7d ? coin.sparkline_in_7d.price : [];

      return `
        <tr data-id="${coin.id}">
          <td style="text-align: center; vertical-align: middle;">
            <button class="star-btn ${isFav ? 'active' : ''}" data-id="${coin.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
          </td>
          <td>${coin.market_cap_rank || '-'}</td>
          <td>
            <div class="coin-identity">
              <img class="coin-logo" src="${coin.image}" alt="${coin.name}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22><rect width=%2224%22 height=%2224%22 fill=%22%23242f47%22/></svg>'">
              <div>
                <span class="coin-name">${coin.name}</span>
                <span class="coin-symbol">${coin.symbol}</span>
              </div>
            </div>
          </td>
          <td style="text-align: right; font-weight: 600;">${formattedPrice}</td>
          <td class="${class1h} col-change-1h" style="text-align: right; font-weight: 500;">
            ${change1h > 0 ? '+' : ''}${change1h.toFixed(2)}%
          </td>
          <td class="${class24h}" style="text-align: right; font-weight: 500;">
            ${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%
          </td>
          <td class="${class7d} col-change-7d" style="text-align: right; font-weight: 500;">
            ${change7d > 0 ? '+' : ''}${change7d.toFixed(2)}%
          </td>
          <td class="col-mcap" style="text-align: right; color: var(--text-secondary);">${formattedMCap}</td>
          <td class="col-sparkline" style="vertical-align: middle;">
            ${this.renderSparkline(prices, change7d)}
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * 7일 가격 리스트를 가지고 경량 SVG 미니 차트를 렌더링합니다.
   * @param {Array} prices - 가격 히스토리 목록
   * @param {number} change7d - 7일 변동률 (선 색상 결정용)
   */
  renderSparkline(prices, change7d) {
    if (!prices || prices.length < 2) return '';

    const width = 100;
    const height = 30;
    const padding = 2;

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min === 0 ? 1 : max - min;

    // SVG Points 좌표 변환
    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * (width - padding * 2) + padding;
      // SVG 좌표계는 Y가 아래로 갈수록 커지므로 뒤집어줌
      const y = height - ((price - min) / range) * (height - padding * 2) - padding;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const strokeColor = change7d >= 0 ? 'var(--state-up)' : 'var(--state-down)';

    return `
      <svg width="${width}" height="${height}" style="display: block; margin: 0 auto;">
        <polyline
          fill="none"
          stroke="${strokeColor}"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          points="${points}"
        />
      </svg>
    `;
  }

  /**
   * 정렬 설정값에 맞춰 컬럼 헤더의 정렬 표시 아이콘을 갱신합니다.
   */
  updateSortHeaders() {
    // 모든 정렬 아이콘 초기화
    const icons = this.container.querySelectorAll('.sort-icon');
    icons.forEach(icon => {
      icon.innerHTML = '';
    });

    if (this.sortConfig.key) {
      const activeIcon = this.container.querySelector(`#sort-${this.sortConfig.key}`);
      if (activeIcon) {
        const isAsc = this.sortConfig.direction === 'asc';
        activeIcon.innerHTML = isAsc 
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>`;
      }
    }
  }

  /**
   * 테이블 요소에 이벤트 리스너를 위임 방식으로 한 번만 바인딩합니다.
   */
  bindEvents() {
    // 1. 헤더 정렬 기능 클릭 이벤트
    const thead = this.container.querySelector('thead');
    thead.addEventListener('click', (e) => {
      const th = e.target.closest('th.sortable');
      if (!th) return;

      const key = th.getAttribute('data-sort');
      let direction = 'desc';

      if (this.sortConfig.key === key) {
        direction = this.sortConfig.direction === 'desc' ? 'asc' : 'desc';
      }

      this.onSort({ key, direction });
    });

    // 2. 바디 내의 별표(즐겨찾기) 클릭 및 행 클릭 이벤트
    this.tbody.addEventListener('click', (e) => {
      // 별표 버튼 클릭 감지
      const starBtn = e.target.closest('.star-btn');
      if (starBtn) {
        e.stopPropagation(); // 행 클릭 이벤트 전파 차단
        const id = starBtn.getAttribute('data-id');
        this.onToggleFavorite(id);
        return;
      }

      // 행 자체 클릭 감지
      const tr = e.target.closest('tbody tr');
      if (tr) {
        const id = tr.getAttribute('data-id');
        // 데이터가 로드 중이거나 없을 때는 id가 없음
        if (id) {
          this.onCoinClick(id);
        }
      }
    });
  }
}
