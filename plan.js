/* Trainingsplan für Satzbuch.
   Wochentage: 0 = Sonntag … 6 = Samstag.
   Jede Übung: name, stufe (1 Einstieg · 2 Mittel · 3 Fortgeschritten), einheit ('reps' | 'sec'),
   bw (Körpergewicht, Gewichtsfeld = Zusatzgewicht), s × von–bis (Ziel), seite (pro Seite), yt (YouTube-Suche), tipp. */

window.WOCHE = {
  1: [{ art: 'tennis', name: 'Tennis', kurz: 'Tennis', zeit: '19–21 Uhr' }],
  2: [{ art: 'la', name: 'Leichtathletik', kurz: 'LA', zeit: '18–20 Uhr' }],
  4: [{ art: 'la', name: 'Leichtathletik', kurz: 'LA', zeit: '18–20 Uhr' }],
  6: [{ art: 'la', name: 'Leichtathletik', kurz: 'LA', zeit: '10–12 Uhr' }],
};

/* Tag C (Beine) lässt sich in der App zwischen Samstag und Sonntag umstellen. */
window.GYM_TAGE = { A: 3, B: 5, C: 6 };

window.WORKOUTS = [
  {
    id: 'A', name: 'Push · Planche', kurz: 'Push', dauer: '~60 min',
    hinweis: 'Zwischen zwei Leichtathletik-Tagen: nur Oberkörper, Beine bleiben frisch für Donnerstag.',
    aufwaermen: '5 min Handgelenke kreisen und dehnen, 2 × 10 Scap-Push-ups, 2 lockere Planche Leans.',
    slots: [
      { id: 'A1', titel: 'Planche-Halte', gruppe: 'push', pause: '2 min', optionen: [
        { name: 'Planche Lean', stufe: 1, einheit: 'sec', bw: true, s: 4, von: 10, bis: 20, yt: 'planche lean tutorial', tipp: 'Arme gestreckt, Schultern weit vor die Hände schieben, oberer Rücken rund.' },
        { name: 'Tuck Planche', stufe: 2, einheit: 'sec', bw: true, s: 4, von: 5, bis: 12, yt: 'tuck planche tutorial', tipp: 'Knie an die Brust, Hüfte auf Schulterhöhe, Arme durchgestreckt.' },
        { name: 'Advanced Tuck Planche', stufe: 3, einheit: 'sec', bw: true, s: 4, von: 5, bis: 12, yt: 'advanced tuck planche tutorial', tipp: 'Rücken flach, Knie unter der Hüfte. Erst wenn die Tuck Planche 15 s sitzt.' },
        { name: 'Straddle Planche mit Band', stufe: 3, einheit: 'sec', bw: true, s: 4, von: 5, bis: 10, yt: 'band assisted straddle planche', tipp: 'Band an der Stange, um die Hüfte. Mit dünnerem Band steigern.' },
      ]},
      { id: 'A2', titel: 'Planche-Kraft', gruppe: 'push', pause: '2 min', optionen: [
        { name: 'Pseudo-Planche-Liegestütze', stufe: 1, einheit: 'reps', bw: true, s: 4, von: 6, bis: 10, yt: 'pseudo planche push up tutorial', tipp: 'Hände auf Hüfthöhe, Finger nach außen gedreht, Schultern bleiben vor den Händen.' },
        { name: 'Pseudo-Planche-Liegestütze auf Parallettes', stufe: 2, einheit: 'reps', bw: true, s: 4, von: 6, bis: 10, yt: 'pseudo planche push ups parallettes', tipp: 'Tiefer runter als am Boden und mehr Vorlage. Schont die Handgelenke.' },
        { name: 'Tuck-Planche-Liegestütze', stufe: 3, einheit: 'reps', bw: true, s: 3, von: 3, bis: 6, yt: 'tuck planche push up tutorial', tipp: 'Aus der Tuck Planche langsam runter und wieder hoch, Füße bleiben in der Luft.' },
      ]},
      { id: 'A3', titel: 'Drücken', gruppe: 'push', pause: '2–3 min', optionen: [
        { name: 'Dips', stufe: 1, einheit: 'reps', bw: true, s: 3, von: 6, bis: 10, yt: 'dips proper form', tipp: 'Schultern unten, bis die Oberarme waagrecht sind. Ab 3 × 10 mit Zusatzgewicht.' },
        { name: 'Ring-Dips', stufe: 2, einheit: 'reps', bw: true, s: 3, von: 5, bis: 8, yt: 'ring dips tutorial', tipp: 'Ringe eng am Körper, oben die Hände nach außen drehen.' },
        { name: 'Kurzhantel-Schrägbankdrücken', stufe: 1, einheit: 'reps', s: 3, von: 6, bis: 10, yt: 'incline dumbbell press form', tipp: 'Bank auf ca. 30°, Schulterblätter zusammen, kontrolliert ablassen.' },
        { name: 'Bankdrücken', stufe: 1, einheit: 'reps', s: 3, von: 5, bis: 8, yt: 'bench press form', tipp: 'Füße fest am Boden, Stange zur unteren Brust.' },
      ]},
      { id: 'A4', titel: 'Schulter, gestreckter Arm', gruppe: 'push', pause: '90 s', optionen: [
        { name: 'Kabel-Frontheben', stufe: 1, einheit: 'reps', s: 3, von: 10, bis: 12, yt: 'cable front raise straight arm', tipp: 'Arm gestreckt bis Augenhöhe, langsam runter. Das ist die Planche-Schulter.' },
        { name: 'Kurzhantel-Frontheben', stufe: 1, einheit: 'reps', s: 3, von: 10, bis: 12, yt: 'dumbbell front raise form', tipp: 'Nicht schwingen, Arm bleibt gestreckt.' },
        { name: 'Serratus-Liegestütze', stufe: 1, einheit: 'reps', bw: true, s: 3, von: 12, bis: 15, yt: 'scapula push ups protraction', tipp: 'Arme bleiben gestreckt, nur die Schulterblätter auseinanderdrücken.' },
        { name: 'Überkopfdrücken', stufe: 1, einheit: 'reps', s: 3, von: 6, bis: 10, yt: 'overhead press form', tipp: 'Bauch fest, Stange nah am Gesicht vorbei nach oben.' },
      ]},
      { id: 'A5', titel: 'Core', gruppe: 'core', pause: '60 s', optionen: [
        { name: 'Hollow Body Hold', stufe: 1, einheit: 'sec', bw: true, s: 3, von: 20, bis: 40, yt: 'hollow body hold tutorial', tipp: 'Lendenwirbel in den Boden drücken, Arme und Beine lang.' },
        { name: 'L-Sit', stufe: 2, einheit: 'sec', bw: true, s: 3, von: 10, bis: 20, yt: 'l sit tutorial', tipp: 'Schultern runterdrücken, Beine gestreckt. Anfangs ein Bein angewinkelt.' },
        { name: 'Hängendes Beinheben', stufe: 2, einheit: 'reps', bw: true, s: 3, von: 8, bis: 12, yt: 'hanging leg raise form', tipp: 'Ohne Schwung, Beine bis mindestens waagrecht.' },
      ]},
    ],
  },
  {
    id: 'B', name: 'Pull · Front Lever', kurz: 'Pull', dauer: '~60 min',
    hinweis: 'Am Tag vor der Leichtathletik: Oberkörper hart, Beine schonen.',
    aufwaermen: 'Schulterkreisen, 2 × 10 Scap-Pull-ups am Hang, ein lockerer Tuck-Halt.',
    slots: [
      { id: 'B1', titel: 'Front-Lever-Halte', gruppe: 'pull', pause: '2 min', optionen: [
        { name: 'Tuck Front Lever', stufe: 1, einheit: 'sec', bw: true, s: 4, von: 8, bis: 15, yt: 'tuck front lever tutorial', tipp: 'Arme gestreckt, Schulterblätter nach unten ziehen, Rücken waagrecht.' },
        { name: 'Advanced Tuck Front Lever', stufe: 2, einheit: 'sec', bw: true, s: 4, von: 6, bis: 12, yt: 'advanced tuck front lever tutorial', tipp: 'Rücken ganz flach, Knie weg von der Brust.' },
        { name: 'Front Lever mit Band', stufe: 2, einheit: 'sec', bw: true, s: 4, von: 6, bis: 12, yt: 'band assisted front lever', tipp: 'Band an der Stange, um Hüfte oder Füße. Körper komplett gestreckt.' },
        { name: 'Ein-Bein Front Lever', stufe: 3, einheit: 'sec', bw: true, s: 4, von: 5, bis: 10, yt: 'one leg front lever tutorial', tipp: 'Ein Bein gestreckt, eins angewinkelt. Seiten abwechseln.' },
        { name: 'Straddle Front Lever', stufe: 3, einheit: 'sec', bw: true, s: 4, von: 4, bis: 10, yt: 'straddle front lever tutorial', tipp: 'Beine weit grätschen, Hüfte bleibt gestreckt.' },
      ]},
      { id: 'B2', titel: 'Front-Lever-Kraft', gruppe: 'pull', pause: '2 min', optionen: [
        { name: 'Tuck Front Lever Raises', stufe: 1, einheit: 'reps', bw: true, s: 4, von: 5, bis: 8, yt: 'tuck front lever raises', tipp: 'Aus dem Hang langsam in den Tuck heben, oben 1 s halten.' },
        { name: 'Front-Lever-Negativ', stufe: 2, einheit: 'reps', bw: true, s: 4, von: 3, bis: 5, yt: 'front lever negatives', tipp: 'Oben starten und in 5 Sekunden kontrolliert ablassen.' },
        { name: 'Ice Cream Makers', stufe: 2, einheit: 'reps', bw: true, s: 3, von: 4, bis: 6, yt: 'ice cream makers calisthenics', tipp: 'Klimmzug hoch, in die Waagrechte kippen und zurück.' },
        { name: 'Tuck-Front-Lever-Rudern', stufe: 3, einheit: 'reps', bw: true, s: 3, von: 5, bis: 8, yt: 'tuck front lever rows', tipp: 'Im Tuck Front Lever die Stange zur Hüfte ziehen.' },
      ]},
      { id: 'B3', titel: 'Vertikal ziehen', gruppe: 'pull', pause: '2–3 min', optionen: [
        { name: 'Klimmzüge', stufe: 1, einheit: 'reps', bw: true, s: 4, von: 5, bis: 8, yt: 'pull up proper form', tipp: 'Ganz aus dem Hang, Brust zur Stange. Ab 4 × 8 mit Zusatzgewicht.' },
        { name: 'Klimmzüge mit Band', stufe: 1, einheit: 'reps', bw: true, s: 4, von: 5, bis: 8, yt: 'band assisted pull ups', tipp: 'Band so wählen, dass die letzte Wiederholung schwer ist.' },
        { name: 'Latzug', stufe: 1, einheit: 'reps', s: 4, von: 6, bis: 10, yt: 'lat pulldown form', tipp: 'Stange zur oberen Brust, Ellbogen nach unten führen.' },
      ]},
      { id: 'B4', titel: 'Rudern', gruppe: 'pull', pause: '90 s', optionen: [
        { name: 'Kabelrudern', stufe: 1, einheit: 'reps', s: 3, von: 8, bis: 10, yt: 'seated cable row form', tipp: 'Brust raus, Ellbogen nah am Körper, Schulterblätter zusammen.' },
        { name: 'Kurzhantelrudern', stufe: 1, einheit: 'reps', s: 3, von: 8, bis: 10, yt: 'one arm dumbbell row form', tipp: 'Rücken gerade, Hantel zur Hüfte ziehen.', seite: true },
        { name: 'Ring-Rudern', stufe: 1, einheit: 'reps', bw: true, s: 3, von: 8, bis: 12, yt: 'ring rows tutorial', tipp: 'Körper wie ein Brett. Je flacher, desto schwerer.' },
      ]},
      { id: 'B5', titel: 'Lat, gestreckter Arm', gruppe: 'pull', pause: '90 s', optionen: [
        { name: 'Straight-Arm-Latzug', stufe: 1, einheit: 'reps', s: 3, von: 10, bis: 12, yt: 'straight arm lat pulldown', tipp: 'Arme fast gestreckt, Stange bis zu den Oberschenkeln. Das ist die Front-Lever-Bewegung.' },
        { name: 'Kurzhantel-Pullover', stufe: 1, einheit: 'reps', s: 3, von: 10, bis: 12, yt: 'dumbbell pullover form', tipp: 'Arme leicht gebeugt, weit hinter den Kopf und zurück.' },
      ]},
      { id: 'B6', titel: 'Core', gruppe: 'core', pause: '60 s', optionen: [
        { name: 'Dragon Flag Negativ', stufe: 2, einheit: 'reps', bw: true, s: 3, von: 3, bis: 5, yt: 'dragon flag negative tutorial', tipp: 'Schultern am Boden, Körper gerade und langsam ablassen.' },
        { name: 'Hängendes Beinheben', stufe: 2, einheit: 'reps', bw: true, s: 3, von: 8, bis: 12, yt: 'hanging leg raise form', tipp: 'Ohne Schwung, Beine bis mindestens waagrecht.' },
        { name: 'Ab Wheel', stufe: 1, einheit: 'reps', bw: true, s: 3, von: 6, bis: 10, yt: 'ab wheel rollout form', tipp: 'Bauch fest, kein Hohlkreuz. Erst auf den Knien.' },
      ]},
    ],
  },
  {
    id: 'C', name: 'Beine · Core', kurz: 'Beine', dauer: '~50 min',
    hinweis: 'Nach der Leichtathletik: mindestens 3 h Pause dazwischen, wenige schwere Sätze, nie bis zum Muskelversagen.',
    aufwaermen: '5 min Rad, Hüfte mobilisieren, 2 leichte Aufwärmsätze bei der ersten Übung.',
    slots: [
      { id: 'C1', titel: 'Kniebeuge', gruppe: 'beine', pause: '3 min', optionen: [
        { name: 'Kniebeuge', stufe: 2, einheit: 'reps', s: 3, von: 4, bis: 6, yt: 'barbell back squat form', tipp: 'Schwer, aber sauber. 2 Wiederholungen im Tank lassen.' },
        { name: 'Front-Kniebeuge', stufe: 2, einheit: 'reps', s: 3, von: 4, bis: 6, yt: 'front squat form', tipp: 'Ellbogen hoch, Oberkörper aufrecht.' },
        { name: 'Goblet-Kniebeuge', stufe: 1, einheit: 'reps', s: 3, von: 8, bis: 10, yt: 'goblet squat form', tipp: 'Kurzhantel vor der Brust, tief runter.' },
        { name: 'Beinpresse', stufe: 1, einheit: 'reps', s: 3, von: 6, bis: 10, yt: 'leg press form', tipp: 'Rücken bleibt am Polster, Knie nicht ganz durchdrücken.' },
      ]},
      { id: 'C2', titel: 'Hüfte & hintere Kette', gruppe: 'beine', pause: '2–3 min', optionen: [
        { name: 'Rumänisches Kreuzheben', stufe: 1, einheit: 'reps', s: 3, von: 5, bis: 8, yt: 'romanian deadlift form', tipp: 'Hüfte nach hinten schieben, Rücken gerade, Stange nah am Bein.' },
        { name: 'Trap-Bar-Kreuzheben', stufe: 2, einheit: 'reps', s: 3, von: 4, bis: 6, yt: 'trap bar deadlift form', tipp: 'Explosiv hoch. Gut für Sprinter.' },
        { name: 'Hip Thrust', stufe: 1, einheit: 'reps', s: 3, von: 6, bis: 10, yt: 'barbell hip thrust form', tipp: 'Oben 1 s halten, Kinn zur Brust.' },
      ]},
      { id: 'C3', titel: 'Einbeinig', gruppe: 'beine', pause: '90 s', optionen: [
        { name: 'Bulgarische Split-Kniebeuge', stufe: 1, einheit: 'reps', s: 3, von: 6, bis: 8, seite: true, yt: 'bulgarian split squat form', tipp: 'Hinterer Fuß auf der Bank, vorderes Knie über dem Fuß.' },
        { name: 'Step-ups', stufe: 1, einheit: 'reps', s: 3, von: 6, bis: 8, seite: true, yt: 'dumbbell step ups form', tipp: 'Nur mit dem oberen Bein hochdrücken, nicht abspringen.' },
        { name: 'Pistol Squat', stufe: 3, einheit: 'reps', bw: true, s: 3, von: 3, bis: 6, seite: true, yt: 'pistol squat progression', tipp: 'Die Calisthenics-Variante. Anfangs an einer Stange festhalten.' },
        { name: 'Ausfallschritte gehend', stufe: 1, einheit: 'reps', s: 3, von: 8, bis: 10, seite: true, yt: 'walking lunges form', tipp: 'Großer Schritt, hinteres Knie knapp über dem Boden.' },
      ]},
      { id: 'C4', titel: 'Beinbeuger', gruppe: 'beine', pause: '2 min', optionen: [
        { name: 'Nordic Curls', stufe: 2, einheit: 'reps', bw: true, s: 3, von: 3, bis: 6, yt: 'nordic hamstring curl progression', tipp: 'Schützt vor Zerrungen beim Sprinten. So langsam wie möglich ablassen.' },
        { name: 'Beinbeuger-Maschine', stufe: 1, einheit: 'reps', s: 3, von: 8, bis: 10, yt: 'lying leg curl form', tipp: 'Langsam zurück, Hüfte bleibt am Polster.' },
        { name: 'Glute-Ham Raise', stufe: 3, einheit: 'reps', bw: true, s: 3, von: 4, bis: 8, yt: 'glute ham raise form', tipp: 'Körper gerade von Knie bis Kopf.' },
      ]},
      { id: 'C5', titel: 'Waden & Füße', gruppe: 'beine', pause: '90 s', optionen: [
        { name: 'Wadenheben stehend', stufe: 1, einheit: 'reps', s: 3, von: 10, bis: 15, yt: 'standing calf raise form', tipp: 'Unten kurz dehnen, oben 1 s halten.' },
        { name: 'Einbeiniges Wadenheben', stufe: 1, einheit: 'reps', s: 3, von: 10, bis: 12, seite: true, yt: 'single leg calf raise', tipp: 'Auf einer Stufe, volle Bewegung.' },
        { name: 'Wadenheben sitzend', stufe: 1, einheit: 'reps', s: 3, von: 12, bis: 15, yt: 'seated calf raise form', tipp: 'Trifft den tiefen Wadenmuskel, wichtig für die Achillessehne.' },
      ]},
      { id: 'C6', titel: 'Kompression', gruppe: 'core', pause: '60–90 s', optionen: [
        { name: 'L-Sit', stufe: 2, einheit: 'sec', bw: true, s: 3, von: 10, bis: 20, yt: 'l sit tutorial', tipp: 'Schultern runterdrücken, Beine gestreckt. Anfangs ein Bein angewinkelt.' },
        { name: 'Pike-Kompression', stufe: 1, einheit: 'reps', bw: true, s: 3, von: 8, bis: 12, yt: 'pike compression lifts', tipp: 'Im Sitzen die gestreckten Beine anheben. Hilft bei L-Sit und Planche.' },
        { name: 'Hängendes Beinheben', stufe: 2, einheit: 'reps', bw: true, s: 3, von: 8, bis: 12, yt: 'hanging leg raise form', tipp: 'Ohne Schwung, Beine bis mindestens waagrecht.' },
      ]},
    ],
  },
];
