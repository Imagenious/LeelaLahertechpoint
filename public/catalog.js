/* Leela Laher Tech Point - customer catalogue */
(function () {
  const $ = (s, el) => (el || document).querySelector(s);
  const app = $('#app');
  const S = { settings: {}, cats: [], subs: [], products: [], byId: {}, catById: {}, subById: {}, version: '' };
  const LS_KEY = 'llVisitor';
  let lastBase = '#/';
  let modalFromNav = false;

  // ---------- storage helpers (wrapped: private mode can throw)
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };
  const visitor = () => store.get(LS_KEY);

  async function api(path, body, opts) {
    const res = await fetch(path, Object.assign({
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    }, opts || {}));
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }
  function beacon(path, body) {
    api(path, body, { keepalive: true }).catch(() => {});
  }

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(el => {
      el.innerHTML = icon(el.dataset.icon, +el.dataset.size || 18);
      el.removeAttribute('data-icon');
    });
  }

  // ---------- rendering helpers
  const grad = c => `linear-gradient(135deg, ${c.color1}, ${c.color2})`;
  const discount = p => (p.mrp && p.price && p.mrp > p.price) ? Math.round((p.mrp - p.price) * 100 / p.mrp) : 0;
  function badgeClass(b) {
    const k = (b || '').toLowerCase();
    if (k.includes('hot') || k.includes('deal') || k.includes('sale')) return 'hot';
    if (k.includes('new')) return 'new';
    if (k.includes('best')) return 'best';
    if (k.includes('prem')) return 'prem';
    return '';
  }
  function media(p, big) {
    if (p.images && p.images.length) return `<img src="${esc(p.images[0])}" alt="${esc(p.name)}" loading="${big ? 'eager' : 'lazy'}">`;
    return productArt(p, S.catById[p.category_id], S.subById[p.subcategory_id]);
  }
  function priceHtml(p) {
    if (p.price == null) return `<span class="por">Price on request</span>`;
    const off = discount(p);
    return `<span class="price">${inr(p.price)}</span>` +
      (off ? `<span class="mrp">${inr(p.mrp)}</span><span class="off">${off}% off</span>` : '');
  }
  function card(p) {
    return `<a class="card" href="#/p/${p.id}">
      <div class="media">${p.badge ? `<span class="badge ${badgeClass(p.badge)}">${esc(p.badge)}</span>` : ''}
        ${p.representative && p.images && p.images.length ? '<span class="rep-tag">Representative image</span>' : ''}
        ${p.in_stock ? '' : '<span class="oos">Out of stock</span>'}${media(p)}</div>
      <div class="body">
        <span class="brand-l">${esc(p.brand)}</span>
        <h3>${esc(p.name)}</h3>
        <p class="short">${esc(p.short)}</p>
        <div class="price-row">${priceHtml(p)}</div>
        <div class="cta"><span>View details & specs</span>${icon('chevronRight', 16)}</div>
      </div></a>`;
  }
  const grid = list => list.length ? `<div class="grid">${list.map(card).join('')}</div>` :
    `<div class="empty"><div class="e-ic">${icon('search', 28)}</div><h3>No products found</h3><p>Try another search or category - or ask us on WhatsApp, we probably have it!</p></div>`;

  function setActiveChip(slug) {
    document.querySelectorAll('#catNav .chip').forEach(a => a.classList.toggle('active', a.dataset.slug === slug));
  }

  // ---------- views
  function viewHome() {
    setActiveChip('home');
    const v = visitor();
    const featured = S.products.filter(p => p.featured).slice(0, 8);
    const catSections = S.cats.map(c => {
      const list = S.products.filter(p => p.category_id === c.id).slice(0, 4);
      if (!list.length) return '';
      return `<div class="section-head"><div><h2>${esc(c.name)}</h2><p>${esc(c.tagline || '')}</p></div>
        <a class="link" href="#/c/${esc(c.slug)}">See all ${icon('chevronRight', 16)}</a></div>${grid(list)}`;
    }).join('');
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const first = v && v.name ? v.name.trim().split(/\s+/)[0] : '';
    const brands = [...new Set(S.products.map(p => p.brand).filter(Boolean))];
    app.innerHTML = `
      <section class="hero">${heroBackground()}
        <div class="hero-copy">
          <span class="hello"><span class="wave">${icon('star', 14)}</span>${first ? `${greet}, ${esc(first)}! Welcome back` : `${greet}! Welcome`}</span>
          <h1>Welcome to <span class="shine">${esc(S.settings.store_name)}</span></h1>
          <p class="lead">Step into our showroom from anywhere. Explore CCTV, Apple, TVs, ACs and computer accessories with real specs and prices. When something catches your eye, just say hello on WhatsApp and we'll take care of the rest.</p>
          <div class="hero-actions">
            <a class="btn-gold" href="#categories">${icon('grid', 18)} Start exploring</a>
            <button class="btn-ghost" type="button" data-general="whatsapp">${icon('whatsapp', 18)} Chat with us</button>
          </div>
          <div class="hero-stats">
            <div><strong>${S.products.length}+</strong><span>Products</span></div>
            <div><strong>${brands.length}+</strong><span>Trusted brands</span></div>
            <div><strong>${S.cats.length}</strong><span>Categories</span></div>
            <div><strong>100%</strong><span>Genuine & billed</span></div>
          </div>
        </div>
        <div class="hero-stage">${orbitStage()}</div>
      </section>
      <div class="brands" aria-label="Brands we sell"><div class="brands-track">${[...brands, ...brands].map(b => `<span>${esc(b)}</span>`).join('')}</div></div>
      <div class="trust">
        <div><span class="t-ic">${icon('shield', 20)}</span><p style="margin:0"><strong>100% genuine</strong><span>Brand warranty & GST bill</span></p></div>
        <div><span class="t-ic">${icon('tag', 20)}</span><p style="margin:0"><strong>Best price</strong><span>Ask for today's offer</span></p></div>
        <div><span class="t-ic">${icon('wrench', 20)}</span><p style="margin:0"><strong>Installation</strong><span>CCTV & AC fitting support</span></p></div>
        <div><span class="t-ic">${icon('truck', 20)}</span><p style="margin:0"><strong>Quick delivery</strong><span>Across the city</span></p></div>
      </div>
      <div class="section-head" id="categories"><div><h2>Shop by category</h2><p>${S.products.length} products across ${S.cats.length} categories</p></div></div>
      <div class="cat-grid">${S.cats.map(c => {
        const subs = S.subs.filter(s => s.category_id === c.id);
        const n = S.products.filter(p => p.category_id === c.id).length;
        const art = c.showcase
          ? `<img src="${esc(c.showcase)}" alt="${esc(c.name)}" loading="lazy">`
          : `<span class="ct-ic">${icon(c.icon, 44)}</span>`;
        return `<a class="cat-tile" href="#/c/${esc(c.slug)}" style="--c1:${esc(c.color1)};--c2:${esc(c.color2)}">
          <div class="ct-photo"><span class="ct-count">${n} items</span>${art}</div>
          <div class="ct-body">
            <h3><span class="ct-dot">${icon(c.icon, 15)}</span>${esc(c.name)}</h3><p>${esc(c.tagline || '')}</p>
            <div class="ct-subs">${subs.slice(0, 4).map(s => `<span>${esc(s.name)}</span>`).join('')}</div>
            <span class="ct-go">Explore ${icon('chevronRight', 15)}</span>
          </div></a>`;
      }).join('')}</div>
      ${featured.length ? `<div class="section-head"><div><h2>Featured products</h2><p>Hand-picked bestsellers from our showroom</p></div></div>${grid(featured)}` : ''}
      <div class="welcome">
        <div class="welcome-card dark"><span class="w-ic">${icon('pin', 26)}</span>
          <div><h3>Come visit our showroom</h3><p>${esc(S.settings.address || '')}${S.settings.hours ? ' · ' + esc(S.settings.hours) : ''}</p></div></div>
        <div class="welcome-card"><span class="w-ic">${icon('message', 26)}</span>
          <div><h3>Need help choosing?</h3><p>Tell us your budget and needs. We'll suggest the best option. <a class="link" href="#" data-general="whatsapp">Ask on WhatsApp ${icon('chevronRight', 14)}</a></p></div></div>
      </div>
      ${catSections}`;
  }

  // 3D showroom: logo on a holographic platform, category devices orbiting around it
  function orbitStage() {
    const A = window.HERO_ART;
    const n = S.cats.length;
    const devices = S.cats.map((c, i) => `
        <div class="slot" style="--i:${i}"><div class="stand">
          <a class="dev" href="#/c/${esc(c.slug)}" aria-label="${esc(c.name)}" style="--i:${i}">
            <span class="dev-art">${c.showcase ? `<img class="dev-photo" src="${esc(c.showcase)}" alt="" loading="eager">` : A.DEVICES[c.icon] || `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44" fill="${esc(c.color1)}"/><g transform="translate(36 36) scale(2)" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${iconPaths(c.icon)}</g></svg>`}</span>
            <span class="dev-label"><i style="background:${grad(c)}"></i>${esc(c.name)}</span>
          </a></div></div>`).join('');
    return `<div class="scene" style="--n:${n}">
      <span class="portal"></span>
      <span class="beam"></span>
      <span class="deco watch">${A.DECO.watch}</span>
      <span class="deco buds">${A.DECO.buds}</span>
      <div class="plane">
        <span class="track t3"></span><span class="track"></span><span class="track t2"></span><span class="glowpad"></span>
        <div class="scene-center">
          ${A.PEDESTAL}
        </div>
        <div class="spinner">${devices}</div>
      </div>
      <span class="logo-halo"></span>
      <img class="center-logo" src="/brand/ll-mark.png" alt="${esc(S.settings.store_name)} logo">
    </div>`;
  }
  function heroBackground() {
    const parts = Array.from({ length: 14 }, (_, i) =>
      `<span class="particle" style="left:${(i * 37) % 100}%;animation-duration:${7 + (i % 5) * 1.6}s;animation-delay:${-i * 1.1}s"></span>`).join('');
    return `<div class="hero-bg" aria-hidden="true">${window.HERO_ART.skyline()}<span class="haze"></span><span class="floor"></span>${parts}</div>`;
  }

  const catState = { sub: 'all', brand: '', sort: 'featured' };
  function viewCategory(slug, subId) {
    const c = S.cats.find(x => x.slug === slug);
    if (!c) return viewHome();
    setActiveChip(slug);
    const subs = S.subs.filter(s => s.category_id === c.id);
    if (catState.cat !== c.id) Object.assign(catState, { cat: c.id, sub: 'all', brand: '', sort: 'featured' });
    if (subId) catState.sub = +subId;
    const all = S.products.filter(p => p.category_id === c.id);
    const brands = [...new Set(all.map(p => p.brand).filter(Boolean))].sort();
    let list = all.filter(p => (catState.sub === 'all' || p.subcategory_id === catState.sub) && (!catState.brand || p.brand === catState.brand));
    list = sortList(list, catState.sort);
    app.innerHTML = `
      <div class="crumbs"><a href="#/">Home</a>${icon('chevronRight', 14)}<span>${esc(c.name)}</span></div>
      <div class="cat-banner" style="background:${grad(c)}"><span class="cb-ic">${icon(c.icon, 34)}</span>
        <div><h1>${esc(c.name)}</h1><p>${esc(c.tagline || '')}</p></div></div>
      <div class="subnav" role="tablist">
        <button type="button" data-sub="all" class="${catState.sub === 'all' ? 'active' : ''}">${icon('grid', 16)} All <em>${all.length}</em></button>
        ${subs.map(s => `<button type="button" data-sub="${s.id}" class="${catState.sub === s.id ? 'active' : ''}">${icon(s.icon, 16)} ${esc(s.name)} <em>${all.filter(p => p.subcategory_id === s.id).length}</em></button>`).join('')}
      </div>
      <div class="toolbar"><span class="count">${list.length} product${list.length === 1 ? '' : 's'}</span>
        <div class="tools">
          <select class="select" id="brandSel" aria-label="Filter by brand"><option value="">All brands</option>${brands.map(b => `<option ${b === catState.brand ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>
          ${sortSelect(catState.sort)}
        </div></div>
      ${grid(list)}`;
    app.querySelectorAll('[data-sub]').forEach(b => b.onclick = () => { catState.sub = b.dataset.sub === 'all' ? 'all' : +b.dataset.sub; viewCategory(slug); });
    $('#brandSel').onchange = e => { catState.brand = e.target.value; viewCategory(slug); };
    $('#sortSel').onchange = e => { catState.sort = e.target.value; viewCategory(slug); };
  }

  function sortSelect(v) {
    const o = [['featured', 'Recommended'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['off', 'Biggest discount'], ['name', 'Name A-Z']];
    return `<select class="select" id="sortSel" aria-label="Sort">${o.map(([k, l]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  }
  function sortList(list, how) {
    const l = list.slice();
    const pr = p => p.price == null ? Infinity : p.price;
    if (how === 'low') l.sort((a, b) => pr(a) - pr(b));
    if (how === 'high') l.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (how === 'off') l.sort((a, b) => discount(b) - discount(a));
    if (how === 'name') l.sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }

  function viewAbout() {
    setActiveChip('about');
    const a = S.about, s = S.settings;
    const initials = n => n.replace(/^(mr|mrs|ms|dr)\.?\s+/i, '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const paras = t => (t || '').split(/\n\s*\n/).map(p => `<p>${esc(p.trim())}</p>`).join('');
    const tel = (s.phone || '').replace(/[^\d+]/g, '');
    const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.address || s.store_name);
    const values = [
      ['shield', 'Genuine products', 'Original brands with proper warranty and GST billing.'],
      ['wrench', 'Expert installation', 'Trained hands for CCTV, AC and IT set-ups, done right the first time.'],
      ['tag', 'Fair, honest pricing', 'Clear prices and the best offer we can give, without the pressure.'],
      ['users', 'Support that stays', 'We are here after the sale too, for service, upgrades and advice.'],
    ];
    app.innerHTML = `
      <div class="crumbs"><a href="#/">Home</a>${icon('chevronRight', 14)}<span>About us</span></div>
      <section class="about-hero">
        <div class="about-hero-copy">
          <span class="about-kicker">${icon('star', 14)} About us</span>
          <h1>${esc(s.store_name)}</h1>
          <p class="about-title">${esc(a.title || '')}</p>
          <div class="about-intro">${paras(a.intro)}</div>
        </div>
        <div class="about-hero-art"><img src="/brand/ll-logo.png" alt="${esc(s.store_name)} logo"></div>
      </section>

      <div class="section-head"><div><h2>Meet our leadership</h2><p>The people behind your trusted tech store</p></div></div>
      <div class="team">${(a.team || []).map(m => `
        <article class="person">
          <div class="person-top">
            <div class="person-photo">${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}">` : `<span class="person-initials" aria-hidden="true">${esc(initials(m.name))}</span>`}</div>
            <div class="person-id">
              <h3>${esc(m.name)}</h3>
              <span class="person-role">${esc(m.role)}</span>
              ${m.tag ? `<span class="person-tag">${icon('building', 14)} ${esc(m.tag)}</span>` : ''}
            </div>
          </div>
          <div class="person-chips">
            ${m.qualification ? `<span>${icon('award', 15)} ${esc(m.qualification)}</span>` : ''}
            ${m.experience ? `<span>${icon('clock', 15)} ${esc(m.experience)}</span>` : ''}
          </div>
          <div class="person-bio">${paras(m.bio)}</div>
          ${m.points && m.points.length ? `<ul class="person-points">${m.points.map(p => `<li>${icon('check', 16)}<span>${esc(p)}</span></li>`).join('')}</ul>` : ''}
        </article>`).join('')}
      </div>

      <div class="section-head"><div><h2>Why customers choose us</h2><p>What you can expect every time you deal with us</p></div></div>
      <div class="values">${values.map(([i, t, d]) => `<div class="value"><span class="v-ic">${icon(i, 22)}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>

      <section class="visit">
        <div class="visit-copy">
          <h2>Visit our showroom</h2>
          <p class="visit-line">${icon('pin', 18)}<span>${esc(s.address || '')}</span></p>
          ${s.hours ? `<p class="visit-line">${icon('clock', 18)}<span>${esc(s.hours)}</span></p>` : ''}
          <div class="visit-actions">
            <a class="btn-gold" href="${maps}" target="_blank" rel="noopener">${icon('pin', 17)} Get directions</a>
            <button class="btn-wa" type="button" data-general="whatsapp">${icon('whatsapp', 17)} WhatsApp us</button>
            ${tel ? `<a class="btn-ghost" href="tel:${esc(tel)}">${icon('call', 17)} Call</a>` : ''}
            ${s.email ? `<a class="btn-ghost" href="mailto:${esc(s.email)}">${icon('mail', 17)} Email</a>` : ''}
          </div>
        </div>
        <img class="visit-mark" src="/brand/ll-mark.png" alt="">
      </section>`;
  }

  function viewSearch(q) {
    setActiveChip('');
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hay = p => [p.name, p.brand, p.model, p.short, (S.catById[p.category_id] || {}).name, (S.subById[p.subcategory_id] || {}).name,
      ...(p.specs || []).map(s => s.join(' '))].join(' ').toLowerCase();
    const list = S.products.filter(p => { const h = hay(p); return terms.every(t => h.includes(t)); });
    app.innerHTML = `<div class="crumbs"><a href="#/">Home</a>${icon('chevronRight', 14)}<span>Search</span></div>
      <div class="section-head" style="margin-top:0"><div><h2>Results for "${esc(q)}"</h2><p>${list.length} product${list.length === 1 ? '' : 's'} found</p></div></div>${grid(list)}`;
  }

  // ---------- product detail
  function openProduct(id) {
    const p = S.byId[id];
    if (!p) { location.hash = lastBase; return; }
    const c = S.catById[p.category_id] || {}, sub = S.subById[p.subcategory_id];
    const imgs = p.images || [];
    const related = S.products.filter(x => x.id !== p.id && (x.subcategory_id === p.subcategory_id || x.category_id === p.category_id))
      .sort((a, b) => (b.subcategory_id === p.subcategory_id) - (a.subcategory_id === p.subcategory_id)).slice(0, 4);
    const off = discount(p);
    $('#pmBody').innerHTML = `
      <button class="close-btn" data-close aria-label="Close">${icon('x', 20)}</button>
      <div class="pd">
        <div class="pd-gallery">
          <div class="main" id="pdMain">${media(p, true)}</div>
          ${p.representative && imgs.length ? `<p class="rep-note">${icon('info', 14)} Representative image. Actual product may vary in look, colour and design.</p>` : ''}
          ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((u, i) => `<button type="button" data-img="${esc(u)}" class="${i ? '' : 'active'}" aria-label="Photo ${i + 1}"><img src="${esc(u)}" alt=""></button>`).join('')}</div>` : ''}
        </div>
        <div class="pd-info">
          <div class="crumbs" style="margin-bottom:8px"><a href="#/c/${esc(c.slug)}" data-nav>${esc(c.name)}</a>${sub ? icon('chevronRight', 14) + `<a href="#/c/${esc(c.slug)}/${sub.id}" data-nav>${esc(sub.name)}</a>` : ''}</div>
          <span class="brand-l">${esc(p.brand)}${p.model ? ' · ' + esc(p.model) : ''}</span>
          <h1 id="pmTitle">${esc(p.name)}</h1>
          <p class="short">${esc(p.short)}</p>
          <div class="price-box">
            ${p.price == null ? '<span class="por" style="font-size:20px">Price on request</span>' :
              `<div class="price-row" style="padding:0"><span class="price">${inr(p.price)}</span>${off ? `<span class="mrp">MRP ${inr(p.mrp)}</span><span class="off">Save ${inr(p.mrp - p.price)} (${off}%)</span>` : ''}</div>`}
            <div class="note">${esc(S.settings.price_note || '')}</div>
            <div class="stock ${p.in_stock ? 'in' : 'out'}">${icon(p.in_stock ? 'check' : 'info', 16)} ${p.in_stock ? 'In stock at our showroom' : 'Currently out of stock - enquire for availability'}</div>
          </div>
          ${p.highlights && p.highlights.length ? `<ul class="hl">${p.highlights.map(h => `<li>${icon('check', 18)}<span>${esc(h)}</span></li>`).join('')}</ul>` : ''}
          <div class="enq">
            <button class="btn-wa" type="button" data-enq="whatsapp">${icon('whatsapp', 20)} Enquire on WhatsApp</button>
            <button class="btn-outline" type="button" data-enq="email">${icon('mail', 20)} Enquire by Email</button>
            ${S.settings.phone ? `<button class="btn-outline full" type="button" data-enq="call">${icon('call', 18)} Call ${esc(S.settings.phone)}</button>` : ''}
          </div>
          <p class="enq-note">${icon('clock', 14)} We usually reply within a few hours during showroom timings.</p>
        </div>
      </div>
      <div class="specs-wrap">
        ${p.description ? `<h2>${icon('info', 20)} About this product</h2><p class="desc">${esc(p.description)}</p>` : ''}
        ${p.specs && p.specs.length ? `<h2>${icon('layers', 20)} Specifications</h2><table class="specs"><tbody>${p.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>` : ''}
      </div>
      ${related.length ? `<div class="related"><div class="section-head" style="margin-top:4px"><div><h2>You may also like</h2></div></div>${grid(related)}</div>` : ''}`;
    const m = $('#productModal');
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#pmBody').scrollTop = 0;
    $('#pmBody .close-btn').focus({ preventScroll: true });
    $('#pmBody').querySelectorAll('[data-img]').forEach(b => b.onclick = () => {
      $('#pdMain').innerHTML = `<img src="${esc(b.dataset.img)}" alt="${esc(p.name)}">`;
      $('#pmBody').querySelectorAll('[data-img]').forEach(x => x.classList.toggle('active', x === b));
    });
    $('#pmBody').querySelectorAll('[data-enq]').forEach(b => b.onclick = () => enquire(b.dataset.enq, p));
    $('#pmBody').querySelectorAll('[data-nav]').forEach(a => a.addEventListener('click', () => { modalFromNav = false; }));
    const vk = 'v' + p.id;
    if (!store.sget(vk)) { store.sset(vk, '1'); beacon('/api/track', { token: (visitor() || {}).token, product_id: p.id, type: 'view' }); }
  }
  function closeProduct() {
    const m = $('#productModal');
    if (m.hidden) return;
    m.hidden = true;
    document.body.style.overflow = '';
  }

  // ---------- enquiries
  function enquire(channel, p) {
    const s = S.settings, v = visitor() || {};
    const link = location.origin + '/#/p/' + (p ? p.id : '');
    const who = `\n\nName: ${v.name || ''}\nCity: ${v.city || ''}\nMobile: ${v.mobile ? '+91 ' + v.mobile : ''}`;
    const msg = p
      ? `Hello ${s.store_name}, I'm interested in:\n*${p.name}*${p.price != null ? ' (listed at ' + inr(p.price) + ')' : ''}\n\nPlease share the best price and availability.${who}\n\n${link}`
      : `Hello ${s.store_name}, I'd like to know more about your products and offers.${who}`;
    beacon('/api/enquiry', { token: v.token, product_id: p ? p.id : null, channel, message: msg });
    if (channel === 'whatsapp') {
      window.open('https://wa.me/' + encodeURIComponent(s.whatsapp) + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      toast('Opening WhatsApp… we will get back to you shortly!');
    } else if (channel === 'email') {
      const subject = p ? 'Enquiry: ' + p.name : 'Product enquiry';
      location.href = 'mailto:' + s.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg.replace(/\*/g, ''));
      toast('Opening your email app… we will get back to you shortly!');
    } else {
      location.href = 'tel:' + (s.phone || '').replace(/[^\d+]/g, '');
    }
  }

  // ---------- router
  function router() {
    const h = location.hash || '#/';
    const parts = h.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    if (parts[0] === 'p' && parts[1]) {
      if (!app.dataset.rendered) { renderBase(lastBase); }
      openProduct(+parts[1]);
      return;
    }
    if (h === '#categories') return;
    closeProduct();
    lastBase = h;
    renderBase(h);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function renderBase(h) {
    const parts = h.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    if (parts[0] === 'c') viewCategory(parts[1], parts[2]);
    else if (parts[0] === 'search') viewSearch(parts.slice(1).join('/'));
    else if (parts[0] === 'about') viewAbout();
    else viewHome();
    app.dataset.rendered = '1';
  }

  // ---------- KYC
  const CITIES = ['Gadag', 'Betageri', 'Lakshmeshwar', 'Mundargi', 'Ron', 'Nargund', 'Shirahatti', 'Gajendragad', 'Hubballi', 'Dharwad', 'Koppal', 'Haveri', 'Ranebennur', 'Bagalkot', 'Badami', 'Belagavi', 'Ballari', 'Hosapete', 'Vijayapura', 'Davanagere', 'Shivamogga', 'Bengaluru', 'Mysuru', 'Mangaluru'];
  function showKyc() {
    $('#cityList').innerHTML = CITIES.map(c => `<option value="${c}">`).join('');
    $('#kycModal').hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#kycForm [name=name]').focus(), 50);
  }
  async function startVisit() {
    const v = visitor();
    if (!v || !v.token) return showKyc();
    if (store.sget('llVisit')) { if (window.Genie) Genie.showHelpButton(v); return; }
    try {
      const r = await api('/api/visit', { token: v.token });
      if (r.need_kyc) { store.del(LS_KEY); return showKyc(); }
      store.set(LS_KEY, r);
      store.sset('llVisit', '1');
      if (window.Genie) setTimeout(() => Genie.greet(r, false), 900);
    } catch (e) { /* offline - let them browse */ }
  }
  $('#kycForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, err = $('#kycError');
    const body = { name: f.name.value.trim(), mobile: f.mobile.value.trim(), city: f.city.value.trim(), consent: f.consent.checked };
    const digits = body.mobile.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    if (body.name.length < 2) { err.textContent = 'Please enter your full name.'; return f.name.focus(); }
    if (!/^[6-9]\d{9}$/.test(digits)) { err.textContent = 'Please enter a valid 10-digit mobile number.'; return f.mobile.focus(); }
    if (body.city.length < 2) { err.textContent = 'Please enter your city.'; return f.city.focus(); }
    if (!body.consent) { err.textContent = 'Please tick the consent box to continue.'; return; }
    err.textContent = '';
    const btn = f.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const r = await api('/api/visit', body);
      store.set(LS_KEY, r);
      store.sset('llVisit', '1');
      $('#kycModal').hidden = true;
      document.body.style.overflow = $('#productModal').hidden ? '' : 'hidden';
      if (!location.hash.startsWith('#/p/')) renderBase(lastBase);
      if (window.Genie) setTimeout(() => Genie.greet(r, true), 350);
      else toast(`Welcome, ${r.name.split(' ')[0]}! Happy browsing.`);
    } catch (ex) {
      err.textContent = ex.message;
    } finally { btn.disabled = false; }
  });

  // ---------- chrome
  function applySettings() {
    const s = S.settings;
    document.title = `${s.store_name} · Digital Catalogue`;
    window.LL_STORE_NAME = s.store_name;
    window.LL_TOAST = toast;
    window.LL_VISITOR = visitor;
    ['storeName', 'footName'].forEach(id => $('#' + id).textContent = s.store_name);
    document.querySelectorAll('.kyc-store').forEach(el => el.textContent = s.store_name);
    $('#storeTag').textContent = s.tagline || 'Digital Catalogue';
    $('#footTag').textContent = s.tagline || '';
    $('#footAddr').textContent = s.address || '';
    $('#footHours').textContent = s.hours || '';
    $('#footPhone').textContent = s.phone || '';
    $('#footPhone').href = 'tel:' + (s.phone || '').replace(/[^\d+]/g, '');
    $('#footEmail').textContent = s.email || '';
    $('#footEmail').href = 'mailto:' + (s.email || '');
    if (/^https?:\/\//i.test(s.website || '')) {
      $('#footWebRow').hidden = false;
      $('#footWeb').href = s.website;
      $('#footWeb').textContent = s.website.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    }
    $('#topCall').href = 'tel:' + (s.phone || '').replace(/[^\d+]/g, '');
    $('#verTag').textContent = 'v' + S.version;
    $('#year').textContent = new Date().getFullYear();
    $('#catNav').innerHTML = `<a class="chip" data-slug="home" href="#/"><span class="dot" style="background:#0f172a">${icon('home', 15)}</span>All</a>` +
      S.cats.map(c => `<a class="chip" data-slug="${esc(c.slug)}" href="#/c/${esc(c.slug)}"><span class="dot" style="background:${grad(c)}">${icon(c.icon, 15)}</span>${esc(c.name)}</a>`).join('') +
      `<a class="chip chip-about" data-slug="about" href="#/about"><span class="dot" style="background:linear-gradient(135deg,#f5dc6b,#c9a514)">${icon('users', 15)}</span>About us</a>`;
  }

  document.addEventListener('click', e => {
    const g = e.target.closest('[data-general]');
    if (g) { e.preventDefault(); enquire(g.dataset.general, null); }
    if (e.target.closest('#productModal [data-close]')) {
      e.preventDefault();
      if (modalFromNav && history.length > 1) history.back(); else location.hash = lastBase;
    }
    const a = e.target.closest('a[href^="#/p/"]');
    if (a) modalFromNav = true;
    if (e.target.closest('a[href="#categories"]')) { e.preventDefault(); $('#categories') && $('#categories').scrollIntoView({ behavior: 'smooth' }); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#productModal').hidden && $('#kycModal').hidden) $('#productModal [data-close]').click();
  });
  $('#topWa').onclick = () => enquire('whatsapp', null);
  $('#fabWa').onclick = () => enquire('whatsapp', null);
  $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    const q = $('#searchInput').value.trim();
    if (q) location.hash = '#/search/' + encodeURIComponent(q);
  });
  let st;
  $('#searchInput').addEventListener('input', e => {
    clearTimeout(st);
    const q = e.target.value.trim();
    st = setTimeout(() => {
      const onSearch = location.hash.startsWith('#/search');
      if (q.length >= 2) {
        const h = '#/search/' + encodeURIComponent(q);
        if (onSearch) { history.replaceState(null, '', h); router(); } else location.hash = h;
      } else if (!q && onSearch) location.hash = '#/';
    }, 350);
  });
  window.addEventListener('hashchange', router);

  // ---------- boot
  async function boot() {
    hydrateIcons();
    app.innerHTML = `<div class="grid">${'<div class="skeleton"></div>'.repeat(8)}</div>`;
    try {
      const d = await api('/api/catalog');
      S.settings = d.settings; S.cats = d.categories; S.subs = d.subcategories; S.products = d.products; S.version = d.version; S.about = d.about || { team: [] };
      S.cats.forEach(c => S.catById[c.id] = c);
      S.subs.forEach(s => S.subById[s.id] = s);
      S.products.forEach(p => S.byId[p.id] = p);
      applySettings();
      router();
      startVisit();
    } catch (e) {
      app.innerHTML = `<div class="empty"><div class="e-ic">${icon('alert', 28)}</div><h3>Could not load the catalogue</h3><p>Please check your connection and refresh the page.</p></div>`;
    }
  }
  boot();
})();
