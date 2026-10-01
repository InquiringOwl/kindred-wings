/* Kindred Wings — browser platform layer: saving, photos, backups, optional Claude help.
   Everything stays in this browser: the journal in localStorage, photos in IndexedDB,
   the optional Anthropic API key in localStorage. Nothing is sent anywhere except
   iNaturalist (photo lookups) and api.anthropic.com (only if the person adds a key). */

const LSKEY="kindred-wings-v1";
const AI_KEY="kindred-wings-ai-key";
const REAL_KEY="kindred-wings-real-photos";
// Models used for the optional Claude features. Update here when newer models ship.
const MODELS={quick:"claude-haiku-4-5-20251001",default:"claude-sonnet-5-5"};

let state={sightings:[],meanings:{},custom:[],photos:{}};
let sampleFn=null, downloadsNs=null, assetsNs=null;
const PHOTO_URLS={};   // photo id -> object URL (filled from IndexedDB at startup)

const blankState=()=>({sightings:[],meanings:{},custom:[],photos:{}});
function loadLocal(){try{const s=localStorage.getItem(LSKEY);if(s){const v=JSON.parse(s);if(v&&typeof v==="object")state=Object.assign(blankState(),v);}}catch(e){}}
function saveLocal(){try{localStorage.setItem(LSKEY,JSON.stringify(state));}catch(e){toast("Couldn't save — this browser's storage may be full");}}
function persist(){saveLocal();}

/* ---- files: save to the computer ---- */
downloadsNs={async save({filename,data}){
  const blob=data instanceof Blob?data:new Blob([data],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;
  document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
  return {status:"saved"};
}};

/* ---- photos: IndexedDB ---- */
let _idb=null;
function idb(){if(_idb)return _idb;_idb=new Promise((res,rej)=>{const r=indexedDB.open("kindred-wings",1);r.onupgradeneeded=()=>r.result.createObjectStore("photos");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});return _idb;}
async function idbPut(id,blob){const d=await idb();return new Promise((res,rej)=>{const tx=d.transaction("photos","readwrite");tx.objectStore("photos").put(blob,id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
async function idbDel(id){const d=await idb();return new Promise((res,rej)=>{const tx=d.transaction("photos","readwrite");tx.objectStore("photos").delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
async function idbAll(){const d=await idb();return new Promise(res=>{const out={};const tx=d.transaction("photos","readonly");const req=tx.objectStore("photos").openCursor();req.onsuccess=()=>{const c=req.result;if(c){out[c.key]=c.value;c.continue();}else res(out);};req.onerror=()=>res(out);});}
assetsNs={
  async upload(blob){const id="p"+uid();await idbPut(id,blob);PHOTO_URLS[id]=URL.createObjectURL(blob);return {id,url:PHOTO_URLS[id]};},
  async delete(id){await idbDel(id);if(PHOTO_URLS[id]){URL.revokeObjectURL(PHOTO_URLS[id]);delete PHOTO_URLS[id];}}
};
async function loadPhotos(){try{const all=await idbAll();for(const[k,b]of Object.entries(all))PHOTO_URLS[k]=URL.createObjectURL(b);}catch(e){console.warn("photos",e);}}

/* ---- backups ---- */
const blobToDataURL=b=>new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>res(null);r.readAsDataURL(b);});
async function exportBackup(){
  const photoData={};
  try{const all=await idbAll();for(const[k,b]of Object.entries(all)){const d=await blobToDataURL(b);if(d)photoData[k]=d;}}catch(e){}
  const out=Object.assign({},state,{app:"kindred-wings",version:APP_VERSION,exported:new Date().toISOString(),photoData});
  const d=new Date();const stamp=String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")+"-"+String(d.getFullYear()).slice(2);
  await downloadsNs.save({filename:`kindred-wings-backup-${stamp}.json`,data:JSON.stringify(out)});
  toast("Backup saved");
}
async function importBackup(file){
  let v;try{v=JSON.parse(await file.text());}catch(e){toast("That file isn't a Kindred Wings backup");return;}
  if(!v||!Array.isArray(v.sightings)){toast("That file isn't a Kindred Wings backup");return;}
  // photos carried in the backup
  const have=new Set(Object.keys(PHOTO_URLS));
  for(const[k,d]of Object.entries(v.photoData||{})){
    if(have.has(k))continue;
    try{const b=await (await fetch(d)).blob();await idbPut(k,b);PHOTO_URLS[k]=URL.createObjectURL(b);}catch(e){}
  }
  // merge: sightings and custom animals by id, meanings by timestamp, photos per slot
  const ids=new Set(state.sightings.map(s=>s.id));
  (v.sightings||[]).forEach(s=>{if(s&&s.id&&!ids.has(s.id))state.sightings.push(s);});
  const cids=new Set(state.custom.map(c=>c.id));
  (v.custom||[]).forEach(c=>{if(c&&c.id&&!cids.has(c.id)){delete c.drawing;state.custom.push(c);}});
  for(const[aid,list]of Object.entries(v.meanings||{})){
    const cur=state.meanings[aid]||[];const ts=new Set(cur.map(h=>h.t));
    list.forEach(h=>{if(!ts.has(h.t))cur.push(h);});cur.sort((a,b)=>(a.t||0)-(b.t||0));state.meanings[aid]=cur;
  }
  for(const[aid,slots]of Object.entries(v.photos||{})){
    for(const[slot,pid]of Object.entries(slots)){if(PHOTO_URLS[pid]){(state.photos[aid]=state.photos[aid]||{})[slot]=state.photos[aid][slot]||pid;}}
  }
  persist();render();
  const missing=Object.values(v.photos||{}).flatMap(o=>Object.values(o)).filter(pid=>!PHOTO_URLS[pid]).length;
  toast("Backup loaded"+(missing?` — ${missing} photo${missing>1?"s":""} weren't in the file`:""));
}

/* ---- optional Claude help (person's own Anthropic API key) ---- */
function aiKey(){try{return localStorage.getItem(AI_KEY)||"";}catch(e){return "";}}
function setAiKey(k){try{k?localStorage.setItem(AI_KEY,k):localStorage.removeItem(AI_KEY);}catch(e){}setupAI();}
async function callClaude(prompt,opts={}){
  const key=aiKey();if(!key)throw {code:"not_granted"};
  let r;
  try{
    r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{
      "content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01",
      "anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:MODELS[opts.modelTier]||MODELS.default,max_tokens:opts.modelTier==="quick"?400:8000,
        messages:[{role:"user",content:prompt}]})});
  }catch(e){throw {code:"offline"};}
  if(!r.ok){let m="";try{m=(await r.json()).error.message;}catch(e){}throw {code:r.status===401?"bad_key":r.status===429?"rate_limited":"failed",message:m};}
  const d=await r.json();
  return {text:(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("")};
}
function setupAI(){
  if(!aiKey()){sampleFn=null;return;}
  sampleFn=callClaude;
  sampleFn.json=async(p,o)=>{const{text}=await callClaude(p,o);const m=text.replace(/```json|```/g,"").match(/\{[\s\S]*\}/);if(!m)throw {code:"failed"};return JSON.parse(m[0]);};
}

/* ---- real photos from iNaturalist (openly licensed, credited) ----
   Built-in birds and animals use the hand-checked photos in INAT (data.js).
   Animals and birds you add are looked up by name, keeping only animal results
   (only birds for a bird) so a name like "Lion" can't match a plant such as dandelion. */
const INAT_KEY="kindred-wings-inat-2";
try{localStorage.removeItem("kindred-wings-inat");}catch(e){}
let inatCache={};try{inatCache=JSON.parse(localStorage.getItem(INAT_KEY)||"{}");}catch(e){}
function realPhotosOn(){try{return localStorage.getItem(REAL_KEY)!=="off";}catch(e){return true;}}
const ANIMAL_GROUPS=["Aves","Mammalia","Reptilia","Amphibia","Actinopterygii","Mollusca","Arachnida","Insecta","Animalia"];
function inatFixed(id){
  const f=typeof INAT!=="undefined"&&INAT[id];if(!f)return null;
  const[pid,ext]=f[1].split(":");
  return {url:`https://inaturalist-open-data.s3.amazonaws.com/photos/${pid}/medium.${ext}`,attr:f[2],link:"https://www.inaturalist.org/taxa/"+f[0],as:(typeof INAT_AS!=="undefined"&&INAT_AS[id])||""};
}
async function inatPhoto(id){
  const fx=inatFixed(id);if(fx)return fx;
  const a=findAny(id);if(!a)return null;
  const bird=isBirdObj(a);const ck=(bird?"bird:":"animal:")+a.name.toLowerCase();
  const c=inatCache[ck];
  if(c&&Date.now()-(c.t||0)<30*864e5)return c.url?c:null;
  try{
    const q=a.name.replace(/.*\((.*)\).*/,"$1");
    const r=await fetch("https://api.inaturalist.org/v1/taxa?per_page=10&is_active=true&q="+encodeURIComponent(q));
    const d=await r.json();
    const ok=t=>t.default_photo&&t.default_photo.license_code&&(bird?t.iconic_taxon_name==="Aves":ANIMAL_GROUPS.includes(t.iconic_taxon_name));
    const t=(d.results||[]).find(ok);const ph=t&&t.default_photo;
    const v=ph?{url:ph.medium_url,attr:ph.attribution||"",link:"https://www.inaturalist.org/taxa/"+t.id,as:t.preferred_common_name||t.name,t:Date.now()}:{url:null,t:Date.now()};
    inatCache[ck]=v;try{localStorage.setItem(INAT_KEY,JSON.stringify(inatCache));}catch(e){}
    return v.url?v:null;
  }catch(e){return null;}
}
async function loadInat(pc){
  if(pc.dataset.loaded)return;pc.dataset.loaded="1";
  const v=await inatPhoto(pc.dataset.inat);if(!v)return;
  const img=document.createElement("img");img.className="ph";img.alt="Photo from iNaturalist";img.src=v.url;img.title=v.attr;
  const tag=document.createElement("span");tag.className="phtag";tag.textContent="iNaturalist";
  img.onerror=()=>{img.remove();tag.remove();delete pc.dataset.loaded;};   // offline or photo moved: keep the drawing
  pc.append(img,tag);
  const cr=document.getElementById("inatCredit");
  if(cr&&pc.closest("#sheet"))cr.innerHTML=`Real photo${v.as?" (a "+esc(v.as.toLowerCase())+")":""} ${esc(v.attr)}, via <a href="${esc(v.link)}" target="_blank" rel="noopener">iNaturalist</a>.`;
}
document.addEventListener("pointerover",e=>{const pc=e.target.closest&&e.target.closest(".pic[data-inat]");if(pc)loadInat(pc);});
