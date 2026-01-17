FROM node:24.5.0-slim AS builder

RUN apt-get update && apt-get install -y python3 python3-pip sqlite3 && rm -rf /var/lib/apt/lists/*

WORKDIR /home/perplexica

COPY package.json yarn.lock ./
RUN yarn install --network-timeout 600000

COPY tsconfig.json next.config.mjs next-env.d.ts postcss.config.js tailwind.config.ts ./
COPY prisma ./prisma
COPY src ./src
COPY public ./public

RUN mkdir -p /home/perplexica/data
# Generate Prisma client (doesn't need database connection, just reads schema)
# Set a dummy DATABASE_URL to satisfy Prisma's env requirement during build
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
RUN yarn db:generate || echo "Prisma generate failed, will retry at runtime"
RUN yarn build

FROM node:24.5.0-slim

RUN apt-get update && apt-get install -y \
    python3-dev python3-babel python3-venv python-is-python3 \
    uwsgi uwsgi-plugin-python3 \
    git build-essential libxslt-dev zlib1g-dev libffi-dev libssl-dev \
    curl sudo \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/perplexica

COPY --from=builder /home/perplexica/public ./public
COPY --from=builder /home/perplexica/.next/static ./public/_next/static
COPY --from=builder /home/perplexica/.next/standalone ./
COPY --from=builder /home/perplexica/data ./data

RUN mkdir /home/perplexica/uploads

RUN useradd --shell /bin/bash --system \
    --home-dir "/usr/local/searxng" \
    --comment 'Privacy-respecting metasearch engine' \
    searxng

RUN mkdir "/usr/local/searxng"
RUN mkdir -p /etc/searxng
RUN chown -R "searxng:searxng" "/usr/local/searxng"

COPY searxng/settings.yml /etc/searxng/settings.yml
COPY searxng/limiter.toml /etc/searxng/limiter.toml
COPY searxng/uwsgi.ini /etc/searxng/uwsgi.ini
RUN chown -R searxng:searxng /etc/searxng

USER searxng

# Install SearXNG (optional - can fail without breaking build)
RUN set +e && \
    git clone "https://github.com/searxng/searxng" "/usr/local/searxng/searxng-src" 2>&1 | head -20 && \
    python3 -m venv "/usr/local/searxng/searx-pyenv" && \
    "/usr/local/searxng/searx-pyenv/bin/pip" install --upgrade pip setuptools wheel pyyaml msgspec && \
    cd "/usr/local/searxng/searxng-src" && \
    "/usr/local/searxng/searx-pyenv/bin/pip" install --use-pep517 --no-build-isolation -e . || \
    echo "Warning: SearXNG installation failed, but continuing build (SearXNG is optional)"

USER root

WORKDIR /home/perplexica
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
RUN sed -i 's/\r$//' ./entrypoint.sh || true

RUN echo "searxng ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

EXPOSE 3000 8080

ENV SEARXNG_API_URL=http://localhost:8080

CMD ["/home/perplexica/entrypoint.sh"]
