FROM node:16-alpine as builder

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . ./
RUN npm run build

# production environment
FROM nginx:1.21-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
