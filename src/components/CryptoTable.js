/**
 * CryptoTable Component (1단계: 정적 뼈대 컴포넌트)
 * 
 * 4단계(사용자 기능 및 인터랙션 구현)에서 검색, 정렬, 즐겨찾기 등의 동적 로직이 추가됩니다.
 * 현재 1단계에서는 전달받은 정적 코인 데이터를 단순히 렌더링해 테이블 디자인을 확인하는 기능만 제공합니다.
 */
export class CryptoTable {
  /**
   * @param {HTMLElement} container - 컴포넌트가 삽입될 부모 엘리먼트
   */
  constructor(container) {
    this.container = container;
    this.coins = [];
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
              <th data-sort="name">코인</th>
              <th style="text-align: right;">현재 가격 (KRW)</th>
              <th class="col-change-1h" style="text-align: right;">1H</th>
              <th style="text-align: right;">24H</th>
              <th class="col-change-7d" style="text-align: right;">7D</th>
              <th class="col-mcap" style="text-align: right;">시가총액</th>
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
  }

  /**
   * 1단계에서는 필터/정렬 가공 없이 수신한 목록을 테이블에 순대로 그립니다.
   * @param {Array} coins - 코인 정보 리스트
   */
  update(coins) {
    this.coins = coins || [];
    this.render();
  }

  render() {
    if (this.coins.length === 0) {
      this.tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
            데이터가 없습니다.
          </td>
        </tr>
      `;
      return;
    }

    this.tbody.innerHTML = this.coins.map(coin => {
      const formattedPrice = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(coin.current_price);
      
      const change1h = coin.price_change_percentage_1h_in_currency || 0;
      const change24h = coin.price_change_percentage_24h_in_currency || 0;
      const change7d = coin.price_change_percentage_7d_in_currency || 0;

      const class1h = change1h > 0 ? 'up-trend' : (change1h < 0 ? 'down-trend' : 'flat-trend');
      const class24h = change24h > 0 ? 'up-trend' : (change24h < 0 ? 'down-trend' : 'flat-trend');
      const class7d = change7d > 0 ? 'up-trend' : (change7d < 0 ? 'down-trend' : 'flat-trend');

      // 시가총액 단순 조/억 단위 포맷
      const mCap = coin.market_cap || 0;
      let formattedMCap = '-';
      if (mCap >= 1e12) {
        formattedMCap = `${(mCap / 1e12).toFixed(1)}조 원`;
      } else if (mCap >= 1e8) {
        formattedMCap = `${(mCap / 1e8).toFixed(0)}억 원`;
      } else {
        formattedMCap = new Intl.NumberFormat('ko-KR').format(mCap) + ' 원';
      }

      // 스파크라인용 가격 배열
      const prices = coin.sparkline_in_7d ? coin.sparkline_in_7d.price : [];

      return `
        <tr data-id="${coin.id}">
          <td style="text-align: center; vertical-align: middle;">
            <button class="star-btn" style="cursor: default;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
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
   * SVG 스파크라인 미니 차트 드로잉 (컬럼 뼈대 검증용)
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
}
