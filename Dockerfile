FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npm audit fix
COPY . .
EXPOSE 5173
CMD [ "npm", "run", "start" ]