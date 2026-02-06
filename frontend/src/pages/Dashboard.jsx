import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, FileText, Copy, Trash2, Tag, Heart, Download,
  Upload, BookOpen, LayoutGrid, ArrowRight, FolderOpen, Clock, Layers
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [catalogs, setCatalogs] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showNewCardDialog, setShowNewCardDialog] = useState(false);
  const [newCatalog, setNewCatalog] = useState({ name: "", product_name: "", tags: [] });
  const [newCardType, setNewCardType] = useState("greeting");
  const [newCardName, setNewCardName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("catalogs");

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [catRes, cardRes, tagRes] = await Promise.all([
        axios.get(`${API}/catalogs${searchTerm ? `?search=${searchTerm}` : ''}${selectedTag ? `${searchTerm ? '&' : '?'}tag=${selectedTag}` : ''}`),
        axios.get(`${API}/cards`),
        axios.get(`${API}/tags`).catch(() => ({ data: [] }))
      ]);
      setCatalogs(catRes.data);
      setCards(cardRes.data);
      setTags(tagRes.data);
    } catch { toast.error("Veriler yuklenemedi"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [searchTerm, selectedTag]);

  const handleCreateCatalog = async () => {
    if (!newCatalog.name.trim()) { toast.error("Katalog adi gerekli"); return; }
    try {
      const res = await axios.post(`${API}/catalogs`, newCatalog);
      toast.success("Katalog olusturuldu");
      setShowNewDialog(false);
      setNewCatalog({ name: "", product_name: "", tags: [] });
      navigate(`/editor/${res.data.id}`);
    } catch { toast.error("Olusturulamadi"); }
  };

  const handleCreateCard = async () => {
    if (!newCardName.trim()) { toast.error("Kart adi gerekli"); return; }
    try {
      const res = await axios.post(`${API}/cards`, { name: newCardName, card_type: newCardType });
      toast.success("Kart olusturuldu");
      setShowNewCardDialog(false);
      setNewCardName("");
      navigate(`/cards/${res.data.id}`);
    } catch { toast.error("Olusturulamadi"); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'catalog') await axios.delete(`${API}/catalogs/${deleteTarget.id}`);
      else await axios.delete(`${API}/cards/${deleteTarget.id}`);
      toast.success("Silindi");
      setShowDeleteDialog(false);
      fetchAll();
    } catch { toast.error("Silinemedi"); }
  };

  const handleBackupExport = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await axios.post(`${API}/backup/export/${id}`, null, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `backup_${id}.zip`;
      document.body.appendChild(a); a.click(); a.remove();
      toast.success("Yedek indirildi");
    } catch { toast.error("Yedek alinamadi"); }
  };

  const handleBackupImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData(); fd.append('file', file); fd.append('mode', 'new');
    try { await axios.post(`${API}/backup/import`, fd); toast.success("Proje yuklendi"); fetchAll(); }
    catch { toast.error("Yuklenemedi"); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  const greetingCards = cards.filter(c => c.card_type === 'greeting');
  const condolenceCards = cards.filter(c => c.card_type === 'condolence');

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100" data-testid="dashboard">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-[#004aad] rounded flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight" style={{fontFamily:'Inter,sans-serif'}}>PRO CREATIVE STUDIO</h1>
              <p className="text-[11px] text-zinc-500">Demart - Katalog Uretim</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input type="file" accept=".zip" onChange={handleBackupImport} className="hidden" data-testid="import-backup-input" />
              <Button variant="outline" size="sm" className="h-8 text-xs border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300" asChild>
                <span><Upload className="w-3.5 h-3.5 mr-1.5" />Proje Yukle</span>
              </Button>
            </label>
            <Button size="sm" className="h-8 text-xs bg-[#004aad] hover:bg-[#003d8f]" onClick={() => setShowNewDialog(true)} data-testid="new-catalog-btn">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Yeni Katalog
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300" onClick={() => setShowNewCardDialog(true)} data-testid="new-card-btn">
              <Heart className="w-3.5 h-3.5 mr-1.5" />Yeni Kart
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: FileText, label: "Katalog", count: catalogs.length, color: "#004aad", tab: "catalogs" },
            { icon: Heart, label: "Tebrik Karti", count: greetingCards.length, color: "#10b981", tab: "greeting" },
            { icon: BookOpen, label: "Taziye Karti", count: condolenceCards.length, color: "#64748b", tab: "condolence" }
          ].map(s => (
            <button key={s.tab} onClick={() => setActiveTab(s.tab)}
              className={`p-5 rounded-lg border transition-all text-left ${activeTab === s.tab ? 'border-[#004aad]/50 bg-[#004aad]/8' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
              data-testid={`stat-${s.tab}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <span className="text-3xl font-bold text-zinc-100">{s.count}</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Proje ara..."
              className="pl-10 h-9 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:border-[#004aad]" data-testid="search-input" />
          </div>
          <Select value={selectedTag || "all"} onValueChange={(v) => setSelectedTag(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[150px] h-9 bg-zinc-900 border-zinc-800 text-zinc-300" data-testid="tag-filter">
              <Tag className="w-3.5 h-3.5 mr-1.5 text-zinc-500" /><SelectValue placeholder="Etiket" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">Tumunu Goster</SelectItem>
              {tags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
            <TabsTrigger value="catalogs" className="data-[state=active]:bg-[#004aad] data-[state=active]:text-white text-zinc-400" data-testid="tab-catalogs">Kataloglar</TabsTrigger>
            <TabsTrigger value="greeting" className="data-[state=active]:bg-[#004aad] data-[state=active]:text-white text-zinc-400" data-testid="tab-greeting">Tebrik Kartlari</TabsTrigger>
            <TabsTrigger value="condolence" className="data-[state=active]:bg-[#004aad] data-[state=active]:text-white text-zinc-400" data-testid="tab-condolence">Taziye Kartlari</TabsTrigger>
          </TabsList>

          <TabsContent value="catalogs">
            {loading ? <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-[#004aad] border-t-transparent rounded-full"></div></div> :
            catalogs.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-zinc-800 rounded-lg">
                <div className="w-16 h-16 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto mb-4"><FileText className="w-8 h-8 text-zinc-600" /></div>
                <p className="text-zinc-400 mb-4">Henuz proje yok</p>
                <Button className="bg-[#004aad] hover:bg-[#003d8f]" onClick={() => setShowNewDialog(true)}><Plus className="w-4 h-4 mr-2" />Ilk Katalogunuzu Olusturun</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="catalog-list">
                {catalogs.map(cat => (
                  <div key={cat.id} className="group border border-zinc-800 bg-zinc-900/50 rounded-lg p-4 cursor-pointer hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                    onClick={() => navigate(`/editor/${cat.id}`)} data-testid={`catalog-${cat.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-zinc-100 truncate">{cat.name}</h3>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{cat.product_name || "Urun belirtilmemis"}</p>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button className="p-1.5 rounded hover:bg-zinc-800" onClick={(e) => handleBackupExport(cat.id, e)}><Download className="w-3.5 h-3.5 text-zinc-500" /></button>
                        <button className="p-1.5 rounded hover:bg-zinc-800" onClick={(e) => { e.stopPropagation(); setDeleteTarget({id:cat.id,type:'catalog'}); setShowDeleteDialog(true); }}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500/70" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
                      <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{cat.pages?.length || 0} sayfa</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(cat.updated_at)}</span>
                    </div>
                    {cat.tags?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">{cat.tags.map(t => <span key={t} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] rounded">{t}</span>)}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {['greeting', 'condolence'].map(type => (
            <TabsContent key={type} value={type}>
              {(type === 'greeting' ? greetingCards : condolenceCards).length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-lg">
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto mb-4">
                    {type === 'greeting' ? <Heart className="w-8 h-8 text-zinc-600" /> : <BookOpen className="w-8 h-8 text-zinc-600" />}
                  </div>
                  <p className="text-zinc-400 mb-4">Henuz kart yok</p>
                  <Button variant="outline" className="border-zinc-700" onClick={() => { setNewCardType(type); setShowNewCardDialog(true); }}>
                    <Plus className="w-4 h-4 mr-2" />{type === 'greeting' ? 'Tebrik' : 'Taziye'} Karti Olustur
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(type === 'greeting' ? greetingCards : condolenceCards).map(card => (
                    <div key={card.id} className="group border border-zinc-800 bg-zinc-900/50 rounded-lg p-4 cursor-pointer hover:border-zinc-700 transition-all"
                      onClick={() => navigate(`/cards/${card.id}`)}>
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm text-zinc-100">{card.name}</h3>
                        <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-800" onClick={(e) => { e.stopPropagation(); setDeleteTarget({id:card.id,type:'card'}); setShowDeleteDialog(true); }}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500/70" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{formatDate(card.updated_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* New Catalog Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800" aria-describedby="new-cat-d" data-testid="new-catalog-dialog">
          <DialogHeader><DialogTitle className="text-zinc-100">Yeni Katalog</DialogTitle></DialogHeader>
          <p id="new-cat-d" className="sr-only">Yeni katalog bilgileri</p>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs text-zinc-400">Katalog Adi *</Label><Input value={newCatalog.name} onChange={(e) => setNewCatalog({...newCatalog, name:e.target.value})} placeholder="Sofis 2026 Katalogu" className="bg-zinc-800 border-zinc-700 text-zinc-100" data-testid="input-catalog-name" /></div>
            <div><Label className="text-xs text-zinc-400">Urun Adi</Label><Input value={newCatalog.product_name} onChange={(e) => setNewCatalog({...newCatalog, product_name:e.target.value})} placeholder="VPI-A Series" className="bg-zinc-800 border-zinc-700 text-zinc-100" data-testid="input-product-name" /></div>
            <div><Label className="text-xs text-zinc-400">Etiketler</Label><Input value={newCatalog.tags.join(", ")} onChange={(e) => setNewCatalog({...newCatalog, tags:e.target.value.split(",").map(t=>t.trim()).filter(Boolean)})} placeholder="endustriyel, vana" className="bg-zinc-800 border-zinc-700 text-zinc-100" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)} className="border-zinc-700 text-zinc-300">Iptal</Button>
            <Button className="bg-[#004aad]" onClick={handleCreateCatalog} data-testid="create-catalog-btn">Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Card Dialog */}
      <Dialog open={showNewCardDialog} onOpenChange={setShowNewCardDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800" aria-describedby="new-card-d" data-testid="new-card-dialog">
          <DialogHeader><DialogTitle className="text-zinc-100">Yeni Kart</DialogTitle></DialogHeader>
          <p id="new-card-d" className="sr-only">Yeni kart bilgileri</p>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs text-zinc-400">Kart Adi *</Label><Input value={newCardName} onChange={(e) => setNewCardName(e.target.value)} placeholder="Yilbasi Tebrik" className="bg-zinc-800 border-zinc-700 text-zinc-100" data-testid="input-card-name" /></div>
            <div><Label className="text-xs text-zinc-400">Tur</Label>
              <Select value={newCardType} onValueChange={setNewCardType}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="greeting">Tebrik</SelectItem><SelectItem value="condolence">Taziye</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCardDialog(false)} className="border-zinc-700 text-zinc-300">Iptal</Button>
            <Button className="bg-[#004aad]" onClick={handleCreateCard} data-testid="create-card-btn">Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800" aria-describedby="del-d">
          <DialogHeader><DialogTitle className="text-zinc-100">Silmek istediginizden emin misiniz?</DialogTitle></DialogHeader>
          <p id="del-d" className="text-zinc-400 text-sm py-2">Bu islem geri alinamaz.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-zinc-700 text-zinc-300">Iptal</Button>
            <Button variant="destructive" onClick={handleDelete} data-testid="confirm-delete">Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
