FROM docker.io/node:18-bullseye as build-stage

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . ./
RUN npm run build

# production environment
FROM docker.io/nginx:1.25
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 83
CMD ["nginx", "-g", "daemon off;"]
