/* Kindred Creatures — drawing: bird medallions (birdSVG) and Southwestern tile art (ART, animalArt, drawAnimal). Plain script; shares globals with the other js/ files (load order in index.html). */
/* ---------------- Bird drawing ---------------- */
let svgN=0;
function starsBG(id,moon){
  const pts=[[24,30],[176,24],[160,58],[30,120],[180,130],[48,62],[140,146],[100,18],[16,90],[188,92]];
  return `<defs><radialGradient id="bg${id}" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#34487f"/><stop offset=".7" stop-color="#1e2a4f"/><stop offset="1" stop-color="#172142"/></radialGradient></defs>
  <rect width="200" height="160" fill="url(#bg${id})"/>
  <circle cx="100" cy="92" r="64" fill="none" stroke="#e9bd4c" stroke-opacity=".25" stroke-width="1"/>
  ${pts.map(([x,y],i)=>i%3===0?`<path d="M${x} ${y-4} L${x+1.2} ${y-1.2} L${x+4} ${y} L${x+1.2} ${y+1.2} L${x} ${y+4} L${x-1.2} ${y+1.2} L${x-4} ${y} L${x-1.2} ${y-1.2}Z" fill="#f3d98a"/>`:`<circle cx="${x}" cy="${y}" r="${i%2?1.2:1.7}" fill="#fff6d0" opacity=".85"/>`).join("")}
  ${moon?`<path d="M170 34 a10 10 0 1 0 0 18 a8 8 0 1 1 0 -18z" fill="#f3d98a" opacity=".9"/>`:""}`;
}
const GEO={
 song:{B:[92,98,40,27,-15],H:[132,64,18]},
 dove:{B:[92,98,42,25,-10],H:[134,68,14]},
 hummer:{B:[90,98,32,17,-30],H:[118,72,14]},
 raptor:{B:[94,94,34,42,-18],H:[126,50,20]},
 owl:{B:[100,104,40,46,0],H:[100,58,30]},
 wader:{B:[78,100,36,19,-10],H:[140,34,11]},
 nightheron:{B:[86,100,40,25,-10],H:[128,68,18]},
 duck:{B:[92,104,50,23,-4],H:[146,70,17]},
 goose:{B:[86,106,48,22,-4],H:[150,42,14]},
 gull:{B:[90,96,46,21,-6],H:[140,66,16]},
 pelican:{B:[86,100,46,24,-6],H:[132,56,14]},
 cormorant:{B:[88,100,44,17,-18],H:[140,54,12]},
 quail:{B:[92,102,44,32,-6],H:[134,68,17]},
 penguin:{B:[98,102,28,40,0],H:[106,54,16]}
};
function birdSVG(bird,sex,opts={}){
  const id="b"+(++svgN);
  const look=Object.assign({},lookFor(bird,sex));
  const P=Object.assign({head:"#777",back:"#777",belly:"#bbb",wing:"#666",tail:null,beak:"#2a2a2a",leg:"#6b5a4a",eye:"#1a1a1a"},look);
  P.tail=P.tail||P.wing;
  const shape=bird.shape, g=GEO[shape]||GEO.song;
  let [bx,by,rx,ry,rot]=g.B, [hx,hy,hr]=g.H;
  if(bird.headBig)hr+=3;
  const S='stroke="#f3d98a" stroke-width="1.3" stroke-linejoin="round"';
  let out=[starsBG(id,monthsOn(bird.months).every(Boolean))];
  // peacock train (behind everything)
  if(P.train){let s="";for(let k=0;k<11;k++){const an=Math.PI*(1.05+k*0.09);const x=bx-6+Math.cos(an)*70, y=by-6+Math.sin(an)*62;s+=`<path d="M${bx-10} ${by} L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#3f8f4e" stroke-width="3"/><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="10" fill="#3f8f4e" ${S}/><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="4.5" ry="5.5" fill="#2f5fb3"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="#f2c92c"/>`;}out.push(s);}
  // quetzal streamers
  if(bird.streamers&&sex!=="f"&&sex!=="y") out.push(`<path d="M${bx-rx*.7} ${by+ry*.3} Q${bx-rx*1.6} ${by+ry*1.4} ${bx-rx*2.3} ${by+ry*2.3}" stroke="${P.tail}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${bx-rx*.7} ${by+ry*.4} Q${bx-rx*1.4} ${by+ry*1.7} ${bx-rx*1.9} ${by+ry*2.6}" stroke="${P.tail}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  // tail
  const tl=bird.tail||(shape==="dove"?50:38);
  if(["song","dove"].includes(shape)){
    const tx=bx-rx*0.78, ty=by+ry*0.25;
    if(P.fork) out.push(`<path d="M${tx} ${ty-6} L${tx-tl} ${ty+tl*.2} L${tx-tl*.55} ${ty+6} L${tx-tl} ${ty+tl*.45} L${tx+6} ${ty+8}Z" fill="${P.tail}" ${S}/>`);
    else out.push(`<path d="M${tx+4} ${ty-7} L${tx-tl} ${ty+tl*.28} L${tx-tl+(shape==="dove"?2:9)} ${ty+tl*.28+10} L${tx+8} ${ty+8}Z" fill="${P.tail}" ${S}/>`);
    if(P.tailTip) out.push(`<path d="M${tx-tl} ${ty+tl*.28} L${tx-tl+9} ${ty+tl*.28+10} L${tx-tl+14} ${ty+tl*.28+5} L${tx-tl+5} ${ty+tl*.28-4}Z" fill="${P.tailTip}"/>`);
  }else if(shape==="hummer"){
    out.push(`<path d="M68 108 L40 128 L50 131 L44 140 L76 116Z" fill="${P.tail}" ${S}/>`);
  }else if(shape==="raptor"){
    out.push(`<path d="M76 120 L50 148 L72 154 L90 128Z" fill="${P.tail}" ${S}/>`);
    [0,1,2].forEach(i=>out.push(`<path d="M${70-i*6} ${132+i*6} l16 5" stroke="#1c1c22" stroke-opacity=".35" stroke-width="2"/>`));
  }else if(["wader","nightheron"].includes(shape)){
    out.push(`<path d="M${bx-rx*.8} ${by} L${bx-rx-18} ${by+10} L${bx-rx*.7} ${by+12}Z" fill="${P.tail}" ${S}/>`);
  }else if(["duck","goose"].includes(shape)){
    out.push(`<path d="M${bx-rx*.85} ${by-4} L${bx-rx-14} ${by-14} L${bx-rx*.8} ${by+8}Z" fill="${P.tail}" ${S}/>`);
  }else if(["gull","pelican","cormorant"].includes(shape)){
    out.push(`<path d="M${bx-rx*.8} ${by-2} L${bx-rx-20} ${by+6} L${bx-rx*.75} ${by+12}Z" fill="${P.tail}" ${S}/>`);
  }else if(shape==="quail"){
    out.push(`<path d="M${bx-rx*.8} ${by} L${bx-rx-10} ${by+6} L${bx-rx*.7} ${by+14}Z" fill="${P.tail}" ${S}/>`);
  }
  // legs
  const leg=(x1,y1,len,col)=>`<path d="M${x1} ${y1} L${x1-2} ${y1+len} M${x1-2} ${y1+len} l-7 2 M${x1-2} ${y1+len} l6 2" stroke="${col}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  if(["song","dove","quail"].includes(shape)){const ll=bird.long?24:12;const ly=by+ry*.85;out.push(leg(bx-4,ly,ll,P.leg),leg(bx+10,ly-2,ll,P.leg));}
  if(shape==="raptor"){out.push(`<path d="M98 132 l-2 12 M110 128 l0 14" stroke="${P.leg}" stroke-width="5" stroke-linecap="round"/>`,`<path d="M90 146 h12 M104 144 h12" stroke="#1c1c22" stroke-width="2"/>`);}
  if(shape==="wader"){out.push(leg(74,114,44,P.leg),leg(88,114,44,P.leg));if(P.feet)out.push(`<path d="M63 160 h14 M77 160 h14" stroke="${P.feet}" stroke-width="4" stroke-linecap="round"/>`);}
  if(shape==="nightheron"){out.push(leg(84,120,26,P.leg),leg(98,118,26,P.leg));}
  if(["gull","pelican"].includes(shape)){out.push(leg(88,114,16,P.leg),leg(100,113,16,P.leg));}
  if(shape==="cormorant"){out.push(leg(92,114,12,"#2a2a2a"));}
  if(shape==="penguin"){out.push(`<path d="M86 140 h12 M100 140 h12" stroke="${P.leg==="#6b5a4a"?"#2a2a2a":P.leg}" stroke-width="5" stroke-linecap="round"/>`);}
  // water
  if(["duck","goose"].includes(shape)) out.push(`<path d="M20 ${by+16} q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V160 H20Z" fill="#3f9c9a" fill-opacity=".45"/><path d="M20 ${by+16} q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0" fill="none" stroke="#f3d98a" stroke-opacity=".6"/>`);
  // hummer wing (behind)
  if(shape==="hummer") out.push(`<path d="M90 90 Q62 50 50 30 Q84 36 104 88Z" fill="${P.wing}" fill-opacity=".85" ${S}/><path d="M98 88 Q100 50 94 26 Q116 44 108 90Z" fill="${P.wing}" fill-opacity=".55" ${S}/>`);
  // necks
  if(shape==="wader"){const nc=P.neck||P.head;out.push(`<path d="M104 92 C122 84 110 58 124 46 C130 40 134 38 ${hx} ${hy}" stroke="#f3d98a" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M104 92 C122 84 110 58 124 46 C130 40 134 38 ${hx} ${hy}" stroke="${nc}" stroke-width="11.4" fill="none" stroke-linecap="round"/>`);}
  if(shape==="goose"){out.push(`<path d="M128 96 C140 80 144 60 ${hx} ${hy}" stroke="#f3d98a" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M128 96 C140 80 144 60 ${hx} ${hy}" stroke="${P.throat||P.head}" stroke-width="12.4" fill="none" stroke-linecap="round"/>`);}
  if(["pelican","cormorant"].includes(shape)){out.push(`<path d="M${bx+rx*.7} ${by-6} C${hx} ${by-10} ${hx-8} ${hy+18} ${hx} ${hy}" stroke="#f3d98a" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M${bx+rx*.7} ${by-6} C${hx} ${by-10} ${hx-8} ${hy+18} ${hx} ${hy}" stroke="${P.throat||P.head}" stroke-width="12.4" fill="none" stroke-linecap="round"/>`);}
  if(["duck","nightheron"].includes(shape)){out.push(`<ellipse cx="${hx-10}" cy="${hy+16}" rx="12" ry="15" fill="${P.throat||P.head}" ${S}/>`);}
  // body
  out.push(`<defs><clipPath id="c${id}"><ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${bx} ${by})"/></clipPath></defs>`);
  out.push(`<ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${bx} ${by})" fill="${P.back}" ${S}/>`);
  out.push(`<g clip-path="url(#c${id})"><ellipse cx="${bx+rx*.25}" cy="${by+ry*.55}" rx="${rx*.85}" ry="${ry*.7}" transform="rotate(${rot} ${bx} ${by})" fill="${P.belly}"/>`);
  // belly patterns
  const dots=[];
  for(let i=0;i<14;i++){const a=i*2.4, r=.25+.5*((i*37)%10)/10;const x=bx+rx*.3+Math.cos(a)*rx*.5*r, y=by+ry*.55+Math.sin(a)*ry*.4*r;dots.push([x,y]);}
  if(P.streaks) dots.forEach(([x,y])=>out.push(`<path d="M${x} ${y-2.5} q1 3 0 5" stroke="${P.back}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`));
  else if(P.spots) dots.forEach(([x,y])=>out.push(`<circle cx="${x}" cy="${y}" r="1.8" fill="#1c1c22" opacity=".55"/>`));
  else if(P.bars&&shape!=="song") dots.forEach(([x,y],i)=>i%2&&out.push(`<path d="M${x-4} ${y} h8" stroke="#1c1c22" stroke-opacity=".35" stroke-width="1.6"/>`));
  else if(P.scales) dots.forEach(([x,y])=>out.push(`<path d="M${x-3} ${y} a3 3 0 0 0 6 0" fill="none" stroke="#f3d98a" stroke-opacity=".55" stroke-width="1"/>`));
  else dots.forEach(([x,y],i)=>i%2&&out.push(`<circle cx="${x}" cy="${y}" r="1.4" fill="#ffffff" opacity=".35"/>`));
  if(P.patch&&["side","bellyband"].includes(P.patch.at)) out.push(`<ellipse cx="${bx+(P.patch.at==="side"?-2:6)}" cy="${by+ry*.45}" rx="${rx*.45}" ry="${ry*.28}" fill="${P.patch.c}" opacity=".95"/>`);
  if(P.patch2&&P.patch2.at==="side") out.push(`<ellipse cx="${bx+4}" cy="${by+ry*.6}" rx="${rx*.5}" ry="${ry*.22}" fill="${P.patch2.c}"/>`);
  out.push(`</g>`);
  // spiral ornament
  out.push(`<path d="M${bx-rx*.35} ${by+ry*.1} m-4 0 a4 4 0 1 1 4 4 a7 7 0 1 1 -7 -7" fill="none" stroke="#f3d98a" stroke-opacity=".6" stroke-width="1.1"/>`);
  // wing
  if(shape==="penguin"){
    out.push(`<path d="M${bx+rx*.55} ${by-ry*.4} Q${bx+rx*1.3} ${by+ry*.2} ${bx+rx*.9} ${by+ry*.7} Q${bx+rx*.6} ${by+ry*.2} ${bx+rx*.5} ${by-ry*.1}Z" fill="${P.wing}" ${S}/>`);
  }
  if(shape!=="hummer"&&shape!=="owl"&&shape!=="penguin"){
    const wx=bx, wy=by;
    const wlong=["gull","pelican"].includes(shape)?1.25:1;
    out.push(`<g transform="rotate(${rot} ${bx} ${by})"><path d="M${wx-rx*.5} ${wy-ry*.4} Q${wx+rx*.15} ${wy-ry*.95} ${wx+rx*.6} ${wy-ry*.2} Q${wx+rx*.2} ${wy+ry*.7} ${wx-rx*.75*wlong} ${wy+ry*.5} Q${wx-rx*1.05*wlong} ${wy+ry*.1} ${wx-rx*.5} ${wy-ry*.4}Z" fill="${P.wing}" ${S}/>`);
    for(let i=0;i<3;i++){const t=.2+i*.22;out.push(`<path d="M${wx-rx*(.55-t*.6)} ${wy+ry*(.35-i*.02)} q${rx*.12} ${-ry*.35} ${rx*.26} 0" fill="none" stroke="#f3d98a" stroke-opacity=".7" stroke-width="1"/>`);}
    if(P.bars) out.push(`<path d="M${wx-rx*.35} ${wy-ry*.12} q${rx*.35} ${-ry*.25} ${rx*.7} ${-ry*.05}" stroke="${W}" stroke-width="2.4" fill="none" opacity=".85"/>`);
    if(P.speculum) out.push(`<path d="M${wx-rx*.2} ${wy+ry*.1} q${rx*.3} ${-ry*.2} ${rx*.55} 0" stroke="${P.speculum}" stroke-width="4" fill="none"/>`);
    [[.1,.05],[-.15,.2],[.3,-.15],[-.35,.32]].forEach(([a,b])=>out.push(`<circle cx="${wx+rx*a}" cy="${wy+ry*b}" r="1.6" fill="#fff6d0" opacity=".8"/>`));
    if(["gull"].includes(shape)) out.push(`<path d="M${wx-rx*.75*wlong} ${wy+ry*.5} Q${wx-rx*1.05*wlong} ${wy+ry*.1} ${wx-rx*.8} ${wy-ry*.05} L${wx-rx*.6} ${wy+ry*.45}Z" fill="#1c1c22"/><circle cx="${wx-rx*.95}" cy="${wy+ry*.25}" r="1.6" fill="#fff"/>`);
    out.push(`</g>`);
    if(P.patch&&P.patch.at==="shoulder"){const s=P.patch.s||1;out.push(`<ellipse cx="${bx+rx*.2}" cy="${by-ry*.45}" rx="${10*s}" ry="${5.5*s}" transform="rotate(${rot} ${bx} ${by})" fill="${P.patch.c}" ${P.patch.edge?`stroke="${P.patch.edge}" stroke-width="2.5"`:""}/>`);}
  }
  if(shape==="owl"){
    out.push(`<ellipse cx="${bx-rx*.72}" cy="${by+6}" rx="${rx*.38}" ry="${ry*.78}" fill="${P.wing}" ${S}/><ellipse cx="${bx+rx*.72}" cy="${by+6}" rx="${rx*.38}" ry="${ry*.78}" fill="${P.wing}" ${S}/>`);
    [[-.72,0],[.72,0],[-.72,.35],[.72,.35]].forEach(([a,b])=>out.push(`<path d="M${bx+rx*a-6} ${by+ry*b} q6 -6 12 0" fill="none" stroke="#f3d98a" stroke-opacity=".7"/>`));
  }
  if(P.patch&&P.patch.at==="breastband"){const s=P.patch.s||1;out.push(`<ellipse cx="${bx+rx*.62}" cy="${by-ry*.05}" rx="${12*s}" ry="${9*s}" transform="rotate(${rot} ${bx} ${by})" fill="${P.patch.c}" opacity=".95"/>`);}
  if(P.patch&&P.patch.at==="rump") out.push(`<ellipse cx="${bx-rx*.8}" cy="${by-4}" rx="7" ry="5" fill="${P.patch.c}"/>`);
  // head
  out.push(`<defs><clipPath id="h${id}"><circle cx="${hx}" cy="${hy}" r="${hr}"/></clipPath></defs>`);
  if(bird.crest||P.crest) out.push(`<path d="M${hx-hr*.9} ${hy-hr*.2} L${hx-hr*1.5} ${hy-hr*1.6} L${hx-hr*.2} ${hy-hr*.9}Z" fill="${P.cap||P.head}" ${S}/>`);
  if(bird.tufts) out.push(`<path d="M${hx-hr*.75} ${hy-hr*.55} L${hx-hr*.95} ${hy-hr*1.35} L${hx-hr*.3} ${hy-hr*.85}Z M${hx+hr*.75} ${hy-hr*.55} L${hx+hr*.95} ${hy-hr*1.35} L${hx+hr*.3} ${hy-hr*.85}Z" fill="${P.head}" ${S}/>`);
  if(P.plume&&shape==="quail") out.push(`<path d="M${hx} ${hy-hr*.9} Q${hx-6} ${hy-hr*2.1} ${hx+10} ${hy-hr*2.1} Q${hx+4} ${hy-hr*1.4} ${hx+3} ${hy-hr*.9}Z" fill="${P.plume}" ${S}/>`);
  if(P.plume&&["wader","nightheron"].includes(shape)) out.push(`<path d="M${hx-hr*.6} ${hy-hr*.3} q-16 4 -26 16" stroke="${P.plume}" stroke-width="2" fill="none"/>`);
  out.push(`<circle cx="${hx}" cy="${hy}" r="${hr}" fill="${P.head}" ${S}/>`);
  out.push(`<g clip-path="url(#h${id})">`);
  if(shape==="owl"){
    if(P.heart) out.push(`<path d="M${hx} ${hy-hr*.55} C${hx-hr*.3} ${hy-hr} ${hx-hr*1.05} ${hy-hr*.6} ${hx-hr*.8} ${hy+hr*.05} C${hx-hr*.6} ${hy+hr*.6} ${hx} ${hy+hr*.95} ${hx} ${hy+hr*.95} C${hx} ${hy+hr*.95} ${hx+hr*.6} ${hy+hr*.6} ${hx+hr*.8} ${hy+hr*.05} C${hx+hr*1.05} ${hy-hr*.6} ${hx+hr*.3} ${hy-hr} ${hx} ${hy-hr*.55}Z" fill="${P.face}"/>`);
    else out.push(`<circle cx="${hx-hr*.36}" cy="${hy}" r="${hr*.5}" fill="${P.face}"/><circle cx="${hx+hr*.36}" cy="${hy}" r="${hr*.5}" fill="${P.face}"/>`);
    if(P.throat) out.push(`<ellipse cx="${hx}" cy="${hy+hr*.9}" rx="${hr*.45}" ry="${hr*.2}" fill="${P.throat}"/>`);
  }else{
    if(P.cap) out.push(`<rect x="${hx-hr}" y="${hy-hr}" width="${hr*2}" height="${hr*.85}" fill="${P.cap}"/>`);
    if(P.crownStripe) out.push(`<rect x="${hx-hr}" y="${hy-hr*.55}" width="${hr*2}" height="${hr*.22}" fill="${P.crownStripe}"/><rect x="${hx-hr}" y="${hy-hr*.95}" width="${hr*2}" height="${hr*.16}" fill="${P.crownStripe}"/>`);
    if(P.face) out.push(`<rect x="${hx-hr*.3}" y="${hy-hr*.42}" width="${hr*1.4}" height="${hr*.55}" fill="${P.face}"/>`);
    if(P.throat) out.push(`<ellipse cx="${hx+hr*.45}" cy="${hy+hr*.95}" rx="${hr*.7}" ry="${hr*.55}" fill="${P.throat}"/>`);
    if(P.patch){const s=P.patch.s||1;const at=P.patch.at;
      if(at==="crown") out.push(`<ellipse cx="${hx}" cy="${hy-hr*.85}" rx="${hr*.45}" ry="${hr*.25}" fill="${P.patch.c}"/>`);
      if(at==="nape") out.push(`<circle cx="${hx-hr*.8}" cy="${hy-hr*.35}" r="${hr*.3}" fill="${P.patch.c}"/>`);
      if(at==="mustache") out.push(`<path d="M${hx+hr*.2} ${hy+hr*.35} l${hr*.7} ${hr*.1}" stroke="${P.patch.c}" stroke-width="${hr*.22}" stroke-linecap="round"/>`);
      if(at==="cheek") out.push(`<circle cx="${hx-hr*.15}" cy="${hy+hr*.1}" r="${hr*.28}" fill="${P.patch.c}"/>`);
      if(at==="cheekbig") out.push(`<path d="M${hx-hr*.9} ${hy-hr*.2} Q${hx-hr*.2} ${hy-hr*1.1} ${hx+hr*.1} ${hy+hr*.1} Q${hx-hr*.3} ${hy+hr*.6} ${hx-hr*.9} ${hy+hr*.3}Z" fill="${P.patch.c}"/>`);
      if(at==="throat") out.push(`<circle cx="${hx+hr*.55}" cy="${hy+hr*.7}" r="${hr*.28*s*2}" fill="${P.patch.c}"/>`);
    }
    if(P.throat&&shape==="hummer") out.push(`<path d="M${hx+hr*.4} ${hy+hr*.55} q-4 4 -2 8" stroke="#fff" stroke-opacity=".35" fill="none"/>`);
  }
  out.push(`</g>`);
  // eyes
  const eye=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r+1.8}" fill="${P.eyeRing||"#f4ecd2"}" stroke="#e9bd4c" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="${r}" fill="${P.eye}"/><circle cx="${x}" cy="${y}" r="${r*.45}" fill="#0d0d12"/><circle cx="${x+r*.35}" cy="${y-r*.35}" r="${r*.3}" fill="#fff"/>`;
  if(shape==="owl"){out.push(eye(hx-hr*.36,hy-2,6.5),eye(hx+hr*.36,hy-2,6.5));out.push(`<path d="M${hx-3} ${hy+6} L${hx+3} ${hy+6} L${hx} ${hy+13}Z" fill="#3a3a3a" stroke="#f3d98a" stroke-width="1"/>`);}
  else{const er=Math.max(3,hr*.22);out.push(eye(hx+hr*.3,hy-hr*.18,er));}
  // beak
  if(shape!=="owl"){
    const bx0=hx+hr*.88, by0=hy+(shape==="wader"?2:0);
    const bk=bird.beak||({hummer:"needle",raptor:"hook",wader:"dagger",nightheron:"dagger",duck:"flat",goose:"flat",gull:"gull",pelican:"pouch",cormorant:"thinhook",quail:"short",dove:"short"}[shape])||"cone";
    const c=P.beak;
    const beaks={
      cone:`<path d="M${bx0-2} ${by0-6} L${bx0+14} ${by0} L${bx0-2} ${by0+6}Z"/>`,
      thin:`<path d="M${bx0-2} ${by0-3.5} L${bx0+16} ${by0} L${bx0-2} ${by0+3}Z"/>`,
      short:`<path d="M${bx0-2} ${by0-3} L${bx0+9} ${by0} L${bx0-2} ${by0+3}Z"/>`,
      thick:`<path d="M${bx0-3} ${by0-7} Q${bx0+18} ${by0-6} ${bx0+22} ${by0+1} L${bx0-3} ${by0+6}Z"/>`,
      chisel:`<path d="M${bx0-2} ${by0-4} L${bx0+22} ${by0} L${bx0-2} ${by0+4}Z"/>`,
      hook:`<path d="M${bx0-3} ${by0-7} Q${bx0+14} ${by0-8} ${bx0+12} ${by0+8} Q${bx0+6} ${by0+1} ${bx0-3} ${by0+6}Z"/>`,
      thinhook:`<path d="M${bx0-2} ${by0-3} L${bx0+22} ${by0-2} q3 1 1 5 L${bx0-2} ${by0+3}Z"/>`,
      needle:`<path d="M${bx0-2} ${by0-2} L${bx0+40} ${by0-12} L${bx0+40} ${by0-10} L${bx0-2} ${by0+2}Z"/>`,
      dagger:`<path d="M${bx0-2} ${by0-3.5} L${bx0+(shape==="wader"?34:22)} ${by0+2} L${bx0-2} ${by0+4}Z"/>`,
      flat:`<path d="M${bx0-3} ${by0-4} Q${bx0+18} ${by0-3} ${bx0+17} ${by0+5} Q${bx0+8} ${by0+8} ${bx0-3} ${by0+5}Z"/>`,
      gull:`<path d="M${bx0-2} ${by0-4} L${bx0+18} ${by0-1} q2 3 -1 5 L${bx0-2} ${by0+4}Z"/><circle cx="${bx0+13}" cy="${by0+3}" r="2" fill="#d8243a"/>`,
      pouch:`<path d="M${bx0-3} ${by0-4} L${bx0+44} ${by0+4} L${bx0+40} ${by0+9} Q${bx0+18} ${by0+20} ${bx0-3} ${by0+6}Z"/>`,
      flamingo:`<path d="M${bx0-2} ${by0-4} L${bx0+12} ${by0-3} L${bx0+16} ${by0+12} L${bx0+11} ${by0+12} L${bx0+8} ${by0+3} L${bx0-2} ${by0+4}Z"/><path d="M${bx0+12} ${by0+3} L${bx0+16} ${by0+12} L${bx0+11} ${by0+12}Z" fill="#1c1c22"/>`,
      curve:`<path d="M${bx0-2} ${by0-3} Q${bx0+24} ${by0-2} ${bx0+34} ${by0+20} Q${bx0+20} ${by0+6} ${bx0-2} ${by0+3}Z"/>`,
      toucan:`<path d="M${bx0-4} ${by0-10} Q${bx0+30} ${by0-14} ${bx0+44} ${by0+4} Q${bx0+30} ${by0+12} ${bx0-4} ${by0+8}Z"/><path d="M${bx0+30} ${by0-8} Q${bx0+40} ${by0-4} ${bx0+44} ${by0+4} Q${bx0+36} ${by0+8} ${bx0+30} ${by0+8}Z" fill="#d8322f"/><path d="M${bx0+8} ${by0-8} L${bx0+18} ${by0+8}" stroke="#e0782a" stroke-width="4"/><path d="M${bx0+18} ${by0-9} L${bx0+26} ${by0+8}" stroke="#2f5fb3" stroke-width="3"/>`,
      parrot:`<path d="M${bx0-4} ${by0-8} Q${bx0+16} ${by0-12} ${bx0+16} ${by0+4} Q${bx0+14} ${by0+14} ${bx0+8} ${by0+12} Q${bx0+10} ${by0+4} ${bx0+4} ${by0+2} L${bx0-4} ${by0+8}Z"/>`,
      puffin:`<path d="M${bx0-3} ${by0-9} L${bx0+14} ${by0} L${bx0-3} ${by0+9}Z"/><path d="M${bx0+2} ${by0-6} L${bx0+2} ${by0+6}" stroke="#f2c92c" stroke-width="2"/><path d="M${bx0-3} ${by0-9} L${bx0-3} ${by0+9}" stroke="#4a5aa8" stroke-width="3"/>`
    };
    out.push(`<g fill="${c}" stroke="#f3d98a" stroke-width="1" stroke-linejoin="round">${beaks[bk]||beaks.cone}</g>`);
    if(P.face&&shape==="cormorant") out.push(`<circle cx="${bx0-2}" cy="${by0+2}" r="4" fill="${P.face}"/>`);
  }
  const label=esc(bird.name)+(sex==="y"?", young":bird.both?"":(sex==="f"?", female":", male"));
  return `<svg viewBox="0 0 200 160" ${P._muted?'style="filter:saturate(.7) brightness(.95)"':""} role="img" aria-label="Illustration: ${label}" xmlns="http://www.w3.org/2000/svg">${out.join("")}</svg>`;
}
function animalMedal(a){
  return `<div class="emedal" aria-hidden="true">${a.emoji?`<span>${esc(a.emoji)}</span>`:`<span class="letter">${esc((a.name||"?").trim().charAt(0).toUpperCase())}</span>`}</div>`;
}

/* ---------------- Tile art for beyond-bird animals ---------------- */
const GS='stroke="#f3d98a" stroke-width="1.3" stroke-linejoin="round"';
function tileFrame(bg,motif){
  let z="";for(let x=12;x<188;x+=8){z+=`<path d="M${x} 12 l4 5 l4 -5Z M${x} 148 l4 -5 l4 5Z" fill="#f3d98a" opacity=".55"/>`;}
  const corner=(x,y)=>`<path d="M${x} ${y-7} L${x+7} ${y} L${x} ${y+7} L${x-7} ${y}Z" fill="#df8a7c" ${GS}/><circle cx="${x}" cy="${y}" r="2" fill="#f3d98a"/>`;
  const motifs={
    mesa:`<path d="M12 148 V126 H34 V118 H58 V128 H92 V136 H130 V122 H150 V114 H170 V126 H188 V148Z" fill="#000" opacity=".22"/>`,
    pines:`<g fill="#000" opacity=".22"><path d="M28 148 L40 108 L52 148Z M44 148 L58 96 L72 148Z M150 148 L164 104 L178 148Z"/></g>`,
    waves:`<path d="M12 132 q12 -8 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t20 0 V148 H12Z" fill="#3f9c9a" opacity=".5"/><path d="M12 132 q12 -8 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t20 0" fill="none" stroke="#f3d98a" stroke-opacity=".6"/>`,
    comb:`<g fill="none" stroke="#f3d98a" stroke-opacity=".35">${[[30,34],[44,34],[37,46],[166,122],[152,122],[159,134]].map(([x,y])=>`<path d="M${x} ${y-7} l6 3.5 v7 l-6 3.5 l-6 -3.5 v-7Z"/>`).join("")}</g>`,
    flowers:`<g>${[[34,128],[166,130],[150,40]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#df8a7c" ${GS}/><circle cx="${x}" cy="${y}" r="2.5" fill="#f3d98a"/>`).join("")}</g>`,
    steps:`<path d="M12 148 L28 132 L44 148 L60 132 L76 148" fill="none" stroke="#f3d98a" stroke-opacity=".45" stroke-width="2"/><path d="M124 148 L140 132 L156 148 L172 132 L188 148" fill="none" stroke="#f3d98a" stroke-opacity=".45" stroke-width="2"/>`
  };
  return `<rect width="200" height="160" fill="${bg}"/>${motifs[motif]||""}
  <rect x="5" y="5" width="190" height="150" fill="none" stroke="#f3d98a" stroke-width="2"/>
  <rect x="11" y="11" width="178" height="138" fill="none" stroke="#f3d98a" stroke-width="1" stroke-opacity=".6"/>${z}
  ${corner(11,11)}${corner(189,11)}${corner(11,149)}${corner(189,149)}`;
}
const limb=(d,c,w)=>`<path d="${d}" stroke="#f3d98a" stroke-width="${w+2.6}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
const ART={
 giraffe:()=>tileFrame("#1d6a6c","flowers")+
  limb("M66 112 L62 144 M76 114 L76 146 M98 114 L100 146 M108 110 L112 144","#e8b24a",7)+
  `<path d="M54 100 Q44 112 46 126" stroke="#8a4a24" stroke-width="2.5" fill="none"/><ellipse cx="46" cy="128" rx="3" ry="5" fill="#5a2a14"/>
  <defs><clipPath id="gfc"><ellipse cx="84" cy="104" rx="32" ry="16"/><path d="M96 100 L126 40 L140 44 L114 106Z"/></clipPath></defs>
  <ellipse cx="84" cy="104" rx="32" ry="16" fill="#e8b24a" ${GS}/><path d="M96 100 L126 40 L140 44 L114 106Z" fill="#e8b24a" ${GS}/>
  <g clip-path="url(#gfc)" fill="#8a4a24">${[[60,94,11,8],[76,92,12,9],[94,96,9,8],[66,106,11,7],[84,106,10,8],[100,108,9,6],[108,86,7,6],[114,72,7,6],[121,58,6,5],[126,46,5,4]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5"/>`).join("")}</g>
  <path d="M100 98 L128 40" stroke="#8a4a24" stroke-width="3" stroke-dasharray="3 3"/>
  <ellipse cx="146" cy="40" rx="15" ry="8" transform="rotate(18 146 40)" fill="#e8b24a" ${GS}/>
  <path d="M138 32 L136 20 M145 32 L146 20" stroke="#5a2a14" stroke-width="2.6" stroke-linecap="round"/><circle cx="136" cy="19" r="2.6" fill="#5a2a14"/><circle cx="146" cy="19" r="2.6" fill="#5a2a14"/>
  <ellipse cx="132" cy="36" rx="6" ry="3" transform="rotate(-30 132 36)" fill="#e8b24a" ${GS}/><circle cx="145" cy="37" r="2.2" fill="#1c1c22"/>
  <path d="M58 145 h8 M72 147 h8 M96 147 h8 M108 145 h8" stroke="#3a2010" stroke-width="3"/>`,
 elephant:()=>tileFrame("#a8492f","steps")+
  [62,78,104,118].map(x=>`<rect x="${x}" y="108" width="14" height="36" rx="4" fill="#8a8f9a" ${GS}/><path d="M${x+3} 143 q2 -3 4 0 M${x+8} 143 q2 -3 4 0" stroke="#f4f2ea" fill="none"/>`).join("")+
  `<path d="M50 96 Q42 110 46 120" stroke="#6e737e" stroke-width="2.5" fill="none"/>
  <ellipse cx="92" cy="98" rx="42" ry="28" fill="#8a8f9a" ${GS}/>
  <path d="M72 72 Q92 66 112 72 L108 98 Q92 102 76 98Z" fill="#3f9c9a" ${GS}/><path d="M76 84 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l4 4" stroke="#f3d98a" fill="none"/><g fill="#df8a7c">${[78,88,98,106].map(x=>`<circle cx="${x}" cy="96" r="2"/>`).join("")}</g>
  ${limb("M150 92 Q164 112 158 132 Q156 142 166 138","#8a8f9a",12)}
  <circle cx="136" cy="80" r="22" fill="#8a8f9a" ${GS}/>
  <path d="M124 60 Q100 62 104 92 Q108 112 128 102Z" fill="#a8adb8" ${GS}/><path d="M118 70 Q108 76 112 92" stroke="#df8a7c" stroke-dasharray="2 4" stroke-width="2" fill="none"/>
  <path d="M150 98 Q160 108 172 102" stroke="#f4f2ea" stroke-width="4" stroke-linecap="round" fill="none"/>
  <circle cx="144" cy="74" r="2.6" fill="#1c1c22"/>`,
 whale:()=>tileFrame("#1e3a6a","waves")+
  `<path d="M140 64 Q132 44 122 38 M140 64 Q140 42 140 30 M140 64 Q148 44 158 38" stroke="#c9e8ea" stroke-width="2" fill="none"/><g fill="#c9e8ea"><circle cx="120" cy="36" r="2.4"/><circle cx="140" cy="27" r="2.4"/><circle cx="160" cy="36" r="2.4"/></g>
  <path d="M46 94 Q32 88 16 72 Q22 90 26 96 Q22 104 14 120 Q32 106 46 100Z" fill="#3a5a8a" ${GS}/>
  <path d="M40 96 Q70 62 130 66 Q172 70 180 92 Q168 108 128 110 Q80 114 40 96Z" fill="#3a5a8a" ${GS}/>
  <path d="M70 104 Q120 116 176 98 Q154 112 122 112 Q90 114 70 104Z" fill="#c9ccd0"/>
  <path d="M96 108 l2 4 M110 109 l2 4 M124 109 l2 4 M138 107 l2 4 M152 104 l2 4" stroke="#3a5a8a" stroke-width="1.5"/>
  <path d="M112 104 Q104 130 86 140 Q108 134 124 108Z" fill="#2f4c78" ${GS}/>
  <g fill="#f3d98a" opacity=".85">${[[80,78],[96,72],[112,70],[128,72],[88,88],[106,84]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.8"/>`).join("")}</g>
  <circle cx="160" cy="92" r="2.6" fill="#1c1c22" stroke="#f3d98a"/>`,
 wolf:()=>tileFrame("#2f4f3a","mesa")+
  `<path d="M64 140 Q30 144 32 120 Q44 134 72 130Z" fill="#6e747c" ${GS}/>
  <path d="M56 142 Q48 108 76 98 Q96 90 104 74 L118 82 Q126 104 122 120 L126 142Z" fill="#8a8f96" ${GS}/>
  <ellipse cx="72" cy="124" rx="20" ry="18" fill="#7a8088" ${GS}/><path d="M64 118 a5 5 0 1 1 5 5 a9 9 0 1 1 -9 -9" fill="none" stroke="#f3d98a" stroke-opacity=".7"/>
  ${limb("M112 118 L112 144 M121 118 L123 144","#8a8f96",7)}
  <path d="M100 78 L110 52 L118 40 L140 22 L145 28 L131 48 L133 60 Q124 78 112 84Z" fill="#8a8f96" ${GS}/>
  <path d="M110 54 L102 36 L118 44Z" fill="#8a8f96" ${GS}/>
  <path d="M104 80 Q114 92 118 106 Q106 100 100 88Z" fill="#e2e0d6" ${GS}/>
  <path d="M124 46 l5 -2" stroke="#1c1c22" stroke-width="2"/><circle cx="143" cy="25" r="2.4" fill="#1c1c22"/>
  <path d="M152 22 q6 4 4 12 M158 16 q10 8 6 20" stroke="#f3d98a" fill="none" stroke-opacity=".8"/>`,
 bear:()=>tileFrame("#3a5a40","pines")+
  [62,80,112,128].map(x=>`<rect x="${x}" y="106" width="15" height="34" rx="6" fill="#6a4a30" ${GS}/><path d="M${x+2} 141 v3 M${x+7} 141 v3 M${x+12} 141 v3" stroke="#f4f2ea"/>`).join("")+
  `<path d="M50 110 Q48 76 84 72 Q104 66 118 76 Q140 80 146 96 L140 120 Q100 128 56 122Z" fill="#6a4a30" ${GS}/>
  <path d="M136 84 Q150 74 164 84 L178 92 Q180 100 170 102 L150 106 Q136 102 136 84Z" fill="#6a4a30" ${GS}/>
  <circle cx="148" cy="76" r="6" fill="#6a4a30" ${GS}/><circle cx="178" cy="96" r="3" fill="#1c1c22"/><circle cx="156" cy="86" r="2.2" fill="#1c1c22"/>
  <path d="M170 99 L122 98" stroke="#e0602a" stroke-width="2.2"/><path d="M124 92 L112 98 L124 104Z" fill="#3f9c9a" ${GS}/>
  <path d="M78 88 a5 5 0 1 1 5 5 a9 9 0 1 1 -9 -9" fill="none" stroke="#f3d98a" stroke-opacity=".7"/>`,
 fox:()=>tileFrame("#24345e","mesa")+
  `<path d="M60 100 Q18 86 22 120 Q30 136 64 112Z" fill="#e0782a" ${GS}/><path d="M22 112 Q20 126 30 130 Q30 120 34 112Z" fill="#f4f2ea"/>
  ${limb("M74 112 L72 144 M84 114 L84 146 M102 112 L104 144 M110 110 L114 142","#2a1d18",4)}
  <ellipse cx="90" cy="102" rx="32" ry="15" fill="#e0782a" ${GS}/><path d="M70 110 Q90 120 112 108" stroke="#f4f2ea" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M114 92 Q124 78 136 80 L170 92 L138 104 Q122 108 114 104Z" fill="#e0782a" ${GS}/>
  <path d="M136 98 L168 93 L140 106Z" fill="#f4f2ea"/>
  <path d="M132 82 L128 62 L142 78Z M141 82 L146 64 L152 84Z" fill="#e0782a" ${GS}/><path d="M133 78 L131 68 L138 77Z M144 80 L146 70 L149 81Z" fill="#2a1d18"/>
  <circle cx="148" cy="88" r="2.2" fill="#1c1c22"/><circle cx="170" cy="92" r="2.6" fill="#1c1c22"/>
  <g fill="#f3d98a">${[[78,96],[90,92],[102,96]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.7"/>`).join("")}</g>`,
 deer:()=>tileFrame("#1d5a5c","mesa")+
  limb("M68 106 L64 144 M78 108 L78 146 M102 108 L104 146 M110 104 L114 142","#b07a4a",4)+
  `<ellipse cx="88" cy="98" rx="34" ry="16" fill="#b07a4a" ${GS}/><path d="M66 106 Q88 116 110 104" stroke="#ecdcc0" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M54 90 Q48 84 52 80 Q58 84 58 92Z" fill="#f4f2ea" ${GS}/>
  <path d="M108 92 L124 60 L134 64 L120 100Z" fill="#b07a4a" ${GS}/>
  <path d="M130 48 Q124 30 116 22 M126 38 Q118 36 112 30 M137 48 Q142 30 152 22 M143 36 Q150 34 157 30" stroke="#f3d98a" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <ellipse cx="127" cy="52" rx="8" ry="3.5" transform="rotate(-30 127 52)" fill="#b07a4a" ${GS}/>
  <ellipse cx="140" cy="60" rx="13" ry="7" transform="rotate(22 140 60)" fill="#b07a4a" ${GS}/><circle cx="151" cy="66" r="2.2" fill="#1c1c22"/><circle cx="138" cy="57" r="2.2" fill="#1c1c22"/>
  <g fill="#f4f2ea">${[[70,92],[80,88],[92,88],[102,91],[76,98],[96,97]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2"/>`).join("")}</g>`,
 butterfly:()=>tileFrame("#24345e","flowers")+
  ["M98 78 Q60 26 32 48 Q26 80 96 88Z","M102 78 Q140 26 168 48 Q174 80 104 88Z","M98 90 Q56 96 60 124 Q80 136 98 98Z","M102 90 Q144 96 140 124 Q120 136 102 98Z"].map(d=>`<path d="${d}" fill="#e0782a"/><path d="${d}" fill="none" stroke="#1c1c22" stroke-width="5"/><path d="${d}" fill="none" ${GS}/>`).join("")+
  `<path d="M96 84 L48 52 M96 86 L40 74 M104 84 L152 52 M104 86 L160 74 M98 94 L66 118 M102 94 L134 118" stroke="#1c1c22" stroke-width="2"/>
  <g fill="#f4f2ea">${[[36,52],[44,44],[30,64],[164,52],[156,44],[170,64],[62,124],[138,124],[70,130],[130,130]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2"/>`).join("")}</g>
  <ellipse cx="100" cy="90" rx="4.5" ry="22" fill="#1c1c22" ${GS}/><circle cx="100" cy="66" r="5" fill="#1c1c22" ${GS}/>
  <path d="M98 62 Q90 44 82 42 M102 62 Q110 44 118 42" stroke="#f3d98a" stroke-width="1.6" fill="none"/><circle cx="81" cy="42" r="2.4" fill="#f3d98a"/><circle cx="119" cy="42" r="2.4" fill="#f3d98a"/>`,
 bee:()=>tileFrame("#1d6a6c","comb")+
  `<ellipse cx="90" cy="66" rx="22" ry="12" transform="rotate(-30 90 66)" fill="#e8f4f4" fill-opacity=".7" ${GS}/><ellipse cx="112" cy="64" rx="20" ry="11" transform="rotate(25 112 64)" fill="#e8f4f4" fill-opacity=".55" ${GS}/>
  <path d="M84 116 l-4 12 M100 118 l0 12 M116 116 l4 12" stroke="#1c1c22" stroke-width="2.5"/>
  <path d="M62 96 L48 98 L62 102Z" fill="#1c1c22" ${GS}/>
  <defs><clipPath id="bec"><ellipse cx="100" cy="98" rx="40" ry="24"/></clipPath></defs>
  <ellipse cx="100" cy="98" rx="40" ry="24" fill="#f2c92c" ${GS}/>
  <g clip-path="url(#bec)" fill="#1c1c22"><rect x="78" y="70" width="9" height="60"/><rect x="96" y="70" width="9" height="60"/><rect x="114" y="70" width="9" height="60"/></g>
  <circle cx="146" cy="94" r="14" fill="#1c1c22" ${GS}/><circle cx="151" cy="90" r="3" fill="#f3d98a"/>
  <path d="M146 80 Q148 64 158 60 M150 82 Q158 70 168 70" stroke="#1c1c22" stroke-width="2.4" fill="none"/>`,
 snake:()=>tileFrame("#a8492f","steps")+
  `${limb("M30 128 C70 150 90 100 112 104 C140 110 122 62 148 54","#3f8f4e",15)}
  <path d="M30 128 C70 150 90 100 112 104 C140 110 122 62 148 54" stroke="#f2c92c" stroke-width="6" stroke-dasharray="5 9" fill="none"/>
  <path d="M30 128 C70 150 90 100 112 104 C140 110 122 62 148 54" stroke="#1c1c22" stroke-width="2" stroke-dasharray="2 12" stroke-dashoffset="-6" fill="none"/>
  <path d="M170 46 L184 40 M176 43.5 L184 48" stroke="#d8243a" stroke-width="2" stroke-linecap="round"/>
  <ellipse cx="157" cy="50" rx="15" ry="9.5" transform="rotate(-15 157 50)" fill="#3f8f4e" ${GS}/><circle cx="161" cy="46" r="2.4" fill="#f2c92c" stroke="#1c1c22"/>`,
 turtle:()=>tileFrame("#1d5a5c","waves")+
  `<ellipse cx="140" cy="120" rx="13" ry="6" transform="rotate(30 140 120)" fill="#8a9a5a" ${GS}/><ellipse cx="58" cy="120" rx="12" ry="6" transform="rotate(-30 58 120)" fill="#8a9a5a" ${GS}/>
  <path d="M44 110 L34 114 L44 116Z" fill="#8a9a5a" ${GS}/>
  <ellipse cx="156" cy="106" rx="14" ry="9" fill="#8a9a5a" ${GS}/><circle cx="162" cy="103" r="2.2" fill="#1c1c22"/>
  <path d="M46 114 Q50 62 98 60 Q146 62 150 114Z" fill="#6a7a3a" ${GS}/>
  <path d="M84 72 L112 72 L120 90 L112 106 L84 106 L76 90Z" fill="#7a8a44" ${GS}/>
  <path d="M84 72 L72 64 M112 72 L124 64 M120 90 L146 94 M76 90 L50 94 M84 106 L80 114 M112 106 L116 114" stroke="#f3d98a" stroke-width="1.3"/>
  <rect x="44" y="110" width="108" height="8" rx="4" fill="#4a5a2a" ${GS}/>
  <g fill="#f3d98a">${[[98,89],[64,82],[132,82],[96,66]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.2"/>`).join("")}</g>`,
 lion:()=>tileFrame("#24345e","mesa")+
  limb("M64 112 L62 144 M78 114 L78 146 M102 114 L104 146 M114 112 L116 144","#d8a04a",8)+
  `<path d="M48 100 Q30 96 30 78" stroke="#d8a04a" stroke-width="3" fill="none"/><ellipse cx="30" cy="76" rx="4" ry="6" fill="#8a4a1a" ${GS}/>
  <ellipse cx="86" cy="104" rx="40" ry="18" fill="#d8a04a" ${GS}/>
  <polygon points="${Array.from({length:32},(_,i)=>{const a=i*Math.PI/16,r=i%2?22:32;return (138+Math.cos(a)*r).toFixed(1)+","+(72+Math.sin(a)*r).toFixed(1);}).join(" ")}" fill="#b8602a" ${GS}/>
  <circle cx="138" cy="72" r="19" fill="#d8a04a" ${GS}/>
  <ellipse cx="140" cy="82" rx="9" ry="6" fill="#f0d8a8"/><path d="M136 77 L144 77 L140 82Z" fill="#5a2a14"/>
  <circle cx="132" cy="68" r="2.4" fill="#1c1c22"/><circle cx="146" cy="68" r="2.4" fill="#1c1c22"/>
  <g fill="#f3d98a">${[[70,98],[84,94],[98,98]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.8"/>`).join("")}</g>`
};
const SIZE_LEN={tiny:5,small:40,medium:90,large:180,xlarge:600};
function cleanSVG(str,suffix){
  const m=String(str||"").match(/<svg[\s\S]*<\/svg>/i);if(!m)return null;
  const doc=new DOMParser().parseFromString(m[0],"image/svg+xml");
  if(doc.querySelector("parsererror"))return null;
  const svg=doc.documentElement;if(!svg||svg.nodeName.toLowerCase()!=="svg")return null;
  const ok=new Set(["svg","g","path","circle","ellipse","rect","line","polyline","polygon","defs","clippath","lineargradient","radialgradient","stop"]);
  const walk=el=>{[...el.children].forEach(c=>{if(!ok.has(c.nodeName.toLowerCase()))c.remove();else walk(c);});
    [...el.attributes].forEach(at=>{const n=at.name.toLowerCase();if(n.startsWith("on")||n.includes("href")||(n==="style"&&/url\(|expression|import/i.test(at.value)))el.removeAttribute(at.name);});};
  walk(svg);
  svg.setAttribute("viewBox","0 0 200 160");svg.removeAttribute("width");svg.removeAttribute("height");
  let out=new XMLSerializer().serializeToString(svg);
  const ids=[...out.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  ids.forEach(id=>{const safe=id.replace(/[^\w-]/g,"");out=out.split(`id="${id}"`).join(`id="${safe}_${suffix}"`).split(`#${id})`).join(`#${safe}_${suffix})`);});
  return out.length<40000?out:null;
}
function animalArt(a){
  if(ART[a.id])return `<svg viewBox="0 0 200 160" role="img" aria-label="Illustration: ${esc(a.name)}" xmlns="http://www.w3.org/2000/svg">${ART[a.id]()}</svg>`;
  if(a.svg)return a.svg;
  const inner=a.emoji?`<text x="100" y="98" text-anchor="middle" font-size="60">${esc(a.emoji)}</text>`:`<text x="100" y="102" text-anchor="middle" font-size="62" fill="#f3d98a" font-family="Macondo, Georgia, serif">${esc((a.name||"?").trim().charAt(0).toUpperCase())}</text>`;
  return `<svg viewBox="0 0 200 160" role="img" aria-label="${esc(a.name)}" xmlns="http://www.w3.org/2000/svg">${tileFrame("#24345e","steps")}${inner}${a.drawing?`<text x="100" y="134" text-anchor="middle" font-size="13" fill="#f3d98a" font-style="italic">drawing…</text>`:""}</svg>`;
}
async function drawAnimal(a){
  if(!sampleFn){toast("Add your Claude key in Settings to draw animals");return;}
  a.drawing=true;refreshBehind();
  const prompt=`Draw a ${a.name} as a small folk-art tile illustration in the style of New Mexico / Southwestern painted tiles. Match this set exactly:
- Canvas: viewBox="0 0 200 160". First a <rect width="200" height="160"> filled with ONE deep background color from: #1d6a6c, #a8492f, #24345e, #3a5a40, #1d5a5c.
- Frame: a gold (#f3d98a) rect border inset 5px (stroke-width 2, no fill) and a second thinner one inset 11px.
- The animal: side view, facing right, centered, filling about 65% of the frame. Flat bold shapes in a natural but warm palette (ochre #e8b24a, terracotta #e0782a, sage #8a9a5a, gray #8a8f96, cream #f4f2ea, brown #6a4a30, black #1c1c22). Every shape outlined in gold #f3d98a with stroke-width 1.3. Add a few small decorative gold dots, spirals or zigzags inside the body. Eyes as small dark circles.
- Optionally a simple low mesa, plant or wave motif near the bottom in a darker shade of the background.
- No text, no images, no filters, no gradients. Use only svg, g, path, circle, ellipse, rect, line, polyline, polygon.
Output ONLY the single <svg xmlns="http://www.w3.org/2000/svg" ...>...</svg> element, under 7000 characters, nothing before or after.`;
  try{
    const r=await sampleFn(prompt,{modelTier:"default"});
    const svg=cleanSVG(r.text,a.id.replace(/[^\w]/g,""));
    if(svg){a.svg=svg;toast(a.name+" drawn");}else toast("That drawing didn't come out — try Redraw");
  }catch(e){const c=e&&e.code;toast(c==="bad_key"?"Your Claude key wasn't accepted — check it in Settings":c==="offline"?"You're offline — try Redraw later":c==="rate_limited"?"Too many requests — try again in a minute":"Couldn't draw it right now");}
  delete a.drawing;persist();refreshBehind();
  if($("#dlg").open&&$("#dlgTitle")&&$("#dlgTitle").textContent===a.name)openDetail(a.id);
}

