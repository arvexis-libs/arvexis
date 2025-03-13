// ===== ARVEXIS NAVIGATION =====
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }
  const navBtn = document.querySelector('[data-page="' + page + '"]');
  if (navBtn) navBtn.classList.add('active');

  if (page === 'home') {
    initHeroChart();
    if (document.getElementById('hero-btc-price')) refreshHeroTokenPrices();
  }
  if (page === 'solutions') {
    setTimeout(() => {
      if (document.getElementById('donutChart') && !donutChartInit) initAnalyticsCharts();
    }, 100);
  }
}

// ===== TABS =====
function switchTab(tab, btn) {
  const trigger = btn || (typeof event !== 'undefined' ? event.currentTarget : null);
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (trigger) trigger.classList.add('active');
  if (tab === 'analytics' && !donutChartInit) {
    setTimeout(initAnalyticsCharts, 100);
  }
}

// ===== CHARTS =====
let heroChartInit = false;
let donutChartInit = false;

const chartColor = {
  line: '#0f766e',
  fill: 'rgba(15,118,110,0.12)',
  point: '#0f766e',
  grid: '#e8e4dc',
  tick: '#5c6578'
};

function initHeroChart() {
  if (heroChartInit) return;
  heroChartInit = true;
  const ctx = document.getElementById('heroChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [{
        label: 'Illustrative AUM ($B)',
        data: [0.08, 0.09, 0.10, 0.11, 0.12, 0.14, 0.16, 0.18, 0.21, 0.24, 0.28, 0.32],
        borderColor: chartColor.line,
        backgroundColor: chartColor.fill,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColor.point,
        pointRadius: 3,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#faf8f5',
          titleColor: '#0c1222',
          bodyColor: '#5c6578',
          borderColor: '#e2ddd4',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: ctx => ' $' + ctx.raw + 'B (sample)'
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, family: 'DM Sans' }, color: chartColor.tick }
        },
        y: {
          grid: { color: chartColor.grid },
          ticks: {
            font: { size: 11, family: 'DM Sans' },
            color: chartColor.tick,
            callback: v => '$' + v + 'B'
          }
        }
      }
    }
  });
}

function initAnalyticsCharts() {
  if (donutChartInit) return;
  donutChartInit = true;

  const palette = ['#0f766e', '#1e293b', '#b45309', '#0e7490', '#4d7c0f'];

  const dCtx = document.getElementById('donutChart');
  if (dCtx) {
    new Chart(dCtx, {
      type: 'doughnut',
      data: {
        labels: ['Bitcoin', 'Ethereum', 'Stablecoins', 'Altcoins', 'DeFi'],
        datasets: [{
          data: [42, 28, 15, 10, 5],
          backgroundColor: palette,
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 12, family: 'DM Sans' },
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 8
            }
          },
          tooltip: {
            callbacks: { label: ctx => ' ' + ctx.label + ': ' + ctx.raw + '%' }
          }
        }
      }
    });
  }

  const bCtx = document.getElementById('barChart');
  if (bCtx) {
    new Chart(bCtx, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'Return %',
          data: [12, 19, 8, 24, 15, 31, 18, 22, 14, 28, 35, 20],
          backgroundColor: (ctx) => {
            const v = ctx.raw;
            if (v > 25) return '#0f766e';
            if (v > 15) return '#1e293b';
            return '#99f6e4';
          },
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => ' ' + ctx.raw + '%' }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, family: 'DM Sans' }, color: chartColor.tick }
          },
          y: {
            grid: { color: chartColor.grid },
            ticks: {
              font: { size: 11, family: 'DM Sans' },
              color: chartColor.tick,
              callback: v => v + '%'
            }
          }
        }
      }
    });
  }
}

// ===== LIVE TOKEN PRICES =====
const HERO_PRICE_POLL_MS = 30000;
const geckoMarketsUrl =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&sparkline=true&price_change_percentage=24h';

function fetchWithTimeout(url, ms) {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), ms);
  return fetch(url, { signal: c.signal }).finally(() => clearTimeout(id));
}

async function fetchCoinbaseSpot(base) {
  const r = await fetchWithTimeout('https://api.coinbase.com/v2/prices/' + base + '-USD/spot', 10000);
  if (!r.ok) throw new Error('coinbase');
  const j = await r.json();
  const amt = j && j.data && j.data.amount;
  const n = parseFloat(amt);
  if (Number.isNaN(n)) throw new Error('coinbase parse');
  return n;
}

async function applyCoinbaseFallback(priceBtc, priceEth, metaBtc, metaEth, sparkBtc, sparkEth) {
  const [btcAm, ethAm] = await Promise.all([fetchCoinbaseSpot('BTC'), fetchCoinbaseSpot('ETH')]);
  priceBtc.textContent = formatUsd(btcAm);
  priceEth.textContent = formatUsd(ethAm);
  metaBtc.textContent = 'USD';
  metaEth.textContent = 'USD';
  clearHeroSpark(sparkBtc);
  clearHeroSpark(sparkEth);
}

function formatUsd(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
}

function format24h(change) {
  if (change == null || Number.isNaN(change)) return '';
  const sign = change >= 0 ? '+' : '';
  return sign + change.toFixed(2) + '% 24h';
}

function downsampleSeries(arr, maxPts) {
  if (!arr || arr.length <= maxPts) return arr || [];
  const out = [];
  const n = arr.length;
  for (let i = 0; i < maxPts; i++) {
    out.push(arr[Math.min(n - 1, Math.floor((i * (n - 1)) / (maxPts - 1)))]);
  }
  return out;
}

function clearHeroSpark(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = 140;
  const h = 56;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
}

function drawHeroSparkline(canvas, prices) {
  if (!canvas || !prices || prices.length < 2) {
    clearHeroSpark(canvas);
    return;
  }
  const clean = prices.filter((p) => typeof p === 'number' && !Number.isNaN(p));
  if (clean.length < 2) {
    clearHeroSpark(canvas);
    return;
  }
  const series = downsampleSeries(clean, 52);
  const logicalW = 140;
  const logicalH = 56;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = logicalW * dpr;
  canvas.height = logicalH * dpr;
  canvas.style.width = logicalW + 'px';
  canvas.style.height = logicalH + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, logicalW, logicalH);

  const min = Math.min(...series);
  const max = Math.max(...series);
  const rng = max - min || 1e-12;
  const padX = 2;
  const padY = 5;
  const w = logicalW;
  const h = logicalH;
  const pts = series.map((p, i) => {
    const x = padX + (i / (series.length - 1)) * (w - 2 * padX);
    const y = padY + (1 - (p - min) / rng) * (h - 2 * padY);
    return [x, y];
  });

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.lineTo(pts[pts.length - 1][0], h - padY);
  ctx.lineTo(pts[0][0], h - padY);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, padY, 0, h - padY);
  g.addColorStop(0, 'rgba(15,118,110,0.2)');
  g.addColorStop(1, 'rgba(15,118,110,0.02)');
  ctx.fillStyle = g;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 1.75;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

async function refreshHeroTokenPrices() {
  const priceBtc = document.getElementById('hero-btc-price');
  const priceEth = document.getElementById('hero-eth-price');
  const metaBtc = document.getElementById('hero-btc-meta');
  const metaEth = document.getElementById('hero-eth-meta');
  const sparkBtc = document.getElementById('hero-btc-spark');
  const sparkEth = document.getElementById('hero-eth-spark');
  if (!priceBtc || !priceEth || !metaBtc || !metaEth) return;

  try {
    const res = await fetchWithTimeout(geckoMarketsUrl, 12000);
    if (!res.ok) throw new Error('bad status');
    const list = await res.json();
    const btc = Array.isArray(list) ? list.find((c) => c.id === 'bitcoin') : null;
    const eth = Array.isArray(list) ? list.find((c) => c.id === 'ethereum') : null;

    if (btc && btc.current_price != null) {
      priceBtc.textContent = formatUsd(btc.current_price);
      const ch = format24h(btc.price_change_percentage_24h);
      metaBtc.textContent = (ch ? ch + ' · ' : '') + 'USD · 7d';
      drawHeroSparkline(sparkBtc, btc.sparkline_in_7d && btc.sparkline_in_7d.price);
    } else {
      priceBtc.textContent = '—';
      metaBtc.textContent = 'No data';
      clearHeroSpark(sparkBtc);
    }

    if (eth && eth.current_price != null) {
      priceEth.textContent = formatUsd(eth.current_price);
      const ch = format24h(eth.price_change_percentage_24h);
      metaEth.textContent = (ch ? ch + ' · ' : '') + 'USD · 7d';
      drawHeroSparkline(sparkEth, eth.sparkline_in_7d && eth.sparkline_in_7d.price);
    } else {
      priceEth.textContent = '—';
      metaEth.textContent = 'No data';
      clearHeroSpark(sparkEth);
    }

    if (
      !(btc && btc.current_price != null) ||
      !(eth && eth.current_price != null)
    ) {
      throw new Error('incomplete gecko');
    }
  } catch (e) {
    try {
      await applyCoinbaseFallback(priceBtc, priceEth, metaBtc, metaEth, sparkBtc, sparkEth);
    } catch (e2) {
      priceBtc.textContent = '—';
      priceEth.textContent = '—';
      metaBtc.textContent = 'Unable to load · check network';
      metaEth.textContent = 'Unable to load · check network';
      clearHeroSpark(sparkBtc);
      clearHeroSpark(sparkEth);
    }
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initHeroChart();
  if (document.getElementById('hero-btc-price')) {
    refreshHeroTokenPrices();
    setInterval(refreshHeroTokenPrices, HERO_PRICE_POLL_MS);
  }

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'all 0.3s cubic-bezier(0.4,0,0.2,1)';
    });
  });

  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('focus', () => {
      el.style.borderColor = '#0f766e';
      el.style.boxShadow = '0 0 0 3px rgba(15,118,110,0.12)';
    });
    el.addEventListener('blur', () => {
      el.style.borderColor = '#e2ddd4';
      el.style.boxShadow = 'none';
    });
  });
});
