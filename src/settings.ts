const key = 'space-config';
const version = 1;

class Settings {
  public mode: string = 'auto';

  public persist() {
    const data = { mode: this.mode, version: version };
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
  }

  public restore() {
    const json = localStorage.getItem(key);
    if (json) {
      const data = JSON.parse(json);
      if (data.version == version) {
        this.mode = data.mode;
      }
    }
  }
}

const settings = new Settings();
settings.restore();

export default settings;
