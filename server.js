const express = require('express'), http = require('http'), { Server } = require('socket.io');
const app = express(), srv = http.createServer(app), io = new Server(srv);
app.use(express.static(__dirname + '/public'));

// Gruppen: Farbe + Hauspreis
const GR = { br:['#8d5a3b',50], lb:['#9fd8f0',50], pk:['#e0679f',100], or:['#f2993a',100], rd:['#d8322c',150], ye:['#f4d22a',150], gn:['#2f9e5b',200], db:['#2a4a9e',200] };
// [Name, Typ, Preis, Gruppe, Basismiete]
const B = [
 ['LOS – Gehaltsscheck','go'],['Monicas Küche','prop',60,'br',4],['Gemeinschaft','chest'],['Monicas Balkon','prop',60,'br',8],
 ['Gerichtskosten (Scheidung #3)','tax',200],['Taxi „Hold the cab!“','rail',200],['Joeys Sofa','prop',100,'lb',12],['Ereignis','event'],
 ['Chandlers Büro','prop',100,'lb',12],['Janices Wohnung','prop',120,'lb',16],['Gefängnis (Besuch)','jail'],
 ['Phoebes Wohnung','prop',140,'pk',20],['Central-Perk-Espressomaschine','util',150],['Ugly Naked Guys Wohnung','prop',140,'pk',20],['Marcels Käfig','prop',160,'pk',24],
 ['U-Bahn Linie 1','rail',200],['Ross’ Apartment','prop',180,'or',28],['Gemeinschaft','chest'],['Das Museum','prop',180,'or',28],['Ross’ Uni (NYU)','prop',200,'or',32],
 ['Freies Parken','park'],['Gunthers Schicht','prop',220,'rd',36],['Ereignis','event'],['Central Perk – Sofa','prop',220,'rd',36],['Central Perk – Tresen','prop',240,'rd',40],
 ['Bus M14','rail',200],['The Coffee House','prop',260,'ye',44],['Bloomingdale’s','prop',260,'ye',44],['Die Intro-Fontäne','util',150],['Central Park','prop',280,'ye',48],
 ['Geh ins Gefängnis!','gojail'],['Monicas Apartment','prop',300,'gn',52],['Chandlers & Joeys Wohnung','prop',300,'gn',52],['Gemeinschaft','chest'],['Rachels Büro (Ralph Lauren)','prop',320,'gn',56],
 ['Flughafen JFK','rail',200],['Ereignis','event'],['Beach House','prop',350,'db',70],['Nackter-Mann-Steuer','tax',100],['Hochzeitssuite Las Vegas','prop',400,'db',90]];
const CHEST = [
 {t:'Joey isst dein Sandwich – 50 € Entschädigung!',m:50},{t:'Phoebe singt „Smelly Cat“ – Straßenmusik bringt 30 €.',m:30},
 {t:'Du verlierst beim PIVOT! Arztkosten 80 €.',m:-80},{t:'Gunther schenkt dir einen Gratis-Kaffee: ab zum Central Perk Tresen.',g:24},
 {t:'Ross verkauft Fossilien: +100 €.',m:100},{t:'Chandler: „Could this BE any more teuer?“ Zahle 50 €.',m:-50},
 {t:'Du hast Monicas Putzplan verletzt – ab ins Gefängnis!',j:1},{t:'Rücke vor auf LOS.',g:0},
 {t:'UNAGI! Du behältst diese Karte und ignorierst die nächste Miete.',keep:1},
 {t:'Gefängnis-frei: Ross’ Anwalt kennt einen Trick. Karte behalten.',free:1},
 {t:'Joeys „How you doin’?“ – jeder Mitspieler zahlt dir 20 €.',all:20},
 {q:'Wie heißt Joeys Rolle in der Seifenoper „Days of Our Lives“?',a:['Dr. Drake Ramoray','Dr. Mark Sloan','Dr. Ross Geller'],ok:0,m:50},
 {q:'Welche Affenart ist Marcel?',a:['Schimpanse','Kapuzineraffe','Orang-Utan'],ok:1,m:50},
 {q:'Wie heißt Phoebes Zwillingsschwester?',a:['Estelle','Janice','Ursula'],ok:2,m:50},
 {t:'Rachel oder Pizza? Entscheide dich!',ch:[['Zahle 60 €',{m:-60}],['Gehe 3 Felder zurück',{b:3}]]},
 {t:'Chandler schlägt eine Wette vor.',ch:[['Wetten: 50 € Einsatz, 50 % auf 100 €',{bet:[50,100]}],['Lieber nicht',{}]]}];
const EVENT = [
 {t:'Rachel serviert den Kaffee falsch. Zahle 40 €.',m:-40},{t:'WE WERE ON A BREAK! Gehe 3 Felder zurück.',b:3},
 {t:'Monicas Thanksgiving: +75 €.',m:75},{t:'Marcel klaut deine Brieftasche: −60 €.',m:-60},
 {t:'Spontan nach Las Vegas: rücke vor zur Hochzeitssuite.',g:39},{t:'Bloomingdale’s Rabatt-Aktion: +120 €.',m:120},
 {t:'Ross ruft „PIVOT!“ – ab ins Gefängnis.',j:1},{t:'Ugly Naked Guy vererbt dir 150 €.',m:150},
 {t:'Monicas Geburtstagsparty – du zahlst jedem Mitspieler 15 €.',paya:15},
 {t:'UNAGI! Du behältst diese Karte und ignorierst die nächste Miete.',keep:1},
 {q:'Wie viele Ehen hatte Ross im Laufe der Serie?',a:['2','3','4'],ok:1,m:50},
 {q:'Wie heißt Ross’ Sohn?',a:['Ben','Emma','Jack'],ok:0,m:50},
 {q:'Wer ist heimlich in Rachel verliebt?',a:['Gunther','Joshua','Paolo'],ok:0,m:50},
 {q:'Wie heißt Phoebes bekanntester Song?',a:['Smelly Cat','Hot Lips','Sticky Shoes'],ok:0,m:50},
 {t:'Monica braucht Hilfe in der Küche.',ch:[['Hilf ihr (−30 €, du bekommst UNAGI)',{m:-30,keep:1}],['Ablehnen',{}]]},
 {q:'Welche Farbe hat das berühmte Sofa im Central Perk?',a:['Grün','Orange','Rot'],ok:1,m:50},
 {q:'Wie heißt die Tochter von Rachel und Ross?',a:['Emma','Ben','Julie'],ok:0,m:50},
 {q:'Welche Tiere halten Chandler und Joey als Haustiere?',a:['Hund und Katze','Huhn und Ente','Zwei Fische'],ok:1,m:50},
 {q:'Welche Nummer hat Monicas Wohnung?',a:['20','19','5'],ok:0,m:50},
 {q:'Was ist Phoebes Beruf?',a:['Lehrerin','Köchin','Masseurin'],ok:2,m:50},
 {q:'Wen heiratet Ross in Las Vegas?',a:['Emily','Carol','Rachel'],ok:2,m:50},
 {q:'Wie heißt Joeys Agentin?',a:['Estelle','Janice','Ursula'],ok:0,m:50},
 {q:'Wie heißt der Nachname von Monica und Ross?',a:['Bing','Geller','Tribbiani'],ok:1,m:50}];
const TOK = ['Joey','Chandler','Monica','Rachel','Ross','Phoebe','Marcel','Gunther'];
const rooms = {};
const fs=require('fs'),FILE=process.env.SAVE_FILE||__dirname+'/rooms.json';
try{ Object.assign(rooms,JSON.parse(fs.readFileSync(FILE))); }catch(e){}
let svT=0; const save=()=>{ clearTimeout(svT); svT=setTimeout(()=>{ try{ fs.writeFileSync(FILE,JSON.stringify(rooms)); }catch(e){} },500); };
const draw=r=>{ if(!(r.bag&&r.bag.length)) r.bag=shuffle([1,2,3,4,5,6,1,2,3,4,5,6]); return r.bag.pop(); };
const spouse=(r,p)=>r.marr&&r.marr.includes(p.id)?r.P.find(x=>x.id===r.marr.find(i=>i!==p.id)):null;
const ABIL={Joey:['How you doin’?','Nächste Miete −50 % (max. 100 € gespart)'],Chandler:['Sarkasmus','Nächste Steuer/Strafkarte bis zu 100 € erlassen'],Monica:['Putzplan','1 Haus gratis (nur Straßen mit Hauspreis ≤100 €)'],Rachel:['Bloomingdale’s-Gutschein','+100 €'],Ross:['PIVOT!','Nächster Wurf: 2× würfeln, höherer zählt'],Phoebe:['Smelly Cat','Jeder Mitspieler zahlt dir 30 €'],Marcel:['Klauen','50 € vom reichsten Mitspieler'],Gunther:['Schichtbeginn','10 € pro eigenem Feld (max. 100 €)']};
const EPI=[['Blackout in New York – eine Runde keine Miete!','blackout'],['Happy Hour im Central Perk – eine Runde halbe Miete!','happy'],['Thanksgiving! Jeder zahlt 40 € in den Topf.','thanks'],['Das Prom-Video: Der Reichste zahlt 100 € an den Ärmsten.','prom'],['Das Weihnachts-Gürteltier: Jeder bekommt 50 €.','gift']];
const chan=(r,p,a)=>{ if(p.arm!=='chandler') return a; const v=Math.min(100,a); p.arm=null; log(r,`${p.name}: Sarkasmus spart ${v} €`); return a-v; };
function episode(r){
  r.tc=(r.tc||0)+1; const al=r.P.filter(x=>!x.out); if(r.eff&&r.tc>=r.eff.until) r.eff=null;
  if(!r.S.episodes||r.tc%(al.length*5)) return;
  const e=EPI[Math.random()*EPI.length|0]; log(r,'📺 Neue Folge: '+e[0]);
  if(e[1]==='blackout'||e[1]==='happy') r.eff={k:e[1],until:r.tc+al.length,t:e[0]};
  else if(e[1]==='thanks') al.forEach(x=>{ pay(r,x,40); if(r.S.jackpot) r.park+=40; });
  else if(e[1]==='prom'&&al.length>1){ const o=[...al].sort((a,b)=>b.money-a.money),m=Math.min(100,o[0].money); o[0].money-=m; o[o.length-1].money+=m; }
  else if(e[1]==='gift') al.forEach(x=>x.money+=50);
  if(cur(r).out&&r.st==='play') nextTurn(r);
}
const shuffle = a => a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);

function room(c){ return rooms[c] ||= { code:c, st:'lobby', S:{money:1500,doubleGo:false,jackpot:false,fast:false,auction:true,abil:false,episodes:false,bag:false}, P:[], own:{}, mg:{}, marr:null, wedp:null, h:{}, turn:0, ph:'roll', dice:[0,0], dbl:0, log:[], pend:null, park:0, cc:shuffle(CHEST), ec:shuffle(EVENT) }; }
const log = (r,t)=>{ r.log.unshift(t); r.log.length=40; };
const cur = r => r.P[r.turn];
function owns(r,pid,g){ return B.every((s,i)=>s[3]!==g || r.own[i]===pid); }
function rent(r,i,roll){
  const s=B[i], o=r.own[i], n=B.filter((x,j)=>x[1]===s[1]&&r.own[j]===o).length;
  if(s[1]==='rail') return 25*2**(n-1);
  if(s[1]==='util') return roll*(n===2?10:4);
  const h=r.h[i]||0; return h? s[4]*[0,5,15,45,65,90][h] : s[4]*(owns(r,o,s[3])?2:1);
}
function liq(r,p){
  const mine=Object.keys(r.own).filter(k=>r.own[k]===p.id).map(Number); if(!mine.length) return;
  for(const i of mine.filter(i=>r.h[i])) while(r.h[i]>0&&p.money<0){ r.h[i]--; p.money+=Math.floor(GR[B[i][3]][1]*(r.S.fast?.5:1)/2); }
  for(const i of mine.filter(i=>!r.mg[i]&&!r.h[i]).sort((a,b)=>B[b][2]-B[a][2])){ if(p.money>=0) break; r.mg[i]=1; p.money+=B[i][2]>>1; }
  log(r,`${p.name} verkauft Häuser / nimmt Hypotheken auf, um zahlen zu können.`);
}
function pay(r,p,amt,to){
  p.money-=amt; if(to) to.money+=amt;
  if(p.money<0) liq(r,p);
  if(p.money<0){ p.out=true; log(r,`${p.name} ist pleite!`);
    for(const i in r.own) if(r.own[i]===p.id){ if(to&&0) r.own[i]=to.id; else delete r.own[i]; delete r.h[i]; delete r.mg[i]; }
    const alive=r.P.filter(x=>!x.out); if(alive.length===1){ r.st='over'; r.winner=alive[0].name; } }
}
function go(r,p,to,collect=true){
  if(to<p.pos&&collect){ p.money+=200; log(r,`${p.name} kassiert 200 € für LOS.`); }
  p.pos=to;
}
function apply(r,p,c){
  if(c.m>0) p.money+=c.m; else if(c.m<0){ const a=chan(r,p,-c.m); pay(r,p,a); if(r.S.jackpot) r.park+=a; }
  if(c.all) r.P.forEach(x=>{ if(x!==p&&!x.out){ const m=Math.min(c.all,x.money); x.money-=m; p.money+=m; } });
  if(c.paya) r.P.forEach(x=>{ if(x!==p&&!x.out&&!p.out) pay(r,p,c.paya,x); });
  if(c.keep) p.unagi=(p.unagi||0)+1;
  if(c.free) p.free=(p.free||0)+1;
  if(c.bet){ if(Math.random()<.5){ p.money+=c.bet[1]; log(r,`${p.name} gewinnt die Wette: +${c.bet[1]} €`); } else { pay(r,p,c.bet[0]); log(r,`${p.name} verliert die Wette: −${c.bet[0]} €`); } }
  if(p.out) return;
  if(c.j) jail(r,p); else if(c.b){ p.pos=(p.pos+40-c.b)%40; land(r,p); } else if(c.g!==undefined){ go(r,p,c.g); land(r,p); }
}
function land(r,p){
  const s=B[p.pos], t=s[1]; r.ph='end';
  if(['prop','rail','util'].includes(t)){
    const o=r.own[p.pos];
    if(o===undefined){ r.ph='buy'; r.pend=p.pos; }
    else if(o!==p.id){ const ow=r.P.find(x=>x.id===o); let a=rent(r,p.pos,r.dice[0]+r.dice[1]); if(r.mg[p.pos]||(r.marr&&r.marr.includes(p.id)&&r.marr.includes(o))) a=0; if(r.eff&&r.eff.k==='blackout') a=0; else if(r.eff&&r.eff.k==='happy') a=Math.floor(a/2); if(a>0&&p.unagi>0){ p.unagi--; a=0; log(r,`${p.name}: UNAGI! Miete erlassen.`); } if(p.arm==='joey'){ const v=Math.min(100,Math.floor(a/2)); a-=v; p.arm=null; log(r,`${p.name}: „How you doin’?“ spart ${v} €`); } log(r,`${p.name} zahlt ${a} € Miete an ${ow.name}.`); pay(r,p,a,ow); }
  } else if(t==='tax'){ log(r,`${p.name} zahlt ${s[2]} € (${s[0]}).`); const ta=chan(r,p,s[2]); pay(r,p,ta); if(r.S.jackpot) r.park+=ta; }
  else if(t==='gojail'){ jail(r,p); }
  else if(t==='park'&&r.S.jackpot&&r.park){ p.money+=r.park; log(r,`${p.name} räumt den Jackpot ab: ${r.park} €!`); r.park=0; }
  else if(t==='chest'||t==='event'){
    const k=t==='chest'?'cc':'ec', c=r[k].shift(); r[k].push(c); r.card={t:c.t||c.q,who:p.name,k:c.q?'quiz':t,n:(r.cn=(r.cn||0)+1)}; log(r,`🃏 ${p.name}: ${c.t||'Quizfrage!'}`);
    if(c.q){ r.pq=c; r.ph='quiz'; } else if(c.ch){ r.pc=c; r.ph='choice'; } else apply(r,p,c);
  }
}
function jail(r,p){ if(p.free>0){ p.free--; log(r,`${p.name} nutzt die Gefängnis-frei-Karte!`); return; } p.pos=10; p.jail=1; r.dbl=0; r.dice=[r.dice[0],r.dice[1]+0.0]; r.jailed=true; log(r,`${p.name} geht ins Gefängnis.`); }
function nextTurn(r){
  r.dbl=0; r.jailed=false;
  do r.turn=(r.turn+1)%r.P.length; while(cur(r).out);
  r.ph='roll'; r.pend=null; episode(r);
}
const hasH=(r,i)=>B[i][3]&&B.some((x,j)=>x[3]===B[i][3]&&r.h[j]);
function auc(r,me,a){
  const A=r.auc; if(r.P[A.t].id!==me.id) return;
  if(a.type==='abid'){ const n=Math.floor(+a.amt); if(!(n>A.bid)||n>me.money) return; A.bid=n; A.lead=me.id; log(r,`${me.name} bietet ${n} €`); }
  else if(a.type==='apass'){ if(A.lead===me.id) return; A.pass.push(me.id); }
  else return;
  const others=r.P.filter(x=>!x.out&&!A.pass.includes(x.id)&&x.id!==A.lead);
  if(!others.length){
    if(A.lead){ const w=r.P.find(x=>x.id===A.lead); w.money-=A.bid; r.own[A.idx]=w.id; log(r,`🔨 ${w.name} ersteigert ${B[A.idx][0]} für ${A.bid} €!`); r.ev='buy'; }
    else log(r,'Niemand wollte das Feld.');
    r.auc=null; r.ph='end'; return; }
  let k=A.t; do k=(k+1)%r.P.length; while(!others.some(x=>x.id===r.P[k].id)); A.t=k;
}
function act(r,pid,a){
  const p=cur(r); const me=r.P.find(x=>x.id===pid);
  if(r.st==='play'&&me&&!me.out){
    if(a.type==='tprop'){ const to=r.P.find(x=>x.id===a.to); if(!r.auc&&to&&!to.out&&to.id!==pid){ const cl=o=>({m:Math.max(0,Math.floor(+(o||{}).m)||0),p:((o||{}).p||[]).map(Number).filter(i=>i>=0&&i<40)}); r.trade={from:pid,to:to.id,give:cl(a.give),get:cl(a.get)}; } return; }
    if(a.type==='mort'||a.type==='unmort'){ const i=+a.idx; if(r.own[i]!==pid||hasH(r,i)) return;
      if(a.type==='mort'&&!r.mg[i]){ r.mg[i]=1; me.money+=B[i][2]>>1; log(r,`${me.name} beleiht ${B[i][0]}.`); }
      else if(a.type==='unmort'&&r.mg[i]){ const c=Math.ceil((B[i][2]>>1)*1.1); if(me.money<c) return; me.money-=c; delete r.mg[i]; log(r,`${me.name} löst die Hypothek auf ${B[i][0]} ab.`); } return; }
    if(a.type==='sell'){ const i=+a.idx; if(r.own[i]!==pid||!(r.h[i]>0)) return; r.h[i]--; me.money+=Math.floor(GR[B[i][3]][1]*(r.S.fast?.5:1)/2); return; }
    if(a.type==='wedp'){ const to=r.P.find(x=>x.id===a.to); if(!r.marr&&!r.wedp&&to&&!to.out&&to.id!==pid){ r.wedp={from:pid,to:to.id}; } return; }
    if(a.type==='wedn'){ if(r.wedp&&(r.wedp.from===pid||r.wedp.to===pid)) r.wedp=null; return; }
    if(a.type==='wedy'){ if(r.wedp&&r.wedp.to===pid){ r.marr=[r.wedp.from,pid]; r.wedp=null; log(r,`💍 ${r.P.find(x=>x.id===r.marr[0]).name} und ${me.name} heiraten! Keine Miete mehr füreinander.`); r.ev='buy'; } return; }
    if(a.type==='div'){ const o=spouse(r,me); if(o){ pay(r,me,150,o); r.marr=null; log(r,`💔 Scheidung: ${me.name} zahlt ${o.name} 150 €.`); } return; }
    if(a.type==='skipoff'){ const c=cur(r); if(c&&c.off&&Date.now()-c.off>20000){ log(r,`${c.name} ist offline – Zug übersprungen.`); r.auc=null; r.pq=null; r.pc=null; nextTurn(r); } return; }
    if(a.type==='tno'){ if(r.trade&&(r.trade.from===pid||r.trade.to===pid)) r.trade=null; return; }
    if(a.type==='tacc'){ const t=r.trade; if(!t||t.to!==pid) return; const f=r.P.find(x=>x.id===t.from);
      const ok=f&&!f.out&&f.money>=t.give.m&&me.money>=t.get.m&&t.give.p.every(i=>r.own[i]===t.from&&!hasH(r,i))&&t.get.p.every(i=>r.own[i]===pid&&!hasH(r,i));
      if(ok){ f.money+=t.get.m-t.give.m; me.money+=t.give.m-t.get.m; t.give.p.forEach(i=>r.own[i]=pid); t.get.p.forEach(i=>r.own[i]=t.from); log(r,`🤝 Handel: ${f.name} ⇄ ${me.name}`); r.ev='buy'; } else log(r,'Handel ungültig.');
      r.lt=ok?{from:t.from,to:pid,give:t.give,get:t.get}:r.lt; r.trade=null; return; }
    if(a.type==='break'){ const t=r.lt; if(!t||me.broke||(t.from!==pid&&t.to!==pid)) return;
      const f=r.P.find(x=>x.id===t.from),o=r.P.find(x=>x.id===t.to);
      const ok=!f.out&&!o.out&&f.money+t.give.m-t.get.m>=0&&o.money-t.give.m+t.get.m>=0&&t.give.p.every(i=>r.own[i]===o.id&&!hasH(r,i))&&t.get.p.every(i=>r.own[i]===f.id&&!hasH(r,i));
      if(!ok){ log(r,'Rückgängig nicht mehr möglich.'); return; }
      f.money+=t.give.m-t.get.m; o.money+=t.get.m-t.give.m; t.give.p.forEach(i=>r.own[i]=f.id); t.get.p.forEach(i=>r.own[i]=o.id);
      me.broke=1; r.lt=null; log(r,`💔 WE WERE ON A BREAK! ${me.name} macht den Handel rückgängig.`); return; }
    if(r.auc){ auc(r,me,a); return; }
  }
  if(a.type==='build'&&me&&!me.out&&r.st==='play'){
    const i=a.idx,s=B[i]; if(s[1]!=='prop'||r.own[i]!==pid||!owns(r,pid,s[3])||(r.h[i]||0)>=5||B.some((x,j)=>x[3]===s[3]&&r.mg[j])) return;
    const c=GR[s[3]][1]*(r.S.fast?0.5:1); if(me.money<c) return;
    me.money-=c; r.h[i]=(r.h[i]||0)+1; log(r,`${me.name} baut auf ${s[0]}.`); r.ev='build'; return;
  }
  if(r.st!=='play'||!p||p.id!==pid) return;
  if(a.type==='roll'&&r.ph==='roll'){
    let d=r.S.bag?[draw(r),draw(r)]:[1+Math.random()*6|0,1+Math.random()*6|0]; if(p.arm==='ross'){ const e=[1+Math.random()*6|0,1+Math.random()*6|0]; if(e[0]+e[1]>d[0]+d[1]) d=e; p.arm=null; log(r,`${p.name}: PIVOT!`); } const dbl=d[0]===d[1]; r.dice=d; r.card=null; r.ev='roll';
    if(p.jail){
      if(dbl){ p.jail=0; log(r,`${p.name} würfelt Pasch und kommt frei.`); }
      else if(++p.jail>3){ pay(r,p,50); p.jail=0; log(r,`${p.name} zahlt 50 € Kaution.`); }
      else { r.ph='end'; return; }
      r.dbl=0;
    } else if(dbl&&++r.dbl===3){ log(r,`${p.name}: 3× Pasch!`); jail(r,p); r.ph='end'; return; }
    else if(!dbl) r.dbl=0;
    const steps=d[0]+d[1], np=(p.pos+steps)%40;
    if(np<p.pos){ p.cd=Math.max(0,(p.cd||0)-1); p.money+=200; const sp=spouse(r,p); if(sp&&!sp.out) sp.money+=50; log(r,`${p.name} kassiert 200 € für LOS.`); }
    p.pos=np; if(np===0&&r.S.doubleGo){ p.money+=200; log(r,`Doppelt Geld auf LOS! +200 €`); }
    log(r,`${p.name} würfelt ${d[0]}+${d[1]} → ${B[np][0]}`); land(r,p);
  }
  else if(a.type==='qans'&&r.ph==='quiz'){ const c=r.pq; r.pq=null; r.ph='end';
    if(+a.idx===c.ok){ p.money+=c.m; log(r,`✅ ${p.name} weiß es: +${c.m} €`); } else { pay(r,p,20); log(r,`❌ ${p.name} liegt falsch: −20 €`); } }
  else if(a.type==='cho'&&r.ph==='choice'){ const o=r.pc.ch[+a.idx]; if(!o) return; r.pc=null; r.ph='end'; log(r,`${p.name} wählt: ${o[0]}`); apply(r,p,o[1]); }
  else if(a.type==='ability'&&r.S.abil&&!(p.cd>0)&&(r.ph==='roll'||r.ph==='end')){
    const k=p.tok; let used=true;
    if(k==='Joey'||k==='Chandler'||k==='Ross'){ p.arm=k.toLowerCase(); log(r,`✨ ${p.name}: ${ABIL[k][0]} ist aktiv`); }
    else if(k==='Monica'){ let b=-1; const hc=i=>GR[B[i][3]][1]; B.forEach((x,i)=>{ if(x[1]==='prop'&&r.own[i]===p.id&&owns(r,p.id,x[3])&&(r.h[i]||0)<5&&hc(i)<=100&&(b<0||hc(i)>hc(b)||(hc(i)===hc(b)&&(r.h[i]||0)<(r.h[b]||0)))) b=i; });
      if(b<0) used=false; else { r.h[b]=(r.h[b]||0)+1; log(r,`✨ Monica baut gratis auf ${B[b][0]}`); } }
    else if(k==='Rachel'){ p.money+=100; log(r,'✨ Rachel löst den Gutschein ein: +100 €'); }
    else if(k==='Phoebe'){ r.P.forEach(x=>{ if(x!==p&&!x.out){ const m=Math.min(30,x.money); x.money-=m; p.money+=m; } }); log(r,'✨ Phoebe singt „Smelly Cat“: 30 € von jedem!'); }
    else if(k==='Marcel'){ const t=r.P.filter(x=>x!==p&&!x.out).sort((x,y)=>y.money-x.money)[0]; if(!t) used=false; else { const m=Math.min(50,t.money); t.money-=m; p.money+=m; log(r,`✨ Marcel klaut ${m} € von ${t.name}`); } }
    else if(k==='Gunther'){ const m=Math.min(100,10*Object.values(r.own).filter(x=>x===p.id).length); p.money+=m; log(r,`✨ Gunther: Schichtbeginn +${m} €`); }
    if(used) p.cd=3; else log(r,'Fähigkeit hier nicht einsetzbar.');
  }
  else if(a.type==='pay'&&r.ph==='roll'&&p.jail){ pay(r,p,50); p.jail=0; log(r,`${p.name} zahlt 50 € und ist frei.`); }
  else if(a.type==='buy'&&r.ph==='buy'){ const s=B[r.pend]; if(p.money<s[2]) return; p.money-=s[2]; r.own[r.pend]=p.id; log(r,`${p.name} kauft ${s[0]}.`); r.ev='buy'; r.ph='end'; }
  else if(a.type==='skip'&&r.ph==='buy'){ if(r.S.auction){ r.auc={idx:r.pend,bid:0,lead:null,pass:[],t:r.turn}; r.ph='auc'; log(r,`🔨 Auktion: ${B[r.pend][0]}`); } else r.ph='end'; }
  else if(a.type==='end'&&r.ph==='end'){
    if(r.dbl>0&&!p.jail&&!p.out&&!r.jailed) r.ph='roll'; else nextTurn(r);
  }
  if(p.out&&r.st==='play') nextTurn(r);
}

io.on('connection', sock=>{
  let r=null, pid=null;
  const push=()=>{ save(); io.to(r.code).emit('state',{...r,cc:undefined,ec:undefined,pq:r.pq?{q:r.pq.q,a:r.pq.a}:null,board:B,groups:GR,tokens:TOK,abil:ABIL}); };
  sock.on('join',({code,name,id})=>{
    r=room(code); pid=id; sock.join(code);
    let p=r.P.find(x=>x.id===id);
    if(!p){ if(r.st!=='lobby'||r.P.length>=4) return sock.emit('full');
      p={id,name:(name||'Gast').slice(0,14),tok:TOK.find(t=>!r.P.some(x=>x.tok===t)),money:r.S.money,pos:0,jail:0,out:false}; r.P.push(p); }
    p.off=0; push();
  });
  sock.on('disconnect',()=>{ if(!r) return; const p=r.P.find(x=>x.id===pid); if(p){ p.off=Date.now(); push(); } });
  sock.on('lobby',o=>{ if(!r||r.st!=='lobby') return; const me=r.P.find(x=>x.id===pid);
    if(o.tok&&TOK.includes(o.tok)&&!r.P.some(x=>x.tok===o.tok)) me.tok=o.tok;
    if(r.P[0].id===pid&&o.S){ const s=o.S; r.S={money:Math.min(Math.max(+s.money||1500,100),20000),doubleGo:!!s.doubleGo,jackpot:!!s.jackpot,fast:!!s.fast,auction:!!s.auction,abil:!!s.abil,episodes:!!s.episodes,bag:!!s.bag}; }
    if(o.start&&r.P[0].id===pid&&r.P.length>=2){ r.st='play'; r.P.forEach(p=>{p.money=r.S.money;p.cd=0;p.arm=null});r.tc=0; log(r,'Das Spiel beginnt – Could we BE any more ready?'); }
    push(); });
  sock.on('act',a=>{ if(!r) return; try{ act(r,pid,a); }catch(e){ console.log('ERR',a&&a.type,e.stack.split('\n').slice(0,3).join(' | ')); } push(); });
});
srv.listen(process.env.PORT||3000,()=>console.log('Friends Monopoly läuft auf Port '+(process.env.PORT||3000)));
