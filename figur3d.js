/* 3D-Vorführfigur für Satzbuch.
   Eine Gliederpuppe aus Kapseln wird pro Bild aus einer Pose berechnet (Vorwärtskinematik plus
   Zwei-Gelenk-IK für Hände und Füße). Die Bewegungen stehen in bewegungen.js (window.BEWEGUNGEN).
   Koordinaten in Metern: x = Blickrichtung der Figur im Stand, y = oben, z = linke Körperseite.
   Pose: p Hüfte, r Rumpfwinkel, b Rundrücken, k Kopf; t ist in den Schlüsseln die Zeit.
   Winkel in Grad, gemessen von „oben“ in Richtung x (90 = nach vorn, 180 = nach unten). */
import * as THREE from './vendor/three.module.min.js';

const R = Math.PI / 180;
const M = { schien: .44, ober: .45, knoechel: .08, unten: .24, oben: .30, hals: .08, oa: .30, ua: .26, griff: .06, schulterZ: .19, schulterTief: .04, hueftZ: .10 };
const FARBE = { koerper: 0xd9d0c3, fokus: 0xff6a2b, metall: 0x34302c, gummi: 0x1c1a19, polster: 0x2a2624, holz: 0x9a7650, band: 0xff8a4a, seil: 0xe8e2d8 };

/* ---------- Vektoren ---------- */
const v = (x = 0, y = 0, z = 0) => [x, y, z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = a => Math.hypot(a[0], a[1], a[2]);
const norm = a => { const l = len(a) || 1; return mul(a, 1 / l); };
const mix = (a, b, f) => a + (b - a) * f;
/* Richtung aus Winkel a (sagittal) und Abspreizung s zur Seite (side = +1 links, -1 rechts) */
const dir = (a, s = 0, side = 1) => [Math.sin(a * R) * Math.cos(s * R), Math.cos(a * R) * Math.cos(s * R), side * Math.sin(s * R)];
const winkel2d = d => Math.atan2(d[0], d[1]) / R;

/* Zwei-Gelenk-IK: Wurzel S, Ziel T, Längen a/b, Hinweisrichtung H fürs Mittelgelenk */
function ik(S, T, a, b, H){
  let d = sub(T, S), dl = len(d);
  const maxL = a + b - 1e-4, minL = Math.abs(a - b) + 1e-3;
  if(dl > maxL){ d = mul(d, maxL / dl); dl = maxL; }
  if(dl < minL){ d = mul(norm(d), minL); dl = minL; }
  const n = mul(d, 1 / dl);
  let m = sub(H, mul(n, dot(H, n)));
  if(len(m) < 1e-5) m = Math.abs(n[1]) < .9 ? [0, 1, 0] : [1, 0, 0];
  m = norm(m);
  const cosA = Math.min(1, Math.max(-1, (a * a + dl * dl - b * b) / (2 * a * dl))), sinA = Math.sqrt(1 - cosA * cosA);
  const mid = add(S, add(mul(n, a * cosA), mul(m, a * sinA)));
  return { mid, end: add(S, d) };
}

/* ---------- Pose → Gelenke ---------- */
const STANDARD = { p: [0, .97], pz: 0, r: 0, b: 0, k: 0, a: [180, 180], l: [180, 180], roll: 0 };
function gliedSpec(pose, seite){ return Object.assign({}, pose, pose[seite] || {}); }

function loese(pose){
  const side = { L: 1, R: -1 };
  const H = v(pose.p[0], pose.p[1], pose.pz || 0);
  const T1 = dir(pose.r), T2 = dir(pose.r + pose.b), F2 = dir(pose.r + pose.b + 90);
  const W = add(H, mul(T1, M.unten));
  const N = add(W, mul(T2, M.oben));
  const K = dir(pose.r + pose.b + pose.k);
  const g = { H, W, N, T1, T2, F2, kopf: add(N, mul(K, M.hals + .1)), halsEnde: add(N, mul(K, M.hals)) };

  for(const S of ['L', 'R']){
    const sd = side[S], sp = gliedSpec(pose, S);
    /* Arm */
    const Sh = add(sub(N, mul(T2, M.schulterTief)), v(0, 0, sd * M.schulterZ));
    let E, Wr, Gr, handDir;
    const flach = sp.hd != null;
    const uaL = flach ? M.ua : M.ua + M.griff;
    let ziel = null;
    if(sp.h) ziel = v(sp.h[0], sp.h[1], sp.h[2] != null ? sd * sp.h[2] : Sh[2] + sd * (sp.az || 0));
    else if(sp.hb){ const z = add(W, add(mul(T2, sp.hb[0]), mul(F2, sp.hb[1]))); ziel = v(z[0], z[1], Sh[2] + sd * (sp.az || 0)); }
    if(ziel){
      const hh = sp.ah || [-1, 0];
      const r = ik(Sh, ziel, M.oa, uaL, v(hh[0], hh[1], sd * (sp.ahz != null ? sp.ahz : .35)));
      E = r.mid; const fd = norm(sub(r.end, E));
      Wr = add(E, mul(fd, M.ua));
      handDir = flach ? dir(sp.hd) : fd;
      Gr = flach ? add(Wr, mul(handDir, .05)) : r.end;
    } else {
      const ab = sp.arel ? pose.r + pose.b : 0;
      const U = dir(sp.a[0] + ab, sp.as || 0, sd), Fo = dir(sp.a[1] + ab, sp.as2 != null ? sp.as2 : (sp.as || 0), sd);
      E = add(Sh, mul(U, M.oa)); Wr = add(E, mul(Fo, M.ua));
      handDir = flach ? dir(sp.hd) : Fo; Gr = add(Wr, mul(handDir, M.griff));
    }
    g['sch' + S] = Sh; g['ell' + S] = E; g['hgl' + S] = Wr; g['grf' + S] = Gr; g['hd' + S] = handDir;

    /* Bein */
    const Hp = add(H, v(0, 0, sd * M.hueftZ));
    let Kn, An;
    if(sp.f){
      const fz = sp.f[2] != null ? sd * sp.f[2] : Hp[2] + sd * (sp.fz != null ? sp.fz : .03);
      const kh = sp.lh || [1, 0];
      const r = ik(Hp, v(sp.f[0], sp.f[1], fz), M.ober, M.schien, v(kh[0], kh[1], sd * (sp.lhz != null ? sp.lhz : .12)));
      Kn = r.mid; An = r.end;
    } else {
      const lb = sp.lrel ? pose.r : 0;
      Kn = add(Hp, mul(dir(sp.l[0] + lb, sp.ls || 0, sd), M.ober));
      An = add(Kn, mul(dir(sp.l[1] + lb, sp.ls2 != null ? sp.ls2 : (sp.ls || 0), sd), M.schien));
    }
    const schienW = winkel2d(sub(An, Kn));
    const fussW = sp.fa != null ? sp.fa : schienW - 90 + (sp.fw || 0);
    g['hue' + S] = Hp; g['knie' + S] = Kn; g['kn' + S] = An; g['fuss' + S] = dir(fussW); g['fussN' + S] = dir(fussW - 90);
  }

  /* Seitlage o. Ä.: ganze Figur um die x-Achse drehen */
  if(pose.roll){
    const rp = pose.rp || [0, 0, 0], c = Math.cos(pose.roll * R), s = Math.sin(pose.roll * R);
    const rot = p => { const y = p[1] - rp[1], z = p[2] - rp[2]; return [p[0], rp[1] + y * c - z * s, rp[2] + y * s + z * c]; };
    const rotD = d => [d[0], d[1] * c - d[2] * s, d[1] * s + d[2] * c];
    for(const k of Object.keys(g)) g[k] = /^(T1|T2|F2|hd|fuss)/.test(k) ? rotD(g[k]) : rot(g[k]);
  }
  return g;
}

/* ---------- Zeitachse ---------- */
const glatt = x => x * x * (3 - 2 * x);
function lerpWert(a, b, f){
  if(Array.isArray(a) && Array.isArray(b)) return a.map((x, i) => b[i] == null ? x : mix(x, b[i], f));
  if(typeof a === 'number' && typeof b === 'number') return mix(a, b, f);
  return f < .5 ? a : b;
}
function mischePose(A, B, f){
  const o = {};
  for(const k of new Set([...Object.keys(A), ...Object.keys(B)])){
    if(k === 'L' || k === 'R'){ o[k] = mischePose(A[k] || {}, B[k] || {}, f); continue; }
    if(k === 'txt' || k === 't_') continue;
    o[k] = A[k] == null ? B[k] : B[k] == null ? A[k] : lerpWert(A[k], B[k], f);
  }
  return o;
}
/* Jeder Schlüssel erbt vom vorigen; Glied-Modus (Winkel/Ziel) wird beim Wechsel aus der Lösung übernommen */
function bereite(bw){
  const keys = [];
  let prev = { ...STANDARD };
  for(const k of bw.keys){
    const merged = { ...prev, ...k, L: { ...(prev.L || {}), ...(k.L || {}) }, R: { ...(prev.R || {}), ...(k.R || {}) } };
    for(const g of ['a', 'h', 'hb']) if(k[g]){ for(const o of ['a', 'h', 'hb']) if(o !== g){ delete merged[o]; } }
    for(const g of ['l', 'f']) if(k[g]){ delete merged[g === 'l' ? 'f' : 'l']; }
    for(const S of ['L', 'R']) if(k[S]){
      for(const g of ['a', 'h', 'hb']) if(k[S][g]) for(const o of ['a', 'h', 'hb']) if(o !== g) delete merged[S][o];
      for(const g of ['l', 'f']) if(k[S][g]) delete merged[S][g === 'l' ? 'f' : 'l'];
    }
    keys.push(merged); prev = merged;
  }
  return keys;
}
/* Zwei Posen mit unterschiedlichem Glied-Modus: Winkel aus der gelösten Pose ableiten */
function winkelAus(g, S){
  const w = (a, b) => winkel2d(sub(b, a));
  return { a: [w(g['sch' + S], g['ell' + S]), w(g['ell' + S], g['hgl' + S])], l: [w(g['hue' + S], g['knie' + S]), w(g['knie' + S], g['kn' + S])] };
}
function angleiche(A, B){
  const modus = (p, S, art) => { const sp = gliedSpec(p, S); return art === 'arm' ? (sp.h ? 'h' : sp.hb ? 'hb' : 'a') : (sp.f ? 'f' : 'l'); };
  let a = A, b = B;
  for(const S of ['L', 'R']) for(const art of ['arm', 'bein']){
    const ma = modus(a, S, art), mb = modus(b, S, art);
    if(ma === mb) continue;
    const ga = loese(a), gb = loese(b), wa = winkelAus(ga, S), wb = winkelAus(gb, S);
    const k = art === 'arm' ? 'a' : 'l', leer = art === 'arm' ? { h: null, hb: null, arel: false } : { f: null, lrel: false };
    a = { ...a, [S]: { ...(a[S] || {}), ...leer, [k]: wa[k] } }; b = { ...b, [S]: { ...(b[S] || {}), ...leer, [k]: wb[k] } };
  }
  return [a, b];
}
function poseBei(bw, keys, zeit){
  const T = bw.dauer, t = ((zeit % T) + T) % T;
  let i = keys.length - 1;
  for(let j = 0; j < keys.length; j++) if((bw.keys[j].t || 0) <= t) i = j;
  const j = (i + 1) % keys.length;
  const t0 = bw.keys[i].t || 0, t1 = j === 0 ? T : bw.keys[j].t;
  const f = t1 > t0 ? glatt(Math.min(1, (t - t0) / (t1 - t0))) : 0;
  const [A, B] = angleiche(keys[i], keys[j]);
  return { pose: mischePose(A, B, f), txt: bw.keys[i].txt || '', idx: i };
}

/* ---------- Szene ---------- */
let aktiv = null;
export function stoppe(){ if(aktiv){ aktiv.stop(); aktiv = null; } }

export function zeige(el, name){
  stoppe();
  const bw = (window.BEWEGUNGEN || {})[name];
  if(!bw) return null;
  const keys = bereite(bw);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const cv = renderer.domElement; cv.className = 'f3d-cv';
  el.prepend(cv);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 4 / 3, .05, 50);
  scene.add(new THREE.HemisphereLight(0xfff0e0, 0x20160f, .9));
  const key = new THREE.DirectionalLight(0xfff3e6, 2.1);
  key.position.set(2.2, 4.5, 3.2); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4; key.shadow.bias = -.0006;
  Object.assign(key.shadow.camera, { left: -2.6, right: 2.6, top: 3.2, bottom: -1.4, near: .5, far: 12 });
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xff7a3a, 2.4); rim.position.set(-3, 2.2, -2.5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x8fa6ff, .35); fill.position.set(-2, 1, 3); scene.add(fill);

  const geos = [], mats = [];
  const mat = (farbe, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: farbe, roughness: .62, metalness: 0, ...o }); mats.push(m); return m; };
  const koerper = mat(FARBE.koerper), fokus = mat(FARBE.fokus, { emissive: 0x6a1d00, emissiveIntensity: .55, roughness: .45 });
  const metall = mat(FARBE.metall, { metalness: .7, roughness: .35 }), gummi = mat(FARBE.gummi, { roughness: .8 });
  const polster = mat(FARBE.polster, { roughness: .9 }), holz = mat(FARBE.holz, { roughness: .7 });
  const bandM = mat(FARBE.band, { roughness: .6 }), seilM = mat(FARBE.seil, { roughness: .5 });

  /* Boden: Schattenfänger und weicher Lichtfleck */
  const bodenGeo = new THREE.CircleGeometry(6, 48); geos.push(bodenGeo);
  const sm = new THREE.ShadowMaterial({ opacity: .5 }); mats.push(sm);
  const boden = new THREE.Mesh(bodenGeo, sm); boden.rotation.x = -Math.PI / 2; boden.receiveShadow = true; scene.add(boden);
  const gc = document.createElement('canvas'); gc.width = gc.height = 256;
  const gx = gc.getContext('2d'), grd = gx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,120,50,.20)'); grd.addColorStop(.45, 'rgba(255,110,40,.07)'); grd.addColorStop(1, 'rgba(255,100,40,0)');
  gx.fillStyle = grd; gx.fillRect(0, 0, 256, 256);
  const glowTex = new THREE.CanvasTexture(gc);
  const glowM = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false }); mats.push(glowM);
  const glowGeo = new THREE.PlaneGeometry(4, 4); geos.push(glowGeo);
  const glow = new THREE.Mesh(glowGeo, glowM); glow.rotation.x = -Math.PI / 2; glow.position.y = .002; scene.add(glow);

  const fk = new Set(bw.fokus || []);
  const hat = (...ks) => ks.some(k => fk.has(k));
  const figur = new THREE.Group(); scene.add(figur);
  const kapsel = (r, l, m) => { const geo = new THREE.CapsuleGeometry(r, l, 6, 14); geos.push(geo); const me = new THREE.Mesh(geo, m); me.castShadow = true; figur.add(me); return { me, l }; };
  const kugel = (r, m) => { const geo = new THREE.SphereGeometry(r, 20, 14); geos.push(geo); const me = new THREE.Mesh(geo, m); me.castShadow = true; figur.add(me); return me; };
  const kasten = (x, y, z, m, ziel = scene) => { const geo = new THREE.BoxGeometry(x, y, z); geos.push(geo); const me = new THREE.Mesh(geo, m); me.castShadow = true; me.receiveShadow = true; ziel.add(me); return me; };
  const zylinder = (r, l, m, ziel = scene, seg = 14) => { const geo = new THREE.CylinderGeometry(r, r, l, seg); geos.push(geo); const me = new THREE.Mesh(geo, m); me.castShadow = true; ziel.add(me); return me; };

  const teile = {
    becken: kugel(.125, hat('gesaess', 'beine') ? fokus : koerper),
    bauch: kapsel(.115, M.unten - .04, hat('bauch', 'core') ? fokus : koerper),
    brust: kapsel(.13, M.oben - .1, hat('brust', 'ruecken', 'oberkoerper') ? fokus : koerper),
    hals: kapsel(.045, M.hals, koerper),
    kopf: kugel(.105, koerper),
  };
  teile.becken.scale.set(.85, .8, 1.45); teile.bauch.me.scale.set(.82, 1, 1.25); teile.brust.me.scale.set(.82, 1, 1.5); teile.kopf.scale.set(.95, 1.12, .9);
  for(const S of ['L', 'R']){
    teile['sch' + S] = kugel(.068, hat('schultern') ? fokus : koerper);
    teile['oa' + S] = kapsel(.052, M.oa - .02, hat('bizeps', 'trizeps', 'arme') ? fokus : koerper);
    teile['ua' + S] = kapsel(.042, M.ua - .02, hat('unterarme', 'arme') ? fokus : koerper);
    teile['hand' + S] = kapsel(.034, .06, koerper);
    teile['ob' + S] = kapsel(.075, M.ober - .03, hat('beine', 'oberschenkel', 'beinbeuger') ? fokus : koerper);
    teile['us' + S] = kapsel(.054, M.schien - .02, hat('beine', 'waden') ? fokus : koerper);
    teile['fuss' + S] = kasten(.21, .06, .085, koerper, figur);
  }

  /* Geräte */
  const geraete = [];
  const Y = new THREE.Vector3(0, 1, 0), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  const setzeZwischen = (me, a, b, laenge) => {
    tmpA.set(a[0], a[1], a[2]); tmpB.set(b[0], b[1], b[2]);
    me.position.copy(tmpA).add(tmpB).multiplyScalar(.5);
    const d = tmpB.sub(tmpA), l = d.length();
    if(l > 1e-6) me.quaternion.setFromUnitVectors(Y, d.multiplyScalar(1 / l));
    if(laenge) me.scale.set(1, l / laenge, 1);
  };
  const mitte = (a, b) => mul(add(a, b), .5);
  for(const pr of bw.props || []){
    const typ = pr.typ;
    if(typ === 'stange'){
      const l = pr.l || 1.3, bar = zylinder(.018, l, metall); bar.rotation.x = Math.PI / 2; bar.position.set(pr.x || 0, pr.y, pr.z || 0);
      if(pr.pfosten !== false) for(const s of [-1, 1]){ const p = zylinder(.03, pr.y + .02, metall); p.position.set(pr.x || 0, pr.y / 2, s * l / 2); }
    } else if(typ === 'barren'){
      const l = pr.l || 1.1, z = pr.z || .27;
      for(const s of [-1, 1]){
        const bar = zylinder(.022, l, metall); bar.rotation.z = Math.PI / 2; bar.position.set(pr.x || 0, pr.y, s * z);
        for(const e of [-1, 1]){ const p = zylinder(.025, pr.y, metall); p.position.set((pr.x || 0) + e * (l / 2 - .05), pr.y / 2, s * z); }
      }
    } else if(typ === 'parallettes'){
      for(const s of [-1, 1]){
        const bar = zylinder(.018, .42, holz); bar.rotation.z = Math.PI / 2; bar.position.set(pr.x || 0, pr.y || .12, s * (pr.z || .23));
        for(const e of [-1, 1]){ const p = kasten(.03, (pr.y || .12), .14, metall); p.position.set((pr.x || 0) + e * .17, (pr.y || .12) / 2, s * (pr.z || .23)); }
      }
    } else if(typ === 'block'){
      const g = pr.g || [.4, .45, .35];
      const me = kasten(g[0], g[1], g[2], pr.holz ? holz : polster);
      me.rotation.z = -(pr.r || 0) * R;
      if(pr.an) geraete.push({ upd: gl => { const a = anker(gl, pr.an); me.position.set(a[0] + (pr.c?.[0] || 0), a[1] + (pr.c?.[1] || 0), (pr.z || 0)); } });
      else me.position.set(pr.c[0], pr.c[1], pr.z || 0);
    } else if(typ === 'wand'){
      const me = kasten(.08, 2.6, 2.4, polster); me.position.set(pr.x + .04 * (pr.n || 1), 1.3, 0);
    } else if(typ === 'kh'){
      for(const S of pr.an === 'L' ? ['L'] : pr.an === 'R' ? ['R'] : pr.an === 'mitte' || pr.an === 'fuesse' ? ['M'] : ['L', 'R']){
        const grp = new THREE.Group(); scene.add(grp);
        const griff = zylinder(.016, .16, metall, grp); griff.rotation.x = Math.PI / 2;
        for(const s of [-1, 1]){ const sch = zylinder(.065, .05, gummi, grp, 18); sch.rotation.x = Math.PI / 2; sch.position.z = s * .1; }
        geraete.push({ upd: gl => {
          const p = pr.an === 'fuesse' ? add(mitte(gl.knL, gl.knR), [0, -.02, 0]) : S === 'M' ? mitte(gl.grfL, gl.grfR) : gl['grf' + S];
          grp.position.set(p[0], p[1], p[2]);
          if(pr.hammer){ const d = gl['hd' + (S === 'M' ? 'L' : S)]; tmpA.set(d[0], d[1], d[2]); grp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tmpA.normalize()); }
          else if(pr.quer){ grp.rotation.set(0, Math.PI / 2, 0); }
        } });
      }
    } else if(typ === 'lh' || typ === 'trapbar'){
      const grp = new THREE.Group(); scene.add(grp);
      const stg = zylinder(.016, 2.0, metall, grp); stg.rotation.x = Math.PI / 2;
      for(const s of [-1, 1]){ const sch = zylinder(pr.r || .225, .06, gummi, grp, 28); sch.rotation.x = Math.PI / 2; sch.position.z = s * .78; }
      if(typ === 'trapbar'){ for(const s of [-1, 1]){ const seite = zylinder(.016, .62, metall, grp); seite.rotation.z = Math.PI / 2; seite.position.z = s * .3; } }
      geraete.push({ upd: gl => { const p = gl.bar || anker(gl, pr.an || 'haende'); grp.position.set(p[0], p[1], 0); } });
    } else if(typ === 'kabel' || typ === 'band'){
      const dick = typ === 'band' ? .012 : .006;
      const ziele = pr.an === 'haende' && !pr.eins ? ['grfL', 'grfR'] : [null];
      const quelle = pr.von, fest = Array.isArray(quelle);
      if(typ === 'kabel' && fest && pr.turm !== false){ const t = kasten(.09, 2.3, .09, metall); t.position.set(quelle[0] + Math.sign(quelle[0]) * .06, 1.15, (quelle[2] || 0) + (Math.sign(quelle[2] || 0) * .1 || -.3)); }
      for(const zk of ziele){
        const me = zylinder(dick, 1, typ === 'band' ? bandM : seilM); me.castShadow = false;
        geraete.push({ upd: gl => {
          const z = zk ? gl[zk] : anker(gl, pr.an);
          const q = fest ? [quelle[0], quelle[1], zk ? z[2] * .6 + (quelle[2] || 0) : (quelle[2] || 0)] : anker(gl, quelle);
          setzeZwischen(me, q, z, 1);
        } });
      }
    } else if(typ === 'griff'){
      const me = zylinder(.017, pr.l || .9, metall); me.rotation.x = Math.PI / 2;
      geraete.push({ upd: gl => { const p = mitte(gl.grfL, gl.grfR); me.position.set(p[0], p[1], p[2]); } });
    } else if(typ === 'ringe'){
      for(const S of ['L', 'R']){
        const geo = new THREE.TorusGeometry(.09, .014, 10, 28); geos.push(geo);
        const ring = new THREE.Mesh(geo, holz); ring.castShadow = true; scene.add(ring);
        const gurt = zylinder(.008, 1, bandM); gurt.castShadow = false;
        geraete.push({ upd: gl => {
          const g = gl['grf' + S], c = [g[0], g[1] + .075, g[2]];
          ring.position.set(c[0], c[1], c[2]);
          setzeZwischen(gurt, [c[0], c[1] + .09, c[2]], [c[0] * .7 + (pr.x || 0) * .3, pr.top || 2.6, c[2]], 1);
        } });
      }
    } else if(typ === 'ball'){
      const me = kugel(pr.r || .13, gummi); figur.remove(me); scene.add(me);
      geraete.push({ upd: gl => { const p = gl.ball || mitte(gl.grfL, gl.grfR); me.position.set(p[0], p[1], p[2] || 0); } });
    } else if(typ === 'rad'){
      const geo = new THREE.TorusGeometry(.085, .03, 10, 26); geos.push(geo);
      const rad = new THREE.Mesh(geo, gummi); rad.castShadow = true; scene.add(rad);
      const achse = zylinder(.014, .36, metall); achse.rotation.x = Math.PI / 2;
      geraete.push({ upd: gl => { const p = mitte(gl.grfL, gl.grfR); rad.position.set(p[0], .115, 0); achse.position.set(p[0], .115, 0); rad.rotation.z = -p[0] / .115; } });
    } else if(typ === 'landmine'){
      const stg = zylinder(.02, 1, metall); const sch = zylinder(.2, .06, gummi, scene, 26);
      geraete.push({ upd: gl => {
        const g = pr.an === 'mitte' ? mitte(gl.grfL, gl.grfR) : gl['grf' + (pr.an || 'R')], pv = [pr.piv[0], pr.piv[1], 0];
        const d = norm(sub(g, pv)), ende = add(g, mul(d, .35));
        setzeZwischen(stg, pv, ende, 1); setzeZwischen(sch, add(ende, mul(d, -.12)), add(ende, mul(d, -.06)));
        sch.scale.set(1, 1, 1);
      } });
    } else if(typ === 'seil'){
      const pts = []; for(let i = 0; i <= 24; i++){ const a = i / 24 * Math.PI; pts.push(new THREE.Vector3(0, -Math.sin(a), -Math.cos(a))); }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 40, .008, 6, false); geos.push(geo);
      const me = new THREE.Mesh(geo, seilM); scene.add(me);
      geraete.push({ upd: (gl, zeit) => {
        const c = mitte(gl.grfL, gl.grfR), w = Math.abs(gl.grfL[2] - gl.grfR[2]) / 2;
        me.position.set(c[0], c[1], 0);
        me.rotation.set(0, 0, -zeit * 2 * Math.PI / (bw.seilTakt || .5));
        me.scale.set(c[1] + .02, c[1] + .02, w);
      } });
    }
  }
  function anker(gl, an){
    switch(an){
      case 'haende': return mitte(gl.grfL, gl.grfR);
      case 'L': return gl.grfL; case 'R': return gl.grfR;
      case 'fuesse': return mitte(gl.knL, gl.knR);
      case 'fussL': return gl.knL; case 'fussR': return gl.knR;
      case 'knie': return mitte(gl.knieL, gl.knieR);
      case 'huefte': return add(gl.H, mul(gl.F2, .14));
      case 'nacken': return add(gl.N, add(mul(gl.F2, -.1), mul(gl.T2, -.03)));
      case 'brust': return add(gl.N, add(mul(gl.F2, .14), mul(gl.T2, -.06)));
      case 'becken': return gl.H;
      default: return gl.H;
    }
  }

  /* Figur pro Bild setzen */
  const quat = new THREE.Quaternion(), basis = new THREE.Matrix4(), vx = new THREE.Vector3(), vy = new THREE.Vector3(), vz = new THREE.Vector3();
  function rumpf(me, a, b, gl){
    me.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    vy.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
    vx.set(gl.F2[0], gl.F2[1], gl.F2[2]);
    vz.crossVectors(vx, vy).normalize(); vx.crossVectors(vy, vz).normalize();
    basis.makeBasis(vx, vy, vz); me.quaternion.setFromRotationMatrix(basis);
  }
  function setze(gl){
    const T = teile;
    T.becken.position.set(...gl.H); rumpf(T.becken, sub(gl.H, gl.T1), add(gl.H, gl.T1), gl);
    rumpf(T.bauch.me, gl.H, gl.W, gl);
    rumpf(T.brust.me, add(gl.W, mul(gl.T2, .05)), sub(gl.N, mul(gl.T2, .03)), gl);
    setzeZwischen(T.hals.me, gl.N, gl.halsEnde);
    T.kopf.position.set(...gl.kopf); T.kopf.quaternion.copy(T.hals.me.quaternion);
    for(const S of ['L', 'R']){
      T['sch' + S].position.set(...gl['sch' + S]);
      setzeZwischen(T['oa' + S].me, gl['sch' + S], gl['ell' + S]);
      setzeZwischen(T['ua' + S].me, gl['ell' + S], gl['hgl' + S]);
      setzeZwischen(T['hand' + S].me, gl['hgl' + S], add(gl['hgl' + S], mul(gl['hd' + S], .09)));
      setzeZwischen(T['ob' + S].me, gl['hue' + S], gl['knie' + S]);
      setzeZwischen(T['us' + S].me, gl['knie' + S], gl['kn' + S]);
      const fd = gl['fuss' + S], fn = gl['fussN' + S], k = gl['kn' + S];
      const fm = T['fuss' + S];
      fm.position.set(k[0] + fd[0] * .06 - fn[0] * .05, k[1] + fd[1] * .06 - fn[1] * .05, k[2] + fd[2] * .06 - fn[2] * .05);
      vx.set(fd[0], fd[1], fd[2]).normalize(); vy.set(fn[0], fn[1], fn[2]).normalize(); vz.crossVectors(vx, vy).normalize(); vy.crossVectors(vz, vx);
      basis.makeBasis(vx, vy, vz); fm.quaternion.setFromRotationMatrix(basis);
    }
  }

  /* Bildausschnitt aus allen Gelenkpunkten der Bewegung */
  const box = new THREE.Box3();
  for(let i = 0; i < 40; i++){
    const gl = loese(poseBei(bw, keys, bw.dauer * i / 40).pose);
    for(const k of ['H', 'kopf', 'grfL', 'grfR', 'knL', 'knR', 'knieL', 'knieR', 'ellL', 'ellR']) box.expandByPoint(tmpA.set(...gl[k]));
  }
  for(const pr of bw.props || []){
    if(pr.typ === 'stange' || pr.typ === 'barren') box.expandByPoint(tmpA.set(pr.x || 0, pr.y + .05, 0));
    if(pr.typ === 'block' && pr.c && !pr.an) box.expandByPoint(tmpA.set(pr.c[0], pr.c[1], 0));
  }
  box.expandByPoint(tmpA.set(box.min.x, 0, 0));
  const ziel = box.getCenter(new THREE.Vector3()), groesse = box.getSize(new THREE.Vector3());
  glow.position.x = ziel.x;
  key.target.position.copy(ziel); key.position.set(ziel.x + 2.2, 4.5, 3.2);

  let breite = 0, hoehe = 0;
  function passe(){
    const w = el.clientWidth || 320, h = Math.round(Math.min(360, w * .78));
    if(w === breite && h === hoehe) return;
    breite = w; hoehe = h; renderer.setSize(w, h, false); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cam.aspect = w / h; cam.updateProjectionMatrix();
  }
  passe();

  /* Steuerung: ziehen dreht, tippen pausiert */
  let drehung = 0, ziehX = null, gezogen = false, pause = false, zeit = 0, letzt = performance.now();
  const basisW = (bw.cam ?? 32) * R;
  cv.addEventListener('pointerdown', e => { ziehX = e.clientX; gezogen = false; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if(ziehX == null) return; const d = e.clientX - ziehX; if(Math.abs(d) > 3) gezogen = true; drehung += d * .012; ziehX = e.clientX; });
  cv.addEventListener('pointerup', () => { if(!gezogen){ pause = !pause; el.classList.toggle('pausiert', pause); } ziehX = null; });
  const capEl = el.querySelector('.f3d-cap');

  let sichtbar = true, lauf = true, raf = 0, letzterTxt = null;
  const io = new IntersectionObserver(es => { sichtbar = es[0].isIntersecting; }); io.observe(el);
  function bild(now){
    if(!lauf) return;
    if(!el.isConnected){ stop(); return; }
    raf = requestAnimationFrame(bild);
    const dt = Math.min(.05, (now - letzt) / 1000); letzt = now;
    if(!sichtbar) return;
    zeichne(dt);
  }
  /* Tests: window.__f3dZeichne() zeichnet sofort ein Bild, auch wenn der Tab im Hintergrund ist */
  window.__f3dZeichne = () => zeichne(0);
  function zeichne(dt){
    passe();
    if(!pause) zeit += dt;
    if(window.__f3dZeit != null) zeit = window.__f3dZeit;  /* nur für Tests: feste Zeit */
    const { pose, txt } = poseBei(bw, keys, zeit);
    if(bw.fade){ const tt = zeit % bw.dauer; cv.style.opacity = Math.max(0, Math.min(1, tt / .25, (bw.dauer - tt) / .25)).toFixed(2); }
    const gl = loese(pose);
    if(pose.bar) gl.bar = [pose.bar[0], pose.bar[1], 0];
    if(pose.ball) gl.ball = pose.ball;
    setze(gl);
    for(const g of geraete) g.upd(gl, zeit);
    if(capEl && txt !== letzterTxt){ capEl.textContent = txt; capEl.classList.toggle('leer', !txt); letzterTxt = txt; }
    const az = basisW + drehung + (pause || ziehX != null ? 0 : Math.sin(zeit * 2 * Math.PI / 18) * .42);
    const halb = Math.max(groesse.y / 2, Math.max(groesse.x, groesse.z, .9) / 2 / cam.aspect, .55) * 1.22;
    const rad = halb / Math.tan(15 * R) + Math.max(groesse.x, groesse.z) * .25;
    cam.position.set(ziel.x + Math.sin(az) * rad, ziel.y + rad * .22, ziel.z + Math.cos(az) * rad);
    cam.lookAt(ziel.x, ziel.y, ziel.z);
    renderer.render(scene, cam);
  }
  raf = requestAnimationFrame(bild);

  function stop(){
    if(!lauf) return; lauf = false; cancelAnimationFrame(raf); io.disconnect();
    for(const g of geos) g.dispose(); for(const m of mats){ m.map?.dispose(); m.dispose(); }
    glowTex.dispose(); renderer.dispose(); renderer.forceContextLoss?.(); cv.remove();
    if(aktiv?.stop === stop) aktiv = null;
  }
  aktiv = { stop };
  return aktiv;
}
