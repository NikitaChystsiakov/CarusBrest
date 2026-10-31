(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 761px)');
  const finePointer = matchMedia('(pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger) && !reduce;
  if (!hasGsap) { root.classList.add('no-motion'); root.classList.remove('js-intro'); }

  /* header + нижняя панель на телефоне */
  const top = $('.top'), dock = $('.dock');
  const onScroll = () => top.classList.toggle('is-scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  /* нижняя панель: после ухода формы первого экрана, но не над формой заявки */
  if ('IntersectionObserver' in window) {
    const seen = { quick: true, lead: false, foot: false };
    const sync = () => dock.classList.toggle('is-on', !seen.quick && !seen.lead && !seen.foot);
    const dio = new IntersectionObserver(es => { es.forEach(e => { seen[e.target.classList.contains('quick') ? 'quick' : e.target.id === 'lead' ? 'lead' : 'foot'] = e.isIntersecting; }); sync(); }, { threshold: 0.15 });
    dio.observe($('.quick')); dio.observe($('#lead')); dio.observe($('.foot'));
  }

  /* плавный скролл (только desktop) */
  let lenis = null;
  if (hasGsap && window.Lenis && desktop.matches) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id === '#top' ? document.body : $(id);
    if (!el) return;
    e.preventDefault();
    root.classList.remove('is-menu'); document.body.style.overflow = ''; lenis && lenis.start();
    lenis ? lenis.scrollTo(el, { offset: id === '#top' ? 0 : -60 }) : el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* видео первого экрана */
  const hv = $('[data-hero-video]'), fv = $('[data-front-video]');
  if (!desktop.matches) { hv.poster = 'assets/img/trx-front-poster.jpg'; fv.remove(); }
  if (!reduce) {
    hv.src = desktop.matches ? 'assets/video/trx.mp4' : 'assets/video/trx-front.mp4';
    hv.play().catch(() => {}); hv.addEventListener('canplay', () => hv.play().catch(() => {}), { once: true });
    /* первый экран ушёл из вида — видео на паузу, не тратим кадры на декодирование */
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => [hv, fv].forEach(v => {
      if (!v.isConnected || !v.getAttribute('src') && !v.querySelector('source')) return;
      if (e.isIntersecting) { if (v === hv || v.preload === 'auto') v.play().catch(() => {}); } else v.pause();
    })).observe($('.stage'));
  }

  /* ленивые видео: грузим и играем только в зоне видимости */
  const lazy = $$('[data-lazy-video]');
  if (!reduce && 'IntersectionObserver' in window) {
    /* одновременно играют не больше 4 роликов (2 на телефоне) — остальные ждут на постере */
    const playing = [];
    const io = new IntersectionObserver(entries => entries.forEach(({ target: v, isIntersecting }) => {
      const k = playing.indexOf(v);
      if (isIntersecting) {
        if (v.preload !== 'auto') { v.preload = 'auto'; v.load(); }
        v.play().catch(() => {});
        if (k < 0) playing.push(v);
        while (playing.length > (desktop.matches ? 4 : 2)) playing.shift().pause();
      } else { v.pause(); if (k > -1) playing.splice(k, 1); }
    }), { threshold: .3 });
    lazy.forEach(v => io.observe(v));
  }

  /* одометр: барабанные цифры */
  const odo = $('[data-odo]');
  const odoCols = [];
  if (odo) {
    const val = odo.dataset.odo; odo.textContent = '';
    [...val].forEach(ch => {
      const d = document.createElement('span'); d.className = 'odo__d';
      if (/\d/.test(ch)) {
        const inner = document.createElement('span');
        const target = +ch;
        const seq = [...Array(10).keys(), ...Array(target + 1).keys()];
        inner.innerHTML = seq.map(n => `<span>${n}</span>`).join('');
        d.appendChild(inner); odoCols.push({ inner, steps: seq.length - 1 });
      } else d.textContent = ch;
      odo.appendChild(d);
    });
  }
  const rollOdo = () => odoCols.forEach(({ inner, steps }, i) => {
    if (!hasGsap) { inner.style.transform = `translateY(-${steps}em)`; return; }
    gsap.fromTo(inner, { y: 0 }, { y: `-${steps}em`, duration: 1.6 + i * 0.25, ease: 'power3.inOut' });
  });

  /* буквы CARUS BREST, внутри которых видео */
  const svg = $('[data-letters]');
  const word = $('.letters__word', svg);
  const NS = 'http://www.w3.org/2000/svg';
  function buildLetters() {
    const W = svg.clientWidth || innerWidth, H = svg.clientHeight || innerHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    /* подложка с запасом: если окно поменяет размер до пересборки, по краям не появится тёмных полос */
    $$('rect, mask', svg).forEach(r => { r.setAttribute('x', -W); r.setAttribute('y', -H); r.setAttribute('width', W * 3); r.setAttribute('height', H * 3); });
    word.innerHTML = '';
    const lines = W < 761 ? ['CARUS', 'BREST'] : ['CARUS BREST'];
    const els = lines.map(l => { const t = document.createElementNS(NS, 'text'); t.textContent = l; t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', 100); word.appendChild(t); return t; });
    const maxW = Math.max(...els.map(t => t.getComputedTextLength()));
    const fs = 100 * (W * (W < 761 ? 0.9 : 0.93)) / maxW;
    const lh = fs * 0.9, total = lh * lines.length;
    const cy = H * (W < 761 ? 0.36 : 0.38);
    els.forEach((t, i) => {
      t.setAttribute('font-size', fs);
      t.setAttribute('x', W / 2);
      t.setAttribute('y', cy - total / 2 + lh * (i + 1) - fs * 0.1);
    });
    const bottom = cy + (lines.length === 1 ? 0.35 : 0.8) * fs;
    const man = $('[data-manifest]');
    man.style.top = (bottom + (W < 761 ? 32 : 56)) + 'px';
    /* лента наезжает на бетон: под абзацем остаётся ровно отступ секции */
    const ticker = $('.ticker');
    if (ticker) ticker.style.marginTop = -Math.max(0, H - (bottom + (W < 761 ? 32 : 56) + man.offsetHeight) - (W < 761 ? 80 : 140)) + 'px';
    return { cx: W / 2, cy, fs, W, H, band: lines.length === 1 ? 3 : 2.4 };
  }

  /* формы: штамп «Заявка принята» */
  $$('[data-form]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const tel = $('input[name="phone"]', f);
    if (tel.value.replace(/\D/g, '').length < 9) { tel.classList.add('is-err'); tel.focus(); return; }
    tel.classList.remove('is-err');
    f.classList.add('is-sent');
    if (hasGsap) gsap.fromTo($('.stamp span', f), { scale: 2.6, opacity: 0, rotate: -24 }, { scale: 1, opacity: 1, rotate: -8, duration: .55, ease: 'back.out(2.2)' });
  }));
  $$('input[name="phone"]').forEach(i => i.addEventListener('input', () => i.classList.remove('is-err')));

  /* шапка: мобильное меню, страницы «в следующем этапе» */
  const burger = $('[data-burger]'), mnav = $('[data-mnav]');
  const setMenu = on => { root.classList.toggle('is-menu', on); burger.setAttribute('aria-expanded', on); mnav.setAttribute('aria-hidden', !on); lenis && (on ? lenis.stop() : lenis.start()); document.body.style.overflow = on ? 'hidden' : ''; };
  burger.addEventListener('click', () => setMenu(!root.classList.contains('is-menu')));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  const toast = $('[data-toast]');
  let toastT = null;
  $$('[data-soon]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); e.stopImmediatePropagation();
    toast.textContent = `«${a.querySelector('b') ? a.querySelector('b').textContent : a.textContent}» — отдельная страница в полной версии сайта`;
    toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on'), 2600);
  }));

  /* СТО: активен последний пункт, чей верх прошёл середину экрана, — всегда ровно один; слева его кадр.
     Новый кадр проявляется поверх прошлого, а прошлый держится под ним, чтобы между ними не мигал чёрный фон */
  const worksBox = $('[data-works]');
  if (worksBox) {
    const works = $$('[data-work-item]', worksBox), imgs = $$('.works__media [data-work]', worksBox), bars = $$('.works__bar i', worksBox), count = $('[data-works-count]', worksBox);
    let on = 0, near = false, wraf = 0;
    const setWork = i => {
      if (i === on) return;
      imgs.forEach((m, n) => { m.classList.toggle('is-prev', n === on); m.classList.toggle('is-on', n === i); });
      works.forEach((w, n) => w.classList.toggle('is-on', n === i));
      bars.forEach((b, n) => b.classList.toggle('is-on', n <= i));
      count.textContent = `0${i + 1} / 0${works.length}`;
      on = i;
    };
    const pick = () => {
      wraf = 0;
      const line = innerHeight * .55; let i = 0;
      works.forEach((w, n) => { if (w.getBoundingClientRect().top <= line) i = n; });
      setWork(i);
    };
    addEventListener('scroll', () => { if (near && !wraf) wraf = requestAnimationFrame(pick); }, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { near = e.isIntersecting; if (near) pick(); }).observe(worksBox);
    else { near = true; pick(); }
  }

  /* глобус: стилизованная Земля из точек, морской путь США → Поти */
  const RAD = Math.PI / 180;
  const globe = (() => {
    const cv = $('[data-globe]'); if (!cv) return null;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, dots = null;
    const st = { lon: -74, lat: 40.6, k: 6, ship: 0, land: 0 };
    const USA = [-74.05, 40.6], POTI = [41.65, 42.15], BREST = [23.73, 52.1];
    const WP = [USA, [-70, 40.2], [-60, 39.3], [-45, 38.2], [-30, 37.2], [-15, 36.3], [-8, 36], [-5.6, 35.95], [-2, 36.2], [3, 37.4], [8.5, 37.8], [11.3, 37.3], [15, 35.9], [20, 35.6], [23.8, 36.4], [25.6, 37.9], [26.1, 39.6], [26.5, 40.25], [28.3, 40.75], [29.05, 41.1], [29.4, 41.35], [31.5, 42.2], [36, 42.5], [40, 42.4], POTI];
    const LAND = [POTI, [44.8, 41.7], [44.6, 43.5], [41, 47], [36, 49.5], [30.5, 50.5], BREST];
    const slerp = (a, b, n) => {
      const out = [];
      const v = p => [Math.cos(p[1] * RAD) * Math.cos(p[0] * RAD), Math.cos(p[1] * RAD) * Math.sin(p[0] * RAD), Math.sin(p[1] * RAD)];
      const A = v(a), B = v(b), d = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
      for (let i = 0; i < n; i++) {
        const t = i / n, s = Math.sin(d) || 1, f1 = Math.sin((1 - t) * d) / s, f2 = Math.sin(t * d) / s;
        const x = f1 * A[0] + f2 * B[0], y = f1 * A[1] + f2 * B[1], z = f1 * A[2] + f2 * B[2];
        out.push([Math.atan2(y, x) / RAD, Math.asin(z) / RAD]);
      }
      return out;
    };
    const dense = pts => { const o = []; for (let i = 0; i < pts.length - 1; i++) o.push(...slerp(pts[i], pts[i + 1], 12)); o.push(pts[pts.length - 1]); return o; };
    const route = dense(WP), land = dense(LAND);
    const at = (arr, t) => { const f = Math.max(0, Math.min(1, t)) * (arr.length - 1), i = Math.floor(f), j = Math.min(arr.length - 1, i + 1), u = f - i; return [arr[i][0] + (arr[j][0] - arr[i][0]) * u, arr[i][1] + (arr[j][1] - arr[i][1]) * u]; };
    const R = () => Math.min(W, H) * (W < 761 ? 0.46 : 0.4) * st.k;
    const proj = (lon, lat) => {
      const l = (lon - st.lon) * RAD, p = lat * RAD, p0 = st.lat * RAD, r = R();
      const cl = Math.cos(l), cp = Math.cos(p), sp = Math.sin(p);
      const c = Math.sin(p0) * sp + Math.cos(p0) * cp * cl;
      return [W / 2 + r * cp * Math.sin(l), H * 0.54 - r * (Math.cos(p0) * sp - Math.sin(p0) * cp * cl), c];
    };
    const size = () => { dpr = Math.min(1.5, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; draw(); };
    const line = (pts, from, to, style, width, dash) => {
      ctx.save(); ctx.strokeStyle = style; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.lineCap = 'round';
      ctx.beginPath(); let pen = false;
      const a = Math.floor(from * (pts.length - 1)), b = Math.ceil(to * (pts.length - 1));
      for (let i = a; i <= b; i++) { const q = proj(pts[i][0], pts[i][1]); if (q[2] > 0) { pen ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); pen = true; } else pen = false; }
      ctx.stroke(); ctx.restore();
    };
    const pin = (p, label, on, dy = 4) => {
      const q = proj(p[0], p[1]); if (q[2] <= 0) return;
      ctx.save(); ctx.globalAlpha = on;
      ctx.fillStyle = 'rgba(255,198,41,.22)'; ctx.beginPath(); ctx.arc(q[0], q[1], 13, 0, 7); ctx.fill();
      ctx.fillStyle = '#FFC629'; ctx.strokeStyle = '#0B0B0C'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, 7); ctx.fill(); ctx.stroke();
      ctx.font = '700 12px Unbounded, sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(label.toUpperCase(), q[0] + 14, q[1] + dy);
      ctx.restore();
    };
    function draw() {
      if (!W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const r = R(), cx = W / 2, cy = H * 0.54;
      const g = ctx.createRadialGradient(cx - r * .3, cy - r * .35, r * .1, cx, cy, r);
      g.addColorStop(0, '#20232a'); g.addColorStop(1, '#0e0f12');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1; ctx.stroke();
      if (dots) {
        const s = Math.max(1.1, Math.min(5, r * 0.0075));
        const sp0 = Math.sin(st.lat * RAD), cp0 = Math.cos(st.lat * RAD), l0 = st.lon * RAD;
        const buckets = [[], [], [], []];
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i], l = d[0] - l0, cl = Math.cos(l);
          const c = sp0 * d[2] + cp0 * d[3] * cl; if (c <= 0.02) continue;
          const x = cx + r * d[3] * Math.sin(l), y = cy - r * (cp0 * d[2] - sp0 * d[3] * cl);
          if (x < -10 || y < -10 || x > W + 10 || y > H + 10) continue;
          buckets[Math.min(3, (c * 4) | 0)].push(x, y);
        }
        buckets.forEach((b, n) => { ctx.fillStyle = `rgba(232,232,236,${.18 + n * .17})`; for (let i = 0; i < b.length; i += 2) ctx.fillRect(b[i] - s / 2, b[i + 1] - s / 2, s, s); });
      }
      line(route, 0, 1, 'rgba(255,255,255,.28)', 1.5, [3, 6]);
      if (st.ship > 0) {
        line(route, 0, st.ship, 'rgba(255,198,41,.25)', 9);
        line(route, 0, st.ship, '#FFC629', 3);
      }
      if (st.land > 0) line(land, 0, st.land, '#FFC629', 2.5, [8, 6]);
      pin(USA, 'США', 1); pin(POTI, 'Поти', Math.min(1, .35 + st.ship)); pin(BREST, 'Брест', st.land > 0 ? 1 : 0, -10);
      if (st.ship > 0 && st.ship < 1) {
        const p = at(route, st.ship), n = at(route, Math.min(1, st.ship + .01));
        const a = proj(p[0], p[1]), b = proj(n[0], n[1]);
        if (a[2] > 0) {
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
          ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(ang);
          ctx.fillStyle = '#FFC629'; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(8, 7); ctx.lineTo(-14, 7); ctx.lineTo(-14, -7); ctx.lineTo(8, -7); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#0B0B0C'; ctx.fillRect(-10, -4, 6, 8); ctx.fillRect(-2, -4, 6, 8);
          ctx.restore();
        }
      }
    }
    fetch('assets/globe-dots.json').then(r => r.json()).then(d => {
      dots = d.map(([lo, la]) => [lo * RAD, la * RAD, Math.sin(la * RAD), Math.cos(la * RAD)]); draw();
    }).catch(() => {});
    // закреплённый ScrollTrigger меняет размер холста уже после resize окна — следим за самим холстом
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(cv); else addEventListener('resize', size);
    size();
    return { st, draw, proj, at, route, USA, POTI };
  })();

  /* телефон: панель «маршрут» — где вы на странице, TRX едет по мини-дороге; по тапу — шторка с остановками */
  const vib = () => navigator.vibrate && navigator.vibrate(8);
  const lock = on => { root.classList.toggle('is-locked', on); lenis && (on ? lenis.stop() : lenis.start()); };
  const sheet = $('[data-sheet]');
  if (sheet && dock) {
    const stops = $$('[data-stop]', sheet), secs = stops.map(a => $(a.getAttribute('href')));
    const label = $('[data-dock-label]'), num = $('[data-dock-n]'), fill = $('[data-dock-fill]'), car = $('[data-dock-car]'), road = $('.dock__road');
    const panel = $('[data-sheet-panel]'), sCar = $('[data-sheet-car]'), openBtn = $('[data-sheet-open]');
    let tops = [], maxY = 1, roadW = 0, cur = -1, raf = 0;
    const measure = () => { tops = secs.map(el => el.getBoundingClientRect().top + scrollY); maxY = Math.max(1, root.scrollHeight - innerHeight); roadW = road.clientWidth; };
    const render = () => {
      const y = scrollY, p = Math.min(1, Math.max(0, y / maxY));
      fill.style.transform = `scaleX(${p})`;
      car.style.transform = `translateX(${p * roadW}px)`;
      let i = 0; tops.forEach((t, k) => { if (y + innerHeight * .45 >= t) i = k; });
      if (i === cur) return;
      cur = i;
      label.textContent = $('b', stops[i]).textContent;
      label.classList.remove('is-roll'); void label.offsetWidth; label.classList.add('is-roll');
      num.textContent = `${i + 1}/${stops.length}`;
    };
    const sync = () => { measure(); render(); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); }, { passive: true });
    addEventListener('resize', sync); addEventListener('load', sync);
    window.ScrollTrigger && ScrollTrigger.addEventListener('refresh', sync);
    sync();

    /* машинка в шторке подъезжает к остановке, где вы сейчас */
    const place = () => {
      stops.forEach((a, k) => { a.classList.toggle('is-here', k === cur); a.classList.toggle('is-past', k < cur); });
      const a = stops[cur], y = a.offsetTop + a.offsetHeight / 2 - sCar.offsetHeight / 2;
      hasGsap ? gsap.fromTo(sCar, { y: 0 }, { y, duration: .9, delay: .2, ease: 'power3.inOut' }) : sCar.style.transform = `translateY(${y}px)`;
    };
    if (hasGsap) gsap.set(panel, { yPercent: 105 });
    const open = () => {
      sync();
      sheet.classList.add('is-open'); sheet.setAttribute('aria-hidden', 'false'); openBtn.setAttribute('aria-expanded', 'true');
      lock(true); vib();
      if (hasGsap) {
        gsap.fromTo(panel, { yPercent: 105, y: 0 }, { yPercent: 0, duration: .55, ease: 'back.out(1.1)' });
        gsap.from(stops, { x: 26, opacity: 0, duration: .45, stagger: .04, delay: .12, ease: 'power2.out' });
      } else panel.style.transform = 'none';
      place();
    };
    const close = () => {
      if (!sheet.classList.contains('is-open')) return;
      sheet.setAttribute('aria-hidden', 'true'); openBtn.setAttribute('aria-expanded', 'false');
      lock(false);
      const done = () => sheet.classList.remove('is-open');
      hasGsap ? gsap.to(panel, { yPercent: 105, y: 0, duration: .35, ease: 'power2.in', onComplete: done }) : (panel.style.transform = '', done());
    };
    openBtn.addEventListener('click', open);
    $$('[data-sheet-close]', sheet).forEach(b => b.addEventListener('click', close));
    /* переход по остановке: сначала снимаем блокировку скролла, потом срабатывает общий якорный скролл */
    sheet.addEventListener('click', e => { if (e.target.closest('a')) { vib(); close(); } }, true);
    /* шторку можно смахнуть вниз */
    let y0 = null, dy = 0, t0 = 0;
    panel.addEventListener('touchstart', e => { y0 = panel.scrollTop <= 0 ? e.touches[0].clientY : null; dy = 0; t0 = performance.now(); }, { passive: true });
    panel.addEventListener('touchmove', e => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); hasGsap ? gsap.set(panel, { y: dy }) : panel.style.translate = `0 ${dy}px`; }, { passive: true });
    panel.addEventListener('touchend', () => {
      if (y0 === null) return; y0 = null;
      if (dy > 90 || dy / Math.max(1, performance.now() - t0) > .6) close();
      else hasGsap ? gsap.to(panel, { y: 0, duration: .35, ease: 'back.out(2)' }) : panel.style.translate = '';
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* «Привезли»: на телефоне ролики открываются как сторис — с полосками, тапами и удержанием */
  const stories = $('[data-stories]'), row = $('[data-storyrow]');
  if (stories && row) {
    const mob = matchMedia('(max-width: 760px)');
    const items = $$('.wall .reel:not(.reel--more)').map(r => ({ el: r, src: $('source', r).getAttribute('src'), poster: $('video', r).getAttribute('poster'),
      sticker: ($('.sticker', r) || {}).textContent || '', q: ($('q', r) || {}).textContent || '', href: r.href }));
    const sv = $('[data-stories-video]'), bars = $('[data-stories-bars]'), q = $('[data-stories-q]');
    bars.innerHTML = items.map(() => '<i><b></b></i>').join('');
    const fills = $$('b', bars);
    row.innerHTML = items.map((it, i) => `<button type="button" class="story" data-story="${i}"><span class="story__ring"><img src="${it.poster}" alt="" loading="lazy"></span><small>${it.sticker}</small></button>`).join('');
    const rings = $$('.story', row);
    const MAX = 7; /* секунд на ролик, как в сторис */
    let idx = 0, tickId = 0, held = false, holdT = 0, py = 0;
    const isOpen = () => stories.classList.contains('is-open');
    const tick = () => {
      const d = Math.min(sv.duration || MAX, MAX), p = Math.min(1, sv.currentTime / d || 0);
      fills[idx].style.transform = `scaleX(${p})`;
      if (p >= 1) return next();
      tickId = requestAnimationFrame(tick);
    };
    const show = i => {
      cancelAnimationFrame(tickId); idx = i;
      fills.forEach((f, k) => { f.style.transform = `scaleX(${k < i ? 1 : 0})`; });
      const it = items[i];
      sv.poster = it.poster; sv.src = it.src; sv.play().catch(() => {});
      $('[data-stories-sticker]').textContent = it.sticker;
      q.textContent = it.q; q.hidden = !it.q;
      $('[data-stories-ig]').href = it.href;
      rings[i].classList.add('is-seen');
      tickId = requestAnimationFrame(tick);
    };
    const closeS = () => {
      if (!isOpen()) return;
      cancelAnimationFrame(tickId); sv.pause(); sv.removeAttribute('src'); sv.load();
      stories.classList.remove('is-open'); stories.setAttribute('aria-hidden', 'true'); lock(false);
    };
    const next = () => idx < items.length - 1 ? show(idx + 1) : closeS();
    const openS = i => { stories.classList.add('is-open'); stories.setAttribute('aria-hidden', 'false'); lock(true); vib(); show(i); };
    items.forEach((it, i) => it.el.addEventListener('click', e => { if (!mob.matches) return; e.preventDefault(); openS(i); }));
    row.addEventListener('click', e => { const b = e.target.closest('[data-story]'); if (b) openS(+b.dataset.story); });
    $('[data-stories-next]').addEventListener('click', () => { if (!held && isOpen()) { vib(); next(); } });
    $('[data-stories-prev]').addEventListener('click', () => { if (!held && isOpen()) { vib(); show(Math.max(0, idx - 1)); } });
    $('[data-stories-close]').addEventListener('click', closeS);
    stories.addEventListener('click', e => { if (e.target.closest('[data-stories-lead]')) closeS(); }, true);
    /* удержание — пауза, свайп вниз — закрыть */
    stories.addEventListener('pointerdown', e => {
      py = e.clientY; held = false;
      if (e.target.closest('a,[data-stories-close]')) return;
      holdT = setTimeout(() => { held = true; sv.pause(); }, 220);
    });
    const release = e => {
      clearTimeout(holdT);
      if (held) { sv.play().catch(() => {}); setTimeout(() => { held = false; }, 0); }
      if (e.clientY - py > 90) { held = true; closeS(); setTimeout(() => { held = false; }, 0); }
    };
    stories.addEventListener('pointerup', release); stories.addEventListener('pointercancel', release);
    addEventListener('keydown', e => { if (!isOpen()) return; if (e.key === 'Escape') closeS(); if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') show(Math.max(0, idx - 1)); });
  }

  if (!hasGsap) {
    rollOdo();
    $$('.manifest').forEach(m => { m.style.opacity = 1; m.style.visibility = 'visible'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const ease = 'power3.out';

  /* магнитные кнопки */
  if (finePointer) $$('[data-magnetic]').forEach(b => {
    const xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .18); yTo((e.clientY - r.top - r.height / 2) * .3); });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });

  /* интро: щит CB рисуется и открывает видео */
  const heroIn = gsap.timeline({ paused: true, defaults: { ease } })
    .from('.hero__title .w > span', { yPercent: 110, duration: 1, stagger: .1, ease: 'power4.out' })
    .from('.hero__sub [data-dline] i', { scaleX: 0, duration: 1.1, stagger: .12, ease: 'power3.inOut' }, '-=.6')
    .from('.hero__sub p', { opacity: 0, x: -16, duration: .6 }, '-=.8')
    .from('.quick', { y: 40, opacity: 0, duration: .9 }, '-=.9')
    .from('.top', { y: -20, opacity: 0, duration: .6 }, '-=.9')
    .from('.hero__quote', { y: 14, opacity: 0, rotate: -8, duration: .6, ease: 'back.out(2)' }, '-=.5')
    .from('.hero__ig', { opacity: 0, duration: .5 }, '-=.6')
    .add(rollOdo, '-=.6');

  if (root.classList.contains('js-intro')) {
    try { sessionStorage.setItem('cb-intro', '1'); } catch (e) {}
    lenis && lenis.stop();
    const path = $('.shield-path');
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.timeline({ delay: .15, onComplete: () => { root.classList.remove('js-intro'); lenis && lenis.start(); } })
      .to(path, { strokeDashoffset: 0, duration: 1.05, ease: 'power2.inOut' })
      .to(path, { fill: '#fff', duration: .3 }, '-=.15')
      .to('.intro__shield', { scale: .86, opacity: 0, duration: .35, ease: 'power2.in' }, '+=.1')
      .to('.intro__panel--l', { xPercent: -101, duration: .8, ease: 'power4.inOut' }, '-=.1')
      .to('.intro__panel--r', { xPercent: 101, duration: .8, ease: 'power4.inOut' }, '<')
      .add(() => heroIn.play(), '-=.45');
  } else heroIn.play();

  /* первый экран → видео уходит в буквы CARUS BREST; в буквах — TRX мордой в кадр */
  /* ролик для букв грузим заранее, пока человек смотрит первый экран, — а не в момент первого скролла */
  const warmFront = () => { if (fv.isConnected && fv.preload !== 'auto') { fv.preload = 'auto'; fv.load(); } };
  const idle = window.requestIdleCallback || (f => setTimeout(f, 1));
  addEventListener('load', () => setTimeout(() => idle(warmFront), 1200), { once: true });
  let center = buildLetters();
  const zoom = { s: 9 };
  /* зум — CSS-трансформом всего svg: его масштабирует видеокарта, маска не перерисовывается на каждом кадре */
  const setZoom = () => { svg.style.transformOrigin = `${center.cx}px ${center.cy}px`; svg.style.transform = `scale(${zoom.s})`; };
  setZoom();
  const media = $('[data-media]');
  const bandH = () => center.fs * center.band;
  const stageTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.stage', start: 'top top', end: () => '+=' + innerHeight * (desktop.matches ? 0.9 : 0.7), pin: true, scrub: .6, invalidateOnRefresh: true,
      onRefreshInit: () => { center = buildLetters(); setZoom(); },
      onEnter: () => { warmFront(); fv.isConnected && fv.play().catch(() => {}); } }
  });
  stageTl
    .to('.hero', { autoAlpha: 0, y: -60, duration: .24 }, 0)
    .to('.stage__shade', { opacity: 0, duration: .26 }, .04)
    .fromTo(svg, { opacity: 0 }, { opacity: 1, duration: .26 }, .1)
    .fromTo(zoom, { s: 9 }, { s: 1, duration: .66, ease: 'power2.inOut', onUpdate: setZoom }, .1)
    .fromTo(media, { top: 0, height: () => desktop.matches ? center.H : center.H * .62 },
      { top: () => center.cy - bandH() / 2, height: bandH, duration: .3, ease: 'power2.inOut' }, .46)
    .fromTo('.manifest', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .14 }, .74)
    .to({}, { duration: .1 });
  if (fv.isConnected) stageTl.to(fv, { opacity: 1, duration: .2 }, .14);
  /* при ресайзе во время пина буквы собираются по старому размеру блока — когда размер устоится, пересобираем */
  if ('ResizeObserver' in window) {
    let rt = 0;
    new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => {
      if (Math.abs(svg.clientWidth - center.W) > 1 || Math.abs(svg.clientHeight - center.H) > 1) ScrollTrigger.refresh();
    }, 250); }).observe(svg);
  }

  /* бегущая строка: скорость и направление от скролла */
  const track = $('[data-ticker]');
  track.innerHTML += track.innerHTML;
  const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  let dir = 1;
  ScrollTrigger.create({
    onUpdate: self => {
      const v = self.getVelocity();
      dir = v < 0 ? -1 : 1;
      loop.timeScale(dir * Math.min(1 + Math.abs(v) / 250, 7));
      gsap.to(loop, { timeScale: dir, duration: 1.2, ease: 'power2.out', overwrite: true });
    }
  });

  /* маршрут: аукцион → глобус → Поти */
  if (globe) {
    const { st } = globe;
    const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
    const seg = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
    const smooth = t => t * t * (3 - 2 * t);
    const usa = $('[data-jstage="usa"]'), poti = $('[data-jstage="poti"]'), jcard = $('[data-jcard]'), jhead = $('[data-jhead]');
    const labels = $$('[data-jlabel]');
    const endLon = globe.at(globe.route, 1)[0];
    let raf = 0, P = 0, jcW = 0, jcH = 0, lw = [];
    addEventListener('resize', () => { jcW = 0; });
    const render = () => {
      raf = 0; const p = P;
      const a = smooth(seg(p, .08, .26)), z = smooth(seg(p, .76, .9));
      st.ship = seg(p, .3, .76);
      const sp = globe.at(globe.route, st.ship);
      if (p < .3) { st.lon = lerp(-74.05, -66, a); st.lat = lerp(40.6, 34.6, a); st.k = lerp(6, 1, a); }
      else if (p < .76) { st.lon = sp[0] + 8; st.lat = sp[1] - 6; st.k = 1; }
      else { st.lon = lerp(endLon + 8, 41.65, z); st.lat = lerp(36.15, 42.15, z); st.k = lerp(1, 7, z); }
      st.land = 0;
      globe.draw();
      /* аукцион сжимается в точку порта США */
      const u = globe.proj(-74.05, 40.6);
      usa.style.clipPath = `circle(${lerp(150, 0, a)}% at ${u[0]}px ${u[1]}px)`;
      usa.style.visibility = a >= 1 ? 'hidden' : 'visible';
      /* Поти раскрывается из своей точки */
      const q = globe.proj(41.65, 42.15), o = smooth(seg(p, .86, 1));
      poti.style.clipPath = `circle(${lerp(0, 150, o)}% at ${q[0]}px ${q[1]}px)`;
      poti.style.visibility = o > 0 ? 'visible' : 'hidden';
      /* карточка порта США рядом с точкой */
      const c = seg(p, .2, .26) * (1 - seg(p, .36, .42));
      if (!jcW) { jcW = jcard.offsetWidth; jcH = jcard.offsetHeight; lw = labels.map(l => l.offsetWidth); }
      jcard.style.opacity = c;
      /* на телефоне карточка стоит внизу экрана и не закрывает заголовок */
      jcard.style.transform = desktop.matches ? `translate(${Math.min(u[0] + 24, innerWidth - jcW - 16)}px, ${Math.max(90, u[1] - jcH - 20)}px) scale(${.92 + c * .08})` : `scale(${.92 + c * .08})`;
      jhead.style.opacity = seg(p, .22, .3) * (1 - seg(p, .78, .84));
      labels.forEach((l, k) => {
        const t = +l.dataset.jlabel, v = st.ship >= t ? 1 - seg(st.ship, t + .1, t + .16) : 0;
        const pt = globe.at(globe.route, t), s = globe.proj(pt[0], pt[1]);
        const half = (lw[k] || 0) / 2 + 8;
        l.style.opacity = s[2] > 0 ? v : 0; l.style.left = Math.min(innerWidth - half, Math.max(half, s[0])) + 'px'; l.style.top = s[1] + 'px';
      });
    };
    ScrollTrigger.create({
      trigger: '[data-journey]', start: 'top top', end: () => '+=' + innerHeight * (desktop.matches ? 4.6 : 4), pin: true, scrub: true,
      onUpdate: self => { P = self.progress; if (!raf) raf = requestAnimationFrame(render); },
      onRefresh: self => { P = self.progress; render(); }
    });
    render();
  }

  /* дорога Поти → Брест: разметка прорисовывается, TRX едет вниз */
  const roadSec = $('[data-road-sec]');
  if (roadSec) {
    const car = $('[data-road-car]'), mids = $$('[data-road-mid] i');
    const strip = car.parentNode;
    gsap.timeline({ scrollTrigger: { trigger: roadSec, start: 'top 55%', end: 'bottom 60%', scrub: .4, invalidateOnRefresh: true } })
      .fromTo(mids, { scaleY: 0 }, { scaleY: 1, ease: 'none' }, 0)
      .fromTo(car, { top: 70 }, { top: () => strip.offsetHeight - car.offsetHeight, ease: 'none' }, 0);
    $$('.stop', roadSec).forEach(s => gsap.from(s, { x: s.classList.contains('stop--r') ? 60 : -60, opacity: 0, duration: .8, ease,
      scrollTrigger: { trigger: s, start: 'top 72%' } }));
  }

  /* дрэг-заезд: «ёлка» загорается, машины едут по скроллу */
  const drag = $('[data-drag]');
  if (drag) {
    const fast = $('[data-car="fast"]'), slow = $('[data-car="slow"]');
    const gatesSlow = $$('.lane--slow .gate', drag), gateOwn = $('.gate--own', drag);
    const note = $('[data-slow-note]'), stamp = $('[data-fast-stamp]');
    const lights = $$('[data-tree] i', drag);
    const track = fast.parentElement;
    const xAt = pct => track.clientWidth * pct - fast.offsetWidth - 6;
    /* медленная машина: едет — застревает у шлагбаума — едет дальше */
    const slowX = p => {
      const g = [.26, .48, .66].map(xAt);
      const k = [[0, .16, 0, g[0]], [.16, .36, g[0], g[0]], [.36, .48, g[0], g[1]], [.48, .68, g[1], g[1]], [.68, .78, g[1], g[2]], [.78, 1, g[2], g[2]]];
      for (const [a, b, x1, x2] of k) if (p <= b) return x1 + (x2 - x1) * ((p - a) / (b - a));
      return g[2];
    };
    const upd = p => {
      const fx = (track.clientWidth - fast.offsetWidth - 28) * Math.min(1, p / .82);
      fast.style.transform = `translate(${fx}px,-50%)`;
      slow.style.transform = `translate(${slowX(p)}px,-50%)`;
      gatesSlow.forEach((g, i) => g.classList.toggle('is-hit', p > [.15, .47, .77][i]));
      gateOwn.classList.toggle('is-hit', fx > xAt(.42));
      stamp.classList.toggle('is-on', p > .84); note.style.opacity = p > .84 ? 1 : 0;
    };
    /* блок встаёт по центру экрана, пока идёт заезд, — финиш и «Ключи у вас» видно целиком */
    ScrollTrigger.create({ trigger: drag, start: () => innerHeight < drag.offsetHeight + 120 ? 'top 80px' : 'center center', end: () => '+=' + innerHeight * .9,
      pin: true, scrub: .5, invalidateOnRefresh: true,
      onUpdate: s => upd(s.progress), onRefresh: s => upd(s.progress) });
    ScrollTrigger.create({ trigger: drag, start: 'top 80%', once: true, onEnter: () => {
      const tl = gsap.timeline();
      lights.forEach((l, i) => tl.add(() => l.classList.add('on'), i * .35));
      tl.add(() => lights.slice(0, 3).forEach(l => l.classList.remove('on')), lights.length * .35 + .6);
    } });
    upd(0);
  }

  const mm = gsap.matchMedia();
  mm.add({ d: '(min-width: 761px)', m: '(max-width: 760px)' }, ctx => {
    const { d } = ctx.conditions;
    /* стена рилсов: колонки едут с разной скоростью */
    $$('.wall__col').forEach(col => gsap.fromTo(col, { y: () => -(+col.dataset.shift) * (d ? 1 : .5) }, { y: () => (+col.dataset.shift) * (d ? 1 : .5), ease: 'none',
      scrollTrigger: { trigger: '.wall', start: 'top bottom', end: 'bottom top', scrub: true } }));
  });

  /* заголовки секций */
  $$('.cars__head .h2, .culture__copy .h2, .lead__head .h2, .sto-sec__title').forEach(h => gsap.from(h, { y: 70, opacity: 0, duration: 1, ease, scrollTrigger: { trigger: h, start: 'top 85%' } }));
  gsap.from('.reel', { y: 80, opacity: 0, duration: 1, stagger: .08, ease, scrollTrigger: { trigger: '.wall', start: 'top 80%' } });

  /* автокультура: дым бернаута на входе, отзывы-наклейки выпрыгивают */
  const smoke = $('[data-smoke]');
  ScrollTrigger.create({ trigger: '.culture', start: 'top 75%', once: true, onEnter: () => {
    smoke.preload = 'auto'; smoke.currentTime = 0;
    const hold = desktop.matches ? 1.4 : .5;
    smoke.play().then(() => gsap.timeline().to(smoke, { opacity: 1, duration: .25 }).to(smoke, { opacity: 0, duration: desktop.matches ? 1 : .45 }, hold)).catch(() => {});
  } });
  gsap.from('.quote', { y: 60, scale: .7, opacity: 0, duration: .7, stagger: .14, ease: 'back.out(1.8)', scrollTrigger: { trigger: '[data-quotes]', start: 'top 80%' } });

  /* заявка */
  gsap.from('.form', { y: 60, opacity: 0, duration: 1, ease, scrollTrigger: { trigger: '.lead', start: 'top 75%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
