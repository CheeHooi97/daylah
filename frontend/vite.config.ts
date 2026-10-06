import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'VITE_');
 for(const key of ['VITE_API_BASE_URL','VITE_PUBLIC_SITE_URL']){if(env[key]){const url=new URL(env[key]);if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash||url.username||url.password)throw Error(`${key} must be a public HTTPS origin without credentials or paths.`);}}
 return {plugins:[react()],server:{proxy:{'/v1':'http://127.0.0.1:8080','/healthz':'http://127.0.0.1:8080'}}};
});
