import {spawnSync} from 'node:child_process';
const command=process.platform==='win32'?'gradlew.bat':'./gradlew';
const result=spawnSync(command,['assembleDebug'],{cwd:'android',stdio:'inherit',shell:process.platform==='win32'});process.exit(result.status??1);
