import "phaser";
import { ControlScene } from "./base";
import { GameScene } from "./game";

const config: Phaser.Types.Core.GameConfig = {
  title: "Space",
  type: Phaser.AUTO,
  width: 600,
  height: 800,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  parent: "play",
  scene: [GameScene, ControlScene],
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
  document
    .getElementById("setup")
    .addEventListener("click", () => (location.pathname = "settings.html"));
  var game = new MyGame(config);
};
