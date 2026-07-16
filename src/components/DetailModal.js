/**
 * DetailModal Component (4단계: 사용자 기능 및 인터랙션 구현 완료)
 */
export class DetailModal {
  /**
   * @param {HTMLElement} container - 모달이 마운트될 부모 엘리먼트
   */
  constructor(container) {
    this.container = container;
    this.coin = null;
    this.loadChartFn = null;
    this.chartInstance = null;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="detail-modal-overlay">
        <div class="modal-content">
          <button class="modal-close-btn" id="modal-close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <div class="modal-header">
            <img class="coin-logo" id="modal-coin-logo" src="" alt="">
            <div class="modal-coin-title">
              <span class="modal-coin-name" id="modal-coin-name">-</span>
              <span class="modal-coin-symbol" id="modal-coin-symbol">-</span>
            </div>
            <span class="status-badge" id="modal-coin-rank" style="margin-left: auto; background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-light);">순위 -</span>
          </div>

          <!-- 스태츠 그리드 -->
          <div class="modal-stats-grid">
            <div class="stat-box">
              <div class="stat-label">현재 가격 (KRW)</div>
              <div class="stat-value" id="modal-current-price" style="color: var(--accent-blue); font-weight: 700;">-</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">24H 변동률</div>
              <div class="stat-value" id="modal-price-change-24h">-</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">24H 고가 / 저가</div>
              <div class="stat-value" id="modal-high-low-24h" style="font-size: 0.85rem; line-height: 1.2;">-</div>
            </div>
          </div>

          <!-- 차트 영역 -->
          <div class="modal-chart-wrapper">
            <div class="chart-loader" id="modal-chart-loader" style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; color: var(--text-secondary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-2" style="animation: spin 0.8s linear infinite; display: block;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <span style="font-size: 0.8rem;">차트 데이터 로드 중...</span>
            </div>
            
            <div class="error-container" id="modal-chart-error" style="position: absolute; display: none; padding: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" class="error-icon" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.25rem;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <div class="error-message" style="font-size: 0.8rem; margin-bottom: 0.5rem;">상세 차트 데이터를 불러올 수 없습니다.</div>
              <button class="retry-btn" id="modal-chart-retry-btn" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">다시 시도</button>
            </div>
            
            <canvas id="detail-chart" style="width: 100%; height: 100%; display: none;"></canvas>
          </div>
        </div>
      </div>
    `;

    this.overlay = this.container.querySelector('#detail-modal-overlay');
    this.closeBtn = this.container.querySelector('#modal-close-btn');

    // 오버레이 바깥 클릭 시 닫기
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // 닫기 버튼 클릭 시 닫기
    this.closeBtn.addEventListener('click', () => {
      this.close();
    });
  }

  /**
   * 가격이 1원 미만인 경우 소수점 2~4자리까지 출력하고, 1원 이상은 정수로 포맷팅하는 헬퍼 함수입니다.
   */
  formatKRW(price) {
    if (price === undefined || price === null) return '-';
    return price < 1
      ? new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(price)
      : new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(price);
  }

  /**
   * 모달을 열고 상세 시세 정보 및 7일 차트 데이터를 비동기로 패치하여 출력합니다.
   * @param {Object} coin
   * @param {Function} loadChartFn
   */
  open(coin, loadChartFn) {
    this.coin = coin;
    this.loadChartFn = loadChartFn;

    // 모달 데이터 바인딩
    this.container.querySelector('#modal-coin-logo').src = coin.image;
    this.container.querySelector('#modal-coin-name').textContent = coin.name;
    this.container.querySelector('#modal-coin-symbol').textContent = coin.symbol;
    this.container.querySelector('#modal-coin-rank').textContent = `순위 ${coin.market_cap_rank || '-'}`;

    const formattedPrice = this.formatKRW(coin.current_price);
    this.container.querySelector('#modal-current-price').textContent = formattedPrice;

    const change24h = coin.price_change_percentage_24h_in_currency || 0;
    const changeClass = change24h > 0 ? 'up-trend' : (change24h < 0 ? 'down-trend' : 'flat-trend');
    const changeSign = change24h >= 0 ? '+' : '';
    const priceChangeEl = this.container.querySelector('#modal-price-change-24h');
    priceChangeEl.textContent = `${changeSign}${change24h.toFixed(2)}%`;
    priceChangeEl.className = `stat-value ${changeClass}`;

    const formattedHigh = this.formatKRW(coin.high_24h || 0);
    const formattedLow = this.formatKRW(coin.low_24h || 0);
    this.container.querySelector('#modal-high-low-24h').innerHTML = `
      <span class="up-trend" style="font-weight: 600;">▲ ${formattedHigh}</span><br>
      <span class="down-trend" style="font-weight: 600;">▼ ${formattedLow}</span>
    `;

    // 모달 노출
    this.overlay.classList.add('open');

    // 상세 차트 데이터 로드 루프 진입
    this.loadChart();
  }

  async loadChart() {
    const loader = this.container.querySelector('#modal-chart-loader');
    const errorContainer = this.container.querySelector('#modal-chart-error');
    const canvas = this.container.querySelector('#detail-chart');
    const retryBtn = this.container.querySelector('#modal-chart-retry-btn');

    // UI 상태 리셋
    loader.style.display = 'flex';
    errorContainer.style.display = 'none';
    canvas.style.display = 'none';

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    retryBtn.onclick = () => {
      this.loadChart();
    };

    try {
      const data = await this.loadChartFn(this.coin.id);
      if (!data || !data.prices || data.prices.length === 0) {
        throw new Error('차트 데이터 포맷이 올바르지 않습니다.');
      }

      loader.style.display = 'none';
      canvas.style.display = 'block';

      this.renderChart(canvas, data.prices);
    } catch (err) {
      console.error('차트 로드 실패:', err);
      loader.style.display = 'none';
      errorContainer.style.display = 'flex';
    }
  }

  renderChart(canvas, prices) {
    const ctx = canvas.getContext('2d');

    // 7일간의 시간 및 가격 데이터 파싱
    const labels = prices.map(p => {
      const date = new Date(p[0]);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}/${day} ${hours}:${minutes}`;
    });

    const chartData = prices.map(p => p[1]);

    const firstPrice = chartData[0];
    const lastPrice = chartData[chartData.length - 1];
    const isUp = lastPrice >= firstPrice;
    const strokeColor = isUp ? '#ef4444' : '#3b82f6'; // var(--state-up), var(--state-down) 매칭

    // 그라데이션 영역 생성
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    if (isUp) {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.15)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
    }

    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: chartData,
          borderColor: strokeColor,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: strokeColor,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 1.5,
          fill: true,
          backgroundColor: gradient,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
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
              title: (context) => {
                return context[0].label;
              },
              label: (context) => {
                const val = context.raw;
                const formatted = this.formatKRW(val);
                return `가격: ${formatted}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: 'rgba(36, 47, 71, 0.3)',
              borderColor: 'transparent'
            },
            ticks: {
              color: '#94a3b8',
              font: { size: 9 },
              maxTicksLimit: 6
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(36, 47, 71, 0.3)',
              borderColor: 'transparent'
            },
            ticks: {
              color: '#94a3b8',
              font: { size: 9 },
              callback: (value) => {
                if (value >= 1e8) {
                  return `${(value / 1e8).toFixed(1)}억`;
                } else if (value >= 1e4) {
                  return `${(value / 1e4).toFixed(0)}만`;
                } else if (value < 1) {
                  return value.toFixed(4);
                }
                return value;
              }
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    });
  }

  close() {
    this.overlay.classList.remove('open');
    if (this.chartInstance) {
      const instanceToDestroy = this.chartInstance;
      this.chartInstance = null; // 레이스 컨디션 예방을 위해 즉시 초기화
      // 0.25s 페이드아웃 후 완전히 파괴하여 잔여 캔버스 깜빡임 최소화
      setTimeout(() => {
        instanceToDestroy.destroy();
      }, 250);
    }
  }
}
