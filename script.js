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

console.log("script.js is running");

// ---------- Settings ----------
const settings = {
  notes: ["C4", "D4", "E4", "G4", "A4"],
  noteLength: "8n",
  loopInterval: 350,
  minInterval: 150,
  maxInterval: 500,
};

// ---------- State ----------
let shape;
let x = 0;
let y = 0;
let previousX = 0;
let previousY = 0;
let lastMoveTime = 0;
let speed = 0;
let isDragging = false;
let noteIndex = 0;

// ---------- Sound ----------
const synth = new Tone.PolySynth(Tone.Synth).toDestination();
synth.volume.value = -24;

// ---------- Update ----------
function update() {
  // Keep the update loop running
  setTimeout(update, settings.loopInterval);
}

// ---------- Use ----------
function use() {
  if (isDragging && shape) {
    shape.setPositionPixels(x - shape.width / 2, y - shape.height / 2);
  }

  window.requestAnimationFrame(use);
}

// ---------- Play Notes ----------
function playNextNote() {
  if (!isDragging) return;

  // If movement stops, gradually return to quiet, slower notes
  const timeSinceMove = performance.now() - lastMoveTime;

  if (timeSinceMove > 150) {
    synth.volume.rampTo(-24, 0.3);
    settings.loopInterval = 350;
  }

  const note = settings.notes[noteIndex];

  synth.triggerAttackRelease(note, settings.noteLength);

  noteIndex = (noteIndex + 1) % settings.notes.length;

  // Use the latest interval for the next note
  setTimeout(playNextNote, settings.loopInterval);
}

// ---------- Pointer Down ----------
async function pointerDown(event) {
  if (isDragging) return;

  isDragging = true;

  x = event.clientX;
  y = event.clientY;
  previousX = x;
  previousY = y;
  lastMoveTime = performance.now();
  speed = 0;

  await Tone.start();

  synth.volume.rampTo(-24, 0.2);
  playNextNote();
}

// ---------- Pointer Up ----------
function pointerUp() {
  isDragging = false;

  synth.volume.rampTo(-24, 0.4);
  settings.loopInterval = 350;

  console.log("Pointer up");
}

// ---------- Pointer Move ----------
function pointerMove(event) {
  const now = performance.now();

  x = event.clientX;
  y = event.clientY;

  // Do not change the sound unless the circle is being dragged
  if (!isDragging) {
    previousX = x;
    previousY = y;
    lastMoveTime = now;
    return;
  }

  // Measure the distance moved
  const dx = x - previousX;
  const dy = y - previousY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate speed in pixels per second
  const elapsed = Math.max(1, now - lastMoveTime);
  speed = (distance / elapsed) * 1000;

  // Convert speed into an intensity between 0 and 1
  const intensity = Math.min(1, speed / 1000);

  // Slow movement = quiet; fast movement = louder
  const targetVolume = -24 + intensity * 18;
  synth.volume.rampTo(targetVolume, 0.3);

  // Slow movement = slower notes; fast movement = faster notes
  settings.loopInterval =
    settings.maxInterval -
    intensity * (settings.maxInterval - settings.minInterval);

  // Remember this position and time
  previousX = x;
  previousY = y;
  lastMoveTime = now;
}

// ---------- Setup ----------
function setup() {
  console.log("Setup started");

  shape = createShape("shape");

  shape
    .setSize(100)
    .setRoundedness(1)
    .setColour(210, 100, 50)
    .setPosition(0.5, 0.5);

  console.log("Shape element:", shape.element);

  shape.element.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointerup", pointerUp);
  window.addEventListener("pointermove", pointerMove);

  update();
  use();
}

setup();
