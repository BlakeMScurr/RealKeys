!function(){"use strict";const e=["/client/client.05ee8443.js","/client/inject_styles.5607aec6.js","/client/index.0c948e33.js","/client/ReccomendedButton.e11b2fb1.js","/client/notes.be99bc8d.js","/client/level.c4173c69.js","/client/storage.4617e2a9.js","/client/setupMIDI.9eb406a6.js","/client/Loader.28e4ac09.js","/client/webmidi.min.0a3878e3.js","/client/_commonjsHelpers.521bc219.js","/client/testMIDI.d6d8db98.js","/client/instrument.6e502154.js","/client/settings.f3663914.js","/client/OptionButton.5dea0317.js","/client/history.1456c3c6.js","/client/play.fa0dc8e6.js"].concat(["/service-worker-index.html","/Tick.png","/favicon.png","/global.css"]),t=new Set(e);self.addEventListener("install",t=>{t.waitUntil(caches.open("cache1732501674439").then(t=>t.addAll(e)).then(()=>{self.skipWaiting()}))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(async e=>{for(const t of e)"cache1732501674439"!==t&&await caches.delete(t);self.clients.claim()}))}),self.addEventListener("fetch",e=>{if("GET"!==e.request.method||e.request.headers.has("range"))return;const s=new URL(e.request.url);s.protocol.startsWith("http")&&(s.hostname===self.location.hostname&&s.port!==self.location.port||(s.host===self.location.host&&t.has(s.pathname)?e.respondWith(caches.match(e.request)):"only-if-cached"!==e.request.cache&&e.respondWith(caches.open("offline1732501674439").then(async t=>{try{const s=await fetch(e.request);return t.put(e.request,s.clone()),s}catch(s){const c=await t.match(e.request);if(c)return c;throw s}}))))})}();
