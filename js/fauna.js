/* Kindred Creatures — parametric tile drawings for animals and insects without a hand-drawn ART entry.
   Same Southwestern painted-tile look as ART in art.js: tileFrame(bg, motif), flat shapes, gold outlines,
   dot/spiral/zigzag details, animal facing right. Plain script; shares globals. */
const AS='stroke="#f3d98a" stroke-width="1.3" stroke-linejoin="round"';
let faunaN=0;
const eyeDot=(x,y,r=2.6)=>`<circle cx="${x}" cy="${y}" r="${r+1}" fill="#f4ecd2"/><circle cx="${x}" cy="${y}" r="${r}" fill="#1c1c22"/><circle cx="${x+r*.35}" cy="${y-r*.35}" r="${r*.35}" fill="#fff"/>`;
const gdots=(pts,r=1.5,c="#f3d98a",o=.85)=>pts.map(([x,y])=>`<circle cx="${x.toFixed?x.toFixed(1):x}" cy="${y.toFixed?y.toFixed(1):y}" r="${r}" fill="${c}" opacity="${o}"/>`).join("");
const gspiral=(x,y,s=1)=>`<path d="M${x} ${y} m-${3*s} 0 a${3*s} ${3*s} 0 1 1 ${3*s} ${3*s} a${5*s} ${5*s} 0 1 1 -${5*s} -${5*s}" fill="none" stroke="#f3d98a" stroke-opacity=".75" stroke-width="1"/>`;
const leg=(d,c,w)=>`<path d="${d}" stroke="#f3d98a" stroke-width="${w+2.6}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;

/* ---------------- Mammals and other animals ---------------- */
function critterSVG(a){
  const t=a.art, C=t.c, Bl=t.b||t.c, H=t.h||t.c;
  let o=[];
  if(t.f==="quad"){
    const s=t.small?.72:t.big?1.08:1, by=t.tall?84:92, bx=92;
    const rx=40*s, ry=(t.tall?18:20)*s, legL=({short:14,med:22,long:30})[t.legs||"med"]*(t.tall?1.2:1);
    const hx=bx+rx*.95+8*s, hy=by-ry*.7-(t.tall?14:4)*s, hr=13*s;
    if(t.sit){ // koala on a branch
      o.push(`<path d="M30 116 Q100 100 176 112" stroke="#6a4a30" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M30 116 Q100 100 176 112" stroke="#f3d98a" stroke-width="1" fill="none" stroke-dasharray="3 4"/>`);
      o.push(`<ellipse cx="96" cy="84" rx="26" ry="30" fill="${C}" ${AS}/><ellipse cx="102" cy="92" rx="14" ry="18" fill="${Bl}"/>`);
      o.push(leg("M80 98 Q74 108 78 112","#6a6e74",7),leg("M114 96 Q122 106 118 112","#6a6e74",7));
      o.push(`<circle cx="74" cy="48" r="12" fill="${C}" ${AS}/><circle cx="74" cy="48" r="6" fill="${Bl}"/><circle cx="122" cy="48" r="12" fill="${C}" ${AS}/><circle cx="122" cy="48" r="6" fill="${Bl}"/>`);
      o.push(`<circle cx="98" cy="58" r="22" fill="${C}" ${AS}/><ellipse cx="98" cy="64" rx="7" ry="9" fill="${t.nose||"#2a2a2a"}" ${AS}/>`,eyeDot(88,54),eyeDot(108,54),gdots([[84,80],[96,86],[108,80]]));
      return tileFrame(t.bg,t.motif)+o.join("");
    }
    // tail (behind)
    const tx=bx-rx*.9, ty=by-ry*.3;
    const tail={
      bushy:`<path d="M${tx} ${ty} Q${tx-34*s} ${ty-10*s} ${tx-30*s} ${ty-38*s} Q${tx-10*s} ${ty-26*s} ${tx+4} ${ty+4}Z" fill="${t.t1||C}" ${AS}/><path d="M${tx-26*s} ${ty-32*s} q4 4 2 8" stroke="${t.t2||Bl}" stroke-width="5" stroke-linecap="round"/>`,
      ring:`<path d="M${tx} ${ty} Q${tx-30} ${ty+4} ${tx-38} ${ty+22}" stroke="#f3d98a" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M${tx} ${ty} Q${tx-30} ${ty+4} ${tx-38} ${ty+22}" stroke="${C}" stroke-width="12.4" fill="none" stroke-linecap="round"/><path d="M${tx} ${ty} Q${tx-30} ${ty+4} ${tx-38} ${ty+22}" stroke="${t.t2}" stroke-width="12.4" fill="none" stroke-dasharray="6 6"/>`,
      thin:`<path d="M${tx} ${ty} Q${tx-30} ${ty+10} ${tx-34} ${ty+34}" stroke="${t.t1||C}" stroke-width="${t.tip?6:4}" fill="none" stroke-linecap="round"/>${t.tip?`<circle cx="${tx-34}" cy="${ty+34}" r="4" fill="${t.tip}"/>`:""}`,
      tuft:`<path d="M${tx} ${ty} Q${tx-14} ${ty+12} ${tx-16} ${ty+32}" stroke="${C}" stroke-width="3" fill="none"/><path d="M${tx-20} ${ty+30} q4 10 8 0Z" fill="${t.t1||"#3a2614"}" ${AS}/>`,
      skunk:`<path d="M${tx} ${ty} Q${tx-30} ${ty-4} ${tx-26} ${ty-44} Q${tx-4} ${ty-34} ${tx+6} ${ty+2}Z" fill="${C}" ${AS}/><path d="M${tx-2} ${ty-4} Q${tx-22} ${ty-10} ${tx-20} ${ty-38}" stroke="${t.t2}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      flat:`<ellipse cx="${tx-14}" cy="${ty+16}" rx="18" ry="7" transform="rotate(-24 ${tx-14} ${ty+16})" fill="${t.t1}" ${AS}/><path d="M${tx-26} ${ty+20} l20 -10 M${tx-22} ${ty+24} l20 -10" stroke="#f3d98a" stroke-opacity=".5"/>`,
      horse:`<path d="M${tx+2} ${ty-4} Q${tx-22} ${ty} ${tx-18} ${ty+34} Q${tx-8} ${ty+16} ${tx+6} ${ty+4}Z" fill="${t.t1}" ${AS}/>`,
      short:`<ellipse cx="${tx-4}" cy="${ty}" rx="6" ry="4" fill="${C}" ${AS}/>`,none:""}[t.tail||"short"];
    o.push(tail);
    // far legs
    const lx=[bx-rx*.55,bx+rx*.55], ly=by+ry*.6;
    lx.forEach(x=>o.push(leg(`M${x+6} ${ly} L${x+8} ${ly+legL}`,shade(C,-.25),7*s)));
    // body
    o.push(`<defs><clipPath id="cb${++faunaN}"><ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}"/></clipPath></defs>`);
    o.push(`<ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" fill="${C}" ${AS}/>`);
    o.push(`<g clip-path="url(#cb${faunaN})"><ellipse cx="${bx+6}" cy="${by+ry*.75}" rx="${rx*.85}" ry="${ry*.55}" fill="${Bl}"/>`);
    if(t.stripe) o.push(`<path d="M${bx-rx} ${by-ry*.55} Q${bx} ${by-ry*1.25} ${bx+rx} ${by-ry*.55}" stroke="${t.stripe}" stroke-width="${6*s}" fill="none"/>`);
    if(t.bands) for(let i=0;i<7;i++){const x=bx-rx*.75+i*rx*.24;o.push(`<path d="M${x} ${by-ry} q4 ${ry*.6} -2 ${ry*1.2}" stroke="${t.bands}" stroke-width="3.6" fill="none"/>`);}
    if(t.spots) o.push(gdots([[bx-14,by-6],[bx+6,by-10],[bx+20,by],[bx-4,by+4]],3,t.spots,1));
    o.push(`</g>`);
    if(t.hump) o.push(`<path d="M${bx+rx*.1} ${by-ry*.8} Q${bx+rx*.6} ${by-ry*2} ${bx+rx*1.05} ${by-ry*.4}Z" fill="${t.mane||C}" ${AS}/>`);
    o.push(gspiral(bx-rx*.2,by-2*s,s),gdots([[bx-rx*.5,by-ry*.4],[bx+rx*.1,by-ry*.55],[bx+rx*.45,by-ry*.25]]));
    // near legs
    lx.forEach(x=>o.push(leg(`M${x} ${ly} L${x-1} ${ly+legL}`,C,7.5*s)));
    // neck + head
    if(t.tall) o.push(`<path d="M${bx+rx*.6} ${by-ry*.3} L${hx-4} ${hy+6} L${hx+6} ${hy+12} L${bx+rx*.95} ${by+ry*.1}Z" fill="${H}" ${AS}/>`);
    if(t.mane&&!t.hump) o.push(`<path d="M${bx+rx*.55} ${by-ry*.6} Q${hx-12} ${hy-10} ${hx-2} ${hy-6} L${hx-8} ${hy+6}Z" fill="${t.mane}" ${AS}/>`);
    if(t.mane&&t.hump) o.push(`<circle cx="${hx-4}" cy="${hy+2}" r="${hr*1.15}" fill="${t.mane}" ${AS}/>`);
    // ears (behind head)
    const er=hr*.55;
    const ears={point:`<path d="M${hx-hr*.6} ${hy-hr*.5} L${hx-hr*.4} ${hy-hr*1.7} L${hx+hr*.1} ${hy-hr*.8}Z M${hx} ${hy-hr*.7} L${hx+hr*.3} ${hy-hr*1.75} L${hx+hr*.6} ${hy-hr*.55}Z" fill="${H}" ${AS}/>`,
      round:`<circle cx="${hx-hr*.5}" cy="${hy-hr*.85}" r="${er}" fill="${t.earC||H}" ${AS}/><circle cx="${hx+hr*.3}" cy="${hy-hr*.9}" r="${er}" fill="${t.earC||H}" ${AS}/>`,
      tiny:`<circle cx="${hx-hr*.3}" cy="${hy-hr*.85}" r="${er*.55}" fill="${H}" ${AS}/>`,fluffy:"",none:""}[t.ear||"round"];
    o.push(ears);
    if(t.horn) o.push(`<path d="M${hx-hr*.5} ${hy-hr*.4} q-2 -12 8 -14" stroke="#e8e0c8" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M${hx+hr*.3} ${hy-hr*.5} q4 -10 12 -8" stroke="#e8e0c8" stroke-width="3.4" fill="none" stroke-linecap="round"/>`);
    o.push(`<circle cx="${hx}" cy="${hy}" r="${hr}" fill="${H}" ${AS}/>`);
    const sn={long:[hr*1.25,hr*.42],med:[hr*.9,hr*.42],short:[hr*.6,hr*.45],blunt:[hr*.55,hr*.55]}[t.snout||"med"];
    o.push(`<ellipse cx="${hx+hr*.55+sn[0]*.4}" cy="${hy+hr*.25}" rx="${sn[0]}" ry="${sn[1]}" fill="${t.h?H:Bl}" ${AS}/>`);
    o.push(`<circle cx="${hx+hr*.55+sn[0]*1.3}" cy="${hy+hr*.15}" r="${2.4*s}" fill="#1c1c22"/>`);
    if(t.mask) o.push(`<path d="M${hx-hr*.7} ${hy-hr*.15} Q${hx+hr*.1} ${hy-hr*.55} ${hx+hr*.85} ${hy-hr*.1} L${hx+hr*.7} ${hy+hr*.2} Q${hx} ${hy} ${hx-hr*.6} ${hy+hr*.25}Z" fill="${t.mask}"/>`);
    if(t.stripe) o.push(`<path d="M${hx-hr*.2} ${hy-hr} L${hx+hr*.5} ${hy+hr*.1}" stroke="${t.stripe}" stroke-width="${3*s}"/>`);
    if(t.bands) o.push(`<path d="M${hx-hr*.6} ${hy-hr*.5} l5 4 M${hx-hr*.7} ${hy+hr*.1} l6 2" stroke="${t.bands}" stroke-width="2"/>`);
    if(t.teeth) o.push(`<rect x="${hx+hr*.55+sn[0]*.9}" y="${hy+hr*.5}" width="${3*s}" height="${5*s}" fill="#f2e8b0"/>`);
    o.push(eyeDot(hx+hr*.25,hy-hr*.25,2.4*s));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="seal"){
    o.push(`<path d="M30 132 Q40 112 80 116 Q120 118 150 120 Q176 124 182 140 L182 148 H18 V140Z" fill="#6a6e74" opacity=".6"/>`);
    o.push(`<path d="M44 118 Q40 100 70 96 Q110 88 132 72 Q150 60 160 74 Q166 88 150 100 Q132 116 100 120 Q70 124 44 118Z" fill="${C}" ${AS}/>`);
    o.push(`<path d="M44 118 Q30 120 26 110 Q36 108 46 110" fill="${C}" ${AS}/>`,`<path d="M110 112 q10 8 22 6 q-6 -10 -18 -12" fill="${shade(C,-.2)}" ${AS}/>`);
    o.push(`<path d="M70 116 Q100 112 140 92" stroke="${Bl}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>`);
    if(t.spots) o.push(gdots([[70,104],[86,100],[98,106],[112,96],[126,90],[80,110]],2.4,t.spots,1));
    if(t.ears) o.push(`<path d="M146 64 l-3 -6" stroke="${C}" stroke-width="3"/>`);
    if(t.nose) o.push(`<path d="M160 78 Q172 84 168 96 Q162 92 158 86Z" fill="${shade(C,-.15)}" ${AS}/>`);
    o.push(eyeDot(152,72,2.6),`<path d="M160 82 l8 -1 M160 85 l8 2" stroke="#f3d98a" stroke-width=".8"/>`,gspiral(84,108));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="cetacean"){
    const k=t.kind;
    const len=k==="porpoise"?.75:k==="dolphin"?.85:k==="manatee"?.85:1;
    o.push(`<g transform="translate(100 92) scale(${len}) translate(-100 -92)">`);
    if(k==="manatee"){o.push(`<path d="M30 92 Q34 70 70 68 Q120 64 150 78 Q170 88 166 100 Q150 112 110 112 Q60 114 40 104Z" fill="${C}" ${AS}/><path d="M40 98 Q16 84 14 108 Q22 116 42 104Z" fill="${C}" ${AS}/><path d="M120 106 q4 12 14 10" fill="${shade(C,-.2)}" ${AS}/>`,eyeDot(150,84,2),`<path d="M162 92 q4 4 0 8" stroke="#3a3a3a" fill="none"/>`);}
    else{
      o.push(`<path d="M28 88 Q40 70 80 70 Q130 66 164 82 Q178 90 172 98 Q150 106 110 108 Q62 110 40 96Z" fill="${C}" ${AS}/>`);
      o.push(`<path d="M34 92 Q14 72 10 82 Q16 92 30 94 Q16 98 12 108 Q20 112 36 96Z" fill="${C}" ${AS}/>`);
      if(k!=="gray") o.push(`<path d="M96 70 Q100 52 110 48 Q108 60 112 69Z" fill="${C}" ${AS}/>`);
      if(k==="orca") o.push(`<path d="M96 70 Q100 40 108 30 Q108 52 114 69Z" fill="${C}" ${AS}/><ellipse cx="150" cy="82" rx="9" ry="4" fill="${Bl}"/><path d="M70 104 Q110 92 150 100 Q120 110 70 104Z" fill="${Bl}"/><ellipse cx="88" cy="74" rx="10" ry="3" fill="#8a8f96"/>`);
      else o.push(`<path d="M60 102 Q110 96 166 94 Q140 108 60 102Z" fill="${Bl}" opacity=".85"/>`);
      if(k==="dolphin") o.push(`<path d="M168 88 L186 92 L170 98Z" fill="${C}" ${AS}/>`);
      if(t.spots) o.push(gdots([[60,84],[80,80],[100,84],[120,80],[140,86],[76,92],[112,90]],2.4,t.spots,.9));
      o.push(`<path d="M120 96 q8 12 18 12 q-4 -12 -14 -14" fill="${shade(C,-.2)}" ${AS}/>`,eyeDot(k==="orca"?146:150,88,2));
      if(k==="gray") o.push(`<path d="M150 74 q4 -6 8 0" stroke="#f4f2ea" fill="none"/>`);
    }
    o.push(gspiral(84,90),gdots([[60,80],[130,78]]),`</g>`);
    if(k==="gray"||k==="whale") o.push(`<path d="M160 50 q-4 -10 0 -16 M160 50 q4 -10 10 -12" stroke="#f3d98a" stroke-width="1.4" fill="none"/>`);
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="otter"){
    o.push(`<path d="M30 100 Q60 70 110 74 Q150 76 164 92 Q150 104 110 104 Q60 108 30 100Z" fill="${C}" ${AS}/>`,`<path d="M50 96 Q100 82 150 92" stroke="${Bl}" stroke-width="10" fill="none" stroke-linecap="round"/>`);
    o.push(`<path d="M30 100 Q10 96 8 84 Q20 88 34 94" fill="${C}" ${AS}/>`,`<circle cx="160" cy="78" r="15" fill="${C}" ${AS}/><ellipse cx="170" cy="84" rx="8" ry="6" fill="${Bl}" ${AS}/><circle cx="176" cy="82" r="2.4" fill="#1c1c22"/>`,eyeDot(160,74,2.2),`<circle cx="150" cy="66" r="3.4" fill="${C}" ${AS}/>`);
    o.push(leg("M120 78 Q124 62 132 60",C,6),leg("M136 80 Q142 66 150 66",C,6));
    if(t.shell) o.push(`<ellipse cx="140" cy="64" rx="7" ry="5" fill="#d8c8b0" ${AS}/>`);
    o.push(`<path d="M168 88 l8 -1 M168 91 l8 2" stroke="#f3d98a" stroke-width=".8"/>`,gspiral(90,92),gdots([[70,86],[110,82]]));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="frog"){
    o.push(`<ellipse cx="74" cy="132" rx="34" ry="8" fill="#3f9c5a" opacity=".5"/>`,leg("M72 116 Q50 124 60 136 L76 136",C,9),`<path d="M60 100 Q70 72 110 70 Q140 70 146 92 Q148 116 120 122 Q84 126 66 116Z" fill="${C}" ${AS}/>`);
    o.push(`<path d="M76 116 Q104 120 136 110" stroke="${Bl}" stroke-width="7" fill="none" stroke-linecap="round"/>`,leg("M126 112 L132 134 L142 134",C,6));
    if(t.spots) o.push(gdots([[84,92],[100,84],[112,96],[92,104],[124,88]],3.4,t.spots,1));
    o.push(`<circle cx="134" cy="74" r="9" fill="${C}" ${AS}/>`,eyeDot(135,73,4),`<path d="M138 98 q6 4 10 -2" stroke="#1c1c22" fill="none"/>`,gspiral(96,100));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="snake"){
    const d="M24 120 C44 90 70 130 92 104 C112 80 132 118 152 92 C162 80 172 76 178 72";
    o.push(`<path d="${d}" stroke="#f3d98a" stroke-width="18" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${C}" stroke-width="15.4" fill="none" stroke-linecap="round"/>`);
    o.push(`<path d="${d}" stroke="${t.s1}" stroke-width="5" fill="none" stroke-dasharray="8 6"/><path d="${d}" stroke="${t.s2}" stroke-width="2.4" fill="none" transform="translate(0 -4)"/>`);
    o.push(`<ellipse cx="180" cy="70" rx="10" ry="7" fill="${C}" ${AS}/>`,eyeDot(182,67,1.8),`<path d="M190 72 l6 -1 l-3 3 l4 1" stroke="#d8322f" fill="none"/>`);
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="crab"){
    for(let k=0;k<4;k++){o.push(leg(`M${84-k*6} ${98+k*4} L${60-k*8} ${92+k*10} L${52-k*6} ${116+k*8}`,C,4),leg(`M${116+k*6} ${98+k*4} L${140+k*8} ${92+k*10} L${148+k*6} ${116+k*8}`,C,4));}
    o.push(leg("M80 86 L60 66","#c8603a",6),leg("M120 86 L140 66","#c8603a",6));
    o.push(`<path d="M50 66 q6 -18 20 -10 l-8 6 l10 4 q-8 12 -22 0Z" fill="${C}" ${AS}/><path d="M150 66 q-6 -18 -20 -10 l8 6 l-10 4 q8 12 22 0Z" fill="${C}" ${AS}/>`);
    o.push(`<path d="M60 96 Q60 70 100 70 Q140 70 140 96 Q130 112 100 112 Q70 112 60 96Z" fill="${C}" ${AS}/><path d="M70 92 Q100 82 130 92" stroke="${Bl}" stroke-width="4" fill="none"/>`,gdots([[86,84],[100,80],[114,84],[100,96]]),eyeDot(92,70,2),eyeDot(108,70,2));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="octopus"){
    for(let k=0;k<8;k++){const x=50+k*14, curl=k%2?-1:1;const d=`M${100+(x-100)*.3} 86 Q${x} 110 ${x+curl*6} 128 q${curl*8} 6 ${curl*4} -6`;o.push(`<path d="${d}" stroke="#f3d98a" stroke-width="11" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${k%2?C:shade(C,-.12)}" stroke-width="8.4" fill="none" stroke-linecap="round"/>`);o.push(gdots([[x-1,112],[x+curl*3,122]],1.4,"#f4e0c8",.9));}
    o.push(`<path d="M68 82 Q62 34 100 30 Q140 34 132 82 Q100 96 68 82Z" fill="${C}" ${AS}/>`,eyeDot(86,74,3),eyeDot(114,74,3),gspiral(100,52,1.2),gdots([[84,48],[116,48],[100,40]]));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="bat"){
    o.push(`<path d="M100 76 L60 58 Q36 60 22 82 Q38 80 46 90 Q58 82 66 94 Q80 86 92 98Z" fill="${C}" ${AS}/><path d="M100 76 L140 58 Q164 60 178 82 Q162 80 154 90 Q142 82 134 94 Q120 86 108 98Z" fill="${C}" ${AS}/>`);
    o.push(`<path d="M60 58 L46 90 M60 58 L66 94 M140 58 L154 90 M140 58 L134 94" stroke="#f3d98a" stroke-opacity=".6"/>`);
    o.push(`<ellipse cx="100" cy="90" rx="12" ry="16" fill="${Bl}" ${AS}/><circle cx="100" cy="70" r="11" fill="${C}" ${AS}/><path d="M92 62 L90 50 L97 60Z M108 62 L110 50 L103 60Z" fill="${C}" ${AS}/>`,eyeDot(96,68,1.8),eyeDot(104,68,1.8),gdots([[100,86],[96,94],[104,94]]));
    o.push(`<circle cx="44" cy="40" r="8" fill="#f3d98a" opacity=".85"/>`);
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="turtle"){
    o.push(`<path d="M80 100 Q56 120 40 118 Q50 104 76 92Z" fill="${t.skin}" ${AS}/><path d="M120 100 Q148 122 164 124 Q156 108 126 94Z" fill="${t.skin}" ${AS}/><path d="M78 104 Q60 92 48 76 Q66 80 86 96Z" fill="${t.skin}" ${AS}/>`);
    o.push(`<path d="M60 96 Q66 64 104 62 Q142 64 148 96 Q104 108 60 96Z" fill="${t.shell}" ${AS}/>`);
    for(let k=0;k<5;k++)o.push(`<path d="M${68+k*16} 94 Q${72+k*16} 74 ${80+k*16} 66" stroke="#f3d98a" stroke-opacity=".6" fill="none"/>`);
    if(t.spots) o.push(gdots([[80,80],[96,74],[112,76],[126,84],[90,88],[118,90]],1.8,t.spots,.9));
    o.push(`<ellipse cx="160" cy="88" rx="12" ry="9" fill="${t.skin}" ${AS}/>`,eyeDot(164,85,2));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="ape"){
    o.push(leg("M86 112 Q78 128 84 138",C,10),leg("M118 112 Q126 128 120 138",C,10),`<ellipse cx="102" cy="98" rx="28" ry="26" fill="${C}" ${AS}/>`,leg("M80 88 Q62 108 70 130",C,9),leg("M124 88 Q142 108 134 128",C,9));
    o.push(`<circle cx="74" cy="58" r="8" fill="${Bl}" ${AS}/><circle cx="130" cy="58" r="8" fill="${Bl}" ${AS}/><circle cx="102" cy="58" r="24" fill="${C}" ${AS}/><path d="M86 56 Q102 44 118 56 Q120 76 102 78 Q84 76 86 56Z" fill="${Bl}" ${AS}/>`,eyeDot(95,58,2.4),eyeDot(109,58,2.4),`<path d="M96 70 q6 4 12 0" stroke="#3a2a20" fill="none"/>`,gspiral(102,100),gdots([[90,92],[114,92]]));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  return tileFrame(t.bg||"#24345e",t.motif||"steps");
}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(amt<0?v*(1+amt):v+(255-v)*amt)));return "#"+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,"0")).join("");}

/* ---------------- Insects ---------------- */
function insectSVG(a){
  const t=a.art;let o=[];
  const ant=(x,y,len)=>`<path d="M${x-3} ${y} q-8 -${len} -14 -${len+4} M${x+3} ${y} q8 -${len} 14 -${len+4}" stroke="#1c1c22" stroke-width="1.6" fill="none"/>`;
  const wing=(d,c)=>`<path d="${d}" fill="${c}" ${AS}/>`;
  if(t.f==="butterfly"||t.f==="moth"){
    if(t.closed){ // side view, wings folded
      o.push(wing("M100 96 Q72 52 104 40 Q128 52 112 96Z",t.w1),wing("M100 96 Q86 108 92 122 Q110 120 112 96Z",t.w2),`<path d="M106 96 L112 60" stroke="#1c1c22" stroke-width="4" stroke-linecap="round"/>`,ant(112,58,10),gdots([[100,60],[96,74],[104,84]],1.6,t.spots||"#f4f2ea",1));
      return tileFrame(t.bg,t.motif)+o.join("");}
    const wl=t.long?1.18:1, fw=`M100 80 Q${100-58*wl} ${38} ${100-62*wl} 60 Q${100-60*wl} 88 100 88Z`, hw=`M100 88 Q${100-46*wl} 92 ${100-44*wl} 118 Q${100-20*wl} 132 100 100Z`;
    const mir=d=>d.replace(/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g,(m,x,_,y)=>`${(200-parseFloat(x)).toFixed(1)} ${y}`);
    [fw,hw].forEach((d,i)=>{o.push(wing(d,i?t.w2:t.w1),wing(mir(d),i?t.w2:t.w1));});
    if(t.tails) o.push(`<path d="M${100-38*wl} 118 q-4 12 -10 18" stroke="${t.w2}" stroke-width="5" stroke-linecap="round"/><path d="M${100+38*wl} 118 q4 12 10 18" stroke="${t.w2}" stroke-width="5" stroke-linecap="round"/>`);
    o.push(`<path d="${fw}" fill="none" stroke="${t.edge}" stroke-width="4"/><path d="${mir(fw)}" fill="none" stroke="${t.edge}" stroke-width="4"/><path d="${hw}" fill="none" stroke="${t.edge}" stroke-width="3"/><path d="${mir(hw)}" fill="none" stroke="${t.edge}" stroke-width="3"/>`);
    if(t.stripes) for(let k=0;k<4;k++)o.push(`<path d="M${96-k*12} 82 L${86-k*12} 52" stroke="${t.stripes}" stroke-width="3"/><path d="M${104+k*12} 82 L${114+k*12} 52" stroke="${t.stripes}" stroke-width="3"/>`);
    if(t.spots) o.push(gdots([[60,58],[50,66],[70,50],[140,58],[150,66],[130,50],[72,108],[128,108]],2.2,t.spots,1));
    if(t.eyes) o.push(`<circle cx="70" cy="70" r="6" fill="${t.eyes}" ${AS}/><circle cx="130" cy="70" r="6" fill="${t.eyes}" ${AS}/><circle cx="70" cy="70" r="2.4" fill="#1c1c22"/><circle cx="130" cy="70" r="2.4" fill="#1c1c22"/>`);
    if(t.snake) o.push(`<circle cx="${100-60*wl}" cy="56" r="3" fill="#1c1c22"/><circle cx="${100+60*wl}" cy="56" r="3" fill="#1c1c22"/>`);
    o.push(`<ellipse cx="100" cy="88" rx="5" ry="24" fill="${t.body||"#2a2420"}" ${AS}/><circle cx="100" cy="62" r="5" fill="${t.body||"#2a2420"}" ${AS}/>`);
    if(t.f==="moth") o.push(`<path d="M97 58 q-10 -14 -20 -14 q8 6 18 14 M103 58 q10 -14 20 -14 q-8 6 -18 14" stroke="#e8c88a" stroke-width="2" fill="#e8c88a"/>`);
    else o.push(ant(100,58,14),`<circle cx="83" cy="40" r="2.4" fill="#1c1c22"/><circle cx="117" cy="40" r="2.4" fill="#1c1c22"/>`);
    o.push(gspiral(66,66,.8),gspiral(134,66,.8));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="bee"){
    o.push(wing("M96 72 Q80 36 104 36 Q118 44 108 72Z","#e8f0f4"),wing("M104 74 Q116 44 136 52 Q138 66 112 76Z","#d8e4ec"));
    o.push(`<ellipse cx="96" cy="94" rx="34" ry="22" fill="${t.c2}" ${AS}/>`);
    const bands=t.band==="none"?[]:[[78,0],[96,1],[114,2]];
    bands.forEach(([x,i])=>o.push(`<path d="M${x} 74 Q${x-6} 94 ${x} 114" stroke="${t.c1}" stroke-width="${i===2?10:7}" fill="none"/>`));
    if(t.band==="none") o.push(`<ellipse cx="96" cy="94" rx="34" ry="22" fill="${t.c1}" ${AS}/><path d="M76 86 Q96 80 116 86" stroke="#4a5aa8" stroke-width="3" fill="none" opacity=".7"/>`);
    if(t.band==="white") o.push(`<path d="M64 84 Q62 94 64 104" stroke="#f4f2ea" stroke-width="6" fill="none"/>`);
    if(t.band==="rust") o.push(`<ellipse cx="104" cy="88" rx="6" ry="8" fill="#c8602a"/>`);
    o.push(`<circle cx="138" cy="88" r="14" fill="${t.band==="face"?t.c2:t.c1}" ${AS}/>`,eyeDot(144,84,2.4),ant(140,76,10));
    for(let k=0;k<3;k++)o.push(`<path d="M${88+k*14} 114 l-4 14" stroke="#1c1c22" stroke-width="2.4"/>`);
    o.push(`<path d="M62 96 l-8 2" stroke="#1c1c22" stroke-width="3"/>`,gdots([[86,96],[104,100],[120,94]],1.2));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="beetle"){
    for(let k=0;k<3;k++){o.push(`<path d="M${84} ${78+k*16} l-22 ${-6+k*8}" stroke="#1c1c22" stroke-width="2.4"/><path d="M${116} ${78+k*16} l22 ${-6+k*8}" stroke="#1c1c22" stroke-width="2.4"/>`);}
    if(t.horn) o.push(`<path d="M100 54 Q104 20 120 18" stroke="#1c1c22" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M100 60 Q96 34 82 30" stroke="#1c1c22" stroke-width="4" fill="none" stroke-linecap="round"/>`);
    if(t.scarab) o.push(`<path d="M86 52 l-4 -8 M94 50 l-2 -8 M106 50 l2 -8 M114 52 l4 -8" stroke="#3a3a30" stroke-width="2"/>`);
    o.push(`<ellipse cx="100" cy="62" rx="14" ry="10" fill="${t.scarab||t.horn?t.c:"#1c1c22"}" ${AS}/>`);
    o.push(`<path d="M100 70 C64 70 66 130 100 134 C134 130 136 70 100 70Z" fill="${t.c}" ${AS}/><path d="M100 70 L100 134" stroke="#1c1c22" stroke-width="2"/>`);
    if(t.n){const pts=[[88,86],[112,86],[82,104],[118,104],[90,120],[110,120],[100,80],[78,92],[122,92],[94,96],[106,96],[100,110]].slice(0,t.n);o.push(gdots(pts,4,t.spots,1));}
    if(t.glow) o.push(`<ellipse cx="100" cy="126" rx="14" ry="9" fill="#f2f06a" opacity=".9"/><circle cx="100" cy="126" r="22" fill="#f2f06a" opacity=".25"/><path d="M84 74 Q100 64 116 74" stroke="#e0402a" stroke-width="5" fill="none"/>`);
    if(t.horn) o.push(gdots([[88,96],[112,96],[92,112],[108,112]],1.8,"#2a2a2a",.8));
    o.push(ant(100,56,10),gspiral(100,100,.8));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="dragonfly"){
    o.push(wing("M100 70 Q60 52 30 60 Q56 76 100 76Z",t.w),wing("M100 78 Q62 86 36 102 Q66 98 100 82Z",t.w),wing("M100 70 Q140 52 170 60 Q144 76 100 76Z",t.w),wing("M100 78 Q138 86 164 102 Q134 98 100 82Z",t.w));
    o.push(`<path d="M100 78 L100 140" stroke="#f3d98a" stroke-width="8.6" stroke-linecap="round"/><path d="M100 78 L100 140" stroke="${t.tail||t.c}" stroke-width="6" stroke-linecap="round" stroke-dasharray="7 2"/>`,`<ellipse cx="100" cy="72" rx="7" ry="10" fill="${t.c}" ${AS}/><circle cx="94" cy="58" r="6" fill="${t.c}" ${AS}/><circle cx="106" cy="58" r="6" fill="${t.c}" ${AS}/>`,gdots([[60,62],[140,62],[60,92],[140,92]],1.6));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="ant"){
    for(let k=0;k<3;k++)o.push(`<path d="M100 86 l${-26+k*6} ${-8+k*12}" stroke="${t.c}" stroke-width="2.6"/><path d="M100 86 l${26-k*6} ${-8+k*12}" stroke="${t.c}" stroke-width="2.6"/>`);
    o.push(`<ellipse cx="100" cy="116" rx="16" ry="20" fill="${t.c}" ${AS}/><ellipse cx="100" cy="86" rx="8" ry="10" fill="${t.c}" ${AS}/><circle cx="100" cy="62" r="11" fill="${t.c}" ${AS}/>`,ant(100,54,12),eyeDot(94,60,1.6),eyeDot(106,60,1.6),gdots([[100,112],[94,120],[106,120]]));
    o.push(`<g opacity=".7">${[[40,130],[56,138],[150,128],[164,136]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="${t.c}"/>`).join("")}</g>`);
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="mantis"){
    o.push(`<path d="M50 120 Q90 112 120 88" stroke="#f3d98a" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M50 120 Q90 112 120 88" stroke="${t.c}" stroke-width="9.4" fill="none" stroke-linecap="round"/>`);
    o.push(`<path d="M120 88 L134 52" stroke="#f3d98a" stroke-width="8" stroke-linecap="round"/><path d="M120 88 L134 52" stroke="${t.c}" stroke-width="5.4" stroke-linecap="round"/>`,`<path d="M134 52 L150 46 L140 40Z" fill="${t.c}" ${AS}/>`,eyeDot(144,44,2));
    o.push(leg("M130 66 L152 74 L146 58",t.c,4),leg("M126 72 L146 86 L142 68",t.c,4),leg("M90 112 L80 138",t.c,3),leg("M70 116 L56 138",t.c,3),leg("M104 104 L110 136",t.c,3));
    o.push(`<path d="M60 116 Q86 96 114 92" stroke="#c8e8a8" stroke-width="5" fill="none" opacity=".7"/>`,ant(146,40,12));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="cicada"){
    o.push(wing("M100 66 Q56 80 60 132 Q86 120 100 76Z","#e8f0f4"),wing("M100 66 Q144 80 140 132 Q114 120 100 76Z","#e8f0f4"),`<path d="M66 120 L98 74 M134 120 L102 74" stroke="${t.w}" stroke-width="1.6"/>`);
    o.push(`<ellipse cx="100" cy="92" rx="14" ry="26" fill="${t.c}" ${AS}/><ellipse cx="100" cy="62" rx="20" ry="10" fill="${t.c}" ${AS}/><circle cx="82" cy="60" r="5" fill="${t.eyes}" ${AS}/><circle cx="118" cy="60" r="5" fill="${t.eyes}" ${AS}/>`,gdots([[100,84],[100,96],[100,108]]));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="cricket"){
    o.push(leg("M88 108 L70 124 L64 138",t.c,4),leg("M104 110 L112 132",t.c,4),leg("M120 104 L138 120",t.c,4));
    o.push(`<ellipse cx="88" cy="96" rx="32" ry="18" fill="${t.c}" ${AS}/>`);
    for(let k=0;k<5;k++)o.push(`<path d="M${66+k*10} 80 Q${62+k*10} 96 ${66+k*10} 112" stroke="${t.b}" stroke-width="3" fill="none"/>`);
    o.push(`<circle cx="132" cy="84" r="18" fill="${t.c}" ${AS}/>`,eyeDot(140,80,2.4),ant(136,68,14),gspiral(132,90,.8));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="locust"){
    o.push(leg("M96 96 L70 70 L60 124",t.b,6),`<path d="M40 100 Q60 80 120 84 Q150 86 156 96 Q140 108 100 108 Q60 110 40 100Z" fill="${t.c}" ${AS}/>`,wing("M60 92 Q100 76 140 86 Q100 96 60 98Z",t.b),`<circle cx="152" cy="92" r="11" fill="${t.c}" ${AS}/>`,eyeDot(156,88,2.4),ant(156,82,14),leg("M124 104 L130 126",t.c,3),leg("M138 102 L148 124",t.c,3),gdots([[80,100],[100,102],[118,98]]));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  if(t.f==="stick"){
    o.push(`<path d="M30 92 L176 74" stroke="#f3d98a" stroke-width="8" stroke-linecap="round"/><path d="M30 92 L176 74" stroke="${t.c}" stroke-width="5.4" stroke-linecap="round"/>`);
    [[60,88,-1],[96,84,1],[124,80,-1],[150,77,1]].forEach(([x,y,s])=>o.push(`<path d="M${x} ${y} l${-8*s} ${s*24} l${-6*s} ${s*10} M${x} ${y} l${8} ${-s*22}" stroke="${t.c}" stroke-width="2.4" fill="none"/>`));
    o.push(`<path d="M176 74 l16 -14 M176 74 l18 -6" stroke="${t.c}" stroke-width="1.6"/>`,eyeDot(172,72,1.6));
    return tileFrame(t.bg,t.motif)+o.join("");
  }
  return tileFrame(t.bg||"#24345e",t.motif||"steps");
}
