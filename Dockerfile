# Étape de construction
FROM node:18-alpine as build-stage

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Construire l'application pour la production
RUN npm run build

# Étape de production
FROM nginx:stable-alpine as production-stage

# Copier les fichiers de build depuis l'étape précédente
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Configurer Nginx pour gérer correctement les routes Vue.js (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]