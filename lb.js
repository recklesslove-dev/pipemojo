/* Pipe Mojo leaderboard — shared by whack.html, flow.html, mojoroll.html, hotcold.html and mojoblast.html */
(function(){
const API='https://pipemojo-leaderboard.fvidaurri.workers.dev';
const KEY='pm-lb';

function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
function save(a){try{a?localStorage.setItem(KEY,JSON.stringify(a)):localStorage.removeItem(KEY)}catch(e){}}
const listeners=[];
function emit(type){const a=load();listeners.forEach(fn=>{try{fn(type,a)}catch(e){}})}
function switchPlayer(){
  const a=load();if(!a)return false;
  if(!confirm('Switch off '+a.name+' on this device?\n\nYour name and scores stay on the board. You\'ll need '+a.name+'\'s recovery code to sign back in here.'))return false;
  fetch(API+'/signout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:a.token})}).catch(()=>{});
  save(null);emit('signout');return true;
}
/* rank insignia (Flow): a star for every 100 levels cleared */
const TIERS=[
  {name:'Bronze', light:'#f3c08a', mid:'#c4813f', dark:'#6e3f17', edge:'#3b1f08'},
  {name:'Silver', light:'#ffffff', mid:'#c9ced6', dark:'#6b7280', edge:'#2b2f36'},
  {name:'Gold',   light:'#fff1a8', mid:'#e9b93a', dark:'#8a5f10', edge:'#3d2804'},
  {name:'Diamond',light:'#ffffff', mid:'#9fe8ff', dark:'#3aa7d6', edge:'#0b3550', diamond:true}
];
function starPath(cx,cy,R,r){let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r:R;d+=(i?'L':'M')+(cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*Math.sin(a)).toFixed(1)}return d+'Z'}
function bevelStar(cx,cy,R,t){
  const r=R*.42;let g='';
  for(let i=0;i<10;i++){const a1=-Math.PI/2+i*Math.PI/5,a2=-Math.PI/2+(i+1)*Math.PI/5,r1=i%2?r:R,r2=(i+1)%2?r:R;
    const fill=i%2?t.dark:t.light,f2=(i>=3&&i<=6)?(i%2?t.dark:t.mid):fill;
    g+='<path d="M'+cx+' '+cy+'L'+(cx+r1*Math.cos(a1)).toFixed(1)+' '+(cy+r1*Math.sin(a1)).toFixed(1)+'L'+(cx+r2*Math.cos(a2)).toFixed(1)+' '+(cy+r2*Math.sin(a2)).toFixed(1)+'Z" fill="'+f2+'"/>'}
  g+='<path d="'+starPath(cx,cy,R,r)+'" fill="none" stroke="'+t.edge+'" stroke-width="'+(R*.06).toFixed(1)+'" stroke-linejoin="round"/>';
  if(t.diamond)g+='<circle cx="'+(cx-R*.18).toFixed(1)+'" cy="'+(cy-R*.35).toFixed(1)+'" r="'+(R*.07).toFixed(1)+'" fill="#fff"/>';
  return g;
}
function insignia(stars,forceTier){
  const tier=forceTier!=null?forceTier:Math.min(3,Math.floor(Math.max(0,stars-1)/5));
  const count=forceTier!=null?5:stars<=0?0:stars>20?5:((stars-1)%5)+1,t=TIERS[tier];
  const pos=[[100,52],[150,88],[131,146],[69,146],[50,88]];let s='';
  for(let i=0;i<5;i++){const [x,y]=pos[i];
    s+=i<count?bevelStar(x,y,34,t):'<path d="'+starPath(x,y,34,14.3)+'" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2" stroke-dasharray="3 3"/>'}
  if(stars>20&&forceTier==null)s+='<circle cx="100" cy="105" r="21" fill="#0b1f2e" stroke="'+t.mid+'" stroke-width="3"/><text x="100" y="113" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="22" fill="#fff">'+stars+'</text>';
  return '<svg viewBox="0 0 200 200">'+s+'</svg>';
}
/* chevron rank (Whack-a-Pipe): a chevron for every 100 points of your best score */
const CTIERS=[{name:'Bronze',light:'#f3c08a',mid:'#c4813f',dark:'#6e3f17',edge:'#3b1f08'},{name:'Silver',light:'#ffffff',mid:'#c9ced6',dark:'#6b7280',edge:'#2b2f36'},
  {name:'Gold',light:'#fff1a8',mid:'#e9b93a',dark:'#8a5f10',edge:'#3d2804'},{name:'Diamond',light:'#ffffff',mid:'#9fe8ff',dark:'#3aa7d6',edge:'#0b3550'}];
function chevrons(r){
  const tier=Math.min(3,Math.floor(Math.max(0,r-1)/5)),count=r<=0?0:r>20?5:((r-1)%5)+1,t=CTIERS[tier];
  let s='<defs><linearGradient id="cg'+tier+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+t.light+'"/><stop offset=".55" stop-color="'+t.mid+'"/><stop offset="1" stop-color="'+t.dark+'"/></linearGradient></defs>';
  for(let i=0;i<5;i++){const y=150-i*28,d='M28 '+(y+38)+'L100 '+y+'L172 '+(y+38)+'L172 '+(y+58)+'L100 '+(y+20)+'L28 '+(y+58)+'Z';
    s+=i<count?'<path d="'+d+'" fill="url(#cg'+tier+')" stroke="'+t.edge+'" stroke-width="4" stroke-linejoin="round"/>':'<path d="'+d+'" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2" stroke-dasharray="4 4"/>'}
  if(r>20)s+='<circle cx="100" cy="104" r="22" fill="#0b1f2e" stroke="'+t.mid+'" stroke-width="3"/><text x="100" y="112" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="22" fill="#fff">'+r+'</text>';
  return '<svg viewBox="0 0 200 200">'+s+'</svg>';
}
function chevName(r){if(!r)return 'No rank yet';const t=CTIERS[Math.min(3,Math.floor((r-1)/5))].name;return r>20?t+' '+r:t+' · '+(((r-1)%5)+1)+' chevron'+(((r-1)%5)?'s':'')}
/* ---------- Army ranks: officers in Flow (a promotion every boss), enlisted in Whack-a-Pipe (every 100 points) ---------- */
const AR_T=[{light:'#f3c08a',mid:'#c4813f',dark:'#6e3f17',edge:'#3b1f08'},{light:'#ffffff',mid:'#c9ced6',dark:'#6b7280',edge:'#2b2f36'},
  {light:'#fff1a8',mid:'#e9b93a',dark:'#8a5f10',edge:'#3d2804'},{light:'#ffffff',mid:'#9fe8ff',dark:'#3aa7d6',edge:'#0b3550'}];
let arN=0;
function arGrad(t){const id='arg'+(arN++);return {id,def:'<linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+t.light+'"/><stop offset=".5" stop-color="'+t.mid+'"/><stop offset="1" stop-color="'+t.dark+'"/></linearGradient>'}}
function arStarPath(cx,cy,R,r){let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r:R;d+=(i?'L':'M')+(cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*Math.sin(a)).toFixed(1)}return d+'Z'}
function arStar(cx,cy,R,t){
  const r=R*.42;let g='';
  for(let i=0;i<10;i++){const a1=-Math.PI/2+i*Math.PI/5,a2=-Math.PI/2+(i+1)*Math.PI/5,r1=i%2?r:R,r2=(i+1)%2?r:R;
    const fill=i%2?t.dark:t.light,f2=(i>=3&&i<=6)?(i%2?t.dark:t.mid):fill;
    g+='<path d="M'+cx+' '+cy+'L'+(cx+r1*Math.cos(a1)).toFixed(1)+' '+(cy+r1*Math.sin(a1)).toFixed(1)+'L'+(cx+r2*Math.cos(a2)).toFixed(1)+' '+(cy+r2*Math.sin(a2)).toFixed(1)+'Z" fill="'+f2+'"/>'}
  return g+'<path d="'+arStarPath(cx,cy,R,r)+'" fill="none" stroke="'+t.edge+'" stroke-width="'+(R*.07).toFixed(1)+'" stroke-linejoin="round"/>';
}
function arEagle(cx,cy,sc,F,E){
  const wing='M90 98 C72 80 44 66 10 42 L20 64 L6 68 L24 80 L10 88 L32 94 L22 104 L46 104 L40 114 L66 110 L64 120 L88 114Z';
  return '<g transform="translate('+cx+' '+cy+') scale('+sc+') translate(-100 -100)">'+
    '<path d="'+wing+'" fill="'+F+'" stroke="'+E+'" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>'+
    '<path d="'+wing+'" transform="translate(200 0) scale(-1 1)" fill="'+F+'" stroke="'+E+'" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>'+
    '<path d="M86 132 L100 166 L114 132 Z" fill="'+F+'" stroke="'+E+'" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>'+
    '<ellipse cx="100" cy="112" rx="17" ry="26" fill="'+F+'" stroke="'+E+'" stroke-width="3" vector-effect="non-scaling-stroke"/>'+
    '<path d="M92 84 Q100 68 112 76 L122 80 L112 86 Q106 92 96 92Z" fill="'+F+'" stroke="'+E+'" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>'+
    '<path d="M90 104 L110 104 L110 118 Q100 130 90 118Z" fill="none" stroke="'+E+'" stroke-width="2.5" vector-effect="non-scaling-stroke"/>'+
    '<path d="M93 106 V120 M100 106 V126 M107 106 V120" stroke="'+E+'" stroke-width="1.5" vector-effect="non-scaling-stroke" opacity=".7"/></g>';
}
function arColonel(F,E,t){
  const L='M73 58 Q62 52 44 54 Q28 55 19 58 L25 63 L22 66 L28 71 L26 75 L33 79 L32 83 L40 87 L40 91 L48 94 L48 98 L56 101 L57 105 L65 107 L67 111 L76 112 L82 114 L82 90 L78 70 Z';
  const R='transform="translate(200 0) scale(-1 1)"';
  const feathers='<path d="M26 61 Q48 58 70 64 M30 69 Q50 66 72 72 M35 77 Q54 75 74 80 M42 85 Q58 84 76 88 M50 93 Q63 93 77 96 M58 100 Q68 101 78 104" fill="none" stroke="'+E+'" stroke-width="1.6" opacity=".6"/>';
  const wing=(x)=>'<g '+x+'><path d="'+L+'" fill="'+F+'" stroke="'+E+'" stroke-width="3" stroke-linejoin="round"/>'+feathers+'</g>';
  let g=wing('')+wing(R);
  // branch (olive, left) and arrows (right) held in the talons
  g+='<path d="M34 136 L166 136" stroke="'+E+'" stroke-width="7" stroke-linecap="round"/><path d="M34 136 L166 136" stroke="'+F+'" stroke-width="4" stroke-linecap="round"/>';
  for(const x of [38,48,58,68])g+='<ellipse cx="'+x+'" cy="131" rx="5" ry="2.6" transform="rotate(-25 '+x+' 131)" fill="'+F+'" stroke="'+E+'" stroke-width="1.4"/><ellipse cx="'+(x+4)+'" cy="141" rx="5" ry="2.6" transform="rotate(25 '+(x+4)+' 141)" fill="'+F+'" stroke="'+E+'" stroke-width="1.4"/>';
  for(const x of [140,150,160])g+='<path d="M'+x+' 136 l6 -6 M'+x+' 136 l6 6" stroke="'+E+'" stroke-width="2"/>';
  g+='<path d="M166 136 l-6 -4 v8 z" fill="'+F+'" stroke="'+E+'" stroke-width="1.4"/>';
  // body, talons, shield, head
  g+='<path d="M84 112 Q84 132 92 138 L108 138 Q116 132 116 112 Z" fill="'+F+'" stroke="'+E+'" stroke-width="3"/>'+
     '<path d="M84 132 q2 8 8 6 q2 -6 -2 -8 Z M116 132 q-2 8 -8 6 q-2 -6 2 -8 Z" fill="'+F+'" stroke="'+E+'" stroke-width="2"/>'+
     '<path d="M82 86 L118 86 L118 116 Q118 125 100 130 Q82 125 82 116 Z" fill="'+F+'" stroke="'+E+'" stroke-width="3" stroke-linejoin="round"/>'+
     '<path d="M83 96 H117 M84 89 H116 M84 92 H116" stroke="'+E+'" stroke-width="1.2" opacity=".7"/>'+
     '<path d="M86 99 V120 M90.5 99 V124 M95 99 V126 M99.5 99 V127 M104 99 V126 M108.5 99 V124 M113 99 V120" stroke="'+E+'" stroke-width="1.6" opacity=".75"/>'+
     '<path d="M88 86 L86 70 Q85 62 88 58 L80 60 Q79 55 86 52 Q95 46 104 50 Q110 55 108 64 L112 86 Z" fill="'+F+'" stroke="'+E+'" stroke-width="3" stroke-linejoin="round"/>'+
     '<path d="M80 60 Q80 64 84 62" fill="none" stroke="'+E+'" stroke-width="2"/><circle cx="92" cy="55" r="1.8" fill="'+E+'"/>'+
     '<path d="M92 66 q4 3 8 0 M90 72 q5 3 10 0 M91 78 q5 3 10 0" fill="none" stroke="'+E+'" stroke-width="1.2" opacity=".6"/>';
  return '<g transform="translate(0 4)">'+g+'</g>';
}
const OFFICER=['Second Lieutenant','First Lieutenant','Captain','Major','Lieutenant Colonel','Colonel','Brigadier General','Major General','Lieutenant General','General','General of the Army'];
const officerTier=s=>s>=20?3:s>=17?2:s>=14?1:0;
function officerName(s){if(s<1)return 'No rank yet';if(s<11)return OFFICER[s-1];return ['','Silver ','Gold ','Diamond '][officerTier(s)]+'General of the Army'}
function armyOfficer(s){
  if(s<1)return '';
  const gold=s===1||s===4,t=gold?AR_T[2]:AR_T[1],g=arGrad(t),F='url(#'+g.id+')',E=t.edge;let body='';
  if(s<=3){ // lieutenant and captain bars
    const bar=x=>'<rect x="'+x+'" y="30" width="44" height="140" rx="7" fill="'+F+'" stroke="'+E+'" stroke-width="4"/><rect x="'+(x+8)+'" y="38" width="8" height="124" rx="4" fill="rgba(255,255,255,.55)"/>';
    body=s<3?bar(78):bar(40)+bar(116)+'<rect x="82" y="44" width="36" height="10" fill="'+F+'" stroke="'+E+'" stroke-width="2"/><rect x="82" y="146" width="36" height="10" fill="'+F+'" stroke="'+E+'" stroke-width="2"/>';
  }else if(s<=5){ // major and lieutenant colonel: the faceted oak leaf
    const C=[101,100],ring=[[101,14],[126,43],[169,48],[164,82],[183,112],[155,130],[152,160],[112,151],[90,151],[54,160],[47,131],[17,115],[35,87],[26,52],[68,47]];
    let f='';for(let i=0;i<ring.length;i++){const p=ring[i],q=ring[(i+1)%ring.length];
      f+='<path d="M'+C[0]+' '+C[1]+'L'+p[0]+' '+p[1]+'L'+q[0]+' '+q[1]+'Z" fill="'+(i%2?t.dark:t.light)+'" stroke="'+t.mid+'" stroke-width=".8"/>'}
    body='<path d="M92 148 L86 186 Q96 192 104 186 L110 148Z" fill="'+F+'" stroke="'+E+'" stroke-width="3" stroke-linejoin="round"/><ellipse cx="95" cy="186" rx="9" ry="4" fill="'+t.dark+'"/>'+
      f+'<path d="M'+ring.map(p=>p.join(' ')).join(' L')+' Z" fill="none" stroke="'+E+'" stroke-width="4" stroke-linejoin="round"/>';
  }else if(s===6){body=arColonel(F,E,t)} // colonel: the eagle
  else if(s<=10){const row=[[[100,62]],[[56,42],[144,42]],[[36,31],[100,31],[164,31]],[[25,23],[75,23],[125,23],[175,23]]][s-7];for(const [x,R] of row)body+=arStar(x,104,R,AR_T[1])} // generals: a row of stars
  else{ // General of the Army: five stars in a pentagon, then Silver, Gold and Diamond finishes
    const tt=AR_T[officerTier(s)],pos=[[100,52],[150,88],[131,146],[69,146],[50,88]];for(const [x,y] of pos)body+=arStar(x,y,34,tt);
    if(s>20)body+='<circle cx="100" cy="105" r="21" fill="#0b1f2e" stroke="'+tt.mid+'" stroke-width="3"/><text x="100" y="113" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="22" fill="#fff">'+s+'</text>';
  }
  return '<svg viewBox="0 0 200 200"><defs>'+g.def+'</defs>'+body+'</svg>';
}
const ENLISTED=['Private','Private First Class','Specialist','Corporal','Sergeant','Staff Sergeant','Sergeant First Class','Master Sergeant','First Sergeant','Sergeant Major','Command Sergeant Major','Sergeant Major of the Army'];
const enlistedTier=r=>r>=21?3:r>=18?2:r>=15?1:0;
function enlistedName(r){if(r<1)return 'No rank yet';if(r<12)return ENLISTED[r-1];return ['','Silver ','Gold ','Diamond '][enlistedTier(r)]+'Sergeant Major of the Army'}
function armyEnlisted(r){
  if(r<1)return '';
  const idx=Math.min(12,r),t=r>=12&&enlistedTier(r)?AR_T[enlistedTier(r)]:{light:'#fff2a8',mid:'#f2cf4a',dark:'#b8902a',edge:'#163a16'};
  const g=arGrad(t),F='url(#'+g.id+')',E=t.edge,GREEN='#1d4a22',GEDGE='#0d2a10';
  const wrap=b=>'<svg viewBox="0 0 200 200"><defs>'+g.def+'</defs>'+b+'</svg>';
  if(idx===3)return wrap('<path d="M100 180 Q56 134 42 86 Q34 48 68 32 Q100 22 132 32 Q166 48 158 86 Q144 134 100 180Z" fill="'+GREEN+'" stroke="'+GEDGE+'" stroke-width="4"/>'+arEagle(100,88,.56,F,E)); // specialist: green shield, gold eagle
  const chev=a=>'<path d="M30 '+(a+40)+'L100 '+a+'L170 '+(a+40)+'L170 '+(a+54)+'L100 '+(a+14)+'L30 '+(a+54)+'Z" fill="'+F+'" stroke="'+E+'" stroke-width="2.5" stroke-linejoin="round"/>';
  const rock=Y=>'<path d="M30 '+Y+'Q100 '+(Y+36)+' 170 '+Y+'L170 '+(Y+14)+'Q100 '+(Y+50)+' 30 '+(Y+14)+'Z" fill="'+F+'" stroke="'+E+'" stroke-width="2.5" stroke-linejoin="round"/>';
  const nChev=idx<=2?1:idx===4?2:3,nRock=idx===2||idx===6?1:idx===7?2:idx>=8?3:0;
  const last=(nChev-1)*20,rStart=nChev===3?98:last+56,lastR=rStart+(nRock-1)*20;
  // the green backing patch behind the stripes
  let b=nRock?'<path d="M20 '+44+'L100 -10 L180 44 L180 '+(lastR+20)+'Q100 '+(lastR+66)+' 20 '+(lastR+20)+'Z" fill="'+GREEN+'" stroke="'+GEDGE+'" stroke-width="4" stroke-linejoin="round"/>'
             :'<path d="M20 44 L100 -10 L180 44 L180 '+(last+62)+'L100 '+(last+22)+'L20 '+(last+62)+'Z" fill="'+GREEN+'" stroke="'+GEDGE+'" stroke-width="4" stroke-linejoin="round"/>';
  for(let i=0;i<nChev;i++)b+=chev(i*20);
  for(let j=0;j<nRock;j++)b+=rock(rStart+j*20);
  if(idx===9)b+='<path d="M100 62 L115 79 L100 96 L85 79Z" fill="'+F+'" stroke="'+E+'" stroke-width="2.5"/>';
  if(idx===10)b+=arStar(100,78,16,t);
  if(idx===11)b+=arStar(100,76,12,t)+'<path d="M80 70 Q78 94 100 98 Q122 94 120 70" fill="none" stroke="'+F+'" stroke-width="5" stroke-linecap="round"/>';
  if(idx===12)b+=arEagle(100,80,.3,F,E)+arStar(74,82,7,t)+arStar(126,82,7,t);
  const top=-12,h=(nRock?lastR+56:last+64)-top;
  return wrap('<g transform="translate(0 '+((200-h)/2-top).toFixed(1)+')">'+b+'</g>');
}
/* ---------- the K Club badge: platinum and diamond, 1K at level 1000, then 2K, 3K... ---------- */
function badgeK(k){
  k=Math.max(1,k|0);
  const glint=(x,y,s,d)=>'<path d="M'+x+' '+(y-s)+' L'+(x+s*.22)+' '+(y-s*.22)+' L'+(x+s)+' '+y+' L'+(x+s*.22)+' '+(y+s*.22)+' L'+x+' '+(y+s)+' L'+(x-s*.22)+' '+(y+s*.22)+' L'+(x-s)+' '+y+' L'+(x-s*.22)+' '+(y-s*.22)+'Z" fill="#fff" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.15;.3;1" dur="3s" begin="'+d+'s" repeatCount="indefinite"/></path>';
  let leaves='';
  for(const side of [1,-1])for(let i=0;i<7;i++){const a=(side>0?-50+i*15:130+i*15)*Math.PI/180,x=100+57*Math.cos(a),y=98+57*Math.sin(a);
    leaves+='<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="8" ry="3.6" transform="rotate('+((a*180/Math.PI)+90*side).toFixed(0)+' '+x.toFixed(1)+' '+y.toFixed(1)+')" fill="url(#kpl)" stroke="#2b3440" stroke-width="1"/>'}
  const t=k+'K',fs=t.length>2?50:62;
  return '<svg viewBox="0 0 200 200"><defs>'+
    '<linearGradient id="kpl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".28" stop-color="#cfd9e6"/><stop offset=".45" stop-color="#f7fbff"/><stop offset=".62" stop-color="#8fa3ba"/><stop offset=".8" stop-color="#e9f1fa"/><stop offset="1" stop-color="#7d90a8"/></linearGradient>'+
    '<radialGradient id="kin" cx=".5" cy=".36" r=".64"><stop offset="0" stop-color="#1d2a44"/><stop offset="1" stop-color="#060912"/></radialGradient>'+
    '<linearGradient id="kgem" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#bff3ff"/><stop offset="1" stop-color="#2f9fd6"/></linearGradient>'+
    '<linearGradient id="krb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b8be0"/><stop offset="1" stop-color="#173f86"/></linearGradient></defs>'+
    '<circle cx="100" cy="96" r="86" fill="url(#kpl)" stroke="#2b3440" stroke-width="5"/><circle cx="100" cy="96" r="72" fill="url(#kin)" stroke="#2b3440" stroke-width="3"/>'+
    '<circle cx="100" cy="96" r="72" fill="none" stroke="#9fe8ff" stroke-width="1.5" opacity=".45"/>'+leaves+
    // the diamond on top
    '<path d="M86 44 L92 34 L108 34 L114 44 L100 60Z" fill="url(#kgem)" stroke="#0b3550" stroke-width="2" stroke-linejoin="round"/>'+
    '<path d="M86 44 L114 44 M92 34 L96 44 L100 60 L104 44 L108 34 M96 44 L100 34 L104 44" fill="none" stroke="#0b3550" stroke-width="1" opacity=".7"/>'+
    '<text x="100" y="'+(118-(62-fs)/3)+'" text-anchor="middle" font-family="\'Pirata One\', Georgia, serif" font-size="'+fs+'" font-weight="700" fill="url(#kpl)" stroke="#2b3440" stroke-width="2">'+t+'</text>'+
    '<path d="M26 148 L174 148 L164 163 L174 178 L26 178 L36 163Z" fill="url(#krb)" stroke="#0b2350" stroke-width="3" stroke-linejoin="round"/>'+
    '<text x="100" y="170" text-anchor="middle" font-family="Nunito, system-ui, sans-serif" font-size="19" font-weight="900" letter-spacing="4" fill="#f4f8ff">CLUB</text>'+
    glint(52,40,9,0)+glint(150,62,7,1.1)+glint(112,36,6,2)+glint(70,108,5,.6)+'</svg>';
}
function badge1k(){return badgeK(1)}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function call(path,body){
  let r;
  try{
    r=await fetch(API+path,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});
  }catch(e){const err=new Error('Can\'t reach the leaderboard. Check your connection and try again.');err.status=0;throw err}
  let d={};try{d=await r.json()}catch(e){}
  if(!r.ok){const err=new Error(d.error||'Leaderboard error. Try again.');err.status=r.status;throw err}
  return d;
}

const CSS=`
.lb{width:100%;max-width:340px;margin:16px auto 0;text-align:left;font-family:Nunito,system-ui,-apple-system,sans-serif}
.lb h3{font-family:'Pirata One',Georgia,serif;font-weight:400;font-size:1.6rem;line-height:1;color:#f5c842;margin:0 0 8px}
.lb ol{list-style:none;margin:0;padding:0;border:1px solid rgba(255,255,255,.1);border-radius:10px;overflow:hidden}
.lb li{display:flex;align-items:center;gap:10px;padding:7px 12px;font-weight:700;font-size:.95rem;background:rgba(255,255,255,.03)}
.lb li:nth-child(odd){background:rgba(255,255,255,.06)}
.lb li .r{width:1.6em;color:rgba(255,255,255,.45);font-variant-numeric:tabular-nums}
.lb li .n{flex:1;min-width:0;display:flex;align-items:center;gap:4px;white-space:nowrap}
.lb li .n .nm{min-width:0;overflow:hidden;text-overflow:ellipsis}
.lb li .n .ri,.lb li .n .k1,.lb li .n .fl{flex:none}
.lb li .s{font-variant-numeric:tabular-nums;color:#00e5ff}
.lb .ri{display:inline-block;width:20px;height:20px;margin-right:2px}
.lb .ri svg{width:100%;height:100%}
.lb .k1{display:inline-block;width:20px;height:20px}
.lb .k1 svg{width:100%;height:100%}
.lb .fl{font-size:.74rem;font-weight:800;color:#ffb347;white-space:nowrap}
.lb li.me{background:rgba(0,229,255,.14);box-shadow:inset 3px 0 0 #00e5ff}
.lb li:first-child .r{color:#f5c842}
.lb .empty{padding:12px;color:rgba(255,255,255,.55);font-size:.9rem}
.lb .me-line{margin:0 0 8px;color:rgba(255,255,255,.75);font-size:.92rem}
.lb .me-line b{color:#fff}
.lb form{display:grid;gap:8px;margin:0 0 12px}
.lb label{font-size:.85rem;font-weight:700;color:rgba(255,255,255,.75)}
.lb input{font:inherit;font-size:16px;font-weight:700;width:100%;padding:10px 12px;border-radius:9px;border:1.5px solid rgba(255,255,255,.2);
  background:#0d0910;color:#fff;-webkit-user-select:text;user-select:text}
.lb input:focus{outline:none;border-color:#00e5ff}
.lb .row{display:flex;gap:8px}
.lb button{font:inherit;font-weight:800;font-size:.95rem;border:0;border-radius:9px;padding:10px 14px;cursor:pointer;background:#00e5ff;color:#000}
.lb button.alt{background:transparent;color:#00e5ff;padding:4px 0;font-size:.85rem;text-decoration:underline;text-underline-offset:3px}
.lb button:disabled{opacity:.5}
.lb .me-line .switch{margin-left:6px;padding:0;font-size:.8rem;color:rgba(255,255,255,.55)}
.lb .err{color:#ff7a70;font-size:.88rem;font-weight:700;margin:0 0 8px}
.lb .code{border:1.5px solid #f5c842;border-radius:10px;padding:12px;margin:0 0 12px;background:rgba(245,200,66,.08)}
.lb .code p{margin:0 0 8px;font-size:.88rem;line-height:1.4;color:rgba(255,255,255,.85)}
.lb .code strong{display:block;font-size:1.5rem;letter-spacing:2px;color:#f5c842;margin:0 0 10px;-webkit-user-select:text;user-select:text}
`;
let cssDone=false;
function addCss(){if(cssDone)return;cssDone=true;const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s)}

/* Warrant Officer rank (Mojo Roll): a promotion every 24 wrenches */
const WARRANT=['Warrant Officer 1','Chief Warrant Officer 2','Chief Warrant Officer 3','Chief Warrant Officer 4','Chief Warrant Officer 5'];
function warrantName(r){return r<1?'No rank yet':WARRANT[Math.min(5,r)-1]}
let wgN=0;
function armyWarrant(r){
  if(r<1)return '';r=Math.min(5,r);const id='wg'+(wgN++);
  let s='<svg viewBox="0 0 200 200"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#c9ced6"/><stop offset="1" stop-color="#6b7280"/></linearGradient></defs>'+
    '<rect x="64" y="14" width="72" height="172" rx="10" fill="url(#'+id+')" stroke="#2b2f36" stroke-width="5"/><rect x="74" y="24" width="12" height="152" rx="6" fill="rgba(255,255,255,.55)"/>';
  if(r===5)s+='<rect x="93" y="30" width="14" height="140" rx="3" fill="#15171c"/>';
  else{const gap=152/r;for(let k=0;k<r;k++){const cy=24+gap*(k+.5);s+='<rect x="84" y="'+(cy-16).toFixed(1)+'" width="32" height="32" rx="3" fill="#15171c"/>'}}
  return s+'</svg>';
}
/* Trade rank (Hot & Cold): a promotion for every inspection passed (every 25 jobs) */
const TRADE=['Helper','Apprentice I','Apprentice II','Apprentice III','Apprentice IV','Journeyman','Lead Journeyman','Foreman','Superintendent','Master Plumber','Plumbing Contractor'];
const tradeTier=r=>r>=20?3:r>=17?2:r>=14?1:0;
function tradeName(r){if(r<1)return 'No rank yet';if(r<11)return TRADE[r-1];return ['','Silver ','Gold ','Diamond '][tradeTier(r)]+'Plumbing Contractor'}
/* pin-badge look: beveled metal rim, colored enamel field, one bold metal symbol per tier */
const TR_M={copper:{light:'#ffd6a8',mid:'#d4884a',dark:'#7a3f16',edge:'#3b1f08'},silver:{light:'#ffffff',mid:'#cfd5de',dark:'#6b7482',edge:'#23272e'},
  gold:{light:'#fff4b0',mid:'#efc23e',dark:'#8f6210',edge:'#3d2804'},diamond:{light:'#ffffff',mid:'#a6ecff',dark:'#2f9bd0',edge:'#0b3550'}};
const TR_E={navy:['#3567c9','#0c1d45'],oxblood:['#b02a36','#3a0610'],black:['#46404f','#0b0a10'],royal:['#4a5ce0','#0d1450'],ruby:['#d42a47','#400614'],ice:['#2a78b0','#061a33']};
const TR_SH='M100 12 L174 34 L174 96 Q174 156 100 190 Q26 156 26 96 L26 34Z';
let tgN=0;
const trAt=(s,x,y)=>'translate('+x+' '+y+') scale('+s+') translate(-100 -100)';
function trStar(cx,cy,R,m){ // faceted star, lit from the top left
  let g='';const r=R*.42,pt=i=>{const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r:R;return (cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*Math.sin(a)).toFixed(1)};
  for(let i=0;i<10;i++)g+='<path d="M'+cx+' '+cy+'L'+pt(i)+'L'+pt(i+1)+'Z" fill="'+(i%2?m.dark:(i>=4&&i<=6?m.mid:m.light))+'"/>';
  let d='';for(let i=0;i<10;i++)d+=(i?'L':'M')+pt(i);
  return g+'<path d="'+d+'Z" fill="none" stroke="'+m.edge+'" stroke-width="'+Math.max(2,R*.1).toFixed(1)+'" stroke-linejoin="round"/>';
}
function trWrench(F,B,E){ // a chunky pipe wrench, pointing up, about 130 tall
  const s=' stroke="'+E+'" stroke-width="3" stroke-linejoin="round"';
  return '<rect x="-6" y="-60" width="12" height="36"'+' fill="'+F+'"'+s+'/>'+
    '<path d="M-7 -67 L31 -67 L31 -51 L15 -51 L15 -47 L-7 -47Z" fill="'+F+'"'+s+'/>'+
    '<path d="M15 -47 l3 4 l3 -4 l3 4 l3 -4 l4 0" fill="none" stroke="'+E+'" stroke-width="2"/>'+
    '<rect x="-13" y="-34" width="26" height="30" rx="3" fill="'+F+'"'+s+'/>'+
    '<path d="M11 -40 L31 -40 L31 -31 L11 -31Z" fill="'+F+'"'+s+'/>'+
    '<path d="M15 -40 l3 -4 l3 4 l3 -4 l3 4 l4 0" fill="none" stroke="'+E+'" stroke-width="2"/>'+
    '<rect x="-15" y="-27" width="30" height="11" rx="2" fill="'+B+'"'+s+'/>'+
    '<path d="M-9 -26 v9 M-4 -26 v9 M1 -26 v9 M6 -26 v9 M11 -26 v9" stroke="'+E+'" stroke-width="1.5" opacity=".7"/>'+
    '<path d="M-9 -4 L9 -4 L7 58 Q7 67 0 67 Q-7 67 -7 58Z" fill="'+F+'"'+s+'/>'+
    '<rect x="-4" y="2" width="3.5" height="48" rx="1.7" fill="#fff" opacity=".45"/>'+
    '<circle cx="0" cy="56" r="3.5" fill="'+E+'"/>';
}
const trOne=(x,y,sc,rot,F,B,E)=>'<g transform="translate('+x+' '+y+') rotate('+rot+') scale('+sc+')">'+trWrench(F,B,E)+'</g>';
const trCross=(x,y,sc,F,B,E)=>'<g transform="translate('+x+' '+y+') rotate(-34) scale('+(-sc)+' '+sc+')">'+trWrench(F,B,E)+'</g>'+trOne(x,y,sc,34,F,B,E); // jaws facing out
function trWreath(a0,a1,cx,cy,R,F,E){ // two laurel branches climbing from the bottom
  let g='';
  for(const side of [1,-1]){
    const P=a=>[cx+side*R*Math.cos(a*Math.PI/180),cy+R*Math.sin(a*Math.PI/180)];
    let d='';for(let a=a0;a<=a1;a+=4){const p=P(a);d+=(d?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)}
    g+='<path d="'+d+'" fill="none" stroke="'+E+'" stroke-width="5" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="'+F+'" stroke-width="2.5" stroke-linecap="round"/>';
    let k=0;for(let a=a0+6;a<=a1;a+=11,k++){const p=P(a),tang=side>0?(a+90):(180-a-90);
      for(const o of [-1,1]){const ang=tang+o*38;
        g+='<ellipse cx="0" cy="0" rx="9.5" ry="4.2" transform="translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+') rotate('+ang.toFixed(0)+') translate(9 0)" fill="'+F+'" stroke="'+E+'" stroke-width="1.6"/>'}}
  }
  return g;
}
function trShield(F,B,N,E,inner){
  return '<path d="'+TR_SH+'" fill="rgba(0,0,0,.45)" transform="translate(4 5)"/>'+
    '<path d="'+TR_SH+'" fill="'+F+'" stroke="'+E+'" stroke-width="5" stroke-linejoin="round"/>'+
    '<path d="'+TR_SH+'" transform="'+trAt(.9,100,100)+'" fill="'+B+'" stroke="'+E+'" stroke-width="1.5" stroke-linejoin="round"/>'+
    '<path d="'+TR_SH+'" transform="'+trAt(.8,100,100)+'" fill="'+N+'" stroke="'+E+'" stroke-width="3" stroke-linejoin="round"/>'+
    '<path d="M33 38 L100 18 L100 24 L38 42 L38 92 L33 92Z" fill="#fff" opacity=".4"/>'+inner;
}
function trWings(F,E){
  let w='';const T=[[4,40],[6,60],[12,80],[22,98],[36,112]];
  for(let i=T.length-1;i>=0;i--){const [tx,ty]=T[i],y0=58+i*11;
    w+='<path d="M74 '+y0+' Q'+((74+tx)/2).toFixed(0)+' '+(Math.min(y0,ty)-8)+' '+tx+' '+ty+' Q'+(tx+2)+' '+(ty+9)+' '+(tx+12)+' '+(ty+9)+' L74 '+(y0+15)+'Z" fill="'+F+'" stroke="'+E+'" stroke-width="3" stroke-linejoin="round"/>'}
  return '<g>'+w+'</g><g transform="translate(200 0) scale(-1 1)">'+w+'</g>';
}
function trValve(cx,cy,R,F,B,N,E){ // the handwheel
  let g='';for(let i=0;i<8;i++){const a=i*Math.PI/4;g+='<circle cx="'+(cx+R*Math.cos(a)).toFixed(1)+'" cy="'+(cy+R*Math.sin(a)).toFixed(1)+'" r="'+(R*.2).toFixed(1)+'" fill="'+F+'" stroke="'+E+'" stroke-width="2.5"/>'}
  g+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="'+F+'" stroke="'+E+'" stroke-width="3"/><circle cx="'+cx+'" cy="'+cy+'" r="'+(R*.72).toFixed(1)+'" fill="'+N+'" stroke="'+E+'" stroke-width="2.5"/>';
  for(let i=0;i<4;i++)g+='<rect x="'+(cx-R*.12).toFixed(1)+'" y="'+(cy-R*.78).toFixed(1)+'" width="'+(R*.24).toFixed(1)+'" height="'+(R*1.56).toFixed(1)+'" fill="'+F+'" stroke="'+E+'" stroke-width="2" transform="rotate('+(45+i*90)+' '+cx+' '+cy+')"/>';
  g+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(R*.32).toFixed(1)+'" fill="'+B+'" stroke="'+E+'" stroke-width="2.5"/><circle cx="'+cx+'" cy="'+cy+'" r="'+(R*.11).toFixed(1)+'" fill="'+E+'"/>';
  return g;
}
function tradeBadge(r){
  if(r<1)return '';
  const tier=tradeTier(r),boss=r>=11;
  const m=boss?TR_M[['gold','silver','gold','diamond'][tier]]:r>=8?TR_M.gold:r>=6?TR_M.silver:TR_M.copper;
  const en=TR_E[boss?['black','royal','ruby','ice'][tier]:r>=8?'black':r>=6?'oxblood':'navy'];
  const id='tb'+(tgN++),F='url(#'+id+'m)',B='url(#'+id+'b)',N='url(#'+id+'e)',E=m.edge;
  const defs='<defs><linearGradient id="'+id+'m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+m.light+'"/><stop offset=".5" stop-color="'+m.mid+'"/><stop offset="1" stop-color="'+m.dark+'"/></linearGradient>'+
    '<linearGradient id="'+id+'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+m.dark+'"/><stop offset=".55" stop-color="'+m.mid+'"/><stop offset="1" stop-color="'+m.light+'"/></linearGradient>'+
    '<radialGradient id="'+id+'e" cx=".45" cy=".35" r=".75"><stop offset="0" stop-color="'+en[0]+'"/><stop offset="1" stop-color="'+en[1]+'"/></radialGradient></defs>';
  let g='';
  if(r===1){ // Helper: not a shield yet, a copper disk with a mop in a bucket
    g='<circle cx="104" cy="105" r="86" fill="rgba(0,0,0,.45)"/><circle cx="100" cy="100" r="86" fill="'+F+'" stroke="'+E+'" stroke-width="5"/>'+
      '<circle cx="100" cy="100" r="77" fill="'+B+'" stroke="'+E+'" stroke-width="1.5"/><circle cx="100" cy="100" r="68" fill="'+N+'" stroke="'+E+'" stroke-width="3"/>'+
      '<path d="M40 70 A66 66 0 0 1 100 22 L100 30 A58 58 0 0 0 47 72Z" fill="#fff" opacity=".4"/>'+
      '<g transform="rotate(24 100 100)"><rect x="95" y="26" width="10" height="92" rx="4" fill="'+F+'" stroke="'+E+'" stroke-width="3"/><rect x="97.5" y="32" width="3" height="76" rx="1.5" fill="#fff" opacity=".45"/></g>'+
      '<path d="M62 106 Q100 72 138 106" fill="none" stroke="'+E+'" stroke-width="7" stroke-linecap="round"/><path d="M62 106 Q100 72 138 106" fill="none" stroke="'+F+'" stroke-width="3.5" stroke-linecap="round"/>'+
      '<path d="M58 104 L142 104 L132 152 Q100 160 68 152Z" fill="'+F+'" stroke="'+E+'" stroke-width="3.5" stroke-linejoin="round"/>'+
      '<rect x="54" y="98" width="92" height="12" rx="4" fill="'+B+'" stroke="'+E+'" stroke-width="3"/>'+
      '<path d="M66 124 L134 124 M68 138 L132 138" stroke="'+E+'" stroke-width="2.5" opacity=".6"/><path d="M66 114 L70 146" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>';
  }else if(r<=5){ // Apprentice I to IV: copper shield, one wrench, a chevron per level
    let ch='';const HW=[44,36,28,20];
    for(let i=0;i<r-1;i++){const y=117+i*10,hw=HW[i];ch+='<path d="M'+(100-hw)+' '+(y+11)+' L100 '+y+' L'+(100+hw)+' '+(y+11)+' L'+(100+hw)+' '+(y+18)+' L100 '+(y+7)+' L'+(100-hw)+' '+(y+18)+'Z" fill="'+F+'" stroke="'+E+'" stroke-width="2.5" stroke-linejoin="round"/>'}
    g=trShield(F,B,N,E,trOne(100,r>2?74:80,.78,45,F,B,E)+ch);
  }else if(r<=7){ // Journeyman: silver shield, crossed wrenches; Lead Journeyman adds a rocker
    const lead=r===7;
    g=trShield(F,B,N,E,trCross(100,lead?90:102,lead?.66:.8,F,B,E)+
      (lead?'<path d="M66 138 Q100 162 134 138 L134 149 Q100 173 66 149Z" fill="'+F+'" stroke="'+E+'" stroke-width="2.5" stroke-linejoin="round"/>':''));
  }else if(r<=10){ // Foreman: gold, hard hat; Superintendent adds half a wreath; Master Plumber gets the full wreath and a star
    const sc=r===8?.86:.76;
    if(r>=9)g+=trWreath(100,r===10?236:192,100,112,86,F,E);
    g+='<g transform="'+trAt(sc,100,r===8?120:118)+'">'+trShield(F,B,N,E,trCross(100,102,.8,F,B,E))+'</g>';
    if(r<10)g+='<g transform="translate(0 '+(r===8?8:14)+')"><path d="M70 36 Q70 4 100 4 Q130 4 130 36Z" fill="'+F+'" stroke="'+E+'" stroke-width="3.5" stroke-linejoin="round"/>'+
      '<path d="M93 6 Q100 4 107 6 L107 34 L93 34Z" fill="'+B+'" stroke="'+E+'" stroke-width="2.5"/><rect x="58" y="32" width="84" height="10" rx="5" fill="'+F+'" stroke="'+E+'" stroke-width="3.5"/>'+
      '<path d="M78 30 Q78 14 92 9" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".5"/></g>';
    else g+=trStar(100,28,27,m);
  }else{ // Plumbing Contractor: winged shield, handwheel, wreath, star; then Silver, Gold and Diamond plating
    if(tier>=2){let ry='';for(let i=0;i<16;i++){const a=i*Math.PI/8;ry+='<path d="M100 104 L'+(100+90*Math.cos(a-.08)).toFixed(1)+' '+(104+90*Math.sin(a-.08)).toFixed(1)+' L'+(100+90*Math.cos(a+.08)).toFixed(1)+' '+(104+90*Math.sin(a+.08)).toFixed(1)+'Z"/>'}
      g+='<g fill="'+m.mid+'" opacity=".5">'+ry+'</g>'}
    g+=trWreath(98,150,100,112,78,F,E)+trWings(F,E)+
      '<g transform="'+trAt(.64,100,112)+'">'+trShield(F,B,N,E,trValve(100,100,40,F,B,N,E))+'</g>'+trStar(100,30,22,m);
    if(tier===3){const gl=(x,y,s,d)=>'<path d="M'+x+' '+(y-s)+'L'+(x+s*.22)+' '+(y-s*.22)+'L'+(x+s)+' '+y+'L'+(x+s*.22)+' '+(y+s*.22)+'L'+x+' '+(y+s)+'L'+(x-s*.22)+' '+(y+s*.22)+'L'+(x-s)+' '+y+'L'+(x-s*.22)+' '+(y-s*.22)+'Z" fill="#fff" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.15;.3;1" dur="3s" begin="'+d+'s" repeatCount="indefinite"/></path>';
      g+=gl(30,52,10,0)+gl(164,96,8,1.1)+gl(118,22,7,2)+gl(84,136,6,.6)}
  }
  return '<svg viewBox="0 0 200 200">'+defs+g+'</svg>';
}
/* the insignia next to a name: officers in Flow, enlisted in Whack-a-Pipe, warrant officers in Mojo Roll, trade ranks in Hot & Cold */
/* Marksmanship (Mojo Blast): your best run score earns Marksman, Sharpshooter or Expert, plus qualification bars */
const MK_AT=[10000,20000,35000,50000,70000,90000,120000,150000,180000,210000,230000,250000,270000];
const MK_N=['Marksman','Marksman · Rifle','Marksman · Rifle, Pistol','Sharpshooter','Sharpshooter · Rifle','Sharpshooter · Rifle, Pistol',
  'Expert','Expert · Rifle','Expert · Rifle, Pistol','Expert · Rifle, Pistol, Grenade','Silver Expert','Gold Expert','Diamond Expert'];
const marksRank=b=>MK_AT.filter(t=>(+b||0)>=t).length;
function marksName(r){return r<1?'No rank yet':MK_N[Math.min(13,r)-1]}
const MK_M={pewter:{light:'#f1f3f5',mid:'#a9afb7',dark:'#5b6169',edge:'#23262b'},silver:{light:'#ffffff',mid:'#d9dee6',dark:'#7c8594',edge:'#23272e'},
  gold:{light:'#fff4b0',mid:'#efc23e',dark:'#8f6210',edge:'#3d2804'},diamond:{light:'#ffffff',mid:'#a6ecff',dark:'#2f9bd0',edge:'#0b3550'}};
let mkN=0;
function mkWreath(cx,cy,R,F,E){let g='';
  for(const side of [1,-1]){const P=a=>[cx+side*R*Math.cos(a*Math.PI/180),cy+R*Math.sin(a*Math.PI/180)];
    let d='';for(let a=-50;a<=86;a+=4){const p=P(a);d+=(d?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)}
    g+='<path d="'+d+'" fill="none" stroke="'+E+'" stroke-width="4.5" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="'+F+'" stroke-width="2.2" stroke-linecap="round"/>';
    for(let a=-44;a<=80;a+=12){const p=P(a),tang=side>0?(a+90):(180-a-90);
      for(const o of [-1,1])g+='<ellipse cx="0" cy="0" rx="8" ry="3.6" transform="translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+') rotate('+(tang+o*38).toFixed(0)+') translate(8 0)" fill="'+F+'" stroke="'+E+'" stroke-width="1.4"/>'}}
  return g;
}
function marksBadge(r){
  if(r<1)return '';r=Math.min(13,r);
  const tier=r>=13?'diamond':r>=12?'gold':r>=11?'silver':'pewter',m=MK_M[tier],id='mk'+(mkN++);
  const kind=r<=3?0:r<=6?1:2,bars=r<=3?r-1:r<=6?r-4:r<=10?r-7:3,BN=['RIFLE','PISTOL','GRENADE'];
  const cx=100,cy=bars?(kind===2?58:62):98,R=bars?(kind===2?36:48):(kind===2?52:64),a=R*.5,k=R*.2;
  let s='<svg viewBox="0 0 200 200"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+m.light+'"/><stop offset=".5" stop-color="'+m.mid+'"/><stop offset="1" stop-color="'+m.dark+'"/></linearGradient></defs>';
  let prev=cy+R-6;
  for(let i=0;i<bars;i++){const y=cy+R+(kind===2?24:8)+i*24;
    s+='<path d="M72 '+prev+'V'+(y+2)+'M128 '+prev+'V'+(y+2)+'" stroke="'+m.dark+'" stroke-width="3" stroke-dasharray="3 2"/>'+
      '<rect x="50" y="'+y+'" width="100" height="18" rx="3" fill="url(#'+id+')" stroke="'+m.edge+'" stroke-width="2.5"/>'+
      '<text x="100" y="'+(y+13.5)+'" text-anchor="middle" font-family="Nunito,system-ui,sans-serif" font-weight="900" font-size="11" letter-spacing="2" fill="'+m.edge+'">'+BN[i]+'</text>';prev=y+18}
  if(kind===2)s+=mkWreath(cx,cy,R+16,m.mid,m.edge);
  const cross=(sc)=>{const RR=R*sc,A=a*sc,K=k*sc;return 'M'+(cx-K)+' '+(cy-K)+'L'+(cx-A)+' '+(cy-RR)+'Q'+cx+' '+(cy-RR+RR*.12)+' '+(cx+A)+' '+(cy-RR)+'L'+(cx+K)+' '+(cy-K)+
    'L'+(cx+RR)+' '+(cy-A)+'Q'+(cx+RR-RR*.12)+' '+cy+' '+(cx+RR)+' '+(cy+A)+'L'+(cx+K)+' '+(cy+K)+
    'L'+(cx+A)+' '+(cy+RR)+'Q'+cx+' '+(cy+RR-RR*.12)+' '+(cx-A)+' '+(cy+RR)+'L'+(cx-K)+' '+(cy+K)+
    'L'+(cx-RR)+' '+(cy+A)+'Q'+(cx-RR+RR*.12)+' '+cy+' '+(cx-RR)+' '+(cy-A)+'Z'};
  s+='<path d="'+cross(1)+'" fill="url(#'+id+')" stroke="'+m.edge+'" stroke-width="4" stroke-linejoin="round"/>'+
     '<path d="'+cross(.74)+'" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2" stroke-linejoin="round"/>';
  if(kind>=1)s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(R*.34).toFixed(1)+'" fill="'+m.dark+'" stroke="'+m.edge+'" stroke-width="2.5"/>'+
     '<circle cx="'+cx+'" cy="'+cy+'" r="'+(R*.23).toFixed(1)+'" fill="url(#'+id+')"/><circle cx="'+cx+'" cy="'+cy+'" r="'+(R*.1).toFixed(1)+'" fill="'+m.edge+'"/>';
  else s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(R*.12).toFixed(1)+'" fill="'+m.dark+'" stroke="'+m.edge+'" stroke-width="2"/>';
  if(tier==='diamond')s+='<path d="M'+(cx+R*.55)+' '+(cy-R*.75)+'l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#fff"/>';
  return s+'</svg>';
}
function rankHTML(game,best){
  if(game==='blast'){const r=marksRank(best);return r?'<span class="ri" title="'+marksName(r)+'">'+marksBadge(r)+'</span>':''}
  if(game==='hotcold'){const r=Math.floor(best/25);return r?'<span class="ri" title="'+tradeName(r)+'">'+tradeBadge(r)+'</span>':''}
  if(game==='roll'){const r=Math.min(5,Math.floor(best/24));return r?'<span class="ri" title="'+warrantName(r)+'">'+armyWarrant(r)+'</span>':''}
  if(best<100)return '';const n=Math.floor(best/100);
  return '<span class="ri" title="'+(game==='flow'?officerName(n):enlistedName(n))+'">'+(game==='flow'?armyOfficer(n):armyEnlisted(n))+'</span>';
}
function Board(el,o){
  this.el=el;this.game=o.game;this.onSignIn=o.onSignIn||null;this.title=o.title||'Top 10';this.unit=o.unit||'';
  this.top=null;this.pending=0;this.run=null;this.pendingRun=null;this.rank=0;this.mode='claim';this.code=null;this.err='';this.busy=false;
  el.addEventListener('click',e=>this.onClick(e));
  listeners.push(type=>{if(type==='signout'){this.code=null;this.mode='claim'}this.rank=0;this.err='';this.render()});
  el.addEventListener('submit',e=>{e.preventDefault();this.onSubmit(e.target)});
  this.render();
}
Board.prototype.render=function(){
  const a=load(),me=a?a.name.toLowerCase().replace(/ /g,''):'';
  let h='<div class="lb"><h3>'+esc(this.title)+'</h3>';
  if(this.code){
    h+='<div class="code"><p>Save this recovery code in Notes. It\'s the only way to get <b>'+esc(a?a.name:'')+'</b> back on a new phone.</p>'+
       '<strong>'+esc(this.code)+'</strong><div class="row"><button type="button" data-act="copy">Copy code</button>'+
       '<button type="button" class="alt" data-act="saved">I saved it</button></div></div>';
  }
  if(this.err)h+='<p class="err">'+esc(this.err)+'</p>';
  if(a){
    h+='<p class="me-line">Playing as <b>'+esc(a.name)+'</b>'+(this.rank?', ranked #'+this.rank:'')+
       ' <button type="button" class="alt switch" data-act="switch">Switch player</button>'+
       ' <button type="button" class="alt switch" data-act="newcode">New recovery code</button></p>';
  }else if(this.mode==='claim'){
    const p=this.pending;
    h+='<form data-form="claim"><label for="lb-name">'+(p?'Post your '+esc(this.unit?this.unit+p:p)+' to the board':'Claim a leaderboard name')+'</label>'+
       '<div class="row"><input id="lb-name" name="name" maxlength="16" autocomplete="nickname" autocapitalize="words" placeholder="Your name">'+
       '<button'+(this.busy?' disabled':'')+'>'+(p?'Post':'Claim')+'</button></div>'+
       '<div><button type="button" class="alt" data-act="recover">Already have a name? Use your recovery code</button></div></form>';
  }else{
    h+='<form data-form="recover"><label for="lb-rname">Sign back in to your name</label>'+
       '<input id="lb-rname" name="name" maxlength="16" autocapitalize="words" placeholder="Your name">'+
       '<input name="code" maxlength="14" autocapitalize="characters" autocomplete="off" placeholder="Recovery code (XXXX-XXXX-XXXX)">'+
       '<div class="row"><button'+(this.busy?' disabled':'')+'>Sign in</button></div>'+
       '<div><button type="button" class="alt" data-act="claim">New player? Claim a name instead</button></div></form>';
  }
  if(this.top===null)h+='<ol><li class="empty">Loading the board…</li></ol>';
  else if(!this.top.length)h+='<ol><li class="empty">No scores yet. Be the first on the board.</li></ol>';
  else{
    h+='<ol>'+this.top.map((r,i)=>{
      const mine=me&&r.name.toLowerCase().replace(/ /g,'')===me;
      return '<li'+(mine?' class="me"':'')+'><span class="r">'+(i+1)+'</span><span class="n">'+rankHTML(this.game,r.best)+'<span class="nm">'+esc(r.name)+'</span>'+((this.game==='flow'||this.game==='hotcold')&&r.best>=1000?'<span class="k1" title="'+Math.floor(r.best/1000)+'K Club">'+badgeK(Math.floor(r.best/1000))+'</span>':'')+(r.streak>=2?' <span class="fl" title="Best par streak">🔥'+r.streak+'</span>':'')+'</span><span class="s">'+esc(this.unit)+(this.game==='blast'?Number(r.best).toLocaleString():r.best)+'</span></li>';
    }).join('')+'</ol>';
  }
  h+='</div>';
  this.el.innerHTML=h;
};
Board.prototype.refresh=async function(){
  try{const d=await call('/top?game='+this.game);this.top=d.top||[];}
  catch(e){if(this.top===null)this.top=[];this.err=e.message}
  this.render();
};
Board.prototype.startRun=function(){ // ticket for this round, so the server can check the score against real play time
  this.run=null;const me=this;
  call('/start',{game:this.game}).then(d=>{me.run=d.run}).catch(()=>{});
};
Board.prototype.post=function(score,extra){
  score=Math.floor(score)||0;this.extra=extra||null;
  this.pendingRun=this.run;this.run=null;
  if(score<1){this.refresh();return}
  this.pending=score;this.err='';
  if(load())this.submit();else{this.render();this.refresh()}
};
Board.prototype.submit=async function(){
  const a=load();if(!a||!this.pending){this.refresh();return}
  try{
    const d=await call('/score',Object.assign({token:a.token,game:this.game,score:this.pending,run:this.pendingRun},this.extra||{}));
    this.pending=0;this.pendingRun=null;this.rank=d.rank||0;this.top=d.top||[];this.err='';
    if(window.PMX&&PMX.checkKing)setTimeout(()=>PMX.checkKing(true),600); // #1 on every board?
  }catch(e){
    if(e.status===401){save(null);this.mode='recover';}
    if(e.status===400){this.pending=0;this.pendingRun=null}
    this.err=e.message;
    if(this.top===null)await this.refresh();
  }
  this.render();
};
Board.prototype.onSubmit=async function(f){
  if(this.busy)return;
  const kind=f.getAttribute('data-form'),q=k=>f.querySelector('[name="'+k+'"]'),name=(q('name').value||'').trim();
  this.busy=true;this.err='';this.render();
  try{
    if(kind==='claim'){
      const d=await call('/claim',{name});
      save({name:d.name,token:d.token});this.code=d.recovery;
    }else{
      const d=await call('/recover',{name,code:q('code')?q('code').value:''});
      save({name:d.name,token:d.token});
    }
    this.busy=false;
    if(this.onSignIn)try{this.onSignIn(load())}catch(e){}
    emit('signin');
    if(this.pending)await this.submit();else await this.refresh();
  }catch(e){
    this.busy=false;this.err=e.message;this.render();
    const keep=this.el.querySelector('input[name="name"]');if(keep){keep.value=name;}
  }
};
Board.prototype.onClick=function(e){
  const b=e.target.closest('[data-act]');if(!b)return;
  const act=b.getAttribute('data-act');
  if(act==='recover'){this.mode='recover';this.err='';this.render()}
  else if(act==='claim'){this.mode='claim';this.err='';this.render()}
  else if(act==='saved'){this.code=null;this.render()}
  else if(act==='switch'){switchPlayer()}
  else if(act==='newcode'){
    const a=load();if(!a)return;
    if(!confirm('Make a new recovery code for '+a.name+'?\n\nYour old code will stop working. You\'ll see the new one once, so save it in Notes.'))return;
    call('/newcode',{token:a.token}).then(d=>{this.code=d.recovery;this.err='';this.render();this.el.scrollIntoView({behavior:'smooth',block:'start'})})
      .catch(e=>{this.err=e.message;this.render()});
  }
  else if(act==='copy'){
    const c=this.code;
    if(navigator.clipboard&&c)navigator.clipboard.writeText(c).then(()=>{b.textContent='Copied'},()=>{b.textContent='Long-press the code to copy'});
  }
};

/* ---------- cloud saves (progress follows your name across devices) ---------- */
const queued={},timers={};
function sendSave(game,keepalive){
  const a=load(),obj=queued[game];if(!a||!obj)return;
  delete queued[game];
  try{
    fetch(API+'/save',{method:'POST',keepalive:!!keepalive,headers:{'Content-Type':'application/json'},
      body:JSON.stringify({token:a.token,game,data:JSON.stringify(obj),savedAt:obj.savedAt||Date.now()})}).catch(()=>{});
  }catch(e){}
}
function cloudSave(game,obj,now){
  if(!load())return;
  queued[game]=obj;clearTimeout(timers[game]);
  if(now){sendSave(game,true);return}
  timers[game]=setTimeout(()=>sendSave(game),1200);
}
async function cloudLoad(game){
  const a=load();if(!a)return null;
  try{
    const d=await call('/load',{token:a.token,game});
    return d&&d.data?JSON.parse(d.data):null;
  }catch(e){return undefined} // undefined = couldn't reach, null = nothing saved
}
const flush=()=>{for(const g in queued){clearTimeout(timers[g]);sendSave(g,true)}};
window.addEventListener('pagehide',flush);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});

window.PMLB={armyWarrant,warrantName,tradeBadge,tradeName,marksBadge,marksName,marksRank,MK_AT,top:game=>call('/top?game='+game).then(d=>d.top||[]),mount:(el,o)=>{addCss();return new Board(el,o)},account:load,cloudSave,cloudLoad,switchPlayer,onChange:fn=>listeners.push(fn)};
})();
