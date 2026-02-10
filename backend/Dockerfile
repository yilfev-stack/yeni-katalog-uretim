FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-liberation fonts-noto-core fonts-open-sans fonts-montserrat fonts-dejavu-core \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
    libpango-1.0-0 libcairo2 libasound2 libxshmfence1 libx11-6 libxext6 libxfixes3 libxi6 libxtst6 libdbus-1-3 chromium \
    && rm -rf /var/lib/apt/lists/*

RUN (which chromium || which chromium-browser)
RUN (chromium --version || chromium-browser --version)

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Emergent integrations (opsiyonel - ceviri icin)
RUN pip install --no-cache-dir emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ || echo "emergentintegrations not installed - translation will use fallback"

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN playwright install-deps chromium || true

COPY . .
RUN mkdir -p /app/exports

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
