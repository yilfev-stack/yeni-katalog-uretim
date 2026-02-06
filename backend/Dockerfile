FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget gnupg2 fonts-liberation fonts-noto fonts-open-sans \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
    libpango-1.0-0 libcairo2 libasound2 libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install playwright && python -m playwright install chromium

RUN CHROMIUM_PATH=$(find /root -name "chrome" -path "*/chrome-linux/*" 2>/dev/null | head -1) && \
    echo "CHROMIUM_PATH=$CHROMIUM_PATH" > /app/.chromium_path

COPY . .

RUN mkdir -p /app/exports /app/fonts

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
