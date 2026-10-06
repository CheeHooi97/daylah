import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Clipboard } from '@capacitor/clipboard';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';

export const native=Capacitor.isNativePlatform();
const keys=['daylah.events.v1','daylah.shares.v1'];
const cache=new Map<string,string>();
export async function initializeStorage(){
 if(!native)return;
 for(const key of keys){let value=(await Preferences.get({key})).value;
  if(value===null){value=localStorage.getItem(key);if(value!==null)await Preferences.set({key,value});}
  if(value!==null)cache.set(key,value);
 }
}
export function getStored(key:string){return native?cache.get(key)||null:localStorage.getItem(key);}
export async function setStored(key:string,value:string){if(native){await Preferences.set({key,value});cache.set(key,value);}else localStorage.setItem(key,value);}
export async function copyText(value:string){if(native)await Clipboard.write({string:value});else await navigator.clipboard.writeText(value);}
export function apiOrigin(){const origin=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');if(native&&!origin)throw Error('Public sharing is not configured in this app yet.');return origin;}
export function publicLink(publicId:string){const configured=(import.meta.env.VITE_PUBLIC_SITE_URL||'').replace(/\/$/,'');if(native&&!configured)throw Error('Public sharing is not configured in this app yet.');return `${configured||location.origin}/s/${encodeURIComponent(publicId)}`;}
export async function shareLink(title:string,url:string){if(native)await Share.share({title,url,dialogTitle:'Share your countdown'});else await copyText(url);}
export async function setupNativeLifecycle(){if(!native)return ()=>{};
 document.documentElement.classList.add('native-app');
 const resume=await App.addListener('appStateChange',({isActive})=>{if(isActive)window.dispatchEvent(new Event('daylah:resume'));});
 const back=await App.addListener('backButton',()=>{if(location.hash){history.replaceState(null,'',location.pathname);window.scrollTo({top:0});}else void App.minimizeApp();});
 return ()=>{void resume.remove();void back.remove();};
}
