import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft, ArrowRight, Plus, Trash2, Copy, Save, Download, Upload, Languages,
  GripVertical, X, LayoutTemplate, Eye, EyeOff, Lock, Unlock, ChevronUp,
  ChevronDown, ChevronRight, Loader2, Scissors, Palette, Bold, Italic, Type
} from "lucide-react";
import { TEMPLATES, TEMPLATE_CATEGORIES, generateTemplateHTML, DEFAULT_THEME } from "@/lib/templateEngine";
import { normalizeCatalog, normalizeContent, DEFAULT_FIELD_BOXES, DEFAULT_SHAPE_LAYERS, DEFAULT_LAYER_GROUPS } from "@/lib/catalogSchema";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FONT_OPTIONS = [
  { id: "inherit", name: "Varsayilan" },
  { id: "'Montserrat',sans-serif", name: "Montserrat" },
  { id: "'Open Sans',sans-serif", name: "Open Sans" },
  { id: "'Roboto Condensed',sans-serif", name: "Roboto Cond" },
  { id: "'Inter',sans-serif", name: "Inter" },
  { id: "Arial,sans-serif", name: "Arial" },
  { id: "'Times New Roman',serif", name: "Times" },
  { id: "Georgia,serif", name: "Georgia" },
];

const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48];

// Typography control row for each field
function TypoControls({ field, content, updateContent, onTranslate }) {
  const prefix = field;
  const font = content?.[`${prefix}_font`] || "inherit";
  const size = content?.[`${prefix}_size`] || 14;
  const bold = content?.[`${prefix}_bold`] || false;
  const italic = content?.[`${prefix}_italic`] || false;
  const color = content?.[`${prefix}_color`] || "";

  const setFontSize = (nextSize) => {
    const fontSize = Number(nextSize) || 14;
    updateContent('field_style', {
      ...(content?.field_style || {}),
      [prefix]: {
        ...(content?.field_style?.[prefix] || {}),
        fontSize,
      },
    });
    updateContent(`${prefix}_size`, fontSize);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap mb-1.5">
      <Select value={font} onValueChange={(v) => updateContent(`${prefix}_font`, v)}>
        <SelectTrigger className="h-6 w-[100px] text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300 px-1.5">
          <Type className="w-2.5 h-2.5 mr-0.5 text-zinc-500" /><SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800">
          {FONT_OPTIONS.map(f => <SelectItem key={f.id} value={f.id} className="text-xs" style={{fontFamily:f.id}}>{f.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={String(size)} onValueChange={(v) => setFontSize(parseInt(v, 10))}>
        <SelectTrigger className="h-6 w-[52px] text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300 px-1.5"><SelectValue /></SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800">
          {FONT_SIZES.map(s => <SelectItem key={s} value={String(s)} className="text-xs">{s}px</SelectItem>)}
        </SelectContent>
      </Select>
      <Input type="number" min={10} max={60} value={size} onChange={(e) => setFontSize(Number(e.target.value) || 14)} className="h-6 w-[56px] text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300" title="Font Size" />
      <button onClick={() => updateContent(`${prefix}_bold`, !bold)}
        className={`w-6 h-6 flex items-center justify-center rounded text-[10px] border ${bold ? 'bg-[#004aad] text-white border-[#004aad]' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600'}`}>
        <Bold className="w-3 h-3" />
      </button>
      <button onClick={() => updateContent(`${prefix}_italic`, !italic)}
        className={`w-6 h-6 flex items-center justify-center rounded text-[10px] border ${italic ? 'bg-[#004aad] text-white border-[#004aad]' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600'}`}>
        <Italic className="w-3 h-3" />
      </button>
      <input type="color" value={color || "#ffffff"} onChange={(e) => updateContent(`${prefix}_color`, e.target.value)}
        className="w-6 h-6 rounded border border-zinc-700 bg-zinc-800 cursor-pointer p-0" />
      {onTranslate && (
        <button onClick={onTranslate} className="h-6 px-1.5 flex items-center gap-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 text-[10px]">
          <Languages className="w-2.5 h-2.5" />Cevir
        </button>
      )}
    </div>
  );
}


function OverflowControls({ field, content, updateContent }) {
  const cfg = content?.field_overflow?.[field] || {};
  const mode = cfg.mode || content?.[`${field}_overflow`] || 'autofit';
  const clampLines = Number(cfg.clampLines ?? content?.[`${field}_clamp_lines`] ?? 3);
  const minSize = Number(cfg.minSize ?? content?.[`${field}_min_size`] ?? 10);

  const textRaw = content?.[field];
  const text = Array.isArray(textRaw) ? textRaw.join(' ') : (textRaw || '');
  const fieldBox = content?.field_boxes?.[field] || {};
  const widthFactor = Math.max(8, Number(fieldBox.width ?? 28));
  const heightFactor = Math.max(4, Number(fieldBox.height ?? 10));
  const baseSize = Number(content?.field_style?.[field]?.fontSize ?? content?.[`${field}_size`] ?? 14);
  const computedFontSize = mode === 'autofit' ? Math.max(minSize, Math.min(baseSize, Math.floor((widthFactor * heightFactor) / Math.max(18, Math.sqrt(String(text).length || 1))))) : baseSize;

  const patch = (key, value) => {
    const next = {
      ...(content?.field_overflow || {}),
      [field]: {
        mode,
        clampLines,
        minSize,
        ...cfg,
        [key]: value,
      },
    };
    updateContent('field_overflow', next);
  };

  return (
    <div className="space-y-1 mb-1.5">
      <div className="flex items-center gap-1">
      <Label className="text-[9px] text-zinc-500 w-[46px]">Overflow</Label>
      <Select value={mode} onValueChange={(v) => patch('mode', v)}>
        <SelectTrigger className="h-6 w-[90px] text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300 px-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800">
          <SelectItem value="autofit" className="text-xs">Auto-fit</SelectItem>
          <SelectItem value="wrap" className="text-xs">Wrap</SelectItem>
          <SelectItem value="clamp" className="text-xs">Clamp</SelectItem>
          <SelectItem value="ellipsis" className="text-xs">Ellipsis</SelectItem>
        </SelectContent>
      </Select>
      {mode === 'clamp' && (
        <Input
          type="number"
          min={1}
          max={10}
          value={clampLines}
          onChange={(e) => patch('clampLines', Number(e.target.value) || 3)}
          className="h-6 w-[52px] text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300"
          title="Clamp satir sayisi"
        />
      )}
      {mode === 'autofit' && (
        <Input
          type="number"
          min={8}
          max={48}
          value={minSize}
          onChange={(e) => patch('minSize', Number(e.target.value) || 10)}
          className="h-6 w-[52px] text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300"
          title="Auto-fit min font-size"
        />
      )}
      </div>
      <div className="text-[9px] text-zinc-500">mode:{mode} clamp:{clampLines} min:{minSize} computed:{computedFontSize}px</div>
    </div>
  );
}


export default function Editor() {
  const { catalogId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const overlayInputRef = useRef(null);
  const previewRef = useRef(null);

  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTranslator, setShowTranslator] = useState(false);
  const [templateCategory, setTemplateCategory] = useState("all");
  const [activeTheme, setActiveTheme] = useState(DEFAULT_THEME);
  const [themes, setThemes] = useState([]);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [uiMode, setUiMode] = useState('basic');

  // Collapsible sections
  const [openSections, setOpenSections] = useState({ content: true, image: true, effects: false, layers: true });
  const toggleSection = (s) => setOpenSections(p => ({...p, [s]: !p[s]}));

  // Layers
  const [layers, setLayers] = useState([
    { id: 'background', name: 'Arka Plan', visible: true, locked: false },
    { id: 'image', name: 'Gorsel', visible: true, locked: false },
    { id: 'title', name: 'Baslik', visible: true, locked: false },
    { id: 'content', name: 'Icerik', visible: true, locked: false },
    { id: 'shapes', name: 'Sekiller', visible: true, locked: false },
    { id: 'overlay-images', name: 'Ek Gorseller', visible: true, locked: false },
    { id: 'custom-text', name: 'Serbest Metin', visible: true, locked: false },
    { id: 'footer', name: 'Footer', visible: true, locked: true },
  ]);

  // Effects
  const [effects, setEffects] = useState({ opacity: 100, shadow: 0, feather: 0, blend: 'normal', grain_enabled: false, grain_intensity: 20 });

  // Translation state
  const [translating, setTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState('EN');
  const [targetLang, setTargetLang] = useState('TR');
  const [translationTone, setTranslationTone] = useState('corporate');
  const [translateSource, setTranslateSource] = useState('');
  const [translateResult, setTranslateResult] = useState('');
  const [translateField, setTranslateField] = useState('');

  const shouldShowGuide = (kind, id) => showGuides || (selectedGuide?.kind === kind && selectedGuide?.id === id);

  const getFieldBoxLabel = (field) => {
    const labelOrDefault = (value, fallback) => (typeof value === 'string' && value.trim() ? value : fallback);
    const labels = {
      title: 'Baslik',
      subtitle: 'Alt Baslik',
      description: 'Aciklama',
      bullets: labelOrDefault(selectedPage?.content?.label_features, 'TEKNIK OZELLIKLER'),
      applications: labelOrDefault(selectedPage?.content?.label_applications, 'UYGULAMA ALANLARI'),
      benefits: labelOrDefault(selectedPage?.content?.label_benefits, 'TEMEL AVANTAJLAR'),
      cta: 'CTA',
      label_alert: 'Etiket: Uyari',
      label_features: 'Etiket: Ozellik',
      label_applications: 'Etiket: Uygulama',
      label_benefits: 'Etiket: Avantaj',
    };
    return labels[field] || field;
  };

  // Export
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportPreset, setExportPreset] = useState('a4-portrait');
  const [exportQuality, setExportQuality] = useState('high');
  const [jpegQuality, setJpegQuality] = useState(90);
  const [batchMode, setBatchMode] = useState(false);
  const [batchPresets, setBatchPresets] = useState({ 'a4-portrait': true, '1080x1080': true, '1080x1350': true, '1200x628': true, '1920x1080': false });

  const [removingBg, setRemovingBg] = useState(false);
  const [overlayTargetIndex, setOverlayTargetIndex] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [exportDebugHtml, setExportDebugHtml] = useState(false);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, themeRes] = await Promise.all([
        axios.get(`${API}/catalogs/${catalogId}`),
        axios.get(`${API}/themes`)
      ]);
      const normalized = normalizeCatalog(catRes.data);
      setCatalog(normalized);
      setThemes(themeRes.data);
      const ct = themeRes.data.find(t => t.id === catRes.data.theme_id);
      if (ct) setActiveTheme(ct);
      if (normalized.pages?.length > 0 && !selectedPageId) setSelectedPageId(normalized.pages[0].id);
    } catch { toast.error("Katalog yuklenemedi"); navigate("/"); }
    finally { setLoading(false); }
  }, [catalogId, navigate, selectedPageId]);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  const selectedPage = catalog?.pages?.find(p => p.id === selectedPageId);
  const overlays = selectedPage?.content?.layers?.overlays || [];
  const layerGroups = selectedPage?.content?.layer_groups || DEFAULT_LAYER_GROUPS;
  const currentTemplateId = selectedPage?.content?.template_id || 'industrial-product-alert';
  const activeEffects = selectedPage?.content?.effects || effects;
  const previewHTML = selectedPage ? generateTemplateHTML(currentTemplateId, selectedPage.content, activeTheme, activeEffects) : '';

  const updatePageContent = (field, value) => {
    if (!selectedPage) return;
    setCatalog(prev => ({ ...prev, pages: prev.pages.map(p => p.id === selectedPageId ? { ...p, content: normalizeContent({ ...p.content, [field]: value }) } : p) }));
  };

  const updateLayers = (nextLayers) => {
    setLayers(nextLayers);
    updatePageContent('layer_visibility', nextLayers);
  };

  const effectSupportByGuide = {
    base: { shadow: true, feather: true, opacity: true, blend: true, grain: true },
    overlay: { shadow: true, feather: true, opacity: true, blend: true, grain: false },
    shape: { shadow: true, feather: false, opacity: true, blend: false, grain: false },
    field: { shadow: true, feather: false, opacity: false, blend: false, grain: false },
    custom: { shadow: true, feather: false, opacity: false, blend: false, grain: false },
  };

  const activeGuideKind = selectedGuide?.kind || 'base';
  const activeEffectSupport = effectSupportByGuide[activeGuideKind] || effectSupportByGuide.base;

  const setEffectsForSelection = (patch) => {
    if (activeGuideKind === 'overlay' && selectedGuide?.id) {
      const arr = [...overlays];
      const idx = arr.findIndex((ov, i) => (ov.id || i) === selectedGuide.id);
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], effects: { ...(arr[idx].effects || {}), ...patch } };
        updateOverlays(arr);
      }
      return;
    }
    if (activeGuideKind === 'shape' && selectedGuide?.id) {
      const arr = [...(selectedPage?.content?.shape_layers || [])];
      const idx = arr.findIndex((sh, i) => (sh.id || i) === selectedGuide.id);
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], effects: { ...(arr[idx].effects || {}), ...patch } };
        updatePageContent('shape_layers', arr);
      }
      return;
    }
    updateEffects({ ...effects, ...patch });
  };

  const selectedLayerEffects = (() => {
    if (activeGuideKind === 'overlay' && selectedGuide?.id) {
      const ov = overlays.find((o, i) => (o.id || i) === selectedGuide.id);
      return { ...effects, ...(ov?.effects || {}) };
    }
    if (activeGuideKind === 'shape' && selectedGuide?.id) {
      const sh = (selectedPage?.content?.shape_layers || []).find((o, i) => (o.id || i) === selectedGuide.id);
      return { ...effects, ...(sh?.effects || {}) };
    }
    return effects;
  })();

  const updateEffects = (nextEffects) => {
    setEffects(nextEffects);
    updatePageContent('effects', nextEffects);
  };


  useEffect(() => {
    if (!selectedPage) return;
    if (Array.isArray(selectedPage.content?.layer_visibility) && selectedPage.content.layer_visibility.length) setLayers(selectedPage.content.layer_visibility);
    if (selectedPage.content?.effects) setEffects(selectedPage.content.effects);
    setSelectedGuide(null);
  }, [selectedPageId]);
  const savePage = async () => {
    if (!selectedPage) return;
    try { setSaving(true); await axios.put(`${API}/catalogs/${catalogId}/pages/${selectedPageId}`, { content: selectedPage.content }); toast.success("Kaydedildi"); }
    catch { toast.error("Kaydedilemedi"); } finally { setSaving(false); }
  };

  const addPage = async () => {
    try { const r = await axios.post(`${API}/catalogs/${catalogId}/pages`); setCatalog(p => ({...p, pages:[...p.pages, r.data]})); setSelectedPageId(r.data.id); toast.success("Sayfa eklendi"); }
    catch { toast.error("Eklenemedi"); }
  };

  const deletePage = async (pid) => {
    if (catalog.pages.length <= 1) { toast.error("En az 1 sayfa"); return; }
    try { await axios.delete(`${API}/catalogs/${catalogId}/pages/${pid}`); setCatalog(p => ({...p, pages:p.pages.filter(pg=>pg.id!==pid)})); if (selectedPageId === pid) setSelectedPageId(catalog.pages.find(pg=>pg.id!==pid)?.id); toast.success("Silindi"); }
    catch { toast.error("Silinemedi"); }
  };

  // Template switch: auto-save current content first, then change template
  const selectTemplate = async (tid) => {
    if (!selectedPage) return;
    // Save current content before switching
    try {
      await axios.put(`${API}/catalogs/${catalogId}/pages/${selectedPageId}`, { content: selectedPage.content });
    } catch(e) { /* continue even if save fails */ }
    // Only change template_id, preserve ALL other content
    updatePageContent('template_id', tid);
    updatePageContent('content_schema_version', 'v1');
    setShowTemplateDialog(false);
    toast.success("Sablon uygulandi - icerik korundu");
  };

  const handleImageUpload = async (e, target = 'base') => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await axios.post(`${API}/upload-image`, fd);
      if (target === 'base') {
        updatePageContent('image_data', r.data.image_data);
      } else {
        const overlays = [...(selectedPage?.content?.layers?.overlays || [])];
        if (typeof target === 'number' && overlays[target]) overlays[target].image_data = r.data.image_data;
        else overlays.push({ id: `ov-${Date.now()}`, image_data: r.data.image_data, x: 50, y: 50, width: 30, height: 30, fit: 'contain', opacity: 100, rotation: 0, zIndex: 6 });
        updateOverlays(overlays);
      }
      toast.success("Yuklendi");
    } catch { toast.error("Yuklenemedi"); }
    finally { e.target.value = ''; }
  };

  const handleRemoveBg = async (target = 'base', overlayIndex = null) => {
    const targetImage = target === 'base'
      ? selectedPage?.content?.image_data
      : selectedPage?.content?.layers?.overlays?.[overlayIndex]?.image_data;
    if (!targetImage) return;
    setRemovingBg(true);
    try {
      const blob = await fetch(targetImage).then(r=>r.blob());
      const fd = new FormData();
      fd.append('file', blob, 'img.png');
      fd.append('feather', String(effects.feather));
      const r = await axios.post(`${API}/remove-bg`, fd, {timeout:120000});
      if (target === 'base') {
        updatePageContent('image_data', r.data.image_data);
      } else {
        const overlays = [...(selectedPage?.content?.layers?.overlays || [])];
        if (overlays[overlayIndex]) {
          overlays[overlayIndex] = { ...overlays[overlayIndex], image_data: r.data.image_data };
          updateOverlays(overlays);
        }
      }
      toast.success("Arka plan kaldirildi");
    } catch(e) { toast.error(e.response?.data?.detail || "Hata"); } finally { setRemovingBg(false); }
  };

  const translateText = (field) => {
    const text = selectedPage?.content?.[field]; if (!text) return;
    setTranslateField(field);
    setTranslateSource(Array.isArray(text) ? text.join('\n') : text);
    setTranslateResult('');
    setShowTranslator(true);
  };

  const doTranslate = async () => {
    if (!translateSource) return; setTranslating(true);
    try { const r = await axios.post(`${API}/translate`, {text:translateSource, source_lang:sourceLang, target_lang:targetLang, tone:translationTone}); setTranslateResult(r.data.translated_text); toast.success("Cevrildi"); }
    catch(e) { toast.error(e.response?.data?.detail || "Hata"); } finally { setTranslating(false); }
  };

  const applyTranslation = () => {
    if (!translateResult || !translateField) return;
    updatePageContent(translateField, translateField === 'bullet_points' ? translateResult.split('\n').filter(Boolean) : translateResult);
    setShowTranslator(false); toast.success("Uygulandi");
  };

  const doExport = async () => {
    if (!previewHTML) return; setExporting(true);
    try {
      if (batchMode) {
        const presets = [];
        if (batchPresets['a4-portrait']) presets.push({format:'pdf',width:210,height:297,is_mm:true,label:'A4Portrait'});
        if (batchPresets['1080x1080']) presets.push({format:'png',width:1080,height:1080,is_mm:false,label:'1080x1080',quality:jpegQuality,optimize:exportQuality==='web'});
        if (batchPresets['1080x1350']) presets.push({format:'png',width:1080,height:1350,is_mm:false,label:'1080x1350',quality:jpegQuality,optimize:exportQuality==='web'});
        if (batchPresets['1200x628']) presets.push({format:'png',width:1200,height:628,is_mm:false,label:'1200x628',quality:jpegQuality,optimize:exportQuality==='web'});
        if (batchPresets['1920x1080']) presets.push({format:'png',width:1920,height:1080,is_mm:false,label:'1920x1080',quality:jpegQuality,optimize:exportQuality==='web'});
        const r = await axios.post(`${API}/export/batch`, {html_content:previewHTML,presets,catalog_name:catalog?.product_name||catalog?.name||'export',debug_html:exportDebugHtml},{responseType:'blob',timeout:120000});
        const url = window.URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href=url; a.download=`batch_${new Date().toISOString().slice(0,10)}.zip`; document.body.appendChild(a); a.click(); a.remove();
        toast.success("Toplu export tamamlandi");
      } else {
        const pm = {'a4-portrait':{w:210,h:297,mm:true},'a4-landscape':{w:297,h:210,mm:true,land:true},'1080x1080':{w:1080,h:1080},'1080x1350':{w:1080,h:1350},'1200x628':{w:1200,h:628},'1920x1080':{w:1920,h:1080}};
        const p = pm[exportPreset] || pm['a4-portrait'];
        const ep = exportFormat==='pdf' ? `${API}/export/pdf` : `${API}/export/image`;
        const r = await axios.post(ep, {html_content:previewHTML,format:exportFormat,width:p.w,height:p.h,is_mm:p.mm||false,quality:jpegQuality,landscape:p.land||false,optimize:exportQuality==='web',debug_html:exportDebugHtml},{responseType:'blob',timeout:60000});
        const ext = exportFormat==='pdf'?'pdf':exportFormat==='jpg'?'jpg':'png';
        const url = window.URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href=url; a.download=`${catalog?.product_name||'export'}_${exportPreset}.${ext}`; document.body.appendChild(a); a.click(); a.remove();
        toast.success(`${ext.toUpperCase()} indirildi`);
      }
    } catch(e) { toast.error("Export hatasi"); } finally { setExporting(false); setShowExportDialog(false); }
  };

  const moveLayer = (id, dir) => { const i = layers.findIndex(l=>l.id===id); const ni = dir==='up'?i-1:i+1; if(ni<0||ni>=layers.length)return; const nl=[...layers]; [nl[i],nl[ni]]=[nl[ni],nl[i]]; updateLayers(nl); };


  const updateOverlays = (next) => {
    updatePageContent('layers', { ...(selectedPage?.content?.layers || {}), overlays: next });
  };

  const updateOverlayAt = (idx, patch) => {
    const arr = [...overlays];
    if (!arr[idx]) return;
    arr[idx] = { ...arr[idx], ...patch };
    updateOverlays(arr);
  };

  const updateFieldBoxAt = (field, patch) => {
    const fieldBoxes = { ...(selectedPage?.content?.field_boxes || DEFAULT_FIELD_BOXES) };
    fieldBoxes[field] = { ...(fieldBoxes[field] || {}), ...patch };
    updatePageContent('field_boxes', fieldBoxes);
  };

  const updateShapeAt = (idx, patch) => {
    const arr = [...(selectedPage?.content?.shape_layers || [])];
    if (!arr[idx]) return;
    arr[idx] = { ...arr[idx], ...patch };
    updatePageContent('shape_layers', arr);
  };

  const updateTextBoxAt = (idx, patch) => {
    const arr = [...(selectedPage?.content?.custom_text_boxes || [])];
    if (!arr[idx]) return;
    arr[idx] = { ...arr[idx], ...patch };
    updatePageContent('custom_text_boxes', arr);
  };

  const calcPercentFromPoint = (clientX, clientY) => {
    const el = previewRef.current;
    if (!el) return { x: 50, y: 50 };
    const rect = el.getBoundingClientRect();
    let x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    let y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    if (snapToGrid) {
      const g = 2;
      x = Math.round(x / g) * g;
      y = Math.round(y / g) * g;
    }
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#004aad] border-t-transparent rounded-full"></div></div>;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#09090b] text-zinc-100" data-testid="editor-page" onClick={() => setContextMenu(null)}>
      {/* Header */}
      <header className="bg-[#09090b] border-b border-zinc-800 px-3 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100" onClick={() => navigate("/")} data-testid="back-btn"><ArrowLeft className="w-4 h-4" /></Button>
          <div><p className="text-sm font-semibold text-zinc-100 truncate max-w-[200px]">{catalog?.name}</p><p className="text-[10px] text-zinc-500">{catalog?.product_name}</p></div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="h-7 text-[11px] text-zinc-400 hover:text-zinc-100" onClick={() => setShowTemplateDialog(true)} data-testid="template-btn"><LayoutTemplate className="w-3.5 h-3.5 mr-1" />Sablon</Button>
          <div className="flex items-center rounded border border-zinc-800 overflow-hidden">
            <button className={`px-2 h-7 text-[10px] ${uiMode === 'basic' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-800/60'}`} onClick={() => setUiMode('basic')} title="Basit Mod">Basit</button>
            <button className={`px-2 h-7 text-[10px] ${uiMode === 'advanced' ? 'bg-[#004aad] text-white' : 'text-zinc-400 hover:bg-zinc-800/60'}`} onClick={() => setUiMode('advanced')} title="Gelismis Mod">Gelismis</button>
          </div>
          <div className="flex items-center gap-1 border border-zinc-800 rounded px-1.5 py-0.5">
            <span className="text-[10px] text-zinc-500">Safe</span>
            <Switch checked={showSafeArea} onCheckedChange={setShowSafeArea} className="scale-[0.6] data-[state=checked]:bg-[#004aad]" />
          </div>
          <div className="flex items-center gap-1 border border-zinc-800 rounded px-1.5 py-0.5">
            <span className="text-[10px] text-zinc-500">Snap</span>
            <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} className="scale-[0.6] data-[state=checked]:bg-[#004aad]" />
          </div>
          <div className="flex items-center gap-1 border border-zinc-800 rounded px-1.5 py-0.5">
            <span className="text-[10px] text-zinc-500">Guides</span>
            <Switch checked={showGuides} onCheckedChange={setShowGuides} className="scale-[0.6] data-[state=checked]:bg-[#004aad]" />
          </div>
          <Select value={activeTheme.id||'demart-corporate'} onValueChange={(v) => {const t=themes.find(th=>th.id===v);if(t)setActiveTheme(t);}}>
            <SelectTrigger className="h-7 w-[130px] text-[10px] bg-zinc-900 border-zinc-800 text-zinc-300"><Palette className="w-3 h-3 mr-1 text-zinc-500" /><SelectValue /></SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">{themes.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="h-7 text-[11px] text-zinc-400 hover:text-zinc-100" onClick={() => setShowTranslator(true)} data-testid="translator-btn"><Languages className="w-3.5 h-3.5 mr-1" />Cevirmen</Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px] border-zinc-700 text-zinc-300" onClick={savePage} disabled={saving} data-testid="save-btn"><Save className="w-3.5 h-3.5 mr-1" />{saving?"...":"Kaydet"}</Button>
          <Button size="sm" className="h-7 text-[11px] bg-[#004aad] hover:bg-[#003d8f]" onClick={() => setShowExportDialog(true)} data-testid="export-btn"><Download className="w-3.5 h-3.5 mr-1" />Export</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left - Mini Page List */}
        <div className="w-16 bg-[#0f0f11] border-r border-zinc-800 flex flex-col shrink-0">
          <button className="p-2 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors" onClick={addPage} data-testid="add-page-btn" title="Sayfa Ekle">
            <Plus className="w-4 h-4 text-zinc-500 mx-auto" />
          </button>
          <ScrollArea className="flex-1">
            <div className="p-1.5 space-y-1.5">
              {catalog?.pages?.sort((a,b)=>a.order-b.order).map((page, idx) => (
                <button key={page.id} className={`w-full rounded overflow-hidden border transition-all ${selectedPageId===page.id ? 'border-[#004aad] ring-1 ring-[#004aad]/30' : 'border-zinc-800 hover:border-zinc-700'}`}
                  onClick={() => setSelectedPageId(page.id)} data-testid={`page-${idx}`}>
                  <div className="a4-ratio bg-zinc-900 relative">
                    <div className="absolute inset-0 flex flex-col"><div className="h-1 bg-[#004aad]"></div><div className="flex-1 flex"><div className="w-1/2 bg-zinc-800/50"></div><div className="w-1/2 bg-zinc-800/30"></div></div><div className="h-0.5 bg-zinc-800"></div></div>
                    <span className="absolute bottom-0.5 right-1 text-[7px] text-zinc-600">{idx+1}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 canvas-bg overflow-auto flex flex-col">
          <div className="flex-1 p-6 flex items-start justify-center">
            <div className="relative max-w-[580px] w-full animate-fade-in">
              <div ref={previewRef} className="bg-white paper-shadow a4-ratio w-full overflow-hidden relative" data-testid="canvas-preview">
                <div dangerouslySetInnerHTML={{ __html: previewHTML }} style={{ width: '100%', height: '100%' }} />
                {Object.entries(selectedPage?.content?.field_boxes || {}).map(([field, box]) => {
                  const visible = shouldShowGuide('field', field);
                  if (!visible) return null;
                  return (
                  <div
                    key={`fb-${field}`}
                    onClick={() => setSelectedGuide({ kind: 'field', id: field })}
                    draggable
                    onDragEnd={(e) => updateFieldBoxAt(field, calcPercentFromPoint(e.clientX, e.clientY))}
                    className="absolute border border-amber-400/80 bg-amber-200/10 cursor-move"
                    style={{ left: `${box.x ?? 50}%`, top: `${box.y ?? 50}%`, width: `${box.width ?? 30}%`, height: `${box.height ?? 10}%`, transform: 'translate(-50%, -50%)', resize: 'both', overflow: 'hidden', zIndex: 19 }}
                    title={`Alan kutusu: ${getFieldBoxLabel(field)}`}
                  >
                    <div className="text-[10px] text-amber-300 px-1">{getFieldBoxLabel(field)}</div>
                  </div>
                  );
                })}
                {(selectedPage?.content?.shape_layers || []).map((sh, idx) => {
                  const shapeId = sh.id || idx;
                  const visible = shouldShowGuide('shape', shapeId);
                  if (!visible) return null;
                  const type = sh?.type || 'rect';
                  const baseStyle = {
                    left: `${sh.x ?? 50}%`,
                    top: `${sh.y ?? 50}%`,
                    width: `${sh.width ?? 20}%`,
                    height: `${sh.height ?? 10}%`,
                    transform: `translate(-50%, -50%) rotate(${Number(sh?.rotation ?? 0)}deg)`,
                    zIndex: 18,
                    opacity: ((sh.opacity ?? 60) / 100),
                  };
                  const commonClass = `absolute border border-fuchsia-400/80 ${sh.locked ? 'cursor-not-allowed opacity-80' : 'cursor-move'}`;

                  if (type === 'line') {
                    const thickness = Number(sh?.thickness ?? 3);
                    return (
                      <div
                        key={shapeId}
                        draggable={!sh.locked}
                        onDragEnd={(e) => !sh.locked && updateShapeAt(idx, calcPercentFromPoint(e.clientX, e.clientY))}
                        onClick={() => setSelectedGuide({ kind: 'shape', id: shapeId })}
                        className={commonClass}
                        style={{ ...baseStyle, height: `${thickness}px`, resize: 'horizontal', overflow: 'visible', background: sh.color || '#1e293b' }}
                        title="Sekil katmani: line"
                      />
                    );
                  }

                  return (
                    <div
                      key={shapeId}
                      draggable={!sh.locked}
                      onDragEnd={(e) => !sh.locked && updateShapeAt(idx, calcPercentFromPoint(e.clientX, e.clientY))}
                      onClick={() => setSelectedGuide({ kind: 'shape', id: shapeId })}
                      className={commonClass}
                      style={{ ...baseStyle, resize: 'both', overflow: 'hidden', background: sh.color || '#1e293b', borderRadius: type === 'circle' ? '9999px' : `${sh.borderRadius ?? 0}px` }}
                      title={`Sekil katmani: ${type}`}
                    />
                  );
                })}
                {overlays.map((ov, idx) => {
                  const overlayId = ov.id || idx;
                  const visible = shouldShowGuide('overlay', overlayId);
                  if (!visible) return null;
                  return (
                  <div
                    key={overlayId}
                    draggable
                    onDragEnd={(e) => updateOverlayAt(idx, calcPercentFromPoint(e.clientX, e.clientY))}
                    onClick={() => setSelectedGuide({ kind: 'overlay', id: overlayId })}
                    onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'overlay', index: idx }); }}
                    className="absolute border border-[#004aad]/70 bg-black/10 cursor-move"
                    style={{ left: `${ov.x ?? 50}%`, top: `${ov.y ?? 50}%`, width: `${ov.width ?? 30}%`, height: `${ov.height ?? 30}%`, transform: 'translate(-50%, -50%)', resize: 'both', overflow: 'hidden', zIndex: 20 }}
                    title="Surukle / boyutlandir"
                  >
                    {ov.image_data ? <img src={ov.image_data} alt="overlay" className="w-full h-full object-contain pointer-events-none" /> : null}
                  </div>
                  );
                })}
                {(selectedPage?.content?.custom_text_boxes || []).map((tb, idx) => {
                  const textId = tb.id || idx;
                  const visible = shouldShowGuide('custom', textId);
                  if (!visible) return null;
                  return (
                  <div
                    key={textId}
                    draggable
                    onDragEnd={(e) => updateTextBoxAt(idx, calcPercentFromPoint(e.clientX, e.clientY))}
                    onClick={() => setSelectedGuide({ kind: 'custom', id: textId })}
                    className="absolute border border-emerald-400/80 bg-black/30 text-white p-1 cursor-move"
                    style={{ left: `${tb.x ?? 10}%`, top: `${tb.y ?? 10}%`, width: `${tb.width ?? 30}%`, height: `${tb.height ?? 12}%`, transform: 'translate(-50%, -50%)', resize: 'both', overflow: 'hidden', zIndex: 21, fontSize: `${tb.fontSize ?? 14}px`, fontWeight: tb.bold ? 700 : 400, textAlign: tb.align || 'left' }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateTextBoxAt(idx, { text: e.currentTarget.innerText })}
                    title="Surukle / boyutlandir / metni duzenle"
                  >
                    {tb.text}
                  </div>
                  );
                })}
                {showGuides && <>
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-300/30 pointer-events-none"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-300/30 pointer-events-none"></div>
                </>}
                {showSafeArea && <div className="safe-area-overlay"></div>}
                {contextMenu && (
                  <div className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded p-1 space-y-1" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(e) => e.stopPropagation()}>
                    {contextMenu.type === 'overlay' && (
                      <>
                        <button className="block w-full text-left text-xs px-2 py-1 hover:bg-zinc-800 rounded" onClick={() => { updateOverlays(overlays.filter((_, i) => i !== contextMenu.index)); setContextMenu(null); }}>Overlay Sil</button>
                        <button className="block w-full text-left text-xs px-2 py-1 hover:bg-zinc-800 rounded" onClick={() => { const arr=[...overlays]; if(arr[contextMenu.index]){arr[contextMenu.index].zIndex=(arr[contextMenu.index].zIndex||6)+1; updateOverlays(arr);} setContextMenu(null); }}>One Al</button>
                        <button className="block w-full text-left text-xs px-2 py-1 hover:bg-zinc-800 rounded" onClick={() => { const arr=[...overlays]; if(arr[contextMenu.index]){arr[contextMenu.index].zIndex=Math.max(0,(arr[contextMenu.index].zIndex||6)-1); updateOverlays(arr);} setContextMenu(null); }}>Arkaya Al</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {uiMode === 'advanced' && (
          <div className="bg-[#0f0f11] border-t border-zinc-800 px-3 py-2 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0">Layers</span>
              {layers.map(l => (
                <div key={l.id} className="flex items-center gap-0.5 px-1.5 py-0.5 border border-zinc-800 rounded text-[10px] shrink-0 bg-zinc-900/50">
                  <button title="Katmani goster/gizle" onClick={() => updatePageContent('layer_groups', { ...layerGroups, [l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id]: { ...(layerGroups[l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id] || {}), visible: !((layerGroups[l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id] || {}).visible !== false) } })} className="text-zinc-500 hover:text-zinc-300">
                    {(layerGroups[l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id]?.visible ?? true) ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5 text-zinc-700" />}
                  </button>
                  <button title="Katmani kilitle/ac" onClick={() => updatePageContent('layer_groups', { ...layerGroups, [l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id]: { ...(layerGroups[l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id] || {}), locked: !((layerGroups[l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id] || {}).locked) } })} className="text-zinc-500 hover:text-zinc-300">
                    {(layerGroups[l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id]?.locked ?? l.locked) ? <Lock className="w-2.5 h-2.5 text-red-500/50" /> : <Unlock className="w-2.5 h-2.5" />}
                  </button>
                  <span className={(layerGroups[l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id]?.visible ?? true) ? 'text-zinc-400' : 'text-zinc-700 line-through'}>{l.name}</span><Input type='number' value={layerGroups[l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id]?.opacity ?? 100} onChange={(e)=>updatePageContent('layer_groups', { ...layerGroups, [l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id]: { ...(layerGroups[l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id] || {}), opacity: Number(e.target.value) || 100 } })} className='h-5 w-12 text-[9px] bg-zinc-800 border-zinc-700' title='Opacity %' /><Input type='number' value={layerGroups[l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id]?.zIndexOffset ?? 0} onChange={(e)=>updatePageContent('layer_groups', { ...layerGroups, [l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id]: { ...(layerGroups[l.id === 'overlay-images' ? 'overlays' : l.id === 'custom-text' ? 'customText' : l.id] || {}), zIndexOffset: Number(e.target.value) || 0 } })} className='h-5 w-10 text-[9px] bg-zinc-800 border-zinc-700' title='Z offset' />
                  <button title="One getir" onClick={() => moveLayer(l.id,'up')} className="text-zinc-600 hover:text-zinc-400"><ChevronUp className="w-2.5 h-2.5" /></button>
                  <button title="Arkaya gonder" onClick={() => moveLayer(l.id,'down')} className="text-zinc-600 hover:text-zinc-400"><ChevronDown className="w-2.5 h-2.5" /></button>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

        {/* Right - Properties */}
        <div className="w-[300px] bg-[#0f0f11] border-l border-zinc-800 flex flex-col shrink-0 h-full">
          <div className="px-3 py-2 border-b border-zinc-800 shrink-0">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Sayfa Ozellikleri</h2>
            <p className="text-[10px] text-zinc-500 mt-1">Mod: {uiMode === 'basic' ? 'Basit (hizli duzenleme)' : 'Gelismis (tum kontroller)'}</p>
          </div>
          <ScrollArea className="flex-1">
            {selectedPage && (
              <div className="p-2.5 space-y-0.5">
                {/* CONTENT SECTION */}
                <Collapsible open={openSections.content} onOpenChange={() => toggleSection('content')}>
                  <CollapsibleTrigger className="section-header flex items-center justify-between w-full px-2 py-1.5 rounded">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Icerik</span>
                    <ChevronRight className={`w-3 h-3 text-zinc-600 transition-transform ${openSections.content ? 'rotate-90' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 px-1 pt-2">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <p className="text-[10px] text-zinc-500 leading-4 break-words whitespace-normal w-full">Guides kapaliyken secmek icin bu listedeki alanlara odaklanin.</p>
                      <div className="flex items-center gap-1">
                        {uiMode === 'basic' && (
                          <Button variant="outline" size="sm" className="h-6 text-[10px] border-zinc-700 text-zinc-300" onClick={() => { setUiMode('advanced'); setShowGuides(true); toast.success('Gelismis moda gecildi: kutulari tasiyip silebilirsiniz.'); }}>Kutulari Duzenle</Button>
                        )}
                        <Button variant="outline" size="sm" className="h-6 text-[10px] border-zinc-700 text-zinc-300" onClick={() => { updatePageContent('field_boxes', { ...DEFAULT_FIELD_BOXES }); updatePageContent('shape_layers', DEFAULT_SHAPE_LAYERS.map((sh) => ({ ...sh }))); setSelectedGuide(null); }}>Layout Sifirla (Template Default)</Button>
                      </div>
                    </div>
                    {/* Title */}
                    <div>
                      <Label className="text-[10px] font-semibold text-zinc-500 uppercase">Baslik</Label>
                      {uiMode === 'advanced' && <TypoControls field="title" content={selectedPage.content} updateContent={updatePageContent} onTranslate={() => translateText('title')} />}
                      {uiMode === 'advanced' && <OverflowControls field="title" content={selectedPage.content} updateContent={updatePageContent} />}
                      <Input value={selectedPage.content?.title||""} onChange={(e) => updatePageContent('title',e.target.value)} onFocus={() => setSelectedGuide({ kind: 'field', id: 'title' })} placeholder="Urun basligi"
                        className="dense-input bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" data-testid="input-title" />
                    </div>

                    {/* Subtitle */}
                    <div>
                      <Label className="text-[10px] font-semibold text-zinc-500 uppercase">Alt Baslik</Label>
                      {uiMode === 'advanced' && <TypoControls field="subtitle" content={selectedPage.content} updateContent={updatePageContent} />}
                      {uiMode === 'advanced' && <OverflowControls field="subtitle" content={selectedPage.content} updateContent={updatePageContent} />}
                      <Input value={selectedPage.content?.subtitle||""} onChange={(e) => updatePageContent('subtitle',e.target.value)} onFocus={() => setSelectedGuide({ kind: 'field', id: 'subtitle' })} placeholder="Alt baslik"
                        className="dense-input bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" data-testid="input-subtitle" />
                    </div>

                    {/* Description */}
                    <div>
                      <Label className="text-[10px] font-semibold text-zinc-500 uppercase">Aciklama</Label>
                      {uiMode === 'advanced' && <TypoControls field="description" content={selectedPage.content} updateContent={updatePageContent} onTranslate={() => translateText('description')} />}
                      {uiMode === 'advanced' && <OverflowControls field="description" content={selectedPage.content} updateContent={updatePageContent} />}
                      <Textarea value={selectedPage.content?.description||""} onChange={(e) => updatePageContent('description',e.target.value)} onFocus={() => setSelectedGuide({ kind: 'field', id: 'description' })} placeholder="Detayli aciklama" rows={3}
                        className="text-xs bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none" data-testid="input-desc" />
                    </div>

                    {/* Bullet Points */}
                    <div>
                      <Label className="text-[10px] font-semibold text-zinc-500 uppercase">Teknik Ozellikler</Label>
                      {uiMode === 'advanced' && <TypoControls field="bullets" content={selectedPage.content} updateContent={updatePageContent} onTranslate={() => translateText('bullet_points')} />}
                      {uiMode === 'advanced' && <OverflowControls field="bullets" content={selectedPage.content} updateContent={updatePageContent} />}
                      <Textarea value={(selectedPage.content?.bullet_points||[]).join('\n')} onChange={(e) => updatePageContent('bullet_points',e.target.value.split('\n').filter(Boolean))} onFocus={() => setSelectedGuide({ kind: 'field', id: 'bullets' })} placeholder="Her satira bir ozellik" rows={3}
                        className="text-xs bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none" data-testid="input-bullets" />
                    </div>

                    {/* Applications */}
                    <div>
                      <Label className="text-[10px] font-semibold text-zinc-500 uppercase">Uygulama Alanlari</Label>
                      {uiMode === 'advanced' && <TypoControls field="applications" content={selectedPage.content} updateContent={updatePageContent} onTranslate={() => translateText('applications')} />}
                      {uiMode === 'advanced' && <OverflowControls field="applications" content={selectedPage.content} updateContent={updatePageContent} />}
                      <Textarea value={selectedPage.content?.applications||""} onChange={(e) => updatePageContent('applications',e.target.value)} onFocus={() => setSelectedGuide({ kind: 'field', id: 'applications' })} rows={2}
                        className="text-xs bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none" data-testid="input-apps" />
                    </div>

                    {/* Key Benefits */}
                    <div>
                      <Label className="text-[10px] font-semibold text-zinc-500 uppercase">Temel Avantajlar</Label>
                      {uiMode === 'advanced' && <TypoControls field="benefits" content={selectedPage.content} updateContent={updatePageContent} onTranslate={() => translateText('key_benefits')} />}
                      {uiMode === 'advanced' && <OverflowControls field="benefits" content={selectedPage.content} updateContent={updatePageContent} />}
                      <Textarea value={selectedPage.content?.key_benefits||""} onChange={(e) => updatePageContent('key_benefits',e.target.value)} onFocus={() => setSelectedGuide({ kind: 'field', id: 'benefits' })} rows={2}
                        className="text-xs bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none" data-testid="input-benefits" />
                    </div>


                    {uiMode === 'advanced' && (
                      <div className="space-y-1 border border-zinc-800 rounded p-1">
                        <p className="text-[10px] text-zinc-500">Metin Kutu Z-Index (On/Arka) - Font size degildir</p>
                        {Object.entries(selectedPage.content?.field_boxes || {}).map(([field, box]) => (
                          <div key={`fz-${field}`} className="grid grid-cols-[1fr_60px] gap-1 items-center">
                            <span className="text-[10px] text-zinc-400 truncate">{getFieldBoxLabel(field)}</span>
                            <Input
                              type="number"
                              value={box?.zIndex ?? 12}
                              onChange={(e) => updateFieldBoxAt(field, { zIndex: Number(e.target.value) || 12 })}
                              className="h-6 text-[10px] bg-zinc-800 border-zinc-700"
                              title="Buyuk deger one gelir"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {uiMode === 'advanced' && (
                      <>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" className="h-6 text-[10px] border-zinc-700 text-zinc-300" onClick={() => updatePageContent('custom_text_boxes', [...(selectedPage.content?.custom_text_boxes || []), { id: `txt-${Date.now()}`, text: 'Yeni metin', x: 10, y: 10, width: 30, height: 12, fontSize: 14, color: '#ffffff', bold: false, align: 'left', zIndex: 7 }])}>
                        <Plus className="w-3 h-3 mr-1" />Serbest Metin
                      </Button>
                      <Button variant="outline" size="sm" className="h-6 text-[10px] border-zinc-700 text-zinc-300 ml-1" onClick={() => updatePageContent('shape_layers', [...(selectedPage.content?.shape_layers || []), { id: `sh-${Date.now()}`, type: 'rect', x: 80, y: 50, width: 20, height: 20, color: '#0f2f44', fillColor:'#0f2f44', strokeColor:'#0f2f44', strokeWidth:0, opacity: 80, borderRadius: 0, zIndex: 12, locked: false, circleMode:'perfect' }])}>
                        <Plus className="w-3 h-3 mr-1" />Sekil
                      </Button>
                    </div>
                    <div className="space-y-1 border border-zinc-800 rounded p-1">
                      <p className="text-[10px] text-zinc-500">Shape Ayarlari</p>
                      {(selectedPage.content?.shape_layers || []).map((sh, idx) => (
                        <div key={sh.id || idx} className={`grid grid-cols-1 gap-1 items-center rounded ${selectedGuide?.kind === 'shape' && selectedGuide?.id === (sh.id || idx) ? 'ring-1 ring-fuchsia-400/70 p-1' : ''}`} onClick={() => setSelectedGuide({ kind: 'shape', id: sh.id || idx })}>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] text-zinc-400 truncate" title={sh.name || sh.id}>{sh.name || `shape-${idx+1}`}</span>
                            <button
                              className="h-7 w-7 flex items-center justify-center rounded bg-red-500/60 hover:bg-red-500/80"
                              onClick={() => updatePageContent('shape_layers', (selectedPage.content?.shape_layers || []).filter((_, i) => i !== idx))}
                              title="Shape sil"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          <input type="color" value={sh.fillColor || sh.color || '#0f2f44'} onChange={(e)=>updateShapeAt(idx,{color:e.target.value,fillColor:e.target.value})} className="h-6 w-full bg-zinc-800 border border-zinc-700 rounded" />
                          <input type="color" value={sh.strokeColor || sh.color || '#0f2f44'} onChange={(e)=>updateShapeAt(idx,{strokeColor:e.target.value})} className="h-6 w-full bg-zinc-800 border border-zinc-700 rounded" title="Stroke color" />
                          <Select value={sh.type || 'rect'} onValueChange={(v)=>updateShapeAt(idx,v === 'circle' ? {type:v,circleMode:'perfect',height:sh.width || 20} : {type:v})}><SelectTrigger className="h-6 text-[10px] bg-zinc-800 border-zinc-700"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="rect">Rect</SelectItem><SelectItem value="circle">Circle/Ellipse</SelectItem><SelectItem value="line">Line</SelectItem></SelectContent></Select>
                          {sh.type === 'circle' && <Select value={sh.circleMode || 'ellipse'} onValueChange={(v)=>updateShapeAt(idx,{circleMode:v})}><SelectTrigger className="h-6 text-[10px] bg-zinc-800 border-zinc-700"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="ellipse">Ellipse</SelectItem><SelectItem value="perfect">Perfect circle</SelectItem></SelectContent></Select>}
                          <Input type="number" value={sh.strokeWidth ?? 0} onChange={(e)=>updateShapeAt(idx,{strokeWidth:Number(e.target.value)||0})} className="h-6 text-[10px] bg-zinc-800 border-zinc-700" placeholder="Stroke px" />
                          <Input type="number" value={sh.zIndex ?? 5} onChange={(e)=>updateShapeAt(idx,{zIndex:Number(e.target.value)||5})} className="h-6 text-[10px] bg-zinc-800 border-zinc-700" placeholder="Z-index" />
                          <button className="h-6 text-[10px] border border-zinc-700 rounded text-zinc-300" onClick={()=>updateShapeAt(idx,{locked:!sh.locked})}>{sh.locked ? 'Unlock':'Lock'}</button>
                          <Input type="number" value={sh.rotation ?? 0} onChange={(e)=>updateShapeAt(idx,{rotation:Number(e.target.value)||0})} className="h-6 text-[10px] bg-zinc-800 border-zinc-700" placeholder="Rot" />
                          {(sh.type === 'line') && <Input type="number" value={sh.thickness ?? 3} onChange={(e)=>updateShapeAt(idx,{thickness:Number(e.target.value)||3})} className="h-6 text-[10px] bg-zinc-800 border-zinc-700" placeholder="px" />}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <Label className="text-[10px] font-semibold text-zinc-500 uppercase">Baslik Etiketi: Uyari</Label>
                        <Input value={selectedPage.content?.label_alert||""} onChange={(e)=>updatePageContent('label_alert',e.target.value)} onFocus={() => setSelectedGuide({ kind: 'field', id: 'label_alert' })} className="dense-input bg-zinc-800/50 border-zinc-700 text-zinc-100" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold text-zinc-500 uppercase">Baslik Etiketi: Ozellik</Label>
                        <Input value={selectedPage.content?.label_features||""} onChange={(e)=>updatePageContent('label_features',e.target.value)} onFocus={() => setSelectedGuide({ kind: 'field', id: 'label_features' })} className="dense-input bg-zinc-800/50 border-zinc-700 text-zinc-100" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold text-zinc-500 uppercase">Baslik Etiketi: Uygulama</Label>
                        <Input value={selectedPage.content?.label_applications||""} onChange={(e)=>updatePageContent('label_applications',e.target.value)} onFocus={() => setSelectedGuide({ kind: 'field', id: 'label_applications' })} className="dense-input bg-zinc-800/50 border-zinc-700 text-zinc-100" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold text-zinc-500 uppercase">Baslik Etiketi: Avantaj</Label>
                        <Input value={selectedPage.content?.label_benefits||""} onChange={(e)=>updatePageContent('label_benefits',e.target.value)} onFocus={() => setSelectedGuide({ kind: 'field', id: 'label_benefits' })} className="dense-input bg-zinc-800/50 border-zinc-700 text-zinc-100" />
                      </div>
                    </div>

                      </>
                    )}

                    {/* CTA */}
                    <div>
                      <Label className="text-[10px] font-semibold text-zinc-500 uppercase">CTA Butonu</Label>
                      <Input value={selectedPage.content?.cta_text||""} onChange={(e) => updatePageContent('cta_text',e.target.value)} onFocus={() => setSelectedGuide({ kind: 'field', id: 'cta' })} placeholder="Detayli Bilgi"
                        className="dense-input bg-zinc-800/50 border-zinc-700 text-zinc-100" data-testid="input-cta" />
                    </div>

                    <div className="pt-2 border-t border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase">Katman Gorselleri (Coklu)</span>
                        <Button variant="outline" size="sm" className="h-6 text-[10px] border-zinc-700 text-zinc-300" onClick={() => { setOverlayTargetIndex(null); overlayInputRef.current?.click(); }}>
                          <Plus className="w-3 h-3 mr-1" />Yeni Overlay
                        </Button>
                      </div>
                      {!overlays.length && (
                        <p className="text-[10px] text-zinc-500">Birden fazla gorsel ekleyebilir, ust uste konumlandirabilirsiniz.</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Separator className="bg-zinc-800 my-1" />

                {/* IMAGE SECTION */}
                <Collapsible open={openSections.image} onOpenChange={() => toggleSection('image')}>
                  <CollapsibleTrigger className="section-header flex items-center justify-between w-full px-2 py-1.5 rounded">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gorsel</span>
                    <ChevronRight className={`w-3 h-3 text-zinc-600 transition-transform ${openSections.image ? 'rotate-90' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-1 pt-2 space-y-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e)=>handleImageUpload(e,'base')} className="hidden" data-testid="file-input" />
                    <input ref={overlayInputRef} type="file" accept="image/*" onChange={(e)=>handleImageUpload(e,overlayTargetIndex ?? 'new')} className="hidden" />
                    {!selectedPage.content?.image_data ? (
                      <div className="border border-dashed border-zinc-700 rounded p-4 text-center cursor-pointer hover:border-[#004aad]/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-6 h-6 text-zinc-600 mx-auto mb-1" /><p className="text-[10px] text-zinc-500">Gorsel Yukle (PNG, JPG, SVG)</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative aspect-[4/3] bg-zinc-800 rounded overflow-hidden border border-zinc-700">
                          <img src={selectedPage.content.image_data} alt="" className="w-full h-full object-contain" />
                          <div className="absolute top-1 right-1 flex gap-1">
                            <button className="p-1 rounded bg-black/60 hover:bg-black/80" onClick={() => fileInputRef.current?.click()}><Upload className="w-3 h-3 text-white" /></button>
                            <button className="h-7 w-7 flex items-center justify-center rounded bg-red-500/60 hover:bg-red-500/80" onClick={() => updatePageContent('image_data',null)}><X className="w-4 h-4 text-white" /></button>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Select value={selectedPage.content?.image_fit||'cover'} onValueChange={(v) => updatePageContent('image_fit',v)}>
                            <SelectTrigger className="h-7 text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="cover" className="text-xs">Kapla</SelectItem><SelectItem value="contain" className="text-xs">Sigdir</SelectItem><SelectItem value="fill" className="text-xs">Doldur</SelectItem></SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" className="h-7 text-[10px] border-zinc-700 text-zinc-300" onClick={() => handleRemoveBg('base')} disabled={removingBg} data-testid="remove-bg-btn">
                            {removingBg ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Scissors className="w-3 h-3 mr-1" />BG Sil</>}
                          </Button>
                        </div>
                        <div className="pt-2 border-t border-zinc-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-zinc-500 uppercase">Katman Gorselleri</span>
                            <Button variant="outline" size="sm" className="h-6 text-[10px] border-zinc-700 text-zinc-300" onClick={() => { setOverlayTargetIndex(null); overlayInputRef.current?.click(); }}>
                              <Plus className="w-3 h-3 mr-1" />Yeni
                            </Button>
                          </div>
                          {overlays.map((ov, idx) => (
                            <div key={ov.id || idx} className="bg-zinc-900/50 p-1.5 rounded border border-zinc-800 space-y-1">
                              <div className="flex items-center gap-1">
                                <button className="p-1 rounded bg-zinc-800" onClick={() => { setOverlayTargetIndex(idx); overlayInputRef.current?.click(); }}><Upload className="w-3 h-3 text-zinc-300" /></button>
                                <button className="h-7 w-7 flex items-center justify-center rounded bg-red-500/60 hover:bg-red-500/80" onClick={() => updateOverlays(overlays.filter((_,i)=>i!==idx))}><Trash2 className="w-4 h-4 text-white" /></button>
                                <button className="p-1 rounded bg-zinc-700" onClick={() => handleRemoveBg('overlay', idx)} title="Bu katmanda arka plan sil"><Scissors className="w-3 h-3 text-white" /></button>
                                <span className="text-[10px] text-zinc-400">Katman {idx+1}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <Input value={ov.x ?? 50} type="number" onChange={(e)=>{const arr=[...overlays];arr[idx]={...ov,x:Number(e.target.value)};updateOverlays(arr);}} className="h-6 text-[10px] bg-zinc-800 border-zinc-700" placeholder="X%" />
                                <Input value={ov.y ?? 50} type="number" onChange={(e)=>{const arr=[...overlays];arr[idx]={...ov,y:Number(e.target.value)};updateOverlays(arr);}} className="h-6 text-[10px] bg-zinc-800 border-zinc-700" placeholder="Y%" />
                                <Input value={ov.width ?? 30} type="number" onChange={(e)=>{const arr=[...overlays];arr[idx]={...ov,width:Number(e.target.value)};updateOverlays(arr);}} className="h-6 text-[10px] bg-zinc-800 border-zinc-700" placeholder="W%" />
                                <Input value={ov.height ?? 30} type="number" onChange={(e)=>{const arr=[...overlays];arr[idx]={...ov,height:Number(e.target.value)};updateOverlays(arr);}} className="h-6 text-[10px] bg-zinc-800 border-zinc-700" placeholder="H%" />
                                <Input value={ov.zIndex ?? 6} type="number" onChange={(e)=>{const arr=[...overlays];arr[idx]={...ov,zIndex:Number(e.target.value)||6};updateOverlays(arr);}} className="h-6 text-[10px] bg-zinc-800 border-zinc-700" placeholder="Z-Index" />
                                <Input value={ov.effects?.opacity ?? ov.opacity ?? 100} type="number" onChange={(e)=>{const arr=[...overlays];arr[idx]={...ov,effects:{...(ov.effects||{}),opacity:Number(e.target.value)||100}};updateOverlays(arr);}} className="h-6 text-[10px] bg-zinc-800 border-zinc-700" placeholder="Opacity%" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                <Separator className="bg-zinc-800 my-1" />

                {uiMode === 'advanced' && (
                <Collapsible open={openSections.effects} onOpenChange={() => toggleSection('effects')}>
                  <CollapsibleTrigger className="section-header flex items-center justify-between w-full px-2 py-1.5 rounded">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Efektler</span>
                    <ChevronRight className={`w-3 h-3 text-zinc-600 transition-transform ${openSections.effects ? 'rotate-90' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-1 pt-2 space-y-3">
                    <div className="bg-zinc-800/30 rounded p-1.5 text-[10px] text-zinc-500">
                      <span className="text-[#004aad]">Hedef:</span> {activeGuideKind === 'base' ? 'Ana gorsel' : `Secili ${activeGuideKind} katmani`}
                    </div>
                    {activeEffectSupport.feather && <div><div className="flex justify-between"><span className="text-[10px] text-zinc-500">Feathering</span><span className="text-[10px] text-zinc-600">{selectedLayerEffects.feather || 0}px</span></div>
                      <Slider value={[selectedLayerEffects.feather || 0]} onValueChange={([v]) => setEffectsForSelection({feather:v})} max={20} className="mt-1" /></div>}
                    <div><div className="flex justify-between"><span className="text-[10px] text-zinc-500">Shadow</span><span className="text-[10px] text-zinc-600">{selectedLayerEffects.shadow || 0}%</span></div>
                      <Slider value={[selectedLayerEffects.shadow || 0]} onValueChange={([v]) => setEffectsForSelection({shadow:v})} max={100} step={5} className="mt-1" disabled={!activeEffectSupport.shadow} /></div>
                    <div><div className="flex justify-between"><span className="text-[10px] text-zinc-500">Opacity</span><span className="text-[10px] text-zinc-600">{selectedLayerEffects.opacity ?? 100}%</span></div>
                      <Slider value={[selectedLayerEffects.opacity ?? 100]} onValueChange={([v]) => setEffectsForSelection({opacity:v})} max={100} step={1} className="mt-1" disabled={!activeEffectSupport.opacity} /></div>
                    <div className="flex items-center justify-between"><span className="text-[10px] text-zinc-500">Grain</span>
                      <Switch checked={effects.grain_enabled} onCheckedChange={(v) => updateEffects({...effects,grain_enabled:v})} className="scale-[0.6] data-[state=checked]:bg-[#004aad]" /></div>
                    {effects.grain_enabled && <div><div className="flex justify-between"><span className="text-[10px] text-zinc-500">Yogunluk</span><span className="text-[10px] text-zinc-600">{effects.grain_intensity}%</span></div>
                      <Slider value={[effects.grain_intensity]} onValueChange={([v]) => updateEffects({...effects,grain_intensity:v})} max={50} className="mt-1" /></div>}
                    {activeEffectSupport.blend && <div><span className="text-[10px] text-zinc-500">Blend</span>
                      <Select value={selectedLayerEffects.blend || 'normal'} onValueChange={(v) => setEffectsForSelection({blend:v})}>
                        <SelectTrigger className="h-7 text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300 mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="normal">Normal</SelectItem><SelectItem value="multiply">Multiply</SelectItem><SelectItem value="screen">Screen</SelectItem><SelectItem value="overlay">Overlay</SelectItem></SelectContent>
                      </Select>
                    </div>}
                  </CollapsibleContent>
                </Collapsible>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto bg-zinc-900 border-zinc-800" aria-describedby="tpl-d" data-testid="template-dialog">
          <DialogHeader><DialogTitle className="text-zinc-100">Sablon Sec</DialogTitle></DialogHeader>
          <p id="tpl-d" className="sr-only">Sablon secin</p>
          <div className="flex gap-1.5 mb-4 flex-wrap">{TEMPLATE_CATEGORIES.map(c => (
            <Button key={c.id} variant={templateCategory===c.id?"default":"outline"} size="sm" className={`h-7 text-xs ${templateCategory===c.id?'bg-[#004aad]':'border-zinc-700 text-zinc-400'}`} onClick={() => setTemplateCategory(c.id)}>{c.name}</Button>
          ))}</div>
          <div className="grid grid-cols-3 gap-3">
            {TEMPLATES.filter(t => templateCategory==='all'||t.category===templateCategory).map(t => (
              <div key={t.id} className={`border rounded-lg p-2 cursor-pointer transition-all hover:border-zinc-600 ${currentTemplateId===t.id?'border-[#004aad] ring-1 ring-[#004aad]/30':'border-zinc-800'}`}
                onClick={() => selectTemplate(t.id)} data-testid={`template-${t.id}`}>
                <div className="a4-ratio bg-white rounded overflow-hidden mb-1.5 border border-zinc-700">
                  <div className="template-preview-frame" style={{transform:'scale(0.14)',transformOrigin:'top left',width:'794px',height:'1123px'}}
                    dangerouslySetInnerHTML={{__html:generateTemplateHTML(t.id,selectedPage?.content||{title:t.name,subtitle:t.description},activeTheme)}} />
                </div>
                <p className="text-xs font-medium text-zinc-200">{t.name}</p>
                <p className="text-[10px] text-zinc-500">{t.description}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md bg-zinc-900 border-zinc-800" aria-describedby="exp-d" data-testid="export-dialog">
          <DialogHeader><DialogTitle className="text-zinc-100">Disa Aktar</DialogTitle></DialogHeader>
          <p id="exp-d" className="sr-only">Export ayarlari</p>
          <div className="space-y-3 py-2">
            <div className="flex gap-2"><Button variant={!batchMode?"default":"outline"} size="sm" className={!batchMode?'bg-[#004aad]':'border-zinc-700 text-zinc-400'} onClick={() => setBatchMode(false)}>Tekli</Button>
              <Button variant={batchMode?"default":"outline"} size="sm" className={batchMode?'bg-[#004aad]':'border-zinc-700 text-zinc-400'} onClick={() => setBatchMode(true)}>Toplu (ZIP)</Button></div>
            {!batchMode ? (<>
              <div><Label className="text-[10px] text-zinc-400">Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="pdf">PDF</SelectItem><SelectItem value="png">PNG</SelectItem><SelectItem value="jpg">JPG</SelectItem></SelectContent></Select></div>
              <div><Label className="text-[10px] text-zinc-400">Boyut</Label>
                <Select value={exportPreset} onValueChange={setExportPreset}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="a4-portrait">A4 Dikey</SelectItem><SelectItem value="a4-landscape">A4 Yatay</SelectItem><SelectItem value="1080x1080">1080x1080</SelectItem><SelectItem value="1080x1350">1080x1350</SelectItem><SelectItem value="1200x628">1200x628</SelectItem><SelectItem value="1920x1080">1920x1080</SelectItem></SelectContent></Select></div>
            </>) : (
              <div className="space-y-1.5">{Object.entries(batchPresets).map(([k,v]) => (
                <label key={k} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input type="checkbox" checked={v} onChange={(e) => setBatchPresets(p=>({...p,[k]:e.target.checked}))} className="rounded bg-zinc-800 border-zinc-700" />
                  {k==='a4-portrait'?'PDF A4':`PNG ${k}`}
                </label>
              ))}</div>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-400">Debug HTML (export_debug.html)</Label>
              <Switch checked={exportDebugHtml} onCheckedChange={setExportDebugHtml} className="data-[state=checked]:bg-[#004aad]" />
            </div>
            <div><Label className="text-[10px] text-zinc-400">Kalite</Label>
              <Select value={exportQuality} onValueChange={setExportQuality}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="high">Yuksek (Baski)</SelectItem><SelectItem value="web">Web Optimize</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)} className="border-zinc-700 text-zinc-300">Iptal</Button>
            <Button className="bg-[#004aad]" onClick={doExport} disabled={exporting} data-testid="do-export-btn">
              {exporting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Hazirlaniyor</> : <><Download className="w-4 h-4 mr-1" />Export</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Translator */}
      <Sheet open={showTranslator} onOpenChange={setShowTranslator}>
        <SheetContent className="w-[340px] bg-[#0f0f11] border-zinc-800" data-testid="translator-sheet">
          <SheetHeader><SheetTitle className="text-zinc-100">Cevirmen</SheetTitle></SheetHeader>
          <div className="space-y-3 mt-4">
            <div className="flex gap-1.5 items-center">
              <Select value={sourceLang} onValueChange={setSourceLang}><SelectTrigger className="w-[90px] h-7 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="EN">English</SelectItem><SelectItem value="TR">Turkce</SelectItem><SelectItem value="AZ">Azerbaycanca</SelectItem><SelectItem value="ES">Espanol</SelectItem><SelectItem value="RU">Rusca</SelectItem></SelectContent></Select>
              <ArrowRight className="w-3 h-3 text-zinc-600" />
              <Select value={targetLang} onValueChange={setTargetLang}><SelectTrigger className="w-[90px] h-7 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="EN">English</SelectItem><SelectItem value="TR">Turkce</SelectItem><SelectItem value="AZ">Azerbaycanca</SelectItem><SelectItem value="ES">Espanol</SelectItem><SelectItem value="RU">Rusca</SelectItem></SelectContent></Select>
            </div>
            <Select value={translationTone} onValueChange={setTranslationTone}><SelectTrigger className="h-7 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="corporate">Kurumsal</SelectItem><SelectItem value="technical">Teknik</SelectItem><SelectItem value="marketing">Pazarlama</SelectItem><SelectItem value="short">Kisa</SelectItem></SelectContent></Select>
            <Textarea value={translateSource} onChange={(e) => setTranslateSource(e.target.value)} rows={4} placeholder="Kaynak metin..." className="text-xs bg-zinc-800 border-zinc-700 text-zinc-100" data-testid="translate-source" />
            <Button onClick={doTranslate} disabled={translating} className="w-full bg-[#004aad] h-8 text-xs" data-testid="translate-btn">
              {translating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Languages className="w-3 h-3 mr-1" />}{translating ? 'Cevriliyor...' : 'Cevir'}
            </Button>
            {translateResult && (<>
              <Textarea value={translateResult} onChange={(e) => setTranslateResult(e.target.value)} rows={4} className="text-xs bg-zinc-800 border-zinc-700 text-zinc-100" data-testid="translate-result" />
              <Button variant="outline" onClick={applyTranslation} className="w-full h-8 text-xs border-zinc-700 text-zinc-300" data-testid="apply-translation">Alana Uygula</Button>
            </>)}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}