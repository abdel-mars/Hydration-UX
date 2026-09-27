import { useCallback, useRef } from "react";
import type { FlipDirection } from "@/lib/pageCurl";

/**
 * Page-turn sound synthesised with WebAudio so the viewer ships without an
 * audio asset. A turn is three events: the sheet is pulled off (a rising
 * rustle), the leading edge snaps over, and the page settles with a soft
 * thump. A drag that springs back only gets the rustle.
 */
const NOISE_SECONDS = 1;

const RUSTLE = {
  attack: 0.008,
  duration: 0.24,
  from: 900,
  peak: 3200,
  settle: 1400,
  gain: 0.1,
  backGain: 0.085,
};

const SNAP = {
  delay: 0.16,
  duration: 0.02,
  frequency: 3500,
  gain: 0.055,
};

const THUMP = {
  delay: 0.16,
  from: 140,
  to: 90,
  duration: 0.09,
  gain: 0.05,
};

const REVERT = { duration: 0.09, gain: 0.03 };

export const useFlipSound = () => {
  const contextRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  const getContext = useCallback(() => {
    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return null;

    const context = contextRef.current ?? new AudioContextCtor();
    contextRef.current = context;
    if (context.state === "suspended") void context.resume();

    if (!bufferRef.current) {
      const frames = Math.floor(context.sampleRate * NOISE_SECONDS);
      const buffer = context.createBuffer(1, frames, context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < frames; i += 1) {
        channel[i] = Math.random() * 2 - 1;
      }
      bufferRef.current = buffer;
    }

    return context;
  }, []);

  const noise = useCallback((context: AudioContext, at: number, duration: number) => {
    const source = context.createBufferSource();
    source.buffer = bufferRef.current;
    source.loop = true;
    source.start(at, Math.random() * (NOISE_SECONDS - duration - 0.01));
    source.stop(at + duration);
    return source;
  }, []);

  const onLift = useCallback(
    (direction: FlipDirection) => {
      try {
        const context = getContext();
        if (!context) return;

        const now = context.currentTime;
        const back = direction !== "right";
        const duration = RUSTLE.duration;
        const peak = RUSTLE.gain * (back ? RUSTLE.backGain / RUSTLE.gain : 1);

        const bandpass = context.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.Q.value = 0.9;
        bandpass.frequency.setValueAtTime(back ? RUSTLE.from * 0.85 : RUSTLE.from, now);
        bandpass.frequency.exponentialRampToValueAtTime(
          back ? RUSTLE.peak * 0.82 : RUSTLE.peak,
          now + duration * 0.55,
        );
        bandpass.frequency.exponentialRampToValueAtTime(RUSTLE.settle, now + duration);

        const gain = context.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(peak, now + RUSTLE.attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noise(context, now, duration).connect(bandpass).connect(gain).connect(context.destination);
      } catch {
        /* audio is a progressive enhancement */
      }
    },
    [getContext, noise],
  );

  const onLand = useCallback(
    (_direction: FlipDirection | null, committed: boolean) => {
      try {
        const context = getContext();
        if (!context) return;

        const now = context.currentTime;

        if (!committed) {
          const bandpass = context.createBiquadFilter();
          bandpass.type = "bandpass";
          bandpass.Q.value = 0.7;
          bandpass.frequency.setValueAtTime(1600, now);
          bandpass.frequency.exponentialRampToValueAtTime(700, now + REVERT.duration);

          const gain = context.createGain();
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(REVERT.gain, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + REVERT.duration);

          noise(context, now, REVERT.duration)
            .connect(bandpass)
            .connect(gain)
            .connect(context.destination);
          return;
        }

        const snapAt = now + SNAP.delay;
        const highpass = context.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = SNAP.frequency;

        const snapGain = context.createGain();
        snapGain.gain.setValueAtTime(0.0001, snapAt);
        snapGain.gain.exponentialRampToValueAtTime(SNAP.gain, snapAt + 0.003);
        snapGain.gain.exponentialRampToValueAtTime(0.0001, snapAt + SNAP.duration);

        noise(context, snapAt, SNAP.duration)
          .connect(highpass)
          .connect(snapGain)
          .connect(context.destination);

        const thumpAt = now + THUMP.delay;
        const thump = context.createOscillator();
        thump.type = "sine";
        thump.frequency.setValueAtTime(THUMP.from, thumpAt);
        thump.frequency.exponentialRampToValueAtTime(THUMP.to, thumpAt + THUMP.duration);

        const thumpGain = context.createGain();
        thumpGain.gain.setValueAtTime(0.0001, thumpAt);
        thumpGain.gain.exponentialRampToValueAtTime(THUMP.gain, thumpAt + 0.006);
        thumpGain.gain.exponentialRampToValueAtTime(0.0001, thumpAt + THUMP.duration);

        thump.connect(thumpGain).connect(context.destination);
        thump.start(thumpAt);
        thump.stop(thumpAt + THUMP.duration);
      } catch {
        /* audio is a progressive enhancement */
      }
    },
    [getContext, noise],
  );

  return { onLift, onLand };
};
