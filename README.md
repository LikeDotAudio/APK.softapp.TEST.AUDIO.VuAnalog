# 🧭 Analog VU Ballistics Meter (`TEST.AUDIO.VuAnalog`)

> **Category**: Test & Measurement · Audio Scopes
> **Launcher manifest**: [`display.json`](./display.json)
> **Standalone entrypoint**: [`index.html`](./index.html)

Dual vintage moving-coil analog VU meter modeled with ANSI C16.5 300ms ballistic needle response (-20 to +3 VU).

---

## 🏛 Architecture & Philosophy

This application is decoupled from the monolithic SPOG test bench (`meter-input`) as an independent, modular Softapp conforming to the APK Softapps SDK. It operates both as:
1. An autonomous, embeddable micro-frontend iframe / component within SPOG.
2. A standalone web portal application with built-in signal simulation, WebRTC media capture, and MQTT databus telemetry.

**Remote repository**: `https://github.com/LikeDotAudio/APK.softapp.TEST.AUDIO.VuAnalog.git`

---

## 🧪 Smoke Tests

```bash
npm test
```

## 📚 Documentation
- Philosophy & Principles: [Documentation/🏛Philosophy/PRINCIPLES.md](Documentation/🏛Philosophy/PRINCIPLES.md)
- Architecture & Artifacts: [Documentation/🧩Manual and Artifacts/ARCHITECTURE.md](Documentation/🧩Manual%20and%20Artifacts/ARCHITECTURE.md)
- Delivery & Publishing: [Documentation/🌍Publishing/DELIVERY.md](Documentation/🌍Publishing/DELIVERY.md)
