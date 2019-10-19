import "phaser";

interface InputConfig {
  caller: string;
  choices: string[];
  correct: number;
}

export class SwitchBase extends Phaser.Scene {
  public initialized: boolean = false;
  public callback: (v: number) => void;

  constructor(args: any) {
    super(args);
  }

  getUserInput(choices: string[], correct: number, func: (v: number) => void) {
    if (!this.initialized) {
      this.events.on("resume", (s: Phaser.Scene, d: { choice: number }) =>
        this.userInput(d.choice)
      );
      /* There is a bug in run, now fixed but not yet released that makes
       * it recreate instead of restarting a paused scene. I'll work around
       * that by always resuming but I'll first need to run to get it started.
       * I'll remove this when run gets released */
      this.scene.run("ControlScene");
      this.scene.pause("ControlScene");
      this.initialized = true;
    }
    let inputConfig = { caller: this.scene.key, choices, correct };
    this.scene.resume("ControlScene", inputConfig);
    this.scene.pause();
    this.callback = func;
  }

  userInput(choice: number) {
    // this method will be called with the user's response
    this.callback(choice);
  }
}

export class ControlScene extends Phaser.Scene {
  public inputConfig: InputConfig;
  constructor() {
    super({
      key: "ControlScene"
    });
  }

  returnInput(value: number) {
    this.scene.resume(this.inputConfig.caller, { choice: value });
    this.scene.pause();
  }

  create(): void {
    console.log("create control");
    this.input.keyboard.on("keydown-LEFT", (e: any) => {
      // pass response back to caller
      this.returnInput(0);
    });
    this.input.keyboard.on("keydown-RIGHT", (e: any) => {
      // pass response back to caller
      this.returnInput(1);
    });
    this.events.on("resume", (e: Phaser.Scene, d: InputConfig) => {
      this.inputConfig = d;
      this.scene.pause(d.caller);
    });
    document
      .getElementById("left")
      .addEventListener("click", e => this.returnInput(0));
    document
      .getElementById("right")
      .addEventListener("click", e => this.returnInput(1));
    this.input.keyboard.on("keydown-SPACE", (e: any) => {
      const choices = document.querySelectorAll("button.choice");
      let selected = document.querySelector("button.selected");
      let i = 0;
      if (selected) {
        i = ([...choices].indexOf(selected) + 1) % choices.length;
        selected.classList.remove("selected");
      }
      choices[i].classList.add("selected");
    });
    this.input.keyboard.on("keydown-ENTER", (e: any) => {
      const selected = <HTMLButtonElement>(
        document.querySelector("button.selected")
      );
      if (selected) {
        selected.click();
      }
    });
  }
}
