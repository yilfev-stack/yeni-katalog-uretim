import asyncio
import json
import os
from io import BytesIO
from pathlib import Path
import sys

from PIL import Image
from pypdf import PdfReader

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))

from server import render_html_to_pdf, render_html_to_image  # noqa: E402

FIXTURE_PATH = Path(__file__).parent / 'fixtures' / 'export_fixtures.json'


def load_fixtures():
    raw = json.loads(FIXTURE_PATH.read_text(encoding='utf-8'))
    cases = []
    for item in raw:
        size = tuple(item.get('png_size', [1080, 1350]))
        if item.get('html_variants'):
            for i, html in enumerate(item['html_variants'], 1):
                cases.append({
                    'name': f"{item['name']}_v{i}",
                    'marker': item['marker'],
                    'png_size': size,
                    'html': html,
                })
        else:
            cases.append({
                'name': item['name'],
                'marker': item['marker'],
                'png_size': size,
                'html': item['html'],
            })
    return cases


def ensure_chromium_available():
    candidates = [
        os.environ.get('CHROMIUM_PATH'),
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
    ]
    found = next((c for c in candidates if c and Path(c).is_file()), None)
    in_docker = Path('/.dockerenv').exists()

    if found:
        print(f"[smoke] chromium bulundu: {found}")
        return

    help_msg = (
        "Chromium bulunamadi. Host ortaminda test kosuyorsaniz Chromium kurun veya Docker icinde calistirin:\n"
        "docker compose run --rm backend python tests/export_smoke_test.py"
    )
    if in_docker:
        raise RuntimeError(
            "Container icinde chromium bulunamadi (/usr/bin/chromium). Bu bir image build bug'idir. " + help_msg
        )
    raise RuntimeError(help_msg)


def assert_png_has_red_marker(png_bytes: bytes):
    img = Image.open(BytesIO(png_bytes)).convert('RGB')
    found = False
    step_x = max(1, img.width // 40)
    step_y = max(1, img.height // 40)
    for x in range(0, img.width, step_x):
        for y in range(0, img.height, step_y):
            r, g, b = img.getpixel((x, y))
            if r > 180 and g < 80 and b < 80:
                found = True
                break
        if found:
            break
    assert found, 'PNG marker red block bulunamadi'


def assert_pdf_marker(pdf_bytes: bytes, marker: str):
    reader = PdfReader(BytesIO(pdf_bytes))
    assert len(reader.pages) >= 1, 'PDF sayfa sayisi 0'
    text = "\n".join((page.extract_text() or '') for page in reader.pages)
    assert marker in text, f'PDF marker bulunamadi: {marker}'


async def main():
    ensure_chromium_available()
    fixtures = load_fixtures()

    out = Path('test_reports/exports')
    out.mkdir(parents=True, exist_ok=True)

    for idx, sample in enumerate(fixtures, 1):
        pdf = await render_html_to_pdf(sample['html'])
        png = await render_html_to_image(
            sample['html'],
            width=sample['png_size'][0],
            height=sample['png_size'][1],
            img_format='png'
        )

        pdf_path = out / f"smoke_{idx}_{sample['name']}.pdf"
        png_path = out / f"smoke_{idx}_{sample['name']}.png"

        pdf_path.write_bytes(pdf)
        png_path.write_bytes(png)

        assert pdf_path.stat().st_size > 0, f"PDF {idx} bos"
        assert png_path.stat().st_size > 0, f"PNG {idx} bos"

        assert_pdf_marker(pdf, sample['marker'])
        img = Image.open(BytesIO(png))
        assert img.size == sample['png_size'], f"PNG boyutu hatali: {img.size} != {sample['png_size']}"
        assert_png_has_red_marker(png)

    print(f'export_smoke_test: OK ({len(fixtures)} fixture render)')


if __name__ == '__main__':
    asyncio.run(main())
