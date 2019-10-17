import "phaser";

// global game options
let gameOptions = {};

const rocket_y = 450;

interface InputConfig {
  caller: string; // scene requesting input
  choices: string[]; // labels for choices
  correct: number; // index of the correct choice
}

export class GameScene extends Phaser.Scene {
  public msg: Phaser.GameObjects.Text;
  public elapsed: number = 0;
  public previous: number = 0; // previous elapsed
  public period: number = 2; // time per cycle
  public alien: Phaser.GameObjects.Sprite;
  public rocket: Phaser.GameObjects.Sprite;
  public particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  public emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  public canvas = document.querySelector("canvas");
  public lane = 0;
  public rocket_lane = 1;
  public sign = 1;
  public freq = 1.5;

  public inputConfig: InputConfig;

  constructor() {
    super({
      key: "GameScene"
    });
  }

  preload(): void {
    this.load.image("alien", "assets/alien.png");
    this.load.image("rocket", "assets/rocket.png");
    this.load.image("particle", "assets/particle.png");
  }

  create(): void {
    console.log("create game");
    this.alien = this.add.sprite(this.canvas.width / 2, 10, "alien");
    this.rocket = this.add.sprite(
      (3 * this.canvas.width) / 4,
      rocket_y,
      "rocket"
    );
    // Enable physics on rocket and alien sprites
    this.physics.world.enable([this.rocket, this.alien]);
    this.physics.add.overlap(
      this.rocket,
      this.alien,
      this.rocketCollideWithAlien,
      null,
      this
    );
    this.particles = this.add.particles("particle");
    this.emitter = this.particles.createEmitter({
      angle: { min: 0, max: 360 },
      speed: { min: 50, max: 200 },
      quantity: { min: 40, max: 50 },
      lifespan: { min: 200, max: 500 },
      alpha: { start: 1, end: 0 },
      scale: { min: 0.5, max: 0.5 },
      rotate: { start: 0, end: 360 },
      gravityY: 800,
      on: false
    });
    this.reset();

    // input comes back from controller here
    this.events.on("resume", (s: Phaser.Scene, d: { choice: number }) => {
      this.rocket_lane = d.choice;
    });

    /* There is a bug in run, now fixed but not yet released that makes
     * it recreate instead of restarting a paused scene. I'll work around
     * that by always resuming but I'll first need to run to get it started.
     * I'll remove this when run gets released */
    this.scene.run("ControlScene", this.inputConfig);
    this.scene.pause("ControlScene");
  }

  reset() {
    const w = this.canvas.width;
    this.elapsed = 0;
    this.lane = Phaser.Math.Between(0, 1);
    this.sign = 2 * Phaser.Math.Between(0, 1) - 1;
    this.freq = 0.5 + Math.random() * 2;
    this.rocket.x = w / 4 + (w / 2) * this.rocket_lane;
    this.alien.setVisible(true);

    this.inputConfig = {
      caller: "GameScene",
      choices: ["left", "right"],
      correct: this.lane
    };
  }

  update(time: number, delta: number) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.previous = this.elapsed;
    this.elapsed += delta * 0.001;
    // update when the period is exceeded
    if (this.elapsed > this.period) {
      this.reset();
    }
    // pause when we pass the decision time
    const decision_time = this.period * 0.5;
    if (this.previous < decision_time && this.elapsed >= decision_time) {
      this.scene.resume("ControlScene", this.inputConfig); // should be run
    }
    const u = this.elapsed / this.period;
    const goal_x = w / 4 + (this.lane * w) / 2;
    const wiggle =
      (w / 2) * (1 + this.sign * Math.sin(2 * Math.PI * this.freq * u));
    const v = Math.min(1, (h / rocket_y) * u);
    this.alien.x = (1 - v) * wiggle + v * goal_x;
    this.alien.y = this.canvas.height * u;
    const rocket_x = w / 4 + (this.rocket_lane * w) / 2;
    this.rocket.x -= (this.rocket.x - rocket_x) / 10;
  }

  rocketCollideWithAlien() {
    // Hide the alien
    this.alien.setVisible(false);

    this.particles.emitParticleAt(this.alien.x, this.alien.y);

    this.cameras.main.flash();
  }
}

export class ControlScene extends Phaser.Scene {
  public inputConfig: InputConfig;
  constructor() {
    super({
      key: "ControlScene"
    });
  }

  handleInput(inputConfig: InputConfig) {
    // request for input from another scene
    this.inputConfig = inputConfig;
    // pause the caller until we have a response for them
    this.scene.pause(this.inputConfig.caller);
  }

  init(inputConfig: InputConfig) {
    // not sure I need this, perhaps ignore?
    this.inputConfig = inputConfig;
  }

  create(): void {
    console.log("create control");
    this.input.keyboard.on("keydown-LEFT", (e: any) => {
      // pass response back to caller
      this.scene.resume(this.inputConfig.caller, { choice: 0 });
      this.scene.pause();
    });
    this.input.keyboard.on("keydown-RIGHT", (e: any) => {
      // pass response back to caller
      this.scene.resume(this.inputConfig.caller, { choice: 1 });
      this.scene.pause();
    });
    this.events.on("resume", (e: Phaser.Scene, d: InputConfig) =>
      this.handleInput(d)
    );
  }
}
