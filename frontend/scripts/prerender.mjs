import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import {loadEnv} from 'vite';
import {pages,staticPages,siteOrigin,renderPage,sitemap} from './seo.mjs';
const routes=pages.map(page=>[page.path]);
const html=await readFile('dist/index.html','utf8');
const origin=siteOrigin(process.env.PUBLIC_SITE_URL||loadEnv('production',process.cwd(),'PUBLIC_').PUBLIC_SITE_URL||'');
for(const page of pages){const dir=`dist/${page.path}`;await mkdir(dir,{recursive:true});await writeFile(`${dir}/index.html`,renderPage(html,page,origin));}
await mkdir('dist/saved-dates',{recursive:true});
await writeFile('dist/saved-dates/index.html',renderPage(html,{path:'saved-dates',title:'Your saved dates — DayLah',heading:'Your saved dates',description:'Manage your private countdowns, birthdays and anniversaries saved on this device.',body:'Your saved dates stay on this device. Add, edit or delete events without an account.'},origin).replace('content="index,follow"','content="noindex,follow"'));
await mkdir('dist/s',{recursive:true});
await writeFile('dist/s/index.html',html.replace(/<title>.*?<\/title>/,'<title>Shared countdown — DayLah</title>').replace('</head>','<meta name="robots" content="noindex,nofollow"/></head>').replace(/<div id="root">[\s\S]*?<\/div>/,'<div id="root"><main><h1>Shared countdown</h1><p>Loading the shared countdown…</p></main></div>'));
if(origin)await writeFile('dist/sitemap.xml',sitemap(origin));
await writeFile('dist/robots.txt',`User-agent: *\nDisallow: /v1/\nDisallow: /healthz\n${origin?`Sitemap: ${origin}/sitemap.xml\n`:''}`);
const assets=await readdir('dist/assets');const urls=['/saved-dates/','/','/symbol.svg','/manifest.webmanifest','/app-icon-192.png','/app-icon-512.png',...staticPages.flatMap(p=>[`/${p.path}/`,`/${p.path}/index.html`]),'/privacy/privacy.css',...routes.filter(([p])=>p).map(([p])=>`/${p}/`),...assets.map(p=>`/assets/${p}`),...['MY','SG'].flatMap(c=>[2026,2027].map(y=>`/holidays/${c}-${y}.json`))];
const crypto=await import('node:crypto');const version=crypto.createHash('sha256').update(html+JSON.stringify(urls)+await readFile(new URL(import.meta.url),'utf8')+await readFile('dist/privacy/index.html','utf8')+await readFile('dist/privacy/privacy.css','utf8')).digest('hex').slice(0,12);
await writeFile('dist/sw.js',`const CACHE='daylah-${version}';const URLS=${JSON.stringify(urls)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(URLS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('daylah-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(url.origin!==location.origin||event.request.method!=='GET'||url.pathname.startsWith('/v1/')||url.pathname.startsWith('/healthz'))return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match(url.pathname).then(r=>r||caches.match('/'))));return;}
event.respondWith(caches.match(event.request,{ignoreVary:true}).then(cached=>{if(cached&&url.pathname.startsWith('/holidays/')){const headers=new Headers(cached.headers);headers.set('X-Daylah-Cached','true');return new Response(cached.body,{status:cached.status,headers});}return cached||fetch(event.request);}));});`);
console.log('Prerendered tool pages and versioned offline assets. '+(origin?'Sitemap generated.':'Canonical URLs and sitemap withheld until PUBLIC_SITE_URL is configured.'));
