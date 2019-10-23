
FROM node:8.16-alpine

#app setup
RUN mkdir /opt/app
WORKDIR /opt/app
COPY package.json .
COPY yarn.lock .
COPY dist .
RUN yarn install --production
CMD ["node", "./index.js"]