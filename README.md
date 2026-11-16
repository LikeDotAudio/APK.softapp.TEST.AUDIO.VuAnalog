# 🧭 Analog VU Ballistics Meter (`TEST.AUDIO.VuAnalog`)

> **Category**: Test & Measurement · Audio Scopes
> **Launcher manifest**: [`display.json`](./display.json)
> **Standalone entrypoint**: [`index.html`](./index.html)
> **Ballistics engine**: [`js/ballistics.js`](./js/ballistics.js)

Dual vintage moving-coil analog VU meter modeled with physical ballistics including ANSI C16.5, DIN 45406, BS 4297, ITU-R BS.1770, and studio console needle dynamics.

---

## 🏛 Architecture & Philosophy

This application is decoupled from the monolithic SPOG test bench (`meter-input`) as an independent, modular Softapp conforming to the APK Softapps SDK. It operates both as:
1. An autonomous, embeddable micro-frontend iframe / component within SPOG.
2. A standalone web portal application with built-in signal simulation, WebRTC media capture, and MQTT databus telemetry.

### 📊 Meter Ballistics Library

Sourced from the reference meter samples in `PODS/POD.THIN/WEB.Frontend-Assets/SRC/FrontEnd/Gui_Frames/5_Samples/2_Metering/1_Needle/`:
- **Averaging & Loudness Standards**:
  - `Standard VU (ANSI C16.5)`: 300ms attack / 300ms release, 1-1.5% overshoot (ANSI C16.5-1942). 0 VU = +4 dBu (-18 dBFS).
  - `RMS (Calculated)`: 300ms windowed power integration.
  - `LUFS Momentary`: 400ms sliding window perceived loudness calculation (ITU-R BS.1770-4 / EBU R128).
  - `LUFS Short-Term`: 3000ms sliding window K-weighted average (ITU-R BS.1770-4).
- **Quasi-Peak (Protection)**:
  - `PPM Type I (DIN 45406)`: 10ms attack, 1500ms release (-20 dB decay in 1.5s).
  - `PPM Type II (BBC BS 4297)`: 10ms attack, 2800ms release (-24 dB decay in 2.8s) to reduce operator eye fatigue.
  - `True Peak dBTP`: 1ms instant attack, 2000ms peak hold, 5000ms slow decay (ITU-R BS.1770).
- **Console & Physical Needle Profiles**:
  - `Console Standard`: 200ms attack, 800ms release, 500ms peak retention.
  - `Fast Response`: 50ms attack, 200ms release for percussive transient monitoring.
  - `Slow Response`: 500ms attack, 2000ms release for heavy damped needle inertia.
  - `Super Slow Vintage`: 1000ms attack, 4000ms release simulating heavy mechanical galvanometer drift.
  - `Peak Hold (3s)`: 50ms attack, 10000ms glacial decay, 3000ms hold.
  - `Master Console Bank`: 300ms attack, 1500ms release, 200ms hold.
  - `Compressor Gain Reduction`: 10ms attack, 100ms release.

---

## ⚡ Interactive Ballistics Testing

- **⚡ Test Pulse**: Click the toolbar button or middle-click on the meter canvas (or Alt+click) to inject a transient test burst and watch needle attack, peak hold, and decay in real-time.

---

## 🧪 Smoke Tests

```bash
npm test
```

## 📚 Documentation
- Philosophy & Principles: [Documentation/🏛Philosophy/PRINCIPLES.md](Documentation/🏛Philosophy/PRINCIPLES.md)
- Architecture & Artifacts: [Documentation/🧩Manual and Artifacts/ARCHITECTURE.md](Documentation/🧩Manual%20and%20Artifacts/ARCHITECTURE.md)
- Delivery & Publishing: [Documentation/🌍Publishing/DELIVERY.md](Documentation/🌍Publishing/DELIVERY.md)
