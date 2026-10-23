/* Leela Laher Tech Point - line icon set (24x24, stroke based) */
(function () {
  const P = {
    cctv: '<path d="M3 6.6 15.4 3l1.7 5.7L4.7 12.3z"/><path d="M17.2 5.3 21 4.2v4.6l-3.2.9"/><path d="M8.2 11.2 9.3 15h3.2"/><path d="M12.5 15v4"/><path d="M8 21h9"/><circle cx="7.2" cy="7.6" r=".7"/>',
    dome: '<path d="M3 5h18v3.5H3z"/><path d="M5 8.5a7 7 0 0 0 14 0"/><circle cx="12" cy="12" r="2.3"/>',
    ptz: '<circle cx="12" cy="9.5" r="6.5"/><circle cx="12" cy="9.5" r="2.5"/><path d="M12 16v3"/><path d="M7 21h10"/>',
    dvr: '<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 12h.01M9.5 12h.01"/><path d="M14 12h4"/><path d="M6 17v2M18 17v2"/>',
    package: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/><path d="m7.5 5.5 9 5"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10.5 18.5h3"/>',
    laptop: '<rect x="4" y="4.5" width="16" height="11" rx="1.6"/><path d="M2 19.5h20"/>',
    tablet: '<rect x="4" y="2" width="16" height="20" rx="2.5"/><path d="M11 18.5h2"/>',
    watch: '<rect x="6" y="6" width="12" height="12" rx="3.2"/><path d="M9 6l.8-3.5h4.4L15 6M9 18l.8 3.5h4.4L15 18"/><path d="M12 9.5V12l1.6 1"/>',
    headphones: '<path d="M3.5 14v-2a8.5 8.5 0 0 1 17 0v2"/><rect x="2.5" y="14" width="5" height="7" rx="2"/><rect x="16.5" y="14" width="5" height="7" rx="2"/>',
    tv: '<rect x="2" y="7" width="20" height="13" rx="2"/><path d="m16.5 2.5-4.5 4.5-4.5-4.5"/>',
    sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15.5l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    ac: '<rect x="2" y="4" width="20" height="9" rx="2"/><path d="M6 10h12"/><path d="M7 16.5c0 1.5 1 1.5 1 3M12 16.5c0 1.5 1 1.5 1 3M17 16.5c0 1.5 1 1.5 1 3"/>',
    window: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15h18"/><path d="M7 8h10M7 11h10"/><circle cx="17.5" cy="17.5" r=".6"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 21v-4h6v4"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01"/>',
    snow: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/><path d="m9 3.5 3 2 3-2M9 20.5l3-2 3 2"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    mouse: '<rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 7v4"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    harddrive: '<path d="M22 13H2"/><path d="M5.5 5.5 2 13v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-7.5A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.5z"/><path d="M6 17h.01M10 17h.01"/>',
    printer: '<path d="M6 9V2h12v7"/><rect x="2" y="9" width="20" height="8" rx="2"/><path d="M6 14h12v8H6z"/>',
    wifi: '<path d="M2 8.8a15 15 0 0 1 20 0"/><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><path d="M12 19.5h.01"/>',
    battery: '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2"/><path d="m11 9.5-2 3h4l-2 3"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    whatsapp: '<path d="M3.5 20.5 4.9 16A8.5 8.5 0 1 1 8 19.1z"/><path d="M9 8.6c-.3 2.9 2.6 6.1 5.6 6.1.6 0 1-.3 1.3-.8l.3-.7-2-1-.9.8a4.4 4.4 0 0 1-2.4-2.4l.8-.9-1-2-.7.3c-.5.3-.9.6-1 1.1z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2.5 6.5 9.5 6.5 9.5-6.5"/>',
    call: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4.1a4 4 0 0 1 0 7.8M22 21a7 7 0 0 0-4.5-6.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 16v-4M11 16V8M15 16v-6M19 16V5"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
    settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    truck: '<path d="M10 17h4V5H2v12h3"/><path d="M14 9h4l4 4v4h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13 7 22l5-3 5 3-1.2-9"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L22 14l-8 8-2.3-2.3a4 4 0 0 0-5-5L2 10l8-8z"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  };

  window.ICON_NAMES = Object.keys(P);
  window.icon = function (name, size, cls) {
    const body = P[name] || P.box;
    const s = size || 20;
    return '<svg class="ic ' + (cls || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  };
  window.iconPaths = function (name) { return P[name] || P.box; };

  /* Shared helpers */
  window.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };
  window.inr = function (n) {
    if (n == null || n === '') return '';
    return '₹' + Number(n).toLocaleString('en-IN');
  };

  /* Generated product artwork used until real photos are uploaded */
  window.productArt = function (p, cat, sub) {
    const c1 = (cat && cat.color1) || '#4338ca', c2 = (cat && cat.color2) || '#06b6d4';
    const ic = (sub && sub.icon) || (cat && cat.icon) || 'box';
    const id = 'g' + p.id;
    return '<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + esc(p.name) + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
      '<rect width="400" height="300" fill="url(#' + id + ')"/>' +
      '<circle cx="340" cy="40" r="90" fill="#fff" opacity=".08"/><circle cx="40" cy="280" r="110" fill="#fff" opacity=".07"/>' +
      '<g transform="translate(140 70) scale(5)" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity=".95">' + iconPaths(ic) + '</g>' +
      '<text x="200" y="270" text-anchor="middle" fill="#fff" opacity=".85" font-family="Plus Jakarta Sans, Segoe UI, sans-serif" font-size="20" font-weight="700" letter-spacing="2">' + esc((p.brand || '').toUpperCase()) + '</text>' +
      '</svg>';
  };
})();
