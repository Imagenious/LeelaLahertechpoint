/* Leela Laher Tech Point - "Tech Genie" personal welcome + guided tips */
(function () {
  const $ = (s, el) => (el || document).querySelector(s);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };
  const TOUR_KEY = 'llGenieTour';

  // ---------- the character (inline SVG, animated with CSS)
  const GENIE = `
  <svg class="genie" viewBox="0 0 170 215" aria-hidden="true">
    <defs>
      <linearGradient id="gnTail" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#67e8f9" stop-opacity=".15"/><stop offset=".45" stop-color="#38bdf8"/><stop offset="1" stop-color="#4f46e5"/></linearGradient>
      <linearGradient id="gnBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d6af8"/><stop offset="1" stop-color="#3730a3"/></linearGradient>
      <linearGradient id="gnGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#e3c22b"/><stop offset="1" stop-color="#a47a00"/></linearGradient>
      <radialGradient id="gnSkin" cx="45%" cy="38%" r="65%"><stop offset="0" stop-color="#ffdcbc"/><stop offset="1" stop-color="#eeb185"/></radialGradient>
    </defs>
    <ellipse cx="82" cy="207" rx="44" ry="5" fill="#0f172a" opacity=".14"/>
    <g class="gn-upper">
      <path class="gn-tail" d="M150 170 C156 150 128 152 118 142 C108 132 100 136 96 126 L66 126 C66 144 96 150 106 158 C116 168 138 176 150 170 Z" fill="url(#gnTail)"/>
      <path d="M58 130 C52 104 62 84 82 84 C102 84 112 104 106 130 C98 137 66 137 58 130 Z" fill="url(#gnBody)"/>
      <path d="M70 87 L82 112 L94 87" fill="none" stroke="url(#gnGold)" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M61 113 Q82 122 103 113 L103 120 Q82 129 61 120 Z" fill="url(#gnGold)"/>
      <circle cx="82" cy="119" r="3.2" fill="#e11d48"/>
      <path d="M62 94 Q46 104 50 116 Q54 122 64 118" fill="none" stroke="url(#gnBody)" stroke-width="10" stroke-linecap="round"/>
      <circle cx="64" cy="118" r="6" fill="url(#gnSkin)"/>
      <g class="gn-wave">
        <path d="M101 94 Q120 86 122 64" fill="none" stroke="url(#gnBody)" stroke-width="10" stroke-linecap="round"/>
        <rect x="116" y="68" width="12" height="4" rx="2" fill="url(#gnGold)" transform="rotate(-8 122 70)"/>
        <circle cx="122" cy="59" r="7" fill="url(#gnSkin)"/>
        <path d="M117 55 v-5 M121 53 v-6 M125 54 v-5" stroke="#eeb185" stroke-width="3" stroke-linecap="round"/>
      </g>
      <rect x="76" y="76" width="12" height="10" rx="4" fill="#eeb185"/>
      <circle cx="61" cy="64" r="4.5" fill="#eeb185"/><circle cx="103" cy="64" r="4.5" fill="#eeb185"/>
      <circle cx="103" cy="71" r="2.4" fill="url(#gnGold)"/>
      <circle cx="82" cy="62" r="21" fill="url(#gnSkin)"/>
      <g class="gn-eyes"><ellipse cx="74.5" cy="63" rx="2.8" ry="3.6" fill="#1e1b4b"/><ellipse cx="89.5" cy="63" rx="2.8" ry="3.6" fill="#1e1b4b"/>
        <circle cx="75.4" cy="61.8" r=".9" fill="#fff"/><circle cx="90.4" cy="61.8" r=".9" fill="#fff"/></g>
      <path d="M70 56 Q74.5 53.5 79 56 M85 56 Q89.5 53.5 94 56" fill="none" stroke="#5b3a1e" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="69" cy="70" r="3.4" fill="#fb7185" opacity=".38"/><circle cx="95" cy="70" r="3.4" fill="#fb7185" opacity=".38"/>
      <path d="M74 71 Q82 79 90 71" fill="#7c2d12" stroke="#7c2d12" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M77 72.6 Q82 75.5 87 72.6" fill="#fff"/>
      <path d="M59 56 C57 33 107 33 105 56 C99 49 65 49 59 56 Z" fill="url(#gnGold)"/>
      <path d="M62 50 Q82 40 102 50 M64 45 Q82 36 100 45" fill="none" stroke="#fff" stroke-width="1.6" opacity=".55"/>
      <path class="gn-feather" d="M82 40 C77 26 88 15 95 11 C92 24 88 33 84 40 Z" fill="#22d3ee"/>
      <circle cx="82" cy="44" r="5" fill="#e11d48"/><circle cx="80.5" cy="42.5" r="1.5" fill="#fff" opacity=".85"/>
    </g>
    <g class="gn-lamp">
      <path d="M46 190 Q82 210 118 190 Q114 175 82 173 Q50 175 46 190 Z" fill="url(#gnGold)"/>
      <path d="M116 186 Q134 182 148 168 L153 171 Q141 191 116 196 Z" fill="url(#gnGold)"/>
      <path d="M47 186 Q29 186 31 174 Q33 165 44 171" fill="none" stroke="url(#gnGold)" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="82" cy="174" rx="19" ry="4" fill="#c69910"/>
      <circle cx="82" cy="169" r="4.2" fill="url(#gnGold)"/>
      <path d="M58 186 Q82 196 106 186" fill="none" stroke="#fff" stroke-width="1.6" opacity=".5"/>
    </g>
    <g class="gn-sparks" fill="#f5dc6b">
      <path d="M22 60 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/><path d="M146 36 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6z"/>
      <path d="M150 120 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4z"/><path d="M18 140 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2z"/>
    </g>
  </svg>`;

  // ---------- helpers
  const greeting = () => { const f = window.Festive && Festive.greeting(); if (f) return f; const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
  const firstName = v => ((v && v.name) || '').trim().split(/\s+/)[0] || 'friend';
  const esc = window.esc;
  const ic = (n, s) => window.icon(n, s || 18);

  function el(html) {
    const t = document.createElement('div');
    t.innerHTML = html.trim();
    return t.firstElementChild;
  }

  // ---------- welcome pop-up
  let current = null;
  function closeCurrent() {
    if (current) { current.remove(); current = null; }
    document.body.classList.remove('gn-lock');
  }

  function welcome(visitor, isNew) {
    closeCurrent();
    const name = firstName(visitor);
    const city = visitor && visitor.city ? visitor.city : '';
    const storeName = window.LL_STORE_NAME || 'Leela Laher Tech Point';
    const node = el(`
      <div class="gn-modal" role="dialog" aria-modal="true" aria-labelledby="gnTitle">
        <div class="gn-backdrop"></div>
        <div class="gn-card">
          <div class="gn-burst" aria-hidden="true">${'<i></i>'.repeat(14)}</div>
          <div class="gn-stage">${GENIE}</div>
          <div class="gn-bubble">
            <p class="gn-hi">${greeting()}!</p>
            <h2 id="gnTitle">${isNew ? 'Namaste' : 'Welcome back'}, <span>${esc(name)}</span>!</h2>
            <p>I'm your <strong>Tech Genie</strong> at ${esc(storeName)}. Your wish is my command! Let me show you how to find the perfect gadget in <strong>4 quick tips</strong>.</p>
            ${city ? `<p class="gn-city">${ic('pin', 16)}<span>Shopping from <strong>${esc(city)}</strong>? Ask us about delivery and installation in your area.</span></p>` : ''}
            <div class="gn-actions">
              <button type="button" class="gn-btn gold" data-gn="tour">${ic('sparkle', 18)} Show me around</button>
              <button type="button" class="gn-btn ghost" data-gn="skip">I'll explore myself</button>
            </div>
          </div>
        </div>
      </div>`);
    document.body.appendChild(node);
    document.body.classList.add('gn-lock');
    current = node;
    setTimeout(() => node.querySelector('[data-gn=tour]').focus(), 400);
    node.querySelector('[data-gn=tour]').onclick = () => { closeCurrent(); startTour(visitor); };
    node.querySelector('[data-gn=skip]').onclick = () => { closeCurrent(); finish(visitor, true); };
    node.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCurrent(); finish(visitor, true); } });
  }

  // compact "welcome back" for customers who have already seen the tips
  function peek(visitor) {
    closeCurrent();
    const node = el(`
      <div class="gn-peek" role="status">
        <div class="gn-peek-genie">${GENIE}</div>
        <div class="gn-peek-bubble">
          <button type="button" class="gn-x" aria-label="Close">${ic('x', 16)}</button>
          <strong>${greeting()}, ${esc(firstName(visitor))}!</strong>
          <span>Great to see you again. Explore what's new, or tap a product and make a wish on WhatsApp.</span>
          <button type="button" class="gn-link" data-gn="tour">${ic('sparkle', 15)} Quick tips</button>
        </div>
      </div>`);
    document.body.appendChild(node);
    current = node;
    const t = setTimeout(() => { if (current === node) { node.classList.add('out'); setTimeout(closeCurrent, 400); } }, 9000);
    node.querySelector('.gn-x').onclick = () => { clearTimeout(t); closeCurrent(); };
    node.querySelector('[data-gn=tour]').onclick = () => { clearTimeout(t); closeCurrent(); startTour(visitor); };
  }

  // gentle "can we help?" card for visitors who skipped the welcome form
  function ask(onSubmit) {
    closeCurrent();
    document.body.classList.add('gn-asking');
    const node = el(`
      <div class="gn-ask" role="dialog" aria-labelledby="gnAskTitle">
        <div class="gn-ask-genie">${GENIE}</div>
        <div class="gn-ask-card">
          <button type="button" class="gn-x" data-gn="close" aria-label="No thanks">${ic('x', 16)}</button>
          <div class="gn-ask-body">
            <strong id="gnAskTitle">${greeting()}! Need help choosing?</strong>
            <span>I'm your Tech Genie. Share your number and our team will WhatsApp you the <b>best price</b> and offers.</span>
            <form class="gn-ask-form" novalidate>
              <input name="name" autocomplete="name" maxlength="60" placeholder="Your name" aria-label="Your name">
              <div class="gn-ask-mobile"><span>+91</span><input name="mobile" inputmode="numeric" autocomplete="tel-national" maxlength="14" placeholder="10-digit mobile" aria-label="Mobile number"></div>
              <p class="gn-ask-err" role="alert"></p>
              <button type="submit" class="gn-btn gold sm">${ic('whatsapp', 16)} Get best price</button>
              <button type="button" class="gn-link gn-ask-no" data-gn="close">No thanks, I'm just browsing</button>
              <small>By sharing, you agree we may contact you about products &amp; offers.</small>
            </form>
          </div>
        </div>
      </div>`);
    document.body.appendChild(node);
    current = node;
    const done = () => { document.body.classList.remove('gn-asking'); closeCurrent(); };
    node.querySelectorAll('[data-gn=close]').forEach(b => b.onclick = done);
    node.addEventListener('keydown', e => { if (e.key === 'Escape') done(); });
    const f = node.querySelector('form'), err = node.querySelector('.gn-ask-err');
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const name = f.name.value.trim(), digits = f.mobile.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
      if (name.length < 2) { err.textContent = 'Please enter your name.'; return f.name.focus(); }
      if (!/^[6-9]\d{9}$/.test(digits)) { err.textContent = 'Please enter a valid 10-digit mobile number.'; return f.mobile.focus(); }
      err.textContent = '';
      const btn = f.querySelector('[type=submit]');
      btn.disabled = true;
      try {
        const v = await onSubmit(name, digits);
        node.querySelector('.gn-ask-body').innerHTML = `
          <strong>Thank you, ${esc(firstName(v))}!</strong>
          <span>Our team will reach out to you shortly. Want help right now?</span>
          <button type="button" class="gn-btn gold sm" data-general="whatsapp">${ic('whatsapp', 16)} Chat on WhatsApp</button>`;
        node.classList.add('thanks');
        setTimeout(() => { if (current === node) { node.classList.add('out'); setTimeout(done, 400); } }, 9000);
      } catch (ex) {
        err.textContent = ex.message || 'Something went wrong, please try again.';
        btn.disabled = false;
      }
    });
    // focus the first field on computers only (on phones it would pop the keyboard up unasked)
    if (matchMedia('(pointer: fine)').matches) setTimeout(() => f.name.focus({ preventScroll: true }), 350);
  }

  // ---------- guided tour with spotlight
  const STEPS = [
    { sel: '#catNav', icon: 'grid', title: 'Pick a category',
      text: 'Tap any category up here (CCTV, Apple, TVs, ACs or accessories) to see everything we have in stock.' },
    { sel: '#searchForm', icon: 'search', title: 'Know what you want?',
      text: 'Type it here, like "iPhone 17", "1.5 ton AC" or "CCTV kit", and I\'ll find it instantly.' },
    { sel: '#app .card', icon: 'eye', title: 'Open any product', scroll: true,
      text: 'See photos, today\'s price and discount, key highlights and the full specifications.' },
    { sel: '#fabWa', icon: 'whatsapp', title: 'Liked something? Make a wish!',
      text: 'Use "Enquire on WhatsApp" or "Email" on any product, or this green button any time. Our team will get back to you quickly.' },
  ];
  let tour = null;

  function startTour(visitor) {
    if (location.hash.startsWith('#/p/')) location.hash = '#/';
    setTimeout(() => {
      tour = { i: 0, visitor };
      const layer = el(`
        <div class="gn-tour" role="dialog" aria-modal="true" aria-live="polite">
          <div class="gn-catch"></div>
          <div class="gn-spot"></div>
          <div class="gn-dock">
            <div class="gn-dock-genie">${GENIE}</div>
            <div class="gn-dock-body">
              <div class="gn-step"></div>
              <h3></h3><p></p>
              <div class="gn-dock-foot">
                <div class="gn-dots">${STEPS.map(() => '<i></i>').join('')}</div>
                <button type="button" class="gn-btn ghost sm" data-gn="back">Back</button>
                <button type="button" class="gn-btn gold sm" data-gn="next">Next</button>
              </div>
            </div>
            <button type="button" class="gn-x" data-gn="end" aria-label="End tips">${ic('x', 16)}</button>
          </div>
        </div>`);
      document.body.appendChild(layer);
      tour.layer = layer;
      layer.querySelector('[data-gn=next]').onclick = () => go(tour.i + 1);
      layer.querySelector('[data-gn=back]').onclick = () => go(tour.i - 1);
      layer.querySelector('[data-gn=end]').onclick = endTour;
      layer.addEventListener('keydown', e => {
        if (e.key === 'Escape') endTour();
        if (e.key === 'ArrowRight') go(tour.i + 1);
        if (e.key === 'ArrowLeft') go(tour.i - 1);
      });
      window.addEventListener('resize', place);
      window.addEventListener('scroll', place, { passive: true });
      go(0);
    }, location.hash.startsWith('#/p/') ? 350 : 0);
  }

  function go(i) {
    if (!tour) return;
    if (i >= STEPS.length) return endTour(true);
    if (i < 0) return;
    tour.i = i;
    const s = STEPS[i], L = tour.layer;
    const target = document.querySelector(s.sel);
    tour.target = target;
    if (target && s.scroll) {
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
      window.scrollBy(0, -(document.querySelector('.topbar').offsetHeight + 24));
    } else if (target && !target.closest('.topbar') && getComputedStyle(target).position !== 'fixed') {
      target.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    L.querySelector('.gn-step').innerHTML = `${ic(s.icon, 16)} Tip ${i + 1} of ${STEPS.length}`;
    L.querySelector('h3').textContent = s.title;
    L.querySelector('p').textContent = s.text;
    L.querySelectorAll('.gn-dots i').forEach((d, k) => d.classList.toggle('on', k === i));
    L.querySelector('[data-gn=back]').style.visibility = i ? 'visible' : 'hidden';
    const next = L.querySelector('[data-gn=next]');
    next.innerHTML = i === STEPS.length - 1 ? `${ic('check', 16)} Start shopping` : `Next ${ic('chevronRight', 16)}`;
    const dock = L.querySelector('.gn-dock');
    dock.classList.remove('pop'); void dock.offsetWidth; dock.classList.add('pop');
    place();
    next.focus({ preventScroll: true });
  }

  function place() {
    if (!tour) return;
    const spot = tour.layer.querySelector('.gn-spot'), dock = tour.layer.querySelector('.gn-dock');
    const t = tour.target;
    if (!t) { spot.style.opacity = 0; dock.classList.remove('top'); return; }
    const r = t.getBoundingClientRect(), pad = 8;
    Object.assign(spot.style, {
      opacity: 1, left: (r.left - pad) + 'px', top: (r.top - pad) + 'px',
      width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px',
      borderRadius: getComputedStyle(t).position === 'fixed' ? '50%' : '18px',
    });
    dock.classList.toggle('top', r.top + r.height / 2 > innerHeight * 0.55);
  }

  function endTour(done) {
    if (!tour) return;
    const v = tour.visitor;
    tour.layer.remove();
    tour = null;
    window.removeEventListener('resize', place);
    window.removeEventListener('scroll', place);
    finish(v, !done);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function finish(visitor, skipped) {
    store.set(TOUR_KEY, '1');
    showHelpButton(visitor);
    if (!skipped && typeof window.LL_TOAST === 'function') window.LL_TOAST(`That's it, ${firstName(visitor)}! Happy shopping, I'm here if you need me.`);
  }

  // small genie button to replay the tips any time
  function showHelpButton(visitor) {
    if ($('.gn-help')) return;
    const b = el(`<button type="button" class="gn-help" aria-label="Show shopping tips">${GENIE}<span>Need help?</span></button>`);
    b.onclick = () => startTour(visitor || window.LL_VISITOR && window.LL_VISITOR());
    document.body.appendChild(b);
  }

  // entry point called by the catalogue after the customer is identified
  function greet(visitor, isNew) {
    if (isNew || !store.get(TOUR_KEY)) welcome(visitor, isNew);
    else { peek(visitor); showHelpButton(visitor); }
  }

  window.Genie = { greet, welcome, startTour, showHelpButton, ask };
})();
