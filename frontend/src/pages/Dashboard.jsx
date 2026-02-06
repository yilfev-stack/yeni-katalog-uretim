import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, FileText, Copy, Trash2, Tag, Filter, Heart, Download,
  Upload, FolderOpen, Palette, BookOpen, LayoutGrid, ArrowRight
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [catalogs, setCatalogs] = useState([]);
  const [cards, setCards] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [tags, setTags] = useState([]);
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
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedTag) params.append("tag", selectedTag);
      const [catRes, cardRes, assetRes, tagRes] = await Promise.all([
        axios.get(`${API}/catalogs?${params}`),
        axios.get(`${API}/cards`),
        axios.get(`${API}/assets`),
        axios.get(`${API}/tags`).catch(() => ({ data: [] }))
      ]);
      setCatalogs(catRes.data);
      setCards(cardRes.data);
      setAssets(assetRes.data);
      setTags(tagRes.data);
    } catch (error) {
      toast.error("Veriler yuklenemedi");
    } finally {
      setLoading(false);
    }
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
    } catch { toast.error("Katalog olusturulamadi"); }
  };

  const handleCreateCard = async () => {
    if (!newCardName.trim()) { toast.error("Kart adi gerekli"); return; }
    try {
      const res = await axios.post(`${API}/cards`, { name: newCardName, card_type: newCardType });
      toast.success("Kart olusturuldu");
      setShowNewCardDialog(false);
      setNewCardName("");
      navigate(`/cards/${res.data.id}`);
    } catch { toast.error("Kart olusturulamadi"); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'catalog') await axios.delete(`${API}/catalogs/${deleteTarget.id}`);
      else await axios.delete(`${API}/cards/${deleteTarget.id}`);
      toast.success("Silindi");
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      fetchAll();
    } catch { toast.error("Silinemedi"); }
  };

  const handleDuplicate = async (id, type, e) => {
    e.stopPropagation();
    try {
      if (type === 'catalog') await axios.post(`${API}/catalogs/${id}/duplicate`);
      toast.success("Kopyalandi");
      fetchAll();
    } catch { toast.error("Kopyalanamadi"); }
  };

  const handleBackupExport = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await axios.post(`${API}/backup/export/${id}`, null, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${id}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Yedek indirildi");
    } catch { toast.error("Yedek alinamadi"); }
  };

  const handleBackupImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', 'new');
    try {
      await axios.post(`${API}/backup/import`, formData);
      toast.success("Proje yuklendi");
      fetchAll();
    } catch { toast.error("Proje yuklenemedi"); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  const greetingCards = cards.filter(c => c.card_type === 'greeting');
  const condolenceCards = cards.filter(c => c.card_type === 'condolence');

  return (
    <div className="min-h-screen bg-slate-50" data-testid="dashboard">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="https://customer-assets.emergentagent.com/job_ffb90a8b-8cf3-4732-bc1d-c708d6edf43e/artifacts/ruhmwlf7_logo%20sosn.jpg" alt="DEMART" className="h-10 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-slate-900" style={{fontFamily:'Montserrat,sans-serif'}}>PRO CREATIVE STUDIO</h1>
                <p className="text-xs text-slate-500">Sofis Urun Katalog & Kart Yonetimi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input type="file" accept=".zip" onChange={handleBackupImport} className="hidden" data-testid="import-backup-input" />
                <Button variant="outline" size="sm" asChild><span><Upload className="w-4 h-4 mr-1" /> Proje Yukle</span></Button>
              </label>
              <Button size="sm" className="bg-[#004aad] hover:bg-[#003c8f]" onClick={() => setShowNewDialog(true)} data-testid="new-catalog-btn">
                <Plus className="w-4 h-4 mr-1" /> Yeni Katalog
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewCardDialog(true)} data-testid="new-card-btn">
                <Heart className="w-4 h-4 mr-1" /> Yeni Kart
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setActiveTab("catalogs")} data-testid="stat-catalogs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
              <div><p className="text-2xl font-bold text-slate-900">{catalogs.length}</p><p className="text-xs text-slate-500">Katalog</p></div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setActiveTab("greeting")} data-testid="stat-greeting">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Heart className="w-5 h-5 text-green-600" /></div>
              <div><p className="text-2xl font-bold text-slate-900">{greetingCards.length}</p><p className="text-xs text-slate-500">Tebrik Karti</p></div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setActiveTab("condolence")} data-testid="stat-condolence">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><BookOpen className="w-5 h-5 text-slate-600" /></div>
              <div><p className="text-2xl font-bold text-slate-900">{condolenceCards.length}</p><p className="text-xs text-slate-500">Taziye Karti</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border p-3 mb-6 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" data-testid="search-input" />
          </div>
          <Select value={selectedTag || "all"} onValueChange={(v) => setSelectedTag(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px]" data-testid="tag-filter"><Tag className="w-4 h-4 mr-2 text-slate-400" /><SelectValue placeholder="Etiket" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tumunu Goster</SelectItem>
              {tags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="catalogs" data-testid="tab-catalogs">Kataloglar</TabsTrigger>
            <TabsTrigger value="greeting" data-testid="tab-greeting">Tebrik Kartlari</TabsTrigger>
            <TabsTrigger value="condolence" data-testid="tab-condolence">Taziye Kartlari</TabsTrigger>
          </TabsList>

          <TabsContent value="catalogs">
            {loading ? <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-[#004aad] border-t-transparent rounded-full"></div></div> :
            catalogs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border"><FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 mb-4">Henuz katalog yok</p>
                <Button className="bg-[#004aad]" onClick={() => setShowNewDialog(true)}><Plus className="w-4 h-4 mr-2" />Ilk Katalogunuzu Olusturun</Button></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="catalog-list">
                {catalogs.map(cat => (
                  <Card key={cat.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/editor/${cat.id}`)} data-testid={`catalog-${cat.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{cat.name}</CardTitle>
                          <CardDescription className="text-sm truncate">{cat.product_name || "Urun belirtilmemis"}</CardDescription>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleBackupExport(cat.id, e)} data-testid={`backup-${cat.id}`}><Download className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleDuplicate(cat.id, 'catalog', e)}><Copy className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(e) => { e.stopPropagation(); setDeleteTarget({id:cat.id,type:'catalog'}); setShowDeleteDialog(true); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{cat.pages?.length || 0} sayfa</span>
                        <span>v{cat.version || 1}</span>
                      </div>
                      {cat.tags?.length > 0 && <div className="flex flex-wrap gap-1 mb-2">{cat.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>}
                      <p className="text-xs text-slate-400">{formatDate(cat.updated_at)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="greeting">
            {greetingCards.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border"><Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 mb-4">Henuz tebrik karti yok</p>
                <Button variant="outline" onClick={() => { setNewCardType("greeting"); setShowNewCardDialog(true); }}><Plus className="w-4 h-4 mr-2" />Tebrik Karti Olustur</Button></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {greetingCards.map(card => (
                  <Card key={card.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`/cards/${card.id}`)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between"><CardTitle className="text-base">{card.name}</CardTitle>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(e) => { e.stopPropagation(); setDeleteTarget({id:card.id,type:'card'}); setShowDeleteDialog(true); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent><p className="text-xs text-slate-400">{formatDate(card.updated_at)}</p></CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="condolence">
            {condolenceCards.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border"><BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 mb-4">Henuz taziye karti yok</p>
                <Button variant="outline" onClick={() => { setNewCardType("condolence"); setShowNewCardDialog(true); }}><Plus className="w-4 h-4 mr-2" />Taziye Karti Olustur</Button></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {condolenceCards.map(card => (
                  <Card key={card.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`/cards/${card.id}`)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between"><CardTitle className="text-base">{card.name}</CardTitle>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(e) => { e.stopPropagation(); setDeleteTarget({id:card.id,type:'card'}); setShowDeleteDialog(true); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent><p className="text-xs text-slate-400">{formatDate(card.updated_at)}</p></CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* New Catalog Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent data-testid="new-catalog-dialog">
          <DialogHeader><DialogTitle>Yeni Katalog Olustur</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Katalog Adi *</Label><Input value={newCatalog.name} onChange={(e) => setNewCatalog({...newCatalog, name: e.target.value})} placeholder="Sofis 2026 Urun Katalogu" data-testid="input-catalog-name" /></div>
            <div><Label>Urun Adi</Label><Input value={newCatalog.product_name} onChange={(e) => setNewCatalog({...newCatalog, product_name: e.target.value})} placeholder="SOFIS VPI-A Series" data-testid="input-product-name" /></div>
            <div><Label>Etiketler (virgul ile)</Label><Input value={newCatalog.tags.join(", ")} onChange={(e) => setNewCatalog({...newCatalog, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})} placeholder="endustriyel, 2026, vana" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Iptal</Button>
            <Button className="bg-[#004aad]" onClick={handleCreateCatalog} data-testid="create-catalog-btn">Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Card Dialog */}
      <Dialog open={showNewCardDialog} onOpenChange={setShowNewCardDialog}>
        <DialogContent data-testid="new-card-dialog">
          <DialogHeader><DialogTitle>Yeni Kart Olustur</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Kart Adi *</Label><Input value={newCardName} onChange={(e) => setNewCardName(e.target.value)} placeholder="Yilbasi Tebrik Karti" data-testid="input-card-name" /></div>
            <div><Label>Kart Turu</Label>
              <Select value={newCardType} onValueChange={setNewCardType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="greeting">Tebrik Karti</SelectItem>
                  <SelectItem value="condolence">Taziye Karti</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCardDialog(false)}>Iptal</Button>
            <Button className="bg-[#004aad]" onClick={handleCreateCard} data-testid="create-card-btn">Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent><DialogHeader><DialogTitle>Silmek istediginizden emin misiniz?</DialogTitle></DialogHeader>
          <p className="text-slate-600 py-2">Bu islem geri alinamaz.</p>
          <DialogFooter><Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Iptal</Button><Button variant="destructive" onClick={handleDelete} data-testid="confirm-delete">Sil</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
