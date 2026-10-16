/* Leela Laher Tech Point - catalogue admin */
(function () {
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const view = $('#view');
  const A = { me: null, days: 30, cats: [], subs: [], products: [], prodFilter: { q: '', cat: '' }, enqFilter: { status: '', q: '' } };

  // ---------- utilities
  async function api(path, method, body) {
    const res = await fetch(path, {
      method: method || 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== '/api/admin/login') { showLogin(); throw new Error(data.error || 'Please log in'); }
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }
  function toast(msg, err) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show' + (err ? ' err' : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.className = 'toast', 2800);
  }
  const hydrate = root => $$('[data-icon]', root).forEach(el => { el.innerHTML = icon(el.dataset.icon, +el.dataset.size || 18); el.removeAttribute('data-icon'); });
  const fmt = n => Number(n || 0).toLocaleString('en-IN');
  const dt = s => s ? new Date(s.replace(' ', 'T')).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
  const day = s => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const chan = c => c === 'whatsapp' ? `<span class="pill wa">${icon('whatsapp', 13)} WhatsApp</span>` : c === 'email' ? `<span class="pill em">${icon('mail', 13)} Email</span>` : `<span class="pill call">${icon('call', 13)} Call</span>`;
  const waLink = (m, text) => 'https://wa.me/91' + m + (text ? '?text=' + encodeURIComponent(text) : '');

  // ---------- auth
  function showLogin() {
    $('#shell').hidden = true;
    $('#login').hidden = false;
    $('#loginForm [name=username]').focus();
  }
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, btn = f.querySelector('button');
    btn.disabled = true;
    $('#loginError').textContent = '';
    try {
      await api('/api/admin/login', 'POST', { username: f.username.value.trim(), password: f.password.value });
      f.password.value = '';
      await enter();
    } catch (ex) { $('#loginError').textContent = ex.message; } finally { btn.disabled = false; }
  });
  $('#logoutBtn').onclick = async () => { try { await api('/api/admin/logout', 'POST', {}); } catch (e) { /* ignore */ } showLogin(); };

  async function enter() {
    A.me = await api('/api/admin/me');
    $('#login').hidden = true;
    $('#shell').hidden = false;
    $('#whoAmI').innerHTML = icon('user', 16) + ' ' + esc(A.me.username) + (A.me.role === 'master' ? ' <span class="pill master">Master</span>' : ' <span class="pill">Staff</span>');
    $('#versionBox').innerHTML = `<strong>Version ${esc(A.me.version)}</strong><br>Released ${esc(A.me.released)}`;
    $('#alerts').innerHTML = A.me.warnings.map(w => `<div class="alert">${icon('alert', 18)}<span>${esc(w)} <a href="#settings">Open Settings</a></span></div>`).join('');
    route();
  }

  // ---------- routing
  const TITLES = { dashboard: 'Dashboard', enquiries: 'Enquiries', customers: 'Customers', products: 'Products', categories: 'Categories', settings: 'Settings' };
  function route() {
    const v = (location.hash || '#dashboard').slice(1);
    const name = TITLES[v] ? v : 'dashboard';
    $$('#sideNav a').forEach(a => a.classList.toggle('active', a.dataset.view === name));
    $('#viewTitle').textContent = TITLES[name];
    $('#side').classList.remove('open');
    view.innerHTML = '<p class="muted">Loading…</p>';
    ({ dashboard, enquiries, customers, products, categories, settings })[name]().catch(e => { view.innerHTML = `<div class="alert">${esc(e.message)}</div>`; });
  }
  window.addEventListener('hashchange', () => { if (!$('#shell').hidden) route(); });
  $('#menuBtn').onclick = () => $('#side').classList.toggle('open');

  // ---------- charts
  function columnChart(data, key, label, alt) {
    const W = 640, H = 220, L = 34, R = 8, T = 12, B = 26;
    const max = Math.max(1, ...data.map(d => d[key]));
    const step = niceStep(max);
    const top = Math.ceil(max / step) * step;
    const iw = W - L - R, ih = H - T - B, bw = iw / data.length, gap = Math.min(4, bw * 0.25);
    const y = v => T + ih - (v / top) * ih;
    let grid = '';
    for (let v = 0; v <= top; v += step) grid += `<line class="gridline" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
    const every = Math.ceil(data.length / 8);
    const cols = data.map((d, i) => {
      const x = L + i * bw, h = ih - (y(d[key]) - T), bx = x + gap / 2, w = Math.max(1, bw - gap);
      const r = Math.min(4, w / 2, h);
      const path = h > 0 ? `M${bx},${T + ih} V${T + ih - h + r} Q${bx},${T + ih - h} ${bx + r},${T + ih - h} H${bx + w - r} Q${bx + w},${T + ih - h} ${bx + w},${T + ih - h + r} V${T + ih} Z` : '';
      return `<g class="col" data-i="${i}"><rect class="hit" x="${x}" y="${T}" width="${bw}" height="${ih}"/>${path ? `<path class="bar${alt ? ' alt' : ''}" d="${path}"/>` : ''}` +
        (i % every === 0 ? `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${day(d.date)}</text>` : '') + '</g>';
    }).join('');
    const id = 'c' + Math.random().toString(36).slice(2, 8);
    setTimeout(() => {
      const box = document.getElementById(id);
      if (!box) return;
      const tip = box.querySelector('.tip');
      box.querySelectorAll('.col').forEach(g => {
        g.addEventListener('mouseenter', () => {
          const d = data[+g.dataset.i], r = g.querySelector('.hit').getBoundingClientRect(), b = box.getBoundingClientRect();
          tip.innerHTML = `<strong>${fmt(d[key])} ${label}</strong>${day(d.date)}`;
          tip.style.left = (r.left - b.left + r.width / 2) + 'px';
          tip.style.top = (box.querySelector('svg').getBoundingClientRect().top - b.top + (y(d[key]) / H) * box.querySelector('svg').getBoundingClientRect().height) + 'px';
          tip.classList.add('show');
        });
        g.addEventListener('mouseleave', () => tip.classList.remove('show'));
      });
    });
    return `<div class="chart" id="${id}"><div class="tip"></div><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)} per day"><g class="axis">${grid}</g><g class="axis">${cols}</g></svg></div>`;
  }
  function niceStep(max) {
    const raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / p;
    return Math.max(1, (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p);
  }
  function hbars(list, labelFn, alt, unit) {
    if (!list.length) return `<div class="empty-s">No data yet for this period.</div>`;
    const max = Math.max(...list.map(r => r.n));
    return `<div class="hbars">${list.map(r => `<div class="hbar${alt ? ' alt' : ''}" title="${esc(r.n + ' ' + unit)}">
      <span class="lbl">${labelFn(r)}</span><span class="val">${fmt(r.n)}</span>
      <div class="track"><div class="fill" style="width:${Math.max(2, r.n / max * 100)}%"></div></div></div>`).join('')}</div>`;
  }

  // ---------- dashboard
  async function dashboard() {
    const d = await api('/api/admin/stats?days=' + A.days);
    const k = d.kpi;
    const conv = k.unique_visitors ? Math.min(100, Math.round(k.enq_visitors * 100 / k.unique_visitors)) : 0;
    const label = { 1: 'today', 7: 'last 7 days', 30: 'last 30 days', 90: 'last 90 days', 0: 'all time' }[A.days];
    const kpi = (ic, title, val, sub) => `<div class="kpi"><div class="kpi-top"><span>${title}</span><span class="kpi-ic">${icon(ic, 18)}</span></div><div class="kpi-val">${val}</div><div class="kpi-sub">${sub}</div></div>`;
    $('#openBadge').hidden = !k.enq_open;
    $('#openBadge').textContent = k.enq_open;
    view.innerHTML = `
      <div class="toolbar"><div class="seg" id="range">${[[1, 'Today'], [7, '7 days'], [30, '30 days'], [90, '90 days'], [0, 'All time']].map(([v, l]) => `<button type="button" data-d="${v}" class="${A.days === v ? 'active' : ''}">${l}</button>`).join('')}</div>
        <span class="grow"></span><a class="btn" href="/" target="_blank" rel="noopener">${icon('eye', 16)} Open catalogue</a></div>
      <div class="kpis">
        ${kpi('trend', 'Catalogue visits', fmt(k.visits), `${fmt(k.visits_today)} today`)}
        ${kpi('users', 'Unique visitors', fmt(k.unique_visitors), `${fmt(k.new_customers)} new · ${fmt(k.total_customers)} in database`)}
        ${kpi('eye', 'Product views', fmt(k.product_views), `${fmt(k.products)} live products`)}
        ${kpi('message', 'Enquiries', fmt(k.enquiries), `${fmt(k.enq_whatsapp)} WhatsApp · ${fmt(k.enq_email)} email${k.enq_call ? ' · ' + fmt(k.enq_call) + ' call' : ''}`)}
        ${kpi('award', 'Enquiry rate', conv + '%', `${fmt(k.enq_visitors)} of ${fmt(k.unique_visitors)} visitors enquired`)}
        ${kpi('alert', 'Open enquiries', fmt(k.enq_open), `<a href="#enquiries" style="color:var(--primary);font-weight:600">Follow up now →</a>`)}
      </div>
      <div class="panels">
        <div class="panel"><h2>${icon('trend', 18)} Visits per day</h2><p class="sub">Catalogue sessions, ${A.days > 0 && A.days <= 90 ? label : 'last 30 days'}</p>${columnChart(d.trend, 'visits', 'visits')}</div>
        <div class="panel"><h2>${icon('message', 18)} Enquiries per day</h2><p class="sub">WhatsApp, email & call enquiries, ${A.days > 0 && A.days <= 90 ? label : 'last 30 days'}</p>${columnChart(d.trend, 'enquiries', 'enquiries', true)}</div>
        <div class="panel"><h2>${icon('eye', 18)} Most viewed products</h2><p class="sub">Product detail opens, ${label}</p>
          ${hbars(d.top_viewed, r => `${esc(r.name)} <small>· ${esc(r.category || '')}</small>`, false, 'views')}</div>
        <div class="panel"><h2>${icon('message', 18)} Most enquired products</h2><p class="sub">Products customers contacted you about, ${label}</p>
          ${hbars(d.top_enquired, r => `${esc(r.name)} <small>· ${fmt(r.wa)} WA, ${fmt(r.em)} email</small>`, true, 'enquiries')}</div>
        <div class="panel"><h2>${icon('pin', 18)} Top cities</h2><p class="sub">Unique visitors by city, ${label}</p>
          ${hbars(d.cities, r => esc(r.city || 'Unknown'), false, 'visitors')}</div>
        <div class="panel"><h2>${icon('layers', 18)} Views by category</h2><p class="sub">Which departments customers browse, ${label}</p>
          ${hbars(d.category_views.filter(r => r.n), r => esc(r.category), false, 'views')}</div>
        <div class="panel wide"><div class="panel-head"><div><h2>${icon('clock', 18)} Latest enquiries</h2><p class="sub">Newest first</p></div><a class="btn sm" href="#enquiries">View all</a></div>
          ${d.recent_enquiries.length ? `<div class="table-wrap" style="box-shadow:none"><table class="t"><thead><tr><th>When</th><th>Customer</th><th>City</th><th>Product</th><th>Via</th><th>Status</th></tr></thead><tbody>
          ${d.recent_enquiries.map(r => `<tr><td class="nowrap">${dt(r.ts)}</td><td><span class="strong">${esc(r.name || 'Unknown')}</span><br><a class="muted" href="tel:+91${esc(r.mobile || '')}">${esc(r.mobile || '')}</a></td><td>${esc(r.city || '')}</td><td>${esc(r.product || 'General enquiry')}</td><td>${chan(r.channel)}</td><td><span class="pill">${esc(r.status)}</span></td></tr>`).join('')}
          </tbody></table></div>` : '<div class="empty-s">No enquiries yet. Share your catalogue link with customers!</div>'}
        </div>
      </div>`;
    $$('#range button').forEach(b => b.onclick = () => { A.days = +b.dataset.d; dashboard(); });
  }

  // ---------- enquiries
  async function enquiries() {
    const f = A.enqFilter;
    const d = await api(`/api/admin/enquiries?status=${encodeURIComponent(f.status)}&q=${encodeURIComponent(f.q)}`);
    view.innerHTML = `
      <div class="toolbar">
        <input class="inp" id="eq" placeholder="Search name, mobile, city or product" value="${esc(f.q)}" style="max-width:320px">
        <div class="seg" id="es">${[['', 'All'], ['new', 'New'], ['contacted', 'Contacted'], ['converted', 'Converted'], ['closed', 'Closed']].map(([v, l]) => `<button type="button" data-s="${v}" class="${f.status === v ? 'active' : ''}">${l}</button>`).join('')}</div>
        <span class="grow"></span>
        <a class="btn" href="/api/admin/enquiries.csv">${icon('download', 16)} Export CSV</a>
      </div>
      ${d.enquiries.length ? `<div class="table-wrap"><table class="t"><thead><tr><th>Date</th><th>Customer</th><th>City</th><th>Product</th><th>Via</th><th>Status</th><th>Note</th><th></th></tr></thead><tbody>
      ${d.enquiries.map(r => `<tr data-id="${r.id}">
        <td class="nowrap">${dt(r.ts)}</td>
        <td><span class="strong">${esc(r.name || 'Unknown')}</span><br><a class="muted" href="tel:+91${esc(r.mobile || '')}">${esc(r.mobile || '')}</a></td>
        <td>${esc(r.city || '')}</td>
        <td>${r.product ? esc(r.product) + (r.price ? `<br><small class="muted">${inr(r.price)}</small>` : '') : '<span class="muted">General enquiry</span>'}</td>
        <td>${chan(r.channel)}</td>
        <td><select class="status ${esc(r.status)}" data-status>${['new', 'contacted', 'converted', 'closed'].map(s => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}</select></td>
        <td><input class="inp" data-note value="${esc(r.note || '')}" placeholder="Add note" style="height:32px;min-width:150px"></td>
        <td class="actions">${r.mobile ? `<a class="btn sm wa" target="_blank" rel="noopener" href="${waLink(r.mobile, `Hello ${r.name || ''}, thank you for your enquiry${r.product ? ' about ' + r.product : ''} at Leela Laher Tech Point. `)}">${icon('whatsapp', 14)} Reply</a>` : ''}</td>
      </tr>`).join('')}</tbody></table></div>` : '<div class="table-wrap"><div class="empty-s">No enquiries match.</div></div>'}`;
    $('#eq').oninput = debounce(e => { f.q = e.target.value.trim(); enquiries().then(() => { const i = $('#eq'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }); }, 350);
    $$('#es button').forEach(b => b.onclick = () => { f.status = b.dataset.s; enquiries(); });
    const save = async tr => {
      const status = $('[data-status]', tr).value, note = $('[data-note]', tr).value;
      try { await api('/api/admin/enquiries/' + tr.dataset.id, 'PUT', { status, note }); $('[data-status]', tr).className = 'status ' + status; toast('Enquiry updated'); refreshBadge(); } catch (e) { toast(e.message, true); }
    };
    $$('[data-status]').forEach(s => s.onchange = () => save(s.closest('tr')));
    $$('[data-note]').forEach(s => s.onchange = () => save(s.closest('tr')));
  }
  async function refreshBadge() {
    try { const d = await api('/api/admin/stats?days=1'); $('#openBadge').hidden = !d.kpi.enq_open; $('#openBadge').textContent = d.kpi.enq_open; } catch (e) { /* ignore */ }
  }

  // ---------- customers
  async function customers(q) {
    q = q || '';
    const d = await api('/api/admin/visitors?q=' + encodeURIComponent(q));
    view.innerHTML = `
      <div class="toolbar">
        <input class="inp" id="cq" placeholder="Search by name, mobile or city" value="${esc(q)}" style="max-width:320px">
        <span class="muted">${fmt(d.visitors.length)} customer${d.visitors.length === 1 ? '' : 's'}</span>
        <span class="grow"></span>
        <a class="btn" href="/api/admin/visitors.csv">${icon('download', 16)} Export CSV</a>
      </div>
      ${d.visitors.length ? `<div class="table-wrap"><table class="t"><thead><tr><th>Name</th><th>Mobile</th><th>City</th><th>First visit</th><th>Last visit</th><th class="num">Visits</th><th class="num">Views</th><th class="num">Enquiries</th><th></th></tr></thead><tbody>
      ${d.visitors.map(v => `<tr><td class="strong">${esc(v.name)}</td><td class="nowrap"><a href="tel:+91${esc(v.mobile)}">+91 ${esc(v.mobile)}</a></td><td>${esc(v.city)}</td>
        <td class="nowrap">${dt(v.first_seen)}</td><td class="nowrap">${dt(v.last_seen)}</td><td class="num">${fmt(v.visits)}</td><td class="num">${fmt(v.views)}</td><td class="num">${fmt(v.enquiries)}</td>
        <td class="actions"><a class="btn sm wa" target="_blank" rel="noopener" href="${waLink(v.mobile, `Hello ${v.name}, greetings from Leela Laher Tech Point! `)}">${icon('whatsapp', 14)} Message</a></td></tr>`).join('')}
      </tbody></table></div>` : '<div class="table-wrap"><div class="empty-s">No customers yet. Customers appear here when they enter their details on the catalogue.</div></div>'}`;
    $('#cq').oninput = debounce(e => customers(e.target.value.trim()).then(() => { const i = $('#cq'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }), 350);
  }

  // ---------- products
  async function loadCats() {
    const c = await api('/api/admin/categories');
    A.cats = c.categories; A.subs = c.subcategories;
  }
  const catOf = id => A.cats.find(c => c.id === id) || {};
  const subOf = id => A.subs.find(s => s.id === id);
  const thumb = p => p.images && p.images.length ? `<img src="${esc(p.images[0])}" alt="">` : productArt(p, catOf(p.category_id), subOf(p.subcategory_id));

  async function products() {
    await loadCats();
    A.products = (await api('/api/admin/products')).products;
    renderProducts();
  }
  function renderProducts() {
    const f = A.prodFilter;
    const list = A.products.filter(p => (!f.cat || p.category_id === +f.cat) &&
      (!f.q || (p.name + ' ' + p.brand + ' ' + (p.model || '')).toLowerCase().includes(f.q.toLowerCase())));
    view.innerHTML = `
      <div class="toolbar">
        <input class="inp" id="pq" placeholder="Search products" value="${esc(f.q)}" style="max-width:260px">
        <select class="inp" id="pc" style="max-width:220px"><option value="">All categories</option>${A.cats.map(c => `<option value="${c.id}" ${+f.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
        <span class="muted">${list.length} of ${A.products.length}</span>
        <span class="grow"></span>
        <button class="btn primary" id="addProd" type="button">${icon('plus', 16)} Add product</button>
      </div>
      <div class="table-wrap"><table class="t"><thead><tr><th>Product</th><th>Category</th><th class="num">Price</th><th class="num">Views</th><th class="num">Enquiries</th><th>In stock</th><th>Visible</th><th></th></tr></thead><tbody>
      ${list.map(p => `<tr data-id="${p.id}">
        <td><div class="prod-cell"><div class="thumb">${thumb(p)}</div><div><span class="strong">${esc(p.name)}</span><small>${esc(p.brand)}${p.badge ? ' · ' + esc(p.badge) : ''}${p.featured ? ' · ★ Featured' : ''}</small></div></div></td>
        <td>${esc(catOf(p.category_id).name || '')}<br><small class="muted">${esc((subOf(p.subcategory_id) || {}).name || '')}</small></td>
        <td class="num nowrap">${p.price != null ? inr(p.price) : '<span class="muted">On request</span>'}${p.mrp && p.mrp > p.price ? `<br><small class="muted" style="text-decoration:line-through">${inr(p.mrp)}</small>` : ''}</td>
        <td class="num">${fmt(p.views)}</td><td class="num">${fmt(p.enquiries)}</td>
        <td><label class="switch" title="In stock"><input type="checkbox" data-t="in_stock" ${p.in_stock ? 'checked' : ''} aria-label="In stock"><span></span></label></td>
        <td><label class="switch" title="Visible in catalogue"><input type="checkbox" data-t="active" ${p.active ? 'checked' : ''} aria-label="Visible"><span></span></label></td>
        <td><div class="actions"><button class="icon-btn" data-edit type="button" title="Edit">${icon('edit', 16)}</button><button class="icon-btn danger" data-del type="button" title="Delete">${icon('trash', 16)}</button></div></td>
      </tr>`).join('')}</tbody></table>${list.length ? '' : '<div class="empty-s">No products match.</div>'}</div>`;
    $('#pq').oninput = debounce(e => { f.q = e.target.value; renderProducts(); const i = $('#pq'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250);
    $('#pc').onchange = e => { f.cat = e.target.value; renderProducts(); };
    $('#addProd').onclick = () => productEditor(null);
    $$('[data-edit]').forEach(b => b.onclick = () => productEditor(A.products.find(p => p.id === +b.closest('tr').dataset.id)));
    $$('[data-del]').forEach(b => b.onclick = async () => {
      const p = A.products.find(x => x.id === +b.closest('tr').dataset.id);
      if (!confirm(`Delete "${p.name}"? Tip: you can hide it instead using the Visible switch.`)) return;
      try { await api('/api/admin/products/' + p.id, 'DELETE'); toast('Product deleted'); products(); } catch (e) { toast(e.message, true); }
    });
    $$('[data-t]').forEach(inp => inp.onchange = async () => {
      const id = +inp.closest('tr').dataset.id, field = inp.dataset.t;
      try { await api('/api/admin/products/' + id, 'PATCH', { [field]: inp.checked }); A.products.find(p => p.id === id)[field] = inp.checked; toast('Saved'); } catch (e) { inp.checked = !inp.checked; toast(e.message, true); }
    });
  }

  function openDrawer(title, body, foot) {
    $('#drawerTitle').textContent = title;
    $('#drawerBody').innerHTML = body;
    $('#drawerFoot').innerHTML = foot;
    $('#drawer').hidden = false;
    hydrate($('#drawer'));
    const first = $('#drawerBody input, #drawerBody select');
    if (first) first.focus();
  }
  const closeDrawer = () => { $('#drawer').hidden = true; };
  $('#drawer').addEventListener('click', e => { if (e.target.closest('[data-close]')) closeDrawer(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer(); });

  function productEditor(p) {
    const isNew = !p;
    p = p || { name: '', brand: '', model: '', short: '', description: '', price: '', mrp: '', specs: [['', '']], highlights: [], images: [], badge: '', in_stock: true, active: true, featured: false, category_id: A.cats[0] && A.cats[0].id };
    let images = (p.images || []).slice();
    const subOpts = cid => A.subs.filter(s => s.category_id === +cid).map(s => `<option value="${s.id}" ${s.id === p.subcategory_id ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
    const specRow = (k, v) => `<div class="spec-row"><input class="inp" data-k placeholder="e.g. Resolution" value="${esc(k)}"><input class="inp" data-v placeholder="e.g. 2 MP (1080p)" value="${esc(v)}"><button type="button" class="icon-btn danger" data-rm title="Remove">${icon('x', 16)}</button></div>`;
    openDrawer(isNew ? 'Add product' : 'Edit product', `
      <form id="pf" autocomplete="off">
        <fieldset class="fs"><legend>Basics</legend>
          <label class="field"><span>Product name *</span><input name="name" required maxlength="160" value="${esc(p.name)}" placeholder="e.g. Hikvision 2MP HD Dome Camera"></label>
          <div class="row2">
            <label class="field"><span>Category *</span><select name="category_id">${A.cats.map(c => `<option value="${c.id}" ${c.id === p.category_id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
            <label class="field"><span>Sub-category</span><select name="subcategory_id"><option value="">-</option>${subOpts(p.category_id)}</select></label>
          </div>
          <div class="row3">
            <label class="field"><span>Brand</span><input name="brand" maxlength="60" value="${esc(p.brand)}"></label>
            <label class="field"><span>Model no.</span><input name="model" maxlength="80" value="${esc(p.model || '')}"></label>
            <label class="field"><span>Badge</span><input name="badge" list="badges" maxlength="30" value="${esc(p.badge || '')}" placeholder="New / Bestseller…"></label>
          </div>
          <datalist id="badges"><option value="New"><option value="Bestseller"><option value="Hot Deal"><option value="Premium"><option value="Limited Stock"></datalist>
          <label class="field"><span>Short line (shown on card)</span><input name="short" maxlength="240" value="${esc(p.short)}"></label>
          <label class="field"><span>Description</span><textarea name="description" rows="3">${esc(p.description || '')}</textarea></label>
        </fieldset>
        <fieldset class="fs"><legend>Price (₹)</legend>
          <div class="row2">
            <label class="field"><span>Selling price</span><input name="price" inputmode="numeric" value="${p.price ?? ''}" placeholder="Leave empty for 'Price on request'"></label>
            <label class="field"><span>MRP</span><input name="mrp" inputmode="numeric" value="${p.mrp ?? ''}"><small>Discount % is shown automatically when MRP is higher.</small></label>
          </div>
        </fieldset>
        <fieldset class="fs"><legend>Pictures</legend>
          <div class="imgs" id="imgs"></div>
          <input type="file" id="imgFile" accept="image/jpeg,image/png,image/webp" multiple hidden>
          <p class="muted" style="margin:10px 0 0;font-size:12.5px">First picture is the cover. JPG / PNG / WEBP, large photos are resized automatically.</p>
        </fieldset>
        <fieldset class="fs"><legend>Key highlights</legend>
          <label class="field" style="margin:0"><textarea name="highlights" rows="4" placeholder="One highlight per line">${esc((p.highlights || []).join('\n'))}</textarea></label>
        </fieldset>
        <fieldset class="fs"><legend>Specifications</legend>
          <div id="specs">${(p.specs && p.specs.length ? p.specs : [['', '']]).map(([k, v]) => specRow(k, v)).join('')}</div>
          <button class="btn sm" type="button" id="addSpec">${icon('plus', 14)} Add row</button>
        </fieldset>
        <fieldset class="fs"><legend>Visibility</legend>
          <div class="checks">
            <label><input type="checkbox" name="active" ${p.active ? 'checked' : ''}> Visible in catalogue</label>
            <label><input type="checkbox" name="in_stock" ${p.in_stock ? 'checked' : ''}> In stock</label>
            <label><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}> Featured on home page</label>
            <label><input type="checkbox" name="representative" ${p.representative ? 'checked' : ''}> Pictures are representative (AI / stock)</label>
          </div>
          <p class="muted" style="margin:8px 0 0;font-size:12.5px">Tick this when the photos are not of the exact product. Customers will see a "Representative image" note.</p>
        </fieldset>
        <p class="form-error" id="pfErr"></p>
      </form>`,
      `<button class="btn" type="button" data-close>Cancel</button><button class="btn primary" type="button" id="pfSave">${icon('check', 16)} ${isNew ? 'Add product' : 'Save changes'}</button>`);
    const f = $('#pf');
    const drawImgs = () => {
      $('#imgs').innerHTML = images.map((u, i) => `<div class="img-tile"><img src="${esc(u)}" alt="">${i === 0 ? '<span class="cover">Cover</span>' : ''}<button type="button" data-ri="${i}" aria-label="Remove picture">${icon('x', 14)}</button></div>`).join('') +
        `<label class="img-add" for="imgFile">${icon('upload', 22)}<br>Add photos</label>`;
      $$('[data-ri]').forEach(b => b.onclick = () => { images.splice(+b.dataset.ri, 1); drawImgs(); });
    };
    drawImgs();
    f.category_id.onchange = () => { f.subcategory_id.innerHTML = '<option value="">-</option>' + subOpts(f.category_id.value); };
    $('#addSpec').onclick = () => { $('#specs').insertAdjacentHTML('beforeend', specRow('', '')); };
    $('#specs').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) b.closest('.spec-row').remove(); });
    $('#imgFile').onchange = async e => {
      for (const file of e.target.files) {
        try {
          const data = await resizeImage(file, 1400);
          const r = await api('/api/admin/upload', 'POST', { data });
          images.push(r.url);
          drawImgs();
        } catch (ex) { toast(ex.message || 'Upload failed', true); }
      }
      e.target.value = '';
    };
    $('#pfSave').onclick = async () => {
      const body = {
        name: f.name.value, category_id: f.category_id.value, subcategory_id: f.subcategory_id.value, brand: f.brand.value, model: f.model.value,
        badge: f.badge.value, short: f.short.value, description: f.description.value, price: f.price.value, mrp: f.mrp.value,
        highlights: f.highlights.value.split('\n').map(s => s.trim()).filter(Boolean),
        specs: $$('.spec-row', f).map(r => [$('[data-k]', r).value.trim(), $('[data-v]', r).value.trim()]).filter(([k]) => k),
        images, active: f.active.checked, in_stock: f.in_stock.checked, featured: f.featured.checked, representative: f.representative.checked,
      };
      const btn = $('#pfSave');
      btn.disabled = true;
      try {
        await api(isNew ? '/api/admin/products' : '/api/admin/products/' + p.id, isNew ? 'POST' : 'PUT', body);
        closeDrawer();
        toast(isNew ? 'Product added' : 'Product saved');
        products();
      } catch (ex) { $('#pfErr').textContent = ex.message; } finally { btn.disabled = false; }
    };
  }

  function readDataUrl(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => reject(new Error('Could not read the file.'));
      fr.readAsDataURL(file);
    });
  }

  function resizeImage(file, max) {
    return new Promise((resolve, reject) => {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error('Only JPG, PNG or WEBP images are allowed.'));
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('Could not read the file.'));
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Could not open the image.'));
        img.onload = () => {
          const s = Math.min(1, max / Math.max(img.width, img.height));
          if (s === 1 && file.size < 1.5e6) return resolve(fr.result);
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', 0.86));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  // ---------- categories
  const ICON_CHOICES = ['cctv', 'dome', 'ptz', 'dvr', 'package', 'phone', 'laptop', 'tablet', 'watch', 'headphones', 'tv', 'sparkle', 'star', 'ac', 'window', 'building', 'snow', 'keyboard', 'mouse', 'monitor', 'harddrive', 'printer', 'wifi', 'battery', 'box', 'shield', 'wrench', 'tag'];
  const iconPicker = (sel) => `<div class="icon-pick" data-pick>${ICON_CHOICES.map(n => `<button type="button" data-ic="${n}" class="${n === sel ? 'active' : ''}" title="${n}">${icon(n, 20)}</button>`).join('')}</div>`;
  function bindPicker(root, init) {
    let val = init;
    $$('[data-ic]', root).forEach(b => b.onclick = () => { val = b.dataset.ic; $$('[data-ic]', root).forEach(x => x.classList.toggle('active', x === b)); });
    return () => val;
  }

  async function categories() {
    await loadCats();
    view.innerHTML = `
      <div class="toolbar"><span class="muted">Categories and sub-categories appear on the catalogue in this order.</span><span class="grow"></span>
        <button class="btn primary" id="addCat" type="button">${icon('plus', 16)} Add category</button></div>
      <div class="cat-cards">${A.cats.map(c => `
        <div class="cat-card" data-id="${c.id}">
          <div class="cc-head" style="background:linear-gradient(135deg,${esc(c.color1)},${esc(c.color2)})">
            <span class="cc-ic">${icon(c.icon, 24)}</span><div><strong>${esc(c.name)}</strong><small>${fmt(c.products)} products${c.showcase ? '' : ' · no showcase picture'}</small></div>${c.showcase ? `<img class="cc-show" src="${esc(c.showcase)}" alt="" title="Homepage showcase picture">` : ''}
            <div class="actions"><button class="icon-btn" data-ec type="button" title="Edit category">${icon('edit', 16)}</button><button class="icon-btn" data-dc type="button" title="Delete category">${icon('trash', 16)}</button></div>
          </div>
          <ul class="sub-list">${A.subs.filter(s => s.category_id === c.id).map(s => `
            <li data-sid="${s.id}"><span class="si">${icon(s.icon, 16)}</span><span>${esc(s.name)}</span><span class="count">${fmt(s.products)}</span>
              <button class="icon-btn" data-es type="button" title="Edit">${icon('edit', 14)}</button><button class="icon-btn danger" data-ds type="button" title="Delete">${icon('trash', 14)}</button></li>`).join('') || '<li class="muted">No sub-categories yet</li>'}
          </ul>
          <div class="sub-add"><input class="inp" placeholder="New sub-category name" data-newsub maxlength="60"><button class="btn" type="button" data-addsub>${icon('plus', 14)} Add</button></div>
        </div>`).join('')}</div>`;
    $('#addCat').onclick = () => categoryEditor(null);
    $$('[data-ec]').forEach(b => b.onclick = () => categoryEditor(A.cats.find(c => c.id === +b.closest('.cat-card').dataset.id)));
    $$('[data-dc]').forEach(b => b.onclick = async () => {
      const c = A.cats.find(x => x.id === +b.closest('.cat-card').dataset.id);
      if (!confirm(`Delete category "${c.name}"?`)) return;
      try { await api('/api/admin/categories/' + c.id, 'DELETE'); toast('Category deleted'); categories(); } catch (e) { toast(e.message, true); }
    });
    $$('[data-addsub]').forEach(b => b.onclick = async () => {
      const card = b.closest('.cat-card'), name = $('[data-newsub]', card).value.trim();
      if (!name) return $('[data-newsub]', card).focus();
      try { await api('/api/admin/subcategories', 'POST', { category_id: +card.dataset.id, name, icon: (A.cats.find(c => c.id === +card.dataset.id) || {}).icon }); toast('Sub-category added'); categories(); } catch (e) { toast(e.message, true); }
    });
    $$('[data-newsub]').forEach(i => i.onkeydown = e => { if (e.key === 'Enter') $('[data-addsub]', i.closest('.cat-card')).click(); });
    $$('[data-es]').forEach(b => b.onclick = () => subEditor(A.subs.find(s => s.id === +b.closest('li').dataset.sid)));
    $$('[data-ds]').forEach(b => b.onclick = async () => {
      const s = A.subs.find(x => x.id === +b.closest('li').dataset.sid);
      if (!confirm(`Delete sub-category "${s.name}"?`)) return;
      try { await api('/api/admin/subcategories/' + s.id, 'DELETE'); toast('Sub-category deleted'); categories(); } catch (e) { toast(e.message, true); }
    });
  }
  function categoryEditor(c) {
    const isNew = !c;
    c = c || { name: '', tagline: '', icon: 'box', color1: '#4338ca', color2: '#06b6d4', sort: A.cats.length };
    openDrawer(isNew ? 'Add category' : 'Edit category', `
      <form id="cf">
        <label class="field"><span>Name *</span><input name="name" maxlength="60" value="${esc(c.name)}"></label>
        <label class="field"><span>Tagline</span><input name="tagline" maxlength="140" value="${esc(c.tagline || '')}"></label>
        <div class="row3">
          <label class="field"><span>Colour 1</span><input name="color1" type="color" value="${esc(c.color1)}" style="padding:4px"></label>
          <label class="field"><span>Colour 2</span><input name="color2" type="color" value="${esc(c.color2)}" style="padding:4px"></label>
          <label class="field"><span>Display order</span><input name="sort" type="number" value="${c.sort || 0}"></label>
        </div>
        <div class="field"><span>Icon</span>${iconPicker(c.icon)}</div>
        <div class="field"><span>Showcase picture (homepage animation)</span>
          <div class="imgs" id="scImg"></div>
          <input type="file" id="scFile" accept="image/png,image/webp,image/jpeg" hidden>
          <small>Shown orbiting your logo on the homepage. A product photo with a transparent background (PNG or WEBP) looks best. Remove it to show the built-in drawing instead.</small>
        </div>
        <p class="form-error" id="cfErr"></p>
      </form>`, `<button class="btn" type="button" data-close>Cancel</button><button class="btn primary" type="button" id="cfSave">${icon('check', 16)} Save</button>`);
    const getIcon = bindPicker($('#cf'), c.icon);
    let showcase = c.showcase || '';
    const drawShowcase = () => {
      $('#scImg').innerHTML = showcase
        ? `<div class="img-tile showcase-tile"><img src="${esc(showcase)}" alt=""><button type="button" id="scRm" aria-label="Remove showcase picture">${icon('x', 14)}</button></div>`
        : `<label class="img-add" for="scFile">${icon('upload', 22)}<br>Add picture</label>`;
      if (showcase) $('#scRm').onclick = () => { showcase = ''; drawShowcase(); };
    };
    drawShowcase();
    $('#scFile').onchange = async e => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        // keep PNG/WEBP as-is so transparency survives; shrink big JPEGs
        const data = (/^image\/(png|webp)$/.test(file.type) && file.size < 6e6) ? await readDataUrl(file) : await resizeImage(file, 1200);
        showcase = (await api('/api/admin/upload', 'POST', { data })).url;
        drawShowcase();
      } catch (ex) { toast(ex.message || 'Upload failed', true); }
    };
    $('#cfSave').onclick = async () => {
      const f = $('#cf');
      const body = { name: f.name.value, tagline: f.tagline.value, color1: f.color1.value, color2: f.color2.value, sort: f.sort.value, icon: getIcon(), showcase };
      try { await api(isNew ? '/api/admin/categories' : '/api/admin/categories/' + c.id, isNew ? 'POST' : 'PUT', body); closeDrawer(); toast('Category saved'); categories(); } catch (e) { $('#cfErr').textContent = e.message; }
    };
  }
  function subEditor(s) {
    openDrawer('Edit sub-category', `
      <form id="sf"><label class="field"><span>Name *</span><input name="name" maxlength="60" value="${esc(s.name)}"></label>
      <div class="field"><span>Icon</span>${iconPicker(s.icon)}</div><p class="form-error" id="sfErr"></p></form>`,
      `<button class="btn" type="button" data-close>Cancel</button><button class="btn primary" type="button" id="sfSave">${icon('check', 16)} Save</button>`);
    const getIcon = bindPicker($('#sf'), s.icon);
    $('#sfSave').onclick = async () => {
      try { await api('/api/admin/subcategories/' + s.id, 'PUT', { name: $('#sf').name.value, icon: getIcon() }); closeDrawer(); toast('Saved'); categories(); } catch (e) { $('#sfErr').textContent = e.message; }
    };
  }

  // ---------- settings
  async function settings() {
    const d = await api('/api/admin/settings');
    const s = d.settings;
    view.innerHTML = `
      <div class="panels">
        <div class="panel"><h2>${icon('building', 18)} Store & enquiry details</h2><p class="sub">Shown on the catalogue. Enquiries go to this WhatsApp number and email.</p>
          <form id="sf2">
            <label class="field"><span>Store name</span><input name="store_name" value="${esc(s.store_name)}"></label>
            <label class="field"><span>Tagline</span><input name="tagline" value="${esc(s.tagline)}"></label>
            <div class="row2">
              <label class="field"><span>WhatsApp number</span><input name="whatsapp" value="${esc(s.whatsapp)}" inputmode="numeric"><small>With country code, e.g. 919876543210</small></label>
              <label class="field"><span>Enquiry email</span><input name="email" type="email" value="${esc(s.email)}"></label>
            </div>
            <div class="row2">
              <label class="field"><span>Phone (for Call button)</span><input name="phone" value="${esc(s.phone)}"></label>
              <label class="field"><span>Showroom hours</span><input name="hours" value="${esc(s.hours)}"></label>
            </div>
            <label class="field"><span>Address</span><input name="address" value="${esc(s.address)}"></label>
            <label class="field"><span>Website</span><input name="website" value="${esc(s.website || '')}" placeholder="www.yourshop.com"></label>
            <label class="field"><span>Price note (under the price)</span><input name="price_note" value="${esc(s.price_note)}"></label>
            <div class="checks" style="margin-bottom:14px"><label><input type="checkbox" name="show_prices" ${s.show_prices === '1' ? 'checked' : ''}> Show prices on the catalogue</label></div>
            <p class="form-error" id="sErr"></p>
            <button class="btn primary" type="submit">${icon('check', 16)} Save details</button>
          </form></div>
        <div>
          <div class="panel" style="margin-bottom:16px"><h2>${icon('lock', 18)} Login & password</h2><p class="sub">Use a strong password - at least 8 characters with letters and numbers.</p>
            <form id="pw">
              <label class="field"><span>Username</span><input name="username" value="${esc(A.me.username)}" autocomplete="username"></label>
              <label class="field"><span>Current password</span><input name="current" type="password" autocomplete="current-password" required></label>
              <div class="row2">
                <label class="field"><span>New password</span><input name="new" type="password" autocomplete="new-password" required minlength="8"></label>
                <label class="field"><span>Confirm new password</span><input name="confirm" type="password" autocomplete="new-password" required></label>
              </div>
              <p class="form-error" id="pwErr"></p>
              <button class="btn primary" type="submit">${icon('lock', 16)} Update login</button>
            </form></div>
          <div class="panel"><h2>${icon('info', 18)} About this software</h2><p class="sub">Leela Laher Tech Point - Digital Catalogue</p>
            <table class="t"><tbody>
              <tr><td class="muted">Version</td><td class="strong">${esc(d.version)}</td></tr>
              <tr><td class="muted">Released</td><td>${esc(d.released)}</td></tr>
              <tr><td class="muted">Built with</td><td>Python (standard library) + SQLite</td></tr>
              <tr><td class="muted">Data folder</td><td style="word-break:break-all">${esc(d.data_folder)}</td></tr>
            </tbody></table>
            <p class="muted" style="font-size:12.5px;margin:10px 0 0">Back up the data folder regularly - it holds your products, pictures and customer database.</p>
          </div>
        </div>
      </div>`;
    $('#sf2').onsubmit = async e => {
      e.preventDefault();
      const f = e.target, body = {};
      ['store_name', 'tagline', 'whatsapp', 'email', 'phone', 'hours', 'address', 'website', 'price_note'].forEach(k => body[k] = f[k].value.trim());
      body.show_prices = f.show_prices.checked;
      try { await api('/api/admin/settings', 'PUT', body); $('#sErr').textContent = ''; toast('Settings saved'); refreshMe(); } catch (ex) { $('#sErr').textContent = ex.message; }
    };
    $('#pw').onsubmit = async e => {
      e.preventDefault();
      const f = e.target;
      if (f.new.value !== f.confirm.value) { $('#pwErr').textContent = 'New passwords do not match.'; return; }
      try {
        await api('/api/admin/password', 'POST', { username: f.username.value.trim(), current: f.current.value, new: f.new.value });
        f.reset(); $('#pwErr').textContent = ''; toast('Login updated'); refreshMe();
      } catch (ex) { $('#pwErr').textContent = ex.message; }
    };
    if (A.me.role === 'master') teamEditor();
    aboutEditor();
  }

  // ---------- team logins (master only)
  async function teamEditor() {
    const box = document.createElement('div');
    box.className = 'panel';
    box.style.marginTop = '16px';
    view.appendChild(box);
    const roleBadge = r => `<span class="pill ${r === 'master' ? 'master' : ''}">${r === 'master' ? icon('star', 12) + ' Master' : 'Staff'}</span>`;
    const draw = async () => {
      const d = await api('/api/admin/users');
      box.innerHTML = `
        <div class="panel-head"><div><h2>${icon('shield', 18)} Team logins</h2>
          <p class="sub">You are the <strong>master admin</strong>. Create a separate login for each staff member. Staff can manage products, enquiries and customers, but only a master can manage logins.</p></div></div>
        <div class="table-wrap" style="box-shadow:none;margin-bottom:14px"><table class="t"><thead><tr><th>Username</th><th>Role</th><th>Last login</th><th>Password changed</th><th></th></tr></thead><tbody>
        ${d.users.map(u => `<tr data-id="${u.id}" data-name="${esc(u.username)}" data-role="${u.role || 'staff'}">
          <td class="strong">${esc(u.username)}${u.id === d.me ? ' <small class="muted">(you)</small>' : ''}</td>
          <td>${roleBadge(u.role)}</td>
          <td class="nowrap">${u.last_login ? dt(u.last_login) : '<span class="muted">Never</span>'}</td>
          <td class="nowrap">${u.pw_changed_at ? dt(u.pw_changed_at) : '<span class="muted">Default</span>'}</td>
          <td><div class="actions">${u.id === d.me ? '' : `<button class="btn sm" type="button" data-uedit>${icon('edit', 14)} Edit</button><button class="icon-btn danger" type="button" data-udel title="Remove login">${icon('trash', 15)}</button>`}</div></td></tr>`).join('')}
        </tbody></table></div>
        <form id="uAdd" class="row3" autocomplete="off" style="align-items:end">
          <label class="field" style="margin:0"><span>New username</span><input name="username" placeholder="e.g. shaukat" autocomplete="off"></label>
          <label class="field" style="margin:0"><span>Password</span><input name="password" type="password" placeholder="8+ letters & numbers" autocomplete="new-password"></label>
          <label class="field" style="margin:0"><span>Role</span><select name="role"><option value="staff">Staff</option><option value="master">Master (can manage logins)</option></select></label>
        </form>
        <div class="toolbar" style="margin:12px 0 0"><p class="form-error" id="uErr" style="margin:0"></p><span class="grow"></span>
          <button class="btn primary" type="button" id="uAddBtn">${icon('plus', 16)} Add login</button></div>`;
      $('#uAddBtn', box).onclick = async () => {
        const f = $('#uAdd', box);
        try {
          await api('/api/admin/users', 'POST', { username: f.username.value.trim(), password: f.password.value, role: f.role.value });
          toast('Login created'); draw();
        } catch (ex) { $('#uErr', box).textContent = ex.message; }
      };
      $$('[data-udel]', box).forEach(b => b.onclick = async () => {
        const tr = b.closest('tr');
        if (!confirm(`Remove the login "${tr.dataset.name}"? They will be signed out immediately.`)) return;
        try { await api('/api/admin/users/' + tr.dataset.id, 'DELETE'); toast('Login removed'); draw(); } catch (ex) { toast(ex.message, true); }
      });
      $$('[data-uedit]', box).forEach(b => b.onclick = () => {
        const tr = b.closest('tr');
        openDrawer('Edit login', `
          <form id="ue" autocomplete="off">
            <label class="field"><span>Username</span><input name="username" value="${esc(tr.dataset.name)}"></label>
            <label class="field"><span>Role</span><select name="role"><option value="staff" ${tr.dataset.role !== 'master' ? 'selected' : ''}>Staff</option><option value="master" ${tr.dataset.role === 'master' ? 'selected' : ''}>Master (can manage logins)</option></select></label>
            <label class="field"><span>New password</span><input name="password" type="password" autocomplete="new-password" placeholder="Leave empty to keep the current password"><small>Setting a new password signs this person out everywhere.</small></label>
            <p class="form-error" id="ueErr"></p>
          </form>`,
          `<button class="btn" type="button" data-close>Cancel</button><button class="btn primary" type="button" id="ueSave">${icon('check', 16)} Save</button>`);
        $('#ueSave').onclick = async () => {
          const f = $('#ue');
          try {
            await api('/api/admin/users/' + tr.dataset.id, 'PUT', { username: f.username.value.trim(), role: f.role.value, password: f.password.value });
            closeDrawer(); toast('Login updated'); draw();
          } catch (ex) { $('#ueErr').textContent = ex.message; }
        };
      });
    };
    try { await draw(); } catch (ex) { box.innerHTML = `<p class="form-error">${esc(ex.message)}</p>`; }
  }

  // ---------- "About us" page editor (team, photos, intro)
  async function aboutEditor() {
    const a = (await api('/api/admin/about')).about;
    const team = (a.team || []).map(m => Object.assign({}, m));
    const box = document.createElement('div');
    box.className = 'panel';
    box.style.marginTop = '16px';
    view.appendChild(box);
    const member = (m, i) => `
      <fieldset class="fs member" data-i="${i}"><legend>Person ${i + 1}</legend>
        <div class="member-grid">
          <div class="member-photo">
            ${m.photo ? `<div class="img-tile avatar-tile"><img src="${esc(m.photo)}" alt=""><button type="button" data-rmphoto aria-label="Remove photo">${icon('x', 14)}</button></div>`
              : `<label class="img-add avatar-add">${icon('upload', 22)}<br>Add photo<input type="file" accept="image/jpeg,image/png,image/webp" data-photo hidden></label>`}
          </div>
          <div>
            <div class="row2">
              <label class="field"><span>Name</span><input data-k="name" value="${esc(m.name)}"></label>
              <label class="field"><span>Role / designation</span><input data-k="role" value="${esc(m.role)}"></label>
            </div>
            <label class="field"><span>Tag line</span><input data-k="tag" value="${esc(m.tag || '')}" placeholder="e.g. Leela Laher Group, Gadag"></label>
            <div class="row2">
              <label class="field"><span>Qualification</span><input data-k="qualification" value="${esc(m.qualification || '')}"></label>
              <label class="field"><span>Experience</span><input data-k="experience" value="${esc(m.experience || '')}"></label>
            </div>
          </div>
        </div>
        <label class="field"><span>About (blank line = new paragraph)</span><textarea data-k="bio" rows="5">${esc(m.bio || '')}</textarea></label>
        <label class="field"><span>Highlights (one per line)</span><textarea data-k="points" rows="3">${esc((m.points || []).join('\n'))}</textarea></label>
        <button type="button" class="btn sm danger" data-rmperson>${icon('trash', 14)} Remove person</button>
      </fieldset>`;
    const collect = () => $$('.member', box).forEach(fs => {
      const m = team[+fs.dataset.i];
      $$('[data-k]', fs).forEach(inp => { m[inp.dataset.k] = inp.dataset.k === 'points' ? inp.value.split('\n').map(s => s.trim()).filter(Boolean) : inp.value; });
    });
    const draw = () => {
      box.innerHTML = `
        <div class="panel-head"><div><h2>${icon('users', 18)} About us page</h2><p class="sub">Shown on the catalogue's "About us" tab. Add photos of your team here.</p></div>
          <a class="btn sm" href="/#/about" target="_blank" rel="noopener">${icon('eye', 14)} Preview</a></div>
        <label class="field"><span>Headline</span><input id="abTitle" value="${esc(a.title || '')}"></label>
        <label class="field"><span>Introduction (blank line = new paragraph)</span><textarea id="abIntro" rows="5">${esc(a.intro || '')}</textarea></label>
        ${team.map(member).join('')}
        <div class="toolbar" style="margin:0">
          <button type="button" class="btn" id="abAdd">${icon('plus', 16)} Add person</button>
          <span class="grow"></span>
          <p class="form-error" id="abErr" style="margin:0"></p>
          <button type="button" class="btn primary" id="abSave">${icon('check', 16)} Save About us</button>
        </div>`;
      $('#abAdd', box).onclick = () => { collect(); team.push({ name: '', role: '', tag: '', photo: '', qualification: '', experience: '', bio: '', points: [] }); draw(); };
      $$('[data-rmperson]', box).forEach(b => b.onclick = () => {
        collect();
        const i = +b.closest('.member').dataset.i;
        if (!confirm(`Remove ${team[i].name || 'this person'} from the About us page?`)) return;
        team.splice(i, 1); draw();
      });
      $$('[data-rmphoto]', box).forEach(b => b.onclick = () => { collect(); team[+b.closest('.member').dataset.i].photo = ''; draw(); });
      $$('[data-photo]', box).forEach(inp => inp.onchange = async () => {
        const file = inp.files[0];
        if (!file) return;
        collect();
        try {
          const data = await resizeImage(file, 1400);
          team[+inp.closest('.member').dataset.i].photo = (await api('/api/admin/upload', 'POST', { data })).url;
          draw();
          toast('Photo added. Remember to Save.');
        } catch (ex) { toast(ex.message || 'Upload failed', true); }
      });
      $('#abSave', box).onclick = async () => {
        collect();
        a.title = $('#abTitle', box).value; a.intro = $('#abIntro', box).value;
        try { await api('/api/admin/about', 'PUT', { title: a.title, intro: a.intro, team }); $('#abErr', box).textContent = ''; toast('About us page saved'); }
        catch (ex) { $('#abErr', box).textContent = ex.message; }
      };
    };
    draw();
  }
  async function refreshMe() {
    A.me = await api('/api/admin/me');
    $('#whoAmI').innerHTML = icon('user', 16) + ' ' + esc(A.me.username) + (A.me.role === 'master' ? ' <span class="pill master">Master</span>' : ' <span class="pill">Staff</span>');
    $('#alerts').innerHTML = A.me.warnings.map(w => `<div class="alert">${icon('alert', 18)}<span>${esc(w)} <a href="#settings">Open Settings</a></span></div>`).join('');
  }

  // ---------- boot
  hydrate();
  fetch('/api/version').then(r => r.json()).then(v => { $('#loginVer').textContent = `Version ${v.version} · Released ${v.released}`; }).catch(() => {});
  enter().catch(() => showLogin());
})();
