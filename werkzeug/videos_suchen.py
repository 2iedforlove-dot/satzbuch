"""Sucht zu jeder Übung aus plan.js kurze YouTube-Videos (unter 4 Minuten) und schreibt videos.js.

Es wird nichts heruntergeladen: die App bettet die Videos über youtube-nocookie.com ein.
Aufruf:  python werkzeug/videos_suchen.py            (nur fehlende Übungen)
         python werkzeug/videos_suchen.py --neu      (alle neu suchen)
Feste Wahl pro Übung: in werkzeug/videos_fest.json  {"Übungsname": "videoId"}
"""
import json, re, subprocess, sys, time, urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLAN = ROOT / 'plan.js'
OUT = ROOT / 'videos.js'
FEST = ROOT / 'werkzeug' / 'videos_fest.json'
ROH = ROOT / 'werkzeug' / 'videos_kandidaten.json'
PRUEF = ROOT / 'werkzeug' / 'videos_einbettbar.json'

def uebungen():
    """Name und Suchbegriff aller Übungen aus plan.js (per Node ausgewertet)."""
    js = ("global.window={};require(process.argv[1]);require(process.argv[2]);const m={};"
          "for(const w of [...window.WORKOUTS,...window.EXTRAS])for(const s of w.slots)for(const o of s.optionen)m[o.name]=o.yt;"
          "console.log(JSON.stringify(m))")
    return json.loads(subprocess.check_output(['node', '-e', js, str(PLAN), str(ROOT / 'extras.js')], text=True, encoding='utf-8'))

def sekunden(text):
    teile = [int(x) for x in text.split(':')]
    s = 0
    for t in teile: s = s * 60 + t
    return s

def suche(begriff):
    url = 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(begriff) + '&sp=EgIYAQ%253D%253D'
    html = subprocess.check_output(['curl', '-s', '-A', 'Mozilla/5.0', '-H', 'Accept-Language: en', url], encoding='utf-8', errors='replace')
    m = re.search(r'var ytInitialData = (\{.*?\});</script>', html, re.S)
    if not m: return []
    daten = json.loads(m.group(1))
    treffer = []
    def lauf(x):
        if isinstance(x, dict):
            if 'videoRenderer' in x:
                v = x['videoRenderer']
                laenge = v.get('lengthText', {}).get('simpleText')
                if laenge:
                    treffer.append({
                        'id': v['videoId'],
                        'titel': ''.join(r.get('text', '') for r in v.get('title', {}).get('runs', [])),
                        'kanal': ''.join(r.get('text', '') for r in v.get('ownerText', {}).get('runs', [])),
                        'dauer': sekunden(laenge),
                    })
            for w in x.values(): lauf(w)
        elif isinstance(x, list):
            for w in x: lauf(w)
    lauf(daten)
    return treffer

def wertung(t, begriff):
    """Kurze, passende Videos bevorzugen. Wörter aus dem Suchbegriff im Titel zählen."""
    woerter = [w for w in re.findall(r'[a-z]+', begriff.lower()) if w not in ('form', 'tutorial', 'technique', 'proper', 'how', 'to')]
    titel = t['titel'].lower()
    treffer = sum(1 for w in woerter if w in titel)
    p = treffer * 10
    if 15 <= t['dauer'] <= 150: p += 8
    elif t['dauer'] <= 240: p += 3
    if t['dauer'] < 10: p -= 10
    return p

def main():
    neu = '--neu' in sys.argv
    liste = uebungen()
    fest = json.loads(FEST.read_text(encoding='utf-8')) if FEST.exists() else {}
    roh = json.loads(ROH.read_text(encoding='utf-8')) if ROH.exists() and not neu else {}
    for i, (name, begriff) in enumerate(liste.items(), 1):
        if name in roh and roh[name]: continue
        try:
            kand = suche(begriff)
        except Exception as e:
            print('Fehler', name, e); kand = []
        kand.sort(key=lambda t: -wertung(t, begriff))
        roh[name] = kand[:5]
        print(f'{i:3}/{len(liste)} {name}: {kand[0]["titel"][:60] if kand else "-- nichts --"}', flush=True)
        ROH.write_text(json.dumps(roh, ensure_ascii=False, indent=1), encoding='utf-8')
        time.sleep(1.2)
    # Nur Videos nehmen, die das Einbetten erlauben (oEmbed antwortet sonst mit 401/404)
    pruef = json.loads(PRUEF.read_text(encoding='utf-8')) if PRUEF.exists() else {}
    def einbettbar(vid):
        if vid not in pruef:
            code = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}',
                                   f'https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v={vid}'],
                                  capture_output=True, text=True).stdout.strip()
            pruef[vid] = code == '200'
            PRUEF.write_text(json.dumps(pruef, indent=1), encoding='utf-8')
        return pruef[vid]
    videos = {}
    for name in liste:
        kand = list(roh.get(name, []))
        if name in fest:
            k = next((t for t in kand if t['id'] == fest[name]), None) or {'id': fest[name], 'titel': '', 'kanal': '', 'dauer': 0}
            kand = [k] + [t for t in kand if t['id'] != fest[name]]
        wahl = next((t for t in kand if einbettbar(t['id'])), None)
        if wahl: videos[name] = wahl
        else: print('kein einbettbares Video:', name)
    OUT.write_text('/* Automatisch erzeugt von werkzeug/videos_suchen.py – eingebettete YouTube-Videos pro Übung. */\n'
                   'window.VIDEOS = ' + json.dumps(videos, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8')
    print('videos.js:', len(videos), 'von', len(liste), 'Übungen')

if __name__ == '__main__':
    main()
