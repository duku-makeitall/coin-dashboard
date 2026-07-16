/**
 * MarketSummary Component (1단계: 정적 뼈대 컴포넌트)
 * 
 * 3단계(데이터 가공 및 시장 분석)에서 동적 분석 로직이 추가될 예정입니다.
 * 현재 1단계에서는 정적인 화면 배치 레이아웃과 더미 데이터 출력 프레임만 제공합니다.
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
        <!-- 시장 진단 카드 (정적 뼈대) -->
        <div class="summary-card" id="market-status-card">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            시장 현황 요약
          </h3>
          <div class="market-status-box" id="market-status-content">
            <span class="status-badge" style="background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-light);">알 수 없음</span>
            <div class="market-status-title">시장 분석 대기 중</div>
            <div class="market-status-desc">3단계에서 실시간 시장 상태 분석 기능이 구현됩니다.</div>
          </div>
        </div>

        <!-- TOP 5 랭킹 카드 (정적 뼈대) -->
        <div class="summary-card" id="market-ranks-card">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            오늘의 급변동 코인 (24H)
          </h3>
          <div class="ranks-grid">
            <!-- 상승 Top 5 (정적 슬롯) -->
            <div class="rank-column">
              <h4 style="font-size: 0.8rem; color: var(--state-up); margin-bottom: 0.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                상승 TOP 5
              </h4>
              <div id="top-gainers-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="font-size: 0.85rem; color: var(--text-muted); padding: 0.5rem; text-align: center; border: 1px dashed var(--border-light); border-radius: 8px;">분석 구현 대기 중</div>
              </div>
            </div>
            <!-- 하락 Top 5 (정적 슬롯) -->
            <div class="rank-column">
              <h4 style="font-size: 0.8rem; color: var(--state-down); margin-bottom: 0.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                하락 TOP 5
              </h4>
              <div id="top-losers-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="font-size: 0.85rem; color: var(--text-muted); padding: 0.5rem; text-align: center; border: 1px dashed var(--border-light); border-radius: 8px;">분석 구현 대기 중</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * 3단계: 전달받은 코인 목록 데이터를 기반으로 시장 상태 분석 및 TOP 5 랭킹을 집계하여 화면을 갱신합니다.
   * @param {Array} coins
   */
  update(coins) {
    if (!coins || coins.length === 0) {
      this.renderEmpty();
      return;
    }

    // 1. 시장 상태 요약 연산
    const totalCount = coins.length;
    let upCount = 0;
    let downCount = 0;

    coins.forEach(coin => {
      const change24h = coin.price_change_percentage_24h_in_currency || 0;
      if (change24h > 0) {
        upCount++;
      } else if (change24h < 0) {
        downCount++;
      }
    });

    const isBullish = upCount > totalCount / 2;
    const statusContent = document.getElementById('market-status-content');

    if (statusContent) {
      if (isBullish) {
        const upRatio = (upCount / totalCount) * 100;
        statusContent.innerHTML = `
          <span class="status-badge bullish">상승장 (Bullish)</span>
          <div class="market-status-title">현재 시장은 상승 흐름입니다</div>
          <div class="market-status-desc">전체 ${totalCount}개 코인 중 ${upCount}개(${upRatio.toFixed(1)}%)가 지난 24시간 동안 상승했습니다.</div>
        `;
      } else {
        const downRatio = (downCount / totalCount) * 100;
        statusContent.innerHTML = `
          <span class="status-badge bearish">하락장 (Bearish)</span>
          <div class="market-status-title">현재 시장은 하락 흐름입니다</div>
          <div class="market-status-desc">전체 ${totalCount}개 코인 중 ${downCount}개(${downRatio.toFixed(1)}%)가 지난 24시간 동안 하락했습니다.</div>
        `;
      }
    }

    // 2. TOP 5 랭킹 정렬 및 렌더링
    // 24시간 변동률 기준 내림차순 정렬 (상승 TOP 5)
    const sortedByGain = [...coins].sort((a, b) => {
      const changeA = a.price_change_percentage_24h_in_currency || 0;
      const changeB = b.price_change_percentage_24h_in_currency || 0;
      return changeB - changeA;
    });
    const topGainers = sortedByGain.slice(0, 5);

    // 24시간 변동률 기준 오름차순 정렬 (하락 TOP 5)
    const sortedByLoss = [...coins].sort((a, b) => {
      const changeA = a.price_change_percentage_24h_in_currency || 0;
      const changeB = b.price_change_percentage_24h_in_currency || 0;
      return changeA - changeB;
    });
    const topLosers = sortedByLoss.slice(0, 5);

    // 상승 TOP 5 HTML 렌더링
    const gainersList = document.getElementById('top-gainers-list');
    if (gainersList) {
      gainersList.innerHTML = topGainers.map((coin, index) => {
        const change = coin.price_change_percentage_24h_in_currency || 0;
        const sign = change >= 0 ? '+' : '';
        const color = change >= 0 ? 'var(--state-up)' : 'var(--state-down)';
        return `
          <div class="rank-item">
            <div class="rank-item-info">
              <span class="rank-number">${index + 1}</span>
              <img class="rank-coin-logo" src="${coin.image}" alt="${coin.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2218%22 height=%2218%22><rect width=%2218%22 height=%2218%22 fill=%22%23242f47%22/></svg>'">
              <span class="rank-coin-name">${coin.name}</span>
              <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">${coin.symbol}</span>
            </div>
            <span style="font-weight: 600; color: ${color};">
              ${sign}${change.toFixed(2)}%
            </span>
          </div>
        `;
      }).join('');
    }

    // 하락 TOP 5 HTML 렌더링
    const losersList = document.getElementById('top-losers-list');
    if (losersList) {
      losersList.innerHTML = topLosers.map((coin, index) => {
        const change = coin.price_change_percentage_24h_in_currency || 0;
        const sign = change >= 0 ? '+' : '';
        const color = change >= 0 ? 'var(--state-up)' : 'var(--state-down)';
        return `
          <div class="rank-item">
            <div class="rank-item-info">
              <span class="rank-number">${index + 1}</span>
              <img class="rank-coin-logo" src="${coin.image}" alt="${coin.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2218%22 height=%2218%22><rect width=%2218%22 height=%2218%22 fill=%22%23242f47%22/></svg>'">
              <span class="rank-coin-name">${coin.name}</span>
              <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">${coin.symbol}</span>
            </div>
            <span style="font-weight: 600; color: ${color};">
              ${sign}${change.toFixed(2)}%
            </span>
          </div>
        `;
      }).join('');
    }
  }

  /**
   * 코인 목록이 비어있을 때 요약 카드 표시를 리셋합니다.
   */
  renderEmpty() {
    const statusContent = document.getElementById('market-status-content');
    if (statusContent) {
      statusContent.innerHTML = `
        <span class="status-badge" style="background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-light);">알 수 없음</span>
        <div class="market-status-title">시장 분석 대기 중</div>
        <div class="market-status-desc">코인 데이터를 불러오지 못했습니다.</div>
      `;
    }

    const gainersList = document.getElementById('top-gainers-list');
    if (gainersList) {
      gainersList.innerHTML = `<div style="font-size: 0.85rem; color: var(--text-muted); padding: 0.5rem; text-align: center; border: 1px dashed var(--border-light); border-radius: 8px;">데이터가 없습니다.</div>`;
    }

    const losersList = document.getElementById('top-losers-list');
    if (losersList) {
      losersList.innerHTML = `<div style="font-size: 0.85rem; color: var(--text-muted); padding: 0.5rem; text-align: center; border: 1px dashed var(--border-light); border-radius: 8px;">데이터가 없습니다.</div>`;
    }
  }
}
