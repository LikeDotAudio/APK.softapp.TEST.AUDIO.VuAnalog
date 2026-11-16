import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BALLISTICS_LIBRARY, BallisticsEngine, REF_SOURCE } from '../js/ballistics.js';

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

test('TEST.AUDIO.VuAnalog entrypoint and REF dataset exist', () => {
  const htmlPath = path.join(ROOT_DIR, 'index.html');
  const jsPath = path.join(ROOT_DIR, 'js', 'app.js');
  const balPath = path.join(ROOT_DIR, 'js', 'ballistics.js');
  const refPath = path.join(ROOT_DIR, REF_SOURCE);

  assert.ok(fs.existsSync(htmlPath), 'index.html entrypoint must exist');
  assert.ok(fs.existsSync(jsPath), 'js/app.js script must exist');
  assert.ok(fs.existsSync(balPath), 'js/ballistics.js script must exist');
  assert.ok(fs.existsSync(refPath), 'ref/reference_meters.json must exist as the authoritative REF dataset');
});

test('REF dataset contains authoritative meter blocks', () => {
  const refPath = path.join(ROOT_DIR, REF_SOURCE);
  const refData = JSON.parse(fs.readFileSync(refPath, 'utf8'));
  const refBin = refData.Zoo_Metering_Needle_REF;
  assert.ok(refBin, 'REF dataset must define Zoo_Metering_Needle_REF');
  assert.ok(refBin.blocks.Averaging_Meters, 'Must contain Averaging_Meters block');
  assert.ok(refBin.blocks.Protection_Meters, 'Must contain Protection_Meters block');
  assert.ok(refBin.blocks.Digital_Meters, 'Must contain Digital_Meters block');
  assert.ok(refBin.blocks.Hardware_Scales_1, 'Must contain Hardware_Scales_1 block');
});

test('BALLISTICS_LIBRARY reflects authoritative REF ballistics', () => {
  const refPath = path.join(ROOT_DIR, REF_SOURCE);
  const refData = JSON.parse(fs.readFileSync(refPath, 'utf8')).Zoo_Metering_Needle_REF.blocks;

  // Standard VU
  assert.equal(BALLISTICS_LIBRARY.standard_vu.attack_ms, 300);
  assert.equal(BALLISTICS_LIBRARY.standard_vu.release_ms, 300);

  // RMS Meter
  const rmsRef = refData.Averaging_Meters.fields.RMS_Meter.dynamics;
  assert.equal(BALLISTICS_LIBRARY.rms_calculated.attack_ms, rmsRef.attack_ms);
  assert.equal(BALLISTICS_LIBRARY.rms_calculated.release_ms, rmsRef.release_ms);

  // PPM DIN
  const ppm1Ref = refData.Protection_Meters.fields.PPM_Type_I.dynamics;
  assert.equal(BALLISTICS_LIBRARY.ppm_type_1.attack_ms, ppm1Ref.attack_ms);
  assert.equal(BALLISTICS_LIBRARY.ppm_type_1.release_ms, ppm1Ref.release_ms);

  // PPM BBC
  const ppm2Ref = refData.Protection_Meters.fields.PPM_Type_II.dynamics;
  assert.equal(BALLISTICS_LIBRARY.ppm_type_2.attack_ms, ppm2Ref.attack_ms);
  assert.equal(BALLISTICS_LIBRARY.ppm_type_2.release_ms, ppm2Ref.release_ms);

  // True Peak
  const tpRef = refData.Digital_Meters.fields.Digital_True_Peak.dynamics;
  assert.equal(BALLISTICS_LIBRARY.true_peak.hold_time, tpRef.hold_time);
  assert.equal(BALLISTICS_LIBRARY.true_peak.release_ms, tpRef.release_ms);

  // LUFS
  const lufsMRef = refData.Digital_Meters.fields.LUFS_Momentary.dynamics;
  assert.equal(BALLISTICS_LIBRARY.lufs_momentary.attack_ms, lufsMRef.attack_ms);
  assert.equal(BALLISTICS_LIBRARY.lufs_momentary.release_ms, lufsMRef.release_ms);
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
