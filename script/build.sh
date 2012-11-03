#!/bin/bash
cat apmplayer.js apmplayer_ui.jquery.js > apmplayer-all.js

~/node_modules/uglify-js2/bin/uglifyjs2 apmplayer-all.js > apmplayer-all.min.js

rm apmplayer-all.js
