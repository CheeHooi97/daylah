import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pages,staticPages,siteOrigin,renderPage,sitemap} from './seo.mjs';

test('public origins reject credentials, paths and insecure URLs',()=>{
 assert.equal(siteOrigin('https://daylah.my/'),'https://daylah.my');
 for(const url of ['http://daylah.my','https://user:secret@daylah.my','https://daylah.my/path','https://localhost','https://daylah.my?token=secret']) assert.throws(()=>siteOrigin(url));
});
test('each calculator has one canonical, unique metadata and static content',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.equal(new Set(pages.map(p=>p.description)).size,pages.length);
 for(const page of pages){
  const output=renderPage(html,page,'https://daylah.my');
  assert.equal((output.match(/rel="canonical"/g)||[]).length,1);
  assert.ok(output.includes(page.heading));
  assert.ok(output.includes(page.body));
  assert.ok(output.includes('name="robots" content="index,follow"'));
  const data=JSON.parse(output.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  assert.equal(data['@graph'][1].url,`https://daylah.my/${page.path?page.path+'/':''}`);
 }
});
test('sitemap contains only the public canonical URLs',()=>{
 const xml=sitemap('https://daylah.my');
 assert.equal((xml.match(/<loc>/g)||[]).length,pages.length+staticPages.length);
 assert.ok(!xml.includes('/s/'));
 assert.ok([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].every(([,url])=>!url.includes('?')));
 for(const page of [...pages,...staticPages]) assert.ok(xml.includes(`<loc>https://daylah.my/${page.path?page.path+'/':''}</loc>`));
});
