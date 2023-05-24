FROM node:16-alpine
FROM node:lts-alpine

WORKDIR /usr/src/app
COPY package*.json .


RUN npm install
COPY . ./
RUN npm run webpack-prod
EXPOSE 3000
CMD ["npm","run","webpack-bundle"]
