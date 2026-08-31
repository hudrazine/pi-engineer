export class SettingsStore {
  #values = new Map();

  get(key) {
    return this.#values.get(key);
  }

  set(key, value) {
    this.#values.set(key, value);
  }
}
