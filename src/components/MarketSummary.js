/**
 * MarketSummary Component
 * 
 * 시장 전체 상승/하락 비율을 계산하여 시장 국면(상승장/하락장)을 요약하고,
 * 24시간 변동률 기준 상승 TOP 5 및 하락 TOP 5 코인을 보여줍니다.
 */
export class MarketSummary {
  /**
   * @param {HTMLElement} container - 컴포넌트가 삽입될 부모 엘리먼트
   */
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <section class="market-summary-section">
        <!-- 시장 진단 카드 -->
        <div class="summary-card" id="market-status-card">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            시장 현황 요약
          </h3>
          <div class="market-status-box" id="market-status-content">
            <span class="status-badge">대기 중</span>
            <div class="market-status-title">분석 중...</div>
            <div class="market-status-desc">데이터를 불러오는 중입니다.</div>
          </div>
        </div>

        <!-- TOP 5 랭킹 카드 -->
        <div class="summary-card" id="market-ranks-card">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            오늘의 급변동 코인 (24H)
          </h3>
          <div class="ranks-grid">
            <!-- 상승 Top 5 -->
            <div class="rank-column">
              <h4 style="font-size: 0.8rem; color: var(--state-up); margin-bottom: 0.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                상승 TOP 5
              </h4>
              <div id="top-gainers-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
            </div>
            <!-- 하락 Top 5 -->
            <div class="rank-column">
              <h4 style="font-size: 0.8rem; color: var(--state-down); margin-bottom: 0.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                하락 TOP 5
              </h4>
              <div id="top-losers-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
            </div>
          </div>
        </div>
      </section>
    `;

    this.statusContent = this.container.querySelector('#market-status-content');
    this.gainersList = this.container.querySelector('#top-gainers-list');
    this.losersList = this.container.querySelector('#top-losers-list');
  }

  /**
   * 코인 목록 데이터를 이용해 요약 UI를 실시간으로 갱신합니다.
   * @param {Array} coins - 코인 정보 리스트
   */
  update(coins) {
    if (!coins || coins.length === 0) {
      this.renderEmpty();
      return;
    }

    // 1. 상승장 / 하락장 판별
    let upCount = 0;
    let downCount = 0;

    coins.forEach(coin => {
      const change24h = coin.price_change_percentage_24h_in_currency || 0;
      if (change24h > 0) upCount++;
      else if (change24h < 0) downCount++;
    });

    const totalCount = upCount + downCount;
    const upRatio = totalCount > 0 ? ((upCount / totalCount) * 100).toFixed(0) : 50;

    let statusBadgeClass = 'status-badge';
    let statusText = '보합장';
    let statusDesc = `상승 코인 ${upCount}개, 하락 코인 ${downCount}개로 시장이 균형을 이루고 있습니다.`;

    if (upRatio > 55) {
      statusBadgeClass += ' bullish';
      statusText = '상승장 (Bullish)';
      statusDesc = `상승 코인(${upCount}개)이 하락 코인(${downCount}개)보다 우세하여 활발한 매수세를 보이고 있습니다. (상승 비율: ${upRatio}%)`;
    } else if (upRatio < 45) {
      statusBadgeClass += ' bearish';
      statusText = '하락장 (Bearish)';
      statusDesc = `하락 코인(${downCount}개)이 상승 코인(${upCount}개)보다 우세하여 다소 침체된 양상을 보이고 있습니다. (하락 비율: ${(100 - upRatio).toFixed(0)}%)`;
    }

    this.statusContent.innerHTML = `
      <span class="${statusBadgeClass}">${upRatio > 55 ? 'Bullish' : (upRatio < 45 ? 'Bearish' : 'Neutral')}</span>
      <div class="market-status-title" style="color: ${upRatio > 55 ? 'var(--state-up)' : (upRatio < 45 ? 'var(--state-down)' : 'var(--text-primary)')};">
        ${statusText}
      </div>
      <div class="market-status-desc">${statusDesc}</div>
    `;

    // 2. 오늘의 상승 / 하락 TOP 5 계산
    // 24시간 변동률 기준 정렬 (새 복사본을 만들어 정렬)
    const sortedCoins = [...coins].sort((a, b) => {
      const changeA = a.price_change_percentage_24h_in_currency || 0;
      const changeB = b.price_change_percentage_24h_in_currency || 0;
      return changeB - changeA;
    });

    const topGainers = sortedCoins.slice(0, 5);
    const topLosers = sortedCoins.slice(-5).reverse(); // 하락이 가장 큰 순서대로

    // 3. 리스트 렌더링
    this.gainersList.innerHTML = topGainers.map((coin, index) => this.renderRankItem(coin, index + 1, true)).join('');
    this.losersList.innerHTML = topLosers.map((coin, index) => this.renderRankItem(coin, index + 1, false)).join('');
  }

  /**
   * 단일 코인 랭킹 항목 렌더링 HTML을 생성합니다.
   * @param {Object} coin - 코인 객체
   * @param {number} rank - 순위 번호
   * @param {boolean} isGainer - 상승 여부
   */
  renderRankItem(coin, rank, isGainer) {
    const change = coin.price_change_percentage_24h_in_currency || 0;
    const sign = change > 0 ? '+' : '';
    const colorClass = isGainer ? 'up-trend' : 'down-trend';

    return `
      <div class="rank-item">
        <div class="rank-item-info">
          <span class="rank-number">${rank}</span>
          <img class="rank-coin-logo" src="${coin.image}" alt="${coin.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2218%22 height=%2218%22><rect width=%2218%22 height=%2218%22 fill=%22%23242f47%22/></svg>'">
          <span class="rank-coin-name" style="max-width: 70px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${coin.name}</span>
        </div>
        <span class="${colorClass}" style="font-weight: 600; font-size: 0.8rem;">
          ${sign}${change.toFixed(2)}%
        </span>
      </div>
    `;
  }

  renderEmpty() {
    this.statusContent.innerHTML = `
      <span class="status-badge">오류</span>
      <div class="market-status-title">데이터 없음</div>
      <div class="market-status-desc">화면을 갱신해 정보를 확인하세요.</div>
    `;
    this.gainersList.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 1rem;">-</div>';
    this.losersList.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 1rem;">-</div>';
  }
}
