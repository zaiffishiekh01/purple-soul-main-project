FROM node:22-alpine

LABEL maintainer="Vendor Dashboard"
LABEL description="Public API Endpoints for Catalog"

WORKDIR /app

COPY package*.json ./

RUN npm install --production express cors dotenv && \
    npm cache clean --force

COPY dist ./dist
COPY server.cjs ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/catalog/navigation', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

USER node

CMD ["node", "server.cjs"]
