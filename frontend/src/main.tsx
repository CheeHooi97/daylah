import { native, setupNativeLifecycle } from './platform/native';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Private and parameterized pages must not inherit a public calculator canonical.
if (location.pathname.startsWith('/s/') || location.search) {
    let robots=document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if(!robots){robots=document.createElement('meta');robots.name='robots';document.head.append(robots);}
    robots.content='noindex,nofollow';
    document.querySelectorAll('link[rel="canonical"],meta[property="og:url"],script[type="application/ld+json"]').forEach(node=>node.remove());
    if(location.pathname.startsWith('/s/')) document.title='Shared countdown — DayLah';
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
void setupNativeLifecycle().catch(()=>{});
if (!native && import.meta.env.MODE !== 'mobile' && 'serviceWorker' in navigator && import.meta.env.PROD)
    navigator.serviceWorker.register('/sw.js').then(reg => { reg.addEventListener('updatefound', () => { const worker = reg.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        const notice = document.createElement('p');
        notice.className = 'update-notice';
        notice.textContent = 'An updated DayLah is ready. Close all DayLah tabs and reopen to update.';
        document.body.append(notice);
    } }); }); }).catch(() => { });
