/* Pipe Mojo extras: daily streak, seasonal and secret trophies. Shared by Flow, Whack-a-Pipe and the Locker.
   Saved on this device and, when signed in, to your name (inside the Whack-a-Pipe cloud save). */
(function(){
const acctKey=()=>{const a=window.PMLB&&PMLB.account();return a?String(a.name).toLowerCase().replace(/ /g,''):''};
const KEY=()=>'pm-x:'+acctKey();
const blank=()=>({x:[],days:{last:'',streak:0,best:0}});
function load(){try{const d=JSON.parse(localStorage.getItem(KEY())||'null');if(d&&Array.isArray(d.x)&&d.days)return d}catch(e){}return blank()}
function store(d){try{localStorage.setItem(KEY(),JSON.stringify(d))}catch(e){}}
const ymd=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};

/* holidays: play during the window to earn that year's badge */
function fatTuesday(y){ // Easter (Gregorian) minus 47 days
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,
    l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;
  return new Date(y,mo-1,da-47);
}
const SEASONS=[
  {id:'mardigras',name:'Laissez les Bons Temps',art:'🎭',desc:'Play during Mardi Gras season',win:y=>[new Date(y,0,20),fatTuesday(y)]},
  {id:'july4',name:'Red, White and Pipes',art:'🎆',desc:'Play Fourth of July week (Jul 1–7)',win:y=>[new Date(y,6,1),new Date(y,6,7)]},
  {id:'halloween',name:'Trick or Treat',art:'🎃',desc:'Play Halloween week (Oct 24–31)',win:y=>[new Date(y,9,24),new Date(y,9,31)]},
  {id:'veterans',name:'Thank You for Your Service',art:'🎖️',desc:'Play Veterans Day week (Nov 8–14)',win:y=>[new Date(y,10,8),new Date(y,10,14)]},
  {id:'thanksgiving',name:'Stuffed Drains',art:'🦃',desc:'Play Thanksgiving week',win:y=>{const n=new Date(y,10,1),th=new Date(y,10,1+((11-n.getDay())%7)+21);return [new Date(y,10,th.getDate()-3),new Date(y,10,th.getDate()+3)]}},
  {id:'christmas',name:'Pipes for Christmas',art:'🎄',desc:'Play Christmas week (Dec 19–26)',win:y=>[new Date(y,11,19),new Date(y,11,26)]},
  {id:'newyear',name:'Fresh Pipes',art:'🥂',desc:'Play New Year\'s week (Dec 31–Jan 6)',win:y=>[new Date(y-1,11,31),new Date(y,0,6)]}
];
function seasonNow(t){
  const now=new Date(t||Date.now()),day=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  for(const s of SEASONS)for(const y of [now.getFullYear(),now.getFullYear()+1]){const [a,b]=s.win(y);if(day>=a&&day<=b)return Object.assign({},s,{year:y,key:'s:'+s.id+':'+y})}
  return null;
}
function nextSeason(t){
  const now=new Date(t||Date.now());let best=null;
  for(const s of SEASONS)for(const y of [now.getFullYear(),now.getFullYear()+1]){const [a]=s.win(y);if(a>now&&(!best||a<best.start))best=Object.assign({},s,{year:y,start:a})}
  return best;
}
/* secret trophies stay hidden until earned */
const SECRETS=[
  {id:'annoy',name:'Annoying',art:'😤',desc:'Tapped Mojo 50 times in his locker room'},
  {id:'night',name:'Night Shift',art:'🌙',desc:'Cleared a Flow level between midnight and 4am'},
  {id:'double',name:'Double Duty',art:'🎖️',desc:'Held an Army rank in both games'},
  {id:'golden',name:'Golden Touch',art:'✨',desc:'Caught every golden pipe in a bonus round'},
  {id:'marathon',name:'Marathon',art:'⏱️',desc:'Lasted 5 minutes in one Whack-a-Pipe round'}
];
const DAILY=[{n:3,id:'d3',name:'Regular',art:'📅'},{n:7,id:'d7',name:'Full Week',art:'🗓️'},{n:30,id:'d30',name:'Union Card',art:'🏅'}];

let onAward=null;
function award(id,name){const d=load();if(d.x.includes(id))return false;d.x.push(id);store(d);push();if(onAward)onAward(name||id);return true}
function tick(){ // call once when a game starts: daily streak and holiday badges
  const d=load(),today=ymd(Date.now()),yest=ymd(Date.now()-864e5);
  if(d.days.last!==today){d.days.streak=d.days.last===yest?d.days.streak+1:1;d.days.last=today;d.days.best=Math.max(d.days.best,d.days.streak);store(d)}
  for(const t of DAILY)if(d.days.streak>=t.n)award(t.id,'🔥 '+t.name+': '+t.n+'-day streak');
  const s=seasonNow();if(s)award(s.key,s.art+' '+s.name+' '+s.year);
}
/* cloud: ride along inside the Whack-a-Pipe save so every device agrees */
function merge(c){
  if(!c)return;const d=load();
  if(Array.isArray(c.x))for(const id of c.x)if(!d.x.includes(id))d.x.push(id);
  const r=c.days;if(r&&r.last&&r.last>d.days.last){d.days.last=r.last;d.days.streak=r.streak}
  if(r)d.days.best=Math.max(d.days.best,r.best||0);store(d);
}
let pushT=0;
function push(){
  if(!(window.PMLB&&PMLB.account()))return;clearTimeout(pushT);
  pushT=setTimeout(()=>PMLB.cloudLoad('whack').then(c=>{
    if(c===undefined)return;c=c||{};merge(c);const d=load(),k=acctKey();
    let lb=0,lt=[],lr=0;try{lb=+localStorage.getItem('pm-whack-best')||0;lt=JSON.parse(localStorage.getItem('pm-whack-tro:'+k)||'[]');lr=+localStorage.getItem('pm-whack-rounds:'+k)||0}catch(e){}
    PMLB.cloudSave('whack',{best:Math.max(+c.best||0,lb),tro:[...new Set((c.tro||[]).concat(lt))],rounds:Math.max(+c.rounds||0,lr),x:d.x,days:d.days,savedAt:Date.now()});
  }),800);
}
function sync(){if(window.PMLB&&PMLB.account())PMLB.cloudLoad('whack').then(c=>{if(c){merge(c)}}).catch(()=>{})}
window.PMX={award,tick,merge,push,sync,has:id=>load().x.includes(id),list:()=>load().x,days:()=>load().days,seasonNow,nextSeason,
  SEASONS,SECRETS,DAILY,set onAward(fn){onAward=fn}};
})();
