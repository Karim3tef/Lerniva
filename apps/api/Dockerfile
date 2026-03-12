FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json

RUN npm ci --workspace=apps/api --include-workspace-root=false

COPY apps/api/src apps/api/src

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["npm", "run", "start"]
