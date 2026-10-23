FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js .

ENV PORT=3001

EXPOSE ${PORT}

CMD ["node", "server.js"]