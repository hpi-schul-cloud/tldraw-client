# build stage
FROM docker.io/node:18-bullseye as build-stage

RUN mkdir /app && chown -R node:node /app

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY babel.config.js .eslintrc.js LICENSE.md tsconfig.json .prettierrc.js ./
COPY public ./public
COPY src ./src
RUN NODE_ENV=production npm run build

# runtime image stage
FROM docker.io/nginx:1.25

RUN mkdir /etc/nginx/templates

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build-stage /app/build /usr/share/nginx/html

# Install timezone and locale packages
RUN apt-get update && apt-get install -y tzdata locales && \
    # Set the timezone to Europe/Berlin
    ln -sf /usr/share/zoneinfo/Europe/Berlin /etc/localtime && \
    echo 'Europe/Berlin' > /etc/timezone && \
    # Set the locale to de_DE.UTF-8
    sed -i 's|# de_DE.UTF-8 UTF-8|de_DE.UTF-8 UTF-8|' /etc/locale.gen && \
    locale-gen

ENV TZ=Europe/Berlin
ENV LC_ALL=de_DE.UTF-8
ENV LANG=de_DE.UTF-8

EXPOSE 3046

CMD ["nginx", "-g", "daemon off;"]
