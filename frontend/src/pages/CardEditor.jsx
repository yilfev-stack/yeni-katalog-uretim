import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save, Download, Upload, X, Loader2 } from "lucide-react";
import { generateTemplateHTML, DEFAULT_THEME } from "@/lib/templateEngine";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const GREETING_TEXTS = [
  "Yeni yiliniz kutlu olsun! Saglik, mutluluk ve basari dolu bir yil diliyoruz.",
  "Bayramınız mübarek olsun. Ailenizle birlikte sağlık ve huzur içinde nice bayramlar diliyoruz.",
  "Tebrikler! Basarilarinizin devamini diliyoruz.",
  "Dogum gununuz kutlu olsun! Saglik ve mutluluk dolu nice yillar diliyoruz.",
];

const CONDOLENCE_TEXTS = [
  "Merhumun ailesine ve yakinlarina basimiz sagligi diliyoruz. Mekanı cennet olsun.",
  "Kaybiniz icin cok uzgunuz. Basimiz sagligi diliyoruz. Merhumun ruhu sad olsun.",
  "Acili gununuzde yaninizda oldugumuz bilmenizi isteriz. Basimiz sagligi dileriz.",
  "Bu zor gunde sizlerle birlikteyiz. Allahtan rahmet, ailesine sabir diliyoruz.",
];

export default function CardEditor() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [themes, setThemes] = useState([]);
  const [activeTheme, setActiveTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [cardRes, themeRes] = await Promise.all([
          axios.get(`${API}/cards/${cardId}`),
          axios.get(`${API}/themes`)
        ]);
        setCard(cardRes.data);
        setThemes(themeRes.data);
        const t = themeRes.data.find(th => th.id === 'demart-corporate');
        if (t) setActiveTheme(t);
      } catch {
        toast.error("Kart yuklenemedi");
        navigate("/");
      } finally { setLoading(false); }
    };
    fetch();
  }, [cardId, navigate]);

  const updateContent = (field, value) => {
    setCard(prev => ({ ...prev, content: { ...prev.content, [field]: value } }));
  };

  const saveCard = async () => {
    try {
      setSaving(true);
      await axios.put(`${API}/cards/${cardId}`, { content: card.content });
      toast.success("Kaydedildi");
    } catch { toast.error("Kaydedilemedi"); }
    finally { setSaving(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/upload-image`, formData);
      updateContent('image_data', res.data.image_data);
      toast.success("Gorsel yuklendi");
    } catch { toast.error("Gorsel yuklenemedi"); }
  };

  const templateId = card?.card_type === 'condolence' ? 'condolence-card' : 'greeting-card';
  const previewData = card ? { ...card.content, message: card.content?.message, description: card.content?.message || card.content?.description } : {};
  const previewHTML = card ? generateTemplateHTML(templateId, previewData, activeTheme) : '';
  const suggestedTexts = card?.card_type === 'condolence' ? CONDOLENCE_TEXTS : GREETING_TEXTS;

  const doExport = async (format = 'pdf') => {
    if (!previewHTML) return;
    setExporting(true);
    try {
      const endpoint = format === 'pdf' ? `${API}/export/pdf` : `${API}/export/image`;
      const body = {
        html_content: previewHTML, format,
        width: 210, height: 297, is_mm: true, quality: 95
      };
      const res = await axios.post(endpoint, body, { responseType: 'blob', timeout: 60000 });
      const ext = format === 'pdf' ? 'pdf' : 'png';
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a'); link.href = url;
      link.download = `${card?.name || 'kart'}.${ext}`;
      document.body.appendChild(link); link.click(); link.remove();
      toast.success(`${ext.toUpperCase()} indirildi`);
    } catch (err) {
      toast.error("Export basarisiz");
    } finally { setExporting(false); setShowExportDialog(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#004aad] border-t-transparent rounded-full"></div></div>;

  return (
    <div className="h-screen flex flex-col overflow-hidden" data-testid="card-editor-page">
      <header className="bg-white border-b px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} data-testid="back-btn"><ArrowLeft className="w-5 h-5" /></Button>
          <div><h1 className="font-semibold text-sm">{card?.name}</h1><p className="text-xs text-slate-500">{card?.card_type === 'condolence' ? 'Taziye Karti' : 'Tebrik Karti'}</p></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={saveCard} disabled={saving}><Save className="w-4 h-4 mr-1" />{saving ? "..." : "Kaydet"}</Button>
          <Button size="sm" className="bg-[#004aad]" onClick={() => setShowExportDialog(true)}><Download className="w-4 h-4 mr-1" />Disa Aktar</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Preview */}
        <div className="flex-1 canvas-bg overflow-auto flex items-start justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white paper-shadow a4-ratio w-full overflow-hidden" data-testid="card-preview">
              <div dangerouslySetInnerHTML={{ __html: previewHTML }} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="w-[360px] bg-white border-l overflow-y-auto p-4 space-y-4 shrink-0">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">BASLIK</Label>
            <Input value={card?.content?.title || ""} onChange={(e) => updateContent('title', e.target.value)} placeholder={card?.card_type === 'condolence' ? "Baskisagligi" : "Tebrikler!"} data-testid="card-title" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">MESAJ</Label>
            <Textarea value={card?.content?.message || ""} onChange={(e) => updateContent('message', e.target.value)} placeholder="Mesajinizi yazin..." rows={5} data-testid="card-message" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">HAZIR METIN ONERILERI</Label>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {suggestedTexts.map((text, i) => (
                <button key={i} className="w-full text-left p-2 text-xs bg-slate-50 rounded hover:bg-slate-100 border transition-colors" onClick={() => updateContent('message', text)}>
                  {text.substring(0, 80)}...
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">GONDEREN</Label>
            <Input value={card?.content?.from_name || ""} onChange={(e) => updateContent('from_name', e.target.value)} placeholder="Demart Muhendislik" data-testid="card-from" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">ARKA PLAN RENGI</Label>
            <div className="flex gap-2">
              <Input type="color" value={card?.content?.background_color || "#004aad"} onChange={(e) => updateContent('background_color', e.target.value)} className="w-12 h-8 p-1" />
              <Input value={card?.content?.background_color || "#004aad"} onChange={(e) => updateContent('background_color', e.target.value)} className="flex-1" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">METIN RENGI</Label>
            <div className="flex gap-2">
              <Input type="color" value={card?.content?.text_color || "#ffffff"} onChange={(e) => updateContent('text_color', e.target.value)} className="w-12 h-8 p-1" />
              <Input value={card?.content?.text_color || "#ffffff"} onChange={(e) => updateContent('text_color', e.target.value)} className="flex-1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">GORSEL</Label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {card?.content?.image_data ? (
              <div className="relative"><img src={card.content.image_data} alt="" className="w-full h-32 object-contain bg-slate-100 rounded" />
                <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => updateContent('image_data', null)}><X className="w-3 h-3" /></Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" />Gorsel Yukle</Button>
            )}
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Karti Disa Aktar</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => doExport('pdf')} disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2 text-red-500" />}
              <span>PDF (A4)</span>
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => doExport('png')} disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2 text-purple-500" />}
              <span>PNG (Yuksek Kalite)</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
