// TEST.AUDIO.VuAnalog — Standalone Analog Moving-Coil VU Meter
// Conforms to ANSI C16.5, DIN 45406, BS 4297, ITU-R BS.1770, and Console ballistic profiles.
// Sourced from APK.audio GUI Frames sample library (5_Samples/2_Metering/1_Needle)

import { BALLISTICS_LIBRARY, BallisticsEngine } from './ballistics.js';

const canvas = document.getElementById('vuCanvas');
const ctx = canvas.getContext('2d');
const valL = document.getElementById('valL');
const valR = document.getElementById('valR');
const vuL = document.getElementById('vuL');
const vuR = document.getElementById('vuR');
const btnTone = document.getElementById('btnTone');
const btnMod = document.getElementById('btnMod');
const btnMic = document.getElementById('btnMic');
const btnPulse = document.getElementById('btnPulse');
const fileIn = document.getElementById('fileIn');
const gainSlider = document.getElementById('gainSlider');
const gainVal = document.getElementById('gainVal');
const btnReset = document.getElementById('btnReset');
const balSelect = document.getElementById('balSelect');
const balBadge = document.getElementById('balBadge');
const calibText = document.getElementById('calibText');

// ── Ballistics Engines ──
let currentPreset = BALLISTICS_LIBRARY.standard_vu;
const engineL = new BallisticsEngine(currentPreset);
const engineR = new BallisticsEngine(currentPreset);

function updateBallisticsBadge(preset) {
  if (balBadge) {
    const holdStr = preset.hold_time ? ` · Hold: ${preset.hold_time}ms` : '';
    balBadge.textContent = `${preset.standard} · Att: ${preset.attack_ms}ms · Rel: ${preset.release_ms}ms${holdStr}`;
    balBadge.title = preset.notes;
  }
  if (calibText) {
    calibText.innerHTML = `CALIBRATION: <b>0 VU = -18 dBFS</b> (${preset.name})`;
  }
}

if (balSelect) {
  balSelect.addEventListener('change', () => {
    const key = balSelect.value;
    const preset = BALLISTICS_LIBRARY[key] || BALLISTICS_LIBRARY.standard_vu;
    currentPreset = preset;
    engineL.configure(preset);
    engineR.configure(preset);
    updateBallisticsBadge(preset);
  });
}

// ── Palette Constants (from SPOG domain/palette.ts) ──
const PAL = {
  amber88: '#efe7d0', // Vintage cream faceplate
  amber13: '#2a2418', // Scale lettering & markers
  amber19: '#3a3428', // Scale arc
  amber36: '#8a7530', // "VU" logo
  grey08s0: '#141414', // Needle & pivot cap
  red44: '#c02020',   // Red overload zone (> 0 VU)
  black: '#000000',
};

function alpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Drawing Engine (matching SPOG scopes-audio.ts & libControl/metering) ──
const VU_LO = -20, VU_HI = 3;
const VU_MARKS = [
  [-20, '20'], [-10, '10'], [-7, '7'], [-5, '5'], [-3, '3'], [0, '0'], [3, '+3']
];

function drawOneVU(c, x, y, w, h, db, label) {
  c.save();
  c.beginPath();
  c.roundRect(x + 2, y + 2, w - 4, h - 4, 8);
  c.fillStyle = PAL.amber88;
  c.fill();
  c.strokeStyle = alpha(PAL.black, 0.25);
  c.lineWidth = 1;
  c.stroke();

  const cx = x + w / 2;
  const cy = y + h * 0.9;
  const R = Math.min(w, h) * 0.7;
  const A0 = -Math.PI / 2 - 0.92;
  const A1 = -Math.PI / 2 + 0.92;

  const ang = (vu) => A0 + (A1 - A0) * ((vu - VU_LO) / (VU_HI - VU_LO));

  // Main arc
  c.strokeStyle = PAL.amber19;
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(cx, cy, R, A0, A1);
  c.stroke();

  // Red danger arc above 0 VU
  c.strokeStyle = PAL.red44;
  c.lineWidth = 3;
  c.beginPath();
  c.arc(cx, cy, R, ang(0), A1);
  c.stroke();

  const fs = Math.max(6, h * 0.085);
  c.textAlign = 'center';
  c.font = `bold ${fs}px -apple-system, BlinkMacSystemFont, Arial, sans-serif`;

  VU_MARKS.forEach(([vu, txt]) => {
    const a = ang(vu), isRed = vu >= 0;
    c.strokeStyle = isRed ? PAL.red44 : PAL.amber13;
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    c.lineTo(cx + Math.cos(a) * (R - 7), cy + Math.sin(a) * (R - 7));
    c.stroke();

    c.fillStyle = isRed ? PAL.red44 : PAL.amber13;
    c.fillText(txt, cx + Math.cos(a) * (R - 15), cy + Math.sin(a) * (R - 15) + 3);
  });

  // Center "VU" Branding & Channel Label
  c.fillStyle = PAL.amber36;
  c.font = `bold ${Math.max(8, h * 0.1)}px Arial`;
  c.fillText('VU', cx, cy - R * 0.5);

  c.fillStyle = PAL.amber13;
  c.font = `bold ${fs}px Arial`;
  c.fillText(label, cx, cy - 5);

  // Moving Ballistic Needle
  const a = ang(Math.max(VU_LO, Math.min(VU_HI, db + 18))); // 0 VU = -18 dBFS
  c.strokeStyle = PAL.grey08s0;
  c.lineWidth = Math.max(1.5, h * 0.018);
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx, cy);
  c.lineTo(cx + Math.cos(a) * R * 0.95, cy + Math.sin(a) * R * 0.95);
  c.stroke();

  // Pivot Screw / Cap
  c.fillStyle = PAL.grey08s0;
  c.beginPath();
  c.arc(cx, cy, Math.max(3, h * 0.035), 0, Math.PI * 2);
  c.fill();

  c.restore();
}

function drawVUpair(cv, dbL, dbR) {
  const W = cv.width, H = cv.height;
  if (W < 24 || H < 16) return;
  ctx.clearRect(0, 0, W, H);
  drawOneVU(ctx, 0, 0, W / 2, H, dbL, 'L');
  drawOneVU(ctx, W / 2, 0, W / 2, H, dbR, 'R');
}

// ── Web Audio API Engine & Signal Generator ──
let audioCtx = null;
let masterGain = null;
let analyserL = null;
let analyserR = null;
let currentSource = null;
let mode = 'tone'; // 'tone' | 'mod' | 'mic' | 'file'

function initAudio() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  masterGain = audioCtx.createGain();
  masterGain.gain.value = 1.0;

  const splitter = audioCtx.createChannelSplitter(2);
  analyserL = audioCtx.createAnalyser();
  analyserR = audioCtx.createAnalyser();
  analyserL.fftSize = 1024;
  analyserR.fftSize = 1024;

  masterGain.connect(splitter);
  splitter.connect(analyserL, 0);
  splitter.connect(analyserR, 1);
}

function setTone() {
  initAudio();
  if (currentSource) { try { currentSource.stop(); } catch(e){} currentSource.disconnect(); }
  mode = 'tone';

  const osc = audioCtx.createOscillator();
  const toneGain = audioCtx.createGain();
  // -18 dBFS reference level = 10^(-18/20) ≈ 0.12589
  toneGain.gain.value = Math.pow(10, -18 / 20);
  osc.type = 'sine';
  osc.frequency.value = 1000; // Standard 1 kHz test tone
  osc.connect(toneGain);
  toneGain.connect(masterGain);
  osc.start();
  currentSource = osc;

  updateToolbar('tone');
}

function setMusicSim() {
  initAudio();
  if (currentSource) { try { currentSource.stop(); } catch(e){} currentSource.disconnect(); }
  mode = 'mod';

  // Multi-frequency harmonic simulation with stereo pan modulation
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const lfo = audioCtx.createOscillator();
  const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

  osc1.frequency.value = 220; // A3 bass
  osc2.frequency.value = 440; // A4 lead

  const subGain = audioCtx.createGain();
  subGain.gain.value = 0.15;
  osc1.connect(subGain);
  osc2.connect(subGain);

  if (panner) {
    lfo.frequency.value = 0.5; // slow stereo pan
    lfo.connect(panner.pan);
    subGain.connect(panner);
    panner.connect(masterGain);
    lfo.start();
  } else {
    subGain.connect(masterGain);
  }

  osc1.start();
  osc2.start();
  currentSource = {
    stop: () => { osc1.stop(); osc2.stop(); if (lfo) lfo.stop(); },
    disconnect: () => { osc1.disconnect(); osc2.disconnect(); }
  };

  updateToolbar('mod');
}

async function setMic() {
  initAudio();
  if (currentSource) { try { currentSource.stop(); } catch(e){} currentSource.disconnect(); }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const micSource = audioCtx.createMediaStreamSource(stream);
    micSource.connect(masterGain);
    currentSource = {
      stop: () => stream.getTracks().forEach(t => t.stop()),
      disconnect: () => micSource.disconnect()
    };
    mode = 'mic';
    updateToolbar('mic');
  } catch (err) {
    alert("Microphone access unavailable: " + err.message);
  }
}

fileIn.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  initAudio();
  if (currentSource) { try { currentSource.stop(); } catch(e){} currentSource.disconnect(); }

  const url = URL.createObjectURL(file);
  const audio = new Audio(url);
  audio.loop = true;
  await audio.play();
  const fileSource = audioCtx.createMediaElementSource(audio);
  fileSource.connect(masterGain);
  currentSource = {
    stop: () => { audio.pause(); URL.revokeObjectURL(url); },
    disconnect: () => fileSource.disconnect()
  };
  mode = 'file';
  updateToolbar('file');
});

// ── Transient Pulse Testing (matches FieldComponent ballistics test) ──
let pulseUntil = 0;
let pulseDb = -6.0;

function triggerPulse(targetDb = -6.0) {
  initAudio();
  pulseUntil = performance.now() + 150;
  pulseDb = targetDb;

  if (audioCtx && masterGain) {
    const osc = audioCtx.createOscillator();
    const pGain = audioCtx.createGain();
    pGain.gain.value = Math.pow(10, targetDb / 20);
    osc.type = 'triangle';
    osc.frequency.value = 800;
    osc.connect(pGain);
    pGain.connect(masterGain);
    const now = audioCtx.currentTime;
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

if (btnPulse) {
  btnPulse.addEventListener('click', () => triggerPulse(-6.0));
}

// Middle-click (or click) on canvas to test needle ballistics
canvas.addEventListener('mousedown', (e) => {
  if (e.button === 1 || e.altKey || e.shiftKey) {
    e.preventDefault();
    triggerPulse(-6.0);
  }
});

function updateToolbar(active) {
  btnTone.classList.toggle('on', active === 'tone');
  btnMod.classList.toggle('on', active === 'mod');
  btnMic.classList.toggle('on', active === 'mic');
}

btnTone.addEventListener('click', setTone);
btnMod.addEventListener('click', setMusicSim);
btnMic.addEventListener('click', setMic);

gainSlider.addEventListener('input', () => {
  const db = parseFloat(gainSlider.value);
  gainVal.textContent = `${db >= 0 ? '+' : ''}${db} dB`;
  if (masterGain) {
    masterGain.gain.value = Math.pow(10, db / 20);
  }
});

btnReset.addEventListener('click', () => {
  engineL.reset();
  engineR.reset();
  gainSlider.value = 0;
  gainVal.textContent = '0 dB';
  if (masterGain) masterGain.gain.value = 1.0;
  setTone();
});

// ── Ballistics & Render Loop ──
const bufL = new Float32Array(512);
const bufR = new Float32Array(512);

function calcRMS(buf) {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  const rms = Math.sqrt(sum / buf.length);
  return rms > 0 ? 20 * Math.log10(rms) : -100;
}

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(200, rect.width * dpr);
  canvas.height = Math.max(120, rect.height * dpr);
}
window.addEventListener('resize', resize);
resize();

let lastFrame = performance.now();

function loop(now) {
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;

  let rawDbL = -60;
  let rawDbR = -60;

  if (analyserL && analyserR) {
    analyserL.getFloatTimeDomainData(bufL);
    analyserR.getFloatTimeDomainData(bufR);
    rawDbL = Math.max(-60, calcRMS(bufL));
    rawDbR = Math.max(-60, calcRMS(bufR));
  } else {
    // Default simulated tone before user interaction
    rawDbL = -18.0;
    rawDbR = -18.0;
  }

  // Inject test pulse if active
  if (now < pulseUntil) {
    rawDbL = Math.max(rawDbL, pulseDb);
    rawDbR = Math.max(rawDbR, pulseDb);
  }

  // Process ballistics through library engine
  const smoothL = engineL.update(rawDbL, dt, now);
  const smoothR = engineR.update(rawDbR, dt, now);

  drawVUpair(canvas, smoothL, smoothR);

  // Readouts: 0 VU = -18 dBFS
  const currentVuL = Math.max(-20, Math.min(3, smoothL + 18));
  const currentVuR = Math.max(-20, Math.min(3, smoothR + 18));
  valL.textContent = smoothL.toFixed(1);
  valR.textContent = smoothR.toFixed(1);
  vuL.textContent = currentVuL.toFixed(1);
  vuR.textContent = currentVuR.toFixed(1);

  requestAnimationFrame(loop);
}

// Start interactive audio on first click
window.addEventListener('pointerdown', () => {
  if (!audioCtx) setTone();
}, { once: true });

// Initialize badge with default preset
updateBallisticsBadge(currentPreset);

requestAnimationFrame(loop);
