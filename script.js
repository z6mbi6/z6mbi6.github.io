// ===== Solar Zombi — Acid Wash interactions =====

document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- intro gate ---------- */
const gate = document.getElementById('gate');
const enterBtn = document.getElementById('enterBtn');
document.body.style.overflow = 'hidden';

function enterSite(){
  gate.classList.add('hidden');
  document.body.style.overflow = '';
  window.removeEventListener('keydown', onKeyEnter);
}
function onKeyEnter(e){ if(e.key === 'Enter' || e.key === ' ') enterSite(); }
enterBtn.addEventListener('click', enterSite);
window.addEventListener('keydown', onKeyEnter);

/* ---------- scroll reveal ---------- */
const revealTargets = document.querySelectorAll(
  '.about-card, .lore-card, .service-card, .project-card, .link-card, .section-title, .section-kicker'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealTargets.forEach(el => io.observe(el));

/* ---------- cursor trail (ember particles) ---------- */
const canvas = document.getElementById('trail');
const ctx = canvas.getContext('2d');
let w, h;
function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

const particles = [];
const colors = ['#ff2fd0', '#39ff9d', '#00e5ff', '#8a2be2'];

function spawn(x, y){
  if(reduceMotion) return;
  particles.push({
    x, y,
    vx: (Math.random() - 0.5) * 1.4,
    vy: (Math.random() - 0.5) * 1.4 - 0.4,
    life: 1,
    size: Math.random() * 3 + 1.5,
    color: colors[Math.floor(Math.random() * colors.length)]
  });
  if(particles.length > 160) particles.shift();
}

let lastMove = 0;
window.addEventListener('pointermove', (e) => {
  const now = performance.now();
  if(now - lastMove < 20) return;
  lastMove = now;
  spawn(e.clientX, e.clientY);
});

function tick(){
  ctx.clearRect(0, 0, w, h);
  for(let i = particles.length - 1; i >= 0; i--){
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life -= 0.02;
    if(p.life <= 0){ particles.splice(i, 1); continue; }
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(tick);
}
tick();

/* ---------- gallery + lightbox ---------- */
(function initGallery(){
  const data = window.GALLERY_DATA || [];
  const grid = document.getElementById('galleryGrid');
  const filtersEl = document.getElementById('galleryFilters');
  if(!grid || !data.length) return;

  const seriesOrder = [];
  const seenSeries = new Set();
  data.forEach(item => {
    if(!seenSeries.has(item.series)){
      seenSeries.add(item.series);
      seriesOrder.push({ series: item.series, label: item.label });
    }
  });

  // render filter chips
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All';
  allBtn.dataset.series = 'all';
  allBtn.classList.add('active');
  filtersEl.appendChild(allBtn);
  seriesOrder.forEach(({ series, label }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.dataset.series = series;
    filtersEl.appendChild(btn);
  });

  // render grid
  data.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.dataset.series = item.series;
    div.dataset.index = i;
    div.setAttribute('data-label', item.label);
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `Open ${item.label} image`);
    const img = document.createElement('img');
    img.src = item.thumb;
    img.alt = `${item.label} — Solar Zombi`;
    img.loading = 'lazy';
    div.appendChild(img);
    grid.appendChild(div);
  });

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    filtersEl.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const series = btn.dataset.series;
    grid.querySelectorAll('.gallery-item').forEach(el => {
      el.classList.toggle('hidden', series !== 'all' && el.dataset.series !== series);
    });
  });

  // lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  let currentIndex = 0;

  function visibleIndices(){
    return Array.from(grid.querySelectorAll('.gallery-item:not(.hidden)')).map(el => parseInt(el.dataset.index, 10));
  }

  function openLightbox(index){
    currentIndex = index;
    const item = data[index];
    lightboxImg.src = item.full;
    lightboxImg.alt = item.label;
    lightboxCaption.textContent = item.label;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
  function step(dir){
    const vis = visibleIndices();
    const pos = vis.indexOf(currentIndex);
    const next = vis[(pos + dir + vis.length) % vis.length];
    openLightbox(next);
  }

  grid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if(!item) return;
    openLightbox(parseInt(item.dataset.index, 10));
  });
  grid.addEventListener('keydown', (e) => {
    if(e.key !== 'Enter' && e.key !== ' ') return;
    const item = e.target.closest('.gallery-item');
    if(!item) return;
    e.preventDefault();
    openLightbox(parseInt(item.dataset.index, 10));
  });

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => step(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => step(1));
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (e) => {
    if(!lightbox.classList.contains('open')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowLeft') step(-1);
    if(e.key === 'ArrowRight') step(1);
  });
})();

/* ---------- music player (SoundCloud Widget API) ---------- */
(function initMusic(){
  const tracks = window.MUSIC_DATA || [];
  const listEl = document.getElementById('musicList');
  if(!listEl || !tracks.length) return;

  function formatTime(ms){
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  tracks.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'music-row';
    row.dataset.index = i;
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-label', `Play ${t.title}`);

    const art = document.createElement('img');
    art.className = 'music-art';
    art.loading = 'lazy';
    art.alt = '';
    if(t.artwork) art.src = t.artwork;

    const meta = document.createElement('div');
    meta.className = 'music-meta';
    const title = document.createElement('p');
    title.className = 'music-title';
    title.textContent = t.title;
    const genre = document.createElement('p');
    genre.className = 'music-genre';
    genre.textContent = t.genre || 'Unclassified';
    meta.appendChild(title);
    meta.appendChild(genre);

    const plays = document.createElement('span');
    plays.className = 'music-plays';
    plays.textContent = `${t.plays.toLocaleString()} plays`;

    const duration = document.createElement('span');
    duration.className = 'music-duration';
    duration.textContent = formatTime(t.duration_ms);

    row.appendChild(art);
    row.appendChild(meta);
    row.appendChild(plays);
    row.appendChild(duration);
    listEl.appendChild(row);
  });

  // player bar elements
  const bar = document.getElementById('playerBar');
  const barArt = document.getElementById('playerArt');
  const barTitle = document.getElementById('playerTitle');
  const barTime = document.getElementById('playerTime');
  const barDuration = document.getElementById('playerDuration');
  const barSeek = document.getElementById('playerSeek');
  const barVolume = document.getElementById('playerVolume');
  const btnPlay = document.getElementById('playerPlay');
  const btnPrev = document.getElementById('playerPrev');
  const btnNext = document.getElementById('playerNext');
  const btnClose = document.getElementById('playerClose');
  const iframe = document.getElementById('scFrame');

  let widget = null;
  let apiLoaded = false;
  let apiLoading = false;
  let currentIndex = -1;
  let isPlaying = false;
  let userSeeking = false;
  let pendingIndex = null;

  function loadWidgetApi(callback){
    if(apiLoaded){ callback(); return; }
    if(apiLoading){ window.addEventListener('sc-widget-api-ready', callback, { once: true }); return; }
    apiLoading = true;
    const script = document.createElement('script');
    script.src = 'https://w.soundcloud.com/player/api.js';
    script.onload = () => {
      apiLoaded = true;
      window.dispatchEvent(new Event('sc-widget-api-ready'));
      callback();
    };
    document.head.appendChild(script);
  }

  function ensureWidget(callback){
    if(widget){ callback(); return; }
    iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(tracks[0].url)}&auto_play=false&show_artwork=false&visual=false&color=%23ff2fd0`;
    loadWidgetApi(() => {
      widget = SC.Widget(iframe);
      widget.bind(SC.Widget.Events.READY, () => {
        widget.bind(SC.Widget.Events.PLAY, () => { isPlaying = true; btnPlay.textContent = '⏸'; });
        widget.bind(SC.Widget.Events.PAUSE, () => { isPlaying = false; btnPlay.textContent = '▶'; });
        widget.bind(SC.Widget.Events.FINISH, () => playIndex((currentIndex + 1) % tracks.length));
        widget.bind(SC.Widget.Events.PLAY_PROGRESS, (data) => {
          if(userSeeking) return;
          barTime.textContent = formatTime(data.currentPosition);
          barSeek.value = tracks[currentIndex]
            ? Math.round((data.currentPosition / tracks[currentIndex].duration_ms) * 1000)
            : 0;
        });
        widget.setVolume(Number(barVolume.value));
        callback();
      });
    });
  }

  function setActiveRow(index){
    listEl.querySelectorAll('.music-row').forEach(row => {
      row.classList.toggle('playing', Number(row.dataset.index) === index);
    });
  }

  function playIndex(index){
    const track = tracks[index];
    if(!track) return;
    currentIndex = index;
    barTitle.textContent = track.title;
    barArt.src = track.artwork || '';
    barDuration.textContent = formatTime(track.duration_ms);
    barTime.textContent = '0:00';
    barSeek.value = 0;
    setActiveRow(index);
    bar.classList.add('open');
    bar.setAttribute('aria-hidden', 'false');

    const doLoad = () => {
      widget.load(track.url, {
        auto_play: true,
        callback: () => widget.play()
      });
    };

    if(!widget){
      pendingIndex = index;
      ensureWidget(() => { doLoad(); });
    } else {
      doLoad();
    }
  }

  listEl.addEventListener('click', (e) => {
    const row = e.target.closest('.music-row');
    if(!row) return;
    playIndex(Number(row.dataset.index));
  });
  listEl.addEventListener('keydown', (e) => {
    if(e.key !== 'Enter' && e.key !== ' ') return;
    const row = e.target.closest('.music-row');
    if(!row) return;
    e.preventDefault();
    playIndex(Number(row.dataset.index));
  });

  btnPlay.addEventListener('click', () => {
    if(!widget || currentIndex === -1) return;
    if(isPlaying) widget.pause(); else widget.play();
  });
  btnPrev.addEventListener('click', () => {
    if(currentIndex === -1) return;
    playIndex((currentIndex - 1 + tracks.length) % tracks.length);
  });
  btnNext.addEventListener('click', () => {
    if(currentIndex === -1) return;
    playIndex((currentIndex + 1) % tracks.length);
  });
  btnClose.addEventListener('click', () => {
    if(widget) widget.pause();
    bar.classList.remove('open');
    bar.setAttribute('aria-hidden', 'true');
    setActiveRow(-1);
  });

  barSeek.addEventListener('input', () => { userSeeking = true; });
  barSeek.addEventListener('change', () => {
    if(widget && currentIndex !== -1){
      const ms = (Number(barSeek.value) / 1000) * tracks[currentIndex].duration_ms;
      widget.seekTo(ms);
    }
    userSeeking = false;
  });
  barVolume.addEventListener('input', () => {
    if(widget) widget.setVolume(Number(barVolume.value));
  });
})();
