/**
 * DetailModal Component
 * 
 * 특정 코인의 상세 시세 지표(24H 고가, 저가, 거래량 등)와
 * HTML5 Canvas 및 Chart.js를 연동한 7일 상세 시세 그래프를 모달 형태로 보여줍니다.
 */
export class DetailModal {
  /**
   * @param {HTMLElement} container - 모달 마운트 대상 부모 엘리먼트
   * @param {Object} options
   * @param {Function} options.onClose - 모달이 닫힐 때 호출될 콜백
   */
  constructor(container, { onClose }) {
    this.container = container;
    this.onClose = onClose;
    this.chartInstance = null;

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal-content">
          <button class="modal-close-btn" id="modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <div class="modal-header">
            <img class="coin-logo" id="modal-logo" src="" alt="">
            <div class="modal-coin-title">
              <div class="modal-coin-name" id="modal-name">
                코인명 <span style="font-size: 0.75rem; font-weight: 500; padding: 0.2rem 0.5rem; background-color: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: 4px; margin-left: 0.5rem;" id="modal-rank">Rank -</span>
              </div>
              <span class="modal-coin-symbol" id="modal-symbol">SYMBOL</span>
            </div>
          </div>

          <!-- 주요 통계치 Grid -->
          <div class="modal-stats-grid">
            <div class="stat-box">
              <div class="stat-label">현재 가격 (KRW)</div>
              <div class="stat-value" id="modal-price">-</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">24H 최고가</div>
              <div class="stat-value" id="modal-high" style="color: var(--state-up);">-</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">24H 최저가</div>
              <div class="stat-value" id="modal-low" style="color: var(--state-down);">-</div>
            </div>
          </div>

          <div class="modal-stats-grid" style="margin-top: -0.5rem;">
            <div class="stat-box" style="grid-column: span 2;">
              <div class="stat-label">24H 거래대금 (KRW)</div>
              <div class="stat-value" id="modal-volume">-</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">24H 등락률</div>
              <div class="stat-value" id="modal-change24h">-</div>
            </div>
          </div>

          <!-- 차트 영역 -->
          <h4 style="font-size: 0.8rem; color: var(--text-secondary); margin: 1.2rem 0 0.5rem 0; font-weight: 600;">7일 상세 시세 변동 추이</h4>
          <div class="modal-chart-wrapper">
            <canvas id="modal-chart-canvas"></canvas>
            <div id="chart-loader" style="position: absolute; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); top: 0; left: 0; right: 0; bottom: 0; border-radius: 12px; font-size: 0.875rem; color: var(--text-secondary);">
              차트 데이터를 불러오는 중...
            </div>
            <div id="chart-error" style="position: absolute; display: none; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-tertiary); top: 0; left: 0; right: 0; bottom: 0; border-radius: 12px; font-size: 0.875rem; color: var(--text-secondary); gap: 0.5rem;">
              <span>차트 데이터를 불러올 수 없습니다.</span>
              <button id="chart-retry-btn" style="background: var(--border-focus); border: none; color: white; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 600;">다시 시도</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.overlay = this.container.querySelector('#modal-overlay');
    this.closeBtn = this.container.querySelector('#modal-close');
    this.chartCanvas = this.container.querySelector('#modal-chart-canvas');
    this.chartLoader = this.container.querySelector('#chart-loader');
    this.chartError = this.container.querySelector('#chart-error');
    this.chartRetryBtn = this.container.querySelector('#chart-retry-btn');

    this.bindEvents();
  }

  /**
   * 모달을 활성화하고 코인 세부정보를 출력합니다.
   * @param {Object} coin - 코인의 상세 정보
   * @param {Function} loadChartFn - 7일 차트 데이터를 수신하기 위한 프라미스 함수
   */
  open(coin, loadChartFn) {
    this.activeCoin = coin;
    this.loadChartFn = loadChartFn;

    // 모달 DOM 업데이트
    this.container.querySelector('#modal-logo').src = coin.image;
    this.container.querySelector('#modal-logo').alt = coin.name;
    this.container.querySelector('#modal-name').innerHTML = `${coin.name} <span style="font-size: 0.75rem; font-weight: 500; padding: 0.2rem 0.5rem; background-color: var(--bg-tertiary); border: 1px solid var(--border-light); border-radius: 4px; margin-left: 0.5rem;" id="modal-rank">시총 ${coin.market_cap_rank || '-'}위</span>`;
    this.container.querySelector('#modal-symbol').textContent = coin.symbol;

    // 가격 포맷팅
    const koFormat = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' });
    this.container.querySelector('#modal-price').textContent = koFormat.format(coin.current_price);
    this.container.querySelector('#modal-high').textContent = koFormat.format(coin.high_24h || coin.current_price);
    this.container.querySelector('#modal-low').textContent = koFormat.format(coin.low_24h || coin.current_price);

    // 거래량 단위 간소화 (조 / 억 원)
    const vol = coin.total_volume || 0;
    let formattedVol = '-';
    if (vol >= 1e12) {
      formattedVol = `${(vol / 1e12).toFixed(1)}조 원`;
    } else if (vol >= 1e8) {
      formattedVol = `${(vol / 1e8).toFixed(0)}억 원`;
    } else {
      formattedVol = new Intl.NumberFormat('ko-KR').format(vol) + ' 원';
    }
    this.container.querySelector('#modal-volume').textContent = formattedVol;

    // 24H 등락률 색상 지정
    const change = coin.price_change_percentage_24h_in_currency || 0;
    const changeEl = this.container.querySelector('#modal-change24h');
    changeEl.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    changeEl.className = 'stat-value ' + (change > 0 ? 'up-trend' : (change < 0 ? 'down-trend' : 'flat-trend'));

    // 모달 애니메이션 실행
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // 부모 스크롤 방지

    // 차트 로드 시도
    this.fetchChartData();
  }

  /**
   * 차트 데이터 API 호출 및 Canvas에 Chart.js 바인딩
   */
  async fetchChartData() {
    this.chartLoader.style.display = 'flex';
    this.chartError.style.display = 'none';

    // 차트 캔버스 숨김
    this.chartCanvas.style.opacity = '0';

    try {
      const chartData = await this.loadChartFn(this.activeCoin.id);
      if (!chartData || !chartData.prices) {
        throw new Error('No chart data received');
      }

      this.chartLoader.style.display = 'none';
      this.chartCanvas.style.opacity = '1';
      this.renderChart(chartData.prices);
    } catch (err) {
      console.error('Failed to load chart:', err);
      this.chartLoader.style.display = 'none';
      this.chartError.style.display = 'flex';
    }
  }

  /**
   * Chart.js 인스턴스를 활용해 상세 선 그래프를 그립니다.
   * @param {Array} prices - [[timestamp, price], ...] 형태의 배열
   */
  renderChart(prices) {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    if (typeof window.Chart === 'undefined') {
      console.warn('Chart.js is not loaded.');
      return;
    }

    // 1. 차트 라벨(시간)과 시세 데이터 분리
    const labels = prices.map(item => {
      const date = new Date(item[0]);
      return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:00`;
    });
    const data = prices.map(item => item[1]);

    // 2. 시작 가격과 끝 가격을 비교해 상승/하락 트렌드 컬러 판별
    const startPrice = data[0] || 0;
    const endPrice = data[data.length - 1] || 0;
    const isUp = endPrice >= startPrice;
    
    const strokeColor = isUp ? '#ef4444' : '#3b82f6'; // 빨강 / 파랑
    const gradientStart = isUp ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)';

    // Canvas 그라데이션 객체 생성
    const ctx = this.chartCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, this.chartCanvas.height || 260);
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(1, 'transparent');

    // 3. Chart.js 렌더링
    this.chartInstance = new window.Chart(this.chartCanvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          borderColor: strokeColor,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: strokeColor,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 1.5,
          fill: true,
          backgroundColor: gradient,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: '#1b2333',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            borderColor: '#242f47',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              title: (context) => context[0].label,
              label: (context) => {
                const val = context.raw;
                return `가격: ${new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748b',
              font: { size: 9 },
              maxTicksLimit: 7 // X축 텍스트 겹침 방지
            }
          },
          y: {
            grid: {
              color: 'rgba(36, 47, 71, 0.4)'
            },
            ticks: {
              color: '#64748b',
              font: { size: 9 },
              callback: (value) => {
                // 단위 압축 표현
                if (value >= 1e8) return `${(value / 1e8).toFixed(1)}억`;
                if (value >= 1e4) return `${(value / 1e4).toFixed(0)}만`;
                return value;
              }
            }
          }
        }
      }
    });
  }

  close() {
    this.overlay.classList.remove('open');
    document.body.style.overflow = ''; // 부모 스크롤 복구

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    this.onClose();
  }

  bindEvents() {
    // 닫기 버튼 클릭
    this.closeBtn.addEventListener('click', () => this.close());

    // 오버레이 뒷배경 클릭 시 닫기
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // 키보드 ESC 키 입력 시 닫기
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('open')) {
        this.close();
      }
    });

    // 차트 로드 실패 시 재시도 이벤트
    this.chartRetryBtn.addEventListener('click', () => this.fetchChartData());
  }
}
