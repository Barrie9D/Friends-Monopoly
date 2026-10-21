// Bot-Test: 3 Spieler spielen zufällig, alle Optionen an. Prüft auf Abstürze/NaN.
const { io } = require('socket.io-client'); const { spawn } = require('child_process');
const srv = spawn('node', ['server.js'], { env: { ...process.env, PORT: 3456, SAVE_FILE: '/dev/null' }, stdio: 'inherit' });
setTimeout(() => {
  const names = ['A','B','C']; let last = '', lastT = Date.now(), stalls = 0, S, acts = 0, done = false, errs = [];
  const socks = names.map((n, i) => { const s = io('http://localhost:3456'); s.on('connect', () => s.emit('join', { code: 'T' + process.argv[2], name: n, id: 'id' + n }));
    s.on('state', st => { if (i === 0) { S = st; const g = JSON.stringify([st.ph, st.turn, st.dice, st.log[0], st.P.map(p => p.money), st.auc, st.trade, st.pq && 1, st.pc && 1]); if (g !== last) { last = g; lastT = Date.now(); setImmediate(step); } } }); return s; });
  const hist=[]; const act = (i, a) => { acts++; hist.push(S.ph+':'+a.type+':'+S.P[i].name+(S.auc?'@'+S.auc.t:'')); if(hist.length>14) hist.shift(); socks[names.indexOf(S.P[i].name)].emit('act', a); };
  const R = a => a[Math.random() * a.length | 0];
  const tr=[]; function step() { if(S.st==='play'){tr.push(S.ph+'|'+S.turn+'|'+S.dice+'|'+S.dbl+'|'+(S.log[0]||'').slice(0,40)); if(tr.length>14) tr.shift();}
    if (done) return;
    if (S.st === 'lobby') { if (S.P.length === 3 && !S.started) { S.started = 1; socks[names.indexOf(S.P[0].name)].emit('lobby', { S: { money: 1500, doubleGo: 1, jackpot: 1, fast: 1, auction: 1, abil: 1, episodes: 1, bag: 1 }, start: 1 }); } return; }
    if (S.P.some(p => !(p.money === p.money) || p.money % 1)) { errs.push('NaN/Bruch Geld'); }
    if (S.st === 'over' || acts > 6000) { done = true; console.log(tr.join('\n'));console.log('PH',S.ph,S.turn,JSON.stringify(S.auc),JSON.stringify(S.pq),JSON.stringify(S.pc),S.P.map(p=>[p.name,p.money,p.pos,p.jail,p.out]).join('|'),S.log.slice(0,8),JSON.stringify(S.dice),S.dbl,S.ph);  console.log(S.st === 'over' ? 'Spiel Ende, Sieger: ' + S.winner : 'Limit erreicht', '| Aktionen', acts, '| Fehler', errs, '| Hänger', stalls, '| Runden', S.tc); socks.forEach(s => s.close()); srv.kill(); process.exit(errs.length ? 1 : 0); }
    if (S.auc) { const t = S.auc.t, me = S.P[t]; const n = S.auc.bid + 1 + (Math.random() * 40 | 0);
      return act(t, Math.random() < .5 && me.money >= n ? { type: 'abid', amt: n } : { type: 'apass' }); }
    const i = S.turn, p = S.P[i];
    if (S.wedp && Math.random() < .6) return act(S.P.findIndex(x => x.id === S.wedp.to), { type: 'wedy' });
    if (S.trade && Math.random() < .3) return act(S.P.findIndex(x => x.id === S.trade.to), { type: 'tacc' });
    if (S.ph === 'roll') { if (p.jail && Math.random() < .3) return act(i, { type: 'pay' }); if (Math.random() < .2) act(i, { type: 'ability' }); return act(i, { type: 'roll' }); }
    if (S.ph === 'buy') return act(i, { type: Math.random() < .6 ? 'buy' : 'skip' });
    if (S.ph === 'quiz') return act(i, { type: 'qans', idx: Math.random() * 3 | 0 });
    if (S.ph === 'choice') return act(i, { type: 'cho', idx: Math.random() * 2 | 0 });
    if (S.ph === 'end') { if (Math.random() < .3) { const k = Object.keys(S.own).filter(k => S.own[k] === p.id); if (k.length) act(i, { type: 'build', idx: +R(k) }); }
      if (Math.random() < .08) act(i, { type: 'break' });
      { const k = Object.keys(S.own).filter(k => S.own[k] === p.id); if (k.length && Math.random() < .15) act(i, { type: R(['mort', 'unmort', 'sell']), idx: +R(k) }); }
      if (Math.random() < .04) { const o = R(S.P.filter(x => x.id !== p.id && !x.out)); if (o) act(i, { type: 'wedp', to: o.id }); } if (Math.random() < .02) act(i, { type: 'div' });
      if (Math.random() < .1) { const o = R(S.P.filter(x => x.id !== p.id && !x.out)); if (o) act(i, { type: 'tprop', to: o.id, give: { m: 50, p: [] }, get: { m: 0, p: [] } }); }
      return act(i, { type: 'end' }); }
  }
  setInterval(() => { if (S && !done && Date.now() - lastT > 400) { stalls++; lastT = Date.now(); step(); } }, 200);
  process.on('uncaughtException', e => { console.log('FEHLER', e); process.exit(2); });
}, 800);
