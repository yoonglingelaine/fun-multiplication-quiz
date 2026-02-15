class AudioController {
    constructor() {
        this.ctx = null;
        this.bgmOscillator = null;
        this.bgmGain = null;
        this.isMuted = false;
        this.isSpeaking = false;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBGM();
            window.speechSynthesis.cancel();
        } else {
            // 如果在游戏中，恢复背景音乐
            if (state.view === 'game') {
                this.playBGM();
            }
        }
        return this.isMuted;
    }

    // 播放简单的音效
    playEffect(type) {
        if (this.isMuted) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        switch (type) {
            case 'correct':
                // 叮咚 (C5 -> E5)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'wrong':
                // 嗡嗡 (低频锯齿波)
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'catch':
                // 啵 (短促正弦波)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'gameover':
                // 降调
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.linearRampToValueAtTime(100, now + 1.0);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 1.0);
                osc.start(now);
                osc.stop(now + 1.0);
                break;
        }
    }

    // 简单的背景音乐 (循环旋律)
    // 注意：Web Audio API 直接合成完整 BGM 比较复杂，这里用简单的循环琶音模拟
    playBGM() {
        if (this.isMuted || this.bgmOscillator) return;
        this.init();

        // 暂时留空，集中精力在音效和语音。
    }

    stopBGM() {
        if (this.bgmOscillator) {
            this.bgmOscillator.stop();
            this.bgmOscillator = null;
        }
    }

    // TTS 朗读
    speak(text, lang = 'zh-CN') {
        if (this.isMuted) return;
        
        // 取消当前正在说的
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9; // 稍微慢一点，适合小朋友
        utterance.pitch = 1.2; // 稍微高一点，比较活泼

        // 尝试选择中文语音
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN'));
        if (zhVoice) utterance.voice = zhVoice;

        window.speechSynthesis.speak(utterance);
    }
}

window.audioCtrl = new AudioController();