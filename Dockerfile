FROM node:onbuild

RUN npm install -g uglify-js
RUN npm install -g clean-css

RUN mkdir -p assets/prod/js/
RUN mkdir -p assets/prod/css/

RUN uglifyjs assets/dev/js/app.js -c -o assets/prod/js/app.js
RUN cleancss -o assets/prod/css/style.css assets/dev/css/style.css

EXPOSE 8080