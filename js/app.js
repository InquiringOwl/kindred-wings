/* Kindred Creatures — helpers, model, photos, views, detail sheet, startup.
   Plain script; shares globals with the other js/ files (load order in index.html). */
/* ---------------- Helpers ---------------- */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
const thisMonth=()=>today().slice(0,7);
const fmtMonth=ym=>{if(!ym)return"";const[y,m]=ym.split("-");return m+"/"+y.slice(2);};
const monthHeading=ym=>{const[y,m]=ym.split("-");return ["January","February","March","April","May","June","July","August","September","October","November","December"][+m-1]+" "+y;};
const usDate=iso=>{const[y,m,d]=iso.split("-");return m+"/"+d+"/"+y.slice(2);};
function parseUS(str){const m=String(str).trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2}|\d{4})$/);if(!m)return null;let[_,mo,d,y]=m;mo=+mo;d=+d;y=y.length===2?2000+(+y):+y;if(mo<1||mo>12||d<1||d>31)return null;const dt=new Date(y,mo-1,d);if(dt.getMonth()!==mo-1)return null;return y+"-"+String(mo).padStart(2,"0")+"-"+String(d).padStart(2,"0");}
function parseUSMonth(str){const m=String(str).trim().match(/^(\d{1,2})[\/.-](\d{2}|\d{4})$/);if(!m)return null;const mo=+m[1];const y=m[2].length===2?2000+(+m[2]):+m[2];if(mo<1||mo>12)return null;return y+"-"+String(mo).padStart(2,"0");}
const fmtDate=d=>d?usDate(d):"";
function monthsOn(code){
  if(!code)return Array(12).fill(false);
  if(code==="all")return Array(12).fill(true);
  const[a,b]=code.split("-").map(Number);const on=Array(12).fill(false);
  let i=a;while(true){on[i-1]=true;if(i===b)break;i=i%12+1;}return on;
}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("on");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("on"),2200);}

/* ---------------- Sections ---------------- */
// Six groups (top tabs), each with a local (San Francisco) section and an around-the-world section.
const GROUPS=[
 {id:"birds",label:"Birds",cats:["bird-local","bird"]},
 {id:"animals",label:"Animals",cats:["animal-local","animal"]},
 {id:"insects",label:"Insects",cats:["insect-local","insect"]},
 {id:"trees",label:"Trees",cats:["tree-local","tree"]},
 {id:"flowers",label:"Flowers",cats:["flower-local","flower"]},
 {id:"greenery",label:"Greenery",cats:["green-local","green"]}];
const CATS={
 "bird-local":{label:"Local birds",noun:"bird",intro:"The birds of San Francisco — filter by what you can see at a glance."},
 "bird":{label:"Birds",noun:"bird",intro:"Birds from around the world — penguins, ibises, eagles and the ones that turn up in art, dreams and stories."},
 "animal-local":{label:"Local animals",noun:"animal",intro:"The mammals, reptiles, amphibians and sea life that share San Francisco with you."},
 "animal":{label:"Animals",noun:"animal",intro:"For the animals that find you in other ways — a giraffe on a mug, a whale in a dream, a fox in a friend's story."},
 "insect-local":{label:"Local insects",noun:"insect",intro:"Butterflies, bees and beetles of San Francisco's gardens, hills and ponds."},
 "insect":{label:"Insects",noun:"insect",intro:"Insects from around the world."},
 "tree-local":{label:"Local trees",noun:"tree",intro:"Trees you'll meet in San Francisco — native oaks and willows and the planted cypresses, palms and street trees. Uses and harvest notes are suggestions until you confirm them."},
 "tree":{label:"Trees",noun:"tree",intro:"Trees from around the world."},
 "flower-local":{label:"Local flowers",noun:"flower",intro:"Wildflowers and garden flowers of San Francisco. Uses and harvest notes are suggestions until you confirm them — and see Laws before picking anything."},
 "flower":{label:"Flowers",noun:"flower",intro:"Flowers from around the world."},
 "green-local":{label:"Other greenery",noun:"plant",intro:"Herbs, shrubs, ferns and “weeds” of San Francisco. Uses and harvest notes are suggestions until you confirm them."},
 "green":{label:"Non-local bushes",noun:"bush",intro:"Shrubs and bushes from elsewhere."}};
const BEYOND_INSECTS=["butterfly","bee"];
function catOf(a){
  if(!a)return "animal";
  if(a.cat)return a.cat;
  if(BIRDS.includes(a)||a.kind==="bird")return "bird-local";
  if(BEYOND_INSECTS.includes(a.id))return "insect";
  return "animal";
}
const kindOf=a=>catOf(a).split("-")[0];               // bird | animal | insect | tree | flower | green
const isLocal=a=>catOf(a).endsWith("-local");
function catKind(a){return kindOf(a);}                   // used by flora.js
const isPlant=a=>["tree","flower","green"].includes(kindOf(a));
function isBirdObj(a){return !!a&&kindOf(a)==="bird";}
function groupOf(cat){return GROUPS.find(g=>g.cats.includes(cat));}
let _all=null;
function allItems(){return BIRDS.concat(NEW,BEYOND,state.custom);}
function itemsIn(cat){return allItems().filter(a=>catOf(a)===cat);}
function findAny(id){return allItems().find(a=>a.id===id);}
function customBirds(){return state.custom.filter(c=>catOf(c)==="bird-local");}
function sightingsOf(id){return state.sightings.filter(s=>s.animalId===id);}

/* ---------------- Meanings: suggested (italic) vs. yours (confirmed or written) ---------------- */
function currentSym(a){
  const h=state.meanings[a.id];
  if(h&&h.length){const last=h[h.length-1];if(!last.reset)return{keys:last.keys,why:last.text,mine:true,confirmed:!!last.confirmed,month:last.month};}
  return{keys:a.sym.keys,why:a.sym.why,src:a.sym.src,mine:false};
}
// Herbal uses and harvest notes for local plants: suggested until you confirm or rewrite them.
function plantNote(a,field){
  const n=state.notes&&state.notes[a.id]&&state.notes[a.id][field];
  if(n&&!n.reset)return{text:n.text,mine:true,confirmed:!!n.confirmed,month:n.month};
  return{text:a[field]||"",mine:false};
}

/* ---------------- Legal protections ---------------- */
const BIRD_NON_MBTA=["rock-pigeon","european-starling","red-masked-parakeet","california-quail"];
const BIRD_NONNATIVE=["rock-pigeon","european-starling","red-masked-parakeet"];
const BIRD_GAME=["california-quail","mourning-dove","mallard","bufflehead","canada-goose"];
const BIRD_RAPTOR=["red-tailed-hawk","coopers-hawk","american-kestrel","peregrine-falcon","great-horned-owl","barn-owl"];
const BIRD_CONTROL=["brewers-blackbird","red-winged-blackbird","american-crow"];
const BIRD_LN={
 "peregrine-falcon":{ca35035:"Off California's fully protected list since 2023 (SB 147) and off the federal endangered list since 1999 — still covered by the MBTA and the state raptor law."},
 "brown-pelican":{mbta:"Off the federal endangered list since 2009 and California's fully protected list since 2023 — the MBTA and state law still protect it."},
 "california-quail":{mbta_no:"California's state bird is a game bird under state hunting rules, not on the federal list.",ca_game:"A resident game bird — hunting seasons and limits apply outside the city."},
 "red-masked-parakeet":{mbta_no:"The Telegraph Hill flock descends from escaped pets, so neither the MBTA nor the state nongame-bird rule covers them.",ca3503:"On its face this covers the nest of “any bird” — including the parrots'. Feeding them in parks is also banned (Park Code § 5.07)."},
 "rock-pigeon":{ca3503:"On its face this covers the nest of “any bird,” pigeons included. Feeding pigeons in parks is banned (Park Code § 5.07)."},
 "european-starling":{ca3801:"Starlings may be taken at any time under state law."},
 "canada-goose":{ca_game:"A migratory game bird; federal resident-goose control rules also apply."},
 "mourning-dove":{ca_game:"A migratory game bird — hunted in season under federal frameworks and state rules."},
 "mallard":{ca_game:"A migratory game bird."},"bufflehead":{ca_game:"A migratory game bird."}
};
function lawsOf(a){
  if(!a)return [];
  if(a.law)return a.law;
  if(LAW_EXTRA[a.id])return LAW_EXTRA[a.id].law;
  if(BIRDS.includes(a)){
    const id=a.id, k=[];
    if(BIRD_NON_MBTA.includes(id))k.push("mbta_no");else k.push("mbta");
    if(BIRD_CONTROL.includes(id))k.push("mbta_control");
    if(!BIRD_NON_MBTA.includes(id))k.push("ca3513");
    k.push("ca3503");
    if(BIRD_RAPTOR.includes(id))k.push("ca35035");
    if(BIRD_GAME.includes(id))k.push("ca_game");
    else if(BIRD_NONNATIVE.includes(id))k.push(id==="european-starling"?"ca3801":"ca_nonnative");
    else k.push("ca3800");
    return k;
  }
  return [];
}
function lawNote(a,key){return (a.ln&&a.ln[key])||(LAW_EXTRA[a.id]&&LAW_EXTRA[a.id].ln&&LAW_EXTRA[a.id].ln[key])||(BIRD_LN[a.id]&&BIRD_LN[a.id][key])||"";}
const isMBTA=a=>lawsOf(a).includes("mbta");
function levelsOf(a){const lv=new Set();lawsOf(a).forEach(k=>{const L=LAWS[k];if(L&&!L.info)lv.add(L.lv);});return ["F","S","C"].filter(x=>lv.has(x));}
// Small F / S / C letters; hover, focus or tap shows that level's short rules for this species.
function lawBadges(a,big){
  const lv=levelsOf(a);if(!lv.length)return "";
  return `<span class="badges${big?" big":""}">${lv.map(L=>`<span class="lb lb-${L}" tabindex="0" role="button" aria-label="${esc(LAW_LEVELS[L])} protections">${L}<span class="ltip" role="tooltip"><b>${esc(LAW_LEVELS[L])}</b>${lawsOf(a).filter(k=>LAWS[k]&&LAWS[k].lv===L&&!LAWS[k].info).map(k=>`<span class="lt"><i>${esc(LAWS[k].name)}</i> — ${esc(LAWS[k].short)}${lawNote(a,k)?` <em>${esc(lawNote(a,k))}</em>`:""}</span>`).join("")}</span></span>`).join("")}</span>`;
}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".lb");document.querySelectorAll(".lb.open").forEach(x=>{if(x!==b)x.classList.remove("open");});if(b){e.stopPropagation();e.preventDefault();b.classList.toggle("open");}},true);

/* ---------------- Photos ---------------- */
function photoUrl(id,slot){const p=state.photos&&state.photos[id];if(!p)return null;const a=p[slot]||(slot!=="a"&&(p.a));return a?(PHOTO_URLS[a]||null):null;}
function anyPhoto(id,pref){const p=state.photos&&state.photos[id];if(!p)return null;const k=[pref,"a","m","f","y"].find(x=>x&&p[x]);return k?(PHOTO_URLS[p[k]]||null):null;}
function withPhoto(inner,url,inatId){
  if(url)return `<span class="pic">${inner}<img class="ph" src="${esc(url)}" alt="Your photo"><span class="phtag">your photo</span></span>`;
  if(inatId&&realPhotosOn())return `<span class="pic" data-inat="${esc(inatId)}">${inner}</span>`;
  return `<span class="pic">${inner}</span>`;
}
// Photo rules, shown wherever you can add a picture.
const PHOTO_MAX_MB=15;
const PHOTO_ACCEPT="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif";
const PHOTO_RULES=`JPG, PNG, WebP or GIF, up to ${PHOTO_MAX_MB} MB. iPhone HEIC photos work in Safari; in Chrome, save them as JPG first. Big photos are shrunk to 1400 pixels on the long side and kept as JPG.`;
const COVER_RULES="The cover fills the same 5 × 4 frame as the drawings (for example 1000 × 800 pixels); the middle is kept, so center your subject.";
function photoProblem(f){
  if(!f)return "No photo chosen";
  if(f.type&&!/^image\//.test(f.type))return "That file isn't a photo — use JPG, PNG, WebP or GIF";
  if(f.size>PHOTO_MAX_MB*1048576)return `That photo is ${(f.size/1048576).toFixed(1)} MB — the limit is ${PHOTO_MAX_MB} MB`;
  return "";
}
// Resolves to a JPEG blob, or null if this browser can't read the image.
function shrink(file){return new Promise(res=>{const img=new Image();const u=URL.createObjectURL(file);img.onload=()=>{const m=1400,sc=Math.min(1,m/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>res(b||file),"image/jpeg",.86);};img.onerror=()=>{URL.revokeObjectURL(u);res(null);};img.src=u;});}
async function storePhoto(animalId,slot,file){
  const bad=photoProblem(file);if(bad){toast(bad);return false;}
  const blob=await shrink(file);if(!blob){toast("This browser can't open that photo — try a JPG or PNG");return false;}
  const r=await assetsNs.upload(blob);
  state.photos=state.photos||{};const p=state.photos[animalId]=state.photos[animalId]||{};
  const old=p[slot];p[slot]=r.id;persist();if(old){try{await assetsNs.delete(old);}catch(e){}}
  return true;
}
function coverUrl(id){const p=state.photos&&state.photos[id];return p&&p.cover?(PHOTO_URLS[p.cover]||null):null;}
// Anything you added shows its cover photo in the drawing's frame; otherwise its drawing.
function coverSVG(a,cu){
  const id="cv"+(++svgN);
  return `<svg viewBox="0 0 200 160" role="img" aria-label="Your cover photo of ${esc(a.name)}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${id}"><rect x="5" y="5" width="190" height="150" rx="10"/></clipPath></defs><rect width="200" height="160" fill="#1e2a4f"/><image href="${esc(cu)}" x="5" y="5" width="190" height="150" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/><rect x="5" y="5" width="190" height="150" rx="10" fill="none" stroke="#f3d98a" stroke-width="1.6"/><g fill="#f3d98a"><circle cx="14" cy="14" r="2"/><circle cx="186" cy="14" r="2"/><circle cx="14" cy="146" r="2"/><circle cx="186" cy="146" r="2"/></g></svg>`;
}
function birdArt(b,sex){const cu=b.custom?coverUrl(b.id):null;return cu?coverSVG(b,cu):birdSVG(b,sex);}
// One entry point for every drawing in the app.
function artOf(a,sex){
  const cu=a.custom?coverUrl(a.id):null;if(cu)return coverSVG(a,cu);
  const k=kindOf(a);
  if(k==="bird")return birdSVG(a,sex||"m");
  if(isPlant(a))return plantArt(a.art?a:Object.assign({},a,{art:defaultPlantArt(a)}));
  if(ART[a.id]||!a.art)return animalArt(a);
  const inner=k==="insect"?insectSVG(a):critterSVG(a);
  return `<svg viewBox="0 0 200 160" role="img" aria-label="Illustration: ${esc(a.name)}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
function defaultPlantArt(a){
  const c=(a.colors||[]).map(swatchHex), c1=c[0]||"#df8a7c", c2=c[1]||mixHex(c1,"#f4f2ea",.3);
  const k=kindOf(a);
  if(k==="tree")return {f:"round",leaf:c1==="#df8a7c"?"#4f7a3a":c1,leaf2:c2,trunk:"#6a4a30"};
  if(k==="flower")return {f:"daisy",p:c1,p2:c2,c:"#f2c92c",n:14,leaf:"#4f8a3a"};
  return {f:"mound",leaf:c1==="#df8a7c"?"#4f7a3a":c1,leaf2:c2};
}
function pickPhoto(animalId,slot){
  if(!assetsNs){toast("Photos can't be added in this view");return;}
  const inp=document.createElement("input");inp.type="file";inp.accept=PHOTO_ACCEPT;
  inp.onchange=async()=>{const f=inp.files&&inp.files[0];if(!f)return;
    const bad=photoProblem(f);if(bad){toast(bad);return;}
    toast("Adding photo…");
    try{if(!await storePhoto(animalId,slot,f))return;
      openDetail(animalId);refreshBehind();toast("Photo added");
    }catch(e){toast("Couldn't add that photo");}};
  inp.click();
}
async function removePhoto(animalId,slot){
  const p=state.photos&&state.photos[animalId];if(!p||!p[slot])return;
  if(!confirm("Remove this photo?"))return;
  const id=p[slot];delete p[slot];persist();try{if(assetsNs)await assetsNs.delete(id);}catch(e){}
  openDetail(animalId);refreshBehind();toast("Photo removed");
}


/* ---------------- Views ---------------- */
let tab="birds";
const SEC={};GROUPS.forEach(g=>SEC[g.id]=g.cats[0]);       // which section each group tab shows
const F={sizes:new Set(),colors:new Set(),nowOnly:false,q:"",show:"m",prot:""};
function render(){
  document.querySelectorAll("nav.tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===tab?"true":"false"));
  if(GROUPS.some(g=>g.id===tab))renderGroup(tab);
  else if(tab==="laws")renderLaws();
  else if(tab==="settings")renderSettings();
  else renderLog();
}
function protRow(cat){
  const isB=cat.startsWith("bird");
  const opts=(isB?[["mbta","Migratory Bird Treaty Act"],["nombta","Not covered by it"]]:[]).concat([["F","Federal"],["S","California"],["C","San Francisco"]]);
  return `<div class="frow"><span class="flabel">Protected</span>${opts.map(([k,l])=>`<button class="chip prot prot-${k}" data-prot="${k}" aria-pressed="${F.prot===k}">${k.length===1?`<span class="lbm lb-${k}" aria-hidden="true">${k}</span> `:""}${l}</button>`).join("")}<button class="clear" data-lawtab>How protection works</button></div>`;
}
function renderGroup(gid){
  const g=GROUPS.find(x=>x.id===gid), cat=SEC[gid], C=CATS[cat], v=$("#view");
  const isLB=cat==="bird-local", curM=new Date().getMonth();
  v.innerHTML=`
  <div class="segs" role="tablist" aria-label="${esc(g.label)}">${g.cats.map(c=>`<button role="tab" class="seg" data-sec="${c}" aria-selected="${c===cat}">${esc(CATS[c].label)} <small>${itemsIn(c).length}</small></button>`).join("")}</div>
  <p class="secintro">${esc(C.intro)}</p>
  <section class="filters" aria-label="Filter ${esc(C.label)}">
    ${sortRow()}
    ${isLB?`<div class="frow"><span class="flabel">Show</span>${[["m","Males"],["f","Females"],["y","Young"]].map(([k,l])=>`<button class="chip" data-show="${k}" aria-pressed="${F.show===k}">${l}</button>`).join("")}</div>
    <div class="frow"><span class="flabel">Size</span>${SIZES.map(s=>`<button class="chip" data-size="${s.id}" aria-pressed="${F.sizes.has(s.id)}" title="${esc(s.hint)}">${s.label} <small style="opacity:.7">· ${esc(s.hint)}</small></button>`).join("")}</div>
    <div class="frow"><span class="flabel">Color</span>${COLORS.map(c=>`<button class="sw" data-color="${c.id}" aria-pressed="${F.colors.has(c.id)}" title="${c.id}" style="background:${c.hex}"><span>${c.id}</span></button>`).join("")}</div>`:""}
    ${protRow(cat)}
    <div class="frow">
      ${isLB?`<button class="chip" id="nowBtn" aria-pressed="${F.nowOnly}">Here in ${MONTHS[curM]}</button>`:""}
      <input class="search" id="q" type="search" placeholder="Search by name" value="${esc(F.q)}" aria-label="Search by name">
      <button class="clear" id="clr">Clear filters</button>
      <span class="count" id="count"></span>
    </div>
  </section>
  <div class="row" style="margin-bottom:16px"><button class="btn" id="addItem">Add ${/^[aeiou]/.test(C.noun)?"an":"a"} ${esc(C.noun)}</button><span class="note">${cat==="animal-local"||cat==="animal"?(sampleFn?"New animals get their own tile drawing.":"Add a Claude key in Settings and new animals get their own tile drawing."):"For one that isn't here yet — add a cover photo and a real photo if you like."}</span></div>
  ${addPanel(cat)}
  <div class="grid" id="grid"></div>`;
  v.querySelectorAll("[data-sec]").forEach(b=>b.onclick=()=>{SEC[gid]=b.dataset.sec;F.prot="";renderGroup(gid);});
  v.querySelectorAll("[data-size]").forEach(b=>b.onclick=()=>{const s=b.dataset.size;F.sizes.has(s)?F.sizes.delete(s):F.sizes.add(s);b.setAttribute("aria-pressed",F.sizes.has(s));fillGrid();});
  v.querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{const c=b.dataset.color;F.colors.has(c)?F.colors.delete(c):F.colors.add(c);b.setAttribute("aria-pressed",F.colors.has(c));fillGrid();});
  v.querySelectorAll("[data-show]").forEach(b=>b.onclick=()=>{F.show=b.dataset.show;v.querySelectorAll("[data-show]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.show===F.show));fillGrid();});
  v.querySelectorAll("[data-prot]").forEach(b=>b.onclick=()=>{F.prot=F.prot===b.dataset.prot?"":b.dataset.prot;v.querySelectorAll("[data-prot]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.prot===F.prot));fillGrid();});
  v.querySelectorAll("[data-lawtab]").forEach(b=>b.onclick=()=>{tab="laws";render();window.scrollTo({top:0});});
  wireSort(v,fillGrid);
  const nb=$("#nowBtn");if(nb)nb.onclick=e=>{F.nowOnly=!F.nowOnly;e.currentTarget.setAttribute("aria-pressed",F.nowOnly);fillGrid();};
  $("#q").oninput=e=>{F.q=e.target.value;fillGrid();};
  $("#clr").onclick=()=>{F.sizes.clear();F.colors.clear();F.nowOnly=false;F.q="";F.prot="";renderGroup(gid);};
  wireAdd(cat);
  fillGrid();
}
function protMatch(a){
  if(!F.prot)return true;
  if(F.prot==="mbta")return isMBTA(a);
  if(F.prot==="nombta")return !isMBTA(a);
  return levelsOf(a).includes(F.prot);
}
function fillGrid(){
  const cat=SEC[tab], curM=new Date().getMonth(), isLB=cat==="bird-local", isB=cat.startsWith("bird");
  const items=itemsIn(cat);
  const list=sortList(items.filter(b=>{
    if(isLB){
      if(F.sizes.size&&!F.sizes.has(b.size))return false;
      for(const c of F.colors) if(!(b.colors||[]).includes(c))return false;
      if(F.nowOnly&&!monthsOn(b.months)[curM])return false;
    }
    if(!protMatch(b))return false;
    if(F.q&&!(b.name.toLowerCase().includes(F.q.toLowerCase())||(b.sci||"").toLowerCase().includes(F.q.toLowerCase())))return false;
    return true;}));
  $("#count").textContent=list.length+" of "+items.length;
  const g=$("#grid");
  if(!list.length){g.innerHTML=`<p class="empty" style="grid-column:1/-1">Nothing matches all of those. Try clearing a filter.</p>`;return;}
  const tile=!isB&&!isPlant({cat});
  g.innerHTML=list.map(b=>{const s=currentSym(b);const n=sightingsOf(b.id).length;
    const sex=isLB?F.show:"m";
    const real=isLB?(sex==="y"?photoUrl(b.id,"y"):(b.both?photoUrl(b.id,"a"):photoUrl(b.id,sex))):photoUrl(b.id,"a");
    const inat=isLB?((sex==="m"||(b.both&&sex!=="y"))?b.id:null):b.id;
    return `<button class="card${tile?" tile":""}" data-open="${b.id}">${withPhoto(artOf(b,sex),real,inat)}${lawBadges(b)}<span class="nm">${esc(b.name)}</span><span class="kw ${s.mine?"mine":""}">${esc(s.keys.join(" · "))}</span>${n?`<span class="seen">${isB?"seen":"met"} ${n}×</span>`:""}</button>`;}).join("");
  g.querySelectorAll("[data-open]").forEach(c=>c.onclick=()=>openDetail(c.dataset.open));
}

/* ---------------- Add a bird / animal / plant ---------------- */
const BIRD_SHAPES=[["song","Songbird"],["hummer","Hummingbird"],["dove","Dove or pigeon"],["quail","Quail"],["duck","Duck"],["goose","Goose"],["gull","Gull or tern"],["pelican","Pelican"],["cormorant","Cormorant"],["wader","Heron, egret or ibis"],["raptor","Hawk, falcon or eagle"],["owl","Owl"],["penguin","Penguin"]];
const WHEN=[["all","Here all year"],["9-4","Fall and winter"],["3-9","Spring and summer"],["","Not sure yet"]];
const CRITTER_SIZES=[["tiny","Tiny (insect)"],["small","Small (mouse to cat)"],["medium","Medium (fox, dog)"],["large","Large (deer, wolf)"],["xlarge","Huge (bear and up)"]];
function swatchHex(id){const c=COLORS.find(x=>x.id===id);if(!c)return "#8a8f96";return id==="iridescent"?"#2f8f7a":c.hex;}
function mixHex(h,w,amt){const p=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));const a=p(h),b=p(w);return "#"+a.map((v,i)=>Math.round(v+(b[i]-v)*amt).toString(16).padStart(2,"0")).join("");}
// A simple palette for the medallion from the colors chosen, in order: main, belly, wings.
function paletteFrom(colors){
  const c=colors.map(swatchHex);const main=c[0]||"#8a8f96";
  const belly=c[1]||mixHex(main,"#f4f2ea",.55), wing=c[2]||mixHex(main,"#1c1c22",.25);
  return {head:main,back:main,belly,wing,tail:wing};
}
let NI={colors:[],size:"small",cover:null,real:null};
function addPanel(cat){
  const C=CATS[cat], isB=cat.startsWith("bird"), local=cat.endsWith("-local"), plant=isPlant({cat}), lp=plant&&local;
  return `<div class="panel addbird" id="addPanel" hidden>
    <div class="field"><label for="niName">${esc(C.noun[0].toUpperCase()+C.noun.slice(1))}</label><input id="niName" placeholder="Name"></div>
    ${isB?`<div class="field"><label>Size</label><div class="row">${SIZES.map(z=>`<button class="chip" data-nsize="${z.id}" aria-pressed="${NI.size===z.id}">${z.label} <small style="opacity:.7">· ${esc(z.hint)}</small></button>`).join("")}</div></div>
    <div class="field"><label for="niShape">Shape (for the drawing, if you don't add a cover photo)</label><select id="niShape" class="selbox">${BIRD_SHAPES.map(([k,l])=>`<option value="${k}">${l}</option>`).join("")}</select></div>`
    :plant?"":`<div class="field"><label for="niSize">Size</label><select id="niSize" class="selbox">${CRITTER_SIZES.map(([k,l])=>`<option value="${k}" ${k==="medium"?"selected":""}>${l}</option>`).join("")}</select></div>`}
    <div class="field"><label>Colors — tap up to three${isB?": main color, then belly, then wings":""}</label><div class="row">${COLORS.map(c=>`<button class="sw" data-ncolor="${c.id}" aria-pressed="${NI.colors.includes(c.id)}" title="${c.id}" style="background:${c.hex}"><span>${c.id}</span></button>`).join("")}</div></div>
    ${local?`<div class="field"><label for="niWhen">When it's in San Francisco</label><select id="niWhen" class="selbox">${WHEN.map(([k,l])=>`<option value="${k}">${l}</option>`).join("")}</select></div>`:""}
    <div class="field"><label for="niWhere">${local?"Where you find it":"Where it lives"} (optional)</label><input id="niWhere" placeholder="${local?"e.g. Under the ferns at the Botanical Garden in winter":"e.g. Cloud forests of Costa Rica"}"></div>
    <div class="field"><label for="niKeys">A few keywords, separated by commas</label><input id="niKeys" placeholder="hidden song, patience, winter light"></div>
    <div class="field"><label for="niWhy">What it means to you</label><textarea id="niWhy"></textarea></div>
    ${lp?`<div class="field"><label for="niUses">Herbal uses (optional)</label><textarea id="niUses"></textarea></div><div class="field"><label for="niHarvest">How to harvest (optional)</label><textarea id="niHarvest"></textarea></div>`:""}
    <div class="photopick">
      <div class="pp"><div class="pplabel">Cover photo <small>(shown where the drawing goes)</small></div><div class="ppprev" id="niCoverPrev">${NI.cover?`<img src="${esc(NI.cover.url)}" alt="">`:"No cover yet — a drawing is made from its colors"}</div><div class="row"><button class="btn alt" id="niCover">${NI.cover?"Change":"Choose a photo"}</button>${NI.cover?`<button class="clear" id="niCoverX">Remove</button>`:""}</div></div>
      <div class="pp"><div class="pplabel">Real photo <small>(fades in when you hover or tap)</small></div><div class="ppprev" id="niRealPrev">${NI.real?`<img src="${esc(NI.real.url)}" alt="">`:"Optional — without one, iNaturalist is searched by name"}</div><div class="row"><button class="btn alt" id="niReal">${NI.real?"Change":"Choose a photo"}</button>${NI.real?`<button class="clear" id="niRealX">Remove</button>`:""}</div></div>
    </div>
    <p class="note rules"><strong>Photo size and format:</strong> ${esc(PHOTO_RULES)} ${esc(COVER_RULES)}</p>
    <div class="row"><button class="btn" id="niSave">Save</button><button class="btn alt" id="niCancel">Cancel</button></div>
  </div>`;
}
function wireAdd(cat){
  const pnl=$("#addPanel");if(!pnl)return;
  const ids=["niName","niShape","niSize","niWhen","niWhere","niKeys","niWhy","niUses","niHarvest"];
  const keep=()=>Object.fromEntries(ids.map(i=>[i,$("#"+i)?$("#"+i).value:null]));
  const redraw=()=>{const k=keep();pnl.outerHTML=addPanel(cat);$("#addPanel").hidden=false;ids.forEach(i=>{if($("#"+i)&&k[i]!=null)$("#"+i).value=k[i];});wireAdd(cat);};
  $("#addItem").onclick=()=>{pnl.hidden=false;$("#niName").focus();};
  pnl.querySelectorAll("[data-nsize]").forEach(b=>b.onclick=()=>{NI.size=b.dataset.nsize;pnl.querySelectorAll("[data-nsize]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.nsize===NI.size));});
  pnl.querySelectorAll("[data-ncolor]").forEach(b=>b.onclick=()=>{const c=b.dataset.ncolor,i=NI.colors.indexOf(c);
    if(i>=0)NI.colors.splice(i,1);else{if(NI.colors.length>=3){toast("Up to three colors");return;}NI.colors.push(c);}
    pnl.querySelectorAll("[data-ncolor]").forEach(x=>x.setAttribute("aria-pressed",NI.colors.includes(x.dataset.ncolor)));});
  const pick=slot=>{const inp=document.createElement("input");inp.type="file";inp.accept=PHOTO_ACCEPT;
    inp.onchange=async()=>{const f=inp.files&&inp.files[0];if(!f)return;const bad=photoProblem(f);if(bad){toast(bad);return;}
      const blob=await shrink(f);if(!blob){toast("This browser can't open that photo — try a JPG or PNG");return;}
      if(NI[slot])URL.revokeObjectURL(NI[slot].url);NI[slot]={blob,url:URL.createObjectURL(blob)};redraw();};
    inp.click();};
  $("#niCover").onclick=()=>pick("cover");$("#niReal").onclick=()=>pick("real");
  const cx=$("#niCoverX");if(cx)cx.onclick=()=>{URL.revokeObjectURL(NI.cover.url);NI.cover=null;redraw();};
  const rx=$("#niRealX");if(rx)rx.onclick=()=>{URL.revokeObjectURL(NI.real.url);NI.real=null;redraw();};
  $("#niCancel").onclick=()=>{pnl.hidden=true;};
  $("#niSave").onclick=async()=>{
    const name=$("#niName").value.trim();if(!name){$("#niName").focus();toast("Give it a name");return;}
    const keys=$("#niKeys").value.split(",").map(x=>x.trim()).filter(Boolean).slice(0,6);
    const isB=cat.startsWith("bird"), colors=NI.colors.slice();
    const na={id:"c-"+uid(),cat,custom:true,name,colors,where:$("#niWhere").value.trim(),
      sym:{keys:keys.length?keys:["(add your keywords)"],why:$("#niWhy").value.trim()||"Your own reading — add more whenever it comes to you.",src:"mine"}};
    if($("#niWhen"))na.months=$("#niWhen").value;
    if(isB){na.kind="bird";na.size=NI.size;na.shape=$("#niShape").value;na.both=paletteFrom(colors.length?colors:["gray"]);}
    else if($("#niSize"))na.size=$("#niSize").value;
    else na.size="small";
    if($("#niUses"))na.uses=$("#niUses").value.trim();
    if($("#niHarvest"))na.harvest=$("#niHarvest").value.trim();
    try{
      if(assetsNs&&(NI.cover||NI.real)){state.photos=state.photos||{};const p=state.photos[na.id]={};
        if(NI.cover)p.cover=(await assetsNs.upload(NI.cover.blob)).id;
        if(NI.real)p.a=(await assetsNs.upload(NI.real.blob)).id;}
    }catch(e){toast("Couldn't save the photos — it's saved without them");}
    state.custom.push(na);persist();
    ["cover","real"].forEach(k=>{if(NI[k])URL.revokeObjectURL(NI[k].url);});
    NI={colors:[],size:"small",cover:null,real:null};
    renderGroup(tab);toast(name+" added");
    if(sampleFn&&kindOf(na)==="animal"&&!coverUrl(na.id))drawAnimal(na);
  };
}

/* ---------------- Laws ---------------- */
function lawDetail(L){
  return `${L.what?`<p>${esc(L.what)}</p>`:""}${L.allows?`<p><b>Exceptions:</b> ${esc(L.allows)}</p>`:""}${L.penalty?`<p><b>Penalties:</b> ${esc(L.penalty)}</p>`:""}${L.note?`<p><b>Note:</b> ${esc(L.note)}</p>`:""}<p class="cite">${esc(L.cite)}${L.url?` · <a href="${esc(L.url)}" target="_blank" rel="noopener">source</a>`:""}</p>`;
}
function renderLaws(){
  const v=$("#view"), items=allItems();
  const by={};items.forEach(a=>lawsOf(a).forEach(k=>{if(LAWS[k])(by[k]=by[k]||[]).push(a);}));
  const lvBlock=L=>{
    const keys=Object.keys(LAWS).filter(k=>LAWS[k].lv===L&&by[k]&&by[k].length);
    return `<section class="lawlv"><h3><span class="lb lb-${L} big" aria-hidden="true">${L}</span> ${esc(LAW_LEVELS[L])}</h3>
      <h4>Species-specific protections in Kindred Creatures</h4>
      ${keys.length?keys.map(k=>{const Lw=LAWS[k];return `<details class="law${Lw.info?" info":""}"><summary><span class="lname">${esc(Lw.name)}</span> <span class="lcount">${by[k].length}</span><span class="lshort">${esc(Lw.short)}</span></summary>${lawDetail(Lw)}<div class="who">${by[k].map(a=>`<button class="chip" data-open="${a.id}">${esc(a.name)}</button>`).join("")}</div></details>`;}).join(""):`<p class="note">None yet.</p>`}
      <h4>Rules that cover whole groups</h4>
      ${OVERALL.filter(o=>o.lv===L).map(o=>`<div class="overall"><div class="otitle">${esc(o.title)} <span class="ofor">${esc({all:"everyone",birds:"all birds",animals:"all animals",plants:"all plants",trees:"all trees"}[o.for]||o.for)}</span></div><p>${esc(o.body)}</p><p class="cite">${esc(o.cite)}</p></div>`).join("")}
    </section>`;};
  v.innerHTML=`
  <div class="intro lawintro">
    <h3>Who's protected, and how</h3>
    <p>Each creature or plant can carry up to three letters: <span class="lb lb-F" aria-hidden="true">F</span> federal, <span class="lb lb-S" aria-hidden="true">S</span> California and <span class="lb lb-C" aria-hidden="true">C</span> San Francisco (city and county). Hover or tap a letter on any card for that species' short rules; open the card for the full list. Rules that cover everyone — like San Francisco's significant-tree permits or the ban on picking in parks — are below rather than on every card.</p>
    <p class="note">Plain-language summaries for orientation, not legal advice. A ✓ means the summary was checked against the current code text on 10/02/26; the rest are careful summaries to verify before relying on them. Statuses (like the monarch's) change — check the agency when it matters.</p>
  </div>
  ${["F","S","C"].map(lvBlock).join("")}`;
  v.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openDetail(b.dataset.open));
}
function protectionSection(a){
  const keys=lawsOf(a).filter(k=>LAWS[k]);
  const lvName={F:"Federal",S:"California",C:"San Francisco"};
  const group=isBirdObj(a)?"birds":isPlant(a)?(kindOf(a)==="tree"?"trees":"plants"):"animals";
  const general=OVERALL.filter(o=>o.for===group||o.for==="all"||(group==="trees"&&o.for==="plants"));
  return `<div class="sect">
    <h3>Who protects it</h3>
    ${keys.length?["F","S","C"].map(L=>{const ks=keys.filter(k=>LAWS[k].lv===L);if(!ks.length)return "";return `<div class="plv"><span class="lb lb-${L} big" aria-hidden="true">${L}</span><div><div class="plvname">${lvName[L]}</div>${ks.map(k=>{const Lw=LAWS[k];return `<details class="law${Lw.info?" info":""}"><summary><span class="lname">${esc(Lw.name)}</span><span class="lshort">${esc(Lw.short)}</span>${lawNote(a,k)?`<span class="lnote">${esc(lawNote(a,k))}</span>`:""}</summary>${lawDetail(Lw)}</details>`;}).join("")}</div></div>`;}).join("")
      :`<p class="note">No species-specific protections found${lawNote(a,"none")?"":" — the general rules below still apply"}.</p>`}
    ${lawNote(a,"none")?`<p class="note">${esc(lawNote(a,"none"))}</p>`:""}
    <p class="note">Also covered by ${general.length} general rule${general.length===1?"":"s"} for ${group}${isLocal(a)?" in San Francisco":""} (${general.slice(0,3).map(o=>esc(o.title.toLowerCase())).join("; ")}${general.length>3?"…":""}). <button class="clear" data-lawtab>See Laws</button></p>
  </div>`;
}

/* ---------------- Detail ---------------- */
function meaningSection(a,s,hist){
  const yours=s.mine;
  return `<div class="sect">
      <h3>${yours?"What it means to you":"What it might mean"}</h3>
      <div class="keys">${s.keys.map(k=>`<button class="key ${yours?"mine":"pred"}" data-why aria-expanded="false">${esc(k)}</button>`).join("")}</div>
      <div class="why ${yours?"conf":"pred"}" id="why" hidden>${esc(s.why)}<span class="src">${yours?(s.confirmed?`Confirmed as yours, ${esc(fmtMonth(s.month))}.`:`Your meaning, ${esc(fmtMonth(s.month))}.`):esc(a.sym.src==="mine"?"Your own reading.":SRC[a.sym.src]||"")}</span></div>
      <div class="row" style="margin-top:12px">
        ${yours?"":`<button class="btn rose" id="confirmMeaning">Yes, this is what it means to me</button>`}
        <button class="btn alt" id="editBtn">${yours?"Change my meaning":"Actually, to me this means…"}</button>
        <button class="btn alt" id="histBtn" ${hist.length?"":"disabled"}>History${hist.length?` (${hist.length})`:""}</button>
      </div>
      <p class="note">${yours?"Your meanings show in plain type. Suggestions stay in italics until you confirm or rewrite them.":"Suggested meanings are in italics until you confirm or rewrite them."}</p>
      <div class="panel" id="editPanel" hidden>
        <div class="field"><label for="myText">In your own words</label><textarea id="myText" placeholder="Actually, to me these mean…"></textarea></div>
        <div class="field"><label for="myKeys">Keywords, separated by commas</label><input id="myKeys" placeholder="e.g. my grandmother, courage, summer mornings"></div>
        <div class="row" style="margin-bottom:10px">${sampleFn?`<button class="btn alt" id="suggestKeys">Pull keywords from my words</button>`:""}<span class="note" id="sugNote"></span></div>
        <div class="field" style="max-width:220px"><label for="myMonth">Month and year (MM/YY)</label><input id="myMonth" inputmode="numeric" placeholder="MM/YY" value="${fmtMonth(thisMonth())}"></div>
        <div class="row"><button class="btn rose" id="saveMeaning">Save my meaning</button><button class="btn alt" id="cancelMeaning">Cancel</button>${yours?`<button class="btn alt" id="resetMeaning">Go back to the suggested meaning</button>`:""}</div>
      </div>
      <div class="panel" id="histPanel" hidden>
        <ul class="hist">
          ${[...hist].reverse().map(h=>`<li><div class="when">${esc(fmtMonth(h.month))}</div>${h.reset?`<em>Returned to the suggested meaning</em>`:`${h.confirmed?`<div class="note">Confirmed the suggestion</div>`:""}<div><strong>${esc(h.keys.join(", "))}</strong></div>${h.text&&!h.confirmed?`<div>${esc(h.text)}</div>`:""}`}</li>`).join("")}
          <li class="orig"><div class="when">Suggested</div><div><em>${esc(a.sym.keys.join(", "))}</em></div></li>
        </ul>
      </div>
    </div>`;
}
function plantUseSection(a){
  const row=(field,label,confirmLabel)=>{const n=plantNote(a,field);if(!n.text&&!a[field])return "";return `<div class="use" data-field="${field}"><div class="ulabel">${label}</div>
      <div class="utext ${n.mine?"conf":"pred"}">${esc(n.text||"—")}${n.mine?`<span class="src">${n.confirmed?"Confirmed as yours":"Your words"}, ${esc(fmtMonth(n.month))}.</span>`:""}</div>
      <div class="row">${n.mine?"":`<button class="btn rose small" data-uconfirm="${field}">${confirmLabel}</button>`}<button class="btn alt small" data-uedit="${field}">${n.mine?"Change":"Rewrite"}</button>${n.mine?`<button class="clear" data-ureset="${field}">Go back to the suggestion</button>`:""}</div>
      <div class="panel" data-upanel="${field}" hidden><textarea>${esc(n.text)}</textarea><div class="row"><button class="btn rose small" data-usave="${field}">Save</button><button class="btn alt small" data-ucancel="${field}">Cancel</button></div></div></div>`;};
  return `<div class="sect plantuse">
    <h3>Uses and harvesting</h3>
    ${row("uses","Herbal and traditional uses","Yes, I use it this way")}
    ${row("harvest","How to harvest","Yes, this is how I harvest it")}
    ${a.caution?`<div class="caution"><b>Caution:</b> ${esc(a.caution)}</div>`:""}
    <p class="note">Traditional uses, for your own research and journaling — not medical advice. Be certain of a plant's identity before using it, and check Laws before picking: almost nothing may be taken from SF parks or land that isn't yours.</p>
  </div>`;
}
function openDetail(id){
  const a=findAny(id);if(!a)return;
  const k=kindOf(a), isBird=k==="bird", guideBird=BIRDS.includes(a), local=isLocal(a);
  const hasSexes=isBird&&!a.custom;
  const dlg=$("#dlg"), sh=$("#sheet"), curM=new Date().getMonth();
  const s=currentSym(a), hist=state.meanings[a.id]||[];
  const seen=sightingsOf(a.id).sort((x,y)=>y.date.localeCompare(x.date));
  const sizeLbl=isBird?SIZES.find(z=>z.id===a.size):null;
  const on=monthsOn(a.months);
  const aabName=guideBird&&a.id!=="red-masked-parakeet"?a.name.replace(/'/g,"").replace(/ /g,"_"):null;
  const C=CATS[catOf(a)];
  sh.innerHTML=`
  <div class="sheet-head">
    <h2 id="dlgTitle">${esc(a.name)}</h2>
    <div class="sub">${a.sci&&!a.custom?`<i>${esc(a.sci)}</i> · `:""}${esc(C.label)}${sizeLbl?` · ${sizeLbl.label}`:""}${a.custom?" · your own addition":""}${seen.length?` · you've logged ${seen.length}`:""}</div>
    ${lawBadges(a,true)}
    <button class="x" id="xBtn" aria-label="Close">×</button>
  </div>
  <div class="sheet-body">
    ${hasSexes?`
    <div class="sect">
      <h3>${a.both?"Adults and young":"Male, female and young"}</h3>
      <div class="pair">
        ${(a.both?[["a","Adult (male and female alike)",""],["y","Young",youngNote(a)]]:[["m","Male",a.mNote||""],["f","Female",a.fNote||""],["y","Young",youngNote(a)]]).map(([kk,l,n])=>{
          const url=photoUrl(a.id,kk);
          return `<figure class="fig">${withPhoto(birdSVG(a,kk==="a"?"m":kk),url,(kk==="m"||kk==="a")?a.id:null)}<figcaption>${l}</figcaption><div class="cap2">${esc(n)}</div>${assetsNs?`<div class="phrow"><button data-addph="${kk}">${url?"Change photo":"Add your photo"}</button>${url?`<button data-rmph="${kk}">Remove</button>`:""}</div>`:""}</figure>`;}).join("")}
      </div>
      <p class="photo-link">Drawings are stylized. Hover (or tap) the ${a.both?"adult":"male"} drawing for a real photo; add your own photos and they show up the same way.${aabName?` More: <a href="https://www.allaboutbirds.org/guide/${aabName}" target="_blank" rel="noopener">All About Birds</a>.`:""}</p>
      <p class="note" id="inatCredit"></p>
    </div>`:`
    <div class="sect">
      <figure class="fig solo">${withPhoto(artOf(a,"m"),photoUrl(a.id,"a"),a.id)}
        ${(assetsNs||(a.custom&&sampleFn&&k==="animal"))?`<div class="phrow">${a.custom&&sampleFn&&k==="animal"&&!coverUrl(a.id)?`<button id="redraw" ${a.drawing?"disabled":""}>${a.drawing?"Drawing…":a.svg?"Redraw":"Draw it"}</button>`:""}${assetsNs?`${a.custom?`<button data-addph="cover">${coverUrl(a.id)?"Change cover photo":"Add a cover photo"}</button>${coverUrl(a.id)?`<button data-rmph="cover">Remove cover</button>`:""}`:""}<button data-addph="a">${photoUrl(a.id,"a")?"Change real photo":"Add your photo"}</button>${photoUrl(a.id,"a")?`<button data-rmph="a">Remove</button>`:""}`:""}</div>`:""}
      </figure>
      <p class="photo-link">Hover (or tap) the picture for a real photo.</p>
      <p class="note" id="inatCredit"></p>
      ${a.custom?`<p class="note rules">${esc(PHOTO_RULES)} ${esc(COVER_RULES)}</p>`:""}
    </div>`}
    ${guideBird||(local&&a.months!==undefined)||a.where?`<div class="sect">
      <h3>${local?"When and where in San Francisco":"Where in the world"}</h3>
      ${guideBird||(local&&a.months!==undefined)?(!a.months?`<p class="note">You haven't said when it's here.</p>`:on.every(Boolean)?`<span class="always">Here all year</span>`:`<div class="months">${MONTHS.map((m,i)=>`<div class="${on[i]?"on":""} ${i===curM?"now":""}">${m[0]}<span class="sr">${m} ${on[i]?"present":"absent"}</span></div>`).join("")}</div>`):""}
      ${a.where?`<p class="note">${esc(a.where)}</p>`:""}
    </div>`:""}
    ${meaningSection(a,s,hist)}
    ${isPlant(a)&&local?plantUseSection(a):""}
    ${protectionSection(a)}
    <div class="sect">
      <h3>${isBird?"Add a sighting":"Log an encounter"}</h3>
      <div class="row" style="margin-bottom:10px">
        <div class="field" style="margin:0"><label for="sDate">Date (MM/DD/YY)</label><input id="sDate" inputmode="numeric" placeholder="MM/DD/YY" value="${usDate(today())}" style="max-width:150px"></div>
        ${isBird?`<div class="field" style="margin:0"><label>Which one</label><div class="row" id="sexRow">${(a.both||a.custom?["a","y","?"]:["m","f","y","?"]).map(x=>`<button class="chip" data-sex="${x}" aria-pressed="${x==="?"}">${{m:"Male",f:"Female",a:"Adult",y:"Young","?":"Not sure"}[x]}</button>`).join("")}</div></div>`:""}
      </div>
      ${!isBird?`<div class="field"><label>How it came to you</label><div class="row" id="howRow">${["In person","Image or art","Dream","Words or song","Other"].map(h=>`<button class="chip" data-how="${h}" aria-pressed="false">${h}</button>`).join("")}</div></div>`:""}
      <div class="field"><label>Where (optional)</label><div class="row" id="placeRow">${[["home","Home"],["park","Park"],["other","Other"]].map(([kk,l])=>`<button class="chip" data-place="${kk}" aria-pressed="false">${l}</button>`).join("")}<input id="placeText" placeholder="Where?" style="display:none;border:1.5px solid var(--line);background:var(--paper-2);border-radius:999px;padding:4px 12px;min-width:160px"></div></div>
      <div class="field"><label for="sNote">Note (optional)</label><input id="sNote" placeholder="What was it doing? What were you thinking about?"></div>
      <div class="row"><button class="btn" id="addSight">${isBird?"Add sighting":"Log encounter"}</button><button class="chip" id="pinAfter" aria-pressed="false">Then drop a pin on the map</button></div>
      ${seen.length?`<ul class="hist" style="margin-top:14px">${seen.slice(0,6).map(x=>`<li><span class="when">${fmtDate(x.date)}</span> ${x.place?"· "+esc(x.place==="other"?x.placeText||"Other":x.place==="home"?"Home":"Park"):""}${x.how?" · "+esc(x.how):""}${x.note?" — "+esc(x.note):""}</li>`).join("")}</ul>`:""}
    </div>
    ${a.custom?`<div class="row"><button class="btn alt" id="delAnimal">Remove this ${esc(C.noun)}</button></div>`:""}
  </div>`;
  wireDetail(a,isBird);
  if(!dlg.open)dlg.showModal();
  sh.scrollTop=0;
}

function wireDetail(a,isBird){
  const dlg=$("#dlg"), sh=$("#sheet");
  $("#xBtn").onclick=()=>dlg.close();
  const rd=$("#redraw");if(rd)rd.onclick=()=>{rd.disabled=true;rd.textContent="Drawing…";drawAnimal(a);};
  sh.querySelectorAll("[data-addph]").forEach(b=>b.onclick=()=>pickPhoto(a.id,b.dataset.addph));
  sh.querySelectorAll("[data-rmph]").forEach(b=>b.onclick=()=>removePhoto(a.id,b.dataset.rmph));
  sh.querySelectorAll(".fig .pic").forEach(pc=>{if(pc.querySelector("img.ph"))pc.onclick=()=>pc.classList.toggle("showph");});
  sh.querySelectorAll("[data-why]").forEach(k=>k.onclick=()=>{const w=$("#why");w.hidden=!w.hidden;sh.querySelectorAll("[data-why]").forEach(x=>x.setAttribute("aria-expanded",!w.hidden));});
  $("#editBtn").onclick=()=>{$("#editPanel").hidden=false;$("#histPanel").hidden=true;$("#myText").focus();};
  $("#cancelMeaning").onclick=()=>{$("#editPanel").hidden=true;};
  $("#histBtn").onclick=()=>{const p=$("#histPanel");p.hidden=!p.hidden;$("#editPanel").hidden=true;};
  $("#saveMeaning").onclick=()=>{
    const text=$("#myText").value.trim();
    let keys=$("#myKeys").value.split(",").map(x=>x.trim()).filter(Boolean).slice(0,6);
    if(!text&&!keys.length){toast("Write a few words first");$("#myText").focus();return;}
    if(!keys.length) keys=text.split(/[,.;]/).map(x=>x.trim()).filter(Boolean).slice(0,3).map(x=>x.split(" ").slice(0,4).join(" "));
    const mo=parseUSMonth($("#myMonth").value);if(!mo){toast("Use MM/YY for the month, like 09/26");$("#myMonth").focus();return;}
    (state.meanings[a.id]=state.meanings[a.id]||[]).push({keys,text,month:mo,t:Date.now()});
    persist();openDetail(a.id);refreshBehind();toast("Meaning saved");
  };
  const rs=$("#resetMeaning");if(rs)rs.onclick=()=>{(state.meanings[a.id]=state.meanings[a.id]||[]).push({reset:true,keys:[],text:"",month:parseUSMonth($("#myMonth").value)||thisMonth(),t:Date.now()});persist();openDetail(a.id);refreshBehind();toast("Back to the suggested meaning");};
  const sg=$("#suggestKeys");
  if(sg)sg.onclick=async()=>{
    const text=$("#myText").value.trim();if(!text){toast("Write your meaning first");$("#myText").focus();return;}
    sg.disabled=true;$("#sugNote").textContent="Thinking…";
    try{
      const r=await sampleFn.json(`Someone keeps a personal nature-symbolism journal. They wrote what the ${a.name} means to them:\n"""${text}"""\nDistill it into 2 to 4 short keywords or phrases (1-3 words each) in their own spirit, lowercase. Respond only with JSON: {"keywords":["..."]}`,{modelTier:"quick"});
      if(r&&Array.isArray(r.keywords)){$("#myKeys").value=r.keywords.slice(0,4).join(", ");$("#sugNote").textContent="Edit these however you like.";}
      else $("#sugNote").textContent="";
    }catch(e){$("#sugNote").textContent="";if(e&&e.code==="not_granted")sg.remove();else toast("Couldn't pull keywords right now");}
    sg.disabled=false;
  };
  $("#pinAfter").onclick=e=>{const b=e.currentTarget;b.setAttribute("aria-pressed",b.getAttribute("aria-pressed")!=="true");};
  let sex="?",place="",how="";
  sh.querySelectorAll("[data-sex]").forEach(b=>b.onclick=()=>{sex=b.dataset.sex;sh.querySelectorAll("[data-sex]").forEach(x=>x.setAttribute("aria-pressed",x===b));});
  sh.querySelectorAll("[data-how]").forEach(b=>b.onclick=()=>{how=how===b.dataset.how?"":b.dataset.how;sh.querySelectorAll("[data-how]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.how===how));});
  sh.querySelectorAll("[data-place]").forEach(b=>b.onclick=()=>{place=place===b.dataset.place?"":b.dataset.place;sh.querySelectorAll("[data-place]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.place===place));const pt=$("#placeText");pt.style.display=place==="other"?"":"none";if(place==="other")pt.focus();});
  $("#addSight").onclick=()=>{
    const date=parseUS($("#sDate").value);if(!date){toast("Use MM/DD/YY for the date, like 09/30/26");$("#sDate").focus();return;}
    const sid=uid();
    state.sightings.push({id:sid,animalId:a.id,date,sex:isBird?sex:undefined,place,placeText:place==="other"?$("#placeText").value.trim():"",how:isBird?"":how,note:$("#sNote").value.trim(),t:Date.now()});
    persist();
    if($("#pinAfter").getAttribute("aria-pressed")==="true"){dlg.close();startPinning(sid);return;}
    openDetail(a.id);refreshBehind();toast(isBird?"Sighting added":"Encounter logged");
  };
  const da=$("#delAnimal");if(da)da.onclick=()=>{if(!confirm("Remove "+a.name+"? Its sightings and meanings will be removed too."))return;state.custom=state.custom.filter(c=>c.id!==a.id);state.sightings=state.sightings.filter(x=>x.animalId!==a.id);delete state.meanings[a.id];
    const ph=state.photos&&state.photos[a.id];if(ph){Object.values(ph).forEach(pid=>{try{assetsNs&&assetsNs.delete(pid);}catch(e){}});delete state.photos[a.id];}
    persist();dlg.close();render();};

  sh.querySelectorAll("[data-lawtab]").forEach(b=>b.onclick=()=>{dlg.close();tab="laws";render();window.scrollTo({top:0});});
  const cm=$("#confirmMeaning");if(cm)cm.onclick=()=>{(state.meanings[a.id]=state.meanings[a.id]||[]).push({keys:a.sym.keys.slice(),text:a.sym.why,month:thisMonth(),t:Date.now(),confirmed:true});persist();openDetail(a.id);refreshBehind();toast("Saved as your meaning");};
  // herbal uses / harvest: confirm, rewrite, reset
  state.notes=state.notes||{};
  const setNote=(f,v)=>{(state.notes[a.id]=state.notes[a.id]||{})[f]=v;persist();openDetail(a.id);};
  sh.querySelectorAll("[data-uconfirm]").forEach(b=>b.onclick=()=>{const f=b.dataset.uconfirm;setNote(f,{text:a[f],confirmed:true,month:thisMonth(),t:Date.now()});toast("Saved as yours");});
  sh.querySelectorAll("[data-uedit]").forEach(b=>b.onclick=()=>{const p=sh.querySelector(`[data-upanel="${b.dataset.uedit}"]`);p.hidden=false;p.querySelector("textarea").focus();});
  sh.querySelectorAll("[data-ucancel]").forEach(b=>b.onclick=()=>{sh.querySelector(`[data-upanel="${b.dataset.ucancel}"]`).hidden=true;});
  sh.querySelectorAll("[data-usave]").forEach(b=>b.onclick=()=>{const f=b.dataset.usave;const t=sh.querySelector(`[data-upanel="${f}"] textarea`).value.trim();if(!t){toast("Write a few words first");return;}setNote(f,{text:t,confirmed:false,month:thisMonth(),t:Date.now()});toast("Saved");});
  sh.querySelectorAll("[data-ureset]").forEach(b=>b.onclick=()=>{const f=b.dataset.ureset;if(state.notes[a.id])delete state.notes[a.id][f];persist();openDetail(a.id);});
}

/* ---------------- My sightings ---------------- */
let logFilter="all", pinning=null, selPin=null;
function startPinning(sid){pinning=sid;selPin=null;tab="log";render();
  const m=$("#mapcard");if(m)m.scrollIntoView({behavior:"smooth",block:"start"});}
function renderLog(){
  const v=$("#view");
  const all=[...state.sightings].sort((a,b)=>b.date.localeCompare(a.date)||(b.t||0)-(a.t||0));
  const grp=id=>{const k=kindOf(findAny(id));return k==="bird"?"birds":k==="insect"?"insects":["tree","flower","green"].includes(k)?"plants":"animals";};
  const list=all.filter(s=>findAny(s.animalId)&&(logFilter==="all"||grp(s.animalId)===logFilter));
  const kinds=new Set(state.sightings.filter(s=>BIRDS.some(b=>b.id===s.animalId)).map(s=>s.animalId)).size;
  const pinned=list.filter(s=>typeof s.lat==="number"&&findAny(s.animalId));
  const pinS=pinning&&state.sightings.find(s=>s.id===pinning), pinA=pinS&&findAny(pinS.animalId);
  const pins=pinned.map(s=>{const a=findAny(s.animalId);return {id:s.id,lat:s.lat,lng:s.lng,bird:isBirdObj(a),plant:isPlant(a),sel:s.id===selPin,title:a.name+" · "+fmtDate(s.date)};});
  let html=`<div class="log-summary"><div><b>${kinds}</b> of ${BIRDS.length} SF birds seen</div><div><b>${new Set(state.sightings.map(s=>s.animalId)).size}</b> creatures and plants met</div><div><b>${state.sightings.length}</b> sightings and signs</div></div>
  <div class="row" style="margin-bottom:10px">
    ${["all","birds","animals","insects","plants"].map(k=>`<button class="chip" data-lf="${k}" aria-pressed="${logFilter===k}">${{all:"Everything",birds:"Birds",animals:"Animals",insects:"Insects",plants:"Plants"}[k]}</button>`).join("")}
    ${downloadsNs?`<button class="btn alt" id="exp" style="margin-left:auto">Save a backup file</button>`:""}
  </div>
  <section class="mapcard" id="mapcard" aria-label="Map of your sightings">
    <div class="maphead"><h3>Where you saw them</h3><span class="note">${pinned.length?`${pinned.length} pin${pinned.length>1?"s":""}`:"No pins yet — tap “Drop pin” on any sighting below"}</span>
      <div class="mapzoom"><button data-zoom="in" aria-label="Zoom in">+</button><button data-zoom="out" aria-label="Zoom out">−</button><button data-zoom="all">Whole city</button></div></div>
    ${pinA?`<div class="mapbanner"><span>Tap the map where you saw the <strong>${esc(pinA.name)}</strong> (${fmtDate(pinS.date)}). Drag to move around; zoom in for neighborhoods.</span><button class="btn alt" id="pinCancel">Cancel</button></div>`:""}
    <div class="mapbox${pinA?" placing":""}">${sfMapSVG(pins)}</div>
    <div id="pinInfo"></div>
  </section>`;
  if(!list.length) html+=`<p class="empty">Nothing logged yet. Open any bird, animal or plant and log it when you meet one.</p>`;
  let lastM="";
  list.forEach(s=>{
    const a=findAny(s.animalId);if(!a)return;
    const m=s.date.slice(0,7);if(m!==lastM){html+=`<div class="logmonth">${monthHeading(m)}</div>`;lastM=m;}
    const place=s.place==="other"?(s.placeText||"Other"):({home:"Home",park:"Park"}[s.place]||"");
    const pic=isBirdObj(a)?artOf(a,["f","y"].includes(s.sex)?s.sex:"m"):`<span class="emo">${artOf(a)}</span>`;
    const has=typeof s.lat==="number";
    html+=`<div class="entry${s.id===selPin?" sel":""}">${pic}<button class="open" data-open="${a.id}"><div class="en">${esc(a.name)}</div><div class="ed">${fmtDate(s.date)}${place?" · "+esc(place):""}${s.how?" · "+esc(s.how):""}${s.note?" — "+esc(s.note):""}</div></button><div class="eact"><button class="pinbtn${has?" has":""}" data-pinfor="${s.id}">${has?"Move pin":"Drop pin"}</button><button class="del" data-del="${s.id}">Remove</button></div></div>`;
  });
  v.innerHTML=html;
  v.querySelectorAll("[data-lf]").forEach(b=>b.onclick=()=>{logFilter=b.dataset.lf;renderLog();});
  v.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openDetail(b.dataset.open));
  v.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{if(!confirm("Remove this sighting?"))return;state.sightings=state.sightings.filter(s=>s.id!==b.dataset.del);persist();renderLog();toast("Sighting removed");});
  v.querySelectorAll("[data-pinfor]").forEach(b=>b.onclick=()=>startPinning(b.dataset.pinfor));
  const pc=$("#pinCancel");if(pc)pc.onclick=()=>{pinning=null;renderLog();};
  const ex=$("#exp");if(ex)ex.onclick=()=>exportBackup();
  mountMap($("#mapcard"),{
    onPick:([lat,lng])=>{
      if(!pinning){if(selPin){selPin=null;renderLog();}return;}
      const s=state.sightings.find(x=>x.id===pinning);pinning=null;
      if(s){s.lat=lat;s.lng=lng;persist();selPin=s.id;toast("Pin dropped");}
      renderLog();},
    onPin:id=>{if(pinning)return;selPin=id;renderLog();}
  });
  showPinInfo();
}
function showPinInfo(){
  const box=$("#pinInfo");if(!box)return;
  const s=selPin&&state.sightings.find(x=>x.id===selPin);const a=s&&findAny(s.animalId);
  if(!a||typeof s.lat!=="number"){box.innerHTML="";return;}
  const place=s.place==="other"?(s.placeText||"Other"):({home:"Home",park:"Park"}[s.place]||"");
  box.innerHTML=`<div class="pininfo"><div><div class="en">${esc(a.name)}</div><div class="ed">${fmtDate(s.date)}${place?" · "+esc(place):""}${s.note?" — "+esc(s.note):""}</div></div>
    <div class="row"><button class="btn alt" data-pi="open">Open</button><button class="btn alt" data-pi="move">Move pin</button><button class="btn alt" data-pi="rm">Remove pin</button><button class="clear" data-pi="x" aria-label="Close">Close</button></div></div>`;
  box.querySelector('[data-pi="open"]').onclick=()=>openDetail(a.id);
  box.querySelector('[data-pi="move"]').onclick=()=>startPinning(s.id);
  box.querySelector('[data-pi="rm"]').onclick=()=>{delete s.lat;delete s.lng;persist();selPin=null;renderLog();toast("Pin removed");};
  box.querySelector('[data-pi="x"]').onclick=()=>{selPin=null;renderLog();};
}

function renderSettings(){
  const v=$("#view");const key=aiKey();
  v.innerHTML=`
  <div class="settings">
    <section class="intro">
      <h3>Kindred Creatures v${esc(APP_VERSION)}</h3>
      <p>Updates arrive on their own — you'll see a banner when a new version is ready.</p>
      <div class="row"><button class="btn alt" id="chkUpd">Check for updates</button></div>
      <p class="note">To keep it in your Dock: in Chrome, use the install icon at the right of the address bar; in Safari, choose File › Add to Dock.</p>
    </section>
    <section class="intro">
      <h3>Your journal</h3>
      <p>Sightings, meanings and photos are kept in this browser on this computer. Save a backup now and then — clearing browser data would erase them.</p>
      <div class="row"><button class="btn" id="bkSave">Save a backup file</button><button class="btn alt" id="bkLoad">Load a backup file</button></div>
      <p class="note">Coming from the Claude version? Save a backup there (My sightings › Save a backup file), then load it here. Loading adds to what's already here; nothing is overwritten.</p>
    </section>
    <section class="intro">
      <h3>Real photos</h3>
      <p>Show openly licensed photos from iNaturalist when you hover a drawing. Each photo is credited to its photographer.</p>
      <div class="row"><button class="chip" id="realTog" aria-pressed="${realPhotosOn()}">${realPhotosOn()?"On":"Off"}</button></div>
    </section>
    <section class="intro">
      <h3>Drawing and keyword help (optional)</h3>
      <p>With your own Anthropic API key, Kindred Creatures can paint tiles for animals you add and pull keywords from your meanings. The key stays in this browser and is sent only to Anthropic. Each request uses a little of your API credit.</p>
      ${key?`<p><strong>A key is saved</strong> (ending in ${esc(key.slice(-4))}).</p><div class="row"><button class="btn alt" id="aiRemove">Remove key</button></div>`:
      `<div class="field" style="max-width:420px"><label for="aiKey">Anthropic API key</label><input id="aiKey" type="password" autocomplete="off" placeholder="sk-ant-…"></div>
      <div class="row"><button class="btn" id="aiSave">Save key</button><a class="note" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">Get a key</a></div>`}
    </section>
  </div>`;
  $("#chkUpd").onclick=()=>checkForUpdate(true);
  $("#bkSave").onclick=()=>exportBackup();
  $("#bkLoad").onclick=()=>{const i=document.createElement("input");i.type="file";i.accept="application/json,.json";i.onchange=()=>{if(i.files[0])importBackup(i.files[0]);};i.click();};
  $("#realTog").onclick=()=>{try{localStorage.setItem(REAL_KEY,realPhotosOn()?"off":"on");}catch(e){}renderSettings();};
  const sv=$("#aiSave");if(sv)sv.onclick=()=>{const k=$("#aiKey").value.trim();if(!k){toast("Paste your key first");return;}setAiKey(k);renderSettings();toast("Key saved");};
  const rm=$("#aiRemove");if(rm)rm.onclick=()=>{setAiKey("");renderSettings();toast("Key removed");};
}
function refreshBehind(){if(GROUPS.some(g=>g.id===tab)&&$("#grid"))fillGrid();else render();}
$("#dlg").addEventListener("click",e=>{if(e.target.id==="dlg")e.target.close();});

/* ---------------- Startup ---------------- */
document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();window.scrollTo({top:0});});
loadLocal();setupAI();render();
loadPhotos().then(render);
