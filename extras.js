/* Zusatz-Einheiten für Tage, an denen mehr Zeit und Lust da ist.
   modus 'low' = Low-Key (locker, kurz, stört Leichtathletik und Gym-Tage nicht)
   modus 'high' = High-Key (hart, lang, braucht danach einen leichten Tag).
   Übungen, die es im Wochenplan schon gibt, werden mit u('Name') übernommen (gleiche Ziele, gleiche Progression).
   wie: 'A1' = der Platz folgt der aktuellen Stufe aus dem Wochenplan (gleiche Wahl, gleiche Leiter). */
(() => {
  const alle = {};
  for (const w of window.WORKOUTS) for (const s of w.slots) for (const o of s.optionen) alle[o.name] ||= o;
  const u = name => { if (!alle[name]) throw new Error('Übung fehlt im Plan: ' + name); return alle[name]; };

  /* Neue Übungen, die nur in den Zusatz-Einheiten vorkommen */
  const neu = {
    handgelenk: { name: 'Handgelenk-Vorbereitung', art: 'cali', geraet: 'Boden', stufe: 1, einheit: 'sec', bw: true, s: 2, von: 30, bis: 60, yt: 'wrist warm up calisthenics', tipp: 'Im Vierfüßlerstand Finger nach vorn, zur Seite, nach hinten, dann Handrücken. Langsam Gewicht nach vorn verlagern. Pflicht vor jeder Planche-Einheit.' },
    hgCurls: { name: 'Handgelenk-Curls', art: 'gym', geraet: 'Kurzhantel', einheit: 'reps', s: 2, von: 15, bis: 20, plus: 1, yt: 'dumbbell wrist curls form', tipp: 'Unterarm auf dem Oberschenkel, nur das Handgelenk bewegt sich. Leicht anfangen, die Sehnen brauchen Zeit.' },
    dislocates: { name: 'Schulter-Dislocates mit Band', art: 'cali', geraet: 'Band / Stab', stufe: 1, einheit: 'reps', bw: true, s: 2, von: 10, bis: 15, yt: 'shoulder dislocates band', tipp: 'Arme gestreckt, Band weit greifen und langsam über den Kopf nach hinten führen. Jede Woche etwas enger greifen.' },
    deutschHang: { name: 'Deutsches Hängen', art: 'cali', geraet: 'Ringe / Stange', stufe: 2, einheit: 'sec', bw: true, s: 3, von: 10, bis: 30, yt: 'german hang tutorial', tipp: 'Über Skin the Cat nach hinten durchdrehen und unten hängen bleiben. Dehnt Brust und Schulter für die Planche. Füße anfangs am Boden lassen.' },
    passivHang: { name: 'Passives Hängen', art: 'cali', geraet: 'Stange', stufe: 1, einheit: 'sec', bw: true, s: 3, von: 20, bis: 45, yt: 'dead hang benefits form', tipp: 'Locker an der Stange hängen, Schultern bis zu den Ohren lassen. Öffnet die Schultern, stärkt den Griff.' },
    pike: { name: 'Pike-Dehnung', art: 'cali', geraet: 'Boden', stufe: 1, einheit: 'sec', bw: true, s: 3, von: 30, bis: 60, yt: 'pike stretch routine', tipp: 'Beine gestreckt, Brust Richtung Knie, Rücken lang. Hilft bei L-Sit und Kompression.' },
    pancake: { name: 'Pancake-Dehnung', art: 'cali', geraet: 'Boden', stufe: 2, einheit: 'sec', bw: true, s: 3, von: 30, bis: 60, yt: 'pancake stretch routine', tipp: 'Beine weit gegrätscht, aus der Hüfte nach vorn kippen. Für die Straddle Planche und den Straddle Front Lever.' },
    jefferson: { name: 'Jefferson Curl', art: 'gym', geraet: 'Kurzhantel', einheit: 'reps', s: 2, von: 6, bis: 10, plus: 2, yt: 'jefferson curl form', tipp: 'Sehr leicht. Wirbel für Wirbel nach unten einrollen und langsam wieder aufrollen.' },
    couch: { name: 'Couch Stretch', art: 'cali', geraet: 'Wand / Bank', stufe: 1, einheit: 'sec', bw: true, s: 2, von: 30, bis: 60, seite: true, yt: 'couch stretch hip flexor', tipp: 'Hinteres Knie an der Wand, Gesäß anspannen, Oberkörper aufrichten. Dehnt den Hüftbeuger, wichtig fürs Sprinten.' },
    hocke: { name: 'Tiefe Hocke halten', art: 'cali', geraet: 'Boden', stufe: 1, einheit: 'sec', bw: true, s: 3, von: 30, bis: 60, yt: 'deep squat hold mobility', tipp: 'Fersen am Boden, Knie über den Zehen, Ellbogen schieben die Knie leicht nach außen.' },
    neunzig: { name: '90/90-Wechsel', art: 'cali', geraet: 'Boden', stufe: 1, einheit: 'reps', bw: true, s: 2, von: 6, bis: 10, seite: true, yt: '90 90 hip switch', tipp: 'Sitzend, beide Knie 90° gebeugt, langsam von einer Seite zur anderen kippen. Hüfte rotiert besser.' },

    khCurls: { name: 'Kurzhantel-Curls', art: 'gym', geraet: 'Kurzhantel', einheit: 'reps', s: 3, von: 8, bis: 12, plus: 2, yt: 'dumbbell bicep curl form', tipp: 'Ellbogen bleiben am Körper, langsam runter. Starker Bizeps schützt die Ellbogen in Planche und Front Lever.' },
    hammer: { name: 'Hammer-Curls', art: 'gym', geraet: 'Kurzhantel', einheit: 'reps', s: 3, von: 8, bis: 12, plus: 2, yt: 'hammer curl form', tipp: 'Daumen zeigen nach oben. Trainiert auch den Unterarm.' },
    kabelCurls: { name: 'Kabel-Curls', art: 'gym', geraet: 'Kabelzug', einheit: 'reps', s: 3, von: 10, bis: 12, plus: 2.5, yt: 'cable bicep curl form', tipp: 'Gleichmäßige Spannung über die ganze Bewegung, oben kurz anspannen.' },
    ringCurls: { name: 'Ring-Bizepscurls', art: 'cali', geraet: 'Ringe', stufe: 2, einheit: 'reps', bw: true, s: 3, von: 8, bis: 12, yt: 'ring bicep curls', tipp: 'Körper gerade und schräg, nur die Ellbogen beugen. Je flacher, desto schwerer.' },
    diamant: { name: 'Diamant-Liegestütze', art: 'cali', geraet: 'Boden', stufe: 1, einheit: 'reps', bw: true, s: 3, von: 8, bis: 15, yt: 'diamond push up form', tipp: 'Daumen und Zeigefinger bilden eine Raute unter der Brust, Ellbogen nah am Körper.' },
    ueberkopf: { name: 'Überkopf-Trizepsstrecken am Kabel', art: 'gym', geraet: 'Kabelzug', einheit: 'reps', s: 3, von: 10, bis: 12, plus: 2.5, yt: 'overhead cable tricep extension', tipp: 'Rücken zum Kabelzug, Ellbogen zeigen nach vorn, nur der Unterarm bewegt sich. Dehnt den langen Trizepskopf.' },
    seitheben: { name: 'Kurzhantel-Seitheben', art: 'gym', geraet: 'Kurzhantel', einheit: 'reps', s: 3, von: 12, bis: 15, plus: 2, yt: 'dumbbell lateral raise form', tipp: 'Leicht vorgebeugt, Ellbogen führen, nur bis Schulterhöhe. Lieber leichter und sauber.' },
    kabelSeit: { name: 'Kabel-Seitheben', art: 'gym', geraet: 'Kabelzug', einheit: 'reps', s: 3, von: 12, bis: 15, plus: 2.5, seite: true, yt: 'cable lateral raise form', tipp: 'Kabel von unten, Arm seitlich bis Schulterhöhe. Spannung auch unten.' },
    yRaise: { name: 'Y-Heben liegend', art: 'cali', geraet: 'Boden / Schrägbank', stufe: 1, einheit: 'reps', bw: true, s: 3, von: 10, bis: 15, yt: 'prone y raise', tipp: 'Bäuchlings, Arme in Y-Form gestreckt heben, Daumen nach oben. Stärkt den unteren Trapez für saubere Schultern.' },
    facePull: { name: 'Face Pulls', art: 'gym', geraet: 'Kabelzug', einheit: 'reps', s: 3, von: 12, bis: 15, plus: 2.5, yt: 'face pull form', tipp: 'Seil auf Augenhöhe zum Gesicht ziehen, Hände am Ende neben die Ohren. Gesunde Schultern.' },
    pullApart: { name: 'Band Pull-Aparts', art: 'cali', geraet: 'Band', stufe: 1, einheit: 'reps', bw: true, s: 3, von: 15, bis: 25, yt: 'band pull apart form', tipp: 'Arme gestreckt vor der Brust, Band bis an die Brust auseinanderziehen.' },
    reverseFly: { name: 'Reverse Flys an der Maschine', art: 'gym', geraet: 'Maschine', einheit: 'reps', s: 3, von: 12, bis: 15, plus: 2.5, yt: 'reverse pec deck form', tipp: 'Brust an das Polster, Arme leicht gebeugt nach hinten führen.' },
    farmer: { name: 'Farmer’s Walk', art: 'gym', geraet: 'Kurzhantel', einheit: 'sec', s: 3, von: 30, bis: 45, plus: 2, yt: 'farmers walk form', tipp: 'Zwei schwere Hanteln, aufrecht und zügig gehen. Griff, Rumpf und Schultern auf einmal.' },

    cossack: { name: 'Cossack Squat', art: 'cali', geraet: 'Boden', stufe: 2, einheit: 'reps', bw: true, s: 2, von: 6, bis: 10, seite: true, yt: 'cossack squat tutorial', tipp: 'Weiter Stand, zu einer Seite tief absitzen, das andere Bein bleibt gestreckt. Kraft und Beweglichkeit.' },
    bruecke: { name: 'Hüftbrücke', art: 'cali', geraet: 'Boden', stufe: 1, einheit: 'reps', bw: true, s: 3, von: 12, bis: 20, yt: 'glute bridge form', tipp: 'Fersen nah am Gesäß, Hüfte hoch, oben 2 s anspannen.' },
    rueckwaerts: { name: 'Ausfallschritte rückwärts', art: 'cali', geraet: 'Boden', stufe: 1, einheit: 'reps', bw: true, s: 3, von: 8, bis: 12, seite: true, yt: 'reverse lunge form', tipp: 'Großer Schritt nach hinten, hinteres Knie knapp über den Boden. Schont die Knie mehr als nach vorn.' },
    tibialis: { name: 'Tibialis-Heben', art: 'cali', geraet: 'Wand', stufe: 1, einheit: 'reps', bw: true, s: 2, von: 15, bis: 25, yt: 'tibialis raise wall', tipp: 'Rücken an der Wand, Füße vorn, Zehen hochziehen. Beugt Schienbeinkantensyndrom beim Sprinten vor.' },
    deadBug: { name: 'Dead Bug', art: 'cali', geraet: 'Boden', stufe: 1, einheit: 'reps', bw: true, s: 3, von: 6, bis: 10, seite: true, yt: 'dead bug exercise form', tipp: 'Rücken flach am Boden, gegenüberliegenden Arm und Bein langsam strecken.' },
    birdDog: { name: 'Bird Dog', art: 'cali', geraet: 'Boden', stufe: 1, einheit: 'reps', bw: true, s: 2, von: 8, bis: 12, seite: true, yt: 'bird dog exercise form', tipp: 'Vierfüßlerstand, gegenüberliegenden Arm und Bein strecken, Becken bleibt ruhig.' },
    kreuzheben: { name: 'Kreuzheben', art: 'gym', geraet: 'Langhantel', einheit: 'reps', s: 3, von: 3, bis: 5, plus: 5, yt: 'conventional deadlift form', tipp: 'Stange über der Fußmitte, Rücken gerade, Stange am Bein entlang hochschieben.' },
    freierHs: { name: 'Freier Handstand üben', art: 'cali', geraet: 'Boden', stufe: 3, einheit: 'sec', bw: true, s: 5, von: 5, bis: 20, yt: 'freestanding handstand balance tutorial', tipp: 'Gegen die Wand hochschwingen, eine Ferse nach der anderen lösen. Über die Finger balancieren.' },
  };

  window.EXTRAS = [
    {
      id: 'L1', modus: 'low', name: 'Beweglichkeit & Handgelenke', kurz: 'Mobility', dauer: '~20 min',
      hinweis: 'Geht an jedem Tag, auch vor Leichtathletik. Macht Planche und Front Lever auf Dauer schmerzfrei.',
      aufwaermen: '2 min locker hampeln oder Seilspringen.',
      slots: [
        { id: 'L1a', titel: 'Handgelenke', gruppe: 'push', pause: '30 s', std: neu.handgelenk.name, optionen: [neu.handgelenk, neu.hgCurls] },
        { id: 'L1b', titel: 'Schultern öffnen', gruppe: 'pull', pause: '45 s', std: neu.dislocates.name, auf: { [neu.passivHang.name]: neu.deutschHang.name }, optionen: [neu.dislocates, neu.passivHang, neu.deutschHang] },
        { id: 'L1c', titel: 'Beinrückseite', gruppe: 'beine', pause: '30 s', std: neu.pike.name, auf: { [neu.pike.name]: neu.pancake.name }, optionen: [neu.pike, neu.pancake, neu.jefferson] },
        { id: 'L1d', titel: 'Hüfte', gruppe: 'beine', pause: '30 s', std: neu.couch.name, optionen: [neu.couch, neu.hocke, neu.neunzig] },
      ],
    },
    {
      id: 'L2', modus: 'low', name: 'Arme & Schultern', kurz: 'Arme', dauer: '~30 min',
      hinweis: 'Leichter Pump, kein Muskelversagen. Bizeps und hintere Schulter schützen Ellbogen und Schultern bei den Halteübungen.',
      aufwaermen: '2 × 15 Band Pull-Aparts, Arme kreisen.',
      slots: [
        { id: 'L2a', titel: 'Bizeps', gruppe: 'pull', pause: '60 s', std: neu.khCurls.name, optionen: [neu.ringCurls, neu.khCurls, neu.hammer, neu.kabelCurls] },
        { id: 'L2b', titel: 'Trizeps', gruppe: 'push', pause: '60 s', std: 'Trizepsdrücken am Kabel', auf: { [neu.diamant.name]: 'Bank-Dips' }, optionen: [neu.diamant, u('Bank-Dips'), u('Trizepsdrücken am Kabel'), neu.ueberkopf] },
        { id: 'L2c', titel: 'Seitliche Schulter', gruppe: 'push', pause: '60 s', std: neu.seitheben.name, optionen: [neu.yRaise, neu.seitheben, neu.kabelSeit] },
        { id: 'L2d', titel: 'Hintere Schulter', gruppe: 'pull', pause: '60 s', std: neu.facePull.name, optionen: [neu.pullApart, neu.facePull, neu.reverseFly] },
        { id: 'L2e', titel: 'Griff & Unterarme', gruppe: 'pull', pause: '60 s', std: neu.passivHang.name, optional: true, optionen: [neu.passivHang, neu.farmer, neu.hgCurls] },
      ],
    },
    {
      id: 'L3', modus: 'low', name: 'Beine locker', kurz: 'Beine', dauer: '~25 min',
      hinweis: 'Leicht genug für den Tag vor dem Training: in jedem Satz 2–3 Wiederholungen vor dem Versagen aufhören. Schienbein und Adduktoren beugen Sprintverletzungen vor.',
      aufwaermen: '3 min Seilspringen, 10 Kniebeugen ohne Gewicht.',
      slots: [
        { id: 'L3a', titel: 'Kniebeuge leicht', gruppe: 'beine', pause: '60 s', std: 'Goblet-Kniebeuge', optionen: [neu.cossack, u('Goblet-Kniebeuge'), u('Beinpresse')] },
        { id: 'L3b', titel: 'Gesäß', gruppe: 'beine', pause: '60 s', std: neu.bruecke.name, auf: { [neu.bruecke.name]: 'Einbeinige Hüftbrücke' }, optionen: [neu.bruecke, u('Einbeinige Hüftbrücke'), u('Hip Thrust')] },
        { id: 'L3c', titel: 'Einbeinig', gruppe: 'beine', pause: '60 s', std: neu.rueckwaerts.name, optionen: [neu.rueckwaerts, u('Step-ups'), u('Ausfallschritte gehend')] },
        { id: 'L3d', titel: 'Schienbein & Waden', gruppe: 'beine', pause: '45 s', std: neu.tibialis.name, optionen: [neu.tibialis, u('Einbeiniges Wadenheben'), u('Wadenheben sitzend')] },
        { id: 'L3e', titel: 'Adduktoren', gruppe: 'beine', pause: '45 s', std: 'Adduktoren-Maschine', optional: true, optionen: [u('Copenhagen Plank'), u('Adduktoren-Maschine')] },
      ],
    },
    {
      id: 'L4', modus: 'low', name: 'Core kurz', kurz: 'Core', dauer: '~15 min',
      hinweis: 'Schnell nach Tennis oder Leichtathletik dranhängen. Jeder Bauchbereich einmal, dazu der untere Rücken.',
      aufwaermen: 'Nicht nötig, wenn du vom Training kommst. Sonst 1 min Unterarmstütz.',
      slots: [
        { id: 'L4a', titel: 'Vorderer Bauch', gruppe: 'core', pause: '45 s', std: neu.deadBug.name, optionen: [neu.deadBug, u('Hollow Body Hold'), u('Kabel-Crunch')] },
        { id: 'L4b', titel: 'Seitlicher Bauch', gruppe: 'core', pause: '45 s', std: 'Seitstütz', optionen: [u('Seitstütz'), u('Pallof-Press'), u('Einseitiges Tragen')] },
        { id: 'L4c', titel: 'Unterer Bauch', gruppe: 'core', pause: '45 s', std: 'Reverse Crunch', optionen: [u('Reverse Crunch'), u('Hängendes Knieheben'), u('Beinheben am Dip-Stuhl')] },
        { id: 'L4d', titel: 'Unterer Rücken', gruppe: 'core', pause: '45 s', std: neu.birdDog.name, optionen: [neu.birdDog, u('Rückenstrecker')] },
      ],
    },
    {
      id: 'H1', modus: 'high', name: 'Beine Power', kurz: 'Beine+', dauer: '~70 min',
      hinweis: 'Schwer und explosiv. Danach mindestens ein Tag ohne Sprint und ohne Tag C, also z. B. Sonntag, wenn Tag C am Samstag war, oder in einer Woche ohne Wettkampf.',
      aufwaermen: '5 min Rad oder Seilspringen, Beinpendel, 2 Aufwärmsätze bei der Kniebeuge (leer, dann halbes Gewicht).',
      slots: [
        { id: 'H1a', titel: 'Sprünge', gruppe: 'beine', pause: '2 min', std: 'Box Jumps', optionen: [u('Box Jumps'), u('Standweitsprung'), u('Trap-Bar-Sprung'), u('Kurzhantel-Sprungkniebeuge')] },
        { id: 'H1b', titel: 'Kniebeuge schwer', gruppe: 'beine', pause: '3 min', std: 'Kniebeuge', optionen: [u('Pistol Squat'), u('Kniebeuge'), u('Front-Kniebeuge'), u('Hackenschmidt-Kniebeuge')] },
        { id: 'H1c', titel: 'Kreuzheben', gruppe: 'beine', pause: '3 min', std: neu.kreuzheben.name, optionen: [u('Einbeiniges Kreuzheben'), neu.kreuzheben, u('Trap-Bar-Kreuzheben'), u('Rumänisches Kreuzheben')] },
        { id: 'H1d', titel: 'Einbeinig', gruppe: 'beine', pause: '2 min', std: 'Bulgarische Split-Kniebeuge', auf: { 'Skater Squat': 'Shrimp Squat' }, optionen: [u('Skater Squat'), u('Shrimp Squat'), u('Bulgarische Split-Kniebeuge')] },
        { id: 'H1e', titel: 'Beinbeuger', gruppe: 'beine', pause: '2 min', std: 'Nordic Curls', auf: { 'Gleit-Beinbeuger': 'Nordic Curls' }, optionen: [u('Gleit-Beinbeuger'), u('Nordic Curls'), u('Glute-Ham Raise'), u('Beinbeuger liegend')] },
        { id: 'H1f', titel: 'Waden', gruppe: 'beine', pause: '90 s', std: 'Wadenheben stehend', optional: true, optionen: [u('Einbeiniges Wadenheben'), u('Seilspringen'), u('Wadenheben stehend')] },
      ],
    },
    {
      id: 'H2', modus: 'high', name: 'Ganzkörper Kraft', kurz: 'Ganzkörper', dauer: '~75 min',
      hinweis: 'Die großen Übungen aus deinem Wochenplan noch einmal, mit derselben Stufe. Sätze hier zählen auch für die Progression im Wochenplan.',
      aufwaermen: '5 min locker, Arme kreisen, je 1 leichter Satz Klimmzüge und Dips.',
      slots: [
        { id: 'H2a', titel: 'Vertikal ziehen', wie: 'B3' },
        { id: 'H2b', titel: 'Dips', wie: 'A3' },
        { id: 'H2c', titel: 'Rudern', wie: 'B4' },
        { id: 'H2d', titel: 'Schulterdrücken', wie: 'A4' },
        { id: 'H2e', titel: 'Hüfte & hintere Kette', wie: 'C2' },
        { id: 'H2f', titel: 'Tragen', gruppe: 'core', pause: '90 s', std: neu.farmer.name, optionen: [neu.farmer, u('Einseitiges Tragen'), u('Schlittenschieben')] },
      ],
    },
    {
      id: 'H3', modus: 'high', name: 'Skill-Tag', kurz: 'Skills', dauer: '~60 min',
      hinweis: 'Mehr Übungszeit für Planche und Front Lever, ausgeruht und am Anfang der Einheit. Höchstens einmal pro Woche und mit einem Tag Abstand zu A und B.',
      aufwaermen: 'Handgelenke 3 min, 2 × 10 Scap-Push-ups und Scap-Pull-ups, Handstand gegen die Wand 2 × 20 s.',
      slots: [
        { id: 'H3a', titel: 'Handstand', gruppe: 'push', pause: '90 s', std: 'Handstand an der Wand', auf: { 'Handstand an der Wand': neu.freierHs.name }, optionen: [u('Handstand an der Wand'), neu.freierHs] },
        { id: 'H3b', titel: 'Planche-Halte', wie: 'A1' },
        { id: 'H3c', titel: 'Front-Lever-Halte', wie: 'B1' },
        { id: 'H3d', titel: 'Planche-Drücken', wie: 'A2' },
        { id: 'H3e', titel: 'Front-Lever-Kraft', wie: 'B2' },
        { id: 'H3f', titel: 'Kompression', wie: 'A6' },
      ],
    },
  ];

  /* Gespiegelte Plätze übernehmen Übungen und Leiter aus dem Wochenplan */
  const slots = {};
  for (const w of window.WORKOUTS) for (const s of w.slots) slots[s.id] = s;
  for (const w of window.EXTRAS) for (const s of w.slots) if (s.wie) {
    const m = slots[s.wie];
    if (!m) throw new Error('Platz fehlt: ' + s.wie);
    Object.assign(s, { gruppe: m.gruppe, pause: m.pause, std: m.std, optionen: m.optionen, auf: m.auf });
  }
})();
