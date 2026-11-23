/* Bewegungsabläufe für die 3D-Figur (figur3d.js).
   Jede Bewegung: dauer (s), keys [{ t: Zeit, Pose…, txt }], props (Geräte), fokus (Muskeln in Orange), cam (Blickwinkel in Grad, 0 = genau von der Seite).
   Pose: p [x, y] Hüfte, pz seitlich, r Rumpfwinkel, b Rundrücken, k Kopf,
         a [Oberarm, Unterarm] (arel: relativ zum Rumpf) oder h [x, y] Handziel / hb [entlang, vor] Handziel am Oberkörper,
         l [Oberschenkel, Schienbein] (lrel: relativ zum Rumpf) oder f [x, y] Fußziel, as/ls seitlich abspreizen, L/R: nur eine Seite.
   Winkel in Grad ab „oben“ Richtung vorn: 0 oben, 90 vorn, 180 unten, -90 hinten.
   Haltung und Ablauf sind nach Tutorial-Videos nachgestellt (Standbilder der eingebetteten YouTube-Videos). */
(() => {
  const B = {};
  const SIN = a => Math.sin(a * Math.PI / 180), COS = a => Math.cos(a * Math.PI / 180);
  const ATAN = (x, y) => Math.atan2(x, y) * 180 / Math.PI;
  const STAND = .97, STANGE = 2.25, KOERPER = .89 + .50;
  const FUESSE = { f: [0, .08], fz: .05, lh: [1, 0], lhz: .25 };
  const gleich = (quelle, ...namen) => { for(const n of namen) B[n] = B[quelle]; };

  /* Gerader Körper von den Füßen bis zur Schulter (Liegestütz, Planche, Stütz) */
  function brett(fx, fy, sh){
    const al = Math.asin(Math.max(-1, Math.min(1, (sh - fy) / KOERPER))) * 180 / Math.PI;
    return { p: [fx + COS(al) * .89, fy + SIN(al) * .89], r: 90 - al, sx: fx + COS(al) * KOERPER };
  }
  const ohneSx = o => { const c = { ...o }; delete c.sx; return c; };

  /* ---------- Liegestütz-Familie ---------- */
  function liegestuetz(o = {}){
    const fy = o.fy ?? .1, handY = o.handY ?? .05, flach = !(o.ring || o.griff), reich = flach ? .55 : .61;
    const A = brett(0, fy, handY + reich - (o.vor ? .03 : 0)), U = brett(0, fy, handY + (o.tief ?? .24));
    const hx = A.sx - (o.vor || 0);
    const hand = { h: [hx, handY], az: o.az ?? .04, ah: o.ah || [-1, .4] };
    if(flach) hand.hd = 90;
    const props = (o.props || []).map(pr => pr.an === 'hand' ? { ...pr, x: hx - .02 } : pr);
    const keys = [
      { t: 0, ...ohneSx(A), ...hand, f: [0, fy], fa: o.fa ?? 175, b: 0, k: 10, txt: o.txt0 || 'Körper gerade, Bauch fest' },
      { t: .4, txt: o.txt1 || 'langsam runter' },
      { t: 1.8, ...ohneSx(U), txt: 'unten kurz halten' },
      { t: 2.2, ...ohneSx(A), txt: 'kräftig hochdrücken' },
    ];
    if(o.plus) keys.push({ t: 3.1, p: [A.p[0], A.p[1] + .03], b: 16, txt: 'oben: Schulterblätter auseinanderschieben' }, { t: 3.9, p: A.p, b: 0 });
    return { dauer: o.plus ? 4.6 : 3.2, fokus: o.fokus || ['brust', 'trizeps', 'schultern'], props, keys };
  }
  B['Liegestütze plus'] = liegestuetz({ plus: true, fokus: ['schultern', 'brust'] });
  B['Pseudo-Planche-Liegestütze'] = liegestuetz({ vor: .28, tief: .22, ah: [-1, .2], fokus: ['schultern', 'brust', 'trizeps'], txt0: 'Hände auf Hüfthöhe, Schultern weit vor den Händen', txt1: 'Vorlage halten, runter' });
  B['Pseudo-Planche-Liegestütze auf Parallettes'] = liegestuetz({ vor: .3, handY: .13, tief: .12, ah: [-1, .2], griff: true, props: [{ typ: 'parallettes', an: 'hand', y: .12 }], fokus: ['schultern', 'brust', 'trizeps'], txt0: 'Griffe auf Hüfthöhe, starke Vorlage', txt1: 'tiefer runter als am Boden' });
  B['Diamant-Liegestütze'] = liegestuetz({ az: -.13, ah: [-1, .1], fokus: ['trizeps', 'brust'], txt0: 'Hände bilden eine Raute unter der Brust', txt1: 'Ellbogen eng am Körper' });
  B['Ring-Liegestütze'] = liegestuetz({ ring: true, handY: .14, tief: .14, props: [{ typ: 'ringe', top: 2.4 }], txt0: 'Ringe knapp über dem Boden, Körper fest' });
  B['Serratus-Liegestütze'] = (() => { const A = brett(0, .1, .6); return { dauer: 3, fokus: ['schultern'], keys: [
    { t: 0, ...ohneSx(A), h: [A.sx, .05], hd: 90, az: .04, f: [0, .1], fa: 175, b: -6, k: 8, txt: 'Arme gestreckt, Brust sinkt ein wenig' },
    { t: 1.3, p: [A.p[0], A.p[1] + .04], b: 18, txt: 'Boden wegdrücken, oberer Rücken rund' },
    { t: 2.2, p: A.p, b: -6 } ] }; })();

  /* ---------- Planche ---------- */
  B['Planche Lean'] = (() => {
    const A = brett(0, .1, .6), V = brett(.28, .1, .56);
    return { dauer: 6, fokus: ['schultern', 'bauch'], keys: [
      { t: 0, ...ohneSx(A), h: [A.sx, .05], hd: 90, az: .05, ah: [-1, .3], f: [0, .1], fa: 175, b: 6, k: 8, txt: 'Liegestützposition, Arme gestreckt' },
      { t: .8, txt: 'Schultern weit nach vorn schieben' },
      { t: 2.2, ...ohneSx(V), b: 16, f: [.28, .1], fa: 160, txt: 'halten, oberer Rücken rund' },
      { t: 4.6, txt: 'halten …' },
      { t: 5.3, ...ohneSx(A), b: 6, f: [0, .1], fa: 175, txt: 'zurück' } ] };
  })();
  /* Halteübungen auf den Händen: Griffe bei x = 0 */
  function planche(o){
    const d = o.dauer || 6.5, griff = { h: [0, .13], az: .05, ah: [-1, .2] };
    if(o.boden) Object.assign(griff, { h: [0, .05], hd: 90 });
    const props = o.boden ? [] : [{ typ: 'parallettes', x: 0, y: .12 }];
    const hocke = { p: [-.42, .46], r: 55, b: 20, f: [-.3, .08], lh: [1, .4] };
    return { dauer: d, fokus: o.fokus || ['schultern', 'bauch', 'trizeps'], props: [...props, ...(o.props || [])], keys: [
      { t: 0, ...hocke, k: 0, ...griff, txt: o.txt0 || 'Hocke, Hände auf den Griffen' },
      { t: .9, ...o.halt, txt: o.txt1 || 'nach vorn kippen, Füße lösen' },
      { t: 2, txt: o.txt2 || 'halten, Arme gestreckt' },
      { t: d - 1.6, txt: 'halten …' },
      { t: d - .8, ...hocke, txt: 'zurück in die Hocke' } ] };
  }
  B['Frog Stand'] = planche({ boden: true, fokus: ['schultern', 'trizeps'], halt: { p: [-.38, .58], r: 100, b: 10, k: 15, l: [126, -100], ah: [-1, .6] }, txt0: 'Hocke, Hände schulterbreit', txt1: 'Knie auf die Oberarme, nach vorn kippen', txt2: 'Gleichgewicht halten' });
  B['Tuck Planche'] = planche({ halt: { p: [-.28, .83], r: 95, b: 15, k: 12, l: [125, -95] }, txt2: 'Knie an die Brust, Hüfte auf Schulterhöhe' });
  B['Advanced Tuck Planche'] = planche({ halt: { p: [-.3, .73], r: 90, b: 0, k: 12, l: [180, -90] }, txt2: 'Rücken flach, Knie unter der Hüfte' });
  B['Straddle Planche mit Band'] = planche({ dauer: 7, props: [{ typ: 'stange', x: -.4, y: STANGE, pfosten: false }, { typ: 'band', von: [-.4, STANGE], an: 'becken' }],
    halt: { p: [-.3, .75], r: 92, b: 4, k: 12, l: [-88, -88], ls: 24 }, txt1: 'ins Band lehnen, Beine gestreckt öffnen', txt2: 'Körper waagrecht, Beine gegrätscht' });
  B['Tuck-Planche-Liegestütze'] = (() => { const m = planche({ halt: { p: [-.28, .83], r: 95, b: 15, k: 12, l: [125, -95] } });
    m.dauer = 7; m.fokus = ['schultern', 'brust', 'trizeps'];
    m.keys = [m.keys[0], m.keys[1],
      { t: 2, txt: 'Tuck Planche halten' }, { t: 2.6, p: [-.2, .55], r: 98, b: 12, ah: [-1, .5], txt: 'langsam runter, Füße bleiben oben' },
      { t: 3.8, p: [-.28, .83], r: 95, b: 15, txt: 'zurück hochdrücken' }, { t: 4.8, txt: 'nächste Wiederholung' },
      { t: 6.2, p: [-.42, .46], r: 55, b: 20, f: [-.3, .08], txt: 'zurück' }];
    return m; })();

  /* ---------- Handstand und Pike ---------- */
  B['Pike-Liegestütze'] = { dauer: 3.4, fokus: ['schultern', 'trizeps'], keys: [
    { t: 0, p: [.42, .88], r: 140, k: 0, h: [.95, .05], hd: 90, az: .05, ah: [-1, .3], f: [0, .08], fa: 115, txt: 'Hüfte hoch, umgedrehtes V' },
    { t: .3, txt: 'Kopf zwischen die Hände senken' },
    { t: 1.6, p: [.47, .72], r: 150, txt: 'Stirn knapp über dem Boden' },
    { t: 2, p: [.42, .88], r: 140, txt: 'hochdrücken' } ] };
  B['Erhöhte Pike-Liegestütze'] = { dauer: 3.4, fokus: ['schultern', 'trizeps'], props: [{ typ: 'block', c: [-.12, .225], g: [.45, .45, .5], holz: true }], keys: [
    { t: 0, p: [.38, 1.08], r: 160, k: 0, h: [.63, .05], hd: 90, az: .05, ah: [-1, .3], f: [-.05, .5], fa: 150, txt: 'Füße auf der Bank, Hüfte über den Schultern' },
    { t: .3, txt: 'Kopf nach vorn-unten senken' },
    { t: 1.6, p: [.43, .87], r: 166, txt: 'unten' },
    { t: 2, p: [.38, 1.08], r: 160, txt: 'hochdrücken' } ] };
  const HS = { p: [0, 1.12], r: 180, k: 0, h: [0, .05], hd: -90, az: .05, l: [0, 0] };
  B['Handstand an der Wand'] = { dauer: 5, fokus: ['schultern', 'bauch'], cam: 40, props: [{ typ: 'wand', x: -.28, n: -1 }], keys: [
    { t: 0, ...HS, r: 182, p: [-.02, 1.12], txt: 'Bauch zur Wand, Körper gerade' },
    { t: 2.5, r: 179, p: [.01, 1.13], txt: 'Schultern zu den Ohren schieben' } ] };
  B['Freier Handstand üben'] = { dauer: 4, fokus: ['schultern', 'bauch'], cam: 40, keys: [
    { t: 0, ...HS, hd: 90, r: 183, txt: 'über die Finger balancieren' },
    { t: 2, r: 177, txt: 'Handballen drücken, wenn du nach hinten kippst' } ] };
  B['Handstand-Liegestütze an der Wand'] = { dauer: 4, fokus: ['schultern', 'trizeps'], cam: -40, props: [{ typ: 'wand', x: .3, n: 1 }], keys: [
    { t: 0, ...HS, r: 176, p: [.06, 1.13], hd: -90, ah: [-1, 0], txt: 'Rücken zur Wand, Arme gestreckt' },
    { t: .4, txt: 'Kopf und Hände bilden ein Dreieck' },
    { t: 1.9, p: [.1, .76], r: 172, txt: 'kontrolliert runter' },
    { t: 2.3, p: [.06, 1.13], r: 176, txt: 'hochdrücken' } ] };

  /* ---------- Dips ---------- */
  function dips(o = {}){
    const gy = 1.24, top = gy + .6, bot = gy + .3;
    const P = (sh, r) => [-SIN(r) * .52, sh - COS(r) * .52 + .04];
    return { dauer: 3.4, fokus: o.fokus || ['trizeps', 'brust', 'schultern'], props: o.props || [{ typ: 'barren', x: 0, y: 1.2 }], keys: [
      { t: 0, p: P(top, 4), r: 4, h: [0, gy], az: o.az ?? .07, ah: [-1, 0], l: o.beine || [172, -115], k: 0, txt: 'oben stützen, Schultern unten' },
      { t: .3, txt: 'langsam runter, Oberkörper leicht vor' },
      { t: 1.7, p: P(bot, 22), r: 22, txt: 'bis die Oberarme waagrecht sind' },
      { t: 2.1, p: P(top, 4), r: 4, txt: 'hochdrücken' } ] };
  }
  B['Dips'] = dips();
  B['Unterstützte Dips'] = dips({ beine: [180, -92], props: [{ typ: 'barren', x: 0, y: 1.2 }, { typ: 'block', an: 'knie', c: [0, -.07], g: [.3, .06, .5] }] });
  B['Ring-Dips'] = dips({ az: .03, props: [{ typ: 'ringe', top: 2.6 }] });
  B['Bank-Dips'] = { dauer: 3.2, fokus: ['trizeps'], props: [{ typ: 'block', c: [-.33, .225], g: [.42, .45, 1.0], holz: true }], keys: [
    { t: 0, p: [-.05, .62], r: 0, h: [-.18, .47], az: .03, ah: [-1, 0], f: [.72, .08], lh: [0, 1], fa: 60, k: 0, txt: 'Hände an der Bankkante' },
    { t: .3, txt: 'Hüfte nah an der Bank, runter' },
    { t: 1.6, p: [-.07, .34], txt: 'bis 90° im Ellbogen' },
    { t: 2, p: [-.05, .62], txt: 'hochdrücken' } ] };
  const SITZ = [{ typ: 'block', c: [-.02, .2], g: [.42, .4, .42] }, { typ: 'block', c: [-.24, .92], g: [.08, .75, .4], r: -5 }];
  B['Dip-Maschine'] = { dauer: 3, fokus: ['trizeps'], props: SITZ, keys: [
    { t: 0, p: [0, .5], r: -6, l: [90, 180], hb: [.24, .02], az: .14, ah: [-1, 0], txt: 'aufrecht sitzen, Griffe neben der Brust' },
    { t: 1.1, hb: [-.08, .02], txt: 'Griffe bis zur Hüfte drücken' },
    { t: 1.6, txt: 'langsam zurück' },
    { t: 2.6, hb: [.24, .02] } ] };
  B['Trizepsdrücken am Kabel'] = { dauer: 2.8, fokus: ['trizeps'], props: [{ typ: 'kabel', von: [.42, 2.15], an: 'haende', eins: true }, { typ: 'griff', l: .3 }], keys: [
    { t: 0, p: [0, STAND], r: 10, k: 0, a: [172, 92], as: 4, txt: 'Ellbogen am Körper' },
    { t: 1, a: [172, 178], txt: 'unten ganz durchstrecken' },
    { t: 1.4, txt: 'langsam zurück' },
    { t: 2.4, a: [172, 92] } ] };
  B['Überkopf-Trizepsstrecken am Kabel'] = { dauer: 3, fokus: ['trizeps'], props: [{ typ: 'kabel', von: [-.75, 1.75], an: 'haende', eins: true }], keys: [
    { t: 0, p: [0, STAND - .03], r: 28, k: 0, a: [25, -150], az: -.08, L: { f: [.22, .08] }, R: { f: [-.25, .08] }, txt: 'Rücken zum Kabel, Ellbogen nach vorn' },
    { t: 1.1, a: [25, 30], txt: 'nach vorn-oben strecken' },
    { t: 1.5, txt: 'langsam zurück, Dehnung spüren' },
    { t: 2.6, a: [25, -150] } ] };

  /* ---------- Bank liegend ---------- */
  const BANK = { typ: 'block', c: [-.28, .21], g: [1.15, .42, .3] };
  const LIEGEN = { p: [.12, .54], r: -90, k: 0, f: [.5, .08], lh: [0, 1], lhz: .35, fz: .18 };
  function druecken(o = {}){
    const sx = .12 - .46, top = .54 + .6;
    return { dauer: 3.2, fokus: o.fokus || ['brust', 'trizeps', 'schultern'], props: [BANK, ...(o.props || [{ typ: 'kh', quer: true }])], keys: [
      { t: 0, ...LIEGEN, h: [sx, top], az: o.az ?? .1, ah: [0, -1], ahz: .7, txt: o.txt0 || 'Schulterblätter zusammen' },
      { t: .3, txt: 'kontrolliert zur Brust' },
      { t: 1.6, h: [sx + .04, .7], txt: 'kurz über der Brust' },
      { t: 1.9, h: [sx, top], txt: 'hochdrücken' } ] };
  }
  B['Kurzhantel-Bankdrücken'] = druecken();
  B['Enges Bankdrücken'] = druecken({ az: -.02, fokus: ['trizeps', 'brust'], props: [{ typ: 'lh', an: 'haende' }], txt0: 'Hände schulterbreit, Ellbogen eng' });
  function lehne(r, P){ return { typ: 'block', c: [P[0] + SIN(r) * .32 - COS(r) * .13, P[1] + COS(r) * .32 + SIN(r) * .13], g: [.08, .75, .3], r }; }
  B['Kurzhantel-Schrägbankdrücken'] = (() => { const r = -55, P = [0, .52], S = [P[0] + SIN(r) * .5, P[1] + COS(r) * .5];
    return { dauer: 3.2, fokus: ['brust', 'schultern', 'trizeps'], props: [{ typ: 'block', c: [-.02, .22], g: [.4, .44, .3] }, lehne(r, P), { typ: 'kh', quer: true }], keys: [
      { t: 0, p: P, r, k: 10, l: [92, 175], h: [S[0] + .1, S[1] + .58], az: .1, ah: [0, -1], ahz: .7, txt: 'Bank auf 30–45°' },
      { t: .3, txt: 'Hanteln zur oberen Brust' },
      { t: 1.6, h: [S[0] + .12, S[1] + .1] },
      { t: 1.9, h: [S[0] + .1, S[1] + .58], txt: 'hochdrücken' } ] }; })();
  B['Brustpresse-Maschine'] = (() => { const r = -12, P = [0, .52], S = [P[0] + SIN(r) * .48, P[1] + COS(r) * .48];
    return { dauer: 3, fokus: ['brust', 'trizeps'], props: [{ typ: 'block', c: [-.02, .22], g: [.42, .44, .42] }, lehne(r, P)], keys: [
      { t: 0, p: P, r, k: 0, l: [92, 178], h: [S[0] + .1, S[1] - .06], az: .12, ah: [-1, 0], ahz: .8, txt: 'Griffe auf Brusthöhe' },
      { t: 1.1, h: [S[0] + .6, S[1] - .06], txt: 'nach vorn drücken' },
      { t: 1.5, txt: 'langsam zurück' },
      { t: 2.6, h: [S[0] + .1, S[1] - .06] } ] }; })();
  B['Kabel-Brustpresse vorgelehnt'] = { dauer: 3, fokus: ['brust', 'schultern'], props: [{ typ: 'kabel', von: [-.85, 1.5, .55], an: 'haende' }], keys: [
    { t: 0, p: [0, STAND - .04], r: 32, k: 10, hb: [.24, .08], az: .12, ah: [-1, .3], L: { f: [.28, .08] }, R: { f: [-.3, .08] }, txt: 'weit vorgelehnt, Griffe neben der Brust' },
    { t: 1.1, hb: [.06, .6], az: 0, txt: 'nach vorn-unten drücken' },
    { t: 1.5, txt: 'langsam zurück' },
    { t: 2.6, hb: [.24, .08], az: .12 } ] };

  /* ---------- Hängen an der Stange ---------- */
  function hang(o = {}){ return { p: [o.x ?? -.02, STANGE - .6 - .5 + (o.hoch || 0)], r: o.r ?? 0, k: 0, h: [0, STANGE], az: o.az ?? .09, ah: o.ah || [.3, -1], ahz: .5 }; }
  const STG = [{ typ: 'stange', y: STANGE }];
  function klimmzug(o = {}){
    return { dauer: 3.6, fokus: ['ruecken', 'bizeps'], props: [...STG, ...(o.props || [])], keys: [
      { t: 0, ...hang({ az: o.az }), l: o.beine || [175, 185], txt: o.txt0 || 'aus dem ganzen Hang' },
      { t: .3, txt: 'Brust zur Stange ziehen' },
      { t: 1.3, ...hang({ hoch: .56, x: -.08, r: -8, az: o.az }), txt: 'oben: Kinn über der Stange' },
      { t: 1.8, txt: 'langsam ablassen' },
      { t: 3.2, ...hang({ az: o.az }) } ] };
  }
  B['Klimmzüge'] = klimmzug();
  B['Klimmzüge mit Band'] = klimmzug({ props: [{ typ: 'band', von: [0, STANGE], an: 'fuesse' }], beine: [178, 182], txt0: 'Band um die Füße, aus dem Hang' });
  B['Unterstützte Klimmzüge'] = klimmzug({ beine: [178, -95], props: [{ typ: 'block', an: 'knie', c: [0, -.07], g: [.3, .06, .5] }], txt0: 'Knie auf dem Polster' });
  B['Archer-Klimmzüge'] = { dauer: 4.4, fokus: ['ruecken', 'bizeps'], props: [{ typ: 'stange', y: STANGE, l: 1.6 }], cam: 70, keys: [
    { t: 0, ...hang({ az: .32 }), l: [175, 185], ah: [0, -1], txt: 'weiter Griff, aus dem Hang' },
    { t: 1.2, ...hang({ hoch: .5, az: .32 }), pz: .3, ah: [0, -1], txt: 'zu einer Hand ziehen, anderer Arm gestreckt' },
    { t: 2.2, ...hang({ az: .32 }), pz: 0, ah: [0, -1] },
    { t: 3.4, ...hang({ hoch: .5, az: .32 }), pz: -.3, ah: [0, -1], txt: 'dann zur anderen Seite' } ] };
  B['Scap-Pull-ups'] = { dauer: 2.6, fokus: ['ruecken', 'schultern'], props: STG, keys: [
    { t: 0, ...hang(), l: [175, 185], txt: 'locker hängen' },
    { t: 1, ...hang({ hoch: .07 }), txt: 'Schultern nach unten ziehen, Arme gestreckt' },
    { t: 1.6, ...hang() } ] };
  B['Passives Hängen'] = { dauer: 4, fokus: ['unterarme', 'schultern'], props: STG, keys: [
    { t: 0, ...hang(), l: [176, 184], r: 1, txt: 'locker hängen, Schultern zu den Ohren' },
    { t: 2, r: -1, l: [178, 182] } ] };

  /* Front Lever: Rücken waagrecht, Gesicht nach oben (r = -90). Beine relativ zum Rumpf (lrel). */
  function hebel(o = {}){
    const sx = o.sx ?? -.1, sy = o.sy ?? STANGE - .56, r = o.r ?? -90;
    return { p: [sx - SIN(r) * .5, sy - COS(r) * .5 + .04], r, b: o.b || 0, h: [0, STANGE], az: .08, ah: o.ah || [1, .2], ahz: .3, k: -10 };
  }
  const TUCK = { l: [50, 240], lrel: true }, ADV = { l: [90, 180], lrel: true }, GERADE = { l: [180, 180], lrel: true };
  const HANG = { ...hang(), l: [175, 185], lrel: false };
  function hebelHalt(beine, o = {}){
    return { dauer: 6.4, fokus: ['ruecken', 'bauch', 'schultern'], props: [...STG, ...(o.props || [])], keys: [
      { t: 0, ...HANG, txt: 'aus dem Hang' },
      { t: .7, ...hang({ hoch: .05 }), l: [80, 200], txt: 'Schultern runter, Knie anziehen' },
      { t: 1.7, ...hebel({ b: o.b ?? 0 }), ...beine, txt: o.txt2 || 'Arme gestreckt, Rücken waagrecht' },
      { t: 4.6, txt: 'halten …' },
      { t: 5.4, ...hang({ hoch: .05 }), l: [80, 200], lrel: false, L: {}, R: {}, txt: 'kontrolliert zurück' } ] };
  }
  B['Tuck Front Lever'] = hebelHalt(TUCK, { b: 14, txt2: 'Knie zur Brust, Rücken waagrecht' });
  B['Advanced Tuck Front Lever'] = hebelHalt(ADV, { txt2: 'Rücken flach, Knie über der Hüfte' });
  B['Ein-Bein Front Lever'] = hebelHalt({ l: [90, 180], lrel: true, L: { l: [180, 180] } }, { txt2: 'ein Bein gestreckt, eins angewinkelt' });
  B['Straddle Front Lever'] = hebelHalt({ ...GERADE, ls: 26 }, { txt2: 'Beine gestreckt und gegrätscht' });
  B['Front Lever mit Band'] = hebelHalt(GERADE, { props: [{ typ: 'band', von: [0, STANGE], an: 'becken' }], txt2: 'Band unter der Hüfte, Körper gerade' });
  const KOPFUEBER = o => hebel({ r: -178, sx: -.02, sy: STANGE - .6, ...o });
  B['Tuck Front Lever Raises'] = { dauer: 4.2, fokus: ['ruecken', 'bauch'], props: STG, keys: [
    { t: 0, ...KOPFUEBER({ b: 14 }), ...TUCK, txt: 'kopfüber in der Hocke' },
    { t: .4, txt: 'mit gestreckten Armen absenken' },
    { t: 1.9, ...hebel({ b: 14 }), txt: 'bis der Rücken waagrecht ist' },
    { t: 2.4, txt: 'zurück nach oben ziehen' },
    { t: 3.8, ...KOPFUEBER({ b: 14 }) } ] };
  B['Front-Lever-Negativ'] = { dauer: 5.4, fokus: ['ruecken', 'bauch'], props: STG, keys: [
    { t: 0, ...KOPFUEBER(), ...GERADE, txt: 'kopfüber, Körper gerade' },
    { t: .5, txt: 'so langsam wie möglich absenken' },
    { t: 3.4, ...hebel({ r: -60, sx: -.05, sy: STANGE - .58 }), txt: 'durch die Waagrechte' },
    { t: 4, ...hebel({ r: 0, sx: -.02, sy: STANGE - .6 }), ah: [.3, -1], txt: 'im Hang ankommen' } ] };
  B['Ice Cream Makers'] = { dauer: 4.4, fokus: ['ruecken', 'bauch', 'bizeps'], props: STG, keys: [
    { t: 0, ...hang({ hoch: .5, x: -.08, r: -6 }), ...GERADE, txt: 'oben im Klimmzug' },
    { t: .5, txt: 'Arme strecken und nach hinten kippen' },
    { t: 1.8, ...hebel({ sx: -.12 }), txt: 'Front-Lever-Position' },
    { t: 2.5, txt: 'zurück in den Klimmzug' },
    { t: 3.9, ...hang({ hoch: .5, x: -.08, r: -6 }) } ] };
  B['Tuck-Front-Lever-Rudern'] = { dauer: 3.6, fokus: ['ruecken', 'bizeps', 'bauch'], props: STG, keys: [
    { t: 0, ...hebel({ b: 14 }), ...TUCK, txt: 'Tuck Front Lever' },
    { t: .4, txt: 'Brust zur Stange ziehen' },
    { t: 1.5, ...hebel({ b: 14, sx: -.12, sy: STANGE - .2 }), ah: [-.3, -1], txt: 'Körper bleibt waagrecht' },
    { t: 1.9, txt: 'langsam zurück' },
    { t: 3.2, ...hebel({ b: 14 }), ah: [1, .2] } ] };
  B['Skin the Cat'] = { dauer: 6, fokus: ['schultern', 'ruecken'], props: STG, keys: [
    { t: 0, ...KOPFUEBER({ r: 0 }), ...GERADE, ah: [.3, -1], txt: 'aus dem Hang' },
    { t: .5, txt: 'Knie anziehen, nach hinten drehen' },
    { t: 1.6, ...KOPFUEBER(), ...TUCK, txt: 'kopfüber' },
    { t: 2.8, ...KOPFUEBER({ r: -305 }), l: [180, 180], ah: [-.5, -1], txt: 'durchdrehen bis ins Deutsche Hängen' },
    { t: 3.6, txt: 'langsam zurück' },
    { t: 4.6, ...KOPFUEBER(), ...TUCK },
    { t: 5.6, ...KOPFUEBER({ r: 0 }), l: [180, 180] } ] };
  B['Deutsches Hängen'] = { dauer: 6, fokus: ['schultern', 'brust'], props: STG, keys: [
    { t: 0, ...KOPFUEBER(), ...TUCK, ah: [.3, -1], txt: 'kopfüber in der Hocke' },
    { t: 1.2, ...KOPFUEBER({ r: -305 }), l: [180, 180], ah: [-.5, -1], txt: 'nach hinten durchdrehen und hängen bleiben' },
    { t: 4.4, txt: 'Dehnung in Brust und Schultern' },
    { t: 5.2, ...KOPFUEBER(), ...TUCK, txt: 'zurück' } ] };

  /* Schräg ziehen: Körper gerade von den Füßen, Griff vorn oben */
  function schraeg(o){
    const th = o.th, S = [-SIN(th) * KOERPER, .1 + COS(th) * KOERPER], fr = 90 - th;
    const G = [S[0] + SIN(fr) * .6, S[1] + COS(fr) * .6];
    const pose = t2 => ({ p: [-SIN(t2) * .89, .1 + COS(t2) * .89], r: -t2 });
    const props = o.ringe ? [{ typ: 'ringe', top: 2.6 }] : [{ typ: 'stange', x: G[0], y: G[1] + .01 }];
    return { dauer: 3.2, fokus: o.fokus || ['ruecken', 'bizeps'], props, keys: [
      { t: 0, ...pose(th), h: G, az: o.az ?? .09, ah: o.ah || [-.2, -1], ahz: .6, f: [0, .1], fa: 120, k: 0, txt: o.txt0 || 'Körper gerade, Arme gestreckt' },
      { t: .3, txt: o.txt1 || 'Brust zum Griff ziehen' },
      { t: 1.3, ...pose(th - (o.zug ?? 10)), txt: 'oben kurz halten' },
      { t: 1.7, txt: 'langsam ablassen' },
      { t: 2.9, ...pose(th) } ] };
  }
  B['Australische Klimmzüge'] = schraeg({ th: 66, zug: 6, txt0: 'Stange auf Hüfthöhe, Fersen am Boden' });
  B['Ring-Rudern'] = schraeg({ th: 50, zug: 14, ringe: true, txt0: 'Ringe, Körper schräg und gerade' });
  B['Ring-Bizepscurls'] = schraeg({ th: 42, zug: 16, ringe: true, az: .06, ah: [0, 1], fokus: ['bizeps'], txt0: 'Ringe, Körper schräg', txt1: 'nur die Ellbogen beugen, Hände zur Stirn' });

  /* ---------- Stehend ---------- */
  const STEH = { p: [0, STAND], r: 0, k: 0, ...FUESSE };
  function curl(o = {}){
    return { dauer: 2.8, fokus: o.fokus || ['bizeps', 'unterarme'], props: o.props || [{ typ: 'kh', hammer: o.hammer }], keys: [
      { t: 0, ...STEH, r: 2, a: [176, 178], as: 6, txt: 'Ellbogen am Körper' },
      { t: 1, a: [174, 28], txt: o.txt1 || 'hochbeugen, oben anspannen' },
      { t: 1.4, txt: 'langsam ablassen' },
      { t: 2.5, a: [176, 178] } ] };
  }
  B['Kurzhantel-Curls'] = curl();
  B['Hammer-Curls'] = curl({ hammer: true, txt1: 'Daumen zeigen nach oben' });
  B['Kabel-Curls'] = curl({ props: [{ typ: 'kabel', von: [.45, .1], an: 'haende', eins: true }, { typ: 'griff', l: .4 }] });
  function heben(o){
    const d = o.dauer || 3;
    return { dauer: d, fokus: o.fokus || ['schultern'], cam: o.cam, props: o.props, keys: [
      { t: 0, ...STEH, r: o.r ?? 2, ...o.start, txt: o.txt0 },
      { t: 1, ...o.oben, txt: o.txt1 },
      { t: 1 + (o.halt || .4), txt: 'langsam zurück' },
      { t: d - .4, ...o.start } ] };
  }
  const KABEL_UNTEN = [{ typ: 'kabel', von: [-.3, .12], an: 'haende', eins: true }, { typ: 'griff', l: .4 }];
  B['Kabel-Frontheben'] = heben({ start: { a: [176, 176] }, oben: { a: [90, 90] }, props: KABEL_UNTEN, txt0: 'Kabel zwischen den Beinen', txt1: 'Arme gestreckt bis Schulterhöhe' });
  B['Kabel-Frontheben mit Halt'] = heben({ dauer: 5.4, halt: 3, start: { a: [176, 176] }, oben: { a: [90, 90] }, props: KABEL_UNTEN, txt0: 'Arme gestreckt', txt1: 'oben 3 s halten' });
  B['Kurzhantel-Frontheben'] = heben({ start: { a: [176, 176] }, oben: { a: [90, 90] }, props: [{ typ: 'kh' }], txt0: 'Arme gestreckt, kein Schwung', txt1: 'bis Schulterhöhe' });
  B['Langhantel-Frontheben'] = heben({ start: { a: [176, 176], az: .06 }, oben: { a: [90, 90] }, props: [{ typ: 'lh', an: 'haende' }], txt0: 'Arme gestreckt', txt1: 'bis Schulterhöhe, ohne Schwung' });
  B['Kurzhantel-Seitheben'] = heben({ cam: 75, r: 8, start: { a: [180, 180], as: 8 }, oben: { as: 86 }, props: [{ typ: 'kh' }], txt0: 'leicht vorgebeugt', txt1: 'seitlich bis Schulterhöhe' });
  B['Kabel-Seitheben'] = heben({ cam: 75, start: { R: { a: [180, 180], as: -6 } }, oben: { R: { as: 86 } }, props: [{ typ: 'kabel', von: [0, .12, .45], an: 'R' }], txt0: 'Kabel von unten, andere Seite', txt1: 'Arm seitlich bis Schulterhöhe' });
  B['Kabel-Serratus-Stoßen'] = heben({ start: { R: { a: [94, 94] }, b: -4, r: 4 }, oben: { b: 14, r: 10 }, props: [{ typ: 'kabel', von: [-.8, 1.3, -.2], an: 'R' }], txt0: 'Arm gestreckt nach vorn', txt1: 'Schulter nach vorn schieben' });
  B['Face Pulls'] = { dauer: 3, fokus: ['schultern', 'ruecken'], cam: 45, props: [{ typ: 'kabel', von: [1.15, 1.62], an: 'haende', eins: true }], keys: [
    { t: 0, ...STEH, r: -4, a: [88, 88], as: 6, as2: 6, txt: 'Seil auf Augenhöhe' },
    { t: .55, a: [125, 60], as: 50, as2: 40 },
    { t: 1.1, a: [180, 0], as: 86, as2: 6, txt: 'zum Gesicht ziehen, Hände neben die Ohren' },
    { t: 1.5, txt: 'langsam zurück' },
    { t: 2.6, a: [88, 88], as: 6, as2: 6 } ] };
  B['Band Pull-Aparts'] = { dauer: 2.8, fokus: ['schultern', 'ruecken'], cam: 55, props: [{ typ: 'band', von: 'L', an: 'R' }], keys: [
    { t: 0, ...STEH, a: [90, 90], as: 6, txt: 'Arme gestreckt vor der Brust' },
    { t: 1.1, as: 86, txt: 'Band bis an die Brust auseinanderziehen' },
    { t: 1.5, txt: 'langsam zurück' },
    { t: 2.5, as: 6 } ] };
  B['Y-Heben liegend'] = { dauer: 3, fokus: ['schultern', 'ruecken'], cam: 50, keys: [
    { t: 0, p: [0, .12], r: 90, k: -5, l: [-90, -90], a: [93, 93], as: 35, txt: 'bäuchlings, Arme in Y-Form' },
    { t: 1, a: [76, 76], k: -15, txt: 'Arme heben, Daumen nach oben' },
    { t: 1.6, txt: 'langsam ablassen' },
    { t: 2.6, a: [93, 93], k: -5 } ] };
  B['Schulter-Dislocates mit Band'] = { dauer: 4, fokus: ['schultern'], props: [{ typ: 'band', von: 'L', an: 'R' }], keys: [
    { t: 0, ...STEH, a: [176, 176], as: 32, txt: 'Band weit greifen, Arme gestreckt' },
    { t: 1, a: [80, 80], txt: 'über den Kopf …' },
    { t: 1.8, a: [-20, -20], as: 38 },
    { t: 2.4, a: [-110, -110], txt: '… bis hinter den Rücken' },
    { t: 3.2, a: [-20, -20] } ] };
  B['Langhantel-Überkopfdrücken'] = { dauer: 3.2, fokus: ['schultern', 'trizeps'], props: [{ typ: 'lh', an: 'haende' }], keys: [
    { t: 0, ...STEH, hb: [.27, .15], az: .1, ah: [1, -.4], ahz: .4, txt: 'Stange vor den Schultern, Bauch fest' },
    { t: .2, txt: 'Kopf zurück, Stange gerade hoch' },
    { t: 1.3, h: [-.03, 2.08], txt: 'über dem Kopf durchstrecken' },
    { t: 1.7, txt: 'kontrolliert zurück' },
    { t: 2.8, hb: [.27, .15] } ] };
  B['Landmine-Press'] = { dauer: 3, fokus: ['schultern', 'brust'], props: [{ typ: 'landmine', piv: [1.75, .06], an: 'R' }], keys: [
    { t: 0, ...STEH, r: 8, L: { f: [.25, .08], a: [176, 176] }, R: { f: [-.25, .08], hb: [.27, .14], az: -.08, ah: [1, -.6] }, txt: 'Hantelende an der Schulter' },
    { t: 1.1, R: { h: [.55, 1.85] }, txt: 'nach vorn-oben drücken' },
    { t: 1.5, txt: 'langsam zurück' },
    { t: 2.6, R: { hb: [.27, .14] } } ] };
  B['Pallof-Press'] = { dauer: 4, fokus: ['bauch'], cam: 15, props: [{ typ: 'kabel', von: [0, 1.28, -1.2], an: 'haende', eins: true }], keys: [
    { t: 0, ...STEH, fz: .12, hb: [.2, .2], az: -.17, ah: [-1, -.3], txt: 'seitlich zum Kabel, Griff an der Brust' },
    { t: 1, h: [.58, 1.3], txt: 'nach vorn drücken, nicht verdrehen' },
    { t: 2.6, txt: 'halten …' },
    { t: 3.2, hb: [.2, .2] } ] };

  /* ---------- Rudern und Latzug ---------- */
  B['Latzug'] = { dauer: 3.2, fokus: ['ruecken', 'bizeps'], props: [SITZ[0], { typ: 'kabel', von: [.05, 2.7], an: 'haende', eins: true, turm: false }, { typ: 'griff', l: 1.15 }], keys: [
    { t: 0, p: [0, .5], r: -12, k: 0, l: [92, 178], h: [.05, 2.0], az: .33, ah: [0, -1], ahz: 1, txt: 'weit greifen, leicht zurücklehnen' },
    { t: .3, txt: 'Stange zur oberen Brust ziehen' },
    { t: 1.3, h: [.16, 1.32], txt: 'Ellbogen nach unten' },
    { t: 1.7, txt: 'langsam nach oben' },
    { t: 2.9, h: [.05, 2.0] } ] };
  gleich('Latzug', 'Latzug Untergriff');
  B['Einarmiger Latzug'] = { dauer: 3.2, fokus: ['ruecken'], props: [SITZ[0], { typ: 'kabel', von: [.05, 2.7, -.2], an: 'R', turm: false }], keys: [
    { t: 0, p: [0, .5], r: -8, k: 0, l: [92, 178], L: { a: [165, 100] }, R: { h: [.05, 2.02], ah: [0, -1], ahz: 1 }, txt: 'ein Arm, ganz gestreckt' },
    { t: 1.2, R: { h: [.12, 1.3] }, txt: 'Ellbogen zur Hüfte ziehen' },
    { t: 1.6, txt: 'langsam zurück' },
    { t: 2.8, R: { h: [.05, 2.02] } } ] };
  B['Kabelrudern'] = { dauer: 3, fokus: ['ruecken', 'bizeps'], props: [{ typ: 'block', c: [-.25, .19], g: [.8, .38, .32] }, { typ: 'block', c: [.66, .25], g: [.06, .4, .5] }, { typ: 'kabel', von: [1.3, .45], an: 'haende', eins: true, turm: false }, { typ: 'griff', l: .22 }], keys: [
    { t: 0, p: [-.15, .5], r: 12, k: 0, f: [.6, .26], lh: [0, 1], h: [.6, .68], az: -.13, ah: [-1, -.3], txt: 'Arme lang, Rücken gerade' },
    { t: 1, r: -6, h: [.15, .76], txt: 'Griff zum Bauch, Brust raus' },
    { t: 1.4, txt: 'langsam nach vorn' },
    { t: 2.6, r: 12, h: [.6, .68] } ] };
  B['Kurzhantelrudern'] = { dauer: 3, fokus: ['ruecken', 'bizeps'], props: [{ typ: 'block', c: [.12, .225], g: [1.0, .45, .32], z: .1 }, { typ: 'kh', an: 'R' }], keys: [
    { t: 0, p: [-.08, .93], r: 82, k: 10, L: { h: [.47, .47], ah: [-1, 0], l: [180, -92] }, R: { h: [.45, .38], ah: [-.3, 1], f: [-.22, .08], fz: .2 }, txt: 'Knie und Hand auf der Bank, Rücken flach' },
    { t: 1, R: { h: [.12, .85] }, txt: 'Hantel zur Hüfte ziehen' },
    { t: 1.4, txt: 'langsam ablassen' },
    { t: 2.6, R: { h: [.45, .38] } } ] };
  function schraegbank(r, P){ return { typ: 'block', c: [P[0] + SIN(r) * .35 + SIN(r + 90) * .15, P[1] + COS(r) * .35 + COS(r + 90) * .15], g: [.08, .8, .3], r }; }
  B['Brustgestütztes Rudern'] = { dauer: 3, fokus: ['ruecken', 'bizeps'], props: [schraegbank(45, [-.05, .8]), { typ: 'kh' }], keys: [
    { t: 0, p: [-.05, .8], r: 45, k: 15, f: [-.42, .08], lh: [1, 0], a: [180, 180], txt: 'Brust auf der Schrägbank' },
    { t: 1, hb: [.12, .06], az: .08, ah: [-1, .5], txt: 'Hanteln hochziehen, Schulterblätter zusammen' },
    { t: 1.4, txt: 'langsam ablassen' },
    { t: 2.6, a: [180, 180] } ] };
  function vorgebeugt(o = {}){
    return { dauer: 3, fokus: ['ruecken', 'bizeps'], props: o.props || [{ typ: 'lh', an: 'haende' }], keys: [
      { t: 0, p: [-.2, .84], r: 62, k: 15, ...FUESSE, a: [180, 180], az: .12, txt: 'Hüfte zurück, Rücken gerade' },
      { t: 1, hb: [-.02, .14], ah: [-1, .3], txt: o.txt1 || 'Stange zum Bauch ziehen' },
      { t: 1.4, txt: 'langsam ablassen' },
      { t: 2.6, a: [180, 180] } ] };
  }
  B['Langhantelrudern'] = vorgebeugt();
  B['T-Bar-Rudern'] = vorgebeugt({ props: [{ typ: 'landmine', piv: [-1.3, .06], an: 'mitte' }], txt1: 'Griff zur Brust ziehen' });
  function gestreckt(o){
    const h = o.halt || .4;
    return { dauer: 3.2 + (o.halt ? o.halt - .4 : 0), fokus: ['ruecken'], props: o.props, keys: [
      { t: 0, ...o.basis, a: [o.von, o.von], az: .1, txt: o.txt0 || 'Arme gestreckt' },
      { t: 1.2, a: [o.bis, o.bis], txt: o.txt1 },
      { t: 1.2 + h, txt: 'langsam zurück' },
      { t: 2.8 + (o.halt ? o.halt - .4 : 0), a: [o.von, o.von] } ] };
  }
  const VORGELEHNT = { p: [-.12, .94], r: 32, k: 10, ...FUESSE };
  const KABEL_OBEN = [{ typ: 'kabel', von: [.85, 2.2], an: 'haende', eins: true }, { typ: 'griff', l: .6 }];
  B['Straight-Arm-Latzug'] = gestreckt({ basis: VORGELEHNT, von: 40, bis: 172, props: KABEL_OBEN, txt0: 'leicht vorgebeugt, Arme gestreckt', txt1: 'Stange bis zu den Oberschenkeln drücken' });
  B['Straight-Arm-Latzug mit Halt'] = gestreckt({ halt: 2, basis: VORGELEHNT, von: 40, bis: 172, props: KABEL_OBEN, txt1: 'unten 2 s halten, wie im Front Lever' });
  const KNIEN = { p: [0, .56], r: 22, k: 10, l: [180, -90] };
  B['Kabel-Pullover kniend'] = gestreckt({ basis: KNIEN, von: 25, bis: 160, props: [{ typ: 'kabel', von: [.95, 2.2], an: 'haende', eins: true }, { typ: 'griff', l: .5 }], txt0: 'kniend, Arme gestreckt über dem Kopf', txt1: 'in einem Bogen zu den Hüften' });
  B['Pullover-Maschine'] = gestreckt({ basis: { p: [0, .52], r: -8, k: 0, l: [92, 178] }, von: 10, bis: 150, props: [...SITZ, { typ: 'griff', l: .6 }], txt1: 'Arme im Bogen nach unten führen' });
  B['Kurzhantel-Pullover'] = gestreckt({ basis: LIEGEN, von: -98, bis: -5, props: [BANK, { typ: 'kh', an: 'mitte' }], txt0: 'auf der Bank, Hantel hinter dem Kopf', txt1: 'im Bogen über die Brust' });
  B['Kabel-Pullover liegend'] = gestreckt({ basis: LIEGEN, von: -98, bis: -5, props: [BANK, { typ: 'kabel', von: [-1.25, .45], an: 'haende', eins: true }, { typ: 'griff', l: .5 }], txt0: 'Kopf Richtung Kabel', txt1: 'Arme gestreckt über die Brust' });
  B['Reverse Flys an der Maschine'] = { dauer: 3, fokus: ['schultern', 'ruecken'], cam: 55, props: [SITZ[0], { typ: 'block', c: [.2, 1.0], g: [.06, .4, .26] }], keys: [
    { t: 0, p: [0, .52], r: 4, k: 0, l: [92, 178], a: [88, 92], as: 8, txt: 'Brust ans Polster' },
    { t: 1.1, as: 84, txt: 'Arme nach hinten führen' },
    { t: 1.5, txt: 'langsam zurück' },
    { t: 2.6, as: 8 } ] };

  /* ---------- Schultern sitzend ---------- */
  B['Kurzhantel-Schulterdrücken'] = { dauer: 3.2, fokus: ['schultern', 'trizeps'], cam: 50, props: [...SITZ, { typ: 'kh' }], keys: [
    { t: 0, p: [0, .5], r: -5, k: 0, l: [92, 178], a: [180, 0], as: 80, as2: 6, txt: 'Rücken an der Lehne, Hanteln auf Ohrhöhe' },
    { t: 1.2, as: 164, as2: 172, txt: 'über den Kopf drücken' },
    { t: 1.6, txt: 'langsam zurück' },
    { t: 2.8, as: 80, as2: 6 } ] };
  B['Schulterpresse-Maschine'] = { ...B['Kurzhantel-Schulterdrücken'], props: SITZ };
  B['Arnold-Press'] = { dauer: 3.6, fokus: ['schultern'], cam: 50, props: [...SITZ, { typ: 'kh' }], keys: [
    { t: 0, p: [0, .5], r: -5, k: 0, l: [92, 178], a: [168, 8], as: 12, as2: 4, txt: 'Hanteln vor dem Gesicht' },
    { t: .7, a: [180, 0], as: 78, as2: 6, txt: 'Arme öffnen …' },
    { t: 1.4, as: 164, as2: 172, txt: '… und hochdrücken' },
    { t: 2, txt: 'auf demselben Weg zurück' },
    { t: 2.6, as: 78, as2: 6 },
    { t: 3.3, a: [168, 8], as: 12, as2: 4 } ] };
  B['Frontheben an der Schrägbank'] = { dauer: 3, fokus: ['schultern'], props: [schraegbank(45, [-.05, .8]), { typ: 'kh' }], keys: [
    { t: 0, p: [-.05, .8], r: 45, k: 15, f: [-.42, .08], a: [180, 180], txt: 'bäuchlings auf der Schrägbank' },
    { t: 1.1, a: [52, 52], txt: 'Arme gestreckt nach vorn-oben' },
    { t: 1.5, txt: 'langsam zurück' },
    { t: 2.6, a: [180, 180] } ] };

  /* ---------- Kniebeugen ---------- */
  function beuge(o = {}){
    const fx = o.fx ?? 0, f = { f: [fx, .08], fz: o.breit ?? .07, lh: [1, 0], lhz: .3 };
    return { oben: { p: [fx - .02, STAND - .01], r: o.r0 ?? 4, k: 0, ...f }, unten: { p: [fx + (o.rueck ?? -.24), o.tief ?? .48], r: o.r1 ?? 38, ...f } };
  }
  function kniebeuge(o){
    const k = beuge(o);
    return { dauer: 3.4, fokus: o.fokus || ['beine', 'gesaess'], props: o.props, keys: [
      { t: 0, ...k.oben, ...o.arme, txt: o.txt0 },
      { t: .3, txt: o.txt1 || 'Hüfte nach hinten, Knie nach außen' },
      { t: 1.6, ...k.unten, txt: o.txt2 || 'tief, Rücken gerade' },
      { t: 1.9, txt: 'aus den Fersen hochdrücken' },
      { t: 3, ...k.oben } ] };
  }
  B['Kniebeuge'] = kniebeuge({ r1: 42, arme: { hb: [.3, -.11], az: .32, ah: [-.3, -1], ahz: .4 }, props: [{ typ: 'lh', an: 'nacken' }], txt0: 'Stange auf dem oberen Rücken' });
  B['Front-Kniebeuge'] = kniebeuge({ r1: 22, rueck: -.16, tief: .45, arme: { hb: [.29, .17], az: .12, ah: [1, .5], ahz: .3 }, props: [{ typ: 'lh', an: 'brust' }], txt0: 'Stange vorn auf den Schultern, Ellbogen hoch', txt2: 'Oberkörper bleibt aufrecht' });
  B['Goblet-Kniebeuge'] = kniebeuge({ r1: 28, rueck: -.18, tief: .44, arme: { hb: [.17, .24], az: -.16, ah: [0, -1], ahz: .3 }, props: [{ typ: 'kh', an: 'mitte', quer: true }], txt0: 'Hantel vor der Brust', txt2: 'Ellbogen zwischen die Knie' });
  B['Hackenschmidt-Kniebeuge'] = kniebeuge({ r0: -12, r1: -2, fx: .25, rueck: -.3, tief: .5, arme: { hb: [.3, .08], az: .15, ah: [0, -1] }, props: [{ typ: 'block', an: 'becken', c: [-.2, .35], g: [.08, .9, .4], r: -12 }], txt0: 'Rücken am Polster, Füße vorn' });
  B['Kurzhantel-Sprungkniebeuge'] = (() => { const k = beuge({ tief: .62, r1: 30, rueck: -.16 });
    return { dauer: 2.6, fokus: ['beine', 'gesaess'], props: [{ typ: 'kh' }], keys: [
      { t: 0, ...k.oben, a: [180, 180], as: 6, txt: 'Hanteln locker an den Seiten' },
      { t: .6, ...k.unten, txt: 'halb tief' },
      { t: .9, p: [-.02, 1.22], r: 2, f: [0, .3], fw: 35, txt: 'explosiv hochspringen' },
      { t: 1.25, ...k.oben, fw: 0, txt: 'weich landen' },
      { t: 1.5, ...k.unten },
      { t: 2, ...k.oben } ] }; })();
  B['Beinpresse'] = { dauer: 3.2, fokus: ['beine', 'gesaess'], props: [
    { typ: 'block', c: [-.06, .3], g: [.42, .12, .45] }, lehne(-60, [0, .42]),
    { typ: 'block', an: 'fuesse', c: [.05, .03], g: [.05, .55, .6], r: -32 }], keys: [
    { t: 0, p: [0, .42], r: -60, k: 10, f: [.88, .98], fz: .08, fa: 45, lh: [-.4, 1], lhz: .3, a: [170, 120], txt: 'Füße schulterbreit auf der Platte' },
    { t: .3, txt: 'Platte kontrolliert absenken' },
    { t: 1.6, f: [.5, .66], txt: 'bis die Knie knapp 90° haben' },
    { t: 1.9, txt: 'wegdrücken, Knie nicht ganz durchstrecken' },
    { t: 2.9, f: [.88, .98] } ] };
  B['Pistol Squat'] = { dauer: 4, fokus: ['beine', 'gesaess'], keys: [
    { t: 0, p: [0, STAND - .01], pz: .07, r: 3, k: 0, L: { f: [0, .08], lh: [1, 0] }, R: { l: [150, 172] }, a: [120, 110], txt: 'auf einem Bein, anderes Bein vorn' },
    { t: .3, txt: 'langsam absitzen, Arme nach vorn' },
    { t: 1.9, p: [-.24, .42], r: 44, R: { l: [90, 92] }, a: [82, 84], txt: 'ganz unten, Ferse bleibt am Boden' },
    { t: 2.3, txt: 'hochdrücken' },
    { t: 3.6, p: [0, STAND - .01], r: 3, R: { l: [150, 172] }, a: [120, 110] } ] };
  function hinterBein(o){
    return { dauer: 4, fokus: ['beine', 'gesaess'], keys: [
      { t: 0, p: [0, STAND - .02], pz: .07, r: 4, k: 0, L: { f: [0, .08], lh: [1, 0] }, R: { l: [186, -60] }, a: o.arme, txt: o.txt0 },
      { t: .3, txt: 'langsam runter' },
      { t: 1.9, p: [-.16, .5], r: 36, R: { l: [168, -70] }, txt: o.txt1 },
      { t: 2.3, txt: 'aus der Ferse hochdrücken' },
      { t: 3.6, p: [0, STAND - .02], r: 4, R: { l: [186, -60] } } ] };
  }
  B['Shrimp Squat'] = hinterBein({ arme: [100, 95], txt0: 'hinteren Fuß greifen oder Arme nach vorn', txt1: 'Knie tippt hinter der Ferse auf' });
  B['Skater Squat'] = hinterBein({ arme: [95, 88], txt0: 'auf einem Bein, Arme nach vorn', txt1: 'hinteres Knie knapp über dem Boden' });
  const SPLIT = { L: { f: [.3, .08], lh: [1, 0] }, R: { f: [-.62, .5], fa: 205, lh: [.4, -1] } };
  B['Bulgarische Split-Kniebeuge'] = { dauer: 3.4, fokus: ['beine', 'gesaess'], props: [{ typ: 'block', c: [-.78, .225], g: [.4, .45, .4] }, { typ: 'kh' }], keys: [
    { t: 0, p: [-.06, .9], r: 8, k: 0, a: [180, 180], as: 6, ...SPLIT, txt: 'hinterer Fuß auf der Bank' },
    { t: .3, txt: 'senkrecht runter' },
    { t: 1.6, p: [-.14, .53], r: 16, txt: 'vorderes Knie über dem Fuß' },
    { t: 1.9, txt: 'mit dem vorderen Bein hochdrücken' },
    { t: 3, p: [-.06, .9], r: 8 } ] };
  B['Ausfallschritte an der Multipresse'] = { dauer: 3.4, fokus: ['beine', 'gesaess'], props: [{ typ: 'lh', an: 'nacken' }], keys: [
    { t: 0, p: [-.08, .9], r: 4, k: 0, hb: [.3, -.11], az: .32, ah: [-.3, -1], L: { f: [.3, .08], lh: [1, 0] }, R: { f: [-.5, .08], fa: 150, lh: [.4, -1] }, txt: 'Schrittstellung, Stange auf dem Rücken' },
    { t: .3, txt: 'senkrecht runter' },
    { t: 1.6, p: [-.1, .5], r: 6, txt: 'hinteres Knie knapp über dem Boden' },
    { t: 1.9, txt: 'hochdrücken' },
    { t: 3, p: [-.08, .9], r: 4 } ] };
  function ausfall(vor, o = {}){
    const F = vor ? .52 : 0, H = vor ? 0 : -.52;
    const tief = [(F + H) / 2 - (vor ? .02 : -.06), .52];
    const steh = { p: [0, STAND - .01], r: 2, k: 0, L: { f: [0, .08], fa: null }, R: { f: [0, .08], fa: null }, lh: [1, 0] };
    const seite = (S, A) => ({ [S]: { f: [vor ? F : 0, .08], lh: [1, 0] }, [A]: { f: [vor ? 0 : H, .08], fa: 150, lh: [.4, -1] } });
    const lauf = (S, A) => (vor ? { [S]: { f: [.26, .22] } } : { [A]: { f: [-.26, .22] } });
    return { dauer: 5, fokus: ['beine', 'gesaess'], props: o.props, keys: [
      { t: 0, ...steh, ...o.arme, txt: o.txt0 || 'aufrecht stehen' },
      { t: .4, p: [vor ? .1 : -.05, STAND - .03], ...lauf('L', 'R') },
      { t: .8, p: tief, r: 6, ...seite('L', 'R'), txt: vor ? 'großer Schritt, hinteres Knie zum Boden' : 'Schritt nach hinten, Knie knapp über dem Boden' },
      { t: 1.9, txt: 'zurückdrücken' },
      { t: 2.5, ...steh },
      { t: 2.9, p: [vor ? .1 : -.05, STAND - .03], ...lauf('R', 'L') },
      { t: 3.3, p: tief, r: 6, ...seite('R', 'L'), txt: 'andere Seite' },
      { t: 4.4, ...steh } ] };
  }
  B['Ausfallschritte gehend'] = ausfall(true, { props: [{ typ: 'kh' }], arme: { a: [180, 180], as: 6 }, txt0: 'Hanteln an den Seiten' });
  B['Ausfallschritte rückwärts'] = ausfall(false, { arme: { a: [170, 110] } });
  B['Step-ups'] = { dauer: 3.6, fokus: ['beine', 'gesaess'], props: [{ typ: 'block', c: [.42, .225], g: [.45, .45, .55], holz: true }, { typ: 'kh' }], keys: [
    { t: 0, p: [.02, .9], r: 12, k: 0, a: [180, 180], as: 6, L: { f: [.38, .53], lh: [1, 0] }, R: { f: [-.02, .08], lh: [1, 0] }, txt: 'ein Fuß ganz auf der Box' },
    { t: .3, txt: 'mit dem oberen Bein hochdrücken' },
    { t: 1.3, p: [.37, STAND + .44], r: 2, R: { l: [100, 182] }, txt: 'oben: Knie hoch' },
    { t: 1.8, txt: 'langsam zurück' },
    { t: 3.1, p: [.02, .9], r: 12, R: { f: [-.02, .08] } } ] };
  B['Cossack Squat'] = { dauer: 4.4, fokus: ['beine', 'gesaess'], cam: 80, keys: [
    { t: 0, p: [0, .88], r: 4, k: 0, f: [0, .08, .48], lh: [1, 0], lhz: .5, a: [110, 95], txt: 'weiter Stand' },
    { t: 1.2, p: [-.14, .4], pz: -.33, r: 30, txt: 'zu einer Seite absitzen, anderes Bein gestreckt' },
    { t: 2.2, p: [0, .88], pz: 0, r: 4 },
    { t: 3.4, p: [-.14, .4], pz: .33, r: 30, txt: 'andere Seite' } ] };
  B['Tiefe Hocke halten'] = { dauer: 5, fokus: ['beine'], keys: [
    { t: 0, ...STEH, a: [176, 176], fz: .14, txt: 'Füße etwas breiter als die Hüfte' },
    { t: 1.2, p: [-.18, .32], r: 32, a: [140, 20], as: 10, txt: 'tief absitzen, Fersen am Boden' },
    { t: 3.8, txt: 'Ellbogen schieben die Knie nach außen' } ] };

  /* ---------- Hüfte und hintere Kette ---------- */
  function hinge(o){
    return { dauer: 3.4, fokus: o.fokus || ['beinbeuger', 'gesaess', 'ruecken'], props: o.props, keys: [
      { t: 0, p: [-.02, STAND - .01], r: 3, k: 0, ...FUESSE, a: [180, 180], az: o.az ?? .08, txt: o.txt0 },
      { t: .3, txt: o.txt1 || 'Hüfte nach hinten schieben' },
      { t: 1.6, p: o.p, r: o.r, txt: o.txt2 || 'Rücken gerade' },
      { t: 1.9, txt: 'Hüfte nach vorn, aufrichten' },
      { t: 3, p: [-.02, STAND - .01], r: 3 } ] };
  }
  B['Rumänisches Kreuzheben'] = hinge({ p: [-.26, .88], r: 76, props: [{ typ: 'lh', an: 'haende' }], txt0: 'Knie leicht gebeugt', txt2: 'Stange nah an den Beinen, Dehnung hinten' });
  B['Trap-Bar-Kreuzheben'] = hinge({ p: [-.2, .64], r: 42, az: .13, props: [{ typ: 'trapbar', an: 'haende' }], fokus: ['beine', 'gesaess', 'ruecken'], txt0: 'in der Mitte der Trap-Bar', txt1: 'Hüfte und Knie beugen', txt2: 'Brust raus, Rücken gerade' });
  B['Kreuzheben'] = hinge({ p: [-.24, .58], r: 60, az: .1, props: [{ typ: 'lh', an: 'haende' }], txt0: 'Stange über der Fußmitte', txt2: 'unten: Stange am Boden, Rücken gerade' });
  B['Einbeiniges Kreuzheben'] = { dauer: 3.6, fokus: ['beinbeuger', 'gesaess'], props: [{ typ: 'kh', an: 'R' }], keys: [
    { t: 0, p: [-.02, STAND - .01], pz: .07, r: 3, k: 0, L: { f: [0, .08], lh: [1, 0] }, R: { l: [-176, -176] }, a: [180, 180], txt: 'auf einem Bein, Hantel in der anderen Hand' },
    { t: .3, txt: 'Oberkörper vor, Bein nach hinten' },
    { t: 1.7, p: [-.16, .9], r: 80, R: { l: [-98, -98] }, txt: 'Körper und Bein bilden eine Linie' },
    { t: 2.1, txt: 'langsam aufrichten' },
    { t: 3.3, p: [-.02, STAND - .01], r: 3, R: { l: [-176, -176] } } ] };
  B['Jefferson Curl'] = { dauer: 5, fokus: ['ruecken', 'beinbeuger'], props: [{ typ: 'block', c: [.02, .15], g: [.45, .3, .5], holz: true }, { typ: 'kh', an: 'mitte' }], keys: [
    { t: 0, p: [-.02, STAND + .29], r: 2, k: 0, f: [0, .38], fz: .05, a: [180, 180], az: -.12, txt: 'auf der Box, sehr leicht' },
    { t: .4, txt: 'Kinn zur Brust, Wirbel für Wirbel einrollen' },
    { t: 2.2, p: [-.12, STAND + .27], r: 52, b: 58, k: 30, txt: 'ganz unten hängen lassen' },
    { t: 2.8, txt: 'langsam wieder aufrollen' },
    { t: 4.6, p: [-.02, STAND + .29], r: 2, b: 0, k: 0 } ] };
  const RUECKEN = { r: -94, k: 0, f: [.38, .08], fz: .08, lh: [0, 1], lhz: .2, a: [97, 92] };
  B['Hüftbrücke'] = { dauer: 3, fokus: ['gesaess', 'beinbeuger'], keys: [
    { t: 0, p: [0, .13], ...RUECKEN, txt: 'Rücken am Boden, Fersen nah am Gesäß' },
    { t: 1, p: [-.02, .42], r: -124, txt: 'Hüfte hoch, oben anspannen' },
    { t: 1.7, txt: 'langsam ablassen' },
    { t: 2.7, p: [0, .13], r: -94 } ] };
  B['Einbeinige Hüftbrücke'] = { ...B['Hüftbrücke'], keys: B['Hüftbrücke'].keys.map((k, i) => i === 0 ? { ...k, R: { l: [60, 60] }, txt: 'ein Bein gestreckt in der Luft' } : k) };
  B['Hip Thrust'] = { dauer: 3, fokus: ['gesaess'], props: [{ typ: 'block', c: [-.62, .225], g: [.35, .45, 1.0] }, { typ: 'lh', an: 'huefte' }], keys: [
    { t: 0, p: [-.12, .22], r: -48, k: 30, f: [.38, .08], fz: .1, lh: [0, 1], lhz: .2, hb: [-.22, .16], az: .2, ah: [0, 1], txt: 'oberer Rücken an der Bank' },
    { t: 1.1, p: [0, .52], r: -88, k: 0, txt: 'Hüfte hoch, bis der Körper waagrecht ist' },
    { t: 1.7, txt: 'langsam ablassen' },
    { t: 2.7, p: [-.12, .22], r: -48, k: 30 } ] };
  B['Rückenstrecker'] = (() => { const L = 45, A = [-.5, .32], P = [A[0] + SIN(L) * .89, A[1] + COS(L) * .89];
    return { dauer: 3.2, fokus: ['ruecken', 'gesaess'], props: [{ typ: 'block', c: [P[0] + .05, P[1] - .14], g: [.1, .45, .4], r: -45 }, { typ: 'block', c: [A[0] - .06, A[1] - .07], g: [.25, .06, .3], r: -45 }, { typ: 'block', c: [-.1, .2], g: [.9, .1, .3] }], keys: [
      { t: 0, p: P, r: L, k: 0, f: A, fa: 135, a: [150, 30], arel: true, txt: 'Körper in einer Linie' },
      { t: .4, txt: 'aus der Hüfte nach unten' },
      { t: 1.7, r: 150, txt: 'unten' },
      { t: 2, txt: 'hochkommen bis zur geraden Linie' },
      { t: 3, r: L } ] }; })();
  function knieLinie(o){
    const K = [0, o.ky ?? .12], d = o.dauer || 4.2;
    const pose = th => ({ p: [K[0] + SIN(th) * .45, K[1] + COS(th) * .45], r: th, l: [th + 180, -88] });
    return { dauer: d, fokus: ['beinbeuger'], props: o.props, keys: [
      { t: 0, ...pose(o.von), k: 0, a: [160, 40], arel: true, txt: o.txt0 },
      { t: .3, txt: o.txt1 },
      { t: 2.6, ...pose(o.bis), a: [85, 88], txt: o.txt2 },
      { t: 3, txt: 'zurück nach oben' },
      { t: d - .3, ...pose(o.von), a: [160, 40] } ] };
  }
  B['Nordic Curls'] = knieLinie({ von: 2, bis: 72, props: [{ typ: 'block', c: [0, .03], g: [.3, .06, .5] }, { typ: 'block', c: [-.46, .2], g: [.12, .12, .5] }], txt0: 'Füße fixiert, Körper gerade', txt1: 'so langsam wie möglich nach vorn', txt2: 'mit den Händen abfangen' });
  B['Glute-Ham Raise'] = knieLinie({ von: 4, bis: 96, ky: .95, props: [{ typ: 'block', c: [.05, .8], g: [.45, .22, .4] }, { typ: 'block', c: [-.46, 1.04], g: [.12, .12, .4] }, { typ: 'block', c: [-.2, .4], g: [.2, .8, .3] }], txt0: 'Knie auf dem Polster, Füße fixiert', txt1: 'nach vorn ablassen', txt2: 'mit den Beinbeugern hochziehen' });
  const PADS = [{ typ: 'block', an: 'fussL', c: [0, -.06], g: [.14, .02, .12], z: .14 }, { typ: 'block', an: 'fussR', c: [0, -.06], g: [.14, .02, .12], z: -.14 }];
  B['Gleit-Beinbeuger'] = { dauer: 3.4, fokus: ['beinbeuger', 'gesaess'], props: PADS, keys: [
    { t: 0, p: [-.02, .4], r: -124, k: 0, f: [.38, .08], fz: .06, fa: 30, lh: [0, 1], a: [97, 92], txt: 'Hüfte oben, Füße auf Gleitpads' },
    { t: 1.3, p: [0, .2], r: -102, f: [.92, .08], fa: 95, txt: 'Füße langsam wegschieben' },
    { t: 1.7, txt: 'mit den Fersen zurückziehen' },
    { t: 3, p: [-.02, .4], r: -124, f: [.38, .08], fa: 30 } ] };
  B['Beinbeuger liegend'] = { dauer: 3, fokus: ['beinbeuger'], props: [{ typ: 'block', c: [.1, .46], g: [1.3, .12, .38] }, { typ: 'block', c: [.1, .2], g: [.3, .4, .3] }, { typ: 'block', an: 'fuesse', c: [-.02, .07], g: [.08, .08, .4] }], keys: [
    { t: 0, p: [0, .62], r: 90, k: 15, l: [-90, -90], a: [172, 172], txt: 'bäuchlings, Polster über den Fersen' },
    { t: 1, l: [-92, 8], txt: 'Fersen zum Gesäß ziehen' },
    { t: 1.4, txt: 'langsam zurück' },
    { t: 2.6, l: [-90, -90] } ] };
  B['Beinbeuger sitzend'] = { dauer: 3, fokus: ['beinbeuger'], props: [...SITZ, { typ: 'block', an: 'fuesse', c: [.02, -.07], g: [.08, .08, .4] }], keys: [
    { t: 0, p: [0, .5], r: -6, k: 0, l: [90, 92], a: [170, 120], txt: 'Beine gestreckt, Polster unter den Waden' },
    { t: 1, l: [90, 200], txt: 'Fersen nach unten-hinten ziehen' },
    { t: 1.4, txt: 'langsam zurück' },
    { t: 2.6, l: [90, 92] } ] };

  /* ---------- Waden, Schienbein ---------- */
  function wade(o = {}){
    const y = o.erhoeht ? .1 : 0;
    return { dauer: 2.6, fokus: ['waden'], props: [...(o.erhoeht ? [{ typ: 'block', c: [.06, .05], g: [.22, .1, .5] }] : []), ...(o.props || [])], keys: [
      { t: 0, p: [0, STAND + y - .03], r: 2, k: 0, l: [180, 180], fw: -15, a: [180, 180], as: 6, ...(o.basis || {}), txt: o.txt0 || 'Fersen tief' },
      { t: 1, p: [0, STAND + y + .07], fw: 38, txt: 'ganz hoch auf die Zehen' },
      { t: 1.4, txt: 'langsam runter' },
      { t: 2.3, p: [0, STAND + y - .03], fw: -15 } ] };
  }
  B['Wadenheben stehend'] = wade({ erhoeht: true, props: [{ typ: 'kh' }], txt0: 'Fußballen auf der Kante, Fersen tief' });
  B['Einbeiniges Wadenheben'] = wade({ erhoeht: true, basis: { R: { l: [185, -75] }, pz: .07 }, txt0: 'auf einem Fuß, Fersen tief' });
  B['Wadenheben sitzend'] = { dauer: 2.6, fokus: ['waden'], props: [{ typ: 'block', c: [-.05, .2], g: [.42, .4, .42] }, { typ: 'block', an: 'knie', c: [-.05, .05], g: [.3, .06, .45] }], keys: [
    { t: 0, p: [0, .5], r: 0, k: 0, f: [.43, .06], fz: .08, lh: [0, 1], fw: -10, a: [165, 150], txt: 'Polster auf den Knien' },
    { t: 1, f: [.43, .12], fw: 35, txt: 'Fersen hoch' },
    { t: 1.4, txt: 'langsam runter' },
    { t: 2.3, f: [.43, .06], fw: -10 } ] };
  B['Wadenheben an der Beinpresse'] = { ...B['Beinpresse'], dauer: 2.6, keys: [
    { t: 0, p: [0, .42], r: -60, k: 10, f: [.88, .98], fz: .08, fa: 45, lh: [-.4, 1], lhz: .3, a: [170, 120], txt: 'Beine fast gestreckt, Fußballen auf der Kante' },
    { t: 1, f: [.92, 1.02], fa: 15, txt: 'Platte mit den Zehen wegdrücken' },
    { t: 1.4, txt: 'langsam zurück' },
    { t: 2.3, f: [.88, .98], fa: 45 } ] };
  B['Tibialis-Heben'] = { dauer: 2.6, fokus: ['waden'], props: [{ typ: 'wand', x: -.4, n: -1 }], keys: [
    { t: 0, p: [-.17, .92], r: -12, k: 0, f: [.32, .08], fz: .07, lh: [1, 0], a: [180, 180], txt: 'Rücken an der Wand, Füße vorn' },
    { t: 1, fw: -38, txt: 'Zehen so hoch wie möglich ziehen' },
    { t: 1.4, txt: 'langsam ablassen' },
    { t: 2.3, fw: 0 } ] };
  B['Seilspringen'] = { dauer: 1, seilTakt: .5, fokus: ['waden'], props: [{ typ: 'seil' }], keys: [
    { t: 0, p: [0, STAND - .02], r: 2, k: 0, f: [0, .08], fz: .05, lh: [1, 0], fw: 0, a: [168, 120], as: 18, txt: 'locker auf den Fußballen' },
    { t: .25, p: [0, STAND + .06], f: [0, .15], fw: 25 },
    { t: .5, p: [0, STAND - .02], f: [0, .08], fw: 0 },
    { t: .75, p: [0, STAND + .06], f: [0, .15], fw: 25 } ] };

  /* ---------- Sprünge und Umsetzen ---------- */
  const ARME_HINTEN = { a: [215, 205] }, ARME_VORN = { a: [40, 30] };
  B['Box Jumps'] = { dauer: 3.2, fade: true, fokus: ['beine', 'gesaess'], props: [{ typ: 'block', c: [.85, .25], g: [.5, .5, .6], holz: true }], keys: [
    { t: 0, ...STEH, a: [175, 175] },
    { t: .35, p: [-.12, .74], r: 32, ...ARME_HINTEN, txt: 'ausholen, Arme nach hinten' },
    { t: .7, p: [.35, 1.45], r: 8, l: [120, 210], ...ARME_VORN, txt: 'explosiv abspringen, Knie hoch' },
    { t: 1, p: [.68, 1.06], r: 30, f: [.82, .58], a: [90, 90], txt: 'weich auf der Box landen' },
    { t: 1.5, p: [.82, 1.46], r: 2, a: [175, 175], txt: 'aufrichten' },
    { t: 2.6, txt: 'runter steigen, nicht springen' } ] };
  B['Einbeinige Sprünge auf die Box'] = { dauer: 3.2, fade: true, fokus: ['beine', 'gesaess'], props: [{ typ: 'block', c: [.8, .2], g: [.5, .4, .6], holz: true }], keys: [
    { t: 0, ...STEH, pz: .07, L: { f: [0, .08] }, R: { l: [150, 215] }, a: [175, 175], txt: 'auf einem Bein' },
    { t: .4, p: [-.1, .8], r: 26, ...ARME_HINTEN, txt: 'ausholen' },
    { t: .75, p: [.35, 1.38], r: 8, L: { l: [130, 200] }, ...ARME_VORN, txt: 'abspringen' },
    { t: 1.05, p: [.66, .95], r: 26, L: { f: [.78, .48] }, a: [90, 90], txt: 'auf demselben Bein landen' },
    { t: 1.6, p: [.78, 1.35], r: 2, a: [175, 175], txt: 'stabil halten' } ] };
  B['Standweitsprung'] = { dauer: 3.2, fade: true, fokus: ['beine', 'gesaess'], keys: [
    { t: 0, ...STEH, a: [175, 175] },
    { t: .4, p: [-.12, .72], r: 36, ...ARME_HINTEN, txt: 'tief ausholen' },
    { t: .75, p: [.5, 1.25], r: 30, l: [150, 230], ...ARME_VORN, txt: 'nach vorn-oben explodieren' },
    { t: 1.05, p: [1.05, 1.02], r: 10, l: [90, 170], a: [60, 60], txt: 'Beine nach vorn' },
    { t: 1.3, p: [1.18, .6], r: 38, f: [1.45, .08], a: [90, 90], txt: 'weich landen' },
    { t: 2.2, p: [1.42, STAND - .01], r: 3, a: [175, 175] } ] };
  B['Depth Jumps'] = { dauer: 3.4, fade: true, fokus: ['beine', 'gesaess'], props: [{ typ: 'block', c: [-.55, .225], g: [.5, .45, .6], holz: true }], keys: [
    { t: 0, p: [-.55, STAND + .44], r: 2, k: 0, f: [-.55, .53], fz: .05, lh: [1, 0], a: [175, 175], txt: 'auf der Box' },
    { t: .5, p: [-.25, 1.1], r: 4, l: [160, 185], txt: 'nach vorn heruntersteigen' },
    { t: .85, p: [-.05, .72], r: 30, f: [.05, .08], ...ARME_HINTEN, txt: 'landen und sofort …' },
    { t: 1.1, p: [.02, 1.35], r: 2, l: [170, 185], a: [10, 10], txt: '… so hoch wie möglich springen' },
    { t: 1.45, p: [0, .78], r: 26, f: [.05, .08], a: [90, 90], txt: 'weich landen' },
    { t: 2.1, p: [.02, STAND - .01], r: 3, a: [175, 175] } ] };
  B['Trap-Bar-Sprung'] = { dauer: 2.6, fokus: ['beine', 'gesaess'], props: [{ typ: 'trapbar', an: 'haende' }], keys: [
    { t: 0, ...STEH, a: [180, 180], az: .13 },
    { t: .5, p: [-.18, .7], r: 32, txt: 'halb tief, Brust raus' },
    { t: .8, p: [-.02, 1.25], r: 2, f: [0, .3], fw: 35, txt: 'explosiv springen' },
    { t: 1.15, p: [-.1, .82], r: 20, f: [0, .08], fw: 0, txt: 'weich landen' },
    { t: 1.8, ...STEH } ] };
  function umsetzen(o){
    const HANG2 = { h: [.05, .78], bar: [.05, .78] }, griff = { az: .14, ah: [-.2, -1], ahz: .6 };
    const start = o.boden ? { p: [-.24, .58], r: 58, h: [.13, .24], bar: [.13, .24] } : HANG2;
    const keys = [
      { t: 0, ...STEH, ...griff, ...start, txt: o.boden ? 'Stange über der Fußmitte' : 'Stange an den Oberschenkeln' },
      { t: .6, p: [-.16, .86], r: 30, h: [.12, .66], bar: [.12, .66], txt: 'Hüfte zurück, Stange über die Knie' },
      { t: .95, p: [.02, 1.07], r: -6, f: [0, .16], fw: 30, h: [.06, 1.02], bar: [.06, 1.02], ah: [0, 1], ahz: .9, txt: 'explosiv strecken: Beine, Hüfte, Schultern' },
    ];
    if(o.zug) keys.push(
      { t: 1.2, p: [0, 1.0], r: -2, f: [0, .1], fw: 12, h: [.1, 1.32], bar: [.1, 1.32], ah: [0, 1], txt: 'Ellbogen hoch und außen' },
      { t: 2, ...STEH, ...griff, ...HANG2, fw: 0, txt: 'kontrolliert zurück' });
    else keys.push(
      { t: 1.2, p: [-.12, .7], r: 14, f: [0, .08], fw: 0, h: [.13, 1.4], bar: [.13, 1.4], ah: [1, .4], ahz: .3, txt: 'unter die Stange, Ellbogen schnell nach vorn' },
      { t: 1.8, ...STEH, h: [.11, 1.42], bar: [.11, 1.42], ah: [1, .4], txt: 'aufstehen' },
      { t: 2.6, ...STEH, ...griff, ...start, txt: 'Stange zurück' });
    return { dauer: 3.2, fokus: ['beine', 'gesaess', 'ruecken'], props: [{ typ: 'lh', an: 'haende' }], keys };
  }
  B['Umsetzen aus dem Hang'] = umsetzen({});
  B['Umsetzen vom Boden'] = umsetzen({ boden: true });
  B['Hochzug aus dem Hang'] = umsetzen({ zug: true });
  B['Medizinball-Wurf über Kopf'] = { dauer: 3, fade: true, fokus: ['beine', 'gesaess', 'schultern'], props: [{ typ: 'ball', r: .14 }], keys: [
    { t: 0, ...STEH, a: [176, 176], az: -.12, ball: [0, .7], txt: 'Ball mit gestreckten Armen' },
    { t: .5, p: [-.2, .64], r: 40, a: [168, 168], ball: [.12, .3], txt: 'tief ausholen' },
    { t: .85, p: [-.02, 1.05], r: -10, f: [0, .16], fw: 30, a: [-10, -10], ball: [-.15, 2.25], txt: 'explosiv strecken und über den Kopf werfen' },
    { t: 1.6, ...STEH, fw: 0, a: [-20, -20], ball: [-1.8, 3.2] },
    { t: 2.4, a: [176, 176], ball: [-3.5, 1.2] } ] };
  B['Medizinball-Slams'] = { dauer: 2.6, fokus: ['bauch', 'schultern'], props: [{ typ: 'ball', r: .14 }], keys: [
    { t: 0, ...STEH, a: [8, 8], az: -.12, ball: [0, 2.15], txt: 'Ball über den Kopf, auf die Zehen' },
    { t: .45, p: [-.16, .72], r: 50, a: [150, 150], ball: [.5, .14], txt: 'mit dem ganzen Körper auf den Boden' },
    { t: 1.1, p: [-.18, .6], r: 55, h: [.45, .2], ball: [.45, .14], txt: 'Ball aufnehmen' },
    { t: 1.9, ...STEH, a: [8, 8], ball: [0, 2.15] } ] };

  /* ---------- Bauch am Boden ---------- */
  const LIEGT = { p: [0, .12], r: -90, k: 0, l: [90, 90], a: [-90, -90] };
  B['Hollow Body Hold'] = { dauer: 5, fokus: ['bauch'], keys: [
    { t: 0, ...LIEGT, txt: 'auf dem Rücken, Arme über dem Kopf' },
    { t: 1, p: [0, .13], r: -70, b: 12, k: 12, l: [74, 74], a: [-74, -74], txt: 'Schultern und Beine heben, unterer Rücken am Boden' },
    { t: 3.8, txt: 'halten …' },
    { t: 4.4, ...LIEGT, b: 0 } ] };
  B['Hollow Body Rocks'] = { dauer: 2.4, fokus: ['bauch'], keys: [
    { t: 0, p: [0, .16], r: -62, b: 12, k: 12, l: [80, 80], a: [-66, -66], txt: 'Hollow-Position halten' },
    { t: 1.2, p: [.02, .14], r: -80, l: [62, 62], a: [-84, -84], txt: 'wie eine Wippe vor und zurück' } ] };
  B['Dead Bug'] = { dauer: 4, fokus: ['bauch'], keys: [
    { t: 0, p: [0, .12], r: -90, k: 5, a: [0, 0], l: [0, 90], txt: 'Arme hoch, Knie 90°' },
    { t: 1, L: { a: [-80, -80] }, R: { l: [82, 85] }, txt: 'Gegenarm und Gegenbein strecken' },
    { t: 1.8, L: { a: [0, 0] }, R: { l: [0, 90] } },
    { t: 2.8, R: { a: [-80, -80] }, L: { l: [82, 85] }, txt: 'andere Seite' },
    { t: 3.6, R: { a: [0, 0] }, L: { l: [0, 90] } } ] };
  B['Reverse Crunch'] = { dauer: 3, fokus: ['bauch'], keys: [
    { t: 0, p: [0, .12], r: -90, k: 5, a: [97, 92], l: [2, 90], txt: 'Knie über der Hüfte' },
    { t: 1, p: [-.05, .2], r: -100, l: [-40, 50], txt: 'Hüfte vom Boden rollen, Knie zur Brust' },
    { t: 1.4, txt: 'langsam zurück' },
    { t: 2.6, p: [0, .12], r: -90, l: [2, 90] } ] };
  B['Reverse Crunch an der Schrägbank'] = { ...B['Reverse Crunch'], props: [{ typ: 'block', c: [-.3, .2], g: [1.2, .2, .3] }],
    keys: B['Reverse Crunch'].keys.map(k => k.p ? { ...k, p: [k.p[0], k.p[1] + .2] } : k) };
  B['V-Ups'] = { dauer: 3, fokus: ['bauch'], keys: [
    { t: 0, ...LIEGT, b: 0, txt: 'flach liegen' },
    { t: 1, p: [0, .12], r: -32, b: 10, l: [34, 34], a: [40, 40], k: 10, txt: 'Oberkörper und Beine gleichzeitig heben' },
    { t: 1.4, txt: 'Hände zu den Füßen' },
    { t: 2.6, ...LIEGT, b: 0 } ] };
  B['Pike-Kompression'] = { dauer: 3.4, fokus: ['bauch', 'oberschenkel'], keys: [
    { t: 0, p: [0, .12], r: 28, b: 12, k: 0, l: [90, 90], h: [.38, .05], hd: 90, az: .1, txt: 'Beine gestreckt, Hände neben den Knien' },
    { t: 1.1, l: [76, 76], txt: 'Beine anheben, ohne zurückzulehnen' },
    { t: 2.2, txt: 'halten …' },
    { t: 3, l: [90, 90] } ] };
  B['L-Sit'] = { dauer: 5.6, fokus: ['bauch', 'trizeps', 'oberschenkel'], props: [{ typ: 'parallettes', x: 0, y: .12 }], keys: [
    { t: 0, p: [-.02, .14], r: 4, k: 0, l: [90, 90], h: [0, .13], az: .05, ah: [-1, 0], txt: 'zwischen den Griffen sitzen' },
    { t: .9, p: [-.02, .27], txt: 'hochdrücken, Beine waagrecht' },
    { t: 4.2, txt: 'halten …' },
    { t: 4.8, p: [-.02, .14] } ] };
  const UNTERARM = brett(0, .1, .38);
  B['Unterarmstütz'] = { dauer: 4, fokus: ['bauch'], keys: [
    { t: 0, ...ohneSx(UNTERARM), h: [UNTERARM.sx + .27, .05], hd: 90, az: .02, ah: [0, -1], f: [0, .1], fa: 172, k: 8, txt: 'Ellbogen unter den Schultern, Körper gerade' },
    { t: 2, p: [UNTERARM.p[0], UNTERARM.p[1] + .015], txt: 'Bauch und Gesäß fest' } ] };
  B['Body Saw'] = (() => { const Z = brett(-.16, .1, .38); return { dauer: 3, fokus: ['bauch', 'schultern'], props: PADS, keys: [
    { t: 0, ...ohneSx(UNTERARM), h: [UNTERARM.sx + .27, .05], hd: 90, az: .02, ah: [0, -1], f: [0, .1], fa: 172, k: 8, txt: 'Unterarmstütz, Füße auf Gleitpads' },
    { t: 1.2, ...ohneSx(Z), f: [-.16, .1], txt: 'aus den Schultern nach hinten schieben' },
    { t: 2.6, ...ohneSx(UNTERARM), f: [0, .1] } ] }; })();
  B['Ab Wheel'] = (() => {
    const K = [0, .1], pose = (p, r) => ({ p, r, l: [ATAN(K[0] - p[0], K[1] - p[1]), -88] });
    return { dauer: 3.6, fokus: ['bauch', 'schultern'], props: [{ typ: 'rad' }], keys: [
      { t: 0, ...pose([0, .5], 66), b: 14, k: 0, h: [.42, .12], az: -.12, txt: 'kniend, Rad unter den Schultern' },
      { t: .3, txt: 'langsam nach vorn rollen, Bauch fest' },
      { t: 1.7, ...pose([.32, .3], 96), b: 4, h: [1.24, .12], txt: 'so weit, wie der Rücken gerade bleibt' },
      { t: 2.1, txt: 'mit dem Bauch zurückziehen' },
      { t: 3.3, ...pose([0, .5], 66), b: 14, h: [.42, .12] } ] }; })();
  B['Dragon Flag Negativ'] = (() => {
    const S = [-.7, .58], pose = phi => ({ p: [S[0] + SIN(phi) * .52, S[1] + COS(phi) * .52], r: phi - 180, l: [phi, phi] });
    return { dauer: 5, fokus: ['bauch'], props: [{ typ: 'block', c: [-.25, .21], g: [1.3, .42, .32] }], keys: [
      { t: 0, ...pose(8), k: 0, h: [-.92, .45], az: .05, ah: [0, 1], txt: 'an der Bank festhalten, Körper senkrecht' },
      { t: .4, txt: 'als gerades Brett langsam absenken' },
      { t: 3.6, ...pose(80), txt: 'Hüfte nicht abknicken' },
      { t: 4.3, ...pose(8) } ] }; })();
  const VIER = { p: [0, .56], r: 80, k: 10, l: [180, -90], h: [.5, .05], hd: 90, az: .02, ah: [-1, 0] };
  B['Bird Dog'] = { dauer: 4.4, fokus: ['ruecken', 'bauch'], keys: [
    { t: 0, ...VIER, txt: 'Vierfüßlerstand' },
    { t: 1, L: { a: [95, 95] }, R: { l: [-95, -95] }, txt: 'Gegenarm und Gegenbein strecken' },
    { t: 2, L: { h: [.5, .05] }, R: { l: [180, -90] } },
    { t: 3.1, R: { a: [95, 95] }, L: { l: [-95, -95] }, txt: 'andere Seite' },
    { t: 4, R: { h: [.5, .05] }, L: { l: [180, -90] } } ] };
  B['Handgelenk-Vorbereitung'] = { dauer: 4, fokus: ['unterarme'], keys: [
    { t: 0, ...VIER, az: .04, txt: 'Vierfüßlerstand, Finger nach vorn' },
    { t: 1.2, p: [.14, .54], r: 84, txt: 'Gewicht langsam nach vorn verlagern' },
    { t: 2.2, txt: 'zurück, dann Finger seitlich und nach hinten' },
    { t: 3.4, p: [0, .56], r: 80 } ] };
  B['Handgelenk-Curls'] = { dauer: 2.6, fokus: ['unterarme'], props: [SITZ[0], { typ: 'kh', quer: true }], keys: [
    { t: 0, p: [0, .5], r: 22, k: 15, l: [90, 180], a: [150, 94], hd: 130, txt: 'Unterarme auf den Oberschenkeln' },
    { t: 1, hd: 55, txt: 'nur das Handgelenk beugen' },
    { t: 1.4, txt: 'langsam zurück' },
    { t: 2.3, hd: 130 } ] };
  B['Kabel-Crunch'] = { dauer: 3, fokus: ['bauch'], props: [{ typ: 'kabel', von: [.45, 2.25], an: 'haende', eins: true }], keys: [
    { t: 0, ...KNIEN, r: 12, hb: [.38, .06], az: -.1, ah: [1, 0], txt: 'kniend, Seil neben dem Kopf' },
    { t: 1.1, p: [-.06, .53], r: 52, b: 32, txt: 'Brust zu den Knien einrollen' },
    { t: 1.5, txt: 'langsam zurück' },
    { t: 2.6, ...KNIEN, r: 12, b: 0 } ] };
  B['Crunch-Maschine'] = { dauer: 3, fokus: ['bauch'], props: [SITZ[0]], keys: [
    { t: 0, p: [0, .5], r: -6, k: 0, l: [92, 178], hb: [.32, .1], az: .03, ah: [1, -.5], txt: 'Griffe an den Schultern' },
    { t: 1.1, r: 22, b: 26, txt: 'einrollen, nicht ziehen' },
    { t: 1.5, txt: 'langsam zurück' },
    { t: 2.6, r: -6, b: 0 } ] };
  B['Sit-ups an der Schrägbank'] = { dauer: 3.4, fokus: ['bauch'], props: [{ typ: 'block', c: [-.25, .52], g: [1.4, .1, .32], r: -12 }], keys: [
    { t: 0, p: [0, .68], r: -106, k: 10, f: [.5, .78], fa: 80, lh: [-.3, 1], a: [165, 40], arel: true, txt: 'Füße unter dem Polster, Kopf unten' },
    { t: .3, txt: 'Wirbel für Wirbel hochrollen' },
    { t: 1.6, r: -12, b: 14, txt: 'oben' },
    { t: 2, txt: 'langsam zurück' },
    { t: 3.1, r: -106, b: 0 } ] };

  /* ---------- Hängend Beine heben ---------- */
  function beinheben(o){
    const d = o.dauer || 3.2, basis = o.basis || hang();
    return { dauer: d, fokus: ['bauch'], props: o.props || STG, keys: [
      { t: 0, ...basis, l: [176, 184], txt: o.txt0 || 'ruhig hängen' },
      { t: 1, ...(o.oben || {}), txt: o.txt1 },
      { t: 1.4, txt: 'langsam ablassen' },
      { t: d - .4, ...basis, l: [176, 184] } ] };
  }
  B['Hängendes Knieheben'] = beinheben({ oben: { l: [70, 175], r: -6 }, txt1: 'Knie über Hüfthöhe ziehen' });
  B['Hängendes Beinheben'] = beinheben({ oben: { l: [86, 88], r: -10, p: [0, STANGE - 1.1] }, txt1: 'Beine gestreckt bis waagrecht' });
  B['Hängendes Beinheben mit Gewicht'] = { ...B['Hängendes Beinheben'], props: [...STG, { typ: 'kh', an: 'fuesse' }] };
  B['Toes to Bar'] = beinheben({ dauer: 3.4, oben: { p: [.08, STANGE - 1.08], r: -26, l: [-12, -10] }, txt1: 'Füße zur Stange' });
  B['Scheibenwischer hängend'] = { dauer: 4, fokus: ['bauch'], cam: 70, props: STG, keys: [
    { t: 0, ...hang(), p: [.08, STANGE - 1.08], r: -24, l: [-8, -8], txt: 'Beine oben an der Stange' },
    { t: 1, L: { ls: 40 }, R: { ls: -40 }, txt: 'Beine zu einer Seite kippen' },
    { t: 2, L: { ls: 0 }, R: { ls: 0 } },
    { t: 3, L: { ls: -40 }, R: { ls: 40 }, txt: 'zur anderen Seite' } ] };
  B['Beinheben am Dip-Stuhl'] = beinheben({ props: [{ typ: 'block', c: [-.22, 1.35], g: [.08, .9, .45] }, { typ: 'block', c: [.05, 1.31], g: [.35, .08, .12], z: .3 }, { typ: 'block', c: [.05, 1.31], g: [.35, .08, .12], z: -.3 }],
    basis: { p: [-.04, 1.15], r: 0, k: 0, a: [180, 90], as: 8 }, oben: { l: [86, 90] }, txt0: 'Unterarme auf den Polstern', txt1: 'Beine bis waagrecht heben' });

  /* ---------- Seitstütz (Figur um die Längsachse gekippt) ---------- */
  const SEIT = { p: [0, STAND], r: 0, k: 0, l: [180, 180], fz: 0, roll: 77, rp: [0, .08, .17], L: { a: [180, 90], as: 90, as2: 0 }, R: { a: [180, 180], as: 4 } };
  B['Seitstütz'] = { dauer: 4, fokus: ['bauch'], cam: 60, keys: [
    { t: 0, ...SEIT, txt: 'Ellbogen unter der Schulter, Körper gerade' },
    { t: 2, roll: 78.5, txt: 'Hüfte hoch halten' } ] };
  B['Seitstütz mit Hüftheben'] = { dauer: 3, fokus: ['bauch'], cam: 60, keys: [
    { t: 0, ...SEIT, roll: 70, txt: 'Hüfte locker Richtung Boden' },
    { t: 1.2, roll: 80, txt: 'Hüfte hochdrücken' },
    { t: 1.6, txt: 'langsam ablassen' },
    { t: 2.7, roll: 70 } ] };
  B['Copenhagen Plank'] = { dauer: 4, fokus: ['bauch', 'oberschenkel'], cam: 60, props: [{ typ: 'block', c: [0, .15], g: [.45, .3, .4], z: -.44 }], keys: [
    { t: 0, ...SEIT, roll: 75, rp: [0, .4, -.13], L: { a: [180, 90], as: 90, as2: 0, l: [180, -60] }, txt: 'oberes Bein auf der Bank' },
    { t: 2, roll: 76.5, txt: 'Körper gerade, Leiste fest' } ] };

  /* ---------- Gehen, Tragen, Sprint ---------- */
  function gehen(o){
    const A = { L: { l: [158, 172] }, R: { l: [200, 212] } }, M1 = { L: { l: [180, 186] }, R: { l: [168, 232] } };
    const Z = { L: { l: [200, 212] }, R: { l: [158, 172] } }, M2 = { L: { l: [168, 232] }, R: { l: [180, 186] } };
    const x = o.x || 0, y = o.y ?? STAND;
    return { dauer: 1.6, fokus: o.fokus, props: o.props, keys: [
      { t: 0, r: o.r ?? 2, k: 0, ...o.arme, ...A, p: [x, y - .04], txt: o.txt0 }, { t: .4, ...M1, p: [x, y] },
      { t: .8, ...Z, p: [x, y - .04] }, { t: 1.2, ...M2, p: [x, y] } ] };
  }
  B['Farmer’s Walk'] = gehen({ fokus: ['unterarme', 'schultern', 'bauch'], arme: { a: [180, 180], as: 7 }, props: [{ typ: 'kh' }], txt0: 'aufrecht, zügig gehen' });
  B['Einseitiges Tragen'] = gehen({ fokus: ['bauch', 'unterarme'], arme: { L: { a: [180, 180], as: 6 }, R: { a: [176, 170] } }, props: [{ typ: 'kh', an: 'L' }], txt0: 'nicht zur Seite kippen' });
  B['Schlittenschieben'] = gehen({ r: 48, x: -.2, y: STAND - .12, fokus: ['beine', 'gesaess'], arme: { h: [.72, 1.0], az: .05, ah: [-1, -.3] }, props: [{ typ: 'block', c: [1.1, .25], g: [.6, .3, .6] }, { typ: 'block', c: [.84, .65], g: [.05, .8, .5] }], txt0: 'weit vorgelehnt, kräftig vom Boden abdrücken' });
  B['Wall Drill'] = (() => { const al = 45, P = [SIN(al) * .89 - .1, .1 + COS(al) * .89];
    return { dauer: 1.6, fokus: ['beine', 'gesaess'], cam: -40, props: [{ typ: 'wand', x: .98, n: 1 }], keys: [
      { t: 0, p: P, r: al, k: 0, h: [.96, 1.32], az: .02, L: { f: [-.1, .1], fw: 25 }, R: { l: [al + 70, al + 160] }, txt: 'schräg an der Wand, Knie hoch' },
      { t: .4, R: { f: [-.1, .1], fw: 25 } },
      { t: .8, L: { l: [al + 70, al + 160] }, R: { f: [-.1, .1] }, txt: 'schnell wechseln' },
      { t: 1.2, L: { f: [-.1, .1] } } ] }; })();
  B['Kabel-Knieheben'] = { dauer: 2.4, fokus: ['oberschenkel'], props: [{ typ: 'kabel', von: [-.9, .12, -.12], an: 'fussR' }], keys: [
    { t: 0, ...STEH, L: { f: [0, .08], a: [150, 70] }, R: { l: [185, 190], a: [200, 120] }, txt: 'Kabel am Fuß' },
    { t: .8, R: { l: [82, 172], a: [150, 70] }, L: { a: [200, 120] }, txt: 'Knie explosiv hoch' },
    { t: 1.2, txt: 'langsam zurück' },
    { t: 2.1, R: { l: [185, 190], a: [200, 120] }, L: { a: [150, 70] } } ] };
  B['Liegendes Knieheben mit Band'] = { dauer: 2.4, fokus: ['oberschenkel', 'bauch'], props: [{ typ: 'band', von: 'fussL', an: 'fussR' }], keys: [
    { t: 0, p: [0, .12], r: -90, k: 10, a: [97, 92], L: { l: [90, 90] }, R: { l: [2, 90] }, txt: 'Band um die Füße, ein Knie hoch' },
    { t: 1.2, L: { l: [2, 90] }, R: { l: [90, 90] }, txt: 'Beine schnell wechseln' } ] };
  B['Adduktoren-Maschine'] = { dauer: 3, fokus: ['oberschenkel'], cam: 80, props: SITZ, keys: [
    { t: 0, p: [0, .5], r: -6, k: 0, l: [90, 180], ls: 38, ls2: 0, a: [170, 120], txt: 'Polster an den Innenseiten der Knie' },
    { t: 1.1, ls: 4, txt: 'Beine zusammendrücken' },
    { t: 1.5, txt: 'langsam öffnen' },
    { t: 2.6, ls: 38 } ] };

  /* ---------- Beweglichkeit ---------- */
  B['Pike-Dehnung'] = { dauer: 5, fokus: ['beinbeuger'], keys: [
    { t: 0, p: [0, .12], r: 6, k: 0, l: [90, 90], a: [170, 170], txt: 'Beine gestreckt nach vorn' },
    { t: 1.3, r: 62, b: 18, k: 10, a: [102, 102], txt: 'Brust Richtung Knie, Rücken lang' },
    { t: 3.8, txt: 'tief atmen …' } ] };
  B['Pancake-Dehnung'] = { dauer: 5, fokus: ['beinbeuger', 'oberschenkel'], cam: 50, keys: [
    { t: 0, p: [0, .12], r: 6, k: 0, l: [90, 90], ls: 44, a: [170, 170], txt: 'Beine weit gegrätscht' },
    { t: 1.3, r: 58, b: 12, k: 10, a: [100, 100], txt: 'aus der Hüfte nach vorn kippen' },
    { t: 3.8, txt: 'tief atmen …' } ] };
  B['Couch Stretch'] = { dauer: 5, fokus: ['oberschenkel'], props: [{ typ: 'block', c: [-.24, .25], g: [.22, .5, .45] }], keys: [
    { t: 0, p: [0, .52], r: 18, k: 0, L: { f: [.46, .08], lh: [1, 0] }, R: { l: [188, 4] }, a: [180, 100], txt: 'hinteres Knie an der Bank, Schienbein hoch' },
    { t: 1.3, r: -4, a: [176, 176], txt: 'Oberkörper aufrichten, Gesäß anspannen' },
    { t: 3.8, txt: 'halten …' } ] };

  window.BEWEGUNGEN = B;
})();
