/*
 * IDB Programming: A3 — a musical instrument
 *
 * All of the code for your instrument goes in this file. It's split into sections:
 *   settings — the "fixed" parts of your program
 *   state    — the parts of your program that change over time
 *   sound    — the Tone.js instruments and effects
 *   update   — updates the state every 100ms, if necessary
 *   use      — uses the state to make sound and shapes every 100ms, if necessary
 *   controls — what happens when the player uses the pointer
 *   setup    — starts everything
 *
 * The pointer events change the state. update() and use() each run every
 * 100ms, in a loop:
 *   1. update: change the state, e.g. based on time or on the pointer's movement
 *   2. use:    make sound and move shapes, based on the state
 *
 * Shapes come from shape.js: createShape() makes one, and its methods
 * (setPosition, setSize, setColour ...) change it.
 *
 * Tone.js documentation: https://tonejs.github.io/docs/15.1.22/
 */

import { createShape } from "./shape.js";

// ---------- Settings ----------
import * as Tone from "tone.js";
const setting = {
  minMidi: 48,
  maxMidi: 84,
  minVolume: 0.015,
  maxVolume: 0.22,
  minFilter: 350,
  maxFilter: 8000,
  maxSpeed: 1.5,
  minSize: 0.85,
  maxSize: 1.5
};
// ---------- State ----------
const state = {
  x: 0.5,
  y:0.5,
  previousX: null,
  previousY: null,
  previousTime: null,
  speed: 0,
  direction: 0,
  history: [],
  pointerDown: false,
  audioReady: false,
  lastMidi: 60
};
//-------- Setup------------
const circle = document.querySelector("#circle");
const startButton = document.querySelector("#start");
const status = document.querySelector("#status");
const readout = document.querySelector("#readout");

let synth;
let filter;

async function setupAudio() {
await Tone.start();

if (!synth) {
  filter = new Tone.Filter({
    type: "lowpass",
    frequency: 2000,
    rolloff: -12
  });
synth = new Tone.Synth({
  oscillator: {type: "sawtooth" },
  envelope: {
    attack: 0.08,
    decay: 0.15,
    sustain: 0.7,
    release: 0.35
  }
});

synth.connect(filter);
filter.toDestination();

}

state.audioReady = true;
startButton.textContent = "Audio Enabled";
statustextContent = "Move around; hold the pointer to play.";

}

startButton.addEventListener("click", setupAudio);

//UPDATE: Process Pointer History
function updateMovement(event) {
  const rect = circle.getBoundingClientRect();
// Normalize pointer coordinates from 0 to 1.
state.x = Math.max(
  0, Math.min(1, (event.ClientX - rect.left) / rect.width)
);

state.y = Math.max(
  0, Math.min(1, (event.clientY - rect.top) / rect.height)
);
const now = performance.now();
if (state.previousTime !== null) {
  const dt = Mathmax(1, now - state.previousTime);
  const dx = state.x - state.previousX;
  const dy = state.y - state.previousY;
}
// Movement distance per millisecond.

const instaSpeed = Math.hypot(dx, dy) / dt;

//Smooth speed using a history of recent events.

state.history.push(instantSpeed);
if (state.history.length > 8) {
  state.history.shift();
}
const averageSpeed =
state.history.reduce((sum, value) => sum + value, 0) /
state.history.length;

state.speed = averageSpeed;
state.direction = Math.atan(dy, dx);
}

state.previousX = state.x;
state.previousY = state.y;
state.previousTime = now;

updateInstrument();

// USE: Change Sound and Visuals

function updateInstrument() {
  const midi = Math.round(
    settings.minMidi +
    state.x * (settings.maxMidi - settings.minMidi)

  );
}
const volume = settings.minVolume +
(1 - state.y) *
(settings.maxVolume - settings.minVolume);

const movement = Math.min(
  1, state.speed / settings.maxSpeed
);
const cutoff = settings.MinFilter +
movement * (settings.maxFilter - settings.minFilter);

const size = settings.minSize +
movement * (settings.maxSize - settings.minSize);

//Visual Feedback: Pitch Changes Color;
// Speed Changes Size and Glow.
const hue = 190 + state.x * 150;
const glow = 15 + movement * 45;

circle.computedStyleMap.background = `hsl(${hue}, 85%, 60%)` ;
circle.computedStyleMap.transform =
`scale(${size}) rotate(${state.direction}rad)`;

circle.style.boxShadow =
`0 0 ${glow}px hsla(${hue}, 90%, 60%, 0.7)`;

readout.textContent =
`Pitch: ${Tone.Frequency(midi, "midi").toNote()} |` +
`Speed: ${(state.speed * 1000).toFixed(2)}`;

if (!state.audioReady) {
  status.textContent = "Enable audio to hear the instrument.";
  return;
}
// Movement Continously Changes Sound Parameters.
filter.frequency.ramp(cutoff, 0.05);
synth.volume.rampTo(Tone.gainToDb(volume), 0.05);


const frequency = Tone.Frequency(midi, "midi").toFrequency();

if (state.pointerDown) {
  synth.frequency.rampTo(frequency, 0.04);
}
status.textContent = state.pointerDown
? "Playing - move to change the sound."
: "Ready - press and hold the circle to play.";

//Pointer Event Handlers.
circle.addEventListeners("pointermove", updateMovement);

circle.addEventListeners("pointerdown", async (event))
  event.preventDefault();
  if (!state.audioReady) {
    status.textContent = "Click Enable Audio First.";
    return;
  }
  circle.setPointerCapture(event.pointerId);
  state.pointerDown = true;

  //Start the Note At the Current Pointer Position.
  const midi = Math.round(
    settings.minMidi +
    state.x * (settings.maxMidi - settings.minMidi)
  );
  synth.triggerAttack(
    Tone.Frequency(midi, "midi").toFrequency
  );
  updateInstrument();

function stopPlaying () {
  if (!state.pointerDown) return;
  state.pointerDown = false;
  if (synth) {
    synth.triggerRelease();
  }
  status.textContent = "Note released.";
}
circle.addEventListener("pointerup, stopPlaying");
circle.addEventListener("pointercancel", stopPlaying);
circle.addEventListener("lostpointercapture", stopPlaying);

circle.style.background =`hsl(${hue}, 85%, 60%)`;
circle.style.transform =
`scale(${size}) rotate(${state.direction}rad)`;

circle.style.boxShadow =
`0 0 ${glow}px hsla(${hue}, 90%, 60%, 0.7)`;


setup(); // Always remember to call setup()!
