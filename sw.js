const CACHE='tuniang-finder-v3';
const ASSETS=['./','./index.html','./tuniang-logo.svg','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('tuniang-finder-')&&key!==CACHE).map(key=>caches.delete(key))))]))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;

  if(event.request.mode==='navigate'){
    const update=caches.open(CACHE).then(cache=>fetch(event.request).then(response=>{
      if(response.ok)return cache.put('./index.html',response.clone()).then(()=>response);
      return response;
    }).catch(()=>null));
    event.waitUntil(update);
    event.respondWith(caches.match('./index.html').then(cached=>cached||update).then(response=>response||Response.error()));
    return;
  }

  const update=caches.open(CACHE).then(cache=>fetch(event.request).then(response=>{
    if(response.ok)return cache.put(event.request,response.clone()).then(()=>response);
    return response;
  }).catch(()=>null));
  event.waitUntil(update);
  event.respondWith(caches.match(event.request).then(cached=>cached||update).then(response=>response||Response.error()));
});
