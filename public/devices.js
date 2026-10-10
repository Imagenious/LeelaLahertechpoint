/* Leela Laher Tech Point - hero artwork: device renders, holographic pedestal, city skyline (all vector) */
(function () {
  const svg = (body, cls) => `<svg class="${cls || ''}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

  const DEVICES = {
    // CCTV bullet camera on a wall mount
    cctv: svg(`
      <defs>
        <linearGradient id="dvCamBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e7ecf3"/><stop offset="1" stop-color="#b9c3d1"/></linearGradient>
        <linearGradient id="dvCamMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfd6e0"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#aeb8c6"/></linearGradient>
        <radialGradient id="dvLens" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#7dd3fc"/><stop offset=".35" stop-color="#1e3a8a"/><stop offset="1" stop-color="#020617"/></radialGradient>
      </defs>
      <rect x="10" y="26" width="18" height="34" rx="5" fill="url(#dvCamMetal)"/>
      <circle cx="19" cy="32" r="1.6" fill="#94a3b8"/><circle cx="19" cy="54" r="1.6" fill="#94a3b8"/>
      <path d="M24 44 L44 56" stroke="url(#dvCamMetal)" stroke-width="8" stroke-linecap="round"/>
      <circle cx="44" cy="56" r="6" fill="#d5dce6"/>
      <g transform="rotate(16 72 62)">
        <path d="M34 46 h66 a5 5 0 0 1 5 5 v2 H34z" fill="#f8fafc"/>
        <rect x="36" y="50" width="64" height="28" rx="11" fill="url(#dvCamBody)"/>
        <rect x="40" y="70" width="52" height="3" rx="1.5" fill="#cbd5e1" opacity=".7"/>
        <rect x="94" y="50" width="14" height="28" rx="7" fill="#111827"/>
        <circle cx="101" cy="64" r="8.5" fill="url(#dvLens)"/>
        <circle cx="98.5" cy="61" r="2.4" fill="#fff" opacity=".85"/>
        <circle cx="101" cy="64" r="11.5" fill="none" stroke="#1f2937" stroke-width="1.2"/>
        <circle cx="42" cy="56" r="1.3" fill="#22c55e"/>
      </g>`),

    // Smartphone (Apple products)
    phone: svg(`
      <defs>
        <linearGradient id="dvPhFrame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f3f7"/><stop offset=".45" stop-color="#9aa3b2"/><stop offset="1" stop-color="#e2e6ec"/></linearGradient>
        <linearGradient id="dvPhScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e3a8a"/><stop offset=".45" stop-color="#7c3aed"/><stop offset=".78" stop-color="#f97316"/><stop offset="1" stop-color="#fcd34d"/></linearGradient>
        <linearGradient id="dvGlare" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      </defs>
      <g transform="rotate(-12 60 60)">
        <rect x="36" y="8" width="48" height="100" rx="11" fill="url(#dvPhFrame)"/>
        <rect x="34.6" y="30" width="1.8" height="10" rx=".9" fill="#8b95a5"/>
        <rect x="83.6" y="34" width="1.8" height="16" rx=".9" fill="#8b95a5"/>
        <rect x="38.8" y="10.8" width="42.4" height="94.4" rx="9" fill="#05060a"/>
        <rect x="40.6" y="12.6" width="38.8" height="90.8" rx="7.5" fill="url(#dvPhScreen)"/>
        <rect x="52" y="16" width="16" height="5" rx="2.5" fill="#05060a"/>
        <text x="60" y="42" text-anchor="middle" fill="#fff" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700">10:09</text>
        <text x="60" y="50" text-anchor="middle" fill="#fff" opacity=".8" font-family="Segoe UI, sans-serif" font-size="4.6">Friday, 10 October</text>
        <rect x="47" y="96" width="26" height="1.6" rx=".8" fill="#fff" opacity=".8"/>
        <path d="M40.6 20 Q40.6 12.6 48 12.6 H60 L40.6 70z" fill="url(#dvGlare)"/>
      </g>`),

    // Smart TV
    tv: svg(`
      <defs>
        <linearGradient id="dvTvSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#312e81"/><stop offset=".55" stop-color="#db2777"/><stop offset="1" stop-color="#fb923c"/></linearGradient>
        <linearGradient id="dvTvMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa3b2"/><stop offset=".5" stop-color="#f1f5f9"/><stop offset="1" stop-color="#9aa3b2"/></linearGradient>
      </defs>
      <rect x="4" y="20" width="112" height="68" rx="3.5" fill="#0b0d12"/>
      <rect x="6.5" y="22.5" width="107" height="63" rx="1.6" fill="url(#dvTvSky)"/>
      <circle cx="84" cy="44" r="8" fill="#fde68a"/>
      <path d="M6.5 70 L28 52 L42 62 L62 40 L88 64 L113.5 50 V85.5 H6.5z" fill="#1e1b4b" opacity=".85"/>
      <path d="M6.5 78 L36 66 L58 74 L84 62 L113.5 74 V85.5 H6.5z" fill="#0f172a"/>
      <path d="M6.5 22.5 H50 L6.5 66z" fill="#fff" opacity=".12"/>
      <rect x="56" y="86" width="8" height="2" fill="#475569"/>
      <path d="M40 98 L52 88 H68 L80 98z" fill="url(#dvTvMetal)"/>
      <rect x="32" y="97" width="56" height="3.4" rx="1.7" fill="url(#dvTvMetal)"/>`),

    // Split air-conditioner indoor unit with cool airflow
    ac: svg(`
      <defs>
        <linearGradient id="dvAcBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#eef2f7"/><stop offset="1" stop-color="#cdd6e2"/></linearGradient>
        <linearGradient id="dvAir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></linearGradient>
      </defs>
      <rect x="4" y="30" width="112" height="44" rx="13" fill="url(#dvAcBody)"/>
      <path d="M4 58 h112 v3 a13 13 0 0 1 -13 13 H17 A13 13 0 0 1 4 61z" fill="#dfe6ef"/>
      <path d="M14 64 h92" stroke="#b7c2d0" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M18 69 h84" stroke="#c7d0dc" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="82" y="38" width="22" height="10" rx="3" fill="#0f172a"/>
      <text x="93" y="46" text-anchor="middle" fill="#38bdf8" font-family="Segoe UI, sans-serif" font-size="7.5" font-weight="700">24°</text>
      <circle cx="16" cy="40" r="1.8" fill="#22d3ee"/>
      <path d="M8 34 h60" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>
      <g fill="none" stroke="url(#dvAir)" stroke-width="3" stroke-linecap="round">
        <path d="M30 80 q6 8 0 16 q-6 8 0 16"/><path d="M60 80 q6 8 0 16 q-6 8 0 16"/><path d="M90 80 q6 8 0 16 q-6 8 0 16"/>
      </g>
      <g fill="#7dd3fc"><circle cx="45" cy="92" r="1.6"/><circle cx="75" cy="100" r="1.4"/><circle cx="104" cy="90" r="1.2"/></g>`),

    // Over-ear headphones (computer accessories)
    keyboard: svg(`
      <defs>
        <linearGradient id="dvHpBand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f2937"/><stop offset=".5" stop-color="#4b5563"/><stop offset="1" stop-color="#1f2937"/></linearGradient>
        <linearGradient id="dvHpCup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset=".6" stop-color="#cbd5e1"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
        <linearGradient id="dvGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5dc6b"/><stop offset="1" stop-color="#b8860b"/></linearGradient>
      </defs>
      <path d="M22 70 C20 22 100 22 98 70" stroke="url(#dvHpBand)" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M30 60 C32 34 88 34 90 60" stroke="#9ca3af" stroke-width="2.5" fill="none" opacity=".6"/>
      <rect x="16" y="56" width="8" height="18" rx="3" fill="#6b7280"/><rect x="96" y="56" width="8" height="18" rx="3" fill="#6b7280"/>
      <rect x="8" y="64" width="28" height="44" rx="13" fill="url(#dvHpCup)"/>
      <rect x="84" y="64" width="28" height="44" rx="13" fill="url(#dvHpCup)"/>
      <rect x="30" y="68" width="10" height="36" rx="5" fill="#1f2937"/>
      <rect x="80" y="68" width="10" height="36" rx="5" fill="#1f2937"/>
      <circle cx="22" cy="86" r="7" fill="none" stroke="url(#dvGold)" stroke-width="2.4"/>
      <circle cx="98" cy="86" r="7" fill="none" stroke="url(#dvGold)" stroke-width="2.4"/>
      <path d="M12 72 q2 -5 8 -6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>`),
  };

  // Decorative floating extras
  const DECO = {
    watch: svg(`
      <defs>
        <linearGradient id="dvWCase" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f5f9"/><stop offset=".5" stop-color="#94a3b8"/><stop offset="1" stop-color="#e2e8f0"/></linearGradient>
        <linearGradient id="dvWBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb923c"/><stop offset="1" stop-color="#ea580c"/></linearGradient>
      </defs>
      <rect x="44" y="4" width="32" height="34" rx="7" fill="url(#dvWBand)"/>
      <rect x="44" y="82" width="32" height="34" rx="7" fill="url(#dvWBand)"/>
      <rect x="34" y="28" width="52" height="64" rx="15" fill="url(#dvWCase)"/>
      <rect x="85" y="46" width="5" height="11" rx="2.5" fill="#fb923c"/>
      <rect x="39" y="33" width="42" height="54" rx="11" fill="#05060a"/>
      <circle cx="60" cy="60" r="16" fill="none" stroke="#ef4444" stroke-width="3.5" stroke-dasharray="70 100" stroke-linecap="round" transform="rotate(-90 60 60)"/>
      <circle cx="60" cy="60" r="11.5" fill="none" stroke="#22c55e" stroke-width="3.5" stroke-dasharray="50 100" stroke-linecap="round" transform="rotate(-90 60 60)"/>
      <text x="60" y="63" text-anchor="middle" fill="#fff" font-family="Segoe UI, sans-serif" font-size="8" font-weight="700">10:09</text>`),
    buds: svg(`
      <defs><linearGradient id="dvBud" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e2e8f0"/><stop offset="1" stop-color="#b6c0cd"/></linearGradient></defs>
      <g transform="rotate(-18 40 50)">
        <ellipse cx="38" cy="36" rx="17" ry="15" fill="url(#dvBud)"/><rect x="30" y="40" width="12" height="52" rx="6" fill="url(#dvBud)"/>
        <ellipse cx="33" cy="31" rx="6" ry="5" fill="#334155"/><rect x="33" y="86" width="6" height="4" rx="2" fill="#94a3b8"/>
      </g>
      <g transform="rotate(14 82 62)">
        <ellipse cx="82" cy="48" rx="17" ry="15" fill="url(#dvBud)"/><rect x="78" y="52" width="12" height="52" rx="6" fill="url(#dvBud)"/>
        <ellipse cx="87" cy="43" rx="6" ry="5" fill="#334155"/><rect x="81" y="98" width="6" height="4" rx="2" fill="#94a3b8"/>
      </g>`),
  };

  // Holographic platform (viewBox 260 x 120, base centre at y=104)
  const PEDESTAL = `<svg class="pedestal" viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="pdSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e9bb0"/><stop offset=".22" stop-color="#eef2f7"/><stop offset=".5" stop-color="#c3cdda"/><stop offset=".78" stop-color="#f4f7fb"/><stop offset="1" stop-color="#7f8ca2"/></linearGradient>
      <linearGradient id="pdBase2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#64748b"/><stop offset=".5" stop-color="#cbd5e1"/><stop offset="1" stop-color="#64748b"/></linearGradient>
      <radialGradient id="pdTop" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#1d4ed8"/><stop offset=".55" stop-color="#0b1a3a"/><stop offset="1" stop-color="#050b1a"/></radialGradient>
      <filter id="pdGlow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter>
    </defs>
    <ellipse cx="130" cy="104" rx="126" ry="14" fill="url(#pdBase2)"/>
    <ellipse cx="130" cy="100" rx="118" ry="12.5" fill="#e2e8f0"/>
    <ellipse cx="130" cy="100" rx="114" ry="11.5" fill="none" stroke="#38bdf8" stroke-width="3" filter="url(#pdGlow)"/>
    <ellipse cx="130" cy="100" rx="114" ry="11.5" fill="none" stroke="#bae6fd" stroke-width="1"/>
    <path d="M30 26 L18 92 A112 14 0 0 0 242 92 L230 26 Z" fill="url(#pdSide)"/>
    <path d="M23 62 A107 14 0 0 0 237 62" fill="none" stroke="#38bdf8" stroke-width="4" filter="url(#pdGlow)"/>
    <path d="M23 62 A107 14 0 0 0 237 62" fill="none" stroke="#e0f2fe" stroke-width="1.6"/>
    <g fill="#0f172a" opacity=".55">${Array.from({ length: 13 }, (_, i) => { const x = 40 + i * 15; const y = 70 + Math.round(10 * Math.sin(Math.PI * (x - 23) / 214)); return `<rect x="${x}" y="${y}" width="7" height="2" rx="1"/>`; }).join('')}</g>
    <ellipse cx="130" cy="26" rx="100" ry="15" fill="url(#pdTop)"/>
    <ellipse cx="130" cy="26" rx="100" ry="15" fill="none" stroke="#f8fafc" stroke-width="2"/>
    <ellipse cx="130" cy="26" rx="78" ry="11" fill="none" stroke="#38bdf8" stroke-width="2.4" filter="url(#pdGlow)"/>
    <ellipse cx="130" cy="26" rx="78" ry="11" fill="none" stroke="#7dd3fc" stroke-width=".9"/>
    <ellipse cx="130" cy="26" rx="54" ry="7.4" fill="none" stroke="#e3c22b" stroke-width="1.3" stroke-dasharray="5 4"/>
    <ellipse cx="130" cy="26" rx="30" ry="4.2" fill="#7dd3fc" opacity=".55" filter="url(#pdGlow)"/>
  </svg>`;

  // Futuristic city skyline (deterministic pseudo-random)
  function skyline() {
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let x = 0, out = '';
    while (x < 1200) {
      const w = 28 + rnd() * 52, h = 70 + rnd() * 200, y = 300 - h;
      const shade = rnd() > .5 ? 'url(#skyA)' : 'url(#skyB)';
      out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${shade}"/>`;
      if (rnd() > .65) out += `<rect x="${(x + w / 2 - 1).toFixed(1)}" y="${(y - 26).toFixed(1)}" width="2" height="26" fill="#b6c8e2"/><circle cx="${(x + w / 2).toFixed(1)}" cy="${(y - 27).toFixed(1)}" r="2.4" fill="#7cc0ff"/>`;
      for (let wy = y + 12; wy < 290; wy += 16) if (rnd() > .55) out += `<rect x="${(x + 6).toFixed(1)}" y="${wy.toFixed(1)}" width="${(w - 12).toFixed(1)}" height="2" fill="#ffffff" opacity=".55"/>`;
      x += w + 4 + rnd() * 10;
    }
    return `<svg class="skyline" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><linearGradient id="skyA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c5d6ee"/><stop offset="1" stop-color="#e3ecf8"/></linearGradient>
      <linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4e1f3"/><stop offset="1" stop-color="#eaf1fa"/></linearGradient></defs>${out}</svg>`;
  }

  window.HERO_ART = { DEVICES, DECO, PEDESTAL, skyline };
})();
