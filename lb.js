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
      return '<li'+(mine?' class="me"':'')+'><span class="r">'+(i+1)+'</span><span class="n">'+(r.best>=100?'<span class="ri" title="Rank">'+(this.game==='flow'?insignia(Math.floor(r.best/100)):chevrons(Math.floor(r.best/100)))+'</span>':'')+esc(r.name)+(r.streak>=2?' <span class="fl" title="Best par streak">🔥'+r.streak+'</span>':'')+'</span><span class="s">'+esc(this.unit)+r.best+'</span></li>';
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
