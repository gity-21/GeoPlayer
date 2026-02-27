class AudioManager {
    constructor() {
        this.ctx = null;
        this.ambienceGain = null;
        this.noiseSource = null;
        this.lfoSource = null;
        this.staticSource = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // 2. Tick-Tock sound pulsing like a heartbeat in the last 10 seconds
    playTickTock() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine'; // Sharp but smooth wave for a click sound

        // Frequency sweeps downward quickly to create a 'tick' sensation
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

        // Volume (Envelope)
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        // Filter for a full, punchy tone
        filter.type = 'bandpass';
        filter.frequency.value = 1000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // 3. Success Whoosh / Error Effect based on Score Magnitude
    playResultSound(score) {
        if (score >= 4500) {
            // GOLD / PERFECT GUESS: Epic Sci-Fi success chord
            this._playTone(523.25, 'sine', 0.8, 0.01, 0.3);   // C5
            this._playTone(659.25, 'sine', 0.8, 0.01, 0.3);   // E5
            this._playTone(783.99, 'sine', 0.8, 0.1, 0.4);   // G5
            this._playTone(1046.50, 'sine', 1.2, 0.2, 0.5);  // C6 (High Impact Hit)
            this._playWhoosh(1500, 200, 0.8, 0.4); // Deep air sweep

        } else if (score >= 2500) {
            // AVERAGE GUESS
            this._playTone(440.00, 'sine', 0.5, 0.01, 0.2);   // A4
            this._playTone(554.37, 'sine', 0.6, 0.05, 0.25);  // C#5
            this._playWhoosh(800, 300, 0.5, 0.2);

        } else {
            // BAD GUESS / ERROR SOUND
            this._playTone(200, 'sawtooth', 0.6, 0.0, 0.4); // Muffled, thick sawtooth wave
            this._playTone(150, 'sawtooth', 0.6, 0.1, 0.3); // Even thicker descending wave

            // Falling bass effect
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.6);

            gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.6);
        }
    }

    _playTone(freq, type, dur, delay = 0, vol = 0.1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        // Attack and Decay envelope
        gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + delay + 0.05); // Soft attack
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + dur);
    }

    _playWhoosh(startFreq, endFreq, dur, vol) {
        // Rapidly sliding filter sweep sound ("Whoosh")
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle'; // Wind-like waveform

        // Resonance filter
        filter.type = 'lowpass';
        filter.Q.value = 5; // Subtle ringing sensation
        filter.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + dur);

        // Volume curve
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + dur / 4);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + dur);
    }

    // 4. Combo Sounds (Consecutive perfect guesses - Pitch Rising)
    playComboSound(comboCount) {
        this.init();
        // Base frequency rises higher (more treble) with each combo level
        const baseFreq = 440 + (comboCount * 100);

        // Bright, "Level Up" style dual tone
        this._playTone(baseFreq, 'sine', 0.15, 0, 0.3);
        this._playTone(baseFreq * 1.25, 'triangle', 0.3, 0.1, 0.2);

        // Add extra digital sparkle for very high combos
        if (comboCount > 2) {
            this._playTone(baseFreq * 2, 'sine', 0.4, 0.15, 0.15);
        }
    }

    // 5. Robotic Announcement (Sci-Fi Announcer)
    speak(text, lang = 'en-US') {
        // Play a quick radio static / beep sound (radio announcement feel)
        this.init();
        this._playTone(1200, 'square', 0.05, 0, 0.05);
        this._playTone(1800, 'square', 0.05, 0.08, 0.05);
    }
}

export default new AudioManager();
