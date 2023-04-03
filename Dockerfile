FROM docker.io/node:18-alpine as builder

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm i
COPY . ./
RUN npm run build

# production environment
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
