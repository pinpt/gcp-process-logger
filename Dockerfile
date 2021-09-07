FROM node:14-alpine

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY index.js index.js

ENV NODE_ENV production
RUN npm i -g
ENV NODE_ENV development

CMD ["gcp-process-logger"]
