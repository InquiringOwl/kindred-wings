/* Kindred Wings — helpers, photos, views, detail sheet, startup. Plain script; shares globals with the other js/ files (load order in index.html). */
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
// Birds you add live in state.custom with kind:"bird"; everything else there is a Beyond animal.
function customBirds(){return state.custom.filter(c=>c.kind==="bird");}
function allBirds(){return BIRDS.concat(customBirds());}
function allAnimals(){return BEYOND.concat(state.custom.filter(c=>c.kind!=="bird"));}
function isBirdObj(a){return !!a&&(BIRDS.includes(a)||a.kind==="bird");}
function findAny(id){return allBirds().find(b=>b.id===id)||allAnimals().find(a=>a.id===id);}
function currentSym(a){
  const h=state.meanings[a.id];
  if(h&&h.length){const last=h[h.length-1];if(!last.reset)return{keys:last.keys,why:last.text,mine:true,month:last.month};}
  return{keys:a.sym.keys,why:a.sym.why,src:a.sym.src,mine:false};
}
function sightingsOf(id){return state.sightings.filter(s=>s.animalId===id);}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("on");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("on"),2200);}


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
const COVER_RULES="The cover fills the same 5 × 4 frame as the drawings (for example 1000 × 800 pixels); the middle is kept, so center the bird.";
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
// A bird you added shows its cover photo in the drawing's frame; otherwise a medallion from its colors and shape.
function birdArt(b,sex){
  const cu=b.kind==="bird"?coverUrl(b.id):null;
  if(!cu)return birdSVG(b,sex);
  const id="cv"+(++svgN);
  return `<svg viewBox="0 0 200 160" role="img" aria-label="Your cover photo of ${esc(b.name)}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${id}"><rect x="5" y="5" width="190" height="150" rx="10"/></clipPath></defs><rect width="200" height="160" fill="#1e2a4f"/><image href="${esc(cu)}" x="5" y="5" width="190" height="150" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/><rect x="5" y="5" width="190" height="150" rx="10" fill="none" stroke="#f3d98a" stroke-width="1.6"/><g fill="#f3d98a"><circle cx="14" cy="14" r="2"/><circle cx="186" cy="14" r="2"/><circle cx="14" cy="146" r="2"/><circle cx="186" cy="146" r="2"/></g></svg>`;
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
let tab="guide";
const F={sizes:new Set(),colors:new Set(),nowOnly:false,q:"",show:"m"};

function render(){
  document.querySelectorAll("nav.tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===tab?"true":"false"));
  if(tab==="guide")renderGuide();
  else if(tab==="beyond")renderBeyond();
  else if(tab==="settings")renderSettings();
  else renderLog();
}
function renderGuide(){
  const v=$("#view");
  const curM=new Date().getMonth();
  v.innerHTML=`
  <section class="filters" aria-label="Filter birds">
    ${sortRow()}
    <div class="frow"><span class="flabel">Show</span>
      ${[["m","Males"],["f","Females"],["y","Young"]].map(([k,l])=>`<button class="chip" data-show="${k}" aria-pressed="${F.show===k}">${l}</button>`).join("")}
    </div>
    <div class="frow"><span class="flabel">Size</span>
      ${SIZES.map(s=>`<button class="chip" data-size="${s.id}" aria-pressed="${F.sizes.has(s.id)}" title="${esc(s.hint)}">${s.label} <small style="opacity:.7">· ${esc(s.hint)}</small></button>`).join("")}
    </div>
    <div class="frow"><span class="flabel">Color</span>
      ${COLORS.map(c=>`<button class="sw" data-color="${c.id}" aria-pressed="${F.colors.has(c.id)}" title="${c.id}" style="background:${c.hex}"><span>${c.id}</span></button>`).join("")}
    </div>
    <div class="frow">
      <button class="chip" id="nowBtn" aria-pressed="${F.nowOnly}">Here in ${MONTHS[curM]}</button>
      <input class="search" id="q" type="search" placeholder="Search by name" value="${esc(F.q)}" aria-label="Search by name">
      <button class="clear" id="clr">Clear filters</button>
      <span class="count" id="count"></span>
    </div>
  </section>
  <div class="row" style="margin-bottom:16px"><button class="btn" id="addBird">Add a bird</button><span class="note">For a bird that isn't in the guide yet — a rare visitor, or one from a trip.</span></div>
  ${addBirdPanel()}
  <div class="grid" id="grid"></div>`;
  v.querySelectorAll("[data-size]").forEach(b=>b.onclick=()=>{const s=b.dataset.size;F.sizes.has(s)?F.sizes.delete(s):F.sizes.add(s);b.setAttribute("aria-pressed",F.sizes.has(s));fillGrid();});
  v.querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{const c=b.dataset.color;F.colors.has(c)?F.colors.delete(c):F.colors.add(c);b.setAttribute("aria-pressed",F.colors.has(c));fillGrid();});
  v.querySelectorAll("[data-show]").forEach(b=>b.onclick=()=>{F.show=b.dataset.show;v.querySelectorAll("[data-show]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.show===F.show));fillGrid();});
  wireSort(v,fillGrid);
  $("#nowBtn").onclick=e=>{F.nowOnly=!F.nowOnly;e.currentTarget.setAttribute("aria-pressed",F.nowOnly);fillGrid();};
  $("#q").oninput=e=>{F.q=e.target.value;fillGrid();};
  $("#clr").onclick=()=>{F.sizes.clear();F.colors.clear();F.nowOnly=false;F.q="";renderGuide();};
  wireAddBird();
  fillGrid();
}
function fillGrid(){
  const curM=new Date().getMonth();
  const birds=allBirds();
  const list=sortList(birds.filter(b=>{
    if(F.sizes.size&&!F.sizes.has(b.size))return false;
    for(const c of F.colors) if(!b.colors.includes(c))return false;
    if(F.nowOnly&&!monthsOn(b.months)[curM])return false;
    if(F.q&&!b.name.toLowerCase().includes(F.q.toLowerCase()))return false;
    return true;}));
  $("#count").textContent=list.length+" of "+birds.length+" birds";
  const g=$("#grid");
  if(!list.length){g.innerHTML=`<p class="empty" style="grid-column:1/-1">No birds match all of those. Try removing a color — birds often look different in shade or at a distance.</p>`;return;}
  g.innerHTML=list.map(b=>{const s=currentSym(b);const n=sightingsOf(b.id).length;
    return `<button class="card" data-open="${b.id}">${withPhoto(birdArt(b,F.show),F.show==="y"?photoUrl(b.id,"y"):(b.both?photoUrl(b.id,"a"):photoUrl(b.id,F.show)),F.show==="m"||(b.both&&F.show!=="y")?b.id:null)}<span class="nm">${esc(b.name)}</span><span class="kw ${s.mine?"mine":""}">${esc(s.keys.join(" · "))}</span>${n?`<span class="seen">seen ${n}×</span>`:""}</button>`;}).join("");
  g.querySelectorAll("[data-open]").forEach(c=>c.onclick=()=>openDetail(c.dataset.open));
}
function renderBeyond(){
  const v=$("#view");const list=allAnimals();
  v.innerHTML=`
  <div class="intro"><p>For the animals that find you in other ways — a giraffe on a mug, a whale in a dream, a fox in a friend's story. Log those encounters here the same way you log birds.</p></div>
  <section class="filters" style="padding:10px 18px">${sortRow()}</section>
  <div class="row" style="margin-bottom:16px"><button class="btn" id="addAnimal">Add an animal</button><span class="note">${sampleFn?"New animals get their own tile drawing.":"Add a Claude key in Settings and new animals get their own tile drawing."}</span></div>
  <div class="panel" id="addPanel" hidden>
    <div class="field"><label for="anName">Animal</label><input id="anName" placeholder="e.g. Octopus"></div>
    <div class="field"><label for="anSize">Size</label><select id="anSize" style="border:1.5px solid var(--line);background:var(--paper-2);border-radius:14px;padding:8px 12px;max-width:260px">${[["tiny","Tiny (insect)"],["small","Small (mouse to cat)"],["medium","Medium (fox, dog)"],["large","Large (deer, wolf)"],["xlarge","Huge (bear and up)"]].map(([k,l])=>`<option value="${k}" ${k==="medium"?"selected":""}>${l}</option>`).join("")}</select></div>
    <div class="field"><label for="anKeys">A few keywords, separated by commas</label><input id="anKeys" placeholder="intelligence, flexibility, many arms"></div>
    <div class="field"><label for="anWhy">What it means to you</label><textarea id="anWhy"></textarea></div>
    <div class="row"><button class="btn" id="anSave">Save animal</button><button class="btn alt" id="anCancel">Cancel</button></div>
  </div>
  <div class="grid">${sortList(list).map(a=>{const s=currentSym(a);const n=sightingsOf(a.id).length;return `<button class="card tile" data-open="${a.id}">${withPhoto(animalArt(a),photoUrl(a.id,"a"),a.id)}<span class="nm">${esc(a.name)}</span><span class="kw ${s.mine?"mine":""}">${esc(s.keys.join(" · "))}</span>${n?`<span class="seen">met ${n}×</span>`:""}</button>`}).join("")}</div>`;
  wireSort(v,renderBeyond);
  $("#addAnimal").onclick=()=>{$("#addPanel").hidden=false;$("#anName").focus();};
  $("#anCancel").onclick=()=>{$("#addPanel").hidden=true;};
  $("#anSave").onclick=()=>{
    const name=$("#anName").value.trim();if(!name){$("#anName").focus();toast("Give the animal a name");return;}
    const keys=$("#anKeys").value.split(",").map(s=>s.trim()).filter(Boolean).slice(0,6);
    const na={id:"c-"+uid(),name,size:$("#anSize").value,custom:true,sym:{keys:keys.length?keys:["(add your keywords)"],why:$("#anWhy").value.trim()||"Your own reading — add more whenever it comes to you.",src:"mine"}};
    state.custom.push(na);persist();renderBeyond();toast(name+" added");
    if(sampleFn)drawAnimal(na);
  };
  v.querySelectorAll("[data-open]").forEach(c=>c.onclick=()=>openDetail(c.dataset.open));
}
/* ---------------- Add a bird ---------------- */
const BIRD_SHAPES=[["song","Songbird"],["hummer","Hummingbird"],["dove","Dove or pigeon"],["quail","Quail"],["duck","Duck"],["goose","Goose"],["gull","Gull or tern"],["pelican","Pelican"],["cormorant","Cormorant"],["wader","Heron or egret"],["raptor","Hawk, falcon or eagle"],["owl","Owl"]];
const BIRD_WHEN=[["all","Here all year"],["9-4","Fall and winter visitor"],["3-9","Spring and summer visitor"],["","Not sure yet"]];
function swatchHex(id){const c=COLORS.find(x=>x.id===id);if(!c)return "#8a8f96";return id==="iridescent"?"#2f8f7a":c.hex;}
function mixHex(h,w,amt){const p=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));const a=p(h),b=p(w);return "#"+a.map((v,i)=>Math.round(v+(b[i]-v)*amt).toString(16).padStart(2,"0")).join("");}
// A simple palette for the medallion from the colors chosen, in order: main, belly, wings.
function paletteFrom(colors){
  const c=colors.map(swatchHex);const main=c[0]||"#8a8f96";
  const belly=c[1]||mixHex(main,"#f4f2ea",.55), wing=c[2]||mixHex(main,"#1c1c22",.25);
  return {head:main,back:main,belly,wing,tail:wing};
}
let newBird={colors:[],size:"small",shape:"song",cover:null,real:null};
function addBirdPanel(){
  return `<div class="panel addbird" id="birdPanel" hidden>
    <div class="field"><label for="bdName">Bird</label><input id="bdName" placeholder="e.g. Varied Thrush"></div>
    <div class="field"><label>Size</label><div class="row" id="bdSize">${SIZES.map(z=>`<button class="chip" data-bsize="${z.id}" aria-pressed="${newBird.size===z.id}">${z.label} <small style="opacity:.7">· ${esc(z.hint)}</small></button>`).join("")}</div></div>
    <div class="field"><label for="bdShape">Shape (for the drawing, if you don't add a cover photo)</label><select id="bdShape" class="selbox">${BIRD_SHAPES.map(([k,l])=>`<option value="${k}" ${newBird.shape===k?"selected":""}>${l}</option>`).join("")}</select></div>
    <div class="field"><label>Colors — tap up to three: main color, then belly, then wings</label><div class="row" id="bdColors">${COLORS.map(c=>`<button class="sw" data-bcolor="${c.id}" aria-pressed="${newBird.colors.includes(c.id)}" title="${c.id}" style="background:${c.hex}"><span>${c.id}</span></button>`).join("")}</div></div>
    <div class="field"><label for="bdWhen">When it's in San Francisco</label><select id="bdWhen" class="selbox">${BIRD_WHEN.map(([k,l])=>`<option value="${k}">${l}</option>`).join("")}</select></div>
    <div class="field"><label for="bdWhere">Where you find it (optional)</label><input id="bdWhere" placeholder="e.g. Under the ferns at Strybing in winter"></div>
    <div class="field"><label for="bdKeys">A few keywords, separated by commas</label><input id="bdKeys" placeholder="hidden song, patience, winter light"></div>
    <div class="field"><label for="bdWhy">What it means to you</label><textarea id="bdWhy"></textarea></div>
    <div class="photopick">
      <div class="pp"><div class="pplabel">Cover photo <small>(shown where the drawing goes)</small></div><div class="ppprev" id="bdCoverPrev">${newBird.cover?`<img src="${esc(newBird.cover.url)}" alt="">`:"No cover yet — a drawing is made from its colors"}</div><div class="row"><button class="btn alt" id="bdCover">${newBird.cover?"Change":"Choose a photo"}</button>${newBird.cover?`<button class="clear" id="bdCoverX">Remove</button>`:""}</div></div>
      <div class="pp"><div class="pplabel">Real photo <small>(fades in when you hover or tap)</small></div><div class="ppprev" id="bdRealPrev">${newBird.real?`<img src="${esc(newBird.real.url)}" alt="">`:"Optional — without one, iNaturalist is searched by name"}</div><div class="row"><button class="btn alt" id="bdReal">${newBird.real?"Change":"Choose a photo"}</button>${newBird.real?`<button class="clear" id="bdRealX">Remove</button>`:""}</div></div>
    </div>
    <p class="note rules"><strong>Photo size and format:</strong> ${esc(PHOTO_RULES)} ${esc(COVER_RULES)}</p>
    <div class="row"><button class="btn" id="bdSave">Save bird</button><button class="btn alt" id="bdCancel">Cancel</button></div>
  </div>`;
}
function wireAddBird(){
  const pnl=$("#birdPanel");if(!pnl)return;
  const keep=()=>({name:$("#bdName").value,shape:$("#bdShape").value,when:$("#bdWhen").value,where:$("#bdWhere").value,keys:$("#bdKeys").value,why:$("#bdWhy").value});
  const redraw=()=>{const k=keep();pnl.outerHTML=addBirdPanel();const np=$("#birdPanel");np.hidden=false;
    $("#bdName").value=k.name;$("#bdShape").value=k.shape;$("#bdWhen").value=k.when;$("#bdWhere").value=k.where;$("#bdKeys").value=k.keys;$("#bdWhy").value=k.why;wireAddBird();};
  $("#addBird").onclick=()=>{pnl.hidden=false;$("#bdName").focus();};
  pnl.querySelectorAll("[data-bsize]").forEach(b=>b.onclick=()=>{newBird.size=b.dataset.bsize;pnl.querySelectorAll("[data-bsize]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.bsize===newBird.size));});
  pnl.querySelectorAll("[data-bcolor]").forEach(b=>b.onclick=()=>{const c=b.dataset.bcolor,i=newBird.colors.indexOf(c);
    if(i>=0)newBird.colors.splice(i,1);else{if(newBird.colors.length>=3){toast("Up to three colors");return;}newBird.colors.push(c);}
    pnl.querySelectorAll("[data-bcolor]").forEach(x=>x.setAttribute("aria-pressed",newBird.colors.includes(x.dataset.bcolor)));});
  const pick=slot=>{const inp=document.createElement("input");inp.type="file";inp.accept=PHOTO_ACCEPT;
    inp.onchange=async()=>{const f=inp.files&&inp.files[0];if(!f)return;const bad=photoProblem(f);if(bad){toast(bad);return;}
      const blob=await shrink(f);if(!blob){toast("This browser can't open that photo — try a JPG or PNG");return;}
      if(newBird[slot])URL.revokeObjectURL(newBird[slot].url);
      newBird[slot]={blob,url:URL.createObjectURL(blob)};redraw();};
    inp.click();};
  $("#bdCover").onclick=()=>pick("cover");$("#bdReal").onclick=()=>pick("real");
  const cx=$("#bdCoverX");if(cx)cx.onclick=()=>{URL.revokeObjectURL(newBird.cover.url);newBird.cover=null;redraw();};
  const rx=$("#bdRealX");if(rx)rx.onclick=()=>{URL.revokeObjectURL(newBird.real.url);newBird.real=null;redraw();};
  $("#bdCancel").onclick=()=>{pnl.hidden=true;};
  $("#bdSave").onclick=async()=>{
    const name=$("#bdName").value.trim();if(!name){$("#bdName").focus();toast("Give the bird a name");return;}
    const keys=$("#bdKeys").value.split(",").map(x=>x.trim()).filter(Boolean).slice(0,6);
    const colors=newBird.colors.length?newBird.colors.slice():["gray"];
    const nb={id:"c-"+uid(),kind:"bird",custom:true,name,size:newBird.size,shape:$("#bdShape").value,colors,months:$("#bdWhen").value,
      where:$("#bdWhere").value.trim(),both:paletteFrom(colors),
      sym:{keys:keys.length?keys:["(add your keywords)"],why:$("#bdWhy").value.trim()||"Your own reading — add more whenever it comes to you.",src:"mine"}};
    try{
      if(assetsNs&&(newBird.cover||newBird.real)){state.photos=state.photos||{};const p=state.photos[nb.id]={};
        if(newBird.cover)p.cover=(await assetsNs.upload(newBird.cover.blob)).id;
        if(newBird.real)p.a=(await assetsNs.upload(newBird.real.blob)).id;}
    }catch(e){toast("Couldn't save the photos — the bird is saved without them");}
    state.custom.push(nb);persist();
    ["cover","real"].forEach(k=>{if(newBird[k])URL.revokeObjectURL(newBird[k].url);});
    newBird={colors:[],size:"small",shape:"song",cover:null,real:null};
    renderGuide();toast(name+" added");
  };
}
function myBirdSections(a,on,curM){
  const cu=coverUrl(a.id),ru=photoUrl(a.id,"a");
  return `<div class="sect">
      <h3>Your bird</h3>
      <figure class="fig" style="max-width:380px">${withPhoto(birdArt(a,"m"),ru,a.id)}
        <figcaption>${cu?"Your cover photo":"Drawn from the colors you chose"}</figcaption>
        ${assetsNs?`<div class="phrow"><button data-addph="cover">${cu?"Change cover photo":"Add a cover photo"}</button>${cu?`<button data-rmph="cover">Remove cover</button>`:""}<button data-addph="a">${ru?"Change real photo":"Add a real photo"}</button>${ru?`<button data-rmph="a">Remove real photo</button>`:""}</div>`:""}
      </figure>
      <p class="photo-link">Hover (or tap) the picture for the real photo${ru?"":" — until you add one, Kindred Wings looks for one on iNaturalist by name"}.</p>
      <p class="note" id="inatCredit"></p>
      <p class="note rules">${esc(PHOTO_RULES)} ${esc(COVER_RULES)}</p>
    </div>
    <div class="sect">
      <h3>When it's in San Francisco</h3>
      ${!a.months?`<p class="note">You haven't said yet.</p>`:on.every(Boolean)?`<span class="always">Here all year</span>`:`<div class="months">${MONTHS.map((m,i)=>`<div class="${on[i]?"on":""} ${i===curM?"now":""}">${m[0]}<span class="sr">${m} ${on[i]?"present":"absent"}</span></div>`).join("")}</div>`}
      ${a.where?`<p class="note">${esc(a.where)}</p>`:""}
    </div>`;
}

/* ---------------- My sightings ---------------- */
let logFilter="all", pinning=null, selPin=null;
function startPinning(sid){pinning=sid;selPin=null;tab="log";render();
  const m=$("#mapcard");if(m)m.scrollIntoView({behavior:"smooth",block:"start"});}
function renderLog(){
  const v=$("#view");
  const all=[...state.sightings].sort((a,b)=>b.date.localeCompare(a.date)||(b.t||0)-(a.t||0));
  const isBird=id=>isBirdObj(findAny(id));
  const list=all.filter(s=>logFilter==="all"||(logFilter==="birds"?isBird(s.animalId):!isBird(s.animalId)));
  const kinds=new Set(state.sightings.filter(s=>BIRDS.some(b=>b.id===s.animalId)).map(s=>s.animalId)).size;
  const pinned=list.filter(s=>typeof s.lat==="number"&&findAny(s.animalId));
  const pinS=pinning&&state.sightings.find(s=>s.id===pinning), pinA=pinS&&findAny(pinS.animalId);
  const pins=pinned.map(s=>{const a=findAny(s.animalId);return {id:s.id,lat:s.lat,lng:s.lng,bird:isBirdObj(a),sel:s.id===selPin,title:a.name+" · "+fmtDate(s.date)};});
  let html=`<div class="log-summary"><div><b>${kinds}</b> of ${BIRDS.length} SF birds seen</div><div><b>${state.sightings.length}</b> sightings and signs</div></div>
  <div class="row" style="margin-bottom:10px">
    ${["all","birds","beyond"].map(k=>`<button class="chip" data-lf="${k}" aria-pressed="${logFilter===k}">${{all:"Everything",birds:"Birds",beyond:"Beyond birds"}[k]}</button>`).join("")}
    ${downloadsNs?`<button class="btn alt" id="exp" style="margin-left:auto">Save a backup file</button>`:""}
  </div>
  <section class="mapcard" id="mapcard" aria-label="Map of your sightings">
    <div class="maphead"><h3>Where you saw them</h3><span class="note">${pinned.length?`${pinned.length} pin${pinned.length>1?"s":""}`:"No pins yet — tap “Drop pin” on any sighting below"}</span>
      <div class="mapzoom"><button data-zoom="in" aria-label="Zoom in">+</button><button data-zoom="out" aria-label="Zoom out">−</button><button data-zoom="all">Whole city</button></div></div>
    ${pinA?`<div class="mapbanner"><span>Tap the map where you saw the <strong>${esc(pinA.name)}</strong> (${fmtDate(pinS.date)}). Drag to move around; zoom in for neighborhoods.</span><button class="btn alt" id="pinCancel">Cancel</button></div>`:""}
    <div class="mapbox${pinA?" placing":""}">${sfMapSVG(pins)}</div>
    <div id="pinInfo"></div>
  </section>`;
  if(!list.length) html+=`<p class="empty">No sightings yet. Open any bird and tap “Add sighting” when you see one.</p>`;
  let lastM="";
  list.forEach(s=>{
    const a=findAny(s.animalId);if(!a)return;
    const m=s.date.slice(0,7);if(m!==lastM){html+=`<div class="logmonth">${monthHeading(m)}</div>`;lastM=m;}
    const place=s.place==="other"?(s.placeText||"Other"):({home:"Home",park:"Park"}[s.place]||"");
    const pic=isBirdObj(a)?birdArt(a,["f","y"].includes(s.sex)?s.sex:"m"):`<span class="emo">${animalArt(a)}</span>`;
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

/* ---------------- Detail ---------------- */
function openDetail(id){
  const a=findAny(id);if(!a)return;
  const isBird=isBirdObj(a), mineBird=a.kind==="bird", guideBird=isBird&&!mineBird;
  const dlg=$("#dlg"), sh=$("#sheet");
  const curM=new Date().getMonth();
  const s=currentSym(a);
  const hist=state.meanings[a.id]||[];
  const seen=sightingsOf(a.id).sort((x,y)=>y.date.localeCompare(x.date));
  const sizeLbl=isBird?SIZES.find(z=>z.id===a.size):null;
  const on=isBird?monthsOn(a.months):null;
  const aabName=guideBird?(a.id==="red-masked-parakeet"?null:a.name.replace(/'/g,"").replace(/ /g,"_")):null;
  sh.innerHTML=`
  <div class="sheet-head">
    <h2 id="dlgTitle">${esc(a.name)}</h2>
    <div class="sub">${isBird?`${sizeLbl.label} — ${esc(sizeLbl.hint)}${mineBird?" · your own addition":""}`:(a.custom?"Your own addition":"Beyond birds")}${seen.length?` · you've logged ${seen.length}`:""}</div>
    <button class="x" id="xBtn" aria-label="Close">×</button>
  </div>
  <div class="sheet-body">
    ${mineBird?myBirdSections(a,on,curM):""}
    ${guideBird?`
    <div class="sect">
      <h3>${a.both?"Adults and young":"Male, female and young"}</h3>
      <div class="pair">
        ${(a.both?[["a","Adult (male and female alike)",""],["y","Young",youngNote(a)]]:[["m","Male",a.mNote||""],["f","Female",a.fNote||""],["y","Young",youngNote(a)]]).map(([k,l,n])=>{
          const url=photoUrl(a.id,k);
          return `<figure class="fig">${withPhoto(birdSVG(a,k==="a"?"m":k),url,(k==="m"||k==="a")?a.id:null)}<figcaption>${l}</figcaption><div class="cap2">${esc(n)}</div>${assetsNs?`<div class="phrow"><button data-addph="${k}">${url?"Change photo":"Add your photo"}</button>${url?`<button data-rmph="${k}">Remove</button>`:""}</div>`:""}</figure>`;}).join("")}
      </div>
      <p class="photo-link">Drawings are stylized. Hover (or tap) the ${a.both?"adult":"male"} drawing for a real photo; add your own photos and they show up the same way. More photos: ${aabName?`<a href="https://www.allaboutbirds.org/guide/${aabName}" target="_blank" rel="noopener">All About Birds</a> or `:""}<a href="https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(a.name.replace(/.*\((.*)\).*/,"$1"))}" target="_blank" rel="noopener">iNaturalist</a>.</p>
      <p class="note" id="inatCredit"></p>
    </div>
    <div class="sect">
      <h3>When it's in San Francisco</h3>
      ${on.every(Boolean)?`<span class="always">Here all year</span>`:`<div class="months">${MONTHS.map((m,i)=>`<div class="${on[i]?"on":""} ${i===curM?"now":""}" title="${on[i]?"Present":"Usually absent"}">${m[0]}<span class="sr">${m} ${on[i]?"present":"absent"}</span></div>`).join("")}</div>`}
      <p class="note">${esc(a.where)}</p>
    </div>`:""}
    ${!isBird?`<div class="sect"><figure class="fig" style="max-width:340px">${withPhoto(animalArt(a),photoUrl(a.id,"a"),a.id)}${(assetsNs||(a.custom&&sampleFn))?`<div class="phrow">${a.custom&&sampleFn?`<button id="redraw" ${a.drawing?"disabled":""}>${a.drawing?"Drawing…":a.svg?"Redraw":"Draw it"}</button>`:""}${assetsNs?`<button data-addph="a">${photoUrl(a.id,"a")?"Change photo":"Add a picture"}</button>${photoUrl(a.id,"a")?`<button data-rmph="a">Remove</button>`:""}`:""}</div>`:""}</figure><p class="note" id="inatCredit"></p></div>`:""}
    <div class="sect">
      <h3>${s.mine?"What it means to you":"What it might mean"}</h3>
      <div class="keys">${s.keys.map(k=>`<button class="key ${s.mine?"mine":""}" data-why aria-expanded="false">${esc(k)}</button>`).join("")}</div>
      <div class="why" id="why" hidden>${esc(s.why)}<span class="src">${s.mine?`Your meaning, ${esc(fmtMonth(s.month))}.`:esc(a.sym.src==="mine"?"Your own reading.":SRC[a.sym.src]||"")}</span></div>
      <div class="row" style="margin-top:12px">
        <button class="btn alt" id="editBtn">Actually, to me this means…</button>
        <button class="btn alt" id="histBtn" ${hist.length?"":"disabled"}>History${hist.length?` (${hist.length})`:""}</button>
      </div>
      <div class="panel" id="editPanel" hidden>
        <div class="field"><label for="myText">In your own words</label><textarea id="myText" placeholder="Actually, to me these mean…"></textarea></div>
        <div class="field"><label for="myKeys">Keywords, separated by commas</label><input id="myKeys" placeholder="e.g. my grandmother, courage, summer mornings"></div>
        <div class="row" style="margin-bottom:10px">${sampleFn?`<button class="btn alt" id="suggestKeys">Pull keywords from my words</button>`:""}<span class="note" id="sugNote"></span></div>
        <div class="field" style="max-width:220px"><label for="myMonth">Month and year (MM/YY)</label><input id="myMonth" inputmode="numeric" placeholder="MM/YY" value="${fmtMonth(thisMonth())}"></div>
        <div class="row"><button class="btn rose" id="saveMeaning">Save my meaning</button><button class="btn alt" id="cancelMeaning">Cancel</button>${s.mine?`<button class="btn alt" id="resetMeaning">Go back to the suggested meaning</button>`:""}</div>
      </div>
      <div class="panel" id="histPanel" hidden>
        <ul class="hist">
          ${[...hist].reverse().map(h=>`<li><div class="when">${esc(fmtMonth(h.month))}</div>${h.reset?`<em>Returned to the suggested meaning</em>`:`<div><strong>${esc(h.keys.join(", "))}</strong></div>${h.text?`<div>${esc(h.text)}</div>`:""}`}</li>`).join("")}
          <li class="orig"><div class="when">Suggested</div><div><strong>${esc(a.sym.keys.join(", "))}</strong></div></li>
        </ul>
      </div>
    </div>
    <div class="sect">
      <h3>${isBird?"Add a sighting":"Log an encounter"}</h3>
      <div class="row" style="margin-bottom:10px">
        <div class="field" style="margin:0"><label for="sDate">Date (MM/DD/YY)</label><input id="sDate" inputmode="numeric" placeholder="MM/DD/YY" value="${usDate(today())}" style="max-width:150px"></div>
        ${isBird?`<div class="field" style="margin:0"><label>Which one</label><div class="row" id="sexRow">${(a.both?["a","y","?"]:["m","f","y","?"]).map(x=>`<button class="chip" data-sex="${x}" aria-pressed="${x==="?"}">${{m:"Male",f:"Female",a:"Adult",y:"Young","?":"Not sure"}[x]}</button>`).join("")}</div></div>`:""}
      </div>
      ${!isBird?`<div class="field"><label>How it came to you</label><div class="row" id="howRow">${["In person","Image or art","Dream","Words or song","Other"].map(h=>`<button class="chip" data-how="${h}" aria-pressed="false">${h}</button>`).join("")}</div></div>`:""}
      <div class="field"><label>Where (optional)</label><div class="row" id="placeRow">${[["home","Home"],["park","Park"],["other","Other"]].map(([k,l])=>`<button class="chip" data-place="${k}" aria-pressed="false">${l}</button>`).join("")}<input id="placeText" placeholder="Where?" style="display:none;border:1.5px solid var(--line);background:var(--paper-2);border-radius:999px;padding:4px 12px;min-width:160px"></div></div>
      <div class="field"><label for="sNote">Note (optional)</label><input id="sNote" placeholder="What was it doing? What were you thinking about?"></div>
      <div class="row"><button class="btn" id="addSight">${isBird?"Add sighting":"Log encounter"}</button><button class="chip" id="pinAfter" aria-pressed="false">Then drop a pin on the map</button></div>
      ${seen.length?`<ul class="hist" style="margin-top:14px">${seen.slice(0,6).map(x=>`<li><span class="when">${fmtDate(x.date)}</span> ${x.place?"· "+esc(x.place==="other"?x.placeText||"Other":x.place==="home"?"Home":"Park"):""}${x.how?" · "+esc(x.how):""}${x.note?" — "+esc(x.note):""}</li>`).join("")}</ul>`:""}
    </div>
    ${a.custom?`<div class="row"><button class="btn alt" id="delAnimal">Remove this ${mineBird?"bird":"animal"}</button></div>`:""}
  </div>`;
  // wiring
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
  if(!dlg.open)dlg.showModal();
  sh.scrollTop=0;
}
function renderSettings(){
  const v=$("#view");const key=aiKey();
  v.innerHTML=`
  <div class="settings">
    <section class="intro">
      <h3>Kindred Wings v${esc(APP_VERSION)}</h3>
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
      <p>With your own Anthropic API key, Kindred Wings can paint tiles for animals you add and pull keywords from your meanings. The key stays in this browser and is sent only to Anthropic. Each request uses a little of your API credit.</p>
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
function refreshBehind(){if(tab==="guide")fillGrid();else render();}
$("#dlg").addEventListener("click",e=>{if(e.target.id==="dlg")e.target.close();});

/* ---------------- Startup ---------------- */
document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();window.scrollTo({top:0});});
loadLocal();setupAI();render();
loadPhotos().then(render);
