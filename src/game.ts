import "phaser";
import { SwitchBase } from "./base";
import settings from "./settings";

export class GameScene extends SwitchBase {
  public msg: Phaser.GameObjects.Text;
  public period: number = 2000; // time per cycle
  public alien: Phaser.GameObjects.Sprite;
  public attack: Phaser.Tweens.Tween;
  public asteroid: Phaser.GameObjects.Sprite;
  public target: Phaser.GameObjects.Sprite; // alien or asteroid
  public rocket: Phaser.GameObjects.Sprite;
  public moveLeft: Phaser.Tweens.Tween;
  public moveRight: Phaser.Tweens.Tween;
  public particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  public emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  public canvas = document.querySelector("canvas");
  public rocket_y = 0;
  public score: number = 0;
  public scoreDisplay: Phaser.GameObjects.Text;
  public collider: Phaser.Physics.Arcade.Collider;
  public popSound: Phaser.Sound.WebAudioSound = null;
  public alienSound: Phaser.Sound.WebAudioSound = null;
  public explodeSound: Phaser.Sound.WebAudioSound = null;

  constructor() {
    super({
      key: "GameScene"
    });
  }

  preload(): void {
    // this.load.image("alien", "assets/alien.png");
    this.load.spritesheet("alien", "assets/alien-sheet.png", {
      frameWidth: 73,
      frameHeight: 44,
      startFrame: 0,
      endFrame: 39
    });
    this.load.spritesheet("asteroid", "assets/asteroid-sheet.png", {
      frameWidth: 120,
      frameHeight: 120,
      startFrame: 0,
      endFrame: 15
    });
    this.load.image("rocket", "assets/rocket.png");
    this.load.image("particle", "assets/particle.png");
    if (settings.sound) {
      this.load.audio("pop", "assets/success.mp3");
      this.load.audio("alienSound", "assets/alien.mp3");
      this.load.audio("explodeSound", "assets/explode.mp3");
    }
  }

  create(): void {
    super.create();
    console.log("create game");
    this.scoreDisplay = this.add.text(20, 20, "0", { fontSize: 20 });
    this.rocket_y = this.canvas.height * 0.9;
    this.alien = this.add.sprite(this.canvas.width / 2, 10, "alien");
    for (let i = 0; i < 10; i++) {
      let name = `ship${i}`;
      let a = this.anims.create({
        key: name,
        frames: this.anims.generateFrameNumbers("alien", {
          start: i * 4,
          end: i * 4 + 3
        }),
        frameRate: 10,
        repeat: -1
      });
      this.alien.anims.load(name);
    }
    this.asteroid = this.add.sprite(0, 0, "asteroid");
    let anim = this.anims.create({
      key: "spin",
      frames: this.anims.generateFrameNumbers("asteroid", {}),
      frameRate: 20,
      repeat: -1
    });
    this.asteroid.anims.load("spin");
    this.asteroid.anims.play("spin");
    this.rocket = this.add.sprite(
      (3 * this.canvas.width) / 4,
      this.rocket_y,
      "rocket"
    );
    this.rocket.setScale(0.5);
    this.moveLeft = this.tweens.add({
      targets: this.rocket,
      props: {
        x: { value: this.canvas.width / 4, duration: 500 },
        rotation: {
          value: -Math.PI / 2,
          duration: 250,
          yoyo: true,
          repeat: 0,
          ease: "Sine.easeInOut"
        }
      },
      paused: true
    });
    this.moveRight = this.tweens.add({
      targets: this.rocket,
      props: {
        x: { value: (3 * this.canvas.width) / 4, duration: 500 },
        rotation: { value: Math.PI / 2, duration: 250, yoyo: true, repeat: 0 }
      },
      paused: true
    });

    // Enable physics on rocket and alien sprites
    this.physics.world.enable([this.rocket, this.alien, this.asteroid]);
    this.collider = this.physics.add.overlap(
      this.rocket,
      [this.alien, this.asteroid],
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

    if (settings.sound) {
      this.popSound = <Phaser.Sound.WebAudioSound>this.sound.add("pop");
      this.alienSound = <Phaser.Sound.WebAudioSound>(
        this.sound.add("alienSound")
      );
      this.alienSound.setLoop(true);
      this.alienSound.play();
      this.explodeSound = <Phaser.Sound.WebAudioSound>(
        this.sound.add("explodeSound")
      );
    }

    const starPeriod = 4 * this.period;
    for (let s = 0; s < 100; s++) {
      let star = this.add.graphics();
      star.fillStyle(0xffffff);
      star.fillPoint(Phaser.Math.Between(0, this.canvas.width), 0, 2);
      this.tweens.add({
        targets: star,
        duration: starPeriod,
        delay: Phaser.Math.Between(0, starPeriod),
        repeat: -1,
        repeatDelay: Phaser.Math.Between(100, 500),
        y: this.canvas.height,
        onRepeat: () => {
          star.x = Phaser.Math.Between(0, this.canvas.width);
        }
      });
    }
  }

  reset() {
    const w = this.canvas.width;
    const lane = Phaser.Math.Between(0, 1);
    const sign = 2 * Phaser.Math.Between(0, 1) - 1;
    const freq = 0.5 + Math.random() * 2;
    if (this.score < 20 || Math.random() > 0.2) {
      this.target = this.alien;
      const name = `ship${Phaser.Math.Between(0, 9)}`;
      this.alien.anims.play(name);
      this.asteroid.y = -100;
      if (this.alienSound) {
        this.alienSound.setSeek(0);
        this.alienSound.setRate(freq);
        this.alienSound.play();
      }
    } else {
      this.target = this.asteroid;
      this.alien.y = -100;
      if (this.alienSound) this.alienSound.stop();
    }
    this.target.y = 0;
    this.attack = this.tweens.add({
      key: "attack",
      targets: this.target,
      y: this.canvas.height,
      onUpdate: (
        tween: Phaser.Tweens.Tween,
        target: Phaser.GameObjects.Sprite
      ) => {
        const u = target.y / this.canvas.height;
        const goal_x = this.canvas.width * (1 / 4 + lane / 2);
        const wiggle =
          this.canvas.width *
          (1 / 2 +
            (Math.min(10, this.score) / 20) *
              (sign * Math.sin(2 * Math.PI * freq * u)));
        const v = Math.min(1, target.y / this.rocket_y);
        target.x = (1 - v) * wiggle + v * goal_x;
        if (this.alienSound) this.alienSound.setVolume(u);
      },
      onComplete: () => this.reset(),
      duration: this.period
    });
    this.target.setVisible(true);
    this.collider.active = true;
    this.time.delayedCall(
      this.period / 2,
      () => {
        this.attack.pause();
        this.getUserInput(
          this.target === this.alien ? lane : 1 - lane,
          (v: number) => {
            this.attack.resume();
            const rocket_x = w / 4 + (v * w) / 2;
            if (this.rocket.x < rocket_x) {
              this.moveRight.play();
            } else if (this.rocket.x > rocket_x) {
              this.moveLeft.play();
            }
          }
        );
      },
      [],
      this
    );
  }

  rocketCollideWithAlien() {
    if (this.target == this.alien) {
      if (this.popSound) this.popSound.play();
      this.cameras.main.flash();
      this.score += 1;
    } else {
      if (this.explodeSound) this.explodeSound.play();
      this.cameras.main.flash(500, 255, 0, 0);
      this.score -= 1;
    }
    // Hide the target
    this.target.visible = false;
    // prevent multiple collisions
    this.collider.active = false;
    // blowup
    this.particles.emitParticleAt(this.target.x, this.target.y);
    // display score
    this.scoreDisplay.setText("" + this.score);
  }
}
