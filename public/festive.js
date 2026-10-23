/* Leela Laher Tech Point - festive themes (currently: Diwali). Switched in Admin > Settings. */
(function () {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const DIYA = `<svg viewBox="0 0 80 80" aria-hidden="true">
    <defs>
      <radialGradient id="fsGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd36b" stop-opacity=".9"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></radialGradient>
      <radialGradient id="fsFlame" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff7cc"/><stop offset=".45" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff7a1a"/></radialGradient>
      <linearGradient id="fsClay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2994a"/><stop offset=".6" stop-color="#c2410c"/><stop offset="1" stop-color="#7c2d12"/></linearGradient>
    </defs>
    <circle class="fs-glow" cx="40" cy="34" r="26" fill="url(#fsGlow)"/>
    <path class="fs-flame" d="M40 14 C47 26 49 33 40 44 C31 33 33 26 40 14 Z" fill="url(#fsFlame)"/>
    <path d="M10 46 Q40 44 70 46 Q66 66 40 68 Q14 66 10 46 Z" fill="url(#fsClay)"/>
    <path d="M10 46 Q40 52 70 46" fill="none" stroke="#ffd36b" stroke-width="2.4"/>
    <g fill="#ffd36b"><circle cx="24" cy="57" r="1.8"/><circle cx="40" cy="60" r="1.8"/><circle cx="56" cy="57" r="1.8"/></g>
  </svg>`;

  const LANTERN = `<svg viewBox="0 0 80 190" aria-hidden="true">
    <defs>
      <linearGradient id="fsPaper" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b91c1c"/><stop offset=".5" stop-color="#f97316"/><stop offset="1" stop-color="#b91c1c"/></linearGradient>
      <radialGradient id="fsInner" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".95"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
    </defs>
    <line x1="40" y1="0" x2="40" y2="44" stroke="#d4a017" stroke-width="1.6"/>
    <rect x="28" y="40" width="24" height="7" rx="2" fill="#d4a017"/>
    <path d="M14 58 L40 47 L66 58 L66 110 L40 121 L14 110 Z" fill="url(#fsPaper)"/>
    <path d="M14 58 L40 69 L66 58 M40 69 L40 121 M14 110 L40 99 L66 110" stroke="#ffd36b" stroke-width="1.6" fill="none" opacity=".9"/>
    <ellipse cx="40" cy="84" rx="20" ry="26" fill="url(#fsInner)"/>
    <path d="M30 84 l10-12 10 12 -10 12z" fill="#ffd36b" opacity=".9"/>
    <rect x="30" y="119" width="20" height="6" rx="2" fill="#d4a017"/>
    <g stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round">
      <path d="M32 125 v44"/><path d="M36 125 v54"/><path d="M40 125 v62"/><path d="M44 125 v54"/><path d="M48 125 v44"/>
    </g>
    <g fill="#dc2626"><circle cx="32" cy="171" r="2.4"/><circle cx="40" cy="188" r="2.6"/><circle cx="48" cy="171" r="2.4"/></g>
  </svg>`;

  // rangoli: concentric petal rings with dots (drawn once, used as a floor image)
  function rangoli() {
    const ring = (n, r, len, w, fill) => Array.from({ length: n }, (_, i) =>
      `<ellipse cx="200" cy="${200 - r}" rx="${w}" ry="${len}" fill="${fill}" transform="rotate(${i * 360 / n} 200 200)"/>`).join('');
    const dots = (n, r, rad, fill) => Array.from({ length: n }, (_, i) => {
      const a = i * 2 * Math.PI / n; return `<circle cx="${(200 + r * Math.sin(a)).toFixed(1)}" cy="${(200 - r * Math.cos(a)).toFixed(1)}" r="${rad}" fill="${fill}"/>`;
    }).join('');
    return `<svg viewBox="0 0 400 400" aria-hidden="true">
      <circle cx="200" cy="200" r="196" fill="none" stroke="#ffd36b" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"/>
      ${ring(24, 158, 34, 12, '#e11d48')}${ring(24, 158, 22, 6, '#fde047')}
      ${dots(48, 188, 4, '#fff')}
      ${ring(16, 112, 30, 14, '#f97316')}${ring(16, 112, 18, 7, '#fff7cc')}
      ${ring(12, 70, 26, 13, '#7c3aed')}${ring(12, 70, 14, 6, '#22d3ee')}
      ${dots(24, 134, 5, '#16a34a')}${dots(12, 92, 4.5, '#fde047')}
      <circle cx="200" cy="200" r="38" fill="#be123c"/><circle cx="200" cy="200" r="26" fill="#fbbf24"/>
      ${ring(8, 14, 10, 5, '#be123c')}<circle cx="200" cy="200" r="6" fill="#fff"/>
    </svg>`;
  }

  // marigold toran (repeating), as a data-URI background
  const TORAN = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="34" viewBox="0 0 64 34">
    <path d="M0 4 Q32 14 64 4" fill="none" stroke="#a16207" stroke-width="1.6"/>
    <g transform="translate(16 12)"><circle r="7" fill="#f97316"/><circle r="4.6" fill="#fb923c"/><circle r="2" fill="#fde047"/></g>
    <path d="M40 11 q6 9 0 21 q-6 -12 0 -21z" fill="#15803d"/><path d="M40 12 v18" stroke="#86efac" stroke-width=".8"/>
    <g transform="translate(54 8)"><circle r="5" fill="#facc15"/><circle r="2.6" fill="#f59e0b"/></g>
  </svg>`);

  // ---------- fireworks on a canvas (light-weight, pauses when hidden or off-screen)
  function fireworks(canvas) {
    const ctx = canvas.getContext('2d');
    const colors = ['#ffd36b', '#ff8a3d', '#ff4d6d', '#c77dff', '#4cc9f0', '#ffffff', '#facc15'];
    const parts = [], rockets = [];
    let w = 0, h = 0, next = 0, raf = 0, visible = true;
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = window.ResizeObserver ? new ResizeObserver(size) : null;
    if (ro) ro.observe(canvas);
    const io = window.IntersectionObserver ? new IntersectionObserver(e => { visible = e[0].isIntersecting; }) : null;
    if (io) io.observe(canvas);
    const launch = () => rockets.push({ x: w * (0.08 + Math.random() * 0.84), y: h + 10, vy: -(h * 0.011 + Math.random() * h * 0.004), top: h * (0.12 + Math.random() * 0.35), c: colors[(Math.random() * colors.length) | 0] });
    const burst = (x, y, c) => {
      const n = 38 + (Math.random() * 22 | 0), c2 = colors[(Math.random() * colors.length) | 0];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, s = 1.2 + Math.random() * 2.4;
        parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, c: Math.random() < .7 ? c : c2 });
      }
    };
    const frame = t => {
      if (!canvas.isConnected) { if (ro) ro.disconnect(); if (io) io.disconnect(); return; }
      raf = requestAnimationFrame(frame);
      if (document.hidden || !visible) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.22)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      if (t > next) { launch(); next = t + 900 + Math.random() * 1300; }
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        ctx.fillStyle = r.c; ctx.fillRect(r.x - 1, r.y, 2, 6);
        if (r.y <= r.top) { burst(r.x, r.y, r.c); rockets.splice(i, 1); }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.vx *= 0.985; p.vy *= 0.985; p.life -= 0.013;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);
  }

  const THEMES = {
    diwali: {
      header(store) {
        const top = document.querySelector('.topbar');
        if (!top || top.querySelector('.festive-strip')) return;
        top.insertAdjacentHTML('afterbegin', `
          <div class="festive-strip"><div class="wrap festive-strip-in">
            <span class="fs-mini">${DIYA}</span>
            <span><strong>Happy Diwali!</strong> <span class="hide-sm">Light up your home this festive season with ${window.esc(store)}.</span></span>
            <button type="button" class="fs-cta" data-general="whatsapp">Ask for festive offers</button>
            <span class="fs-mini hide-sm">${DIYA}</span>
          </div></div>`);
        top.insertAdjacentHTML('beforeend', `<div class="toran" aria-hidden="true" style="background-image:url('${TORAN}')"></div>`);
      },
      hero(hero) {
        if (!hero || hero.querySelector('.fs-layer')) return;
        const layer = document.createElement('div');
        layer.className = 'fs-layer';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = `<canvas class="fs-fireworks"></canvas>
          <span class="fs-lantern l1">${LANTERN}</span><span class="fs-lantern l2">${LANTERN}</span><span class="fs-lantern l3">${LANTERN}</span>
          <div class="fs-diyas">${Array.from({ length: 7 }, (_, i) => `<span class="fs-diya" style="--d:${(i * 0.37) % 1.3}s">${DIYA}</span>`).join('')}</div>`;
        hero.appendChild(layer);
        const plane = hero.querySelector('.plane');
        if (plane) plane.insertAdjacentHTML('afterbegin', `<div class="fs-rangoli">${rangoli()}</div>`);
        if (!reduced) fireworks(layer.querySelector('canvas'));
      },
      greeting: 'Happy Diwali',
    },
  };

  window.Festive = {
    active: null,
    apply(theme, storeName) {
      const t = THEMES[theme];
      document.body.classList.toggle('theme-' + theme, !!t);
      this.active = t ? theme : null;
      if (t) t.header(storeName || 'us');
    },
    hero(el) { if (this.active) THEMES[this.active].hero(el); },
    greeting() { return this.active ? THEMES[this.active].greeting : null; },
  };
})();
