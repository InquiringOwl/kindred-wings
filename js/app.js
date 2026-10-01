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
  if(code==="all")return Array(12).fill(true);
  const[a,b]=code.split("-").map(Number);const on=Array(12).fill(false);
  let i=a;while(true){on[i-1]=true;if(i===b)break;i=i%12+1;}return on;
}
function allAnimals(){return BEYOND.concat(state.custom);}
function findAny(id){return BIRDS.find(b=>b.id===id)||allAnimals().find(a=>a.id===id);}
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
function withPhoto(inner,url,inatName){
  if(url)return `<span class="pic">${inner}<img class="ph" src="${esc(url)}" alt="Your photo"><span class="phtag">your photo</span></span>`;
  if(inatName&&realPhotosOn())return `<span class="pic" data-inat="${esc(inatName)}">${inner}</span>`;
  return `<span class="pic">${inner}</span>`;
}
function shrink(file){return new Promise(res=>{const img=new Image();const u=URL.createObjectURL(file);img.onload=()=>{const m=1400,sc=Math.min(1,m/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>res(b||file),"image/jpeg",.86);};img.onerror=()=>{URL.revokeObjectURL(u);res(file);};img.src=u;});}
function pickPhoto(animalId,slot){
  if(!assetsNs){toast("Photos can't be added in this view");return;}
  const inp=document.createElement("input");inp.type="file";inp.accept="image/*";
  inp.onchange=async()=>{const f=inp.files&&inp.files[0];if(!f)return;toast("Adding photo…");
    try{const blob=await shrink(f);const r=await assetsNs.upload(blob);
      state.photos=state.photos||{};const p=state.photos[animalId]=state.photos[animalId]||{};
      const old=p[slot];p[slot]=r.id;persist();if(old){try{await assetsNs.delete(old);}catch(e){}}
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
  <div class="grid" id="grid"></div>`;
  v.querySelectorAll("[data-size]").forEach(b=>b.onclick=()=>{const s=b.dataset.size;F.sizes.has(s)?F.sizes.delete(s):F.sizes.add(s);b.setAttribute("aria-pressed",F.sizes.has(s));fillGrid();});
  v.querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{const c=b.dataset.color;F.colors.has(c)?F.colors.delete(c):F.colors.add(c);b.setAttribute("aria-pressed",F.colors.has(c));fillGrid();});
  v.querySelectorAll("[data-show]").forEach(b=>b.onclick=()=>{F.show=b.dataset.show;v.querySelectorAll("[data-show]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.show===F.show));fillGrid();});
  wireSort(v,fillGrid);
  $("#nowBtn").onclick=e=>{F.nowOnly=!F.nowOnly;e.currentTarget.setAttribute("aria-pressed",F.nowOnly);fillGrid();};
  $("#q").oninput=e=>{F.q=e.target.value;fillGrid();};
  $("#clr").onclick=()=>{F.sizes.clear();F.colors.clear();F.nowOnly=false;F.q="";renderGuide();};
  fillGrid();
}
function fillGrid(){
  const curM=new Date().getMonth();
  const list=sortList(BIRDS.filter(b=>{
    if(F.sizes.size&&!F.sizes.has(b.size))return false;
    for(const c of F.colors) if(!b.colors.includes(c))return false;
    if(F.nowOnly&&!monthsOn(b.months)[curM])return false;
    if(F.q&&!b.name.toLowerCase().includes(F.q.toLowerCase()))return false;
    return true;}));
  $("#count").textContent=list.length+" of "+BIRDS.length+" birds";
  const g=$("#grid");
  if(!list.length){g.innerHTML=`<p class="empty" style="grid-column:1/-1">No birds match all of those. Try removing a color — birds often look different in shade or at a distance.</p>`;return;}
  g.innerHTML=list.map(b=>{const s=currentSym(b);const n=sightingsOf(b.id).length;
    return `<button class="card" data-open="${b.id}">${withPhoto(birdSVG(b,F.show),F.show==="y"?photoUrl(b.id,"y"):(b.both?photoUrl(b.id,"a"):photoUrl(b.id,F.show)),F.show==="m"||(b.both&&F.show!=="y")?b.name:null)}<span class="nm">${esc(b.name)}</span><span class="kw ${s.mine?"mine":""}">${esc(s.keys.join(" · "))}</span>${n?`<span class="seen">seen ${n}×</span>`:""}</button>`;}).join("");
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
  <div class="grid">${sortList(list).map(a=>{const s=currentSym(a);const n=sightingsOf(a.id).length;return `<button class="card tile" data-open="${a.id}">${withPhoto(animalArt(a),photoUrl(a.id,"a"),a.name)}<span class="nm">${esc(a.name)}</span><span class="kw ${s.mine?"mine":""}">${esc(s.keys.join(" · "))}</span>${n?`<span class="seen">met ${n}×</span>`:""}</button>`}).join("")}</div>`;
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
let logFilter="all";
function renderLog(){
  const v=$("#view");
  const all=[...state.sightings].sort((a,b)=>b.date.localeCompare(a.date)||(b.t||0)-(a.t||0));
  const isBird=id=>BIRDS.some(b=>b.id===id);
  const list=all.filter(s=>logFilter==="all"||(logFilter==="birds"?isBird(s.animalId):!isBird(s.animalId)));
  const kinds=new Set(state.sightings.filter(s=>isBird(s.animalId)).map(s=>s.animalId)).size;
  let html=`<div class="log-summary"><div><b>${kinds}</b> of ${BIRDS.length} SF birds seen</div><div><b>${state.sightings.length}</b> sightings and signs</div></div>
  <div class="row" style="margin-bottom:10px">
    ${["all","birds","beyond"].map(k=>`<button class="chip" data-lf="${k}" aria-pressed="${logFilter===k}">${{all:"Everything",birds:"Birds",beyond:"Beyond birds"}[k]}</button>`).join("")}
    ${downloadsNs?`<button class="btn alt" id="exp" style="margin-left:auto">Save a backup file</button>`:""}
  </div>`;
  if(!list.length) html+=`<p class="empty">No sightings yet. Open any bird and tap “Add sighting” when you see one.</p>`;
  let lastM="";
  list.forEach(s=>{
    const a=findAny(s.animalId);if(!a)return;
    const m=s.date.slice(0,7);if(m!==lastM){html+=`<div class="logmonth">${monthHeading(m)}</div>`;lastM=m;}
    const place=s.place==="other"?(s.placeText||"Other"):({home:"Home",park:"Park"}[s.place]||"");
    const pic=BIRDS.includes(a)?birdSVG(a,["f","y"].includes(s.sex)?s.sex:"m"):`<span class="emo">${animalArt(a)}</span>`;
    html+=`<div class="entry">${pic}<button class="open" data-open="${a.id}"><div class="en">${esc(a.name)}</div><div class="ed">${fmtDate(s.date)}${place?" · "+esc(place):""}${s.how?" · "+esc(s.how):""}${s.note?" — "+esc(s.note):""}</div></button><button class="del" data-del="${s.id}">Remove</button></div>`;
  });
  v.innerHTML=html;
  v.querySelectorAll("[data-lf]").forEach(b=>b.onclick=()=>{logFilter=b.dataset.lf;renderLog();});
  v.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openDetail(b.dataset.open));
  v.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{if(!confirm("Remove this sighting?"))return;state.sightings=state.sightings.filter(s=>s.id!==b.dataset.del);persist();renderLog();toast("Sighting removed");});
  const ex=$("#exp");if(ex)ex.onclick=()=>exportBackup();
}

/* ---------------- Detail ---------------- */
function openDetail(id){
  const a=findAny(id);if(!a)return;
  const isBird=BIRDS.includes(a);
  const dlg=$("#dlg"), sh=$("#sheet");
  const curM=new Date().getMonth();
  const s=currentSym(a);
  const hist=state.meanings[a.id]||[];
  const seen=sightingsOf(a.id).sort((x,y)=>y.date.localeCompare(x.date));
  const sizeLbl=isBird?SIZES.find(z=>z.id===a.size):null;
  const on=isBird?monthsOn(a.months):null;
  const aabName=isBird?(a.id==="red-masked-parakeet"?null:a.name.replace(/'/g,"").replace(/ /g,"_")):null;
  sh.innerHTML=`
  <div class="sheet-head">
    <h2 id="dlgTitle">${esc(a.name)}</h2>
    <div class="sub">${isBird?`${sizeLbl.label} — ${esc(sizeLbl.hint)}`:(a.custom?"Your own addition":"Beyond birds")}${seen.length?` · you've logged ${seen.length}`:""}</div>
    <button class="x" id="xBtn" aria-label="Close">×</button>
  </div>
  <div class="sheet-body">
    ${isBird?`
    <div class="sect">
      <h3>${a.both?"Adults and young":"Male, female and young"}</h3>
      <div class="pair">
        ${(a.both?[["a","Adult (male and female alike)",""],["y","Young",youngNote(a)]]:[["m","Male",a.mNote||""],["f","Female",a.fNote||""],["y","Young",youngNote(a)]]).map(([k,l,n])=>{
          const url=photoUrl(a.id,k);
          return `<figure class="fig">${withPhoto(birdSVG(a,k==="a"?"m":k),url,(k==="m"||k==="a")?a.name:null)}<figcaption>${l}</figcaption><div class="cap2">${esc(n)}</div>${assetsNs?`<div class="phrow"><button data-addph="${k}">${url?"Change photo":"Add your photo"}</button>${url?`<button data-rmph="${k}">Remove</button>`:""}</div>`:""}</figure>`;}).join("")}
      </div>
      <p class="photo-link">Drawings are stylized. Hover (or tap) the ${a.both?"adult":"male"} drawing for a real photo; add your own photos and they show up the same way. More photos: ${aabName?`<a href="https://www.allaboutbirds.org/guide/${aabName}" target="_blank" rel="noopener">All About Birds</a> or `:""}<a href="https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(a.name.replace(/.*\((.*)\).*/,"$1"))}" target="_blank" rel="noopener">iNaturalist</a>.</p>
    </div>
    <div class="sect">
      <h3>When it's in San Francisco</h3>
      ${on.every(Boolean)?`<span class="always">Here all year</span>`:`<div class="months">${MONTHS.map((m,i)=>`<div class="${on[i]?"on":""} ${i===curM?"now":""}" title="${on[i]?"Present":"Usually absent"}">${m[0]}<span class="sr">${m} ${on[i]?"present":"absent"}</span></div>`).join("")}</div>`}
      <p class="note">${esc(a.where)}</p>
    </div>`:""}
    ${!isBird?`<div class="sect"><figure class="fig" style="max-width:340px">${withPhoto(animalArt(a),photoUrl(a.id,"a"),a.name)}${(assetsNs||(a.custom&&sampleFn))?`<div class="phrow">${a.custom&&sampleFn?`<button id="redraw" ${a.drawing?"disabled":""}>${a.drawing?"Drawing…":a.svg?"Redraw":"Draw it"}</button>`:""}${assetsNs?`<button data-addph="a">${photoUrl(a.id,"a")?"Change photo":"Add a picture"}</button>${photoUrl(a.id,"a")?`<button data-rmph="a">Remove</button>`:""}`:""}</div>`:""}</figure></div>`:""}
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
      <button class="btn" id="addSight">${isBird?"Add sighting":"Log encounter"}</button>
      ${seen.length?`<ul class="hist" style="margin-top:14px">${seen.slice(0,6).map(x=>`<li><span class="when">${fmtDate(x.date)}</span> ${x.place?"· "+esc(x.place==="other"?x.placeText||"Other":x.place==="home"?"Home":"Park"):""}${x.how?" · "+esc(x.how):""}${x.note?" — "+esc(x.note):""}</li>`).join("")}</ul>`:""}
    </div>
    ${a.custom?`<div class="row"><button class="btn alt" id="delAnimal">Remove this animal</button></div>`:""}
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
  let sex="?",place="",how="";
  sh.querySelectorAll("[data-sex]").forEach(b=>b.onclick=()=>{sex=b.dataset.sex;sh.querySelectorAll("[data-sex]").forEach(x=>x.setAttribute("aria-pressed",x===b));});
  sh.querySelectorAll("[data-how]").forEach(b=>b.onclick=()=>{how=how===b.dataset.how?"":b.dataset.how;sh.querySelectorAll("[data-how]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.how===how));});
  sh.querySelectorAll("[data-place]").forEach(b=>b.onclick=()=>{place=place===b.dataset.place?"":b.dataset.place;sh.querySelectorAll("[data-place]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.place===place));const pt=$("#placeText");pt.style.display=place==="other"?"":"none";if(place==="other")pt.focus();});
  $("#addSight").onclick=()=>{
    const date=parseUS($("#sDate").value);if(!date){toast("Use MM/DD/YY for the date, like 09/30/26");$("#sDate").focus();return;}
    state.sightings.push({id:uid(),animalId:a.id,date,sex:isBird?sex:undefined,place,placeText:place==="other"?$("#placeText").value.trim():"",how:isBird?"":how,note:$("#sNote").value.trim(),t:Date.now()});
    persist();openDetail(a.id);refreshBehind();toast(isBird?"Sighting added":"Encounter logged");
  };
  const da=$("#delAnimal");if(da)da.onclick=()=>{if(!confirm("Remove "+a.name+"? Its sightings and meanings will be removed too."))return;state.custom=state.custom.filter(c=>c.id!==a.id);state.sightings=state.sightings.filter(x=>x.animalId!==a.id);delete state.meanings[a.id];persist();dlg.close();render();};
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
