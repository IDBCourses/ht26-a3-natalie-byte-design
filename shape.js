
const circleSettings = {
  normalSize: 200,
  minSize: 190,
  maxSize: 260
};

//SETUP: Finding the circle on the page
export function setupShape() {
  const circle = document.querySelector("#circle");

  circle.style.width = `${circleSettings.normalSize}px`;
  circle.style.height = `${circleSettings.normalSize}px`;

  return circle;
}
//UPDATE: Change the circle immediately in response to movement
export function updateShape(circle, speed, direction) {
  const size = Math.max(
    circleSettings.minSize,
    Math.min(
      circleSettings.maxSize,
      circleSettings.normalSize + speed * 2
    )
  );
  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;
}

// Direction changes the circle's border.
if (direction > 0) {
  circle.style.borderColor = "#ff9f68";
} else if (direction < 0) {
  circle.style.borderColor = "#8b9dff";
}
//Faster movement gives the circle stronger glow
const glow = Math.min(speed * 2, 25);
circle.style.boxShadow =
`0 0 ${glow}px rgba(139, 157, 255, 0.8)`;

