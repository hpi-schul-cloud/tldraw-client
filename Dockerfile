# build stage
FROM docker.io/node:18-bullseye as build-stage

RUN mkdir /app && chown -R node:node /app

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY babel.config.js .eslintrc.js craco.config.js LICENSE.md tsconfig.json .prettierrc.js ./
COPY public ./public
COPY src ./src
RUN NODE_ENV=production npm run build

# runtime image stage
FROM docker.io/nginx:1.25

RUN mkdir /etc/nginx/templates

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY --from=build-stage /app/build/favicon.ico /usr/share/nginx/html/static/media

EXPOSE 3046

CMD ["nginx", "-g", "daemon off;"]
