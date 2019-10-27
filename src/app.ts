import "phaser";
import { GameScene } from "./game";
import settings from "./settings";

const config: Phaser.Types.Core.GameConfig = {
  title: "Space",
  type: Phaser.AUTO,
  width: 600,
  height: 800,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  parent: "game",
  scene: [GameScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  backgroundColor: "#444444"
};

export class MyGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.onload = () => {
  let game: Phaser.Game = null;
  document.getElementById("setup").addEventListener("click", () => {
    if (game) {
      game.destroy(true);
      game = null;
    }
    document.body.classList.value = "settings";
  });
  document.getElementById("playButton").addEventListener("click", () => {
    document.body.classList.value = "play";
    game = new MyGame(config);
  });

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
};
