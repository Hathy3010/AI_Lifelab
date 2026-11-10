import {mkdir,cp,writeFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../public/mediapipe/',import.meta.url);
await mkdir(root,{recursive:true});
await cp(new URL('../node_modules/@mediapipe/tasks-vision/wasm/',import.meta.url),new URL('wasm/',root),{recursive:true});
const model=new URL('hand_landmarker.task',root);
try{await access(model);}catch{
 const url='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Model download failed: ${response.status}`);
 await writeFile(model,new Uint8Array(await response.arrayBuffer()));
}
console.log('Local CV assets ready:',fileURLToPath(root));
