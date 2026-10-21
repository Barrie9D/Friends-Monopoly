// UI-Smoke-Test: 2 echte Client-Fenster (jsdom) spielen gegeneinander, Fehler im Client werden gemeldet.
const { JSDOM, VirtualConsole, ResourceLoader } = require('jsdom'); const { spawn } = require('child_process');
const srv = spawn('node', ['server.js'], { env: { ...process.env, PORT: 3457, SAVE_FILE: '/dev/null' }, stdio: 'inherit' }); const errs = [];
setTimeout(async () => {
  const mk = n => { const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(n + ': ' + (e.detail && e.detail.stack || e.message).split('\n').slice(0, 3).join(' | ')));
    return JSDOM.fromURL('http://localhost:3457/?r=UI' + process.argv[2], { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc, beforeParse: w => { w.localStorage.fmid = 'id' + n; } }); };
  const W = [await mk('A'), await mk('B')]; await new Promise(r => setTimeout(r, 1500));
  W.forEach((d, i) => { d.window.document.querySelector('#nm').value = 'P' + i; d.window.eval('join()'); }); await new Promise(r => setTimeout(r, 800));
  W[0].window.eval("sock.emit('lobby',{S:{money:1500,doubleGo:1,jackpot:1,fast:1,auction:1,abil:1,episodes:1},start:1})");
  let n = 0, cells = 0, toks = 0, dice = 0;
  const iv = setInterval(() => { n++; for (const d of W) { const w = d.window; const S = w.eval('S'); if (!S || S.st !== 'play') continue; const myid = w.eval('id');
    const me = S.P.find(p => p.id === myid), cur = S.P[S.turn]; const doc = w.document;
    if (n % 20 === 0) { cells = Math.max(cells, doc.querySelectorAll('.c').length); toks = Math.max(toks, doc.querySelectorAll('.tok').length); dice = Math.max(dice, doc.querySelectorAll('.cube b').length); }
    if (S.auc) { if (S.P[S.auc.t].id === me.id) w.eval(Math.random() < .4 && me.money > S.auc.bid + 5 ? `sock.emit('act',{type:'abid',amt:${S.auc.bid + 5}})` : "act('apass')"); continue; }
    if (cur.id !== me.id) { if (Math.random() < .05) w.eval('D=' + (Math.random() * 40 | 0) + ';render()'); continue; }
    const ph = S.ph; w.eval(ph === 'roll' ? "act('roll')" : ph === 'buy' ? (Math.random() < .6 ? "act('buy')" : "act('skip')") : ph === 'quiz' ? "sock.emit('act',{type:'qans',idx:0})" : ph === 'choice' ? "sock.emit('act',{type:'cho',idx:0})" : "act('end')"); } }, 60);
  setTimeout(() => { clearInterval(iv); const S = W[0].window.eval('S'); console.log('Zellen', cells, '| Tokens', toks, '| Würfelflächen', dice, '| Aktionen-Ticks', n, '| Log', S.log[0], '| Client-Fehler', errs.length, errs.slice(0, 3)); srv.kill(); process.exit(errs.length ? 1 : 0); }, 25000);
}, 800);
