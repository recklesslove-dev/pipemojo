/* Pipe Mojo leaderboard — shared by whack.html and flow.html */
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
  return '<g transform="translate('+cx+' '+cy+') scale('+sc+')"><path d="M0 -12 L-10 -20 L-30 -32 L-26 -18 L-44 -22 L-34 -8 L-46 -2 L-28 2 L-34 12 L-14 8 L-10 22 L-4 30 L0 26 L4 30 L10 22 L14 8 L34 12 L28 2 L46 -2 L34 -8 L44 -22 L26 -18 L30 -32 L10 -20Z" fill="'+F+'" stroke="'+E+'" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>'+
    '<circle cx="0" cy="-19" r="7" fill="'+F+'" stroke="'+E+'" stroke-width="3" vector-effect="non-scaling-stroke"/><path d="M-8 -4 L8 -4 L8 8 Q0 16 -8 8Z" fill="none" stroke="'+E+'" stroke-width="2.5" vector-effect="non-scaling-stroke"/></g>';
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
  }else if(s<=5){ // major and lieutenant colonel: the oak leaf
    body='<path d="M100 22 C70 32 58 54 70 76 C46 82 46 106 66 114 C52 130 62 152 84 150 L92 154 L92 182 L108 182 L108 154 L116 150 C138 152 148 130 134 114 C154 106 154 82 130 76 C142 54 130 32 100 22Z" fill="'+F+'" stroke="'+E+'" stroke-width="4" stroke-linejoin="round"/>'+
      '<path d="M100 36 V150 M100 70 L78 60 M100 70 L122 60 M100 100 L74 92 M100 100 L126 92 M100 128 L80 124 M100 128 L120 124" stroke="'+E+'" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>';
  }else if(s===6){body=arEagle(100,104,1.95,F,E)} // colonel: the eagle
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
  const idx=Math.min(12,r),t=AR_T[r>=12?enlistedTier(r):0],g=arGrad(t),F='url(#'+g.id+')',E=t.edge;
  const wrap=b=>'<svg viewBox="0 0 200 200"><defs>'+g.def+'</defs>'+b+'</svg>';
  if(idx===3)return wrap('<path d="M100 26 L160 44 L154 120 Q146 160 100 178 Q54 160 46 120 L40 44Z" fill="'+F+'" stroke="'+E+'" stroke-width="4"/>'+
    '<path d="M100 40 L146 54 L141 118 Q134 150 100 164 Q66 150 59 118 L54 54Z" fill="#1b1a2a"/>'+arEagle(100,104,1.05,F,E)); // specialist: the shield
  const chev=a=>'<path d="M30 '+(a+40)+'L100 '+a+'L170 '+(a+40)+'L170 '+(a+56)+'L100 '+(a+16)+'L30 '+(a+56)+'Z" fill="'+F+'" stroke="'+E+'" stroke-width="4" stroke-linejoin="round"/>';
  const rock=Y=>'<path d="M30 '+Y+'Q100 '+(Y+36)+' 170 '+Y+'L170 '+(Y+16)+'Q100 '+(Y+52)+' 30 '+(Y+16)+'Z" fill="'+F+'" stroke="'+E+'" stroke-width="4" stroke-linejoin="round"/>';
  const nChev=idx<=2?1:idx===4?2:3,nRock=idx===2||idx===6?1:idx===7?2:idx>=8?3:0;
  let b='';for(let i=0;i<nChev;i++)b+=chev(i*20);
  const chevBot=(nChev-1)*20+56,rStart=nChev===3?100:chevBot+6;
  for(let j=0;j<nRock;j++)b+=rock(rStart+j*20);
  if(idx===9)b+='<path d="M100 62 L117 81 L100 100 L83 81Z" fill="'+F+'" stroke="'+E+'" stroke-width="3"/>';   // first sergeant: the diamond
  if(idx===10)b+=arStar(100,80,17,t);                                                                         // sergeant major: the star
  if(idx===11)b+=arStar(100,80,14,t)+'<path d="M78 74 Q76 96 100 100 Q124 96 122 74" fill="none" stroke="'+F+'" stroke-width="5" stroke-linecap="round"/>'; // command sergeant major: star in a wreath
  if(idx===12)b+=arEagle(100,82,.6,F,E);                                                                       // sergeant major of the army: the eagle
  const h=nRock?rStart+(nRock-1)*20+44:chevBot;
  return wrap('<g transform="translate(0 '+((200-h)/2).toFixed(1)+')">'+b+'</g>');
}
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
.lb li .n{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lb li .s{font-variant-numeric:tabular-nums;color:#00e5ff}
.lb .ri{display:inline-block;width:20px;height:20px;vertical-align:-4px;margin-right:5px}
.lb .ri svg{width:100%;height:100%}
.lb .fl{font-size:.78rem;font-weight:800;color:#ffb347;margin-left:4px;white-space:nowrap}
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
      return '<li'+(mine?' class="me"':'')+'><span class="r">'+(i+1)+'</span><span class="n">'+(r.best>=100?'<span class="ri" title="'+(this.game==='flow'?officerName(Math.floor(r.best/100)):enlistedName(Math.floor(r.best/100)))+'">'+(this.game==='flow'?armyOfficer(Math.floor(r.best/100)):armyEnlisted(Math.floor(r.best/100)))+'</span>':'')+esc(r.name)+(r.streak>=2?' <span class="fl" title="Best par streak">🔥'+r.streak+'</span>':'')+'</span><span class="s">'+esc(this.unit)+r.best+'</span></li>';
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

window.PMLB={mount:(el,o)=>{addCss();return new Board(el,o)},account:load,cloudSave,cloudLoad,switchPlayer,onChange:fn=>listeners.push(fn)};
})();
