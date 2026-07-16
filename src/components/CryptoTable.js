/**
 * CryptoTable Component (4단계: 사용자 기능 및 인터랙션 구현 완료)
 */
export class CryptoTable {
  /**
   * @param {HTMLElement} container - 컴포넌트가 삽입될 부모 엘리먼트
   * @param {Object} callbacks - 상위 App과 통신할 콜백 오브젝트
   */
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.coins = [];
    this.watchlist = [];
    this.watchlistOnly = false;
    this.searchKeyword = '';
    this.sortConfig = { key: 'market_cap', direction: 'desc' };
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="table-container">
        <table class="crypto-table">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">관심</th>
              <th class="sortable" data-sort="market_cap_rank" style="width: 60px;">순위</th>
              <th class="sortable" data-sort="name">코인</th>
              <th class="sortable" data-sort="current_price" style="text-align: right;">현재 가격 (KRW)</th>
              <th class="sortable col-change-1h" data-sort="price_change_percentage_1h_in_currency" style="text-align: right;">1H</th>
              <th class="sortable" data-sort="price_change_percentage_24h_in_currency" style="text-align: right;">24H</th>
              <th class="sortable col-change-7d" data-sort="price_change_percentage_7d_in_currency" style="text-align: right;">7D</th>
              <th class="sortable col-mcap" data-sort="market_cap" style="text-align: right;">시가총액</th>
              <th class="col-sparkline" style="width: 120px; text-align: center;">7일 추이</th>
            </tr>
          </thead>
          <tbody id="crypto-table-body">
            <tr>
              <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                데이터 로드 대기 중...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    this.tbody = this.container.querySelector('#crypto-table-body');

    // 테이블 헤더 클릭 시 정렬 바인딩
    const headers = this.container.querySelectorAll('th.sortable');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const sortKey = header.getAttribute('data-sort');
        const direction = (this.sortConfig.key === sortKey && this.sortConfig.direction === 'desc') ? 'asc' : 'desc';
        if (this.callbacks.onSort) {
          this.callbacks.onSort({ key: sortKey, direction });
        }
      });
    });
  }

  /**
   * 상위 App으로부터 시세 리스트 및 필터 상태 객체를 전달받아 화면을 갱신합니다.
   * @param {Object|Array} data
   */
  update(data) {
    if (Array.isArray(data)) {
      this.coins = data;
    } else if (data) {
      this.coins = data.coins || [];
      this.watchlist = data.watchlist || [];
      this.watchlistOnly = data.watchlistOnly || false;
      this.searchKeyword = data.searchKeyword || '';
      this.sortConfig = data.sortConfig || { key: 'market_cap', direction: 'desc' };
    }
    this.render();
  }

  render() {
    // 1. 헤더 정렬 방향 표시 업데이트
    const headers = this.container.querySelectorAll('th.sortable');
    headers.forEach(header => {
      const sortKey = header.getAttribute('data-sort');
      const existingIndicator = header.querySelector('.sort-indicator');
      if (existingIndicator) {
        existingIndicator.remove();
      }
      if (this.sortConfig.key === sortKey) {
        const indicator = document.createElement('span');
        indicator.className = 'sort-indicator';
        indicator.style.marginLeft = '4px';
        indicator.style.fontSize = '0.7rem';
        indicator.style.color = 'var(--accent-blue)';
        indicator.textContent = this.sortConfig.direction === 'desc' ? '▼' : '▲';
        header.appendChild(indicator);
      }
    });

    let processedCoins = [...this.coins];

    // 2. 즐겨찾기 필터 적용
    if (this.watchlistOnly) {
      processedCoins = processedCoins.filter(coin => this.watchlist.includes(coin.id));
      if (processedCoins.length === 0) {
        this.tbody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary); line-height: 1.8;">
              <div style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">즐겨찾기한 코인이 없습니다.</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">관심 있는 코인의 별표를 눌러 등록해 보세요.</div>
            </td>
          </tr>
        `;
        return;
      }
    }

    // 3. 검색어 필터 적용
    if (this.searchKeyword) {
      const query = this.searchKeyword.toLowerCase().trim();
      processedCoins = processedCoins.filter(coin =>
        coin.name.toLowerCase().includes(query) ||
        coin.symbol.toLowerCase().includes(query)
      );
    }

    if (processedCoins.length === 0) {
      this.tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
            검색 결과가 없습니다.
          </td>
        </tr>
      `;
      return;
    }

    // 4. 정렬 로직
    if (this.sortConfig.key) {
      const { key, direction } = this.sortConfig;
      processedCoins.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (valA === undefined || valA === null) valA = 0;
        if (valB === undefined || valB === null) valB = 0;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return direction === 'desc'
            ? valB.localeCompare(valA)
            : valA.localeCompare(valB);
        }

        return direction === 'desc' ? valB - valA : valA - valB;
      });
    }

    // 5. 테이블 본문 생성
    this.tbody.innerHTML = processedCoins.map(coin => {
      const isFavorite = this.watchlist.includes(coin.id);
      const starClass = isFavorite ? 'active' : '';
      const starIconHtml = isFavorite
        ? `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="var(--active-star)"/>`
        : `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`;

      const formattedPrice = coin.current_price < 1
        ? new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(coin.current_price)
        : new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(coin.current_price);

      const change1h = coin.price_change_percentage_1h_in_currency || 0;
      const change24h = coin.price_change_percentage_24h_in_currency || 0;
      const change7d = coin.price_change_percentage_7d_in_currency || 0;

      const class1h = change1h > 0 ? 'up-trend' : (change1h < 0 ? 'down-trend' : 'flat-trend');
      const class24h = change24h > 0 ? 'up-trend' : (change24h < 0 ? 'down-trend' : 'flat-trend');
      const class7d = change7d > 0 ? 'up-trend' : (change7d < 0 ? 'down-trend' : 'flat-trend');

      const mCap = coin.market_cap || 0;
      let formattedMCap = '-';
      if (mCap >= 1e12) {
        formattedMCap = `${(mCap / 1e12).toFixed(1)}조 원`;
      } else if (mCap >= 1e8) {
        formattedMCap = `${(mCap / 1e8).toFixed(0)}억 원`;
      } else {
        formattedMCap = new Intl.NumberFormat('ko-KR').format(mCap) + ' 원';
      }

      const prices = coin.sparkline_in_7d ? coin.sparkline_in_7d.price : [];

      return `
        <tr data-id="${coin.id}">
          <td style="text-align: center; vertical-align: middle;">
            <button class="star-btn ${starClass}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star">
                ${starIconHtml}
              </svg>
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

    // 6. 이벤트 재바인딩 (행 클릭 및 별표 클릭)
    const rows = this.tbody.querySelectorAll('tr[data-id]');
    rows.forEach(row => {
      const coinId = row.getAttribute('data-id');

      // 별표(즐겨찾기) 클릭 바인딩
      const starBtn = row.querySelector('.star-btn');
      if (starBtn) {
        starBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // 행 클릭 이벤트 전파 차단
          if (this.callbacks.onToggleFavorite) {
            this.callbacks.onToggleFavorite(coinId);
          }
        });
      }

      // 행 클릭 바인딩 (상세보기 모달 호출)
      row.addEventListener('click', () => {
        if (this.callbacks.onCoinClick) {
          this.callbacks.onCoinClick(coinId);
        }
      });
    });
  }

  /**
   * SVG 스파크라인 미니 차트 드로잉
   */
  renderSparkline(prices, change7d) {
    if (!prices || prices.length < 2) return '';

    const width = 100;
    const height = 30;
    const padding = 2;

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min === 0 ? 1 : max - min;

    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((price - min) / range) * (height - padding * 2) - padding;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    let strokeColor = 'var(--state-neutral)';
    if (change7d > 0) {
      strokeColor = 'var(--state-up)';
    } else if (change7d < 0) {
      strokeColor = 'var(--state-down)';
    }

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
}
