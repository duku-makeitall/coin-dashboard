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
   * 1단계에서는 가공 로직을 타지 않고 단순히 컴포넌트가 마운트되었음을 보장합니다.
   * @param {Array} coins
   */
  update(coins) {
    // 3단계 구현 단계에서 동작하도록 비워둡니다.
  }
}
