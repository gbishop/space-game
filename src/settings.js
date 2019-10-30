const key = "space-config";
const version = 2;

class Settings {
    constructor() {
        this.mode = "auto";
        this.sound = true;
        this.asteroids = true;
    }

    persist() {
        const data = {
            version: version,
            mode: this.mode,
            sound: this.sound,
            asteroids: this.asteroids
        };
        const json = JSON.stringify(data);
        localStorage.setItem(key, json);
    }

    restore() {
        const json = localStorage.getItem(key);
        if (json) {
            const data = JSON.parse(json);
            if (data.version == version) {
                this.mode = data.mode;
                this.sound = data.sound;
                this.asteroids = data.asteroids;
            }
        }
    }
}

const settings = new Settings();
settings.restore();

export default settings;
