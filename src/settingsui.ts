import settings from "./settings";

window.onload = () => {
  console.log("settingsui");

  [...document.querySelectorAll("input[name=mode]")].map(
    (node: HTMLInputElement) => (node.checked = node.value == settings.mode)
  );
  const soundInput = <HTMLInputElement>document.getElementById("sound");
  soundInput.checked = settings.sound;
  const asteroidsInput = <HTMLInputElement>document.getElementById("asteroids");
  asteroidsInput.checked = settings.asteroids;

  document.getElementById("settings").addEventListener("change", e => {
    console.log("change");
    const modeInput = <HTMLInputElement>(
      document.querySelector("input[name=mode]:checked")
    );
    const mode = modeInput.value;
    settings.mode = mode;
    const soundInput = <HTMLInputElement>document.getElementById("sound");
    settings.sound = soundInput.checked;
    const asteroidsInput = <HTMLInputElement>(
      document.getElementById("asteroids")
    );
    settings.asteroids = asteroidsInput.checked;
    settings.persist();
  });

  document.getElementById("playButton").addEventListener("click", () => {
    location.pathname = "index.html";
  });
};
