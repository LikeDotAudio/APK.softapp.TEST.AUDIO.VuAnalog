// js/ballistics.js — Ballistics Engine & Preset Library for TEST.AUDIO.VuAnalog
// Kept in sync with APK.audio GUI Frames reference:
// "Widget Samples -> METERING -> Needle -> REF" (ref/reference_meters.json)
// Conforming to ANSI C16.5, DIN 45406, BS 4297, ITU-R BS.1770, and Console profiles.

export const REF_SOURCE = 'ref/reference_meters.json';

export const BALLISTICS_LIBRARY = {
  // ── I. REF: Averaging & Loudness Standards ──
  standard_vu: {
    id: 'standard_vu',
    refId: 'Standard_VU',
    block: 'Averaging_Meters',
    name: 'REF: Standard VU (ANSI C16.5)',
    category: 'REF: Averaging / Loudness',
    standard: 'ANSI C16.5-1942',
    attack_ms: 300,
    release_ms: 300,
    dwell_time: 300,
    hold_time: 0,
    resting_point: -20.0,
    domain: { min: -20.0, max: 3.0, reff_point: 0.0, step: 5.0 },
    notes: "ANSI C16.5-1942. Philosophy: Approximates 'perceived loudness'. 0 VU = +4 dBu (-18 dBFS). 300ms attack/decay, 1-1.5% overshoot.",
    source: 'Widget Samples / METERING / Needle / REF (ref/reference_meters.json)'
  },
  rms_calculated: {
    id: 'rms_calculated',
    refId: 'RMS_Meter',
    block: 'Averaging_Meters',
    name: 'REF: RMS (Calculated)',
    category: 'REF: Averaging / Loudness',
    standard: 'AES-17 / RMS Power',
    attack_ms: 300,
    release_ms: 300,
    dwell_time: 300,
    hold_time: 0,
    resting_point: -20.0,
    domain: { min: -20.0, max: 3.0, reff_point: 0.0, step: 5.0 },
    notes: 'Mathematical calculation of average power over time. Ballistics: Variable windowing.',
    source: 'Widget Samples / METERING / Needle / REF (ref/reference_meters.json)'
  },
  lufs_momentary: {
    id: 'lufs_momentary',
    refId: 'LUFS_Momentary',
    block: 'Digital_Meters',
    name: 'REF: LUFS Momentary (400ms)',
    category: 'REF: Digital / Loudness',
    standard: 'ITU-R BS.1770-4 / EBU R128',
    attack_ms: 400,
    release_ms: 400,
    dwell_time: 400,
    hold_time: 0,
    resting_point: -36.0,
    domain: { min: -36.0, max: 6.0, reff_point: 0.0, step: 6.0 },
    notes: 'ITU-R BS.1770-4. Sliding 400ms window perceived loudness calculation.',
    source: 'Widget Samples / METERING / Needle / REF (ref/reference_meters.json)'
  },
  lufs_shortterm: {
    id: 'lufs_shortterm',
    refId: 'LUFS_ShortTerm',
    block: 'Digital_Meters',
    name: 'REF: LUFS Short-Term (3s)',
    category: 'REF: Digital / Loudness',
    standard: 'ITU-R BS.1770-4 / EBU R128',
    attack_ms: 3000,
    release_ms: 3000,
    dwell_time: 1000,
    hold_time: 0,
    resting_point: -36.0,
    domain: { min: -36.0, max: 6.0, reff_point: 0.0, step: 6.0 },
    notes: 'ITU-R BS.1770-4. Sliding 3s window K-weighted average.',
    source: 'Widget Samples / METERING / Needle / REF (ref/reference_meters.json)'
  },

  // ── II. REF: Quasi-Peak & Protection Meters ──
  ppm_type_1: {
    id: 'ppm_type_1',
    refId: 'PPM_Type_I',
    block: 'Protection_Meters',
    name: 'REF: PPM Type I (DIN 45406)',
    category: 'REF: Quasi-Peak (Protection)',
    standard: 'DIN 45406 / IEC 60268-10 I',
    attack_ms: 10,
    release_ms: 1500,
    dwell_time: 500,
    hold_time: 0,
    resting_point: -50.0,
    domain: { min: -50.0, max: 5.0, reff_point: 0.0, step: 10.0 },
    notes: 'DIN 45406. Protection: Catches peaks to prevent overload. 10ms attack, 1.5s decay (-20dB).',
    source: 'Widget Samples / METERING / Needle / REF (ref/reference_meters.json)'
  },
  ppm_type_2: {
    id: 'ppm_type_2',
    refId: 'PPM_Type_II',
    block: 'Protection_Meters',
    name: 'REF: PPM Type II (BBC BS 4297)',
    category: 'REF: Quasi-Peak (Protection)',
    standard: 'BS 4297 / IEC 60268-10 II',
    attack_ms: 10,
    release_ms: 2800,
    dwell_time: 1000,
    hold_time: 0,
    resting_point: -50.0,
    domain: { min: -50.0, max: 5.0, reff_point: 0.0, step: 10.0 },
    notes: 'BS 4297. Reduces operator eye fatigue. 10ms attack, 2.8s decay (-24dB).',
    source: 'Widget Samples / METERING / Needle / REF (ref/reference_meters.json)'
  },
  true_peak: {
    id: 'true_peak',
    refId: 'Digital_True_Peak',
    block: 'Digital_Meters',
    name: 'REF: True Peak dBTP (ITU-R BS.1770)',
    category: 'REF: Digital / Loudness',
    standard: 'ITU-R BS.1770',
    attack_ms: 1, // virtually instantaneous
    release_ms: 5000,
    dwell_time: 1000,
    hold_time: 2000,
    resting_point: -60.0,
    domain: { min: -60.0, max: 0.0, reff_point: 0.0, step: 10.0 },
    notes: "ITU-R BS.1770. 'God View'. 4x Oversampling to detect Inter-Sample Peaks. Ballistics: Instant attack, peak hold decay.",
    source: 'Widget Samples / METERING / Needle / REF (ref/reference_meters.json)'
  },
  scale_bbc: {
    id: 'scale_bbc',
    refId: 'Scale_BBC',
    block: 'Hardware_Scales_1',
    name: 'REF: Standard BBC (BS 4297)',
    category: 'REF: Hardware Scales',
    standard: 'BS 4297 Scale 1 to 7',
    attack_ms: 10,
    release_ms: 2800,
    dwell_time: 500,
    hold_time: 0,
    resting_point: -20.0, // mapped to dBFS floor for analog display
    domain: { min: 1.0, max: 7.0, reff_point: 4.0, step: 1.0 },
    notes: "Scale 1 to 7. BS4297. White on Matte Black. Mark '4' is reference (10ms attack, 2.8s release).",
    source: 'Widget Samples / METERING / Needle / REF (ref/reference_meters.json)'
  },

  // ── III. Studio Console Profiles (Needle Suite) ──
  console_med: {
    id: 'console_med',
    name: 'Console Standard (Hold 500ms)',
    category: 'Console Profiles',
    standard: 'Broadcast Console',
    attack_ms: 200,
    release_ms: 800,
    dwell_time: 400,
    hold_time: 500,
    resting_point: -20.0,
    notes: 'Standard smooth console ballistics with 500ms peak hold retention.',
    source: '5_Samples/2_Metering/1_Needle/1_needle_vu_meter/needle_vu_meter.json'
  },
  fast_response: {
    id: 'fast_response',
    name: 'Fast Response (Snappy)',
    category: 'Console Profiles',
    standard: 'Peak Reading',
    attack_ms: 50,
    release_ms: 200,
    dwell_time: 50,
    hold_time: 100,
    resting_point: -20.0,
    notes: 'Snappy peak-reading style for monitoring rapid percussive transients.',
    source: '5_Samples/2_Metering/1_Needle/1_more_needle_vu_meters/more_needle_vu_meters.json'
  },
  slow_response: {
    id: 'slow_response',
    name: 'Slow Response (Damped)',
    category: 'Console Profiles',
    standard: 'Damped Meter',
    attack_ms: 500,
    release_ms: 2000,
    dwell_time: 1000,
    hold_time: 0,
    resting_point: -20.0,
    notes: 'Heavy, damped needle feel for smoothing erratic or dense material.',
    source: '5_Samples/2_Metering/1_Needle/1_needle_vu_meter/needle_vu_meter.json'
  },
  super_slow: {
    id: 'super_slow',
    name: 'Super Slow (Vintage Drift)',
    category: 'Console Profiles',
    standard: 'Vintage Mechanical',
    attack_ms: 1000,
    release_ms: 4000,
    dwell_time: 2000,
    hold_time: 0,
    resting_point: -20.0,
    notes: 'Very heavy needle movement, simulating massive mechanical galvanometer drift.',
    source: '5_Samples/2_Metering/1_Needle/1_needle_vu_meter/needle_vu_meter.json'
  },
  peak_hold_3s: {
    id: 'peak_hold_3s',
    name: 'Peak Hold (3s Hold / 10s Decay)',
    category: 'Peak Capture',
    standard: 'Peak Capture',
    attack_ms: 50,
    release_ms: 10000,
    dwell_time: 100,
    hold_time: 3000,
    resting_point: -20.0,
    notes: 'Long-retention peak-level capture with 3-second hold and glacial decay.',
    source: '5_Samples/2_Metering/1_Needle/1_more_needle_vu_meters/more_needle_vu_meters.json'
  },
  master_console: {
    id: 'master_console',
    name: 'Master Console Bank (Hold 200ms)',
    category: 'Console Profiles',
    standard: 'Master Bus Console',
    attack_ms: 300,
    release_ms: 1500,
    dwell_time: 600,
    hold_time: 200,
    resting_point: -30.0,
    notes: 'Master left/right console monitoring profile with 200ms retention.',
    source: '5_Samples/2_Metering/1_Needle/1_huge_needle_vu_meters/huge_needle_vu_meters.json'
  },
  compressor_gr: {
    id: 'compressor_gr',
    name: 'Compressor Gain Reduction',
    category: 'Dynamics GR',
    standard: 'Gain Reduction',
    attack_ms: 10,
    release_ms: 100,
    dwell_time: 0,
    hold_time: 0,
    resting_point: 0.0,
    notes: 'Compressor-style ultra-fast gain reduction ballistics.',
    source: '5_Samples/2_Metering/1_Needle/3_Stereo_needle_meters/Stereo_needle_meters.json'
  }
};

/**
 * BallisticsEngine — State machine simulating moving-coil physical needle dynamics.
 * Supports attack rise time, dwell/hold duration, and exponential release decay.
 */
export class BallisticsEngine {
  constructor(preset = BALLISTICS_LIBRARY.standard_vu) {
    this.configure(preset);
    this.current = this.resting_point;
    this.peak = this.resting_point;
    this.holdStart = 0;
    this.isHolding = false;
  }

  configure(preset) {
    this.preset = preset;
    this.attack_ms = Number.isFinite(preset.attack_ms) ? preset.attack_ms : 300;
    this.release_ms = Number.isFinite(preset.release_ms) ? preset.release_ms : 300;
    this.dwell_time = Number.isFinite(preset.dwell_time) ? preset.dwell_time : 0;
    this.hold_time = Number.isFinite(preset.hold_time) ? preset.hold_time : 0;
    this.resting_point = Number.isFinite(preset.resting_point) ? preset.resting_point : -60.0;
  }

  reset() {
    this.current = this.resting_point;
    this.peak = this.resting_point;
    this.holdStart = 0;
    this.isHolding = false;
  }

  /**
   * Update needle position for elapsed time dt (seconds) at current wall clock time nowMs.
   * @param {number} rawDb - Input signal level in dBFS (typically -60 to 0 dBFS)
   * @param {number} dt - Time delta since last update in seconds
   * @param {number} nowMs - Current timestamp in milliseconds (e.g. performance.now())
   * @returns {number} smoothedDb - Ballistic smoothed output in dBFS
   */
  update(rawDb, dt, nowMs = performance.now()) {
    const minFloor = this.resting_point;
    const target = Math.max(minFloor, rawDb);

    if (target > this.current) {
      // ── Attack Phase: Signal is rising ──
      this.isHolding = false;
      this.peak = Math.max(this.peak, target);

      if (this.attack_ms <= 1) {
        // Instant attack
        this.current = target;
      } else {
        // Exponential attack smoothing: reaches ~95% in attack_ms
        const tauAttack = (this.attack_ms / 1000) / 2.2;
        const alpha = 1 - Math.exp(-dt / Math.max(0.001, tauAttack));
        this.current += (target - this.current) * alpha;
      }

      // If we reach near the target, initiate hold timer
      if (Math.abs(target - this.current) < 0.2) {
        this.holdStart = nowMs;
        this.isHolding = (this.hold_time > 0 || this.dwell_time > 0);
      }
    } else {
      // ── Falling / Decay Phase: Signal is below current needle ──
      const holdDuration = Math.max(this.hold_time, this.dwell_time);

      if (this.isHolding && (nowMs - this.holdStart < holdDuration)) {
        // Holding peak: needle stays at current position
        return this.current;
      }

      this.isHolding = false;
      this.peak = Math.max(target, this.resting_point);

      if (this.release_ms <= 1) {
        this.current = target;
      } else {
        // Exponential decay smoothing: reaches ~95% decay in release_ms
        const tauRelease = (this.release_ms / 1000) / 2.2;
        const alpha = 1 - Math.exp(-dt / Math.max(0.001, tauRelease));
        this.current += (target - this.current) * alpha;
      }
    }

    // Keep within bounds
    if (this.current < minFloor) this.current = minFloor;
    return this.current;
  }
}
