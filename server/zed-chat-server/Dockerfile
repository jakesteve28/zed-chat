FROM node:14 as builder
WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build 

FROM node:14-alpine
WORKDIR /app
COPY --from=builder /app ./ 
EXPOSE 3000
EXPOSE 3002
RUN npm install -g pm2
CMD ["pm2-runtime", "dist/main.js"]
