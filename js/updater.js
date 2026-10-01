/* Kindred Wings — auto-updater. GitHub Pages serves the latest push; the service worker
   (sw.js) keeps an offline copy. This file checks version.json and offers a one-click update. */
function isNewer(a,b){const pa=String(a).split(".").map(Number),pb=String(b).split(".").map(Number);for(let i=0;i<3;i++){if((pa[i]||0)!==(pb[i]||0))return (pa[i]||0)>(pb[i]||0);}return false;}
let updateShown=false;
async function checkForUpdate(manual){
  try{
    const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"});
    if(!r.ok)throw 0;
    const v=await r.json();
    if(isNewer(v.version,APP_VERSION))showUpdate(v);
    else if(manual)toast("You're up to date — v"+APP_VERSION);
  }catch(e){if(manual)toast("Couldn't check for updates — are you offline?");}
}
function showUpdate(v){
  if(updateShown)return;updateShown=true;
  const bar=document.createElement("div");bar.className="updbar";bar.setAttribute("role","status");
  bar.innerHTML=`<span><strong>Version ${esc(v.version)} is ready.</strong> ${esc(v.notes||"")}</span><button class="btn" id="updNow">Update now</button><button class="clear" id="updLater">Later</button>`;
  document.body.prepend(bar);
  $("#updNow").onclick=applyUpdate;
  $("#updLater").onclick=()=>bar.remove();
}
async function applyUpdate(){
  try{
    const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();
    if(reg)await reg.update();
    if(window.caches){const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)));}
  }catch(e){}
  location.reload();
}
if("serviceWorker" in navigator&&location.protocol.startsWith("http")){
  navigator.serviceWorker.register("sw.js").catch(e=>console.warn("sw",e));
}
setTimeout(()=>checkForUpdate(false),3000);
setInterval(()=>checkForUpdate(false),30*60*1000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkForUpdate(false);});
