from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Form, Body
from fastapi.responses import StreamingResponse, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import base64
import io
import json
import hashlib
import asyncio
import zipfile
from PIL import Image, ImageFilter, ImageOps
import aiofiles
from playwright.async_api import async_playwright

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Try emergentintegrations
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Exports directory
EXPORTS_DIR = ROOT_DIR / "exports"
EXPORTS_DIR.mkdir(exist_ok=True)

# ==================== PLAYWRIGHT BROWSER POOL ====================
_browser = None
_playwright = None

def resolve_chromium_path() -> str:
    env_path = os.environ.get('CHROMIUM_PATH')
    candidates = [
        env_path,
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
    ]

    for c in candidates:
        if c and os.path.isfile(c):
            return c

    raise RuntimeError(
        "Chromium binary bulunamadi. CHROMIUM_PATH ayarlayin veya container icinde /usr/bin/chromium kurulu oldugundan emin olun. "
        "Docker smoke test komutu: docker compose run --rm backend python tests/export_smoke_test.py"
    )


async def get_browser():
    global _browser, _playwright
    if _browser is not None and _browser.is_connected():
        return _browser

    if _playwright is None:
        _playwright = await async_playwright().start()

    chrome_path = resolve_chromium_path()

    launch_profiles = [
        ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-software-rasterizer', '--font-render-hinting=none'],
        ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    ]

    last_err = None
    for args in launch_profiles:
        try:
            _browser = await _playwright.chromium.launch(executable_path=chrome_path, args=args)
            if _browser and _browser.is_connected():
                logger.info(f"Playwright browser launched successfully. binary={chrome_path} args={args}")
                return _browser
        except Exception as e:
            last_err = e
            logger.warning(f"Chromium launch failed with args {args}: {e}")

    raise RuntimeError(f"Playwright browser launch failed after retries. binary={chrome_path} error={last_err}")

async def render_html_to_pdf(html_content: str, width_mm: int = 210, height_mm: int = 297, landscape: bool = False) -> bytes:
    try:
        browser = await get_browser()
    except Exception as e:
        logger.error(f"Browser launch failed: {e}")
        raise HTTPException(500, f"Playwright tarayici baslatilamadi: {str(e)}")
    page = await browser.new_page()
    try:
        await page.set_content(html_content, wait_until='load', timeout=15000)
        await page.wait_for_timeout(300)
        pdf_bytes = await page.pdf(
            width=f'{width_mm}mm',
            height=f'{height_mm}mm',
            print_background=True,
            prefer_css_page_size=True,
            landscape=landscape,
            margin={'top': '0mm', 'right': '0mm', 'bottom': '0mm', 'left': '0mm'}
        )
        return pdf_bytes
    finally:
        await page.close()

async def render_html_to_image(html_content: str, width: int = 1080, height: int = 1080, quality: int = 90, img_format: str = 'png') -> bytes:
    try:
        browser = await get_browser()
    except Exception as e:
        logger.error(f"Browser launch failed: {e}")
        raise HTTPException(500, f"Playwright tarayici baslatilamadi: {str(e)}")
    page = await browser.new_page(viewport={'width': width, 'height': height})
    try:
        await page.set_content(html_content, wait_until='load', timeout=15000)
        await page.wait_for_timeout(300)
        if img_format == 'jpeg' or img_format == 'jpg':
            screenshot = await page.screenshot(type='jpeg', quality=quality, full_page=False)
        else:
            screenshot = await page.screenshot(type='png', full_page=False)
        return screenshot
    finally:
        await page.close()

# ==================== BG REMOVAL CACHE ====================
_bg_cache: Dict[str, str] = {}

# ==================== MODELS ====================

class PageContent(BaseModel):
    model_config = ConfigDict(extra="allow")
    title: str = ""
    subtitle: str = ""
    description: str = ""
    bullet_points: List[str] = []
    applications: str = ""
    key_benefits: str = ""
    cta_text: str = ""
    image_data: Optional[str] = None
    image_fit: str = "cover"
    template_id: str = "industrial-product-alert"
    layers: List[dict] = []
    custom_text_boxes: List[dict] = []
    effects: dict = Field(default_factory=lambda: {"grain_enabled": False, "grain_intensity": 20})

class Page(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order: int = 0
    content: PageContent = Field(default_factory=PageContent)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Catalog(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    product_name: str = ""
    tags: List[str] = []
    template_id: str = "industrial-product-alert"
    theme_id: str = "demart-corporate"
    pages: List[Page] = []
    version: int = 1
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CatalogCreate(BaseModel):
    name: str
    product_name: str = ""
    tags: List[str] = []
    template_id: str = "industrial-product-alert"

class CatalogUpdate(BaseModel):
    name: Optional[str] = None
    product_name: Optional[str] = None
    tags: Optional[List[str]] = None
    theme_id: Optional[str] = None

class CardContent(BaseModel):
    model_config = ConfigDict(extra="allow")
    title: str = ""
    message: str = ""
    from_name: str = ""
    image_data: Optional[str] = None
    background_color: str = "#004aad"
    text_color: str = "#ffffff"
    template_id: str = "greeting-classic"

class Card(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    card_type: str = "greeting"
    content: CardContent = Field(default_factory=CardContent)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Asset(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str = "other"
    file_type: str = "png"
    data: str = ""
    tags: List[str] = []
    size_bytes: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Theme(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    primary_color: str = "#004aad"
    secondary_color: str = "#003c8f"
    accent_color: str = "#f59e0b"
    background_color: str = "#f8fafc"
    text_color: str = "#0f172a"
    heading_font: str = "Montserrat"
    body_font: str = "Open Sans"
    accent_font: str = "Roboto Condensed"
    is_preset: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class GlossaryTerm(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_term: str
    target_term: str
    locked: bool = True
    case_sensitive: bool = True

class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "EN"
    target_lang: str = "TR"
    tone: str = "corporate"

class ExportRequest(BaseModel):
    html_content: str
    format: str = "pdf"
    width: int = 210
    height: int = 297
    quality: int = 90
    is_mm: bool = True
    landscape: bool = False
    optimize: bool = False
    debug_html: bool = False

class BatchExportRequest(BaseModel):
    html_content: str
    presets: List[dict] = []
    catalog_name: str = "export"
    debug_html: bool = False

class ExportRecord(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    catalog_id: str = ""
    card_id: str = ""
    format: str = "pdf"
    size_preset: str = "A4"
    quality: str = "high"
    file_name: str = ""
    file_size: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== DEFAULT THEMES ====================
DEFAULT_THEMES = [
    {"id": "demart-corporate", "name": "Demart Corporate", "primary_color": "#004aad", "secondary_color": "#003c8f", "accent_color": "#f59e0b", "background_color": "#f8fafc", "text_color": "#0f172a", "heading_font": "Montserrat", "body_font": "Open Sans", "accent_font": "Roboto Condensed", "is_preset": True},
    {"id": "dark-tech", "name": "Dark Tech", "primary_color": "#0ea5e9", "secondary_color": "#0f172a", "accent_color": "#22d3ee", "background_color": "#020617", "text_color": "#f8fafc", "heading_font": "Montserrat", "body_font": "Open Sans", "accent_font": "Roboto Condensed", "is_preset": True},
    {"id": "minimal-premium", "name": "Minimal Premium", "primary_color": "#18181b", "secondary_color": "#3f3f46", "accent_color": "#a1a1aa", "background_color": "#ffffff", "text_color": "#18181b", "heading_font": "Montserrat", "body_font": "Open Sans", "accent_font": "Roboto Condensed", "is_preset": True},
    {"id": "industrial-green", "name": "Industrial Green", "primary_color": "#166534", "secondary_color": "#14532d", "accent_color": "#facc15", "background_color": "#f0fdf4", "text_color": "#14532d", "heading_font": "Montserrat", "body_font": "Open Sans", "accent_font": "Roboto Condensed", "is_preset": True},
]

DEFAULT_GLOSSARY = [
    {"id": "g1", "source_term": "EasiDrive", "target_term": "EasiDrive", "locked": True, "case_sensitive": True},
    {"id": "g2", "source_term": "VPI", "target_term": "VPI", "locked": True, "case_sensitive": True},
    {"id": "g3", "source_term": "Netherlocks", "target_term": "Netherlocks", "locked": True, "case_sensitive": True},
    {"id": "g4", "source_term": "Sofis", "target_term": "Sofis", "locked": True, "case_sensitive": True},
    {"id": "g5", "source_term": "Demart", "target_term": "Demart", "locked": True, "case_sensitive": True},
]

# ==================== STARTUP ====================
@app.on_event("startup")
async def startup():
    try:
        cp = resolve_chromium_path()
        logger.info(f"Chromium path resolved at startup: {cp}")
    except Exception as e:
        logger.warning(f"Chromium path resolve warning: {e}")

    # Seed default themes
    for theme in DEFAULT_THEMES:
        existing = await db.themes.find_one({"id": theme["id"]}, {"_id": 0})
        if not existing:
            await db.themes.insert_one(theme)
    # Seed default glossary
    for term in DEFAULT_GLOSSARY:
        existing = await db.glossary.find_one({"id": term["id"]}, {"_id": 0})
        if not existing:
            await db.glossary.insert_one(term)
    # Seed demo projects (only if no catalogs exist)
    cat_count = await db.catalogs.count_documents({})
    if cat_count == 0:
        # Seed A: VPI catalog (3 pages)
        vpi_pages = [
            {"id": str(uuid.uuid4()), "order": 0, "content": {
                "template_id": "industrial-product-alert",
                "title": "SOFIS VPI-A Series", "subtitle": "Valve Position Indicator",
                "description": "VPI, endustriyel vanalarin acik/kapali konumunu guvenli sekilde gosteren mekanik bir cihaztir. ATEX ve IECEx sertifikali olup tehlikeli bolgelerde guvenle kullanilabilir.",
                "bullet_points": ["ATEX / IECEx Sertifikali", "IP67 Koruma Sinifi", "Paslanmaz Celik Govde", "-40C ile +80C Calisma Sicakligi", "NAMUR Sensor Destegi", "Yerinde LED Gosterge"],
                "applications": "Petrol & Gaz, Rafineriler, Petrokimya Tesisleri, LNG/FSU/FPSO",
                "key_benefits": "Yuksek guvenilirlik, kolay montaj, dusuk bakim maliyeti",
                "cta_text": "Detayli Bilgi Icin Bize Ulasin"
            }, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "order": 1, "content": {
                "template_id": "tech-data-sheet",
                "title": "VPI-A Teknik Veri Sayfasi", "subtitle": "Teknik Ozellikler ve Spesifikasyonlar",
                "description": "Netherlocks VPI-A serisi vana konum gostergesi icin detayli teknik bilgiler.",
                "bullet_points": ["Govde: Aluminyum (A) / Paslanmaz (S)", "Agirlik: 1.2 kg (kucuk) / 2.4 kg (buyuk)", "Boyut: 120x80x95 mm", "Mil Capi: 8-55 mm", "Sicaklik: -40C / +80C", "Koruma: IP67"],
                "applications": "Endustriyel vana konum tespiti",
                "key_benefits": "Uzun omur, minimum bakim, kolay montaj"
            }, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "order": 2, "content": {
                "template_id": "clean-industrial-grid",
                "title": "VPI Neden Secilmeli?", "subtitle": "6 Temel Avantaj",
                "bullet_points": ["Kolay Montaj: Tek kisi ile dakikalar icinde", "Dusuk Maliyet: Rakiplere gore %30 ekonomik", "Genis Sicaklik: -40C ile +80C arasi", "IP67 Koruma: Su ve toz gecirmez", "ATEX Sertifika: Tehlikeli bolge onayili", "10 Yil Garanti: Uzun vadeli guvence"],
                "key_benefits": "Endustriyel vana yonetiminde guvenilir cozum"
            }, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()}
        ]
        await db.catalogs.insert_one({
            "id": "seed-vpi-catalog", "name": "Sofis VPI-A Series", "product_name": "Valve Position Indicator",
            "tags": ["sofis", "vpi", "endustriyel"], "template_id": "industrial-product-alert", "theme_id": "demart-corporate",
            "pages": vpi_pages, "version": 1,
            "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()
        })
        # Seed B: Greeting card
        await db.cards.insert_one({
            "id": "seed-greeting", "name": "Yeni Yil Tebrik", "card_type": "greeting",
            "content": {"title": "Mutlu Yillar!", "message": "Yeni yiliniz kutlu olsun!\nSaglik, mutluluk ve basari dolu bir yil diliyoruz.\n\nSaygilarimizla,", "from_name": "Demart Muhendislik", "background_color": "#004aad", "text_color": "#ffffff", "template_id": "greeting-card"},
            "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()
        })
        # Seed C: Condolence card
        await db.cards.insert_one({
            "id": "seed-condolence", "name": "Taziye", "card_type": "condolence",
            "content": {"title": "Baskisagligi", "message": "Merhumun ailesine ve yakinlarina basimiz sagligi diliyoruz.\nMekani cennet olsun.\n\nAllahtan rahmet, ailesine sabir diliyoruz.", "from_name": "Demart Muhendislik Ailesi", "background_color": "#1e293b", "text_color": "#e2e8f0", "template_id": "condolence-card"},
            "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Seed projects created: VPI catalog + greeting + condolence cards")
    logger.info("Startup complete")

# ==================== CATALOG CRUD ====================
@api_router.get("/")
async def root():
    return {"message": "Pro Creative Studio API", "version": "1.0"}

@api_router.get("/catalogs")
async def get_catalogs(search: Optional[str] = None, tag: Optional[str] = None):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"product_name": {"$regex": search, "$options": "i"}}
        ]
    if tag:
        query["tags"] = tag
    catalogs = await db.catalogs.find(query, {"_id": 0}).sort("updated_at", -1).to_list(1000)
    return catalogs

@api_router.post("/catalogs")
async def create_catalog(data: CatalogCreate):
    catalog = Catalog(
        name=data.name, product_name=data.product_name,
        tags=data.tags, template_id=data.template_id,
        pages=[Page(order=0, content=PageContent(template_id=data.template_id))]
    )
    doc = catalog.model_dump()
    await db.catalogs.insert_one(doc)
    doc.pop('_id', None)
    return doc

@api_router.get("/catalogs/{catalog_id}")
async def get_catalog(catalog_id: str):
    cat = await db.catalogs.find_one({"id": catalog_id}, {"_id": 0})
    if not cat:
        raise HTTPException(404, "Katalog bulunamadi")
    return cat

@api_router.put("/catalogs/{catalog_id}")
async def update_catalog(catalog_id: str, update: CatalogUpdate):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.catalogs.update_one({"id": catalog_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Katalog bulunamadi")
    return await db.catalogs.find_one({"id": catalog_id}, {"_id": 0})

@api_router.delete("/catalogs/{catalog_id}")
async def delete_catalog(catalog_id: str):
    result = await db.catalogs.delete_one({"id": catalog_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Katalog bulunamadi")
    return {"message": "Katalog silindi"}

@api_router.post("/catalogs/{catalog_id}/duplicate")
async def duplicate_catalog(catalog_id: str):
    original = await db.catalogs.find_one({"id": catalog_id}, {"_id": 0})
    if not original:
        raise HTTPException(404, "Katalog bulunamadi")
    new_id = str(uuid.uuid4())
    new_pages = []
    for p in original.get('pages', []):
        new_pages.append({**p, "id": str(uuid.uuid4())})
    new_cat = {
        **original, "id": new_id, "name": f"{original['name']} (Kopya)",
        "pages": new_pages, "version": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.catalogs.insert_one(new_cat)
    new_cat.pop('_id', None)
    return new_cat

# ==================== PAGE CRUD ====================
@api_router.post("/catalogs/{catalog_id}/pages")
async def add_page(catalog_id: str):
    cat = await db.catalogs.find_one({"id": catalog_id}, {"_id": 0})
    if not cat:
        raise HTTPException(404, "Katalog bulunamadi")
    max_order = max([p.get('order', 0) for p in cat.get('pages', [])] or [0])
    template_id = cat.get('template_id', 'industrial-product-alert')
    new_page = Page(order=max_order + 1, content=PageContent(template_id=template_id))
    doc = new_page.model_dump()
    await db.catalogs.update_one(
        {"id": catalog_id},
        {"$push": {"pages": doc}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return doc

@api_router.put("/catalogs/{catalog_id}/pages/{page_id}")
async def update_page(catalog_id: str, page_id: str, content: dict = Body(...)):
    cat = await db.catalogs.find_one({"id": catalog_id}, {"_id": 0})
    if not cat:
        raise HTTPException(404, "Katalog bulunamadi")
    page_index = next((i for i, p in enumerate(cat.get('pages', [])) if p.get('id') == page_id), None)
    if page_index is None:
        raise HTTPException(404, "Sayfa bulunamadi")
    now = datetime.now(timezone.utc).isoformat()
    await db.catalogs.update_one(
        {"id": catalog_id},
        {"$set": {f"pages.{page_index}.content": content.get('content', content), f"pages.{page_index}.updated_at": now, "updated_at": now}}
    )
    updated = await db.catalogs.find_one({"id": catalog_id}, {"_id": 0})
    return updated['pages'][page_index]

@api_router.delete("/catalogs/{catalog_id}/pages/{page_id}")
async def delete_page(catalog_id: str, page_id: str):
    cat = await db.catalogs.find_one({"id": catalog_id}, {"_id": 0})
    if not cat:
        raise HTTPException(404, "Katalog bulunamadi")
    if len(cat.get('pages', [])) <= 1:
        raise HTTPException(400, "En az bir sayfa olmali")
    await db.catalogs.update_one(
        {"id": catalog_id},
        {"$pull": {"pages": {"id": page_id}}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Sayfa silindi"}

@api_router.post("/catalogs/{catalog_id}/pages/{page_id}/duplicate")
async def duplicate_page(catalog_id: str, page_id: str):
    cat = await db.catalogs.find_one({"id": catalog_id}, {"_id": 0})
    if not cat:
        raise HTTPException(404, "Katalog bulunamadi")
    original = next((p for p in cat.get('pages', []) if p.get('id') == page_id), None)
    if not original:
        raise HTTPException(404, "Sayfa bulunamadi")
    max_order = max([p.get('order', 0) for p in cat.get('pages', [])])
    new_page = {**original, "id": str(uuid.uuid4()), "order": max_order + 1, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.catalogs.update_one(
        {"id": catalog_id},
        {"$push": {"pages": new_page}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return new_page

# ==================== CARD CRUD ====================
@api_router.get("/cards")
async def get_cards(card_type: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if card_type:
        query["card_type"] = card_type
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    return await db.cards.find(query, {"_id": 0}).sort("updated_at", -1).to_list(1000)

@api_router.post("/cards")
async def create_card(data: dict = Body(...)):
    card = Card(name=data.get('name', 'Yeni Kart'), card_type=data.get('card_type', 'greeting'))
    if data.get('card_type') == 'condolence':
        card.content.background_color = "#1e293b"
        card.content.template_id = "condolence-classic"
    doc = card.model_dump()
    await db.cards.insert_one(doc)
    doc.pop('_id', None)
    return doc

@api_router.get("/cards/{card_id}")
async def get_card(card_id: str):
    card = await db.cards.find_one({"id": card_id}, {"_id": 0})
    if not card:
        raise HTTPException(404, "Kart bulunamadi")
    return card

@api_router.put("/cards/{card_id}")
async def update_card(card_id: str, data: dict = Body(...)):
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.cards.update_one({"id": card_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(404, "Kart bulunamadi")
    return await db.cards.find_one({"id": card_id}, {"_id": 0})

@api_router.delete("/cards/{card_id}")
async def delete_card(card_id: str):
    result = await db.cards.delete_one({"id": card_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Kart bulunamadi")
    return {"message": "Kart silindi"}

# ==================== ASSET CRUD ====================
@api_router.get("/assets")
async def get_assets(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    assets = await db.assets.find(query, {"_id": 0, "data": 0}).sort("created_at", -1).to_list(1000)
    return assets

@api_router.get("/assets/{asset_id}")
async def get_asset(asset_id: str):
    asset = await db.assets.find_one({"id": asset_id}, {"_id": 0})
    if not asset:
        raise HTTPException(404, "Asset bulunamadi")
    return asset

@api_router.post("/assets")
async def upload_asset(file: UploadFile = File(...), name: str = Form(""), category: str = Form("other"), tags: str = Form("")):
    contents = await file.read()
    b64 = base64.b64encode(contents).decode('utf-8')
    ext = file.filename.rsplit('.', 1)[-1].lower() if file.filename else 'png'
    mime = f"image/{ext}" if ext != 'svg' else "image/svg+xml"
    data_uri = f"data:{mime};base64,{b64}"
    asset = Asset(
        name=name or file.filename or "asset",
        category=category, file_type=ext,
        data=data_uri, size_bytes=len(contents),
        tags=[t.strip() for t in tags.split(',') if t.strip()]
    )
    doc = asset.model_dump()
    await db.assets.insert_one(doc)
    doc.pop('_id', None)
    return {k: v for k, v in doc.items() if k != 'data'}

@api_router.delete("/assets/{asset_id}")
async def delete_asset(asset_id: str):
    result = await db.assets.delete_one({"id": asset_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Asset bulunamadi")
    return {"message": "Asset silindi"}

# ==================== THEME CRUD ====================
@api_router.get("/themes")
async def get_themes():
    return await db.themes.find({}, {"_id": 0}).to_list(100)

@api_router.post("/themes")
async def create_theme(data: dict = Body(...)):
    theme = Theme(**data)
    doc = theme.model_dump()
    await db.themes.insert_one(doc)
    doc.pop('_id', None)
    return doc

@api_router.put("/themes/{theme_id}")
async def update_theme(theme_id: str, data: dict = Body(...)):
    data.pop('_id', None)
    result = await db.themes.update_one({"id": theme_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(404, "Tema bulunamadi")
    return await db.themes.find_one({"id": theme_id}, {"_id": 0})

@api_router.delete("/themes/{theme_id}")
async def delete_theme(theme_id: str):
    theme = await db.themes.find_one({"id": theme_id}, {"_id": 0})
    if theme and theme.get('is_preset'):
        raise HTTPException(400, "Hazir tema silinemez")
    result = await db.themes.delete_one({"id": theme_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Tema bulunamadi")
    return {"message": "Tema silindi"}

# ==================== GLOSSARY CRUD ====================
@api_router.get("/glossary")
async def get_glossary():
    return await db.glossary.find({}, {"_id": 0}).to_list(500)

@api_router.post("/glossary")
async def add_glossary_term(data: dict = Body(...)):
    term = GlossaryTerm(**data)
    doc = term.model_dump()
    await db.glossary.insert_one(doc)
    doc.pop('_id', None)
    return doc

@api_router.put("/glossary/{term_id}")
async def update_glossary_term(term_id: str, data: dict = Body(...)):
    data.pop('_id', None)
    result = await db.glossary.update_one({"id": term_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(404, "Terim bulunamadi")
    return await db.glossary.find_one({"id": term_id}, {"_id": 0})

@api_router.delete("/glossary/{term_id}")
async def delete_glossary_term(term_id: str):
    result = await db.glossary.delete_one({"id": term_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Terim bulunamadi")
    return {"message": "Terim silindi"}

# ==================== IMAGE UPLOAD ====================
@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))
    img = ImageOps.exif_transpose(img)
    original_format = img.format or 'JPEG'
    
    # Preserve PNG with transparency
    if img.mode == 'RGBA' or original_format == 'PNG':
        output = io.BytesIO()
        img.save(output, format='PNG', optimize=True)
        output.seek(0)
        b64 = base64.b64encode(output.read()).decode('utf-8')
        return {"image_data": f"data:image/png;base64,{b64}", "width": img.width, "height": img.height}
    
    # JPEG - high quality, no unnecessary re-encoding for small files
    if img.mode == 'P':
        img = img.convert('RGB')
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=97, optimize=True)
    output.seek(0)
    b64 = base64.b64encode(output.read()).decode('utf-8')
    return {"image_data": f"data:image/jpeg;base64,{b64}", "width": img.width, "height": img.height}

# ==================== RESIZE IMAGE ====================
@api_router.post("/resize-image")
async def resize_image(file: UploadFile = File(...), width: int = Form(1200), height: int = Form(0), quality: int = Form(90), sharpen: bool = Form(False), output_format: str = Form("jpeg")):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))
    img = ImageOps.exif_transpose(img)
    if height == 0:
        ratio = width / img.width
        height = int(img.height * ratio)
    img = img.resize((width, height), Image.LANCZOS)
    if sharpen:
        img = img.filter(ImageFilter.SHARPEN)
    output = io.BytesIO()
    if output_format == 'png':
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        img.save(output, format='PNG', optimize=True)
        mime = "image/png"
    else:
        if img.mode == 'RGBA':
            bg = Image.new('RGB', img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            img = bg
        img.save(output, format='JPEG', quality=quality, optimize=True)
        mime = "image/jpeg"
    output.seek(0)
    b64 = base64.b64encode(output.read()).decode('utf-8')
    return {"image_data": f"data:{mime};base64,{b64}", "width": width, "height": height, "size": output.tell()}

# ==================== BACKGROUND REMOVAL ====================
@api_router.post("/remove-bg")
async def remove_background(file: UploadFile = File(...), feather: int = Form(0), shadow: bool = Form(False), shadow_opacity: int = Form(40)):
    contents = await file.read()
    file_hash = hashlib.md5(contents).hexdigest()
    cache_key = f"{file_hash}_{feather}_{shadow}_{shadow_opacity}"
    if cache_key in _bg_cache:
        return {"image_data": _bg_cache[cache_key], "cached": True}
    try:
        from rembg import remove
        img = Image.open(io.BytesIO(contents))
        img = ImageOps.exif_transpose(img)
        result = remove(img)
        if feather > 0:
            alpha = result.split()[3]
            alpha = alpha.filter(ImageFilter.GaussianBlur(radius=feather))
            result.putalpha(alpha)
        if shadow:
            shadow_layer = Image.new('RGBA', result.size, (0, 0, 0, 0))
            shadow_img = result.copy()
            shadow_alpha = shadow_img.split()[3]
            s_opacity = int(255 * shadow_opacity / 100)
            shadow_alpha = shadow_alpha.point(lambda p: min(p, s_opacity))
            shadow_color = Image.new('RGBA', result.size, (0, 0, 0, 255))
            shadow_color.putalpha(shadow_alpha)
            shadow_color = shadow_color.filter(ImageFilter.GaussianBlur(radius=8))
            from PIL import ImageChops
            offset = (5, 5)
            canvas = Image.new('RGBA', (result.width + 10, result.height + 10), (0, 0, 0, 0))
            canvas.paste(shadow_color, offset)
            canvas.paste(result, (0, 0), result)
            result = canvas
        output = io.BytesIO()
        result.save(output, format='PNG', optimize=True)
        output.seek(0)
        b64 = base64.b64encode(output.read()).decode('utf-8')
        data_uri = f"data:image/png;base64,{b64}"
        _bg_cache[cache_key] = data_uri
        return {"image_data": data_uri, "cached": False, "width": result.width, "height": result.height}
    except ImportError:
        raise HTTPException(503, "rembg kurulu degil. pip install rembg ile kurun.")
    except Exception as e:
        logger.error(f"BG removal error: {e}")
        raise HTTPException(500, f"Arka plan kaldirma hatasi: {str(e)}")

# ==================== TRANSLATION ====================
TONES = {
    "corporate": "Resmi, profesyonel kurumsal dil kullan. Kisa ve net cumleler tercih et.",
    "technical": "Muhendislik ve teknik terminoloji kullan. Teknik dogruluk oncelikli.",
    "marketing": "Satisa yonelik, ikna edici ve cekici dil kullan. Aksiyon odakli.",
    "short": "Cok kisa ve ozetleyici cevir. Baslik tarzi, minimum kelime."
}

@api_router.post("/translate")
async def translate_text(req: TranslateRequest):
    if req.source_lang == req.target_lang:
        return {"translated_text": req.text}
    glossary = await db.glossary.find({"locked": True}, {"_id": 0}).to_list(500)
    placeholders = {}
    text = req.text
    for i, term in enumerate(glossary):
        src = term['source_term']
        ph = f"__GLOSS_{i}__"
        if term.get('case_sensitive', True):
            if src in text:
                placeholders[ph] = term['target_term']
                text = text.replace(src, ph)
        else:
            import re
            pattern = re.compile(re.escape(src), re.IGNORECASE)
            if pattern.search(text):
                placeholders[ph] = term['target_term']
                text = pattern.sub(ph, text)
    lang_names = {'EN': 'English', 'TR': 'Turkce', 'RU': 'Rusca', 'ES': 'Ispanyolca', 'AZ': 'Azerbaycanca'}
    src_name = lang_names.get(req.source_lang.upper(), req.source_lang)
    tgt_name = lang_names.get(req.target_lang.upper(), req.target_lang)
    tone_instruction = TONES.get(req.tone, TONES['corporate'])
    system_prompt = f"Sen profesyonel bir cevirmensin. {src_name} dilinden {tgt_name} diline ceviri yap. {tone_instruction} Sadece ceviriyi dondur, baska bir sey ekleme. __GLOSS_X__ formatindaki yer tutucularini AYNEN koru, cevirme."
    emergent_key = os.environ.get('EMERGENT_LLM_KEY')
    if not emergent_key or not EMERGENT_AVAILABLE:
        raise HTTPException(503, "Ceviri servisi yapilandirilmamis. EMERGENT_LLM_KEY gerekli.")
    try:
        chat = LlmChat(api_key=emergent_key, session_id=str(uuid.uuid4()), system_message=system_prompt).with_model("openai", "gpt-4o-mini")
        response = await chat.send_message(UserMessage(text=f"Cevir:\n{text}"))
        translated = response
        for ph, replacement in placeholders.items():
            translated = translated.replace(ph, replacement)
        return {"translated_text": translated}
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(500, f"Ceviri hatasi: {str(e)}")

@api_router.get("/translation-languages")
async def get_translation_languages():
    return {"languages": {"EN": "English", "TR": "Turkce", "RU": "Rusca", "ES": "Espanol", "AZ": "Azerbaycanca"}}

# ==================== EXPORT ENDPOINTS ====================
@api_router.post("/export/pdf")
async def export_pdf(req: ExportRequest):
    try:
        w = req.width if req.is_mm else int(req.width * 0.264583)
        h = req.height if req.is_mm else int(req.height * 0.264583)
        pdf_bytes = await render_html_to_pdf(req.html_content, w, h, req.landscape)
        record = ExportRecord(format="pdf", size_preset=f"{req.width}x{req.height}", quality="high" if not req.optimize else "web", file_size=len(pdf_bytes))
        await db.export_history.insert_one(record.model_dump())
        file_name = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        try:
            async with aiofiles.open(EXPORTS_DIR / file_name, 'wb') as f:
                await f.write(pdf_bytes)
            if req.debug_html:
                debug_path = EXPORTS_DIR / f"export_debug_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
                async with aiofiles.open(debug_path, 'w', encoding='utf-8') as hf:
                    await hf.write(req.html_content)
        except Exception:
            pass
        return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={file_name}"})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF export error: {e}")
        raise HTTPException(500, f"PDF olusturma hatasi: {str(e)}")

@api_router.post("/export/image")
async def export_image(req: ExportRequest):
    try:
        fmt = 'jpeg' if req.format in ('jpg', 'jpeg') else 'png'
        w = req.width if not req.is_mm else int(req.width * 3.7795)
        h = req.height if not req.is_mm else int(req.height * 3.7795)
        img_bytes = await render_html_to_image(req.html_content, w, h, req.quality, fmt)
        if req.optimize and fmt == 'jpeg':
            img = Image.open(io.BytesIO(img_bytes))
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=75, optimize=True)
            output.seek(0)
            img_bytes = output.read()
        elif req.optimize and fmt == 'png':
            img = Image.open(io.BytesIO(img_bytes))
            output = io.BytesIO()
            img.save(output, format='PNG', optimize=True, compress_level=9)
            output.seek(0)
            img_bytes = output.read()
        mime = "image/jpeg" if fmt == 'jpeg' else "image/png"
        ext = "jpg" if fmt == 'jpeg' else "png"
        file_name = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{ext}"
        try:
            async with aiofiles.open(EXPORTS_DIR / file_name, 'wb') as f:
                await f.write(img_bytes)
            if req.debug_html:
                debug_path = EXPORTS_DIR / f"export_debug_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
                async with aiofiles.open(debug_path, 'w', encoding='utf-8') as hf:
                    await hf.write(req.html_content)
        except Exception:
            pass
        record = ExportRecord(format=ext, size_preset=f"{w}x{h}", quality="web" if req.optimize else "high", file_size=len(img_bytes))
        await db.export_history.insert_one(record.model_dump())
        return StreamingResponse(io.BytesIO(img_bytes), media_type=mime, headers={"Content-Disposition": f"attachment; filename={file_name}"})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image export error: {e}")
        raise HTTPException(500, f"Gorsel olusturma hatasi: {str(e)}")

@api_router.post("/export/batch")
async def export_batch(req: BatchExportRequest):
    zip_buffer = io.BytesIO()
    date_str = datetime.now().strftime('%Y%m%d')
    safe_name = req.catalog_name.replace(' ', '_')[:30]
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        for preset in req.presets:
            fmt = preset.get('format', 'png')
            w = preset.get('width', 1080)
            h = preset.get('height', 1080)
            is_mm = preset.get('is_mm', False)
            label = preset.get('label', f'{w}x{h}')
            optimize = preset.get('optimize', False)
            quality = preset.get('quality', 90)
            if fmt == 'pdf':
                pw = w if is_mm else int(w * 0.264583)
                ph = h if is_mm else int(h * 0.264583)
                data = await render_html_to_pdf(req.html_content, pw, ph, preset.get('landscape', False))
                fname = f"{safe_name}_{date_str}_{label}.pdf"
            else:
                iw = w if not is_mm else int(w * 3.7795)
                ih = h if not is_mm else int(h * 3.7795)
                img_fmt = 'jpeg' if fmt in ('jpg', 'jpeg') else 'png'
                data = await render_html_to_image(req.html_content, iw, ih, quality, img_fmt)
                if optimize:
                    img = Image.open(io.BytesIO(data))
                    output = io.BytesIO()
                    if img_fmt == 'jpeg':
                        img.save(output, format='JPEG', quality=75, optimize=True)
                    else:
                        img.save(output, format='PNG', optimize=True, compress_level=9)
                    output.seek(0)
                    data = output.read()
                ext = 'jpg' if img_fmt == 'jpeg' else 'png'
                fname = f"{safe_name}_{date_str}_{label}.{ext}"
            zf.writestr(fname, data)
    zip_buffer.seek(0)
    zip_name = f"{safe_name}_{date_str}_batch.zip"
    async with aiofiles.open(EXPORTS_DIR / zip_name, 'wb') as f:
        await f.write(zip_buffer.getvalue())
    if req.debug_html:
        debug_path = EXPORTS_DIR / f"export_debug_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        async with aiofiles.open(debug_path, 'w', encoding='utf-8') as hf:
            await hf.write(req.html_content)
    zip_buffer.seek(0)
    return StreamingResponse(zip_buffer, media_type="application/zip", headers={"Content-Disposition": f"attachment; filename={zip_name}"})

# ==================== EXPORT HISTORY ====================
@api_router.get("/export-history")
async def get_export_history(limit: int = 50):
    records = await db.export_history.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return records

# ==================== BACKUP / RESTORE ====================
@api_router.post("/backup/export/{catalog_id}")
async def backup_export(catalog_id: str):
    cat = await db.catalogs.find_one({"id": catalog_id}, {"_id": 0})
    if not cat:
        raise HTTPException(404, "Katalog bulunamadi")
    themes = await db.themes.find({}, {"_id": 0}).to_list(100)
    glossary_terms = await db.glossary.find({}, {"_id": 0}).to_list(500)
    manifest = {"version": "1.0", "created_at": datetime.now(timezone.utc).isoformat(), "app": "Pro Creative Studio"}
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("project.json", json.dumps(cat, ensure_ascii=False, indent=2))
        zf.writestr("themes.json", json.dumps(themes, ensure_ascii=False, indent=2))
        zf.writestr("glossary.json", json.dumps(glossary_terms, ensure_ascii=False, indent=2))
        zf.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2))
    zip_buffer.seek(0)
    safe_name = cat.get('name', 'backup').replace(' ', '_')[:30]
    return StreamingResponse(zip_buffer, media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=backup_{safe_name}_{datetime.now().strftime('%Y%m%d')}.zip"})

@api_router.post("/backup/import")
async def backup_import(file: UploadFile = File(...), mode: str = Form("new")):
    contents = await file.read()
    try:
        with zipfile.ZipFile(io.BytesIO(contents)) as zf:
            project_data = json.loads(zf.read("project.json"))
            themes_data = json.loads(zf.read("themes.json")) if "themes.json" in zf.namelist() else []
            glossary_data = json.loads(zf.read("glossary.json")) if "glossary.json" in zf.namelist() else []
    except Exception as e:
        raise HTTPException(400, f"Gecersiz backup dosyasi: {str(e)}")
    if mode == "new":
        project_data["id"] = str(uuid.uuid4())
        project_data["name"] = f"{project_data.get('name', 'Import')} (Import)"
        for p in project_data.get('pages', []):
            p['id'] = str(uuid.uuid4())
    await db.catalogs.replace_one({"id": project_data["id"]}, project_data, upsert=True)
    for theme in themes_data:
        if not theme.get('is_preset'):
            await db.themes.replace_one({"id": theme["id"]}, theme, upsert=True)
    for term in glossary_data:
        await db.glossary.replace_one({"id": term["id"]}, term, upsert=True)
    return {"message": "Proje yuklendi", "catalog_id": project_data["id"]}

# ==================== TAGS ====================
@api_router.get("/tags")
async def get_tags():
    pipeline = [{"$unwind": "$tags"}, {"$group": {"_id": "$tags"}}, {"$sort": {"_id": 1}}]
    result = await db.catalogs.aggregate(pipeline).to_list(100)
    return [item["_id"] for item in result]

# ==================== INCLUDE ROUTER ====================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    global _browser, _playwright
    if _browser:
        await _browser.close()
    if _playwright:
        await _playwright.stop()
    client.close()
