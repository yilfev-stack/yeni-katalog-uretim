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
import { ArrowLeft, Save, Download, Upload, X, Loader2 } from "lucide-react";
import { generateTemplateHTML, DEFAULT_THEME } from "@/lib/templateEngine";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const GREETING_TEXTS = [
  "Yeni yiliniz kutlu olsun! Saglik, mutluluk ve basari dolu bir yil diliyoruz.",
  "Bayramınız mubarek olsun. Ailenizle birlikte saglik ve huzur icinde nice bayramlar.",
  "Tebrikler! Basarilarinizin devamini diliyoruz.",
];

const CONDOLENCE_TEXTS = [
  "Merhumun ailesine ve yakinlarina basimiz sagligi diliyoruz. Mekani cennet olsun.",
  "Kaybiniz icin cok uzgunuz. Basimiz sagligi diliyoruz.",
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
  const [activeTheme, setActiveTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [cRes, tRes] = await Promise.all([axios.get(`${API}/cards/${cardId}`), axios.get(`${API}/themes`)]);
        setCard(cRes.data);
        const t = tRes.data.find(th => th.id === 'demart-corporate');
        if (t) setActiveTheme(t);
      } catch { toast.error("Yuklenemedi"); navigate("/"); }
      finally { setLoading(false); }
    };
    fetch();
  }, [cardId, navigate]);

  const updateContent = (f, v) => setCard(p => ({...p, content: {...p.content, [f]: v}}));

  const saveCard = async () => {
    try { setSaving(true); await axios.put(`${API}/cards/${cardId}`, {content:card.content}); toast.success("Kaydedildi"); }
    catch { toast.error("Hata"); } finally { setSaving(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const fd = new FormData(); fd.append('file',file); const r = await axios.post(`${API}/upload-image`,fd); updateContent('image_data',r.data.image_data); toast.success("Yuklendi"); }
    catch { toast.error("Hata"); }
  };

  const tid = card?.card_type === 'condolence' ? 'condolence-card' : 'greeting-card';
  const pData = card ? {...card.content, description: card.content?.message || card.content?.description} : {};
  const html = card ? generateTemplateHTML(tid, pData, activeTheme) : '';
  const texts = card?.card_type === 'condolence' ? CONDOLENCE_TEXTS : GREETING_TEXTS;

  const doExport = async (fmt = 'pdf') => {
    if (!html) return; setExporting(true);
    try {
      const ep = fmt==='pdf'?`${API}/export/pdf`:`${API}/export/image`;
      const r = await axios.post(ep, {html_content:html,format:fmt,width:210,height:297,is_mm:true,quality:95},{responseType:'blob',timeout:60000});
      const ext = fmt==='pdf'?'pdf':'png';
      const url = window.URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href=url; a.download=`${card?.name||'kart'}.${ext}`; document.body.appendChild(a); a.click(); a.remove();
      toast.success(`${ext.toUpperCase()} indirildi`);
    } catch { toast.error("Export hatasi"); } finally { setExporting(false); setShowExportDialog(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#004aad] border-t-transparent rounded-full"></div></div>;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#09090b] text-zinc-100" data-testid="card-editor-page">
      <header className="bg-[#09090b] border-b border-zinc-800 px-3 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400" onClick={() => navigate("/")} data-testid="back-btn"><ArrowLeft className="w-4 h-4" /></Button>
          <div><p className="text-sm font-semibold">{card?.name}</p><p className="text-[10px] text-zinc-500">{card?.card_type==='condolence'?'Taziye Karti':'Tebrik Karti'}</p></div>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] border-zinc-700 text-zinc-300" onClick={saveCard} disabled={saving}><Save className="w-3.5 h-3.5 mr-1" />{saving?"...":"Kaydet"}</Button>
          <Button size="sm" className="h-7 text-[11px] bg-[#004aad]" onClick={() => setShowExportDialog(true)}><Download className="w-3.5 h-3.5 mr-1" />Export</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 canvas-bg overflow-auto flex items-start justify-center p-6">
          <div className="max-w-lg w-full"><div className="bg-white paper-shadow a4-ratio w-full overflow-hidden" data-testid="card-preview"><div dangerouslySetInnerHTML={{__html:html}} style={{width:'100%',height:'100%'}} /></div></div>
        </div>

        <div className="w-[300px] bg-[#0f0f11] border-l border-zinc-800 overflow-y-auto p-3 space-y-3 shrink-0">
          <div><Label className="text-[10px] font-semibold text-zinc-500 uppercase">Baslik</Label>
            <Input value={card?.content?.title||""} onChange={(e) => updateContent('title',e.target.value)} className="dense-input bg-zinc-800/50 border-zinc-700 text-zinc-100" data-testid="card-title" /></div>

          <div><Label className="text-[10px] font-semibold text-zinc-500 uppercase">Mesaj</Label>
            <Textarea value={card?.content?.message||""} onChange={(e) => updateContent('message',e.target.value)} rows={4} className="text-xs bg-zinc-800/50 border-zinc-700 text-zinc-100 resize-none" data-testid="card-message" /></div>

          <div><Label className="text-[10px] font-semibold text-zinc-500 uppercase">Hazir Metinler</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {texts.map((t,i) => <button key={i} className="w-full text-left p-1.5 text-[10px] bg-zinc-800/50 rounded border border-zinc-800 hover:border-zinc-700 text-zinc-400 transition-colors" onClick={() => updateContent('message',t)}>{t.substring(0,60)}...</button>)}
            </div>
          </div>

          <div><Label className="text-[10px] font-semibold text-zinc-500 uppercase">Gonderen</Label>
            <Input value={card?.content?.from_name||""} onChange={(e) => updateContent('from_name',e.target.value)} placeholder="Demart Muhendislik" className="dense-input bg-zinc-800/50 border-zinc-700 text-zinc-100" data-testid="card-from" /></div>

          <div className="flex gap-2">
            <div className="flex-1"><Label className="text-[10px] text-zinc-500">Arka Plan</Label>
              <div className="flex gap-1"><Input type="color" value={card?.content?.background_color||"#004aad"} onChange={(e) => updateContent('background_color',e.target.value)} className="w-8 h-7 p-0.5 bg-zinc-800 border-zinc-700" />
                <Input value={card?.content?.background_color||"#004aad"} onChange={(e) => updateContent('background_color',e.target.value)} className="dense-input bg-zinc-800/50 border-zinc-700 text-zinc-100 flex-1" /></div></div>
            <div className="flex-1"><Label className="text-[10px] text-zinc-500">Metin</Label>
              <div className="flex gap-1"><Input type="color" value={card?.content?.text_color||"#ffffff"} onChange={(e) => updateContent('text_color',e.target.value)} className="w-8 h-7 p-0.5 bg-zinc-800 border-zinc-700" />
                <Input value={card?.content?.text_color||"#ffffff"} onChange={(e) => updateContent('text_color',e.target.value)} className="dense-input bg-zinc-800/50 border-zinc-700 text-zinc-100 flex-1" /></div></div>
          </div>

          <div><Label className="text-[10px] font-semibold text-zinc-500 uppercase">Gorsel</Label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {card?.content?.image_data ? (
              <div className="relative mt-1"><img src={card.content.image_data} alt="" className="w-full h-28 object-contain bg-zinc-800 rounded border border-zinc-700" />
                <button className="absolute top-1 right-1 p-0.5 rounded bg-red-500/70 hover:bg-red-500" onClick={() => updateContent('image_data',null)}><X className="w-3 h-3 text-white" /></button></div>
            ) : <Button variant="outline" size="sm" className="w-full h-7 mt-1 text-[10px] border-zinc-700 text-zinc-400" onClick={() => fileInputRef.current?.click()}><Upload className="w-3 h-3 mr-1" />Gorsel Yukle</Button>}
          </div>
        </div>
      </div>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800" aria-describedby="card-exp-d">
          <DialogHeader><DialogTitle className="text-zinc-100">Karti Disa Aktar</DialogTitle></DialogHeader>
          <p id="card-exp-d" className="sr-only">Export format secin</p>
          <div className="space-y-2 py-2">
            <Button variant="outline" className="w-full justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => doExport('pdf')} disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2 text-red-400" />}PDF (A4)</Button>
            <Button variant="outline" className="w-full justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => doExport('png')} disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2 text-blue-400" />}PNG</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
