/* 应用设置的 localStorage 读写 */

const KEY = 'peipai_settings';

const DEFAULTS = {
  hourlyRate: 0, // 时薪（元/小时），0 表示未设置
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
