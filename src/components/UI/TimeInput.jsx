/* 自定义 24 小时制时间输入器，彻底避免浏览器 AM/PM */
import { useState, useEffect, useRef } from 'react';
import './TimeInput.css';

/**
 * @param {string}   value    - "HH:MM" 或 ""
 * @param {Function} onChange - 回调，参数为 "HH:MM" 或 ""
 * @param {boolean}  error    - 是否错误状态
 * @param {string}   [id]
 */
export default function TimeInput({ value, onChange, error, id }) {
  const [h, setH] = useState('');
  const [m, setM] = useState('');
  const minRef = useRef(null);
  /* 记录上一次自己发出的值，防止 useEffect 把自己的回显当外部重置 */
  const lastEmitted = useRef('');

  /* 外部 value 同步到内部（跳过自己发出去又回来的回显） */
  useEffect(() => {
    if (value === lastEmitted.current) return;
    if (value && /^\d{2}:\d{2}$/.test(value)) {
      setH(value.slice(0, 2));
      setM(value.slice(3, 5));
    } else {
      setH(''); setM('');
    }
  }, [value]);

  /* 触发父组件更新 */
  const emit = (hVal, mVal) => {
    const hOk = hVal !== '' && !isNaN(parseInt(hVal));
    const mOk = mVal !== '' && !isNaN(parseInt(mVal));
    const next = (hOk && mOk)
      ? `${String(parseInt(hVal)).padStart(2,'0')}:${String(parseInt(mVal)).padStart(2,'0')}`
      : '';
    lastEmitted.current = next;
    onChange(next);
  };

  /* 从 nativeEvent.data 提取单个数字字符（移动端安全） */
  const getChar = (e) => (e.nativeEvent?.data ?? '').replace(/\D/g, '');

  /* 小时输入：用追加方式，避免光标位置影响 */
  const handleH = (e) => {
    const char = getChar(e);
    if (!char) {
      /* 删除/清空：直接读 target.value */
      const v = e.target.value.replace(/\D/g, '').slice(0, 2);
      setH(v); emit(v, m);
      return;
    }
    /* 把新字符追加到当前小时值，忽略光标位置 */
    const next = (h + char).slice(0, 2);
    const n = parseInt(next);
    if (!isNaN(n) && n >= 0 && n <= 23) {
      setH(next); emit(next, m);
      if (next.length === 2) minRef.current?.focus();
    }
    /* 超出范围（如 31）：只保留新字符作为新的个位数起点 */
    else if (next.length === 2) {
      setH(char); emit(char, m);
    }
  };

  /* 分钟输入：同上 */
  const handleM = (e) => {
    const char = getChar(e);
    if (!char) {
      const v = e.target.value.replace(/\D/g, '').slice(0, 2);
      setM(v); emit(h, v);
      return;
    }
    const next = (m + char).slice(0, 2);
    const n = parseInt(next);
    if (!isNaN(n) && n >= 0 && n <= 59) {
      setM(next); emit(h, next);
    } else if (next.length === 2) {
      setM(char); emit(h, char);
    }
  };

  /* 失焦补零 */
  const padH = () => { if (h !== '') { const p = String(parseInt(h)).padStart(2,'0'); setH(p); emit(p, m); } };
  const padM = () => { if (m !== '') { const p = String(parseInt(m)).padStart(2,'0'); setM(p); emit(h, p); } };

  /* 上下键步进 */
  const stepH = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const cur = h === '' ? 0 : parseInt(h);
      const next = e.key === 'ArrowUp' ? Math.min(23, cur + 1) : Math.max(0, cur - 1);
      const p = String(next).padStart(2, '0');
      setH(p); emit(p, m);
    }
  };

  const stepM = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const cur = m === '' ? 0 : parseInt(m);
      const next = e.key === 'ArrowUp' ? Math.min(59, cur + 1) : Math.max(0, cur - 1);
      const p = String(next).padStart(2, '0');
      setM(p); emit(h, p);
    }
  };

  return (
    <div className={`time-input ${error ? 'time-input--error' : ''}`} id={id}>
      <input
        className="time-seg"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="HH"
        maxLength={2}
        value={h}
        onChange={handleH}
        onBlur={padH}
        onKeyDown={stepH}
        aria-label="小时（0-23）"
      />
      <span className="time-colon">:</span>
      <input
        ref={minRef}
        className="time-seg"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="MM"
        maxLength={2}
        value={m}
        onChange={handleM}
        onBlur={padM}
        onKeyDown={stepM}
        aria-label="分钟（0-59）"
      />
    </div>
  );
}
