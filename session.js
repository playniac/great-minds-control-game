// Prolific session timer for control game
(function() {
  // Parse URL parameters (only Prolific IDs come from URL)
  const params = new URLSearchParams(window.location.search);
  const prolificPid = params.get('PROLIFIC_PID');
  const studyId = params.get('STUDY_ID');
  const sessionId = params.get('SESSION_ID');

  // Get Prolific URL and duration from config.js (or fallback to URL params for testing)
  // window.CONFIG should be set by config.js
  const durationSeconds = (window.CONFIG && window.CONFIG.sessionDuration) ||
                          parseInt(params.get('duration')) ||
                          2700; // default 45 minutes
  const prolificUrl = (window.CONFIG && window.CONFIG.prolificUrl) ||
                      params.get('prolific_url');

  let gameInstance = null;
  let sessionEnded = false;

  // Wait for the game to load, then inject our timer
  window.addEventListener('load', () => {
    initSessionTimer();
  });

  function initSessionTimer() {
    const startTime = Date.now();
    const endTime = startTime + durationSeconds * 1000;

    // Create countdown display
    const countdownElement = createCountdownDisplay();
    document.body.appendChild(countdownElement);

    // Update countdown every second
    const updateInterval = setInterval(() => {
      const now = Date.now();
      const remainingMs = Math.max(0, endTime - now);
      const remainingSeconds = Math.floor(remainingMs / 1000);

      updateCountdownDisplay(countdownElement, remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(updateInterval);
        endSession();
      }
    }, 100); // Update 10x per second for smooth countdown

    // Store reference for cleanup
    window.sessionTimer = {
      interval: updateInterval,
      startTime,
      endTime
    };
  }

  function createCountdownDisplay() {
    const container = document.createElement('div');
    container.id = 'session-timer-container';
    container.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      padding: 10px 15px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 16px;
      font-weight: bold;
      z-index: 9999;
      border: 2px solid #4CAF50;
      min-width: 140px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `;

    const label = document.createElement('div');
    label.style.cssText = `
      font-size: 11px;
      color: #aaa;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
    `;
    label.textContent = 'Time Remaining';

    const timer = document.createElement('div');
    timer.id = 'session-timer';
    timer.style.cssText = `
      font-size: 20px;
      color: #4CAF50;
    `;
    timer.textContent = '45:00';

    container.appendChild(label);
    container.appendChild(timer);

    return container;
  }

  function updateCountdownDisplay(element, seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const display = `${minutes}:${String(secs).padStart(2, '0')}`;

    const timerElement = document.getElementById('session-timer');
    if (timerElement) {
      timerElement.textContent = display;

      // Change color as time runs out
      if (seconds <= 60) {
        timerElement.style.color = '#ff6b6b'; // red
      } else if (seconds <= 300) {
        timerElement.style.color = '#ffa500'; // orange
      }
    }
  }

  function endSession() {
    if (sessionEnded) return;
    sessionEnded = true;

    // Clear the game loop if it exists
    if (window.tetris && window.tetris.gameLoop) {
      window.tetris.gameLoop = false;
    }

    // Show completion screen
    showCompletionScreen();

    // Log completion
    logCompletion();
  }

  function showCompletionScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'session-completion-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-in;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      text-align: center;
      color: #fff;
      font-family: Arial, sans-serif;
    `;

    const heading = document.createElement('h1');
    heading.style.cssText = `
      font-size: 48px;
      margin-bottom: 20px;
      color: #4CAF50;
    `;
    heading.textContent = 'Great job!';

    const message = document.createElement('p');
    message.style.cssText = `
      font-size: 24px;
      margin-bottom: 30px;
      color: #ddd;
    `;
    message.textContent = 'You\'ve completed the gaming session.';

    const redirecting = document.createElement('p');
    redirecting.style.cssText = `
      font-size: 16px;
      color: #999;
      margin-top: 20px;
    `;
    redirecting.textContent = 'Redirecting you now...';

    content.appendChild(heading);
    content.appendChild(message);
    content.appendChild(redirecting);
    overlay.appendChild(content);

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(overlay);

    // Redirect after a brief delay
    setTimeout(() => {
      redirectToProlific();
    }, 2000);
  }

  function logCompletion() {
    // Optional: log completion event for debugging
    const logData = {
      timestamp: new Date().toISOString(),
      prolificPid,
      studyId,
      sessionId,
      completed: true
    };

    // Can be used for debugging or analytics
    console.log('Session completed:', logData);

    // Optionally send to a logging endpoint
    if (window.fetch) {
      fetch('/api/session-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      }).catch(() => {
        // Silently fail - endpoint may not exist
      });
    }
  }

  function redirectToProlific() {
    if (!prolificUrl) {
      console.error('No Prolific URL provided');
      return;
    }

    // Append Prolific identifiers if provided
    let finalUrl = prolificUrl;
    const params = new URLSearchParams();

    if (prolificPid) params.append('PROLIFIC_PID', prolificPid);
    if (studyId) params.append('STUDY_ID', studyId);
    if (sessionId) params.append('SESSION_ID', sessionId);

    // Only add params if they don't already exist in the URL
    const separator = finalUrl.includes('?') ? '&' : '?';
    if (params.toString()) {
      finalUrl += separator + params.toString();
    }

    window.location.href = finalUrl;
  }
})();
