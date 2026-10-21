# Friends Monopoly – so kommst du schnell online

## Am einfachsten: kostenlos bei Render (einmalig ca. 5 Minuten, kein Programmieren)
1. **GitHub-Konto** anlegen (falls noch keins): https://github.com/signup
2. **Neues Repository** erstellen: https://github.com/new
   - Name: `friends-monopoly`, **Public** auswählen, "Create repository".
3. Auf der neuen Seite **„uploading an existing file“** klicken und **alle entpackten Dateien und den Ordner `public`** hineinziehen → „Commit changes“.
4. **Render-Konto** (mit GitHub anmelden): https://dashboard.render.com/register
5. Dort **New → Blueprint** → dein Repo `friends-monopoly` wählen → **Apply**.
   (Alternativ ein Klick: `https://render.com/deploy?repo=https://github.com/DEIN-NAME/friends-monopoly`)
6. Nach 2–4 Minuten bekommst du eine Adresse wie `https://friends-monopoly-xxxx.onrender.com`.
   **Diese Adresse öffnest du, gibst einen Namen ein und schickst den Link aus der Lobby an deine Freunde.**

Hinweise: Die kostenlose Version „schläft“ nach 15 Min. ohne Besucher, der erste Aufruf dauert dann ca. 1 Minute.
Spielstände werden in `rooms.json` gespeichert, gehen bei Render-Neustart aber verloren (kostenloser Speicher ist flüchtig).

## Auf dem eigenen Rechner (nur mit Node.js ≥ 18)
```
npm install
npm start
```
Dann http://localhost:3000 öffnen. Tests: `npm test` (Bot-Partie), `npm run test:ui` (Client-Test).

## Funktionen
Echtzeit-Multiplayer (2–4), Lobby-Regeln (Startgeld, doppeltes LOS-Geld, Jackpot, schnelle Variante, Auktionen mit Regler,
Charakter-Fähigkeiten, Episoden-Events, Würfelbeutel), Handel, „We were on a break!“, Hypotheken, Hausverkauf,
Hochzeit, Friends-Quiz- und Wahlkarten, Wiedereinstieg nach Verbindungsabbruch, Überspringen von Offline-Spielern.
