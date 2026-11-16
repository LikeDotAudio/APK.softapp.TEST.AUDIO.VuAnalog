import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BALLISTICS_LIBRARY, BallisticsEngine } from '../js/ballistics.js';

const APP_DIR = path.dirname(new URL(import.meta.url).pathname);
const ROOT_DIR = path.resolve(APP_DIR, '..');

test('TEST.AUDIO.VuAnalog manifest validation', () => {
  const manifestPath = path.join(ROOT_DIR, 'display.json');
  assert.ok(fs.existsSync(manifestPath), 'display.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.name, "Analog VU Ballistics Meter");
  assert.equal(manifest.group, "Test & Measurement");
  assert.ok(manifest.app.includes('index.html'), 'Manifest must target index.html');
});

test('TEST.AUDIO.VuAnalog entrypoint exists', () => {
  const htmlPath = path.join(ROOT_DIR, 'index.html');
  const jsPath = path.join(ROOT_DIR, 'js', 'app.js');
  const balPath = path.join(ROOT_DIR, 'js', 'ballistics.js');
  assert.ok(fs.existsSync(htmlPath), 'index.html entrypoint must exist');
  assert.ok(fs.existsSync(jsPath), 'js/app.js script must exist');
  assert.ok(fs.existsSync(balPath), 'js/ballistics.js script must exist');
});

test('BALLISTICS_LIBRARY contains complete set of meter standards and console profiles', () => {
  const requiredPresets = [
    'standard_vu',
    'rms_calculated',
    'lufs_momentary',
    'lufs_shortterm',
    'ppm_type_1',
    'ppm_type_2',
    'true_peak',
    'console_med',
    'fast_response',
    'slow_response',
    'super_slow',
    'peak_hold_3s',
    'master_console',
    'compressor_gr'
  ];

  for (const id of requiredPresets) {
    const preset = BALLISTICS_LIBRARY[id];
    assert.ok(preset, `Preset ${id} must exist in BALLISTICS_LIBRARY`);
    assert.ok(preset.name, `Preset ${id} must have a name`);
    assert.ok(Number.isFinite(preset.attack_ms) && preset.attack_ms >= 0, `Preset ${id} must have attack_ms >= 0`);
    assert.ok(Number.isFinite(preset.release_ms) && preset.release_ms > 0, `Preset ${id} must have release_ms > 0`);
    assert.ok(preset.standard, `Preset ${id} must declare standard specification`);
    assert.ok(preset.source, `Preset ${id} must cite GUI source sample`);
  }
});

test('BallisticsEngine - Standard VU response adheres to 300ms rise', () => {
  const engine = new BallisticsEngine(BALLISTICS_LIBRARY.standard_vu);
  assert.equal(engine.current, -20.0);

  // Step input from -20 dBFS to 0 dBFS
  let t = 0;
  const dt = 0.05; // 50ms increments
  for (let i = 0; i < 6; i++) { // 300ms total
    t += dt * 1000;
    engine.update(0.0, dt, t);
  }

  // After 300ms, standard VU should be near target
  assert.ok(engine.current > -3.0, `Expected needle to reach near 0 dBFS after 300ms, got ${engine.current}`);
});

test('BallisticsEngine - True Peak instant attack & peak hold', () => {
  const engine = new BallisticsEngine(BALLISTICS_LIBRARY.true_peak);
  assert.equal(engine.current, -60.0);

  // Instant rise with 1ms attack
  const now = 1000;
  engine.update(-6.0, 0.02, now);
  assert.ok(engine.current >= -6.1, `Expected near-instant attack for True Peak, got ${engine.current}`);

  // Signal drops to -60 dBFS; engine should hold peak during hold_time (2000ms)
  engine.update(-60.0, 0.5, now + 500);
  assert.equal(engine.current, -6.0, 'Should hold peak during hold duration');

  // After hold expires (e.g. 2500ms elapsed), should start decaying
  engine.update(-60.0, 0.5, now + 2500);
  assert.ok(engine.current < -6.0, `Expected needle to start decaying after hold expiration, got ${engine.current}`);
});
