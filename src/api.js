/**
 * CoinGecko API Service Module
 * 
 * 2단계 구현 요건:
 * - 로컬 환경에 구성된 .env 파일을 fetch하여 API Key를 동적으로 추출하고 로딩합니다.
 * - CoinGecko Demo API (demo-api.coingecko.com)에 접속하여 시가총액 기준 상위 50개 코인 데이터를 패치합니다.
 */

let cachedApiKey = null;

/**
 * 로컬 서버 루트의 .env 파일을 비동기 요청하여 API Key를 동적으로 추출합니다.
 * @returns {Promise<string>}
 */
async function loadApiKey() {
  if (cachedApiKey) {
    return cachedApiKey;
  }

  try {
    const response = await fetch('/.env');
    if (!response.ok) {
      throw new Error('.env 파일 로드 실패 (HTTP ' + response.status + ')');
    }
    const text = await response.text();
    
    // 개행 문자 기준으로 분리하여 key-value 파싱
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('COINGECKO_API_KEY=')) {
        const key = trimmed.substring('COINGECKO_API_KEY='.length).trim();
        if (key) {
          cachedApiKey = key;
          return cachedApiKey;
        }
      }
    }
    throw new Error('.env 파일 내 COINGECKO_API_KEY 값이 지정되어 있지 않습니다.');
  } catch (err) {
    console.error('환경변수 로딩 실패:', err);
    throw new Error('API 인증 환경변수 로드에 실패했습니다. (.env 파일 유무 확인 필요)');
  }
}

/**
 * Vercel Serverless Function이 비활성화되었을 때 로컬에서 직접 CoinGecko API를 호출하는 Fallback 함수입니다.
 */
async function fetchTop50CoinsDirect() {
  const apiKey = await loadApiKey();
  
  // CoinGecko 정식 API URL 및 쿼리 파라미터 조합
  const url = 'https://api.coingecko.com/api/v3/coins/markets?' + new URLSearchParams({
    vs_currency: 'krw',
    order: 'market_cap_desc',
    per_page: '50',
    page: '1',
    sparkline: 'true',
    price_change_percentage: '1h,24h,7d'
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'x-cg-demo-api-key': apiKey
    }
  });

  if (!response.ok) {
    // 429 Too Many Requests, 401 Unauthorized 등의 처리를 위해 에러 발생
    throw new Error(`API 호출 실패 (HTTP ${response.status}: ${response.statusText})`);
  }

  return await response.json();
}

/**
 * 시가총액 기준 상위 50개 코인 목록 및 7일 스파크라인 데이터를 실시간으로 가져옵니다. (2단계 구현)
 * Vercel 서버리스 프록시를 우선 호출하며, 로컬 환경 등 프록시 사용이 어려우면 로컬 .env 기반 직접 호출로 대체합니다.
 * @returns {Promise<Array>}
 */
export async function fetchTop50Coins() {
  try {
    const response = await fetch('/api/coins');
    
    // Vercel Serverless Function이 존재하지 않는 경우 (예: 로컬 단순 static 서버 실행 시 404 발생)
    if (response.status === 404) {
      throw new Error('Proxy not found');
    }
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `서버 오류 (HTTP ${response.status})`);
    }
    
    return await response.json();
  } catch (proxyError) {
    // 404 에러 또는 네트워크 오류(TypeError)인 경우에만 로컬 직접 통신으로 Fallback
    if (proxyError.message === 'Proxy not found' || proxyError.name === 'TypeError') {
      console.warn('Vercel API가 활성화되지 않았습니다. 로컬 .env 설정을 기반으로 직접 CoinGecko를 호출합니다.');
      return await fetchTop50CoinsDirect();
    }
    throw proxyError;
  }
}

/**
 * 로컬에서 직접 CoinGecko API로부터 차트 데이터를 로드하는 Fallback 함수입니다.
 */
async function fetchCoinChartDataDirect(id) {
  const apiKey = await loadApiKey();
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?` + new URLSearchParams({
    vs_currency: 'krw',
    days: '7'
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'x-cg-demo-api-key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`차트 API 호출 실패 (HTTP ${response.status}: ${response.statusText})`);
  }

  return await response.json();
}

/**
 * 특정 코인의 7일 가격 추이 상세 차트 데이터 (4단계 사용자 기능 단계에서 실구현 예정)
 * Vercel 서버리스 프록시를 우선 호출하고, 로컬 직접 호출이 불가능하거나 설정이 없으면 모의 데이터(Mock Stub)를 리턴합니다.
 * @param {string} id - 코인 고유 식별 ID
 * @returns {Promise<Object>}
 */
export async function fetchCoinChartData(id) {
  try {
    const response = await fetch(`/api/chart?id=${encodeURIComponent(id)}`);
    
    if (response.status === 404) {
      throw new Error('Proxy not found');
    }
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `서버 오류 (HTTP ${response.status})`);
    }
    
    return await response.json();
  } catch (proxyError) {
    // Vercel 프록시가 동작하지 않는 환경일 때
    if (proxyError.message === 'Proxy not found' || proxyError.name === 'TypeError') {
      try {
        console.warn('Vercel API가 활성화되지 않았습니다. 로컬 직접 호출을 시도합니다.');
        return await fetchCoinChartDataDirect(id);
      } catch (directError) {
        console.warn('로컬 직접 호출 실패 또는 API Key 누락. 모의(Mock) 데이터를 사용하여 화면을 유지합니다.');
        return getMockChartData(id);
      }
    }
    throw proxyError;
  }
}

/**
 * 차트 API 호출 불가능 시 리턴할 모의(Mock) 데이터 생성 함수
 */
function getMockChartData(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const prices = [];
      const now = Date.now();
      const oneHourMs = 60 * 60 * 1000;
      const basePrice = 100000; // 가상의 기준가

      for (let i = 168; i >= 0; i--) {
        const time = now - i * oneHourMs;
        const noise = (Math.random() - 0.5) * 0.05; // ±2.5% 변동성
        prices.push([time, basePrice * (1 + noise)]);
      }

      resolve({ prices });
    }, 300);
  });
}

