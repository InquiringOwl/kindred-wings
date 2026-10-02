/* Kindred Creatures — plant drawings (trees, flowers, other greenery). Plain script; shares globals.
   Same family as the bird medallions and animal tiles: flat shapes outlined in soft gold #f3d98a 1.3px,
   gold dot and spiral details, a celestial “garden window” behind (sun, never a moon), arch-topped. */
const FS='stroke="#f3d98a" stroke-width="1.3" stroke-linejoin="round"';
let floraN=0;
const PLANT_BG={tree:["#1d4a4c","#1e2a4f"],flower:["#4a2c58","#1e2a4f"],green:["#2a4a3a","#1e2a4f"]};
function plantFrame(kind){
  const id="pf"+(++floraN), [c1,c2]=PLANT_BG[kind]||PLANT_BG.tree;
  const stars=[[22,26],[40,52],[178,64],[30,90],[184,104],[58,22],[120,18]].map(([x,y],i)=>i%3?`<circle cx="${x}" cy="${y}" r="${i%2?1:1.5}" fill="#fff6d0" opacity=".75"/>`:`<path d="M${x} ${y-4} L${x+1.2} ${y-1.2} L${x+4} ${y} L${x+1.2} ${y+1.2} L${x} ${y+4} L${x-1.2} ${y+1.2} L${x-4} ${y} L${x-1.2} ${y-1.2}Z" fill="#f3d98a" opacity=".85"/>`).join("");
  return `<defs><radialGradient id="${id}" cx="70%" cy="20%" r="90%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
  <rect width="200" height="160" fill="url(#${id})"/>${stars}
  <g opacity=".95"><circle cx="160" cy="34" r="11" fill="#f3d98a"/><circle cx="160" cy="34" r="16" fill="none" stroke="#f3d98a" stroke-opacity=".45" stroke-dasharray="2 3"/>
  <path d="M160 14 v-4 M160 54 v4 M140 34 h-4 M180 34 h4 M146 20 l-3 -3 M174 48 l3 3 M174 20 l3 -3 M146 48 l-3 3" stroke="#f3d98a" stroke-width="1.4" stroke-linecap="round"/></g>
  <path d="M0 140 Q50 124 100 132 T200 128 V160 H0Z" fill="#3a5a40" ${FS}/>
  <g fill="#f3d98a" opacity=".55">${[18,44,72,128,156,184].map((x,i)=>`<circle cx="${x}" cy="${146+(i%2)*6}" r="1.4"/>`).join("")}</g>`;
}
const blob=(x,y,r,c,extra="")=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${FS} ${extra}/>`;
const dots=(pts,c="#f3d98a",r=1.4,o=.8)=>pts.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}"/>`).join("");
const spiral=(x,y,s=1)=>`<path d="M${x} ${y} m-${3*s} 0 a${3*s} ${3*s} 0 1 1 ${3*s} ${3*s} a${5*s} ${5*s} 0 1 1 -${5*s} -${5*s}" fill="none" stroke="#f3d98a" stroke-opacity=".7" stroke-width="1"/>`;
const trunkPath=(x,top,bot,w,c,lean=0)=>`<path d="M${x-w} ${bot} C${x-w*.6} ${(top+bot)/2} ${x-w*.3+lean} ${top+10} ${x-w*.25+lean} ${top} L${x+w*.25+lean} ${top} C${x+w*.3+lean} ${top+10} ${x+w*.6} ${(top+bot)/2} ${x+w} ${bot}Z" fill="${c}" ${FS}/>`;

/* ---------------- Trees ---------------- */
function treeSVG(a){
  const t=a.art, L=t.leaf, L2=t.leaf2||t.leaf, T=t.trunk||"#6a4a30", B=t.bloom;
  let o=[];
  const crown=(pts,cA,cB)=>pts.map(([x,y,r],i)=>blob(x,y,r,i%2?cB:cA)).join("");
  switch(t.f){
  case "oak":
    o.push(trunkPath(100,92,140,13,T),`<path d="M100 104 L74 86 M100 100 L128 82 M98 96 L96 74" stroke="${T}" stroke-width="7" stroke-linecap="round"/>`);
    o.push(crown([[64,78,20],[136,76,20],[82,58,24],[118,56,24],[100,44,20],[100,74,22],[52,92,12],[150,90,12]],L,L2));
    o.push(dots([[70,70],[90,52],[112,62],[128,74],[100,40],[80,82],[122,86]]),spiral(100,64));break;
  case "cypress":
    o.push(`<path d="M92 140 C94 120 104 104 112 86 L120 88 C110 108 104 122 108 140Z" fill="${T}" ${FS}/>`,`<path d="M110 92 L70 70 M114 88 L150 60" stroke="${T}" stroke-width="5" stroke-linecap="round"/>`);
    o.push(`<path d="M40 70 Q60 50 96 58 Q120 44 160 52 Q176 58 168 68 Q130 76 96 74 Q60 82 40 70Z" fill="${L}" ${FS}/>`,`<path d="M60 92 Q80 80 110 86 Q140 78 158 88 Q150 98 120 98 Q84 104 60 92Z" fill="${L2}" ${FS}/>`,`<path d="M96 46 Q112 34 134 40 Q140 48 128 52 Q110 54 96 46Z" fill="${L2}" ${FS}/>`);
    o.push(dots([[60,66],[90,62],[126,58],[150,60],[80,90],[116,90],[140,90],[116,44]]));break;
  case "pine":
    o.push(trunkPath(100,40,140,7,T),`<path d="M100 60 L72 50 M100 78 L134 66 M100 96 L70 88" stroke="${T}" stroke-width="4" stroke-linecap="round"/>`);
    o.push(`<ellipse cx="66" cy="48" rx="20" ry="10" fill="${L}" ${FS}/><ellipse cx="102" cy="34" rx="18" ry="10" fill="${L2}" ${FS}/><ellipse cx="138" cy="62" rx="22" ry="11" fill="${L}" ${FS}/><ellipse cx="66" cy="86" rx="20" ry="10" fill="${L2}" ${FS}/><ellipse cx="128" cy="96" rx="16" ry="8" fill="${L}" ${FS}/>`);
    o.push(`<g fill="#a87a50" ${FS}><ellipse cx="74" cy="56" rx="4" ry="6"/><ellipse cx="132" cy="70" rx="4" ry="6"/></g>`,dots([[56,46],[96,32],[140,58],[60,84],[126,94]]));break;
  case "cone":{const w=t.wide?1.25:1;
    o.push(trunkPath(100,100,140,8*w,T));
    [[30,46],[52,60],[74,76],[96,94]].forEach(([y,h],i)=>o.push(`<path d="M100 ${y-14} L${100-h*.55*w} ${y+h*.5} Q100 ${y+h*.42} ${100+h*.55*w} ${y+h*.5}Z" fill="${i%2?L2:L}" ${FS}/>`));
    o.push(dots([[92,40],[108,58],[88,74],[112,90],[96,106],[80,104],[120,104]]));break;}
  case "cedar":
    o.push(trunkPath(100,40,140,9,T));
    [[40,30],[62,46],[86,62],[110,76]].forEach(([y,h],i)=>o.push(`<path d="M${100-h*1.1} ${y+8} Q100 ${y-6} ${100+h*1.1} ${y+8} Q100 ${y+14} ${100-h*1.1} ${y+8}Z" fill="${i%2?L2:L}" ${FS}/>`));
    o.push(dots([[80,46],[120,62],[70,86],[134,88],[100,112]]));break;
  case "euc":
    if(t.rainbow){o.push(`<defs><clipPath id="rb${++floraN}"><path d="M90 140 C92 110 94 80 96 50 L106 50 C108 80 110 110 112 140Z"/></clipPath></defs><g clip-path="url(#rb${floraN})">${["#3f9c5a","#2f7ac8","#8a5ad8","#e0782a","#d8322f","#f2c92c"].map((c,i)=>`<rect x="${86+i*5}" y="40" width="6" height="110" fill="${c}"/>`).join("")}</g><path d="M90 140 C92 110 94 80 96 50 L106 50 C108 80 110 110 112 140Z" fill="none" ${FS}/>`);}
    else o.push(`<path d="M90 140 C92 110 94 80 96 50 L106 50 C108 80 110 110 112 140Z" fill="${T}" ${FS}/><path d="M96 120 q4 -6 2 -14 M104 96 q-3 -6 0 -12" stroke="#8a7a60" fill="none"/>`);
    o.push(`<path d="M98 60 L70 40 M104 66 L136 46 M100 82 L76 72" stroke="${T}" stroke-width="4" stroke-linecap="round"/>`);
    o.push(`<ellipse cx="66" cy="38" rx="16" ry="12" fill="${L}" ${FS}/><ellipse cx="102" cy="30" rx="18" ry="14" fill="${L2}" ${FS}/><ellipse cx="140" cy="44" rx="16" ry="12" fill="${L}" ${FS}/><ellipse cx="72" cy="72" rx="12" ry="9" fill="${L2}" ${FS}/>`);
    o.push(`<g stroke="${L2}" stroke-width="2" stroke-linecap="round">${[[58,48],[70,50],[96,42],[110,44],[134,54],[146,56]].map(([x,y])=>`<path d="M${x} ${y} l-2 8"/>`).join("")}</g>`,dots([[66,36],[102,28],[140,42]]));break;
  case "willow":
    o.push(trunkPath(100,70,140,11,T),`<path d="M100 84 L76 66 M100 80 L126 64" stroke="${T}" stroke-width="5" stroke-linecap="round"/>`);
    o.push(`<ellipse cx="100" cy="56" rx="${t.weep?56:46}" ry="28" fill="${L}" ${FS}/>`);
    {let s="";for(let x=48;x<=152;x+=7){const len=t.weep?60:38;s+=`<path d="M${x} ${56+Math.abs(x-100)*.25} q${(x-100)*.05} ${len*.5} ${(x-100)*.08} ${len}" stroke="${L2}" stroke-width="3" fill="none" stroke-linecap="round"/>`;}o.push(s);}
    o.push(dots([[80,48],[104,40],[124,50],[96,62]]),spiral(100,50));break;
  case "palm":
    o.push(`<path d="M94 140 Q96 96 102 46 L110 46 Q106 96 108 140Z" fill="${T}" ${FS}/>`);
    {let s="";for(let y=56;y<136;y+=9)s+=`<path d="M${97+((y-46)/94)*-2} ${y} l5 4 l5 -4" stroke="#5a3a20" fill="none"/>`;o.push(s);}
    [[-70,30],[-40,22],[-10,18],[20,22],[50,30],[80,40],[-90,44]].forEach(([dx,dy],i)=>o.push(`<path d="M106 46 Q${106+dx*.5} ${46-dy} ${106+dx} ${46+12}" stroke="${i%2?L2:L}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M106 46 Q${106+dx*.5} ${46-dy} ${106+dx} ${46+12}" stroke="#f3d98a" stroke-width="1" fill="none" stroke-dasharray="3 3"/>`));
    o.push(`<g fill="#e0902a" ${FS}><circle cx="100" cy="52" r="3"/><circle cx="108" cy="54" r="3"/><circle cx="104" cy="58" r="3"/></g>`);break;
  case "baobab":
    o.push(`<path d="M76 140 C66 110 76 82 86 62 L114 62 C124 82 134 110 124 140Z" fill="${T}" ${FS}/>`,`<path d="M88 64 L72 40 M96 62 L92 34 M106 62 L112 36 M112 64 L132 42" stroke="${T}" stroke-width="6" stroke-linecap="round"/>`);
    o.push(crown([[70,36,10],[92,28,11],[114,30,11],[134,38,10]],L,L2),`<path d="M90 90 q10 6 20 0 M86 110 q14 6 28 0" stroke="#8a6a50" fill="none"/>`,spiral(100,100,1.3));break;
  case "banyan":
    o.push(`<path d="M100 74 L64 66 M100 74 L140 64" stroke="${T}" stroke-width="7" stroke-linecap="round"/>`,trunkPath(100,70,140,12,T));
    {let s="";[44,56,70,128,142,156].forEach(x=>s+=`<path d="M${x} 72 Q${x+2} 108 ${x} 138" stroke="${T}" stroke-width="3" fill="none"/>`);o.push(s);}
    o.push(`<path d="M24 74 Q30 40 70 38 Q100 24 130 38 Q172 40 178 74 Q100 84 24 74Z" fill="${L}" ${FS}/>`,crown([[60,50,12],[100,38,14],[140,50,12]],L2,L),dots([[50,62],[80,52],[120,52],[152,62],[100,66]]));break;
  case "joshua":
    o.push(`<path d="M96 140 L98 96 M98 96 L74 74 L70 54 M98 96 L118 70 L132 56 M118 70 L114 46 M74 74 L60 70" stroke="${T}" stroke-width="7" stroke-linecap="round" fill="none"/>`,`<path d="M96 140 L98 96" stroke="#f3d98a" stroke-width="1" stroke-dasharray="2 3"/>`);
    [[70,50],[132,52],[114,42],[58,66]].forEach(([x,y])=>{let s="";for(let k=0;k<9;k++){const an=-Math.PI*(k/8);s+=`<path d="M${x} ${y} l${Math.cos(an)*14} ${Math.sin(an)*14}" stroke="${k%2?L2:L}" stroke-width="3" stroke-linecap="round"/>`;}o.push(s+blob(x,y,3,"#f2e8b0"));});break;
  case "dragon":
    o.push(`<path d="M96 140 L98 98 M98 98 L78 80 M98 98 L100 76 M98 98 L120 80" stroke="${T}" stroke-width="7" stroke-linecap="round"/>`,`<path d="M40 78 Q100 20 160 78 Q100 70 40 78Z" fill="${L}" ${FS}/>`,`<path d="M60 70 Q100 36 140 70" fill="none" stroke="${L2}" stroke-width="4"/>`,dots([[70,66],[100,50],[130,66],[86,58],[116,58]],"#d8322f",1.6));break;
  case "gnarled":
    o.push(`<path d="M84 140 C70 120 100 106 88 88 C80 74 96 62 92 50 L100 50 C106 66 92 76 102 90 C114 106 96 122 112 140Z" fill="${T}" ${FS}/>`,`<path d="M94 64 L72 48 M98 80 L124 64" stroke="${T}" stroke-width="5" stroke-linecap="round"/>`,crown([[66,44,10],[94,42,9],[128,60,11]],L,L2),`<path d="M90 100 q6 4 4 12 M100 70 q-4 6 0 10" stroke="#8a7a60" fill="none"/>`);break;
  case "olive":
    o.push(`<path d="M86 140 C80 124 104 116 92 100 C86 90 98 84 96 76 L106 76 C108 88 98 92 106 104 C116 118 98 126 114 140Z" fill="${T}" ${FS}/>`,crown([[66,70,18],[134,70,18],[84,52,20],[116,52,20],[100,66,20]],L,L2),dots([[72,64],[92,48],[110,60],[128,66],[100,74],[84,72]],"#3a2a3a",2,1));break;
  case "maple":
    o.push(trunkPath(100,82,140,8,T),`<path d="M100 92 L80 74 M100 90 L122 72" stroke="${T}" stroke-width="5" stroke-linecap="round"/>`);
    {const star=(x,y,r,c)=>{let d="";for(let k=0;k<10;k++){const an=-Math.PI/2+k*Math.PI/5;const rr=k%2?r*.45:r;d+=(k?"L":"M")+(x+Math.cos(an)*rr).toFixed(1)+" "+(y+Math.sin(an)*rr).toFixed(1);}return `<path d="${d}Z" fill="${c}" ${FS}/>`;};
     [[70,66,14],[100,48,16],[130,64,14],[86,80,11],[116,82,11],[100,70,13],[56,84,9],[146,84,9]].forEach(([x,y,r],i)=>o.push(star(x,y,r,i%2?L2:L)));}
    break;
  case "blossom":
    o.push(trunkPath(100,84,140,9,T),`<path d="M100 96 L70 74 M100 92 L132 72 M100 90 L98 66" stroke="${T}" stroke-width="5" stroke-linecap="round"/>`);
    o.push(crown([[66,70,18],[134,70,18],[84,52,20],[116,52,20],[100,70,20],[100,40,14]],L,L2));
    {const fl=(x,y)=>[0,1,2,3,4].map(k=>{const an=k*Math.PI*2/5;return `<circle cx="${(x+Math.cos(an)*3).toFixed(1)}" cy="${(y+Math.sin(an)*3).toFixed(1)}" r="2.2" fill="${B||"#f8d0dc"}"/>`;}).join("")+`<circle cx="${x}" cy="${y}" r="1.2" fill="#d8304a"/>`;
     o.push([[70,62],[90,46],[112,52],[130,66],[100,72],[80,80],[120,82],[100,38]].map(([x,y])=>fl(x,y)).join(""));}
    break;
  default: /* round */
    o.push(trunkPath(100,88,140,10,T));
    if(t.patchy) o.push(`<g fill="#e8e0c8" opacity=".8"><ellipse cx="96" cy="118" rx="3" ry="5"/><ellipse cx="104" cy="104" rx="3" ry="4"/></g>`);
    o.push(`<path d="M100 100 L78 80 M100 96 L124 78" stroke="${T}" stroke-width="5" stroke-linecap="round"/>`);
    o.push(crown([[68,72,20],[132,72,20],[84,52,22],[116,52,22],[100,72,22],[100,36,14]],L,L2));
    if(t.fan) o.push([[72,64],[92,46],[112,54],[130,68],[100,74],[86,82],[118,84]].map(([x,y])=>`<path d="M${x} ${y+4} L${x-5} ${y-3} A6 6 0 0 1 ${x+5} ${y-3}Z" fill="#f2d84a" stroke="#c8a030" stroke-width=".8"/>`).join(""));
    else if(t.heart) o.push([[72,64],[92,46],[112,54],[130,68],[100,74]].map(([x,y])=>`<path d="M${x} ${y+6} C${x-8} ${y} ${x-5} ${y-6} ${x} ${y-2} C${x+5} ${y-6} ${x+8} ${y} ${x} ${y+6}Z" fill="${L2}" ${FS}/>`).join(""));
    else if(t.candles) o.push([[72,58],[94,40],[118,46],[134,62],[100,66]].map(([x,y])=>`<path d="M${x-3} ${y+6} L${x} ${y-10} L${x+3} ${y+6}Z" fill="${B}" ${FS}/>`).join(""));
    else if(t.bigBloom) o.push([[74,62],[110,46],[128,72]].map(([x,y])=>`<g>${[0,1,2,3,4,5].map(k=>{const an=k*Math.PI/3;return `<ellipse cx="${(x+Math.cos(an)*5).toFixed(1)}" cy="${(y+Math.sin(an)*5).toFixed(1)}" rx="5" ry="3.2" transform="rotate(${k*60} ${(x+Math.cos(an)*5).toFixed(1)} ${(y+Math.sin(an)*5).toFixed(1)})" fill="${B}" ${FS}/>`;}).join("")}<circle cx="${x}" cy="${y}" r="2.5" fill="#e8c86a"/></g>`).join(""));
    else if(B) o.push(dots([[70,64],[88,44],[108,50],[126,66],[98,74],[80,82],[118,84],[100,34],[60,78],[140,78]],B,2.6,1));
    o.push(dots([[76,74],[96,56],[120,62]]),spiral(100,62));
  }
  return o.join("");
}

/* ---------------- Flowers ---------------- */
function flowerSVG(a){
  const t=a.art, P=t.p, P2=t.p2||t.p, C=t.c||"#f2c92c", L=t.leaf||"#4f8a3a";
  let o=[];
  const stem=(x1,y1,x2,y2,w=3)=>`<path d="M${x1} ${y1} Q${(x1+x2)/2+6} ${(y1+y2)/2} ${x2} ${y2}" stroke="#3f6a3a" stroke-width="${w+2.4}" fill="none" stroke-linecap="round"/><path d="M${x1} ${y1} Q${(x1+x2)/2+6} ${(y1+y2)/2} ${x2} ${y2}" stroke="${L}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const leaf=(x,y,ang,len=22,w=8,c=L)=>`<path d="M${x} ${y} q${len*.5} ${-w} ${len} 0 q${-len*.5} ${w} ${-len} 0Z" transform="rotate(${ang} ${x} ${y})" fill="${c}" ${FS}/>`;
  const radial=(x,y,n,r,pw,ph,c1,c2,off=0)=>{let s="";for(let k=0;k<n;k++){const an=off+k*2*Math.PI/n, deg=an*180/Math.PI;const cx=x+Math.cos(an)*r, cy=y+Math.sin(an)*r;s+=`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${pw}" ry="${ph}" transform="rotate(${(deg+90).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${k%2?c2:c1}" ${FS}/>`;}return s;};
  const hx=100, hy=66;
  switch(t.f){
  case "cup":
    o.push(stem(100,140,hx,hy+16),leaf(100,124,-150,24),leaf(102,112,-30,22));
    if(t.tulip) o.push(`<path d="M${hx-20} ${hy-8} Q${hx-22} ${hy+22} ${hx} ${hy+22} Q${hx+22} ${hy+22} ${hx+20} ${hy-8} L${hx+10} ${hy+2} L${hx} ${hy-14} L${hx-10} ${hy+2}Z" fill="${P}" ${FS}/><path d="M${hx-10} ${hy+2} L${hx} ${hy-14} L${hx+10} ${hy+2} Q${hx} ${hy+14} ${hx-10} ${hy+2}Z" fill="${P2}" ${FS}/>`);
    else o.push(`<path d="M${hx} ${hy+18} C${hx-34} ${hy+10} ${hx-34} ${hy-22} ${hx-8} ${hy-20} Z" fill="${P}" ${FS}/><path d="M${hx} ${hy+18} C${hx+34} ${hy+10} ${hx+34} ${hy-22} ${hx+8} ${hy-20} Z" fill="${P}" ${FS}/><path d="M${hx} ${hy+18} C${hx-16} ${hy} ${hx-14} ${hy-26} ${hx} ${hy-26} C${hx+14} ${hy-26} ${hx+16} ${hy} ${hx} ${hy+18}Z" fill="${P2}" ${FS}/><circle cx="${hx}" cy="${hy+4}" r="4" fill="${C}" ${FS}/>`);
    o.push(spiral(hx-14,hy-2,.8));break;
  case "daisy": case "sun":{
    const big=t.f==="sun", n=t.n||16, r=big?22:(t.small?11:16), pw=t.thin?2.4:(big?5:4), ph=big?11:(t.small?6:9);
    o.push(stem(100,140,hx,hy+r),leaf(100,122,-150,26,9),leaf(101,108,-25,24,8));
    if(t.layered) o.push(radial(hx,hy,n,r*.95,pw,ph,P2,P,.1));
    o.push(radial(hx,hy,n,r*(t.layered?.6:1),pw,ph,P,P2));
    o.push(`<circle cx="${hx}" cy="${hy}" r="${big?13:(t.small?5:8)}" fill="${C}" ${FS}/>`);
    if(big||t.droop) o.push(dots([[hx-5,hy-4],[hx+4,hy-5],[hx,hy+2],[hx-6,hy+5],[hx+6,hy+4],[hx,hy-9]],"#f3d98a",1.2,.9));
    break;}
  case "cluster":{
    o.push(stem(96,140,92,92),stem(104,140,110,94),stem(100,140,100,86));
    if(t.ferny){let s="";for(let k=0;k<6;k++)s+=`<path d="M100 ${132-k*7} l${k%2?14:-14} -4" stroke="${L}" stroke-width="2"/>`;o.push(s);}else o.push(leaf(98,126,-160,22),leaf(102,118,-20,22));
    const pts=[];for(let i=0;i<26;i++){const an=i*2.4,rr=4+((i*37)%22);pts.push([hx+Math.cos(an)*rr*1.2,76+Math.sin(an)*rr*.55-Math.abs(Math.cos(an))*4]);}
    o.push(`<path d="M${hx-34} 84 Q${hx} 52 ${hx+34} 84Z" fill="${L}" opacity=".5"/>`);
    o.push(pts.map(([x,y],i)=>`<g>${[0,1,2,3].map(k=>`<circle cx="${(x+Math.cos(k*Math.PI/2)*2.4).toFixed(1)}" cy="${(y+Math.sin(k*Math.PI/2)*2.4).toFixed(1)}" r="2.2" fill="${i%3?P:P2}"/>`).join("")}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1" fill="${C}"/></g>`).join(""));
    break;}
  case "spike":{
    o.push(stem(100,140,100,40),[0,1,2,3,4].map(k=>{const an=k*72-90;return leaf(100,128,an,16,4,"#a8b8b8");}).join(""));
    for(let i=0;i<9;i++){const y=48+i*8, w=4+i*.9;o.push(`<ellipse cx="${100-w}" cy="${y}" rx="${w}" ry="3.6" fill="${i%2?P:P2}" ${FS}/><ellipse cx="${100+w}" cy="${y+3}" rx="${w}" ry="3.6" fill="${i%2?P2:P}" ${FS}/>`);}
    o.push(`<ellipse cx="100" cy="42" rx="3" ry="5" fill="${P2}" ${FS}/>`);break;}
  case "trumpet":{
    if(t.naked){[[80,58],[100,48],[120,58]].forEach(([x,y],i)=>{o.push(`<path d="M100 92 L${x} ${y+14}" stroke="${L}" stroke-width="2.4"/>`);o.push(`<path d="M${x} ${y+16} L${x-12} ${y-4} L${x-4} ${y} L${x} ${y-8} L${x+4} ${y} L${x+12} ${y-4}Z" fill="${i%2?P2:P}" ${FS}/>`);});o.push(stem(100,140,100,92,4));break;}
    o.push(stem(100,140,104,hy+16),leaf(100,124,-150,30,10),leaf(102,114,-28,26,9));
    if(t.calla) o.push(`<path d="M${hx+4} ${hy+18} C${hx-28} ${hy+6} ${hx-20} ${hy-28} ${hx+18} ${hy-30} C${hx+8} ${hy-14} ${hx+20} ${hy+4} ${hx+4} ${hy+18}Z" fill="${P}" ${FS}/><path d="M${hx+2} ${hy+12} L${hx+6} ${hy-14}" stroke="${C}" stroke-width="5" stroke-linecap="round"/>`);
    else if(t.daff) o.push(radial(hx,hy,6,12,6,11,P,P2),`<circle cx="${hx}" cy="${hy}" r="9" fill="${C}" ${FS}/><circle cx="${hx}" cy="${hy}" r="5" fill="none" stroke="#c87a2a"/>`);
    else if(t.open5) o.push(radial(hx,hy,5,10,7,9,P,P2),`<circle cx="${hx}" cy="${hy}" r="4" fill="${C}"/>`);
    else o.push(`<path d="M${hx} ${hy+16} L${hx-22} ${hy-16} L${hx-8} ${hy-6} L${hx} ${hy-22} L${hx+8} ${hy-6} L${hx+22} ${hy-16}Z" fill="${P}" ${FS}/><path d="M${hx} ${hy+14} L${hx-6} ${hy-10} M${hx} ${hy+14} L${hx+6} ${hy-10} M${hx} ${hy+14} L${hx} ${hy-14}" stroke="${C}" stroke-width="1.6"/>`);
    break;}
  case "round5":{
    const n=t.small?3:1;
    o.push(stem(100,140,hx,hy+10));
    if(t.padLeaves) o.push([[74,112,12],[124,106,13],[90,96,9]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${L}" ${FS}/><path d="M${x} ${y} l${r*.8} 0 M${x} ${y} l${-r*.6} ${-r*.6} M${x} ${y} l${-r*.4} ${r*.7}" stroke="#f3d98a" stroke-opacity=".6"/>`).join(""));
    else if(t.clover) o.push([[78,116],[122,112]].map(([x,y])=>[0,1,2].map(k=>{const an=k*2.1-1.6;return `<path d="M${x} ${y} l${(Math.cos(an)*9).toFixed(1)} ${(Math.sin(an)*9).toFixed(1)} a5 5 0 1 1 ${(Math.cos(an+1.2)*4).toFixed(1)} ${(Math.sin(an+1.2)*4).toFixed(1)}Z" fill="${L}" ${FS}/>`;}).join("")).join(""));
    else o.push(leaf(100,124,-150,24),leaf(102,112,-30,22));
    const heads=n===1?[[hx,hy,t.big?18:14]]:[[hx-18,hy+6,9],[hx+14,hy-2,9],[hx,hy-16,8]];
    heads.forEach(([x,y,r])=>o.push(radial(x,y,5,r*.62,r*.55,r*.62,P,P2),`<circle cx="${x}" cy="${y}" r="${r*.28}" fill="${C}" ${FS}/>`));
    if(t.big) o.push(`<path d="M${hx} ${hy} L${hx+16} ${hy-14}" stroke="#f2d84a" stroke-width="2"/><circle cx="${hx+16}" cy="${hy-14}" r="2.5" fill="#d8242a"/>`);
    break;}
  case "rose":
    o.push(stem(100,140,hx,hy+16),leaf(100,122,-150,22,9),leaf(102,110,-30,20,8),`<path d="M98 128 l-4 -3 M103 116 l4 -3" stroke="#3f6a3a" stroke-width="1.6"/>`);
    o.push(`<circle cx="${hx}" cy="${hy}" r="20" fill="${P}" ${FS}/>`,radial(hx,hy,7,14,8,7,P2,P),`<circle cx="${hx}" cy="${hy}" r="9" fill="${P}" ${FS}/>`,`<path d="M${hx-5} ${hy+1} a5 5 0 1 1 5 4 a2.5 2.5 0 1 1 -2 -3" fill="none" stroke="${C}" stroke-width="1.8"/>`);break;
  case "iris":
    o.push(stem(100,140,hx,hy+14),`<path d="M86 140 L80 92 L92 136Z M114 140 L122 96 L108 136Z" fill="${L}" ${FS}/>`);
    o.push(`<path d="M${hx} ${hy+8} C${hx-30} ${hy+4} ${hx-34} ${hy+28} ${hx-20} ${hy+32} C${hx-14} ${hy+22} ${hx-4} ${hy+16} ${hx} ${hy+8}Z" fill="${P}" ${FS}/><path d="M${hx} ${hy+8} C${hx+30} ${hy+4} ${hx+34} ${hy+28} ${hx+20} ${hy+32} C${hx+14} ${hy+22} ${hx+4} ${hy+16} ${hx} ${hy+8}Z" fill="${P}" ${FS}/>`,`<path d="M${hx} ${hy+8} C${hx-14} ${hy-6} ${hx-8} ${hy-28} ${hx} ${hy-28} C${hx+8} ${hy-28} ${hx+14} ${hy-6} ${hx} ${hy+8}Z" fill="${P2}" ${FS}/>`,`<path d="M${hx-18} ${hy+16} l6 4 M${hx+18} ${hy+16} l-6 4" stroke="${C}" stroke-width="3" stroke-linecap="round"/>`);break;
  case "bell":
    o.push(`<path d="M86 140 Q90 70 132 52" stroke="${L}" stroke-width="3" fill="none"/>`,leaf(90,138,-100,40,6),leaf(96,138,-70,40,6));
    [[96,96],[104,80],[114,68],[124,58]].forEach(([x,y],i)=>o.push(`<path d="M${x} ${y} l2 8" stroke="${L}" stroke-width="1.6"/><path d="M${x-6} ${y+20} Q${x-6} ${y+6} ${x+2} ${y+6} Q${x+10} ${y+6} ${x+10} ${y+20} L${x+8} ${y+17} L${x+5} ${y+21} L${x+2} ${y+17} L${x-1} ${y+21} L${x-4} ${y+17}Z" fill="${i%2?P2:P}" ${FS}/>`));break;
  case "star":
    o.push(stem(100,140,hx,hy+14,2.6),leaf(100,124,-140,18,5,"#a8b8a8"),leaf(101,116,-40,18,5,"#a8b8a8"));
    {let d="";for(let k=0;k<16;k++){const an=-Math.PI/2+k*Math.PI/8;const rr=k%2?8:24;d+=(k?"L":"M")+(hx+Math.cos(an)*rr).toFixed(1)+" "+(hy+Math.sin(an)*rr).toFixed(1);}o.push(`<path d="${d}Z" fill="${P}" ${FS}/>`,radial(hx,hy,8,13,2.4,6,P2,P2,.2));}
    o.push(dots([[hx-3,hy-3],[hx+3,hy-2],[hx,hy+3],[hx-4,hy+3],[hx+4,hy+3]],C,2.2,1));break;
  case "lotus":
    o.push(`<ellipse cx="100" cy="128" rx="56" ry="10" fill="${L}" ${FS}/><path d="M100 128 L100 118" stroke="#f3d98a"/>`);
    [[-1,-30,0],[-1,-14,-34],[-1,-14,34],[1,0,-60],[1,0,60]].forEach(([z,dy,rot])=>o.push(`<path d="M100 104 C88 92 90 74 100 ${64+dy*.2} C110 74 112 92 100 104Z" transform="rotate(${rot} 100 104)" fill="${z<0?P2:P}" ${FS}/>`));
    o.push(`<ellipse cx="100" cy="98" rx="8" ry="4" fill="${C}" ${FS}/>`);break;
  case "orchid":
    o.push(`<path d="M80 140 Q86 80 140 60" stroke="#5a7a4a" stroke-width="2.6" fill="none"/>`,`<ellipse cx="78" cy="134" rx="24" ry="8" transform="rotate(-12 78 134)" fill="${L}" ${FS}/><ellipse cx="96" cy="136" rx="22" ry="7" transform="rotate(14 96 136)" fill="${L}" ${FS}/>`);
    [[112,66,1],[132,58,.8],[92,90,.85]].forEach(([x,y,s])=>{const g=(dx,dy,rx,ry,c,rot=0)=>`<ellipse cx="${x+dx*s}" cy="${y+dy*s}" rx="${rx*s}" ry="${ry*s}" transform="rotate(${rot} ${x+dx*s} ${y+dy*s})" fill="${c}" ${FS}/>`;o.push(g(0,-10,5,9,P),g(-8,6,5,8,P,40),g(8,6,5,8,P,-40),g(-11,-2,9,8,P2),g(11,-2,9,8,P2),g(0,6,5,5,C));});break;
  case "pom":
    o.push(stem(100,140,hx,hy+16),leaf(100,122,-150,24,9),leaf(102,110,-30,22,8));
    [22,17,12,7].forEach((r,i)=>{let d="";const n=14+i*2;for(let k=0;k<=n;k++){const an=k*2*Math.PI/n;const rr=r+(k%2?2.4:0);d+=(k?"L":"M")+(hx+Math.cos(an)*rr).toFixed(1)+" "+(hy+Math.sin(an)*rr).toFixed(1);}o.push(`<path d="${d}Z" fill="${i%2?P2:(i===3?C:P)}" ${FS}/>`);});break;
  case "peony":
    o.push(stem(100,140,hx,hy+18),leaf(98,122,-160,26,10),leaf(103,110,-24,24,9));
    o.push(`<circle cx="${hx}" cy="${hy}" r="24" fill="${P}" ${FS}/>`,radial(hx,hy,9,17,9,9,P2,P),radial(hx,hy,7,9,6,6,P,P2,.3),`<circle cx="${hx}" cy="${hy}" r="4" fill="${C}"/>`);break;
  }
  return o.join("");
}

/* ---------------- Other greenery (shrubs, herbs, ferns) ---------------- */
function shrubSVG(a){
  const t=a.art, L=t.leaf, L2=t.leaf2||t.leaf, B=t.bloom, BR=t.berry;
  let o=[];
  const bush=(c1,c2,smooth)=>smooth?`<path d="M40 136 Q36 86 100 80 Q164 86 160 136Z" fill="${c1}" ${FS}/><path d="M40 136 Q100 120 160 136" stroke="${c2}" stroke-width="3" fill="none"/>`
    :[[60,118,22],[140,118,22],[78,98,24],[122,98,24],[100,86,22],[100,116,26]].map(([x,y,r],i)=>blob(x,y,r,i%2?c2:c1)).join("");
  switch(t.f){
  case "sprig":
    for(let k=0;k<5;k++){const x=70+k*15, tilt=(k-2)*8;o.push(`<path d="M${x} 140 Q${x+tilt*.4} 100 ${x+tilt} 56" stroke="#6a5a40" stroke-width="2.4" fill="none"/>`);
      let s="";for(let j=0;j<10;j++){const y=132-j*8, xx=x+tilt*(j/10)*.9;s+=`<path d="M${xx} ${y} l-7 -4 M${xx} ${y} l7 -4" stroke="${j%2?L:L2||L}" stroke-width="2.6" stroke-linecap="round"/>`;}o.push(s);
      if(B) o.push(dots([[x+tilt*.5-3,90],[x+tilt*.7+3,76]],B,2.4,1));if(BR) o.push(dots([[x+tilt*.6,84],[x+tilt*.8+4,70]],BR,3.2,1));}
    break;
  case "spikes":
    o.push(`<path d="M50 138 Q100 108 150 138Z" fill="${L}" ${FS}/>`);
    for(let k=0;k<7;k++){const x=56+k*15, top=52+((k*13)%18);o.push(`<path d="M100 132 Q${(x+100)/2} 100 ${x} ${top+16}" stroke="${L}" stroke-width="2" fill="none"/>`);for(let j=0;j<5;j++)o.push(`<ellipse cx="${x}" cy="${top+j*4}" rx="3" ry="2.6" fill="${B}" ${FS}/>`);}
    break;
  case "mound":
    o.push(bush(L,L2,t.clipped));
    if(t.fine){let s="";for(let i=0;i<40;i++){const an=i*2.4,rr=(i*13)%40;s+=`<path d="M${(100+Math.cos(an)*rr*1.3).toFixed(1)} ${(108+Math.sin(an)*rr*.55).toFixed(1)} l3 -4" stroke="#f4f2ea" stroke-opacity=".5"/>`;}o.push(s);}
    if(B) o.push(dots([[70,100],[96,84],[128,96],[110,110],[84,116],[140,114]],B,2.6,1));
    o.push(spiral(100,108));break;
  case "berry":
    o.push(bush(L,L2));
    if(t.spiky) o.push([[70,104],[124,92],[100,118]].map(([x,y])=>`<path d="M${x-10} ${y} l4 -4 l3 3 l3 -5 l3 5 l3 -3 l4 4 l-4 4 l-3 -3 l-3 5 l-3 -5 l-3 3Z" fill="${L2}" ${FS}/>`).join(""));
    if(t.thorny) o.push(`<path d="M50 120 q20 -30 50 -30 M150 120 q-20 -34 -48 -32" stroke="#6a3a3a" stroke-width="2.4" fill="none"/>${[[60,104],[74,96],[130,98],[142,108]].map(([x,y])=>`<path d="M${x} ${y} l3 -4" stroke="#c8a8a8" stroke-width="1.4"/>`).join("")}`);
    [[72,100],[96,86],[126,96],[108,114],[84,118],[140,116]].forEach(([x,y])=>o.push(`<g>${[[0,0],[5,2],[2,5],[-3,4]].map(([dx,dy])=>`<circle cx="${x+dx}" cy="${y+dy}" r="3.4" fill="${BR}" stroke="#f3d98a" stroke-width=".8"/>`).join("")}<circle cx="${x-1}" cy="${y-1}" r="1" fill="#fff" opacity=".6"/></g>`));
    break;
  case "leafy":
    if(t.round){[[76,120],[124,118],[100,104],[86,96],[116,94]].forEach(([x,y],i)=>o.push(`<path d="M100 138 L${x} ${y}" stroke="${L2}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="13" fill="${i%2?L2:L}" ${FS}/>`,B?`<path d="M${x} ${y} l0 -10" stroke="${L2}" stroke-width="1.4"/><circle cx="${x}" cy="${y-11}" r="2.4" fill="${B}"/>`:""));break;}
    if(t.trailing){let s="";for(let k=0;k<3;k++){const y=104+k*12;s+=`<path d="M30 ${y} Q100 ${y-20} 170 ${y+4}" stroke="#4a6a3a" stroke-width="2" fill="none"/>`;for(let j=0;j<8;j++){const x=40+j*17;s+=`<ellipse cx="${x}" cy="${y-6-Math.sin(j)*3}" rx="6" ry="4.5" fill="${j%2?L:L2}" ${FS}/>`;}}o.push(s+dots([[60,92],[118,94]],"#f4f2ea",2.2,1));break;}
    for(let k=0;k<4;k++){const x=78+k*15;o.push(`<path d="M${x} 140 L${x+2} 56" stroke="#4a6a3a" stroke-width="2.6"/>`);for(let j=0;j<4;j++){const y=124-j*20;const side=j%2?1:-1;const tooth=t.serrate?` stroke-dasharray="2 1.4"`:"";o.push(`<path d="M${x+2} ${y} q${side*12} -10 ${side*20} -2 q${-side*8} 10 ${-side*20} 2Z" fill="${j%2?L:L2}" stroke="#f3d98a" stroke-width="1.3"${tooth}/>`);}}
    break;
  case "umbel":
    o.push(`<path d="M80 140 L84 70 M100 140 L102 56 M120 140 L118 72" stroke="#5a7a3a" stroke-width="3"/>`);
    if(t.ferny){let s="";for(let k=0;k<12;k++){const y=130-k*6;s+=`<path d="M100 ${y} q${k%2?16:-16} -6 ${k%2?24:-24} -2" stroke="${L}" stroke-width="1.4" fill="none"/>`;}o.push(s);}
    else o.push([[84,110,-1],[118,112,1],[102,96,-1]].map(([x,y,s])=>`<path d="M${x} ${y} q${s*14} -8 ${s*24} 0 q${-s*12} 6 ${-s*24} 0Z" fill="${L}" ${FS}/>`).join(""));
    [[84,68],[102,54],[118,70]].forEach(([x,y],i)=>{let s="";for(let k=0;k<7;k++){const an=Math.PI+k*Math.PI/6;s+=`<path d="M${x} ${y+10} L${(x+Math.cos(an)*14).toFixed(1)} ${(y+Math.sin(an)*6).toFixed(1)}" stroke="#5a7a3a" stroke-width="1"/><circle cx="${(x+Math.cos(an)*14).toFixed(1)}" cy="${(y+Math.sin(an)*6).toFixed(1)}" r="${BR&&i===1?3.4:2.6}" fill="${BR&&i===1?BR:B}"/>`;}o.push(s);});
    break;
  case "manz":
    o.push(`<path d="M100 140 C96 120 80 108 66 92 M98 124 C110 106 128 100 140 84 M100 132 C102 110 98 90 104 70" stroke="${t.trunk}" stroke-width="6" stroke-linecap="round" fill="none"/>`,`<path d="M100 140 C96 120 80 108 66 92" stroke="#f3d98a" stroke-width="1" fill="none" stroke-dasharray="3 4"/>`);
    [[64,86],[80,76],[104,64],[124,74],[142,80],[114,90],[86,96]].forEach(([x,y],i)=>o.push(`<ellipse cx="${x}" cy="${y}" rx="8" ry="5" transform="rotate(${i*25} ${x} ${y})" fill="${i%2?L2:L}" ${FS}/>`));
    o.push([[72,94],[132,88],[100,78]].map(([x,y])=>`<path d="M${x} ${y} l0 4" stroke="#8a5a40"/><path d="M${x-3} ${y+4} q3 7 6 0Z" fill="${B}" ${FS}/>`).join(""));
    break;
  case "fern":
    for(let k=0;k<7;k++){const ang=-150+k*20;const rad=ang*Math.PI/180;const x2=100+Math.cos(rad)*62, y2=136+Math.sin(rad)*62;o.push(`<path d="M100 136 Q${(100+x2)/2} ${(136+y2)/2-10} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${L2}" stroke-width="2" fill="none"/>`);
      for(let j=1;j<9;j++){const tt=j/9, px=100+(x2-100)*tt, py=136+(y2-136)*tt-10*Math.sin(Math.PI*tt);o.push(`<path d="M${px.toFixed(1)} ${py.toFixed(1)} l${(Math.cos(rad-1.3)*7*(1-tt*.5)).toFixed(1)} ${(Math.sin(rad-1.3)*7*(1-tt*.5)).toFixed(1)} M${px.toFixed(1)} ${py.toFixed(1)} l${(Math.cos(rad+1.3)*7*(1-tt*.5)).toFixed(1)} ${(Math.sin(rad+1.3)*7*(1-tt*.5)).toFixed(1)}" stroke="${j%2?L:L2}" stroke-width="3" stroke-linecap="round"/>`);}}
    o.push(spiral(100,128,1.2));break;
  case "three":
    o.push(`<path d="M60 140 Q90 100 110 70 M110 70 L140 54 M96 92 L66 80" stroke="#6a4a30" stroke-width="2.4" fill="none"/>`);
    [[110,66,L],[142,50,L2],[66,76,L2],[124,96,L]].forEach(([x,y,c])=>[[-90,0],[-20,10],[-160,10]].forEach(([ang,d])=>{const r=ang*Math.PI/180;const cx=x+Math.cos(r)*(9+d*.4), cy=y+Math.sin(r)*(9+d*.4);o.push(`<path d="M${cx.toFixed(1)} ${cy.toFixed(1)} m-7 0 q2 -9 7 -9 q5 0 7 9 q-3 6 -7 7 q-4 -1 -7 -7Z" transform="rotate(${ang+90} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${c}" ${FS}/>`);}));
    break;
  case "rosette":
    for(let k=0;k<7;k++){const ang=-170+k*27;o.push(`<ellipse cx="${(100+Math.cos(ang*Math.PI/180)*26).toFixed(1)}" cy="${(128+Math.sin(ang*Math.PI/180)*10).toFixed(1)}" rx="22" ry="10" transform="rotate(${ang} ${(100+Math.cos(ang*Math.PI/180)*26).toFixed(1)} ${(128+Math.sin(ang*Math.PI/180)*10).toFixed(1)})" fill="${k%2?L:L2}" ${FS}/>`);}
    o.push(`<path d="M94 122 L90 60 M106 122 L112 66" stroke="#6a7a4a" stroke-width="2.4"/>`,`<rect x="86" y="56" width="8" height="26" rx="4" fill="#8a7a50" ${FS}/><rect x="108" y="62" width="8" height="22" rx="4" fill="#8a7a50" ${FS}/>`);
    break;
  default: /* bloomshrub */
    if(t.vine) o.push(`<rect x="30" y="40" width="140" height="100" fill="#d8c8a8" opacity=".25"/><path d="M30 40 h140" stroke="#f3d98a" stroke-opacity=".5"/>`);
    o.push(bush(L,L2));
    const fl=[[70,98],[96,84],[126,94],[108,112],[84,116],[140,114],[60,118]];
    if(t.ball) fl.slice(0,4).forEach(([x,y])=>o.push(`<circle cx="${x}" cy="${y}" r="12" fill="${B}" ${FS}/>`+dots([[x-5,y-4],[x+4,y-5],[x,y+2],[x-6,y+5],[x+6,y+4]],"#f4f2ea",2,.7)));
    else if(t.cone) fl.slice(0,5).forEach(([x,y])=>o.push(`<path d="M${x-8} ${y+6} L${x} ${y-16} L${x+8} ${y+6}Z" fill="${B}" ${FS}/>`+dots([[x,y-8],[x-3,y],[x+3,y]],"#f4f2ea",1.4,.8)));
    else if(t.spidery) fl.forEach(([x,y])=>{let s="";for(let k=0;k<4;k++){const an=k*Math.PI/2+.4;s+=`<path d="M${x} ${y} q${(Math.cos(an)*4).toFixed(1)} ${(Math.sin(an)*8).toFixed(1)} ${(Math.cos(an)*9).toFixed(1)} ${(Math.sin(an)*9).toFixed(1)}" stroke="${B}" stroke-width="2.2" fill="none"/>`;}o.push(s);});
    else fl.forEach(([x,y],i)=>{const r=t.big?7:5;let s="";for(let k=0;k<5;k++){const an=k*2*Math.PI/5;s+=`<circle cx="${(x+Math.cos(an)*r*.7).toFixed(1)}" cy="${(y+Math.sin(an)*r*.7).toFixed(1)}" r="${r*.55}" fill="${B}" stroke="#f3d98a" stroke-width=".8"/>`;}o.push(s+`<circle cx="${x}" cy="${y}" r="1.6" fill="#f2d84a"/>`);});
  }
  return o.join("");
}
function plantArt(a){
  const k=catKind(a);
  const inner=k==="tree"?treeSVG(a):k==="flower"?`<g transform="translate(100 140) scale(1.28) translate(-100 -140)">${flowerSVG(a)}</g>`:shrubSVG(a);
  return `<svg viewBox="0 0 200 160" role="img" aria-label="Illustration: ${esc(a.name)}" xmlns="http://www.w3.org/2000/svg">${plantFrame(k)}${inner}</svg>`;
}
