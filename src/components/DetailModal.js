/**
 * DetailModal Component (1단계: 미동작 뼈대 컴포넌트)
 * 
 * 4단계(사용자 기능 및 인터랙션 구현)에서 상세 시세 수치와 Chart.js 그래프 그리기 기능이 구현됩니다.
 * 현재 1단계에서는 디자인 뼈대 구조만 정의해두어 추후 확장이 가능하게 합니다.
 */
export class DetailModal {
  /**
   * @param {HTMLElement} container - 모달이 마운트될 부모 엘리먼트
   */
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    // 1단계에서는 UI에 렌더링하지 않으며, 뼈대 템플릿 구조만 선언해 둡니다.
    this.container.innerHTML = `<!-- 4단계에서 모달 UI 템플릿 마크업이 이곳에 삽입됩니다. -->`;
  }

  /**
   * 4단계에서 모달 오픈 및 차트 연동을 처리할 스텁
   */
  open(coin, loadChartFn) {
    console.log('상세 모달은 4단계(사용자 기능 및 인터랙션 구현) 단계에서 활성화됩니다.');
  }

  close() {
    // 스텁
  }
}
