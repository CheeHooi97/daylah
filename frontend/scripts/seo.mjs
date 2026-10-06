export const pages = [
 {path:'holidays',title:'Malaysia and Singapore public holidays & leave planner — DayLah',heading:'Plan around public holidays',description:'Browse Malaysia and Singapore public holidays for 2026 and 2027. Filter by Malaysian state and compare longer breaks using up to two leave days.',body:'Choose a country, state and year, then select a future holiday to compare break options. Each option lists the included holidays and leave dates. Government sources and coverage limitations are shown with the calendar.'},
 {path:'', title:'DayLah — Date calculators and countdowns', heading:'Make every day count', description:'Calculate days between dates, count down to special days, and work out ages and anniversaries. Save meaningful dates privately on your device.', body:'Choose a date calculator below. Your saved events and private notes stay on this device unless you create a public share link.'},
 {path:'between-dates', title:'Days between dates calculator — DayLah', heading:'Calculate days between two dates', description:'Find the number of calendar days between two dates. Include both dates or count elapsed days, with support for reversed date ranges.', body:'Enter a start date and an end date to calculate elapsed calendar days. Turn on inclusive counting to include both dates. Reversed ranges return a negative interval. Calendar-day calculations avoid daylight saving time rounding errors.'},
 {path:'until', title:'Days until a date calculator — DayLah', heading:'Count down to a meaningful date', description:'Find how many days remain until a birthday, holiday, trip, or special date. See days since past dates and save private countdowns.', body:'Choose a target date to see the number of days remaining in your selected timezone. A past date shows days since the event, and a target matching today shows Today. Save an event to return to your countdown later.'},
 {path:'age', title:'Age calculator in years, months and days — DayLah', heading:'Calculate your calendar age', description:'Calculate age in years, months and days from a birth date, plus total calendar days. Use your timezone to calculate against today.', body:'Enter a birth date to calculate completed years, remaining months and days, and total days to today. The calculation uses calendar dates in your selected timezone rather than dividing milliseconds by a fixed year length.'},
 {path:'anniversary', title:'Anniversary calculator — DayLah', heading:'Count the years since it all began', description:'Calculate years, months and days since a meaningful date. Save annual anniversaries with a choice of February 29 recurrence rules.', body:'Enter the date of your milestone to see completed years, months and days since it began. Save an annual event for the next occurrence. For February 29 events, choose February 28 or March 1 in non-leap years.'}
];

export function siteOrigin(value='') {
 if (!value) return '';
 let url;
 try { url=new URL(value); } catch { throw Error('PUBLIC_SITE_URL must be a public HTTPS origin.'); }
 if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash||url.username||url.password||url.port||url.hostname==='localhost'||!url.hostname.includes('.')||/^\d+(\.\d+){3}$/.test(url.hostname)) throw Error('PUBLIC_SITE_URL must be a public HTTPS origin without credentials, ports, or paths.');
 return url.origin;
}
export const escapeHtml=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderPage(html,page,origin) {
 const url=origin+`/${page.path ? page.path+'/' : ''}`;
 const nav=pages.map(p=>`<a href="/${p.path?p.path+'/':''}">${escapeHtml(p.path?p.heading:'DayLah home')}</a>`).join(' · ');
 const content=`<header><a href="/">DayLah</a></header><main><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.description)}</p><p>${escapeHtml(page.body)}</p><nav aria-label="Date calculators">${nav}</nav></main>`;
 let result=html.replace(/<title>.*?<\/title>/,`<title>${escapeHtml(page.title)}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/>/,`<meta name="description" content="${escapeHtml(page.description)}"/>`).replace(/<div id="root">[\s\S]*?<\/div>/,`<div id="root">${content}</div>`);
 const tags=[`<meta name="robots" content="index,follow"/>`,`<meta property="og:type" content="website"/>`,`<meta property="og:site_name" content="DayLah"/>`,`<meta property="og:title" content="${escapeHtml(page.title)}"/>`,`<meta property="og:description" content="${escapeHtml(page.description)}"/>`,`<meta name="twitter:card" content="summary"/>`,`<meta name="twitter:title" content="${escapeHtml(page.title)}"/>`,`<meta name="twitter:description" content="${escapeHtml(page.description)}"/>`];
 if(origin){
  tags.push(`<link rel="canonical" href="${escapeHtml(url)}"/>`,`<meta property="og:url" content="${escapeHtml(url)}"/>`);
  const data={'@context':'https://schema.org','@graph':[{'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'DayLah'}, {'@type':'WebApplication',name:page.title,url,description:page.description,applicationCategory:'UtilitiesApplication',operatingSystem:'Any',isAccessibleForFree:true}]};
  tags.push(`<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`);
 }
 return result.replace('</head>',tags.join('')+'</head>');
}
export const staticPages = [{path:'privacy'}];
export function sitemap(origin){return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...pages,...staticPages].map(p=>`  <url><loc>${escapeHtml(origin)}/${p.path?p.path+'/':''}</loc></url>`).join('\n')}\n</urlset>\n`;}
