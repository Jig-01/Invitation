/* ==========================================================================
   Page Pre-loader Dismissal
   ========================================================================== */
function initPreloader() {
    const loader = document.getElementById('loader');
    
    // We wait 2 seconds so guests can appreciate the self-drawing gold monogram animation
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (loader) {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                
                // Triggers hero entrance slide-ups & reveals
                document.body.classList.add('loader-finished');
                
                // Completely remove from DOM after fade-out transition finishes
                setTimeout(() => {
                    loader.remove();
                }, 800);
            }
        }, 2200);
    });
}

/* ==========================================================================
   Countdown Timer with Tick Animations
   ========================================================================== */
function initCountdown() {
    const targetDate = new Date('December 20, 2026 18:30:00').getTime();
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    let lastVals = { days: '', hours: '', minutes: '', seconds: '' };
    
    function triggerTick(element) {
        const parent = element.parentElement;
        parent.classList.add('tick');
        setTimeout(() => {
            parent.classList.remove('tick');
        }, 300);
    }
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference < 0) {
            document.getElementById('countdown').innerHTML = "<div class='countdown-passed'>The celebration has begun!</div>";
            clearInterval(timerInterval);
            return;
        }
        
        const days = String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, '0');
        const hours = String(Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const seconds = String(Math.floor((difference % (1000 * 60)) / 1000)).padStart(2, '0');
        
        // Check changes and animate only elements that tick/change
        if (days !== lastVals.days) {
            daysEl.textContent = days;
            if (lastVals.days !== '') triggerTick(daysEl);
            lastVals.days = days;
        }
        if (hours !== lastVals.hours) {
            hoursEl.textContent = hours;
            if (lastVals.hours !== '') triggerTick(hoursEl);
            lastVals.hours = hours;
        }
        if (minutes !== lastVals.minutes) {
            minutesEl.textContent = minutes;
            if (lastVals.minutes !== '') triggerTick(minutesEl);
            lastVals.minutes = minutes;
        }
        if (seconds !== lastVals.seconds) {
            secondsEl.textContent = seconds;
            if (lastVals.seconds !== '') triggerTick(secondsEl);
            lastVals.seconds = seconds;
        }
    }
    
    updateCountdown();
    const timerInterval = setInterval(updateCountdown, 1000);
}

/* ==========================================================================
   Scroll Progress & Reveal Animations
   ========================================================================== */
function initScrollEffects() {
    const scrollProgressBar = document.getElementById('scroll-progress');
    
    window.addEventListener('scroll', () => {
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (totalScroll > 0) {
            const scrollPercentage = (window.scrollY / totalScroll) * 100;
            scrollProgressBar.style.width = `${scrollPercentage}%`;
        }
    });

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   Falling Flower Petals Generation
   ========================================================================== */
function initFlowerPetals() {
    const container = document.createElement('div');
    container.className = 'petals-container';
    document.body.appendChild(container);

    const petalCount = 20;
    
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        
        const size = Math.random() * 10 + 8;
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 12 + 10;
        const rotate = Math.random() * 360;
        
        petal.style.width = `${size}px`;
        petal.style.height = `${size * 1.25}px`;
        petal.style.left = `${left}%`;
        petal.style.animationDelay = `${delay}s`;
        petal.style.animationDuration = `${duration}s`;
        petal.style.transform = `rotate(${rotate}deg)`;
        
        const opacityVal = (Math.random() * 0.3 + 0.45).toFixed(2);
        petal.style.background = `linear-gradient(135deg, rgba(255, 218, 218, ${opacityVal}) 0%, rgba(255, 163, 177, ${opacityVal}) 100%)`;
        
        container.appendChild(petal);
    }
}

/* ==========================================================================
   Generative Web Audio API Ambient Synthesizer
   ========================================================================== */
let audioCtx = null;
let masterGain = null;
let isPlaying = false;
let ambientTimer = null;

const chords = [
    [130.81, 164.81, 196.00, 246.94, 261.63], // C3, E3, G3, B3, C4
    [98.00, 146.83, 196.00, 246.94, 293.66],  // G2, D3, G3, B3, D4
    [110.00, 146.83, 164.81, 220.00, 261.63], // A2, D3, E3, A3, C4
    [87.31, 130.81, 174.61, 220.00, 261.63]   // F2, C3, F3, A3, C4
];

let currentChordIndex = 0;
let noteTick = 0;

function initAudio() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.06, audioCtx.currentTime);

        const delay = audioCtx.createDelay(1.2);
        delay.delayTime.value = 0.9;

        const delayFeedback = audioCtx.createGain();
        delayFeedback.gain.value = 0.4;

        // Connections
        delay.connect(delayFeedback);
        delayFeedback.connect(delay);
        
        masterGain.connect(audioCtx.destination);
        delay.connect(masterGain);
    } catch (e) {
        console.error("Web Audio API not supported", e);
    }
}

function triggerPianoSynth(frequency) {
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    const now = audioCtx.currentTime;
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    osc.connect(oscGain);
    oscGain.connect(masterGain);
    
    const delaySend = audioCtx.createGain();
    delaySend.gain.value = 0.35;
    oscGain.connect(delaySend);

    osc.start(now);
    osc.stop(now + 3.3);
}

function playAmbientMusicLoop() {
    if (!isPlaying) return;

    if (noteTick % 6 === 0) {
        currentChordIndex = (currentChordIndex + 1) % chords.length;
    }
    noteTick++;

    const currentChord = chords[currentChordIndex];
    const numNotes = Math.random() > 0.75 ? 2 : 1;
    
    for (let i = 0; i < numNotes; i++) {
        const noteFreq = currentChord[Math.floor(Math.random() * currentChord.length)];
        const microDetune = (Math.random() - 0.5) * 1.2; 
        triggerPianoSynth(noteFreq + microDetune);
    }

    const nextBeatDelay = 1600 + Math.random() * 1400;
    ambientTimer = setTimeout(playAmbientMusicLoop, nextBeatDelay);
}

function toggleAudio() {
    const audioControl = document.getElementById('audio-control');
    const equalizer = document.getElementById('equalizer');
    const audioText = audioControl.querySelector('.audio-text');

    if (!audioCtx) {
        initAudio();
    }

    if (!isPlaying) {
        isPlaying = true;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        equalizer.classList.add('playing');
        audioControl.classList.add('playing-active');
        audioText.textContent = "Mute";
        playAmbientMusicLoop();
    } else {
        isPlaying = false;
        equalizer.classList.remove('playing');
        audioControl.classList.remove('playing-active');
        audioText.textContent = "Play Music";
        if (ambientTimer) {
            clearTimeout(ambientTimer);
        }
    }
}

function initAudioToggler() {
    const audioControl = document.getElementById('audio-control');
    audioControl.addEventListener('click', toggleAudio);
    
    audioControl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleAudio();
        }
    });
}

/* ==========================================================================
   Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initCountdown();
    initScrollEffects();
    initFlowerPetals();
    initAudioToggler();
});
