# Prolific Deployment Guide

## Quick Setup for a New Prolific Study

### Step 1: Get Your Prolific Completion Code

1. In your Prolific study settings, find your **completion code** (format: `abc123def...`)
2. It will be shown in the study's "Completion URL" section

### Step 2: Update config.js

Edit `config.js` and replace the placeholder with your completion code:

```javascript
window.CONFIG = {
  // Replace 'REPLACE_WITH_COMPLETION_CODE' with your actual completion code
  prolificUrl: 'https://app.prolific.com/submissions/complete?cc=abc123def456',

  // Session duration in seconds (2700 = 45 minutes)
  sessionDuration: 2700,
};
```

**Example:**
```javascript
window.CONFIG = {
  prolificUrl: 'https://app.prolific.com/submissions/complete?cc=6789abcdef012345',
  sessionDuration: 2700,
};
```

### Step 3: Deploy to Vercel

```bash
git add config.js
git commit -m "Configure for Prolific study XYZ"
vercel deploy --prod
```

### Step 4: Add Study Link to Prolific

Use this URL in your Prolific study settings:

```
https://gm-control.vercel.app/?PROLIFIC_PID={{%PROLIFIC_PID%}}&STUDY_ID={{%STUDY_ID%}}&SESSION_ID={{%SESSION_ID%}}
```

Prolific will automatically substitute the placeholders with each participant's IDs, and the app will redirect them to your completion URL when the 45-minute session ends.

## How It Works

### URL Parameters (from Prolific)
- `PROLIFIC_PID` — Participant ID
- `STUDY_ID` — Study ID
- `SESSION_ID` — Session ID

These are passed by Prolific and automatically appended to the completion redirect.

### Configuration (from config.js)
- `prolificUrl` — Your Prolific completion URL (with completion code)
- `sessionDuration` — Session length in seconds

These are set in `config.js` and do NOT come from the URL (no URL encoding needed).

## Testing Before Launch

### Local Testing

Edit `config.js` with test values:
```javascript
window.CONFIG = {
  prolificUrl: 'http://localhost:8000/test-complete',
  sessionDuration: 10, // 10 seconds for quick testing
};
```

Then start a test server:
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

The 10-second countdown will expire and redirect to `http://localhost:8000/test-complete?PROLIFIC_PID=test123...`

### Test on Vercel

After deploying with a short duration (e.g., `sessionDuration: 30`), test with:
```
https://gm-control.vercel.app/?PROLIFIC_PID=test123&STUDY_ID=test456&SESSION_ID=test789
```

Wait 30 seconds and verify the redirect fires.

## Changing Duration

If you want a different session length, edit `config.js`:

```javascript
sessionDuration: 1800,  // 30 minutes instead of 45
```

Then redeploy.

## Troubleshooting

### Session doesn't redirect after time expires
- Check browser console (F12) for errors
- Verify `config.js` is loaded: `console.log(window.CONFIG)`
- Verify `prolificUrl` is correct and properly formatted

### Wrong completion code
- Session will redirect to the wrong URL
- Check your Prolific study settings for the correct completion code
- Update `config.js` and redeploy

### Duration too short or too long
- Adjust `sessionDuration` in `config.js` (in seconds)
- Remember: 2700 seconds = 45 minutes, 1800 = 30 minutes

## Multiple Studies

If you need to run multiple Prolific studies with this control game:

**Option 1: Fork the repo**
- Create a new fork for each study
- Update `config.js` per study
- Deploy each fork to a different Vercel project
- Use different study URLs for each Prolific study

**Option 2: Update config.js per study**
- Use the same repo and Vercel project
- Update `config.js` with new completion code for each study
- Redeploy before each new study launches
- ⚠️ This means all participants for a study must use the same completion code

**Recommended: Option 1** (separate forks) to avoid accidentally using the wrong completion code.

## Reverting to URL Parameters (Testing Only)

If you need to use URL parameters instead of `config.js` (useful for quick testing):

```
https://gm-control.vercel.app/?duration=60&prolific_url=http://localhost:8000/done&PROLIFIC_PID=test123
```

The app will use URL params as fallback if `config.js` values aren't available. For production, always use `config.js`.
