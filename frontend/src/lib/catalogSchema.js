export const TEMPLATE_FIELD_REGISTRY = [
  { id: 'title', label: 'Baslik', type: 'text', defaultValue: '' },
  { id: 'subtitle', label: 'Alt Baslik', type: 'text', defaultValue: '' },
  { id: 'body', label: 'Govde Metni', type: 'textarea', defaultValue: '' },
  { id: 'cta', label: 'CTA', type: 'text', defaultValue: '' },
  { id: 'phone', label: 'Telefon', type: 'text', defaultValue: '' },
  { id: 'email', label: 'E-posta', type: 'text', defaultValue: '' },
  { id: 'address', label: 'Adres', type: 'textarea', defaultValue: '' },
  { id: 'applications', label: 'Uygulama Alanlari', type: 'textarea', defaultValue: '' },
  { id: 'key_benefits', label: 'Temel Avantajlar', type: 'textarea', defaultValue: '' },
  { id: 'label_alert', label: 'Uyari Basligi', type: 'text', defaultValue: '' },
  { id: 'label_applications', label: 'Uygulama Basligi', type: 'text', defaultValue: '' },
  { id: 'label_benefits', label: 'Avantaj Basligi', type: 'text', defaultValue: '' },
  { id: 'label_features', label: 'Ozellik Basligi', type: 'text', defaultValue: '' },
  { id: 'bullet_points', label: 'Madde Listesi', type: 'list', defaultValue: [] },
  { id: 'image_data', label: 'Ana Gorsel', type: 'image', defaultValue: null },
  { id: 'overlay_images', label: 'Ek Gorseller', type: 'image-list', defaultValue: [] },
  { id: 'custom_text_boxes', label: 'Serbest Metin Kutulari', type: 'object-list', defaultValue: [] },
  { id: 'layers', label: 'Katmanlar', type: 'object-list', defaultValue: [] },
  { id: 'effects', label: 'Efektler', type: 'object', defaultValue: { grain_enabled: false, grain_intensity: 20 } },
];

export const FIELD_ALIASES = {
  body: ['description', 'message'],
  description: ['body', 'message'],
  message: ['body', 'description'],
  cta: ['cta_text'],
  cta_text: ['cta'],
  key_benefits: ['benefits'],
  benefits: ['key_benefits'],
  subtitle: ['sub_title'],
  sub_title: ['subtitle'],
  bullet_points: ['features'],
  features: ['bullet_points'],
};



export const FIELD_OVERFLOW_DEFAULTS = {
  title: { overflow: 'autofit', clampLines: 1, minSize: 16 },
  subtitle: { overflow: 'autofit', clampLines: 2, minSize: 12 },
  description: { overflow: 'clamp', clampLines: 6, minSize: 10 },
  bullets: { overflow: 'clamp', clampLines: 8, minSize: 10 },
  applications: { overflow: 'clamp', clampLines: 4, minSize: 10 },
  benefits: { overflow: 'clamp', clampLines: 4, minSize: 10 },
  label_alert: { overflow: 'clamp', clampLines: 1, minSize: 8 },
  label_features: { overflow: 'clamp', clampLines: 1, minSize: 8 },
  label_applications: { overflow: 'clamp', clampLines: 1, minSize: 8 },
  label_benefits: { overflow: 'clamp', clampLines: 1, minSize: 8 },
};

export const DEFAULT_FIELD_BOXES = {
  title: { x: 67, y: 20, width: 50, height: 10, zIndex: 12 },
  subtitle: { x: 67, y: 31, width: 50, height: 8, zIndex: 12 },
  description: { x: 67, y: 44, width: 52, height: 18, zIndex: 12 },
  bullets: { x: 67, y: 63, width: 52, height: 22, zIndex: 12 },
  applications: { x: 67, y: 83, width: 52, height: 10, zIndex: 12 },
  benefits: { x: 67, y: 92, width: 52, height: 8, zIndex: 12 },
  label_alert: { x: 67, y: 56, width: 24, height: 4, zIndex: 14 },
  label_features: { x: 67, y: 66, width: 30, height: 4, zIndex: 14 },
  label_applications: { x: 67, y: 83, width: 30, height: 4, zIndex: 14 },
  label_benefits: { x: 67, y: 90, width: 30, height: 4, zIndex: 14 },
};


export const DEFAULT_SHAPE_LAYERS = [
  { id: 'shape-right-panel', type: 'rect', name: 'RightPanelBG', x: 84, y: 52, width: 32, height: 88, color: '#2f5f7a', opacity: 100, borderRadius: 0, zIndex: 5, locked: false },
  { id: 'shape-footer-bar', type: 'rect', name: 'FooterBar', x: 50, y: 97.5, width: 100, height: 5, color: '#1f4a63', opacity: 100, borderRadius: 0, zIndex: 5, locked: false },
  { id: 'shape-footer-accent', type: 'rect', name: 'FooterAccent', x: 95, y: 97.5, width: 10, height: 5, color: '#9ecb2d', opacity: 100, borderRadius: 0, zIndex: 6, locked: false },
];
function cloneDefault(value) {
  if (Array.isArray(value)) return [...value];
  if (value && typeof value === 'object') return { ...value };
  return value;
}

export function normalizeContent(content = {}) {
  const c = { ...content };

  Object.entries(FIELD_ALIASES).forEach(([target, aliases]) => {
    if (c[target] !== undefined && c[target] !== null && c[target] !== '') return;
    const found = aliases.find((alias) => c[alias] !== undefined && c[alias] !== null && c[alias] !== '');
    if (found) c[target] = c[found];
  });

  // canonical sync
  if (!c.description && c.body) c.description = c.body;
  if (!c.body && c.description) c.body = c.description;
  if (!c.cta_text && c.cta) c.cta_text = c.cta;
  if (!c.cta && c.cta_text) c.cta = c.cta_text;

  TEMPLATE_FIELD_REGISTRY.forEach((field) => {
    if (c[field.id] === undefined) c[field.id] = cloneDefault(field.defaultValue);
  });

  Object.entries(FIELD_OVERFLOW_DEFAULTS).forEach(([field, cfg]) => {
    if (c[`${field}_overflow`] === undefined) c[`${field}_overflow`] = cfg.overflow;
    if (c[`${field}_clamp_lines`] === undefined) c[`${field}_clamp_lines`] = cfg.clampLines;
    if (c[`${field}_min_size`] === undefined) c[`${field}_min_size`] = cfg.minSize;
  });

  c.field_boxes = { ...DEFAULT_FIELD_BOXES, ...(c.field_boxes || {}) };
  if (!Array.isArray(c.shape_layers)) c.shape_layers = DEFAULT_SHAPE_LAYERS.map((sh) => ({ ...sh }));

  return c;
}

export function normalizeCatalog(catalog) {
  if (!catalog?.pages) return catalog;
  return {
    ...catalog,
    pages: catalog.pages.map((p) => ({
      ...p,
      content: normalizeContent(p.content || {}),
    })),
  };
}
