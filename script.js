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
  loopInterval: 250,
};
// ---------- State ----------

let shape;
let x = 0;
let y = 0;
let isDragging = false;
let noteIndex = 0;

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once

// ---------- Update ----------
// Update the state. This is called every 200ms.
function update() {
  setTimeout(update, settings.loopInterval);
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  if (isDragging && shape) {
    shape.setPositionPixels(x - shape.width / 2, y - shape.height / 2);
  }
  window.requestAnimationFrame(use);
}
// ---------- Controls (Event Handlers) ----------
// Start the continous sound loop.
async function pointerDown(event) {
  if (isDragging) return;

  isDragging = true;
  console.log("pointer down");

  await Tone.start();
  playNextNote();
}
// Play notes repeatedly while pointer is held in place.
function playNextNote() {
  if (!isDragging) return;
  const note = settings.notes[noteIndex];
  synth.triggerAttackRelease(note, settings.noteLength);
  noteIndex = (noteIndex + 1) % settings.notes.length;
  setTimeout(playNextNote, settings.loopInterval);
}
// Stop the loop when pointer is released.
function pointerUp(event) {
  isDragging = false;
  console.log("Pointer up");
}
// Track pointer movement over time.
function pointerMove(event) {
  x = event.clientX;
  y = event.clientY;
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

setup(); // Always remember to call setup()!
