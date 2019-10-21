import settings from "./settings";

window.onload = () => {
  console.log("settingsui");

  [...document.querySelectorAll("input[name=mode]")].map(
    (node: HTMLInputElement) => (node.checked = node.value == settings.mode)
  );
  document.getElementById("settings").addEventListener("change", e => {
    console.log("change");
    const modeInput = <HTMLInputElement>(
      document.querySelector("input[name=mode]:checked")
    );
    const mode = modeInput.value;
    settings.mode = mode;
    settings.persist();
  });

  document.getElementById("playButton").addEventListener("click", () => {
    location.pathname = "index.html";
  });
};
