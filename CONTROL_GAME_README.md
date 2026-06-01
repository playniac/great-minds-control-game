# Tetris Control Game — Prolific Study

A Tetris game deployed for the Great Minds/Monster Mutator Prolific user study. This is a **non-educational control game** used to measure the isolated effect of Monster Mutator's educational content on math learning outcomes.

## Quick Start

### Local Development
```bash
cd /path/to/control-game
# Open index.html in a browser, or use a local server:
python -m http.server 8000
# Then visit http://localhost:8000
```

### Test Links (for development)
- **10-second test session**: `index.html?duration=10&prolific_url=http://localhost:8000&PROLIFIC_PID=test123`
- **60-second test session**: `index.html?duration=60&prolific_url=http://localhost:8000&PROLIFIC_PID=test123`
- **45-minute full session**: `index.html?duration=2700&prolific_url=http://localhost:8000&PROLIFIC_PID=test123`

## Study Integration

### Prolific Study URL Format

The game is configured to accept Prolific's URL parameters and automatically redirect to the study completion URL after 45 minutes of play:

```
https://control-game.vercel.app/?PROLIFIC_PID={{%PROLIFIC_PID%}}&STUDY_ID={{%STUDY_ID%}}&SESSION_ID={{%SESSION_ID%}}&prolific_url=https://app.prolific.com/submissions/complete?cc=XXXXXX&duration=2700
```

**Note:** Prolific automatically substitutes the placeholders (e.g., `{{%PROLIFIC_PID%}}`).

### Query Parameters

| Parameter | Example | Required | Description |
|-----------|---------|----------|-------------|
| `prolific_url` | `https://app.prolific.com/submissions/complete?cc=XXXXXX` | Yes | The URL to redirect to when the session completes. Must be URL-encoded if it contains query params. |
| `duration` | `2700` | No | Session duration in seconds. Default: 2700 (45 minutes). |
| `PROLIFIC_PID` | `abc123def456` | No | Prolific participant ID (passed by Prolific, appended to redirect). |
| `STUDY_ID` | `study123` | No | Prolific study ID (passed by Prolific, appended to redirect). |
| `SESSION_ID` | `session456` | No | Prolific session ID (passed by Prolific, appended to redirect). |

### Session Flow

1. **Load**: Player loads the game page (Prolific's player passes IDs via URL params).
2. **Play**: Countdown timer displays in the top-right corner. Player plays Tetris freely.
3. **Timer expires**: After 45 minutes, a "Session complete!" overlay appears and fades.
4. **Redirect**: Browser is redirected to the Prolific completion URL with all session IDs preserved.

## Features

- **Tetris Game**: Classic NES-style Tetris with ghost piece, hard drop, and level progression.
- **Session Timer**: 45-minute countdown that runs regardless of game state. Survives game over/quit cycles.
- **Clean Shutdown**: On timer expiration, game is paused and a completion screen is shown before redirect.
- **Responsive**: Works on desktop and Chromebook (1366×596 viewport).
- **Prolific Integration**: Automatically captures and preserves participant IDs through redirect.

## Technical Details

### Files
- **index.html** — Main game page with Tetris canvas and controls.
- **classic-tetris.js** — Tetris game engine (from [llop/classic-tetris-js](https://github.com/llop/classic-tetris-js), MIT licensed).
- **session.js** — Session timer, countdown UI, and Prolific redirect logic.
- **vercel.json** — Minimal Vercel configuration (static site).

### How It Works

1. **session.js** runs after the page loads.
2. It reads the `?duration` and `?prolific_url` params.
3. A countdown timer is injected into the page and updates every 100ms.
4. When the timer reaches zero, the game is stopped and a completion overlay is shown.
5. After 2 seconds, the player is redirected to the Prolific URL.

## Deployment

### Deploy to Vercel

```bash
# If you haven't already, install Vercel CLI
npm i -g vercel

# Deploy from the repo root
vercel --prod
```

Vercel will auto-detect the static site and deploy it. No build step is required.

### Environment Variables
None required. All configuration comes from URL parameters.

## Customization

### Change Session Duration
Edit the default duration in `session.js` (line 7):
```javascript
const durationSeconds = parseInt(params.get('duration')) || 2700; // change 2700 to your duration
```

### Change Game Start Level
Edit the default level in `index.html` (line 73):
```html
<input id='level-input' name='level-input' type='number' min='0' max='19' value='5'></input>
<!-- change value='5' to your preferred level -->
```

### Styling
The countdown timer and completion overlay can be styled by editing the CSS in `session.js` (search for `cssText`).

## Debugging

### Check Session Duration
Open browser console (F12) and type:
```javascript
console.log(window.sessionTimer);
```

### Check Prolific Parameters
```javascript
const params = new URLSearchParams(window.location.search);
console.log({
  prolificUrl: params.get('prolific_url'),
  prolificPid: params.get('PROLIFIC_PID'),
  studyId: params.get('STUDY_ID'),
  sessionId: params.get('SESSION_ID'),
  duration: params.get('duration')
});
```

### Test Redirect
Load the game with a short duration (`?duration=5`) to quickly test the redirect flow.

## License

- **Tetris Game**: MIT (from [llop/classic-tetris-js](https://github.com/llop/classic-tetris-js))
- **Control Game Wrapper**: MIT

## Support

If you need to update the Prolific study URL or change game parameters, edit this README and the deployment files, then redeploy with `vercel --prod`.

---

**Study Details**
- **Purpose**: Control condition for Monster Mutator educational efficacy study
- **Duration**: ~45 minutes per player
- **Target Players**: 50 players on Prolific
- **Comparison**: Against 50 players in the Monster Mutator condition
