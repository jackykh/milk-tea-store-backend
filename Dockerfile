FROM node:16 as build-image
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY . .
RUN npm ci && npx tsc

FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN mkdir public && mkdir uploads
COPY ./public ./public
COPY --from=build-image ./usr/src/app/build ./build
RUN npm ci --production
EXPOSE 8080
CMD [ "node", "build/app.js" ]

