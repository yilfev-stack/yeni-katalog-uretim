// Template HTML Engine - Single Source of Truth
// This generates HTML strings used BOTH for preview (frontend) and export (backend Playwright)

const DEMART = {
  company: "Demart Muhendislik San. Tic. Ltd. Sti",
  subtitle: "The art of Design Engineering Maintenance",
  motto: "Guvenligi, Verimliligi ve Gelecegi Bir Arada Koruyun",
  website: "www.demart.com.tr",
  email: "info@demart.com.tr",
  address: "VeliBaba Mah. Ertugrul Gazi Cad. No 82/1, 35852 Pendik Istanbul TURKIYE",
  logo_url: "https://customer-assets.emergentagent.com/job_sofis-marketing-exe/artifacts/8cw43hdp_logo%20sosn.jpg",
  sofis_logo_url: "https://customer-assets.emergentagent.com/job_ffb90a8b-8cf3-4732-bc1d-c708d6edf43e/artifacts/noo38mpw_sofis_valve_operation_logo.jpeg"
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700&family=Roboto+Condensed:wght@300;400;700&display=swap');`;

const BASE_STYLES = `
  ${FONT_IMPORT}
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Open Sans', sans-serif; }
  .page { width: 100%; height: 100%; position: relative; overflow: hidden; }
  h1, h2, p, li, span, div { overflow-wrap: break-word; word-wrap: break-word; }
`;

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function bulletPointsHtml(points, color = '#0f172a') {
  if (!points || points.length === 0) return '';
  return points.map(p => `<li style="margin-bottom:6px;color:${color};font-size:13px;line-height:1.5;">${escapeHtml(p)}</li>`).join('');
}

function grainOverlay(enabled, intensity = 20) {
  if (!enabled) return '';
  return `<div style="position:absolute;inset:0;opacity:${intensity/100};mix-blend-mode:overlay;pointer-events:none;background-image:url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.5"/></svg>`)}');background-repeat:repeat;z-index:999;"></div>`;
}

function headerBar(theme) {
  return `
    <div style="height:56px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 28px;border-bottom:3px solid ${theme.primary_color};">
      <img src="${DEMART.logo_url}" alt="DEMART" style="height:38px;object-fit:contain;" crossorigin="anonymous" />
      <div style="text-align:right;">
        <div style="font-size:9px;color:#64748b;">${DEMART.website} | ${DEMART.email}</div>
      </div>
      <img src="${DEMART.sofis_logo_url}" alt="Sofis" style="height:36px;object-fit:contain;" crossorigin="anonymous" />
    </div>`;
}

function footerBar(theme) {
  return `
    <div style="height:40px;background:#f8fafc;display:flex;align-items:center;justify-content:space-between;padding:0 28px;border-top:1px solid #e2e8f0;position:absolute;bottom:0;left:0;right:0;">
      <span style="font-size:8px;color:#64748b;">${DEMART.address}</span>
      <span style="font-size:8px;color:${theme.primary_color};font-style:italic;">"${DEMART.motto}"</span>
    </div>`;
}

// ==================== TEMPLATE 1: Industrial Product Alert ====================
function industrialProductAlert(data, theme, effects = {}) {
  const d = data || {};
  return `<!DOCTYPE html><html><head><style>
    ${BASE_STYLES}
    .page { background: #fff; }
  </style></head><body><div class="page" style="width:794px;height:1123px;position:relative;">
    ${headerBar(theme)}
    <div style="display:flex;height:calc(100% - 96px);">
      <div style="width:45%;position:relative;overflow:hidden;">
        ${d.image_data ? `<img src="${d.image_data}" style="width:100%;height:100%;object-fit:${d.image_fit || 'cover'};${effects.feather ? `filter:blur(0px);mask-image:linear-gradient(to right,black 85%,transparent 100%)` : ''}" crossorigin="anonymous" />` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%);display:flex;align-items:center;justify-content:center;"><span style="color:#334155;font-size:48px;opacity:0.3;">IMG</span></div>`}
        <div style="position:absolute;inset:0;background:linear-gradient(to right,transparent 60%,${theme.primary_color}22 100%);"></div>
      </div>
      <div style="width:55%;padding:40px 32px;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(135deg,${theme.primary_color}08 0%,${theme.primary_color}15 100%);">
        <div style="background:${theme.accent_color};color:#fff;display:inline-block;padding:6px 16px;border-radius:4px;font-family:'Montserrat',sans-serif;font-weight:800;font-size:12px;letter-spacing:2px;margin-bottom:20px;width:fit-content;">PRODUCT ALERT!</div>
        <h1 style="font-family:'Montserrat',sans-serif;font-size:32px;font-weight:800;color:${theme.primary_color};line-height:1.2;margin-bottom:16px;">${escapeHtml(d.title || 'Urun Basligi')}</h1>
        ${d.subtitle ? `<h2 style="font-family:'Montserrat',sans-serif;font-size:18px;font-weight:500;color:${theme.secondary_color};margin-bottom:20px;">${escapeHtml(d.subtitle)}</h2>` : ''}
        ${d.description ? `<p style="font-size:14px;color:#475569;line-height:1.7;margin-bottom:24px;">${escapeHtml(d.description)}</p>` : ''}
        ${d.bullet_points?.length ? `<ul style="list-style:none;padding:0;margin-bottom:24px;">${d.bullet_points.map(p => `<li style="padding:6px 0;font-size:13px;color:#334155;display:flex;align-items:flex-start;gap:8px;"><span style="color:${theme.primary_color};font-weight:bold;font-size:16px;line-height:1;">&#9679;</span>${escapeHtml(p)}</li>`).join('')}</ul>` : ''}
        ${d.key_benefits ? `<div style="background:${theme.primary_color}12;border-left:4px solid ${theme.primary_color};padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:20px;"><div style="font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;color:${theme.primary_color};letter-spacing:1px;margin-bottom:6px;">TEMEL AVANTAJLAR</div><p style="font-size:12px;color:#334155;line-height:1.6;">${escapeHtml(d.key_benefits)}</p></div>` : ''}
        ${d.cta_text ? `<div style="background:${theme.primary_color};color:#fff;padding:12px 28px;border-radius:6px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:14px;display:inline-block;width:fit-content;">${escapeHtml(d.cta_text)}</div>` : ''}
      </div>
    </div>
    ${footerBar(theme)}
    ${grainOverlay(effects.grain_enabled, effects.grain_intensity)}
  </div></body></html>`;
}

// ==================== TEMPLATE 2: Event Poster ====================
function eventPoster(data, theme, effects = {}) {
  const d = data || {};
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body><div class="page" style="width:794px;height:1123px;position:relative;background:linear-gradient(160deg,${theme.primary_color} 0%,${theme.secondary_color} 60%,#0c1425 100%);">
    <div style="position:absolute;top:20px;right:20px;width:80px;height:80px;border:2px solid rgba(255,255,255,0.15);border-radius:50%;"></div>
    <div style="position:absolute;top:50px;right:50px;width:120px;height:120px;border:1px solid rgba(255,255,255,0.08);border-radius:50%;"></div>
    <div style="padding:50px 50px;display:flex;flex-direction:column;align-items:center;text-align:center;height:100%;position:relative;z-index:1;overflow:hidden;">
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;max-width:650px;overflow:hidden;">
        ${d.image_data ? `<img src="${d.image_data}" style="max-width:200px;max-height:180px;object-fit:contain;margin-bottom:20px;border-radius:12px;" crossorigin="anonymous" />` : ''}
        <h1 style="font-family:'Montserrat',sans-serif;font-size:38px;font-weight:900;color:#fff;line-height:1.15;margin-bottom:14px;text-transform:uppercase;overflow:hidden;">${escapeHtml(d.title || 'ETKINLIK ADI')}</h1>
        ${d.subtitle ? `<h2 style="font-family:'Montserrat',sans-serif;font-size:17px;font-weight:400;color:rgba(255,255,255,0.9);margin-bottom:24px;font-style:italic;">${escapeHtml(d.subtitle)}</h2>` : ''}
        ${d.description ? `<p style="font-size:14px;color:rgba(255,255,255,0.85);line-height:1.7;margin-bottom:24px;max-width:550px;overflow:hidden;">${escapeHtml(d.description)}</p>` : ''}
        ${d.bullet_points?.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:16px;">${d.bullet_points.slice(0,6).map(p => `<span style="padding:5px 14px;border:1px solid rgba(255,255,255,0.25);border-radius:20px;font-size:11px;color:rgba(255,255,255,0.85);">${escapeHtml(p)}</span>`).join('')}</div>` : ''}
        ${d.applications ? `<div style="margin-bottom:12px;"><span style="font-size:13px;color:rgba(255,255,255,0.8);">${escapeHtml(d.applications)}</span></div>` : ''}
        ${d.key_benefits ? `<div style="margin-bottom:12px;"><span style="font-size:13px;color:rgba(255,255,255,0.8);">${escapeHtml(d.key_benefits)}</span></div>` : ''}
        ${d.cta_text ? `<div style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;padding:12px 32px;border-radius:50px;font-family:'Montserrat',sans-serif;font-weight:600;font-size:14px;margin-top:16px;backdrop-filter:blur(10px);">${escapeHtml(d.cta_text)}</div>` : ''}
      </div>
      <div style="display:flex;gap:40px;align-items:center;padding:24px 0;border-top:1px solid rgba(255,255,255,0.15);width:100%;justify-content:center;">
        <img src="${DEMART.logo_url}" style="height:36px;filter:brightness(0) invert(1);opacity:0.8;" crossorigin="anonymous" />
        <img src="${DEMART.sofis_logo_url}" style="height:32px;filter:brightness(0) invert(1);opacity:0.8;" crossorigin="anonymous" />
      </div>
    </div>
    ${grainOverlay(effects.grain_enabled, effects.grain_intensity)}
  </div></body></html>`;
}

// ==================== TEMPLATE 3: Minimal Premium ====================
function minimalPremium(data, theme, effects = {}) {
  const d = data || {};
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body><div class="page" style="width:794px;height:1123px;position:relative;background:#ffffff;">
    ${headerBar(theme)}
    <div style="padding:80px 60px 60px;height:calc(100% - 96px);display:flex;flex-direction:column;">
      <div style="width:60px;height:4px;background:${theme.primary_color};margin-bottom:40px;"></div>
      <h1 style="font-family:'Montserrat',sans-serif;font-size:42px;font-weight:300;color:${theme.text_color};line-height:1.2;margin-bottom:12px;letter-spacing:-1px;">${escapeHtml(d.title || 'Urun Adi')}</h1>
      ${d.subtitle ? `<h2 style="font-family:'Montserrat',sans-serif;font-size:18px;font-weight:400;color:${theme.primary_color};margin-bottom:40px;">${escapeHtml(d.subtitle)}</h2>` : '<div style="margin-bottom:40px;"></div>'}
      <div style="display:flex;gap:50px;flex:1;">
        <div style="flex:1;">
          ${d.description ? `<p style="font-size:15px;color:#475569;line-height:1.9;margin-bottom:30px;">${escapeHtml(d.description)}</p>` : ''}
          ${d.bullet_points?.length ? `<ul style="list-style:none;padding:0;">${d.bullet_points.map(p => `<li style="padding:10px 0;font-size:14px;color:#334155;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:12px;"><span style="width:6px;height:6px;border-radius:50%;background:${theme.primary_color};flex-shrink:0;"></span>${escapeHtml(p)}</li>`).join('')}</ul>` : ''}
          ${d.key_benefits ? `<div style="margin-top:30px;padding:20px;background:#f8fafc;border-radius:8px;"><p style="font-size:13px;color:#64748b;line-height:1.7;">${escapeHtml(d.key_benefits)}</p></div>` : ''}
        </div>
        <div style="width:280px;flex-shrink:0;">
          ${d.image_data ? `<img src="${d.image_data}" style="width:100%;border-radius:12px;object-fit:${d.image_fit || 'cover'};box-shadow:0 20px 60px rgba(0,0,0,0.1);" crossorigin="anonymous" />` : `<div style="width:100%;aspect-ratio:3/4;background:#f1f5f9;border-radius:12px;display:flex;align-items:center;justify-content:center;"><span style="color:#94a3b8;font-size:14px;">Gorsel Alani</span></div>`}
        </div>
      </div>
    </div>
    ${footerBar(theme)}
    ${grainOverlay(effects.grain_enabled, effects.grain_intensity)}
  </div></body></html>`;
}

// ==================== TEMPLATE 4: Tech Data Sheet ====================
function techDataSheet(data, theme, effects = {}) {
  const d = data || {};
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body><div class="page" style="width:794px;height:1123px;position:relative;background:#fff;">
    ${headerBar(theme)}
    <div style="padding:30px 28px;height:calc(100% - 96px);">
      <div style="display:flex;gap:20px;margin-bottom:20px;">
        <div style="flex:1;">
          <h1 style="font-family:'Montserrat',sans-serif;font-size:26px;font-weight:800;color:${theme.primary_color};margin-bottom:8px;">${escapeHtml(d.title || 'TEKNIK VERI SAYFASI')}</h1>
          ${d.subtitle ? `<p style="font-size:14px;color:#64748b;margin-bottom:12px;">${escapeHtml(d.subtitle)}</p>` : ''}
          ${d.description ? `<p style="font-size:12px;color:#475569;line-height:1.6;">${escapeHtml(d.description)}</p>` : ''}
        </div>
        ${d.image_data ? `<div style="width:200px;flex-shrink:0;"><img src="${d.image_data}" style="width:100%;border-radius:8px;object-fit:${d.image_fit || 'contain'};border:1px solid #e2e8f0;" crossorigin="anonymous" /></div>` : ''}
      </div>
      ${d.bullet_points?.length ? `
        <div style="margin-bottom:16px;">
          <div style="background:${theme.primary_color};color:#fff;padding:8px 16px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;">TEKNIK OZELLIKLER</div>
          <table style="width:100%;border-collapse:collapse;">
            ${d.bullet_points.map((p, i) => {
              const parts = p.split(':');
              return `<tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'};"><td style="padding:8px 16px;font-size:12px;color:#334155;border:1px solid #e2e8f0;font-weight:600;width:40%;">${escapeHtml(parts[0] || p)}</td><td style="padding:8px 16px;font-size:12px;color:#475569;border:1px solid #e2e8f0;">${escapeHtml(parts[1] || '')}</td></tr>`;
            }).join('')}
          </table>
        </div>` : ''}
      ${d.applications ? `<div style="margin-bottom:16px;"><div style="font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;color:${theme.primary_color};letter-spacing:1px;margin-bottom:8px;">UYGULAMA ALANLARI</div><p style="font-size:12px;color:#475569;line-height:1.6;">${escapeHtml(d.applications)}</p></div>` : ''}
      ${d.key_benefits ? `<div style="background:${theme.primary_color}08;border:1px solid ${theme.primary_color}20;border-radius:8px;padding:16px;"><div style="font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;color:${theme.primary_color};letter-spacing:1px;margin-bottom:6px;">TEMEL AVANTAJLAR</div><p style="font-size:12px;color:#334155;line-height:1.6;">${escapeHtml(d.key_benefits)}</p></div>` : ''}
    </div>
    ${footerBar(theme)}
    ${grainOverlay(effects.grain_enabled, effects.grain_intensity)}
  </div></body></html>`;
}

// ==================== TEMPLATE 5: Photo Dominant ====================
function photoDominant(data, theme, effects = {}) {
  const d = data || {};
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body><div class="page" style="width:794px;height:1123px;position:relative;">
    ${d.image_data ? `<img src="${d.image_data}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${d.image_fit || 'cover'};z-index:0;" crossorigin="anonymous" />` : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);z-index:0;"></div>`}
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.6) 60%,rgba(0,0,0,0.85) 100%);z-index:1;"></div>
    <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:60px 50px;">
      <div style="width:50px;height:4px;background:${theme.accent_color || '#f59e0b'};margin-bottom:20px;"></div>
      <h1 style="font-family:'Montserrat',sans-serif;font-size:44px;font-weight:800;color:#fff;line-height:1.15;margin-bottom:16px;">${escapeHtml(d.title || 'Baslak')}</h1>
      ${d.subtitle ? `<h2 style="font-family:'Montserrat',sans-serif;font-size:20px;font-weight:400;color:rgba(255,255,255,0.85);margin-bottom:16px;">${escapeHtml(d.subtitle)}</h2>` : ''}
      ${d.description ? `<p style="font-size:15px;color:rgba(255,255,255,0.75);line-height:1.7;max-width:500px;margin-bottom:24px;">${escapeHtml(d.description)}</p>` : ''}
      ${d.cta_text ? `<div style="border:2px solid #fff;color:#fff;padding:12px 32px;display:inline-block;font-family:'Montserrat',sans-serif;font-weight:600;font-size:14px;width:fit-content;">${escapeHtml(d.cta_text)}</div>` : ''}
      <div style="display:flex;gap:30px;align-items:center;margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.2);">
        <img src="${DEMART.logo_url}" style="height:30px;filter:brightness(0) invert(1);opacity:0.7;" crossorigin="anonymous" />
        <img src="${DEMART.sofis_logo_url}" style="height:28px;filter:brightness(0) invert(1);opacity:0.7;" crossorigin="anonymous" />
        <span style="font-size:10px;color:rgba(255,255,255,0.5);margin-left:auto;">${DEMART.website}</span>
      </div>
    </div>
    ${grainOverlay(effects.grain_enabled, effects.grain_intensity)}
  </div></body></html>`;
}

// ==================== TEMPLATE 6: Geometric Corporate ====================
function geometricCorporate(data, theme, effects = {}) {
  const d = data || {};
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body><div class="page" style="width:794px;height:1123px;position:relative;background:#fff;">
    ${headerBar(theme)}
    <div style="height:calc(100% - 96px);">
      <div style="background:${theme.primary_color};padding:40px 40px 30px;color:#fff;">
        <h1 style="font-family:'Montserrat',sans-serif;font-size:34px;font-weight:800;margin-bottom:8px;">${escapeHtml(d.title || 'Baslak')}</h1>
        ${d.subtitle ? `<p style="font-size:16px;opacity:0.85;">${escapeHtml(d.subtitle)}</p>` : ''}
      </div>
      <div style="display:flex;">
        <div style="flex:1;padding:30px 40px;">
          ${d.description ? `<p style="font-size:14px;color:#475569;line-height:1.8;margin-bottom:24px;">${escapeHtml(d.description)}</p>` : ''}
          ${d.bullet_points?.length ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">${d.bullet_points.map(p => `<div style="background:#f8fafc;padding:14px;border-radius:6px;border-left:3px solid ${theme.primary_color};"><span style="font-size:12px;color:#334155;">${escapeHtml(p)}</span></div>`).join('')}</div>` : ''}
          ${d.applications ? `<div style="padding:16px;background:${theme.primary_color}08;border-radius:8px;margin-bottom:16px;"><div style="font-size:10px;font-weight:700;color:${theme.primary_color};letter-spacing:1px;margin-bottom:6px;">UYGULAMA ALANLARI</div><p style="font-size:12px;color:#475569;line-height:1.6;">${escapeHtml(d.applications)}</p></div>` : ''}
          ${d.key_benefits ? `<div style="padding:16px;background:${theme.accent_color}15;border-left:3px solid ${theme.accent_color};border-radius:0 8px 8px 0;"><div style="font-size:10px;font-weight:700;color:${theme.accent_color};letter-spacing:1px;margin-bottom:6px;">TEMEL AVANTAJLAR</div><p style="font-size:12px;color:#334155;line-height:1.6;">${escapeHtml(d.key_benefits)}</p></div>` : ''}
        </div>
        ${d.image_data ? `<div style="width:280px;flex-shrink:0;padding:30px 30px 30px 0;"><img src="${d.image_data}" style="width:100%;border-radius:8px;object-fit:${d.image_fit || 'cover'};box-shadow:0 10px 40px rgba(0,0,0,0.1);" crossorigin="anonymous" /></div>` : ''}
      </div>
    </div>
    ${footerBar(theme)}
    ${grainOverlay(effects.grain_enabled, effects.grain_intensity)}
  </div></body></html>`;
}

// ==================== TEMPLATE 7: Dark Tech ====================
function darkTech(data, theme, effects = {}) {
  const d = data || {};
  const neon = theme.accent_color || '#22d3ee';
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body><div class="page" style="width:794px;height:1123px;position:relative;background:linear-gradient(180deg,#020617 0%,#0f172a 50%,#020617 100%);">
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${neon},transparent);"></div>
    <div style="padding:50px 40px;height:100%;display:flex;flex-direction:column;position:relative;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;">
        <img src="${DEMART.logo_url}" style="height:32px;filter:brightness(0) invert(1);opacity:0.6;" crossorigin="anonymous" />
        <img src="${DEMART.sofis_logo_url}" style="height:30px;filter:brightness(0) invert(1);opacity:0.6;" crossorigin="anonymous" />
      </div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;overflow:hidden;">
        <div style="width:40px;height:2px;background:${neon};margin-bottom:20px;box-shadow:0 0 10px ${neon};"></div>
        <h1 style="font-family:'Montserrat',sans-serif;font-size:34px;font-weight:800;color:#f8fafc;line-height:1.15;margin-bottom:14px;">${escapeHtml(d.title || 'URUN ADI')}</h1>
        ${d.subtitle ? `<h2 style="font-family:'Montserrat',sans-serif;font-size:16px;font-weight:400;color:${neon};margin-bottom:20px;">${escapeHtml(d.subtitle)}</h2>` : ''}
        ${d.description ? `<p style="font-size:13px;color:#94a3b8;line-height:1.7;margin-bottom:20px;max-width:500px;overflow:hidden;">${escapeHtml(d.description)}</p>` : ''}
        ${d.bullet_points?.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">${d.bullet_points.slice(0,8).map(p => `<div style="padding:6px 14px;border:1px solid ${neon}30;border-radius:4px;font-size:11px;color:#cbd5e1;background:${neon}08;">${escapeHtml(p)}</div>`).join('')}</div>` : ''}
        ${d.applications ? `<p style="font-size:12px;color:#64748b;margin-bottom:12px;">${escapeHtml(d.applications)}</p>` : ''}
        ${d.key_benefits ? `<p style="font-size:12px;color:${neon}80;margin-bottom:16px;">${escapeHtml(d.key_benefits)}</p>` : ''}
        ${d.cta_text ? `<div style="border:1px solid ${neon};color:${neon};padding:10px 24px;display:inline-block;font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;width:fit-content;border-radius:4px;">${escapeHtml(d.cta_text)}</div>` : ''}
        ${d.image_data ? `<div style="margin-top:16px;"><img src="${d.image_data}" style="max-width:350px;max-height:200px;object-fit:${d.image_fit || 'contain'};border-radius:8px;box-shadow:0 0 40px ${neon}20;" crossorigin="anonymous" /></div>` : ''}
      </div>
      <div style="border-top:1px solid #1e293b;padding-top:16px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:9px;color:#475569;">${DEMART.website}</span>
        <span style="font-size:9px;color:${neon};">${DEMART.email}</span>
      </div>
    </div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${neon},transparent);"></div>
    ${grainOverlay(effects.grain_enabled, effects.grain_intensity)}
  </div></body></html>`;
}

// ==================== TEMPLATE 8: Clean Industrial Grid ====================
function cleanIndustrialGrid(data, theme, effects = {}) {
  const d = data || {};
  const icons = ['&#9881;', '&#9889;', '&#9878;', '&#9850;', '&#10003;', '&#9733;'];
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body><div class="page" style="width:794px;height:1123px;position:relative;background:#fff;">
    ${headerBar(theme)}
    <div style="padding:30px 32px;height:calc(100% - 96px);">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="font-family:'Montserrat',sans-serif;font-size:30px;font-weight:800;color:${theme.primary_color};">${escapeHtml(d.title || 'URUN FAYDALARI')}</h1>
        ${d.subtitle ? `<p style="font-size:15px;color:#64748b;margin-top:8px;">${escapeHtml(d.subtitle)}</p>` : ''}
      </div>
      ${d.image_data ? `<div style="text-align:center;margin-bottom:24px;"><img src="${d.image_data}" style="max-height:200px;object-fit:${d.image_fit || 'contain'};border-radius:12px;" crossorigin="anonymous" /></div>` : ''}
      ${d.bullet_points?.length ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">${d.bullet_points.map((p, i) => `<div style="background:#f8fafc;padding:20px;border-radius:10px;display:flex;gap:14px;align-items:flex-start;border:1px solid #e2e8f0;"><div style="width:36px;height:36px;background:${theme.primary_color}15;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="color:${theme.primary_color};font-size:18px;">${icons[i % icons.length]}</span></div><span style="font-size:13px;color:#334155;line-height:1.5;">${escapeHtml(p)}</span></div>`).join('')}</div>` : ''}
      ${d.description ? `<p style="font-size:13px;color:#475569;line-height:1.7;text-align:center;max-width:600px;margin:0 auto;">${escapeHtml(d.description)}</p>` : ''}
    </div>
    ${footerBar(theme)}
    ${grainOverlay(effects.grain_enabled, effects.grain_intensity)}
  </div></body></html>`;
}

// ==================== TEMPLATE 9: Greeting Card ====================
function greetingCard(data, theme, effects = {}) {
  const d = data || {};
  const bg = d.background_color || theme.primary_color;
  const txtColor = d.text_color || '#ffffff';
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body><div class="page" style="width:794px;height:1123px;position:relative;background:${bg};">
    <div style="position:absolute;top:40px;left:40px;right:40px;bottom:40px;border:2px solid ${txtColor}30;border-radius:20px;"></div>
    <div style="position:absolute;top:55px;left:55px;right:55px;bottom:55px;border:1px solid ${txtColor}15;border-radius:14px;"></div>
    <div style="position:relative;z-index:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 60px;text-align:center;">
      ${d.image_data ? `<img src="${d.image_data}" style="max-width:200px;max-height:200px;object-fit:contain;margin-bottom:30px;border-radius:12px;" crossorigin="anonymous" />` : ''}
      <h1 style="font-family:'Montserrat',sans-serif;font-size:38px;font-weight:700;color:${txtColor};margin-bottom:24px;line-height:1.3;">${escapeHtml(d.title || 'Tebrikler!')}</h1>
      <div style="width:60px;height:3px;background:${txtColor};opacity:0.4;margin-bottom:24px;border-radius:2px;"></div>
      <p style="font-size:16px;color:${txtColor};opacity:0.9;line-height:1.8;max-width:450px;margin-bottom:40px;white-space:pre-line;">${escapeHtml(d.description || d.message || 'Mesajiniz burada gorunecek.')}</p>
      ${d.from_name ? `<p style="font-size:14px;color:${txtColor};opacity:0.7;font-style:italic;">- ${escapeHtml(d.from_name)}</p>` : ''}
      <div style="position:absolute;bottom:50px;display:flex;gap:20px;align-items:center;">
        <img src="${DEMART.logo_url}" style="height:28px;opacity:0.5;${bg === '#ffffff' || bg === '#fff' ? '' : 'filter:brightness(0) invert(1);'}" crossorigin="anonymous" />
        <img src="${DEMART.sofis_logo_url}" style="height:26px;opacity:0.5;${bg === '#ffffff' || bg === '#fff' ? '' : 'filter:brightness(0) invert(1);'}" crossorigin="anonymous" />
      </div>
    </div>
    ${grainOverlay(effects.grain_enabled, effects.grain_intensity)}
  </div></body></html>`;
}

// ==================== TEMPLATE 10: Condolence Card ====================
function condolenceCard(data, theme, effects = {}) {
  const d = data || {};
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body><div class="page" style="width:794px;height:1123px;position:relative;background:linear-gradient(180deg,#1e293b 0%,#0f172a 100%);">
    <div style="position:absolute;top:50px;left:50px;right:50px;bottom:50px;border:1px solid rgba(148,163,184,0.2);"></div>
    <div style="position:relative;z-index:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 80px;text-align:center;">
      <div style="width:80px;height:1px;background:linear-gradient(90deg,transparent,#64748b,transparent);margin-bottom:40px;"></div>
      <h1 style="font-family:'Montserrat',sans-serif;font-size:32px;font-weight:300;color:#e2e8f0;margin-bottom:30px;letter-spacing:2px;line-height:1.4;">${escapeHtml(d.title || 'Baskisagligi')}</h1>
      <div style="width:40px;height:1px;background:#475569;margin-bottom:30px;"></div>
      <p style="font-size:15px;color:#94a3b8;line-height:2;max-width:420px;margin-bottom:40px;white-space:pre-line;">${escapeHtml(d.description || d.message || 'Taziye mesajiniz burada gorunecek.')}</p>
      ${d.from_name ? `<p style="font-size:13px;color:#64748b;font-style:italic;margin-bottom:40px;">- ${escapeHtml(d.from_name)}</p>` : ''}
      <div style="width:80px;height:1px;background:linear-gradient(90deg,transparent,#475569,transparent);margin-bottom:40px;"></div>
      <div style="display:flex;gap:20px;align-items:center;">
        <img src="${DEMART.logo_url}" style="height:24px;filter:brightness(0) invert(1);opacity:0.3;" crossorigin="anonymous" />
        <img src="${DEMART.sofis_logo_url}" style="height:22px;filter:brightness(0) invert(1);opacity:0.3;" crossorigin="anonymous" />
      </div>
    </div>
    ${grainOverlay(effects.grain_enabled, effects.grain_intensity)}
  </div></body></html>`;
}

// ==================== TEMPLATE REGISTRY ====================
export const TEMPLATES = [
  { id: 'industrial-product-alert', name: 'Industrial Product Alert', category: 'product', description: 'Rosemount tarzi diagonal panel + CTA', generator: industrialProductAlert },
  { id: 'event-poster', name: 'Event Poster', category: 'event', description: 'ENOSAD tarzi etkinlik afisi', generator: eventPoster },
  { id: 'minimal-premium', name: 'Minimal Premium', category: 'product', description: 'Cok beyaz alan, buyuk tipografi', generator: minimalPremium },
  { id: 'tech-data-sheet', name: 'Tech Data Sheet', category: 'technical', description: 'Tablo agirlikli teknik veri', generator: techDataSheet },
  { id: 'photo-dominant', name: 'Photo Dominant', category: 'product', description: 'Tam ekran gorsel + kisa mesaj', generator: photoDominant },
  { id: 'geometric-corporate', name: 'Geometric Corporate', category: 'product', description: 'Serit/blok kurumsal', generator: geometricCorporate },
  { id: 'dark-tech', name: 'Dark Tech', category: 'product', description: 'Koyu tema, neon vurgu', generator: darkTech },
  { id: 'clean-industrial-grid', name: 'Clean Industrial Grid', category: 'product', description: 'Ikonlu fayda kutulari', generator: cleanIndustrialGrid },
  { id: 'greeting-card', name: 'Tebrik Karti', category: 'card', description: 'Kutlama ve tebrik', generator: greetingCard },
  { id: 'condolence-card', name: 'Taziye Karti', category: 'card', description: 'Taziye ve baskisagligi', generator: condolenceCard },
];

export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'Tumunu Goster' },
  { id: 'product', name: 'Urun Tanitim' },
  { id: 'event', name: 'Etkinlik' },
  { id: 'technical', name: 'Teknik' },
  { id: 'card', name: 'Kart' },
];

export function generateTemplateHTML(templateId, data, theme, effects = {}) {
  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template) return industrialProductAlert(data, theme, effects);
  return template.generator(data, theme, effects);
}

export const DEFAULT_THEME = {
  primary_color: '#004aad',
  secondary_color: '#003c8f',
  accent_color: '#f59e0b',
  background_color: '#f8fafc',
  text_color: '#0f172a',
  heading_font: 'Montserrat',
  body_font: 'Open Sans',
  accent_font: 'Roboto Condensed'
};

export { DEMART };
