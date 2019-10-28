import "phaser";
import settings from "./settings";

interface InputConfig {
  caller: string;
  choices: string[];
  correct: number;
}

export class SwitchBase extends Phaser.Scene {
  public waiting: boolean = false; // true when waiting for input
  public callback: (v: number) => void; // call with their answer
  public correct: number; // the correct answer for auto play

  constructor(args: any) {
    super(args);
  }

  getUserInput(correct: number, func: (v: number) => void) {
    this.waiting = true;
    this.correct = correct;
    this.callback = func;
    if (settings.mode == "auto") {
      this.time.delayedCall(
        1000,
        () => {
          this.returnInput(this.correct);
        },
        [],
        this
      );
    }
  }

  returnInput(value: number) {
    // ignore if not waiting
    if (!this.waiting) {
      return;
    }
    // display the choice
    this.setSelected(value);
    // return the correct answer in one-switch mode
    if (settings.mode == "one") {
      value = this.correct;
    }
    // return the answer through the callback
    this.callback(value);
    // ignore input
    this.waiting = false;
  }

  setSelected(choice: number) {
    const choices = document.querySelectorAll("button.choice");
    let selected = document.querySelector("button.selected");
    if (selected) {
      selected.classList.remove("selected");
    }
    choices[choice].classList.add("selected");
  }

  create(): void {
    // bind left and right arrow for direct selection
    this.input.keyboard.on("keydown-LEFT", (e: any) => {
      // pass response back to caller
      this.returnInput(0);
    });
    this.input.keyboard.on("keydown-RIGHT", (e: any) => {
      // pass response back to caller
      this.returnInput(1);
    });
    // bind the buttons for direct selection
    document
      .getElementById("left")
      .addEventListener("click", e => this.returnInput(0));
    document
      .getElementById("right")
      .addEventListener("click", e => this.returnInput(1));
    // bind space for 2-switch mover
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
    // bind enter for 2-switch chooser
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
