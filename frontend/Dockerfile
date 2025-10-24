# Étape 1 : build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install --verbose --network-timeout=1000000

COPY . .
RUN npm run build

# Étape 2 : serveur Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
