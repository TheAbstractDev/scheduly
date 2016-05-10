#!/usr/bin/env bash

mkdir -p assets/prod/js/
mkdir -p assets/prod/css/

uglifyjs assets/dev/js/app.js -c -o assets/prod/js/app.js
cleancss -o assets/prod/css/style.css assets/dev/css/style.css
