import { DEMART_LOGO_B64, SOFIS_LOGO_B64 } from './logoData';
import { normalizeContent } from './catalogSchema';

const DEMART = {
  company: "Demart Muhendislik San. Tic. Ltd. Sti",
  subtitle: "The art of Design Engineering Maintenance",
  motto: "Guvenligi, Verimliligi ve Gelecegi Bir Arada Koruyun",
  website: "www.demart.com.tr",
  email: "info@demart.com.tr",
  address: "VeliBaba Mah. Ertugrul Gazi Cad. No 82/1, 35852 Pendik Istanbul TURKIYE",
  logo_b64: DEMART_LOGO_B64,
  sofis_b64: SOFIS_LOGO_B64
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700&family=Roboto+Condensed:wght@300;400;700&display=swap');`;

const BASE_STYLES = `
  ${FONT_IMPORT}
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Open Sans',sans-serif; }
  .page { width:100%; height:100%; position:relative; overflow:hidden; }
  h1,h2,p,li,span,div {
    overflow-wrap:anywhere;
    word-wrap:break-word;
    word-break:break-word;
    max-width:100%;
  }
  p,li { line-height:1.5; }
`;

function esc(str) { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Get style string from content data for a field
function fieldStyle(content, field, defaults = {}) {
  const c = content || {};
  const baseSize = c[`${field}_size`] || defaults.size || 14;
  const minSize = c[`${field}_min_size`] || defaults.minSize || 10;
  const font = c[`${field}_font`] || defaults.font || 'inherit';
  const bold = c[`${field}_bold`] || defaults.bold || false;
  const italic = c[`${field}_italic`] || defaults.italic || false;
  const color = c[`${field}_color`] || defaults.color || '';
  const overflow = c[`${field}_overflow`] || defaults.overflow || 'wrap';
  const clampLines = c[`${field}_clamp_lines`] || defaults.clampLines || 3;

  let text = c[field];
  if (Array.isArray(text)) text = text.join(' ');
  if (typeof text !== 'string') text = '';

  let size = baseSize;
  if (overflow === 'autofit') {
    const threshold = defaults.autofitThreshold || 90;
    if (text.length > threshold) {
      size = Math.max(minSize, Math.floor(baseSize - (text.length - threshold) / 18));
    }
  }

  let s = `font-size:${size}px;`;
  if (font !== 'inherit') s += `font-family:${font};`;
  if (bold) s += 'font-weight:bold;';
  if (italic) s += 'font-style:italic;';
  if (color) s += `color:${color};`;

  if (overflow === 'ellipsis') {
    s += 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  } else if (overflow === 'clamp') {
    s += `display:-webkit-box;-webkit-line-clamp:${clampLines};-webkit-box-orient:vertical;overflow:hidden;`;
  } else {
    s += 'overflow:hidden;white-space:normal;overflow-wrap:anywhere;word-break:break-word;';
  }

  s += fieldBoxStyle(c, field);
  return s;
}

function grainOverlay(enabled, intensity = 20) {
  if (!enabled) return '';
  return `<div style="position:absolute;inset:0;opacity:${intensity/100};mix-blend-mode:overlay;pointer-events:none;background-image:url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.5"/></svg>`)}');background-repeat:repeat;z-index:999;"></div>`;
}

function headerBar(theme) {
  return `<div style="height:54px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-bottom:3px solid ${theme.primary_color};">
    <img src="${DEMART.logo_b64}" alt="DEMART" style="height:36px;object-fit:contain;" />
    <div style="text-align:right;font-size:9px;color:#64748b;">${DEMART.website} | ${DEMART.email}</div>
    <img src="${DEMART.sofis_b64}" alt="Sofis" style="height:32px;object-fit:contain;" />
  </div>`;
}

function footerBar(theme) {
  return `<div style="height:36px;background:#f8fafc;display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-top:1px solid #e2e8f0;position:absolute;bottom:0;left:0;right:0;">
    <span style="font-size:7px;color:#64748b;">${DEMART.address}</span>
    <span style="font-size:7px;color:${theme.primary_color};font-style:italic;">"${DEMART.motto}"</span>
  </div>`;
}

function pickPageBackground(custom, fallback) {
  if (custom) return `background:${custom};`;
  return fallback;
}

function getLayerMap(rawLayers = []) {

  return rawLayers.reduce((acc, layer) => {
    if (layer?.id) acc[layer.id] = layer;
    return acc;
  }, {});
}

function isLayerVisible(layerMap, id) {
  const layer = layerMap[id];
  if (!layer) return true;
  return layer.visible !== false;
}


function fieldBoxStyle(content = {}, field) {
  const box = content?.field_boxes?.[field];
  if (!box) return '';
  const x = Number(box.x ?? 50);
  const y = Number(box.y ?? 50);
  const w = Number(box.width ?? 30);
  const h = Number(box.height ?? 12);
  const z = Number(box.zIndex ?? 10);
  return `position:absolute;left:${x}%;top:${y}%;width:${w}%;height:${h}%;transform:translate(-50%,-50%);overflow:hidden;z-index:${z};`;
}

function renderShapeLayers(data = {}, layerMap = {}) {
  const shapes = Array.isArray(data.shape_layers) ? data.shape_layers : [];
  if (!isLayerVisible(layerMap, 'shapes')) return '';
  return shapes
    .map((sh) => {
      const type = sh?.type || 'rect';
      const x = Number(sh?.x ?? 50);
      const y = Number(sh?.y ?? 50);
      const w = Number(sh?.width ?? 20);
      const h = Number(sh?.height ?? 10);
      const opacity = Number(sh?.opacity ?? 100) / 100;
      const radius = Number(sh?.borderRadius ?? 0);
      const color = sh?.color || '#0f172a';
      const z = Number(sh?.zIndex ?? 5);
      const rotate = Number(sh?.rotation ?? 0);
      const shadow = sh?.shadow ? 'box-shadow:0 10px 30px rgba(0,0,0,0.25);' : '';
      const common = `position:absolute;left:${x}%;top:${y}%;width:${w}%;height:${h}%;transform:translate(-50%,-50%) rotate(${rotate}deg);opacity:${opacity};z-index:${z};${shadow}`;

      if (type === 'circle') {
        return `<div style="${common}background:${color};border-radius:9999px;"></div>`;
      }
      if (type === 'line') {
        const thickness = Number(sh?.thickness ?? 3);
        return `<div style="position:absolute;left:${x}%;top:${y}%;width:${w}%;height:${thickness}px;transform:translate(-50%,-50%) rotate(${rotate}deg);background:${color};opacity:${opacity};z-index:${z};${shadow}"></div>`;
      }
      return `<div style="${common}background:${color};border-radius:${radius}px;"></div>`;
    })
    .join('');
}

  const overlays = Array.isArray(data.overlay_images) ? data.overlay_images : [];
  if (!isLayerVisible(layerMap, 'overlay-images')) return '';
  return overlays
    .filter((o) => o?.image_data)
    .map((o) => {
      const x = Number(o.x ?? 50);
      const y = Number(o.y ?? 50);
      const w = Number(o.width ?? 30);
      const h = Number(o.height ?? 30);
      const fit = o.fit || 'contain';
      const z = Number(o.zIndex ?? 6);
      const rot = Number(o.rotation ?? 0);
      const opacity = Number(o.opacity ?? 100) / 100;
      return `<img src="${o.image_data}" alt="overlay" style="position:absolute;left:${x}%;top:${y}%;width:${w}%;height:${h}%;object-fit:${fit};z-index:${z};transform:rotate(${rot}deg);opacity:${opacity};pointer-events:none;" />`;
    })
    .join('');
}

function renderCustomTextBoxes(data = {}, layerMap = {}) {
  const boxes = Array.isArray(data.custom_text_boxes) ? data.custom_text_boxes : [];
  if (!isLayerVisible(layerMap, 'custom-text')) return '';
  return boxes
    .filter((b) => b?.text)
    .map((b) => {
      const x = Number(b.x ?? 5);
      const y = Number(b.y ?? 5);
      const w = Number(b.width ?? 30);
      const h = Number(b.height ?? 15);
      const size = Number(b.fontSize ?? 14);
      const color = b.color || '#111827';
      const weight = b.bold ? '700' : '400';
      const align = b.align || 'left';
      return `<div style="position:absolute;left:${x}%;top:${y}%;width:${w}%;height:${h}%;overflow:hidden;z-index:${Number(b.zIndex ?? 7)};"><div style="font-size:${size}px;color:${color};font-weight:${weight};line-height:1.35;text-align:${align};white-space:pre-wrap;">${esc(b.text)}</div></div>`;
    })
    .join('');
}

// ========== TEMPLATE 1: Industrial Product Alert ==========
function industrialProductAlert(data, theme, effects = {}) {
  const d = normalizeContent(data);
  const c = d; // content
  const layerMap = getLayerMap(d.layers);
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body>
  <div class="page" style="width:794px;height:1123px;${pickPageBackground(d.background_color, `background:${theme.background_color || "#ffffff"};`)}">
    ${headerBar(theme)}
    <div style="display:flex;height:calc(100% - 90px);">
      <div style="width:42%;position:relative;overflow:hidden;">
        ${isLayerVisible(layerMap,'image') && d.image_data ? `<img src="${d.image_data}" style="width:100%;height:100%;object-fit:${d.image_fit||'cover'};" />` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1e3a5f,#0f172a);"></div>`}
          <div style="width:58%;padding:28px 24px;display:flex;flex-direction:column;justify-content:center;overflow:hidden;background:${theme.primary_color}08;">
        <div style="background:${theme.accent_color||'#f59e0b'};color:#fff;display:inline-block;padding:5px 14px;border-radius:3px;font-family:'Montserrat',sans-serif;font-weight:800;font-size:11px;letter-spacing:2px;margin-bottom:16px;width:fit-content;">${esc(d.label_alert || 'PRODUCT ALERT!')}</div>
        ${isLayerVisible(layerMap,'title') ? `<h1 style="font-family:'Montserrat',sans-serif;font-size:clamp(18px,3.5vw,28px);font-weight:800;color:${theme.primary_color};line-height:1.2;margin-bottom:12px;${fieldStyle(c,'title',{color:theme.primary_color})}">${esc(d.title||'Urun Basligi')}</h1>` : ''}
        ${d.subtitle?`<h2 style="font-size:clamp(12px,2vw,16px);color:${theme.secondary_color};margin-bottom:14px;${fieldStyle(c,'subtitle',{color:theme.secondary_color})}">${esc(d.subtitle)}</h2>`:''}
        ${d.description?`<p style="font-size:clamp(10px,1.5vw,13px);color:#475569;line-height:1.6;margin-bottom:16px;${fieldStyle(c,'description',{color:'#475569'})}">${esc(d.description)}</p>`:''}
        ${d.bullet_points?.length?`<ul style="list-style:none;padding:0;margin-bottom:16px;">${d.bullet_points.slice(0,7).map(p=>`<li style="padding:4px 0;font-size:12px;color:#334155;display:flex;align-items:flex-start;gap:8px;${fieldStyle(c,'bullets',{color:'#334155',size:12})}"><span style="color:${d.bullet_color || '#9ecb2d'};font-size:11px;line-height:1.3;display:inline-block;width:10px;">${d.bullet_style === 'square' || !d.bullet_style ? '&#9632;' : '&#9679;'}</span><span style="flex:1;">${esc(p)}</span></li>`).join('')}</ul>`:''}
        ${d.applications?`<div style="margin-bottom:12px;"><div style="font-size:9px;font-weight:700;color:${theme.primary_color};letter-spacing:1px;margin-bottom:4px;">${esc(d.label_applications || 'UYGULAMA ALANLARI')}</div><p style="font-size:11px;color:#475569;line-height:1.5;${fieldStyle(c,'applications',{color:'#475569',size:11})}">${esc(d.applications)}</p></div>`:''}
        ${d.key_benefits?`<div style="background:${theme.primary_color}10;border-left:3px solid ${theme.primary_color};padding:10px 14px;border-radius:0 6px 6px 0;margin-bottom:14px;"><div style="font-size:9px;font-weight:700;color:${theme.primary_color};margin-bottom:3px;">${esc(d.label_benefits || 'TEMEL AVANTAJLAR')}</div><p style="font-size:11px;color:#334155;line-height:1.5;${fieldStyle(c,'benefits',{color:'#334155',size:11})}">${esc(d.key_benefits)}</p></div>`:''}
        ${d.cta_text?`<div style="background:${theme.primary_color};color:#fff;padding:10px 22px;border-radius:4px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:13px;display:inline-block;width:fit-content;">${esc(d.cta_text)}</div>`:''}
      </div>

}

// ========== TEMPLATE 2: Event Poster ==========
function eventPoster(data, theme, effects = {}) {
  const d = normalizeContent(data); const c = d;
  const layerMap = getLayerMap(d.layers);
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body>
  <div class="page" style="width:794px;height:1123px;${pickPageBackground(d.background_color, `background:linear-gradient(160deg,${theme.primary_color} 0%,${theme.secondary_color} 60%,#0c1425 100%);`)}">
    <div style="padding:40px;display:flex;flex-direction:column;align-items:center;text-align:center;height:100%;overflow:hidden;">
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;max-width:650px;">
        ${isLayerVisible(layerMap,'image') && d.image_data?`<img src="${d.image_data}" style="max-width:180px;max-height:160px;object-fit:contain;margin-bottom:20px;border-radius:10px;" />`:''}
        <h1 style="font-family:'Montserrat',sans-serif;font-size:clamp(22px,4vw,36px);font-weight:900;color:#fff;line-height:1.15;margin-bottom:12px;${fieldStyle(c,'title',{color:'#ffffff'})}">${esc(d.title||'ETKINLIK')}</h1>
        ${d.subtitle?`<h2 style="font-size:clamp(13px,2vw,16px);color:rgba(255,255,255,0.9);margin-bottom:20px;font-style:italic;${fieldStyle(c,'subtitle',{color:'rgba(255,255,255,0.9)'})}">${esc(d.subtitle)}</h2>`:''}
        ${d.description?`<p style="font-size:clamp(11px,1.5vw,14px);color:rgba(255,255,255,0.85);line-height:1.7;margin-bottom:20px;${fieldStyle(c,'description',{color:'rgba(255,255,255,0.85)'})}">${esc(d.description)}</p>`:''}
        ${d.bullet_points?.length?`<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:14px;">${d.bullet_points.slice(0,6).map(p=>`<span style="padding:4px 12px;border:1px solid rgba(255,255,255,0.25);border-radius:16px;font-size:10px;color:rgba(255,255,255,0.85);">${esc(p)}</span>`).join('')}</div>`:''}
        ${d.applications?`<p style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:10px;${fieldStyle(c,'applications')}">${esc(d.applications)}</p>`:''}
        ${d.key_benefits?`<p style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:14px;${fieldStyle(c,'benefits')}">${esc(d.key_benefits)}</p>`:''}
        ${d.cta_text?`<div style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;padding:10px 28px;border-radius:50px;font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;margin-top:12px;">${esc(d.cta_text)}</div>`:''}
      </div>
      <div style="display:flex;gap:30px;align-items:center;padding:20px 0;border-top:1px solid rgba(255,255,255,0.15);width:100%;justify-content:center;">
        <img src="${DEMART.logo_b64}" style="height:32px;filter:brightness(0) invert(1);opacity:0.8;" />
        <img src="${DEMART.sofis_b64}" style="height:28px;filter:brightness(0) invert(1);opacity:0.8;" />
      </div>
    </div>
    ${renderShapeLayers(d, layerMap)}
    ${renderOverlayImages(d, layerMap)}
    ${renderCustomTextBoxes(d, layerMap)}
    ${grainOverlay(effects.grain_enabled,effects.grain_intensity)}
  </div></body></html>`;
}

// ========== TEMPLATE 3: Minimal Premium ==========
function minimalPremium(data, theme, effects = {}) {
  const d = normalizeContent(data); const c = d;
  const layerMap = getLayerMap(d.layers);
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body>
  <div class="page" style="width:794px;height:1123px;${pickPageBackground(d.background_color, "background:#fff;")}">
    ${headerBar(theme)}
    <div style="padding:60px 50px;height:calc(100% - 90px);display:flex;flex-direction:column;overflow:hidden;">
      <div style="width:50px;height:3px;background:${theme.primary_color};margin-bottom:30px;"></div>
      <h1 style="font-family:'Montserrat',sans-serif;font-size:clamp(20px,4vw,36px);font-weight:300;color:${theme.text_color};line-height:1.2;margin-bottom:10px;${fieldStyle(c,'title',{color:theme.text_color})}">${esc(d.title||'Urun Adi')}</h1>
      ${d.subtitle?`<h2 style="font-size:clamp(12px,2vw,16px);color:${theme.primary_color};margin-bottom:30px;${fieldStyle(c,'subtitle',{color:theme.primary_color})}">${esc(d.subtitle)}</h2>`:'<div style="margin-bottom:30px;"></div>'}
      <div style="display:flex;gap:40px;flex:1;overflow:hidden;">
        <div style="flex:1;overflow:hidden;">
          ${d.description?`<p style="font-size:13px;color:#475569;line-height:1.8;margin-bottom:20px;${fieldStyle(c,'description',{color:'#475569',size:13})}">${esc(d.description)}</p>`:''}
          ${d.bullet_points?.length?`<ul style="list-style:none;padding:0;">${d.bullet_points.slice(0,8).map(p=>`<li style="padding:8px 0;font-size:12px;color:#334155;border-bottom:1px solid #f1f5f9;${fieldStyle(c,'bullets',{color:'#334155',size:12})}">${esc(p)}</li>`).join('')}</ul>`:''}
          ${d.key_benefits?`<div style="margin-top:20px;padding:14px;background:#f8fafc;border-radius:6px;"><p style="font-size:12px;color:#64748b;line-height:1.6;${fieldStyle(c,'benefits',{color:'#64748b',size:12})}">${esc(d.key_benefits)}</p></div>`:''}
        </div>
        <div style="width:240px;flex-shrink:0;">
          ${isLayerVisible(layerMap,'image') && d.image_data?`<img src="${d.image_data}" style="width:100%;border-radius:10px;object-fit:${d.image_fit||'cover'};box-shadow:0 16px 48px rgba(0,0,0,0.1);" />`:`<div style="width:100%;aspect-ratio:3/4;background:#f1f5f9;border-radius:10px;display:flex;align-items:center;justify-content:center;"><span style="color:#94a3b8;font-size:12px;">Gorsel</span></div>`}
        </div>
      </div>
    </div>
    ${isLayerVisible(layerMap,'footer') ? footerBar(theme) : ''}
    ${renderShapeLayers(d, layerMap)}
    ${renderOverlayImages(d, layerMap)}
    ${renderCustomTextBoxes(d, layerMap)}
    ${grainOverlay(effects.grain_enabled,effects.grain_intensity)}
  </div></body></html>`;
}

// ========== TEMPLATE 4: Tech Data Sheet ==========
function techDataSheet(data, theme, effects = {}) {
  const d = normalizeContent(data); const c = d;
  const layerMap = getLayerMap(d.layers);
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body>
  <div class="page" style="width:794px;height:1123px;${pickPageBackground(d.background_color, "background:#fff;")}">
    ${headerBar(theme)}
    <div style="padding:24px;height:calc(100% - 90px);overflow:hidden;">
      <div style="display:flex;gap:16px;margin-bottom:16px;">
        <div style="flex:1;">
          <h1 style="font-family:'Montserrat',sans-serif;font-size:clamp(16px,3vw,22px);font-weight:800;color:${theme.primary_color};margin-bottom:6px;${fieldStyle(c,'title',{color:theme.primary_color})}">${esc(d.title||'TEKNIK VERI')}</h1>
          ${d.subtitle?`<p style="font-size:12px;color:#64748b;margin-bottom:8px;${fieldStyle(c,'subtitle')}">${esc(d.subtitle)}</p>`:''}
          ${d.description?`<p style="font-size:11px;color:#475569;line-height:1.5;${fieldStyle(c,'description',{color:'#475569',size:11})}">${esc(d.description)}</p>`:''}
        </div>
        ${isLayerVisible(layerMap,'image') && d.image_data?`<div style="width:160px;flex-shrink:0;"><img src="${d.image_data}" style="width:100%;border-radius:6px;object-fit:${d.image_fit||'contain'};border:1px solid #e2e8f0;" /></div>`:''}
      </div>
      ${d.bullet_points?.length?`<div style="margin-bottom:12px;"><div style="background:${theme.primary_color};color:#fff;padding:6px 12px;font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;">${esc(d.label_features || 'TEKNIK OZELLIKLER')}</div>
        <table style="width:100%;border-collapse:collapse;">${d.bullet_points.slice(0,10).map((p,i)=>{const pts=p.split(':');return `<tr style="background:${i%2===0?'#f8fafc':'#fff'};"><td style="padding:6px 12px;font-size:11px;color:#334155;border:1px solid #e2e8f0;font-weight:600;width:40%;${fieldStyle(c,'bullets',{size:11})}">${esc(pts[0]||p)}</td><td style="padding:6px 12px;font-size:11px;color:#475569;border:1px solid #e2e8f0;">${esc(pts[1]||'')}</td></tr>`;}).join('')}</table></div>`:''}
      ${d.applications?`<div style="margin-bottom:10px;"><div style="font-size:9px;font-weight:700;color:${theme.primary_color};letter-spacing:1px;margin-bottom:4px;">${esc(d.label_applications || 'UYGULAMA ALANLARI')}</div><p style="font-size:11px;color:#475569;line-height:1.5;${fieldStyle(c,'applications')}">${esc(d.applications)}</p></div>`:''}
      ${d.key_benefits?`<div style="background:${theme.primary_color}08;border:1px solid ${theme.primary_color}20;border-radius:6px;padding:12px;"><div style="font-size:9px;font-weight:700;color:${theme.primary_color};letter-spacing:1px;margin-bottom:4px;">${esc(d.label_benefits || 'TEMEL AVANTAJLAR')}</div><p style="font-size:11px;color:#334155;line-height:1.5;${fieldStyle(c,'benefits')}">${esc(d.key_benefits)}</p></div>`:''}
    </div>
    ${isLayerVisible(layerMap,'footer') ? footerBar(theme) : ''}
    ${renderShapeLayers(d, layerMap)}
    ${renderOverlayImages(d, layerMap)}
    ${renderCustomTextBoxes(d, layerMap)}
    ${grainOverlay(effects.grain_enabled,effects.grain_intensity)}
  </div></body></html>`;
}

// ========== TEMPLATE 5: Photo Dominant ==========
function photoDominant(data, theme, effects = {}) {
  const d = normalizeContent(data);
  const c = d;
  const layerMap = getLayerMap(d.layers);
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body>
  <div class="page" style="width:794px;height:1123px;${pickPageBackground(d.background_color, `background:${theme.background_color || "#ffffff"};`)}">

    ${isLayerVisible(layerMap,'image') && d.image_data?`<img src="${d.image_data}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${d.image_fit||'cover'};" />`:`<div style="position:absolute;inset:0;background:linear-gradient(135deg,#1e293b,#0f172a);"></div>`}
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.5) 50%,rgba(0,0,0,0.85) 100%);"></div>
    <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:50px 40px;overflow:hidden;">
      <div style="width:40px;height:3px;background:${theme.accent_color||'#f59e0b'};margin-bottom:16px;"></div>
      <h1 style="font-family:'Montserrat',sans-serif;font-size:clamp(20px,4vw,38px);font-weight:800;color:#fff;line-height:1.15;margin-bottom:12px;${fieldStyle(c,'title',{color:'#ffffff'})}">${esc(d.title||'Baslik')}</h1>
      ${d.subtitle?`<h2 style="font-size:clamp(12px,2vw,18px);color:rgba(255,255,255,0.85);margin-bottom:12px;${fieldStyle(c,'subtitle')}">${esc(d.subtitle)}</h2>`:''}
      ${d.description?`<p style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;max-width:450px;margin-bottom:18px;${fieldStyle(c,'description')}">${esc(d.description)}</p>`:''}
      ${d.cta_text?`<div style="border:2px solid #fff;color:#fff;padding:10px 26px;display:inline-block;font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;width:fit-content;">${esc(d.cta_text)}</div>`:''}
      <div style="display:flex;gap:24px;align-items:center;margin-top:30px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.2);">
        <img src="${DEMART.logo_b64}" style="height:26px;filter:brightness(0) invert(1);opacity:0.7;" />
        <img src="${DEMART.sofis_b64}" style="height:24px;filter:brightness(0) invert(1);opacity:0.7;" />
        <span style="font-size:9px;color:rgba(255,255,255,0.4);margin-left:auto;">${DEMART.website}</span>
      </div>
    </div>
    ${renderShapeLayers(d, layerMap)}
    ${renderOverlayImages(d, layerMap)}
    ${renderCustomTextBoxes(d, layerMap)}
    ${grainOverlay(effects.grain_enabled,effects.grain_intensity)}
  </div></body></html>`;
}

// ========== TEMPLATE 6: Geometric Corporate ==========
function geometricCorporate(data, theme, effects = {}) {
  const d = normalizeContent(data); const c = d;
  const layerMap = getLayerMap(d.layers);
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body>
  <div class="page" style="width:794px;height:1123px;${pickPageBackground(d.background_color, "background:#fff;")}">
    ${headerBar(theme)}
    <div style="height:calc(100% - 90px);overflow:hidden;">
      <div style="background:${theme.primary_color};padding:30px 32px;color:#fff;">
        <h1 style="font-family:'Montserrat',sans-serif;font-size:clamp(18px,3.5vw,28px);font-weight:800;margin-bottom:6px;${fieldStyle(c,'title',{color:'#ffffff'})}">${esc(d.title||'Baslik')}</h1>
        ${d.subtitle?`<p style="font-size:14px;opacity:0.85;${fieldStyle(c,'subtitle')}">${esc(d.subtitle)}</p>`:''}
      </div>
      <div style="display:flex;overflow:hidden;">
        <div style="flex:1;padding:24px 32px;overflow:hidden;">
          ${d.description?`<p style="font-size:12px;color:#475569;line-height:1.7;margin-bottom:18px;${fieldStyle(c,'description',{color:'#475569',size:12})}">${esc(d.description)}</p>`:''}
          ${d.bullet_points?.length?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px;">${d.bullet_points.slice(0,8).map(p=>`<div style="background:#f8fafc;padding:10px;border-radius:4px;border-left:3px solid ${theme.primary_color};font-size:11px;color:#334155;${fieldStyle(c,'bullets',{size:11})}">${esc(p)}</div>`).join('')}</div>`:''}
          ${d.applications?`<div style="padding:12px;background:${theme.primary_color}08;border-radius:6px;margin-bottom:10px;"><p style="font-size:11px;color:#475569;line-height:1.5;${fieldStyle(c,'applications')}">${esc(d.applications)}</p></div>`:''}
          ${d.key_benefits?`<div style="padding:12px;background:${theme.accent_color||'#f59e0b'}12;border-left:3px solid ${theme.accent_color||'#f59e0b'};border-radius:0 6px 6px 0;"><p style="font-size:11px;color:#334155;line-height:1.5;${fieldStyle(c,'benefits')}">${esc(d.key_benefits)}</p></div>`:''}
        </div>
        ${isLayerVisible(layerMap,'image') && d.image_data?`<div style="width:240px;flex-shrink:0;padding:24px 24px 24px 0;"><img src="${d.image_data}" style="width:100%;border-radius:6px;object-fit:${d.image_fit||'cover'};" /></div>`:''}
      </div>
    </div>
    ${isLayerVisible(layerMap,'footer') ? footerBar(theme) : ''}
    ${renderShapeLayers(d, layerMap)}
    ${renderOverlayImages(d, layerMap)}
    ${renderCustomTextBoxes(d, layerMap)}
    ${grainOverlay(effects.grain_enabled,effects.grain_intensity)}
  </div></body></html>`;
}

// ========== TEMPLATE 7: Dark Tech ==========
function darkTech(data, theme, effects = {}) {
  const d = normalizeContent(data); const c = d;
  const layerMap = getLayerMap(d.layers);
  const neon = theme.accent_color || '#22d3ee';
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body>
  <div class="page" style="width:794px;height:1123px;background:linear-gradient(180deg,#020617,#0f172a 50%,#020617);">
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${neon},transparent);"></div>
    <div style="padding:40px 36px;height:100%;display:flex;flex-direction:column;overflow:hidden;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
        <img src="${DEMART.logo_b64}" style="height:28px;filter:brightness(0) invert(1);opacity:0.6;" />
        <img src="${DEMART.sofis_b64}" style="height:26px;filter:brightness(0) invert(1);opacity:0.6;" />
      </div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;overflow:hidden;">
        <div style="width:36px;height:2px;background:${neon};margin-bottom:18px;box-shadow:0 0 10px ${neon};"></div>
        <h1 style="font-family:'Montserrat',sans-serif;font-size:clamp(18px,3.5vw,30px);font-weight:800;color:#f8fafc;line-height:1.15;margin-bottom:12px;${fieldStyle(c,'title',{color:'#f8fafc'})}">${esc(d.title||'URUN')}</h1>
        ${d.subtitle?`<h2 style="font-size:clamp(11px,2vw,15px);color:${neon};margin-bottom:18px;${fieldStyle(c,'subtitle',{color:neon})}">${esc(d.subtitle)}</h2>`:''}
        ${d.description?`<p style="font-size:12px;color:#94a3b8;line-height:1.7;margin-bottom:16px;max-width:480px;${fieldStyle(c,'description',{color:'#94a3b8',size:12})}">${esc(d.description)}</p>`:''}
        ${d.bullet_points?.length?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">${d.bullet_points.slice(0,8).map(p=>`<div style="padding:5px 12px;border:1px solid ${neon}30;border-radius:3px;font-size:10px;color:#cbd5e1;background:${neon}08;${fieldStyle(c,'bullets',{size:10})}">${esc(p)}</div>`).join('')}</div>`:''}
        ${d.applications?`<p style="font-size:11px;color:#64748b;margin-bottom:10px;${fieldStyle(c,'applications')}">${esc(d.applications)}</p>`:''}
        ${d.key_benefits?`<p style="font-size:11px;color:${neon}80;margin-bottom:12px;${fieldStyle(c,'benefits')}">${esc(d.key_benefits)}</p>`:''}
        ${d.cta_text?`<div style="border:1px solid ${neon};color:${neon};padding:8px 20px;display:inline-block;font-family:'Montserrat',sans-serif;font-weight:600;font-size:12px;width:fit-content;border-radius:3px;">${esc(d.cta_text)}</div>`:''}
        ${isLayerVisible(layerMap,'image') && d.image_data?`<div style="margin-top:14px;"><img src="${d.image_data}" style="max-width:320px;max-height:180px;object-fit:${d.image_fit||'contain'};border-radius:6px;box-shadow:0 0 30px ${neon}20;" /></div>`:''}
      </div>
      <div style="border-top:1px solid #1e293b;padding-top:12px;display:flex;justify-content:space-between;">
        <span style="font-size:8px;color:#475569;">${DEMART.website}</span>
        <span style="font-size:8px;color:${neon};">${DEMART.email}</span>
      </div>
    </div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${neon},transparent);"></div>
    ${renderShapeLayers(d, layerMap)}
    ${renderOverlayImages(d, layerMap)}
    ${renderCustomTextBoxes(d, layerMap)}
    ${grainOverlay(effects.grain_enabled,effects.grain_intensity)}
  </div></body></html>`;
}

// ========== TEMPLATE 8: Clean Industrial Grid ==========
function cleanIndustrialGrid(data, theme, effects = {}) {
  const d = normalizeContent(data); const c = d;
  const layerMap = getLayerMap(d.layers);
  const icons = ['&#9881;','&#9889;','&#9878;','&#9850;','&#10003;','&#9733;','&#9830;','&#9824;'];
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body>
  <div class="page" style="width:794px;height:1123px;${pickPageBackground(d.background_color, "background:#fff;")}">
    ${headerBar(theme)}
    <div style="padding:24px 28px;height:calc(100% - 90px);overflow:hidden;">
      <div style="text-align:center;margin-bottom:20px;">
        <h1 style="font-family:'Montserrat',sans-serif;font-size:clamp(16px,3vw,26px);font-weight:800;color:${theme.primary_color};${fieldStyle(c,'title',{color:theme.primary_color})}">${esc(d.title||'FAYDALARI')}</h1>
        ${d.subtitle?`<p style="font-size:13px;color:#64748b;margin-top:6px;${fieldStyle(c,'subtitle')}">${esc(d.subtitle)}</p>`:''}
      </div>
      ${isLayerVisible(layerMap,'image') && d.image_data?`<div style="text-align:center;margin-bottom:16px;"><img src="${d.image_data}" style="max-height:160px;object-fit:${d.image_fit||'contain'};border-radius:10px;" /></div>`:''}
      ${d.bullet_points?.length?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">${d.bullet_points.slice(0,8).map((p,i)=>`<div style="background:#f8fafc;padding:14px;border-radius:8px;display:flex;gap:10px;align-items:flex-start;border:1px solid #e2e8f0;"><div style="width:30px;height:30px;background:${theme.primary_color}15;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="color:${theme.primary_color};font-size:16px;">${icons[i%icons.length]}</span></div><span style="font-size:11px;color:#334155;line-height:1.4;${fieldStyle(c,'bullets',{size:11})}">${esc(p)}</span></div>`).join('')}</div>`:''}
      ${d.description?`<p style="font-size:11px;color:#475569;line-height:1.6;text-align:center;max-width:550px;margin:0 auto;${fieldStyle(c,'description',{size:11})}">${esc(d.description)}</p>`:''}
    </div>
    ${isLayerVisible(layerMap,'footer') ? footerBar(theme) : ''}
    ${renderShapeLayers(d, layerMap)}
    ${renderOverlayImages(d, layerMap)}
    ${renderCustomTextBoxes(d, layerMap)}
    ${grainOverlay(effects.grain_enabled,effects.grain_intensity)}
  </div></body></html>`;
}

// ========== TEMPLATE 9: Greeting Card ==========
function greetingCard(data, theme, effects = {}) {
  const d = normalizeContent(data);
  const layerMap = getLayerMap(d.layers);
  const bg = d.background_color || theme.primary_color;
  const txt = d.text_color || '#ffffff';
  const isDark = bg !== '#ffffff' && bg !== '#fff';
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body>
  <div class="page" style="width:794px;height:1123px;${pickPageBackground(d.background_color || bg, `background:${bg};`)}">
    <div style="position:absolute;top:36px;left:36px;right:36px;bottom:36px;border:2px solid ${txt}25;border-radius:16px;"></div>
    <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:70px 50px;text-align:center;overflow:hidden;">
      ${isLayerVisible(layerMap,'image') && d.image_data?`<img src="${d.image_data}" style="max-width:180px;max-height:180px;object-fit:contain;margin-bottom:24px;border-radius:10px;" />`:''}
      <h1 style="font-family:'Montserrat',sans-serif;font-size:clamp(20px,4vw,34px);font-weight:700;color:${txt};margin-bottom:20px;line-height:1.3;">${esc(d.title||'Tebrikler!')}</h1>
      <div style="width:50px;height:2px;background:${txt};opacity:0.3;margin-bottom:20px;"></div>
      <p style="font-size:14px;color:${txt};opacity:0.9;line-height:1.8;max-width:420px;margin-bottom:30px;white-space:pre-line;">${esc(d.description||d.message||'Mesajiniz')}</p>
      ${d.from_name?`<p style="font-size:13px;color:${txt};opacity:0.6;font-style:italic;">- ${esc(d.from_name)}</p>`:''}
      <div style="position:absolute;bottom:44px;display:flex;gap:16px;align-items:center;">
        <img src="${DEMART.logo_b64}" style="height:24px;opacity:0.4;${isDark?'filter:brightness(0) invert(1);':''}" />
        <img src="${DEMART.sofis_b64}" style="height:22px;opacity:0.4;${isDark?'filter:brightness(0) invert(1);':''}" />
      </div>
    </div>
    ${renderShapeLayers(d, layerMap)}
    ${renderOverlayImages(d, layerMap)}
    ${renderCustomTextBoxes(d, layerMap)}
    ${grainOverlay(effects.grain_enabled,effects.grain_intensity)}
  </div></body></html>`;
}

// ========== TEMPLATE 10: Condolence Card ==========
function condolenceCard(data, theme, effects = {}) {
  const d = normalizeContent(data);
  const layerMap = getLayerMap(d.layers);
  return `<!DOCTYPE html><html><head><style>${BASE_STYLES}</style></head><body>
  <div class="page" style="width:794px;height:1123px;${pickPageBackground(d.background_color, "background:linear-gradient(180deg,#1e293b,#0f172a);")}">
    <div style="position:absolute;top:44px;left:44px;right:44px;bottom:44px;border:1px solid rgba(148,163,184,0.15);"></div>
    <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 60px;text-align:center;overflow:hidden;">
      <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#64748b,transparent);margin-bottom:30px;"></div>
      <h1 style="font-family:'Montserrat',sans-serif;font-size:clamp(18px,3vw,28px);font-weight:300;color:#e2e8f0;margin-bottom:24px;letter-spacing:2px;line-height:1.4;">${esc(d.title||'Baskisagligi')}</h1>
      <div style="width:30px;height:1px;background:#475569;margin-bottom:24px;"></div>
      <p style="font-size:14px;color:#94a3b8;line-height:2;max-width:400px;margin-bottom:30px;white-space:pre-line;">${esc(d.description||d.message||'Taziye mesaji')}</p>
      ${d.from_name?`<p style="font-size:12px;color:#64748b;font-style:italic;margin-bottom:30px;">- ${esc(d.from_name)}</p>`:''}
      <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#475569,transparent);margin-bottom:30px;"></div>
      <div style="display:flex;gap:16px;align-items:center;">
        <img src="${DEMART.logo_b64}" style="height:20px;filter:brightness(0) invert(1);opacity:0.25;" />
        <img src="${DEMART.sofis_b64}" style="height:18px;filter:brightness(0) invert(1);opacity:0.25;" />
      </div>
    </div>
    ${renderShapeLayers(d, layerMap)}
    ${renderOverlayImages(d, layerMap)}
    ${renderCustomTextBoxes(d, layerMap)}
    ${grainOverlay(effects.grain_enabled,effects.grain_intensity)}
  </div></body></html>`;
}

// ========== REGISTRY ==========
export const TEMPLATES = [
  { id: 'industrial-product-alert', name: 'Industrial Product Alert', category: 'product', description: 'Diagonal panel + CTA', generator: industrialProductAlert },
  { id: 'event-poster', name: 'Etkinlik Afisi', category: 'event', description: 'Gradient arka plan, etkinlik', generator: eventPoster },
  { id: 'minimal-premium', name: 'Minimal Premium', category: 'product', description: 'Beyaz alan, buyuk tipografi', generator: minimalPremium },
  { id: 'tech-data-sheet', name: 'Teknik Veri Sayfasi', category: 'technical', description: 'Tablo agirlikli', generator: techDataSheet },
  { id: 'photo-dominant', name: 'Foto Dominant', category: 'product', description: 'Tam ekran gorsel', generator: photoDominant },
  { id: 'geometric-corporate', name: 'Geometrik Kurumsal', category: 'product', description: 'Serit/blok', generator: geometricCorporate },
  { id: 'dark-tech', name: 'Dark Tech', category: 'product', description: 'Koyu tema, neon', generator: darkTech },
  { id: 'clean-industrial-grid', name: 'Temiz Grid', category: 'product', description: 'Ikonlu fayda kutulari', generator: cleanIndustrialGrid },
  { id: 'greeting-card', name: 'Tebrik Karti', category: 'card', description: 'Kutlama', generator: greetingCard },
  { id: 'condolence-card', name: 'Taziye Karti', category: 'card', description: 'Taziye', generator: condolenceCard },
];

export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'Tumunu Goster' },
  { id: 'product', name: 'Urun' },
  { id: 'event', name: 'Etkinlik' },
  { id: 'technical', name: 'Teknik' },
  { id: 'card', name: 'Kart' },
];

export function generateTemplateHTML(templateId, data, theme, effects = {}) {
  const t = TEMPLATES.find(t => t.id === templateId);
  if (!t) return industrialProductAlert(data, theme, effects);
  return t.generator(data, theme, effects);
}

export const DEFAULT_THEME = {
  primary_color: '#004aad', secondary_color: '#003c8f', accent_color: '#f59e0b',
  background_color: '#f8fafc', text_color: '#0f172a',
  heading_font: 'Montserrat', body_font: 'Open Sans', accent_font: 'Roboto Condensed'
};

export { DEMART };
