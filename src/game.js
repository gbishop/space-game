/** @typedef {import('phaser')} Phaser */
import { SwitchBase } from "./base.js";
import settings from "./settings.js";

// time for the attack
const period = 2000;
// height of the rocket
const rocketYFraction = 0.9;

export class GameScene extends SwitchBase {
  constructor() {
    super({
      key: "GameScene"
    });
    this.canvas = document.querySelector("canvas");
    this.score = 0;
    this.popSound = null;
    this.alienSound = null;
    this.explodeSound = null;
    // cast this once so I don't have to below
    // shouldn't I be able to just assert this?
    this.sound = /** @type {Phaser.Sound.WebAudioSoundManager} */ (super.sound);
  }

  preload() {
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
    this.load.spritesheet("rocket", "assets/rocket-sheet.png", {
      frameWidth: 110,
      frameHeight: 246,
      startFrame: 0,
      endFrame: 2
    });
    this.load.image("particle", "assets/particle.png");
    if (settings.sound) {
      this.load.audio("pop", "assets/success.mp3");
      this.load.audio("alienSound", "assets/alien.mp3");
      this.load.audio("explodeSound", "assets/explode.mp3");
    }
  }

  create() {
    super.create();

    // moving stars to give a sense of motion
    const starPeriod = 4 * period;
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

    // score
    this.scoreDisplay = this.add.text(20, 20, "0", { fontSize: 20 });

    // alien ships
    this.alien = this.add.sprite(this.canvas.width / 2, -20, "alien");
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

    // asteroid
    this.asteroid = this.add.sprite(this.canvas.width / 2, -20, "asteroid");
    this.anims.create({
      key: "spin",
      frames: this.anims.generateFrameNumbers("asteroid", {}),
      frameRate: 20,
      repeat: -1
    });
    this.asteroid.anims.load("spin");
    this.asteroid.anims.play("spin");

    // rocket
    this.rocket = this.add.sprite(
      (3 * this.canvas.width) / 4,
      rocketYFraction * this.canvas.height,
      "rocket"
    );
    this.rocket.setScale(0.5);
    this.anims.create({
      key: "flicker",
      frames: this.anims.generateFrameNumbers("rocket", {}),
      frameRate: 15,
      repeat: -1
    });
    this.rocket.anims.load("flicker");
    this.rocket.anims.play("flicker");

    // Enable physics on rocket and alien sprites
    this.physics.world.enable([this.rocket, this.alien, this.asteroid]);
    this.collider = this.physics.add.overlap(
      this.rocket,
      [this.alien, this.asteroid],
      this.rocketCollideWithAlien,
      null,
      this
    );

    // blow up the alien
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

    // control sound
    if (settings.sound) {
      this.popSound = this.sound.add("pop");
      this.alienSound = this.sound.add("alienSound");
      this.alienSound.setLoop(true);
      this.explodeSound = this.sound.add("explodeSound");
    }
  }

  reset() {
    this.clearSelected();

    const w = this.canvas.width;

    // reposition the rocket
    this.tweens.add({
      targets: this.rocket,
      props: {
        x: { value: w / 2, duration: period / 4 },
        rotation: {
          value: (Math.sign(w / 2 - this.rocket.x) * Math.PI) / 4,
          duration: period / 8,
          yoyo: true
        },
        y: { value: rocketYFraction * this.canvas.height }
      },
      onComplete: () => this.beginAttack()
    });
  }

  beginAttack() {
    const w = this.canvas.width;
    // choose the next correct answer
    const lane = Phaser.Math.Between(0, 1);
    // initial direction of flight
    const sign = 2 * Phaser.Math.Between(0, 1) - 1;
    // curvyness
    const freq = 0.5 + Math.random() * 2;
    // choose an alien ship or an asteroid
    if (this.score < 20 || Math.random() > Math.min(0.5, this.score / 200)) {
      this.target = this.alien;
      // choose a random ship from the sheet
      const name = `ship${Phaser.Math.Between(0, 9)}`;
      this.alien.anims.play(name);
      // move asteroid out of the way
      this.asteroid.y = -100;
      if (this.alienSound) {
        this.alienSound.setSeek(0);
        this.alienSound.setRate(freq);
        this.alienSound.setVolume(0);
        this.alienSound.play();
      }
    } else {
      this.target = this.asteroid;
      // move alien out of the way
      this.alien.y = -100;
      if (this.alienSound) this.alienSound.stop();
    }
    // start at the top
    this.target.y = -20;
    // construct the objects path
    this.attack = this.tweens.add({
      key: "attack",
      targets: this.target,
      y: this.canvas.height,
      onUpdate: (tween, target) => {
        const v = Math.min(
          1,
          target.y / (rocketYFraction * this.canvas.height)
        ); // 0 to 1
        const goal_x = w * (1 / 4 + lane / 2); // x of the lane
        // a sine wave to wiggle the attacker
        const wiggle =
          w *
          (1 / 2 +
            (Math.min(10, this.score) / 20) *
              (sign * Math.sin(2 * Math.PI * freq * v)));
        // linear interpolation between direct path and wiggle
        target.x = (1 - v) * wiggle + v * goal_x;
        // adjust the volume
        if (this.alienSound) this.alienSound.setVolume(v);
      },
      onComplete: () => {
        this.target.setVisible(false);
        this.reset();
      },
      duration: period
    });
    // make the attacker visible
    this.target.setVisible(true);
    // make sure we collide
    this.collider.active = true;
    // stop half way down so the user can input
    this.time.delayedCall(
      period / 2,
      () => {
        // pause the attack
        this.attack.pause();
        // get input
        this.getUserInput(
          this.target === this.alien ? lane : 1 - lane, // correct answer
          v => {
            // once we get the input resume the attack
            this.attack.resume();
            // move the rocket if necessary
            const rocket_x = w * (1 / 4 + v / 2);
            if (this.rocket.x < rocket_x) {
              this.tweens.add({
                targets: this.rocket,
                props: {
                  x: { value: (3 * w) / 4, duration: period / 4 },
                  rotation: {
                    value: Math.PI / 4,
                    duration: period / 8,
                    yoyo: true
                  }
                }
              });
            } else if (this.rocket.x > rocket_x) {
              this.tweens.add({
                targets: this.rocket,
                props: {
                  x: { value: w / 4, duration: period / 4 },
                  rotation: {
                    value: -Math.PI / 4,
                    duration: period / 8,
                    yoyo: true
                  }
                }
              });
            }
          }
        );
      },
      [],
      this
    );
  }

  rocketCollideWithAlien() {
    this.alienSound.stop();
    if (this.target == this.alien) {
      if (this.popSound) this.popSound.play();
      this.cameras.main.flash();
      this.score += 1;
    } else {
      if (this.explodeSound) this.explodeSound.play();
      this.cameras.main.flash(500, 255, 0, 0);
      this.score -= Math.floor(this.score / 10);
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
