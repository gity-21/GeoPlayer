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

    // 2. 10 saniye kala nabız gibi atan Tik-Tak Sesi
    playTickTock() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine'; // Tık sesi için keskin ama pürüzsüz dalga

        // Ses tepeden aşağı doğru hızlıca inerek 'tık' hissi verir
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

        // Hacim (Zarflama)
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        // Tok bir ton için filtre
        filter.type = 'bandpass';
        filter.frequency.value = 1000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // 3. Puan Büyüklüğüne Göre Başarı Woosh/Hata Efekti
    playResultSound(score) {
        if (score >= 4500) {
            // ALTIN / MÜKEMMEL TAHMİN: Muazzam Sci-Fi başarı akoru
            this._playTone(523.25, 'sine', 0.8, 0.01, 0.3);   // C5
            this._playTone(659.25, 'sine', 0.8, 0.01, 0.3);   // E5
            this._playTone(783.99, 'sine', 0.8, 0.1, 0.4);   // G5
            this._playTone(1046.50, 'sine', 1.2, 0.2, 0.5);  // C6 (Tiz Vuruş)
            this._playWhoosh(1500, 200, 0.8, 0.4); // Derin hava süzülmesi

        } else if (score >= 2500) {
            // ORTALAMA TAHMİN
            this._playTone(440.00, 'sine', 0.5, 0.01, 0.2);   // A4
            this._playTone(554.37, 'sine', 0.6, 0.05, 0.25);  // C#5
            this._playWhoosh(800, 300, 0.5, 0.2);

        } else {
            // KÖTÜ TAHMİN / HATA SESİ
            this._playTone(200, 'sawtooth', 0.6, 0.0, 0.4); // Boğuk, kalın sawtooth dalgası
            this._playTone(150, 'sawtooth', 0.6, 0.1, 0.3); // Daha da kalın inen dalga

            // Düşen bir bas efekti
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

        // Vuruş (Attack) ve Azalma (Decay)
        gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + delay + 0.05); // Hafif attack
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + dur);
    }

    _playWhoosh(startFreq, endFreq, dur, vol) {
        // Hızlıca kayan bir filtreleme sesi ("Woosh")
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle'; // Rüzgar benzeri

        // Rezonans filtresi
        filter.type = 'lowpass';
        filter.Q.value = 5; // Hafif çınlama hissi
        filter.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + dur);

        // Hacim eğrisi
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + dur / 4);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + dur);
    }

    // 4. Kombo Sesleri (Peş peşe mükemmel tahmin - Pitch Artıyor)
    playComboSound(comboCount) {
        this.init();
        // Temel frekans, her kombo seviyesinde (comboCount) daha yükseğe (tiz) çıkar
        const baseFreq = 440 + (comboCount * 100);

        // Çok parlak, "Level Up" benzeri bir ikili ton
        this._playTone(baseFreq, 'sine', 0.15, 0, 0.3);
        this._playTone(baseFreq * 1.25, 'triangle', 0.3, 0.1, 0.2);

        // Kombo çok yüksekse ekstra dijital ışıltı ekle
        if (comboCount > 2) {
            this._playTone(baseFreq * 2, 'sine', 0.4, 0.15, 0.15);
        }
    }

    // 5. Robotik Anons (Sci-Fi Spiker)
    speak(text, lang = 'tr-TR') {
        // Hızlıca küçük bir telsiz cızırtısı / bip sesi çal (radyo anonsu hissi)
        this.init();
        this._playTone(1200, 'square', 0.05, 0, 0.05);
        this._playTone(1800, 'square', 0.05, 0.08, 0.05);
    }
}

export default new AudioManager();
