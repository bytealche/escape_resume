// Global Variables
let timeRemaining = 240; // 4 minutes total for all levels
let hintsUsed = 0;
let totalStartTime = Date.now();
let timerInterval = null;

// Generate animated stars background
function generateStars() {
  const container = document.getElementById('stars');
  if (!container) return;

  for (let i = 0; i < 200; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    container.appendChild(star);
  }
}

// Timer Functions
function startTimer() {
  // Load remaining time from localStorage if continuing between levels
  if(localStorage.getItem('remainingTime')) {
    timeRemaining = parseInt(localStorage.getItem('remainingTime'));
  }

  updateTimerDisplay();

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    // Save remaining time so it persists across levels
    localStorage.setItem('remainingTime', timeRemaining);

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      localStorage.removeItem('remainingTime');
      handleTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerElement = document.getElementById('timer');
  if (!timerElement) return;

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  timerElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

  if (timeRemaining <= 60) {
    timerElement.style.color = '#ff4757';
    timerElement.style.borderColor = 'rgba(255, 71, 87, 0.5)';
  } else if (timeRemaining <= 120) {
    timerElement.style.color = '#ffa502';
    timerElement.style.borderColor = 'rgba(255, 165, 2, 0.5)';
  } else {
    timerElement.style.color = '#ffffff';
    timerElement.style.borderColor = 'rgba(255, 255, 255, 0.1)';
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function handleTimeout() {
  alert('⏰ Time\'s up! Game over.');
  window.location.href = '/'; // redirect to home or results page
}

// Hint System
function useHint(hintText) {
  hintsUsed++;
  timeRemaining = Math.max(0, timeRemaining - 5); // Deduct 5 seconds per hint
  updateTimerDisplay();

  alert('💡 Hint:\n\n' + hintText + '\n\n⚠️ 5 seconds deducted from your timer!');
}

// Progress Tracking
function saveProgress(level) {
  const progress = {
    level: level,
    timestamp: Date.now(),
    hintsUsed: hintsUsed
  };
  console.log('Progress saved:', progress);
}

// Score Calculation
function calculateScore() {
  const baseScore = 1400;
  const timePenalty = Math.max(0, 240 - parseInt(localStorage.getItem('remainingTime') || 240)) * 0.5;
  const hintPenalty = hintsUsed * 5;
  const finalScore = Math.round(baseScore - hintPenalty - timePenalty);
  return Math.max(0, Math.min(1400, finalScore));
}

// Get Total Time Spent
function getTotalTime() {
  const totalSeconds = 240 - (parseInt(localStorage.getItem('remainingTime') || 240));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Utility Functions
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Sound Effects (Optional)
function playSound(type) {
  console.log('Sound:', type);
}

// Celebration Animation
function celebrate() {
  const colors = ['#667eea', '#764ba2', '#00f2fe', '#ffd700'];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      document.body.appendChild(confetti);

      const fallDuration = 2000 + Math.random() * 2000;
      confetti.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${window.innerHeight}px) rotate(${360 * Math.random()}deg)`, opacity: 0 }
      ], {
        duration: fallDuration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });

      setTimeout(() => confetti.remove(), fallDuration);
    }, i * 50);
  }
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
    const submitBtn = document.querySelector('.action-btn');
    if (submitBtn && submitBtn.onclick) submitBtn.click();
  }

  if (e.key === 'Escape') {
    const backLink = document.querySelector('.back-link');
    if (backLink) backLink.click();
  }
});

// Input Validation Helpers
function validateInput(input, type) {
  switch(type) {
    case 'text': return input.trim().length > 0;
    case 'number': return !isNaN(input) && input !== '';
    default: return true;
  }
}

// Visual Feedback
function showFeedback(element, type) {
  const originalBg = element.style.background;

  if (type === 'success') {
    element.style.background = 'rgba(72, 187, 120, 0.2)';
    element.style.borderColor = '#48bb78';
  } else {
    element.style.background = 'rgba(245, 101, 101, 0.2)';
    element.style.borderColor = '#f56565';
  }

  setTimeout(() => {
    element.style.background = originalBg;
    element.style.borderColor = 'rgba(255, 255, 255, 0.1)';
  }, 1000);
}

// Auto-save feature
function autoSave() {
  const gameState = {
    timeRemaining: timeRemaining,
    hintsUsed: hintsUsed,
    startTime: totalStartTime
  };
  console.log('Auto-saved:', gameState);
}

// Set up auto-save every 30 seconds
setInterval(autoSave, 30000);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Escape My Resume - Game Initialized');
  generateStars();
  startTimer();
  document.documentElement.style.scrollBehavior = 'smooth';

  
});

// Export functions for use in HTML pages
window.generateStars = generateStars;
window.startTimer = startTimer;
window.stopTimer = stopTimer;
window.useHint = useHint;
window.saveProgress = saveProgress;
window.calculateScore = calculateScore;
window.getTotalTime = getTotalTime;
window.celebrate = celebrate;
window.showFeedback = showFeedback;
