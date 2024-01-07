# build stage
FROM docker.io/node:18-bullseye as build-stage

RUN mkdir /app && chown -R node:node /app

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY LICENSE.md .eslintrc.cjs .prettierrc.cjs vite.config.ts tsconfig.json tsconfig.node.json index.html ./
COPY public ./public
COPY src ./src
RUN NODE_ENV=production npm run build

# runtime image stage
FROM docker.io/nginx:1.25-alpine

RUN mkdir /etc/nginx/templates

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 3046

CMD ["nginx", "-g", "daemon off;"]
