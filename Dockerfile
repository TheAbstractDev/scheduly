FROM node:onbuild

RUN npm install -g uglify-js
RUN npm install -g clean-css

RUN mkdir -p assets/prod/js/
RUN mkdir -p assets/prod/css/

EXPOSE 8080