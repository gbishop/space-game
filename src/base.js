/**
 * @typedef {import('phaser') Phaser
 */
// import "phaser";
import settings from "./settings.js";

export class SwitchBase extends Phaser.Scene {
    constructor(args) {
        super(args);
        this.waiting = false; // true when waiting for input
    }

    getUserInput(correct, func) {
        this.waiting = true;
        this.correct = correct;
        this.callback = func;
        if (settings.mode == "auto") {
            this.time.delayedCall(1000, () => {
                this.returnInput(this.correct);
            }, [], this);
        }
    }

    returnInput(value) {
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

    setSelected(choice) {
        const choices = document.querySelectorAll("button.choice");
        let selected = document.querySelector("button.selected");
        if (selected) {
            selected.classList.remove("selected");
        }
        choices[choice].classList.add("selected");
    }

    create() {
        // bind left and right arrow for direct selection
        this.input.keyboard.on("keydown-LEFT", (e) => {
            // pass response back to caller
            this.returnInput(0);
        });
        this.input.keyboard.on("keydown-RIGHT", (e) => {
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
        this.input.keyboard.on("keydown-SPACE", (e) => {
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
        this.input.keyboard.on("keydown-ENTER", (e) => {
            const selected = (document.querySelector("button.selected"));
            if (selected) {
                selected.click();
            }
        });
    }
}
