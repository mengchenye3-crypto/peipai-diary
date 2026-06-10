/* 时间计算工具函数 */

/**
 * 将 "HH:MM" 格式转为分钟数（从 00:00 起）
 * @param {string} time - "HH:MM"
 * @returns {number}
 */
export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * 将分钟数转为 "HH:MM" 格式
 * @param {number} minutes
 * @returns {string}
 */
export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * 在指定时间上加若干分钟，返回 "HH:MM"
 * @param {string} time - "HH:MM"
 * @param {number} addMin - 要加的分钟数
 * @returns {string}
 */
export function addMinutes(time, addMin) {
  return minutesToTime(timeToMinutes(time) + addMin);
}

/**
 * 获取某月的所有日期格子（含前后补位）
 * 返回数组，每项 { date: Date, currentMonth: boolean }
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {Array}
 */
export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 周一为第一列（0=周一 … 6=周日）
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days = [];

  // 补前面的空格
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, currentMonth: false });
  }

  // 当月日期
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), currentMonth: true });
  }

  // 补后面的空格（凑满6行 = 42格）
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), currentMonth: false });
  }

  return days;
}

/**
 * 格式化日期为 "YYYY-MM-DD"
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 判断两个日期是否是同一天
 * @param {Date} a
 * @param {Date} b
 * @returns {boolean}
 */
export function isSameDay(a, b) {
  return formatDate(a) === formatDate(b);
}

/**
 * 获取某日期所在周的周一（本地时间）
 * @param {Date} date
 * @returns {Date}
 */
export function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();                // 0=周日 … 6=周六
  const diff = (day + 6) % 7;           // 距周一的天数
  d.setDate(d.getDate() - diff);
  return d;
}

/**
 * 获取某周的 7 个日期（周一 → 周日）
 * @param {Date} date - 周内任意一天
 * @returns {Date[]}
 */
export function getWeekDays(date) {
  const monday = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/**
 * 计算两个 "HH:MM" 时间之间的分钟差
 * @param {string} start
 * @param {string} end
 * @returns {number}
 */
export function diffMinutes(start, end) {
  return timeToMinutes(end) - timeToMinutes(start);
}

/**
 * 将分钟数对齐到最近的 N 分钟
 * @param {number} minutes
 * @param {number} step - 默认 15
 * @returns {number}
 */
export function snapMinutes(minutes, step = 15) {
  return Math.round(minutes / step) * step;
}
