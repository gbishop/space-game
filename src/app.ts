import "phaser";
import { ControlScene } from "./base";
import { GameScene } from "./game";

const config: Phaser.Types.Core.GameConfig = {
  title: "Runner",
  type: Phaser.AUTO,
  width: 600,
  height: 800,
  /*
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }, */
  parent: "game",
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
  var game = new MyGame(config);
};
