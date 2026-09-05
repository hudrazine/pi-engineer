const settings = new Map();

export const getSetting = (key) => settings.get(key);
export const setSetting = (key, value) => settings.set(key, value);
