import "phaser";

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({
      key: "IntroScene"
    });
  }

  create(): void {
    this.add.text(20, 20, "This is a test.");
  }
}
