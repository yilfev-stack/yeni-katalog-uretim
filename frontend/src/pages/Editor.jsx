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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, Plus, Trash2, Copy, Save, Download, Upload, Languages, FileText,
  GripVertical, X, LayoutTemplate, Eye, EyeOff, Lock, Unlock, ChevronUp,
  ChevronDown, Loader2, Image as ImageIcon, Scissors, Palette
} from "lucide-react";
import { TEMPLATES, TEMPLATE_CATEGORIES, generateTemplateHTML, DEFAULT_THEME } from "@/lib/templateEngine";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Editor() {
  const { catalogId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
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

  // Layer management
  const [layers, setLayers] = useState([
    { id: 'background', name: 'Arka Plan', type: 'bg', visible: true, locked: false },
    { id: 'image', name: 'Urun Gorseli', type: 'image', visible: true, locked: false },
    { id: 'title', name: 'Baslik', type: 'text', visible: true, locked: false },
    { id: 'content', name: 'Icerik', type: 'text', visible: true, locked: false },
    { id: 'footer', name: 'Footer', type: 'footer', visible: true, locked: true },
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);

  // Effects
  const [effects, setEffects] = useState({ opacity: 100, shadow: 0, feather: 0, blend: 'normal', grain_enabled: false, grain_intensity: 20 });

  // Translation
  const [translating, setTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState('EN');
  const [targetLang, setTargetLang] = useState('TR');
  const [translationTone, setTranslationTone] = useState('corporate');
  const [translateSource, setTranslateSource] = useState('');
  const [translateResult, setTranslateResult] = useState('');
  const [translateField, setTranslateField] = useState('');

  // Export settings
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportPreset, setExportPreset] = useState('a4-portrait');
  const [exportQuality, setExportQuality] = useState('high');
  const [jpegQuality, setJpegQuality] = useState(90);
  const [batchMode, setBatchMode] = useState(false);
  const [batchPresets, setBatchPresets] = useState({
    'a4-portrait': true, '1080x1080': true, '1080x1350': true, '1200x628': true, '1920x1080': false
  });

  // BG Removal
  const [removingBg, setRemovingBg] = useState(false);
  const [bgProgress, setBgProgress] = useState(0);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, themeRes] = await Promise.all([
        axios.get(`${API}/catalogs/${catalogId}`),
        axios.get(`${API}/themes`)
      ]);
      setCatalog(catRes.data);
      setThemes(themeRes.data);
      const catTheme = themeRes.data.find(t => t.id === catRes.data.theme_id);
      if (catTheme) setActiveTheme(catTheme);
      if (catRes.data.pages?.length > 0 && !selectedPageId) {
        setSelectedPageId(catRes.data.pages[0].id);
      }
    } catch {
      toast.error("Katalog yuklenemedi");
      navigate("/");
    } finally { setLoading(false); }
  }, [catalogId, navigate, selectedPageId]);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  const selectedPage = catalog?.pages?.find(p => p.id === selectedPageId);
  const currentTemplateId = selectedPage?.content?.template_id || 'industrial-product-alert';

  // Generate preview HTML
  const previewHTML = selectedPage ? generateTemplateHTML(currentTemplateId, selectedPage.content, activeTheme, effects) : '';

  const updatePageContent = (field, value) => {
    if (!selectedPage) return;
    setCatalog(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === selectedPageId ? { ...p, content: { ...p.content, [field]: value } } : p)
    }));
  };

  const savePage = async () => {
    if (!selectedPage) return;
    try {
      setSaving(true);
      await axios.put(`${API}/catalogs/${catalogId}/pages/${selectedPageId}`, { content: selectedPage.content });
      toast.success("Kaydedildi");
    } catch { toast.error("Kaydedilemedi"); }
    finally { setSaving(false); }
  };

  const addPage = async () => {
    try {
      const res = await axios.post(`${API}/catalogs/${catalogId}/pages`);
      setCatalog(prev => ({ ...prev, pages: [...prev.pages, res.data] }));
      setSelectedPageId(res.data.id);
      toast.success("Sayfa eklendi");
    } catch { toast.error("Sayfa eklenemedi"); }
  };

  const deletePage = async (pageId) => {
    if (catalog.pages.length <= 1) { toast.error("En az bir sayfa olmali"); return; }
    try {
      await axios.delete(`${API}/catalogs/${catalogId}/pages/${pageId}`);
      setCatalog(prev => ({ ...prev, pages: prev.pages.filter(p => p.id !== pageId) }));
      if (selectedPageId === pageId) setSelectedPageId(catalog.pages.find(p => p.id !== pageId)?.id);
      toast.success("Sayfa silindi");
    } catch { toast.error("Sayfa silinemedi"); }
  };

  const duplicatePage = async (pageId) => {
    try {
      const res = await axios.post(`${API}/catalogs/${catalogId}/pages/${pageId}/duplicate`);
      setCatalog(prev => ({ ...prev, pages: [...prev.pages, res.data] }));
      setSelectedPageId(res.data.id);
      toast.success("Sayfa kopyalandi");
    } catch { toast.error("Kopyalanamadi"); }
  };

  const selectTemplate = (templateId) => {
    updatePageContent('template_id', templateId);
    setShowTemplateDialog(false);
    toast.success("Sablon uygulandi");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast.error("Max 15MB"); return; }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/upload-image`, formData);
      updatePageContent('image_data', res.data.image_data);
      toast.success(`Gorsel yuklendi (${res.data.width}x${res.data.height})`);
    } catch { toast.error("Gorsel yuklenemedi"); }
  };

  const handleRemoveBg = async () => {
    if (!selectedPage?.content?.image_data) { toast.error("Once gorsel yukleyin"); return; }
    setRemovingBg(true);
    setBgProgress(30);
    try {
      const blob = await fetch(selectedPage.content.image_data).then(r => r.blob());
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('feather', String(effects.feather));
      formData.append('shadow', String(effects.shadow > 0));
      formData.append('shadow_opacity', String(effects.shadow));
      setBgProgress(60);
      const res = await axios.post(`${API}/remove-bg`, formData, { timeout: 120000 });
      setBgProgress(90);
      updatePageContent('image_data', res.data.image_data);
      toast.success(res.data.cached ? "Arka plan kaldirildi (onbellekten)" : "Arka plan kaldirildi");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Arka plan kaldirilamadi");
    } finally { setRemovingBg(false); setBgProgress(0); }
  };

  // Translation
  const translateText = async (field) => {
    const text = selectedPage?.content?.[field];
    if (!text) { toast.error("Metin bulunamadi"); return; }
    setTranslateField(field);
    setTranslateSource(Array.isArray(text) ? text.join('\n') : text);
    setShowTranslator(true);
  };

  const doTranslate = async () => {
    if (!translateSource) return;
    setTranslating(true);
    try {
      const res = await axios.post(`${API}/translate`, { text: translateSource, source_lang: sourceLang, target_lang: targetLang, tone: translationTone });
      setTranslateResult(res.data.translated_text);
      toast.success(`Ceviri tamamlandi (${sourceLang} -> ${targetLang})`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Ceviri basarisiz");
    } finally { setTranslating(false); }
  };

  const applyTranslation = () => {
    if (!translateResult || !translateField) return;
    if (translateField === 'bullet_points') {
      updatePageContent(translateField, translateResult.split('\n').filter(Boolean));
    } else {
      updatePageContent(translateField, translateResult);
    }
    setShowTranslator(false);
    toast.success("Ceviri uygulandi");
  };

  // Export
  const doExport = async () => {
    if (!previewHTML) return;
    setExporting(true);
    try {
      if (batchMode) {
        const presets = [];
        if (batchPresets['a4-portrait']) presets.push({ format: 'pdf', width: 210, height: 297, is_mm: true, label: 'A4Portrait' });
        if (batchPresets['1080x1080']) presets.push({ format: 'png', width: 1080, height: 1080, is_mm: false, label: '1080x1080', quality: jpegQuality, optimize: exportQuality === 'web' });
        if (batchPresets['1080x1350']) presets.push({ format: 'png', width: 1080, height: 1350, is_mm: false, label: '1080x1350', quality: jpegQuality, optimize: exportQuality === 'web' });
        if (batchPresets['1200x628']) presets.push({ format: 'png', width: 1200, height: 628, is_mm: false, label: '1200x628', quality: jpegQuality, optimize: exportQuality === 'web' });
        if (batchPresets['1920x1080']) presets.push({ format: 'png', width: 1920, height: 1080, is_mm: false, label: '1920x1080', quality: jpegQuality, optimize: exportQuality === 'web' });
        const res = await axios.post(`${API}/export/batch`, { html_content: previewHTML, presets, catalog_name: catalog?.product_name || catalog?.name || 'export' }, { responseType: 'blob', timeout: 120000 });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a'); link.href = url;
        link.download = `batch_export_${new Date().toISOString().slice(0,10)}.zip`;
        document.body.appendChild(link); link.click(); link.remove();
        toast.success("Toplu export tamamlandi");
      } else {
        const presetMap = {
          'a4-portrait': { w: 210, h: 297, mm: true, land: false },
          'a4-landscape': { w: 297, h: 210, mm: true, land: true },
          '1080x1080': { w: 1080, h: 1080, mm: false },
          '1080x1350': { w: 1080, h: 1350, mm: false },
          '1200x628': { w: 1200, h: 628, mm: false },
          '1920x1080': { w: 1920, h: 1080, mm: false },
        };
        const p = presetMap[exportPreset] || presetMap['a4-portrait'];
        const endpoint = exportFormat === 'pdf' ? `${API}/export/pdf` : `${API}/export/image`;
        const body = {
          html_content: previewHTML, format: exportFormat,
          width: p.w, height: p.h, is_mm: p.mm || false,
          quality: jpegQuality, landscape: p.land || false,
          optimize: exportQuality === 'web'
        };
        const res = await axios.post(endpoint, body, { responseType: 'blob', timeout: 60000 });
        const ext = exportFormat === 'pdf' ? 'pdf' : exportFormat === 'jpg' ? 'jpg' : 'png';
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a'); link.href = url;
        link.download = `${catalog?.product_name || 'export'}_${exportPreset}.${ext}`;
        document.body.appendChild(link); link.click(); link.remove();
        toast.success(`${ext.toUpperCase()} indirildi`);
      }
    } catch (err) {
      toast.error("Export basarisiz: " + (err.response?.data?.detail || err.message));
    } finally { setExporting(false); setShowExportDialog(false); }
  };

  // Layer management
  const moveLayer = (layerId, direction) => {
    const idx = layers.findIndex(l => l.id === layerId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= layers.length) return;
    const newLayers = [...layers];
    [newLayers[idx], newLayers[newIdx]] = [newLayers[newIdx], newLayers[idx]];
    setLayers(newLayers);
  };

  const toggleLayerVisibility = (layerId) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l));
  };

  const toggleLayerLock = (layerId) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, locked: !l.locked } : l));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#004aad] border-t-transparent rounded-full"></div></div>;

  return (
    <div className="h-screen flex flex-col overflow-hidden" data-testid="editor-page">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} data-testid="back-btn"><ArrowLeft className="w-5 h-5" /></Button>
          <div><h1 className="font-semibold text-slate-900 text-sm">{catalog?.name}</h1><p className="text-xs text-slate-500">{catalog?.product_name || ""}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)} data-testid="template-btn"><LayoutTemplate className="w-4 h-4 mr-1" />Sablon</Button>
          <div className="flex items-center gap-1 border rounded px-2 py-1">
            <span className="text-xs text-slate-500">Safe Area</span>
            <Switch checked={showSafeArea} onCheckedChange={setShowSafeArea} className="scale-75" />
          </div>
          <Select value={activeTheme.id || 'demart-corporate'} onValueChange={(v) => { const t = themes.find(th => th.id === v); if (t) setActiveTheme(t); }}>
            <SelectTrigger className="w-[150px] h-8 text-xs"><Palette className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>{themes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setShowTranslator(true)} data-testid="translator-btn"><Languages className="w-4 h-4 mr-1" />Cevirmen</Button>
          <Button variant="outline" size="sm" onClick={savePage} disabled={saving} data-testid="save-btn"><Save className="w-4 h-4 mr-1" />{saving ? "..." : "Kaydet"}</Button>
          <Button size="sm" className="bg-[#004aad] hover:bg-[#003c8f]" onClick={() => setShowExportDialog(true)} data-testid="export-btn"><Download className="w-4 h-4 mr-1" />Disa Aktar</Button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Pages */}
        <div className="w-48 bg-slate-50 border-r flex flex-col shrink-0">
          <div className="p-2 border-b"><Button variant="outline" size="sm" className="w-full" onClick={addPage} data-testid="add-page-btn"><Plus className="w-4 h-4 mr-1" />Sayfa Ekle</Button></div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {catalog?.pages?.sort((a, b) => a.order - b.order).map((page, idx) => (
                <div key={page.id} className={`group relative rounded border bg-white p-2 cursor-pointer transition-all ${selectedPageId === page.id ? 'border-[#004aad] ring-2 ring-[#004aad]/20' : 'border-slate-200 hover:border-slate-300'}`}
                  onClick={() => setSelectedPageId(page.id)} data-testid={`page-${idx}`}>
                  <div className="flex items-center gap-1 mb-1"><GripVertical className="w-3 h-3 text-slate-400" /><span className="text-xs font-medium text-slate-500">Sayfa {idx + 1}</span></div>
                  <div className="a4-ratio bg-slate-100 rounded overflow-hidden mb-1 border">
                    <div className="h-full flex flex-col"><div className="h-1.5 bg-[#004aad]"></div><div className="flex-1 flex"><div className="w-1/2 p-1 bg-slate-50"><div className="h-0.5 w-4/5 bg-[#004aad] rounded mb-0.5"></div><div className="h-0.5 w-full bg-slate-300 rounded"></div></div><div className="w-1/2 bg-slate-200"></div></div></div>
                  </div>
                  <p className="text-[8px] text-slate-400 truncate">{TEMPLATES.find(t => t.id === (page.content?.template_id))?.name || 'Sablon'}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 absolute top-1 right-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); duplicatePage(page.id); }}><Copy className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={(e) => { e.stopPropagation(); deletePage(page.id); }} disabled={catalog.pages.length <= 1}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 canvas-bg overflow-auto flex flex-col">
          <div className="flex-1 p-6 flex items-start justify-center">
            <div className="relative max-w-2xl w-full">
              <div ref={previewRef} className="bg-white paper-shadow a4-ratio w-full overflow-hidden relative" data-testid="canvas-preview">
                <div dangerouslySetInnerHTML={{ __html: previewHTML }} style={{ width: '100%', height: '100%' }} />
                {showSafeArea && <div className="safe-area-overlay"></div>}
              </div>
            </div>
          </div>

          {/* Layer Panel */}
          <div className="bg-white border-t p-3 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">LAYER PANELI</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {layers.map(layer => (
                <div key={layer.id} className={`layer-item flex items-center gap-1 px-2 py-1 border rounded text-xs cursor-pointer ${selectedLayerId === layer.id ? 'selected' : ''}`}
                  onClick={() => setSelectedLayerId(layer.id)}>
                  <button onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }} className="text-slate-400 hover:text-slate-600">
                    {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }} className="text-slate-400 hover:text-slate-600">
                    {layer.locked ? <Lock className="w-3 h-3 text-red-400" /> : <Unlock className="w-3 h-3" />}
                  </button>
                  <span className={`${!layer.visible ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{layer.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); }} className="text-slate-400 hover:text-slate-600"><ChevronUp className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); }} className="text-slate-400 hover:text-slate-600"><ChevronDown className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Properties */}
        <div className="w-[380px] bg-white border-l flex flex-col shrink-0 h-full">
          <div className="p-3 border-b bg-slate-50 shrink-0">
            <h2 className="font-semibold text-slate-900 text-sm">Sayfa Ozellikleri</h2>
          </div>
          <ScrollArea className="flex-1">
            {selectedPage && (
              <div className="p-4 space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600">BASLIK</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => translateText('title')}><Languages className="w-3 h-3 mr-1" />Cevir</Button>
                  </div>
                  <Input value={selectedPage.content?.title || ""} onChange={(e) => updatePageContent('title', e.target.value)} placeholder="Urun basligi" data-testid="input-title" />
                </div>

                {/* Subtitle */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">ALT BASLIK</Label>
                  <Input value={selectedPage.content?.subtitle || ""} onChange={(e) => updatePageContent('subtitle', e.target.value)} placeholder="Alt baslik" data-testid="input-subtitle" />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600">ACIKLAMA</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => translateText('description')}><Languages className="w-3 h-3 mr-1" />Cevir</Button>
                  </div>
                  <Textarea value={selectedPage.content?.description || ""} onChange={(e) => updatePageContent('description', e.target.value)} placeholder="Detayli aciklama" rows={4} data-testid="input-desc" />
                </div>

                {/* Bullet Points */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600">TEKNIK OZELLIKLER</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => translateText('bullet_points')}><Languages className="w-3 h-3 mr-1" />Cevir</Button>
                  </div>
                  <Textarea value={(selectedPage.content?.bullet_points || []).join('\n')} onChange={(e) => updatePageContent('bullet_points', e.target.value.split('\n').filter(Boolean))} placeholder="Her satira bir ozellik" rows={4} data-testid="input-bullets" />
                </div>

                {/* Applications */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600">UYGULAMA ALANLARI</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => translateText('applications')}><Languages className="w-3 h-3 mr-1" />Cevir</Button>
                  </div>
                  <Textarea value={selectedPage.content?.applications || ""} onChange={(e) => updatePageContent('applications', e.target.value)} placeholder="Petrokimya, rafineriler..." rows={2} data-testid="input-apps" />
                </div>

                {/* Key Benefits */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600">TEMEL AVANTAJLAR</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => translateText('key_benefits')}><Languages className="w-3 h-3 mr-1" />Cevir</Button>
                  </div>
                  <Textarea value={selectedPage.content?.key_benefits || ""} onChange={(e) => updatePageContent('key_benefits', e.target.value)} placeholder="Yuksek hassasiyet, uzun omur..." rows={2} data-testid="input-benefits" />
                </div>

                {/* CTA */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">CTA BUTONU</Label>
                  <Input value={selectedPage.content?.cta_text || ""} onChange={(e) => updatePageContent('cta_text', e.target.value)} placeholder="Detayli Bilgi Alin" data-testid="input-cta" />
                </div>

                <Separator />

                {/* Image */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">URUN GORSELI</Label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" data-testid="file-input" />
                  {!selectedPage.content?.image_data ? (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-[#004aad] transition-colors" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-sm text-slate-500">Gorsel Yukle</p><p className="text-xs text-slate-400">PNG, JPG, SVG (max 15MB)</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative aspect-video bg-slate-100 rounded overflow-hidden">
                        <img src={selectedPage.content.image_data} alt="" className="w-full h-full object-contain" />
                        <div className="absolute top-1 right-1 flex gap-1">
                          <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => fileInputRef.current?.click()}><Upload className="w-3 h-3" /></Button>
                          <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => updatePageContent('image_data', null)}><X className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Select value={selectedPage.content?.image_fit || 'cover'} onValueChange={(v) => updatePageContent('image_fit', v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="cover">Kapla</SelectItem><SelectItem value="contain">Sigdir</SelectItem><SelectItem value="fill">Doldur</SelectItem></SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={handleRemoveBg} disabled={removingBg} data-testid="remove-bg-btn">
                          {removingBg ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />{bgProgress}%</> : <><Scissors className="w-3 h-3 mr-1" />Arka Plan Sil</>}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Effects */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-slate-600">EFEKTLER</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Feathering</span><span className="text-xs text-slate-400">{effects.feather}px</span></div>
                    <Slider value={[effects.feather]} onValueChange={([v]) => setEffects(p => ({...p, feather: v}))} max={20} step={1} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Shadow</span><span className="text-xs text-slate-400">{effects.shadow}%</span></div>
                    <Slider value={[effects.shadow]} onValueChange={([v]) => setEffects(p => ({...p, shadow: v}))} max={100} step={5} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Grain Overlay</span>
                    <Switch checked={effects.grain_enabled} onCheckedChange={(v) => setEffects(p => ({...p, grain_enabled: v}))} className="scale-75" />
                  </div>
                  {effects.grain_enabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Grain Yogunluk</span><span className="text-xs text-slate-400">{effects.grain_intensity}%</span></div>
                      <Slider value={[effects.grain_intensity]} onValueChange={([v]) => setEffects(p => ({...p, grain_intensity: v}))} max={50} step={2} />
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-slate-500">Blend Mode</span>
                    <Select value={effects.blend} onValueChange={(v) => setEffects(p => ({...p, blend: v}))}>
                      <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem><SelectItem value="multiply">Multiply</SelectItem>
                        <SelectItem value="screen">Screen</SelectItem><SelectItem value="overlay">Overlay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto" data-testid="template-dialog" aria-describedby="template-desc">
          <DialogHeader><DialogTitle>Sablon Sec</DialogTitle></DialogHeader>
          <p id="template-desc" className="sr-only">Sayfa icin sablon secin</p>
          <div className="flex gap-2 mb-4 flex-wrap">{TEMPLATE_CATEGORIES.map(cat => (
            <Button key={cat.id} variant={templateCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setTemplateCategory(cat.id)}>{cat.name}</Button>
          ))}</div>
          <div className="grid grid-cols-2 gap-4">
            {TEMPLATES.filter(t => templateCategory === 'all' || t.category === templateCategory).map(template => (
              <div key={template.id} className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${currentTemplateId === template.id ? 'border-[#004aad] ring-2 ring-[#004aad]/20' : 'border-slate-200'}`}
                onClick={() => selectTemplate(template.id)} data-testid={`template-${template.id}`}>
                <div className="a4-ratio bg-slate-100 rounded overflow-hidden mb-2 border">
                  <div className="template-preview-frame" style={{ transform: 'scale(0.18)', transformOrigin: 'top left', width: '794px', height: '1123px' }}
                    dangerouslySetInnerHTML={{ __html: generateTemplateHTML(template.id, selectedPage?.content || { title: template.name, subtitle: template.description }, activeTheme) }} />
                </div>
                <h3 className="font-medium text-sm">{template.name}</h3>
                <p className="text-xs text-slate-500">{template.description}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md" data-testid="export-dialog">
          <DialogHeader><DialogTitle>Disa Aktar</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Mod:</span>
              <Button variant={!batchMode ? "default" : "outline"} size="sm" onClick={() => setBatchMode(false)}>Tekli</Button>
              <Button variant={batchMode ? "default" : "outline"} size="sm" onClick={() => setBatchMode(true)}>Toplu (Batch)</Button>
            </div>
            {!batchMode ? (
              <>
                <div><Label className="text-xs">Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="pdf">PDF</SelectItem><SelectItem value="png">PNG</SelectItem><SelectItem value="jpg">JPG</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Boyut</Label>
                  <Select value={exportPreset} onValueChange={setExportPreset}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4-portrait">A4 Dikey (210x297mm)</SelectItem>
                      <SelectItem value="a4-landscape">A4 Yatay (297x210mm)</SelectItem>
                      <SelectItem value="1080x1080">1080x1080 Instagram Kare</SelectItem>
                      <SelectItem value="1080x1350">1080x1350 Instagram Story</SelectItem>
                      <SelectItem value="1200x628">1200x628 LinkedIn/Facebook</SelectItem>
                      <SelectItem value="1920x1080">1920x1080 Sunum/Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                {Object.entries(batchPresets).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={val} onChange={(e) => setBatchPresets(p => ({...p, [key]: e.target.checked}))} className="rounded" />
                    {key === 'a4-portrait' ? 'PDF A4 Portrait' : `PNG ${key}`}
                  </label>
                ))}
              </div>
            )}
            <div><Label className="text-xs">Kalite</Label>
              <Select value={exportQuality} onValueChange={setExportQuality}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="high">Yuksek Kalite (baski)</SelectItem><SelectItem value="web">Web Optimize (kucuk dosya)</SelectItem></SelectContent>
              </Select>
            </div>
            {(exportFormat === 'jpg' || batchMode) && (
              <div><div className="flex justify-between"><Label className="text-xs">JPEG Kalite</Label><span className="text-xs text-slate-400">{jpegQuality}%</span></div>
                <Slider value={[jpegQuality]} onValueChange={([v]) => setJpegQuality(v)} min={60} max={100} step={5} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>Iptal</Button>
            <Button className="bg-[#004aad]" onClick={doExport} disabled={exporting} data-testid="do-export-btn">
              {exporting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Hazirlaniyor...</> : <><Download className="w-4 h-4 mr-2" />Disa Aktar</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Translator Sheet */}
      <Sheet open={showTranslator} onOpenChange={setShowTranslator}>
        <SheetContent className="w-[400px]" data-testid="translator-sheet">
          <SheetHeader><SheetTitle>Cevirmen</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="flex gap-2 items-center">
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="EN">English</SelectItem><SelectItem value="TR">Turkce</SelectItem><SelectItem value="RU">Rusca</SelectItem><SelectItem value="ES">Espanol</SelectItem><SelectItem value="AZ">Azerbaycanca</SelectItem></SelectContent>
              </Select>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="EN">English</SelectItem><SelectItem value="TR">Turkce</SelectItem><SelectItem value="RU">Rusca</SelectItem><SelectItem value="ES">Espanol</SelectItem><SelectItem value="AZ">Azerbaycanca</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Ton</Label>
              <Select value={translationTone} onValueChange={setTranslationTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporate">Kurumsal</SelectItem><SelectItem value="technical">Teknik</SelectItem>
                  <SelectItem value="marketing">Pazarlama</SelectItem><SelectItem value="short">Kisa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Kaynak Metin</Label><Textarea value={translateSource} onChange={(e) => setTranslateSource(e.target.value)} rows={5} data-testid="translate-source" /></div>
            <Button onClick={doTranslate} disabled={translating} className="w-full bg-[#004aad]" data-testid="translate-btn">
              {translating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cevriliyor...</> : <><Languages className="w-4 h-4 mr-2" />Cevir</>}
            </Button>
            {translateResult && (
              <>
                <div><Label className="text-xs">Ceviri Sonucu</Label><Textarea value={translateResult} onChange={(e) => setTranslateResult(e.target.value)} rows={5} data-testid="translate-result" /></div>
                <Button variant="outline" onClick={applyTranslation} className="w-full" data-testid="apply-translation">{translateField ? `"${translateField}" Alanina Uygula` : 'Uygula'}</Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
