# 암호화폐 실시간 시세 대시보드 디자인 가이드 (Design Guide)

본 문서는 **암호화폐 실시간 시세 대시보드 웹서비스**의 시각적 일관성과 완성도 높은 프론트엔드 구현을 위한 디자인 가이드입니다. 

국내 투자자 정서에 맞춘 시인성 높은 **상승(빨간색)/하락(파란색) 시스템**과 **다크 모드(Dark Mode) 단일 테마**, 그리고 바닐라 CSS(Vanilla CSS) 및 Chart.js, Lucide Icons 연동에 최적화된 설계 지침을 다룹니다.

---

## 1. 디자인 컨셉 (Design Concept)

### "미래지향적인 네온 다크 핀테크 (Neon Dark Fintech)"
* **비주얼 톤**: 어둡고 정돈된 심해(Abyss) 계열의 배경색을 기본으로 사용하고, 시각적 계층을 나타내는 표면(Surface) 컬러들을 중첩시켜 깊이감을 부여합니다.
* **시인성 우선**: 암호화폐 시세 데이터가 핵심이므로, 화려한 그래픽 장식은 지양하고 네온 계열의 상태 지표 컬러(빨간색, 파란색)와 정교한 타이포그래피로 숫자의 가독성을 극대화합니다.
* **매끄러운 인터랙션**: 마우스 오버(Hover), 로딩, 에러 상태에 반응하는 미세한 애니메이션(Micro-interaction)을 제공하여 생동감 있는 웹앱 경험을 선사합니다.

---

## 2. 컬러 시스템 (Color System)

모든 색상은 바닐라 CSS의 **CSS 변수(Custom Properties)**로 관리하여 유지보수성을 극대화합니다.

```css
:root {
  /* Background & Surface */
  --bg-primary: #0a0e17;      /* 대시보드 메인 배경색 (깊은 다크 네이비) */
  --bg-secondary: #121824;    /* 테이블 및 카드 컴포넌트 배경색 (서페이스) */
  --bg-tertiary: #1b2333;     /* 테이블 헤더, 검색창, 모달 배경색 */
  
  /* Borders & Dividers */
  --border-light: #242f47;    /* 기본 테두리 및 구분선 */
  --border-focus: #3b82f6;    /* 검색창 포커스 및 강조용 파란색 */

  /* Primary Accent */
  --accent-blue: #38bdf8;     /* 브랜드 메인 포인트 컬러 (스카이 블루) */
  --accent-glow: rgba(56, 189, 248, 0.15);

  /* State Colors (국내 시장 정서 반영) */
  --state-up: #ef4444;        /* 상승 (빨간색 - Red) */
  --state-down: #3b82f6;      /* 하락 (파란색 - Blue) */
  --state-neutral: #94a3b8;   /* 중립/보합 (슬레이트 회색) */
  
  /* State Colors Hover/Light versions (배경 강조용) */
  --state-up-bg: rgba(239, 68, 68, 0.08);
  --state-down-bg: rgba(59, 130, 246, 0.08);

  /* Typography Colors */
  --text-primary: #f8fafc;    /* 메인 텍스트 (거의 흰색에 가까운 회색) */
  --text-secondary: #94a3b8;  /* 보조 설명, 라벨, 심볼 텍스트 */
  --text-muted: #64748b;      /* 비활성 정보, 플레이스홀더 */

  /* Interactive States */
  --hover-overlay: rgba(255, 255, 255, 0.04);
  --active-star: #eab308;     /* 즐겨찾기 별표 색상 (골드 황토색) */
}
```

---

## 3. 타이포그래피 (Typography)

글로벌 표준 금융 데이터 폰트인 **Inter**와 한글 가독성이 뛰어난 **Noto Sans KR**을 조합하여 사용합니다.

### 3.1. 폰트 패밀리
```css
body {
  font-family: 'Inter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

### 3.2. 타이포그래피 위계 (Hierarchy)
* **Title (대제목/헤더)**: `24px` | Bold (`700`) | `--text-primary`
* **Card Heading (섹션/카드 제목)**: `18px` | SemiBold (`600`) | `--text-primary`
* **Table Header (테이블 열 이름)**: `12px` | Medium (`500`) | `--text-secondary` | Uppercase (영문인 경우)
* **Table Cell / Body (시세 숫자)**: `14px` | Medium (`500`) / Regular (`400`) | `--text-primary` (숫자는 고정폭 폰트 속성 `font-variant-numeric: tabular-nums` 적극 사용 권장)
* **Caption (보조 설명 / 뱃지)**: `11px` | Regular (`400`) | `--text-secondary`

---

## 4. 레이아웃 & 반응형 가이드

전체 레이아웃은 그리드가 아닌 한눈에 데이터가 보이는 **1280px 맥스 그리드 센트럴 레이아웃**을 적용합니다.

### 4.1. 반응형 브레이크포인트 (Breakpoints)
* **Desktop**: `1200px` 이상 (모든 정보 한눈에 보기)
* **Tablet**: `768px ~ 1199px` (가로 폭 축소, 시가총액/1시간 등락률 생략 고려)
* **Mobile**: `767px` 이하 (한 열에 집중, 미니 차트 및 시가총액 숨김)

### 4.2. 모바일 환경에서의 컬럼 반응형 처리 (CSS Media Query 예제)
모바일 기기에서는 좌우 스크롤을 방지하고 가독성을 높이기 위해 시세 테이블의 특정 컬럼을 숨깁니다.
```css
@media (max-width: 768px) {
  /* 모바일에서 시가총액, 1시간 등락률, 7일 등락률 컬럼을 숨김 */
  .col-mcap,
  .col-change-1h,
  .col-change-7d {
    display: none;
  }
}
@media (max-width: 480px) {
  /* 초소형 모바일 기기에서는 7일 미니차트(스파크라인) 컬럼까지 숨김 */
  .col-sparkline {
    display: none;
  }
}
```

---

## 5. 데이터 테이블 UI 디자인 (Data Table)

시세 대시보드의 메인이 되는 테이블은 아래와 같이 세부 스타일을 제어합니다.

```css
.crypto-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
}

.crypto-table tr {
  border-bottom: 1px solid var(--border-light);
  transition: background-color 0.2s ease;
}

/* Hover 효과: 마우스 오버 시 미세한 밝기 증가와 배경 변경 */
.crypto-table tbody tr:hover {
  background-color: var(--hover-overlay);
  cursor: pointer;
}

/* 별표(즐겨찾기) 영역 */
.star-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s ease, transform 0.1s ease;
}
.star-btn:hover {
  transform: scale(1.15);
}
.star-btn.active {
  color: var(--active-star);
}
```

---

## 6. 차트 디자인 가이드 (Chart.js / SVG)

### 6.1. 테이블 내 7일 스파크라인 (미니 차트)
* **형태**: 축 레이블(X, Y)과 그리드라인(Gridlines)을 모두 투명하게 가려 선 하나만 직관적으로 보이게 디자인합니다.
* **디자인 룰**:
  * 채우기 색상(Fill) 없음. 단일 라인만 표시.
  * 라인 텐션(Tension): `0.2` (너무 뾰족하지도, 너무 둥글지도 않은 부드러운 곡선)
  * 라인 두께(Border Width): `1.5px`
  * **동적 컬러 적용**: 해당 코인의 7일 등락률이 **상승(+)이면 라인을 `--state-up`**, **하락(-)이면 `--state-down`** 컬러로 동적 바인딩합니다.

### 6.2. 모달 내 7일 상세 차트 (Chart.js 설정 가이드)
상세 모달 내부에서는 정확한 시세 파악을 위해 X, Y축 눈금 및 상세 툴팁을 렌더링합니다.

* **차트 배경 그리드**: 투명한 테두리를 지정하여 그리드가 너무 튀지 않게 만듭니다. (`color: 'rgba(36, 47, 71, 0.5)'`)
* **라인 스타일**:
  * 라인 두께: `2px`
  * 채우기(Fill) 효과: 라인 아래 영역에 **위에서 아래로 옅어지는 그라데이션**을 투명하게 입힙니다. (상승 시 빨간색 그라데이션 `rgba(239, 68, 68, 0.1) -> transparent`, 하락 시 파란색 그라데이션 `rgba(59, 130, 246, 0.1) -> transparent`)
* **인터랙션 (Tooltip)**:
  * 마우스 호버 시 둥근 점(Hover Point)이 차트 선을 따라 부드럽게 움직이도록 설정합니다.
  * 툴팁 박스는 어두운 배경(`--bg-tertiary`), 테두리(`--border-light`), 흰색 텍스트(`--text-primary`)로 디자인하며, 시간정보와 원화 가격이 콤마 포맷으로 깔끔하게 나오도록 콜백(Callback) 처리합니다.

---

## 7. 마이크로 인터랙션 & 애니메이션 (Micro-interactions)

사용자 경험(UX)을 부드럽게 해주는 필수 트랜지션 애니메이션 정의입니다.

### 7.1. 수동 새로고침 버튼 회전 애니메이션
사용자가 새로고침 버튼을 누를 때 360도 회전하며 데이터 로딩 상태임을 피드백합니다.
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.refresh-btn.loading svg {
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
```

### 7.2. 모달 팝업 페이드인 & 슬라이드업
상세 모달 활성화 시 화면 아래에서 위로 살짝 떠오르며 불투명도가 낮아지는 연출을 적용하여 시각적 단절감을 없앱니다.
```css
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

### 7.3. 카드 컴포넌트 마우스 오버 (Hover Glow Effect)
상승/하락 Top 5 순위 카드 등에 오버할 때 외곽선이 부드럽게 밝아지는 효과를 적용합니다.
```css
.summary-card {
  border: 1px solid var(--border-light);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.summary-card:hover {
  border-color: var(--border-focus);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
}
```
