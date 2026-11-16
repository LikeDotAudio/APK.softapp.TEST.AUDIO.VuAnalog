# Architecture: Analog VU Ballistics Meter (`TEST.AUDIO.VuAnalog`)

Canvas 2D rendering pipeline subscribed to WebAudio, MediaStream, and dynamic test signal inputs with integrated moving-coil physical ballistics engine.

## Subsystems

1. **Signal Processing & Audio Context**:
   - Web Audio API graph (`AudioContext`, `GainNode`, `ChannelSplitter`, dual `AnalyserNode` for Left & Right channels).
   - Generates reference sine test tones (-18 dBFS calibration), stereo music simulation with harmonic modulation, external microphone feed, or uploaded audio media.

2. **Ballistics Physics State Machine (`js/ballistics.js`)**:
   - Models physical galvanometer dynamics with configurable attack rise rate, dwell / hold duration, and exponential decay fall rate.
   - Sourced from APK.audio GUI Frames reference meter sample definitions:
     - ANSI C16.5-1942 Standard VU (300ms / 300ms)
     - DIN 45406 PPM Type I (10ms / 1.5s)
     - BBC BS 4297 PPM Type II (10ms / 2.8s)
     - ITU-R BS.1770 Digital True Peak (1ms / 2s hold / 5s decay)
     - ITU-R BS.1770-4 LUFS Momentary (400ms) & Short-Term (3s)
     - Studio console profiles (Med, Fast, Slow, Super Slow, Peak Hold, Compressor GR).

3. **Dual Moving-Coil Dial Renderer**:
   - Renders dual vintage cream faceplates (`#efe7d0`), calibrated arc rules (-20 to +3 VU, red danger zone above 0 VU / -18 dBFS), vintage spade needles, and pivot caps.

4. **Transient Test Harness**:
   - Real-time pulse injection via toolbar button or canvas middle-click to visually inspect dynamic needle trajectory.
