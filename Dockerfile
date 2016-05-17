FROM node:onbuild

RUN npm install -g uglify-js
RUN npm install -g clean-css

RUN mkdir -p assets/prod/js/
RUN mkdir -p assets/prod/css/

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
RUN npm install

COPY . /app

RUN npm run build-minified-files

EXPOSE 8080