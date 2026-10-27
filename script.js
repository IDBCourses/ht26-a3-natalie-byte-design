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
import { setupShape, updateShape } from "./shape.js";

// SETTING
const settings = {
  notes: ["C4", "D4", "E4", "G4", "A4", "C5", "D5"],
  movementThreshold: 22,
  noteLength: "8n"
};

// STATE: Remembers Pointer Movement over Time.
const state = {
  isPlaying: false,
  lastX: 0,
  lastY: 0,
  lastTime: 0,
  distance: 0,
  direction: 0,
  speed: 0
};

// SETUP
const circle = setupShape();
const status = document.querySelector("#status");

const filter = new Tone.Filter(1200, "lowpass");
const synth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: {
    attack: 0.03,
    decay: 0.15,
    sustain: 0.3,
    release: 0.2
  }
});

synth.connect(filter);
filter.toDestination();

//USE: Convert Pointer Position Into a Musical Note.
function playNote(x, y) {
  const rect = circle.getBoundingClientRect();

  const horizontalPosition = Math.max(
    0,
    Math.min(0.999, (x - rect.left) / rect.width)
  );
}
const noteIndex = Math.floor(
  horizontalPosition * settings.notes.length
);
const note = settings.notes[noteIndex];

//vertical position changes sound brightness.
const verticalPosition = Math.max(
  0,
  Math.min(1, (y - rect.top) / rect.height)
);
filter.frequency.value =
400 + (1 - verticalPosition) * 4600;

// Speed changes how strongly the note is played
const velocity = Math.max(
  0.2,
  Math.min(1, 0.35 + state.speed / 30)
);
synth.triggerAttackRelease(
  note,
  settings.noteLength,
  undefined,
  velocity
);

status.textContent =
`Note: ${note} | Speed: ${state.speed.toFixed(1)}`;

//Pointer Down: Start the instrument.
circle.addEventListener("pointerdown", async (event) => {
event.preventDefault();

await Tone.start();

circle.setPointerCapture(event.pointerId);

state.isPlaying = true;
state.lastX = event.clientX;
state.lastY = event.clientY;
state.lastTime = event.timeStamp;
state.distance = 0;
state.direction = 0;
state.speed = 0;

playNote(event.clientX, event.clientY);
});

// Pointer Move: Process a history of movement.
circle.addEventListener("pointermove", (event) => {
  if (!state.isPlaying) return;

  event.preventDefault();

  const dx = event.clientX - state.lastX;
  const dy = event.clientY - state.lastY;

  const distance = Math.hypot(dx, dy);
  const elapsed = Math.max(
    1,
    event.timeStamp - state.lastTime
  );
}

// Calculate speed using distance and elapsed time.
state.speed = distance / elapsed * 10;

//Remember whether the pointer moves left or right
if (dx > 0) state.direction = 1;
if (dx < 0) state.direction = -1;

// Accumulate distance across multiple pointer events.
state.distance += distance;

// Updates the visual immediately, no animation.
updateShape(circle, state.speed, state.direction);

// Plays a note after enough movement has occured.
if (state.disstance >= settings.movementThreshold) {
  playNote(Event.clientX, Event.clientY);
  state.distance = 0;
}
// Saves this for the next movement calculation.
state.lastX = Event.clientX;
state.lastY = Event.clientY;
state.lastTime = Event.timeStamp;

//POINTER UP: Stops generating new notes.
function stopPlaying() {
  state.isPlaying = false;
  status.textContent = "Press the circle to play again";
}

circle.addEventListener("pointerup", stopPlaying);
circle.addEventListener("pointercancel", stopPlaying);
setup(); // Always remember to call setup()!
