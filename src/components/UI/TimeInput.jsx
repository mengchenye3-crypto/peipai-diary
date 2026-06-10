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

  /* 用 ref 保存最新值：handler 读 ref，不读闭包里可能过期的 state */
  const hRef = useRef('');
  const mRef = useRef('');
  /* 记录上一次自己发出的值，防止父组件回显触发 useEffect 清空 */
  const lastEmitted = useRef('');

  /* 外部 value 同步进来（跳过自己发出去的回显） */
  useEffect(() => {
    if (value === lastEmitted.current) return;
    if (value && /^\d{2}:\d{2}$/.test(value)) {
      hRef.current = value.slice(0, 2);
      mRef.current = value.slice(3, 5);
      setH(hRef.current);
      setM(mRef.current);
    } else {
      hRef.current = '';
      mRef.current = '';
      setH('');
      setM('');
    }
  }, [value]);

  const pad = (v) => String(parseInt(v, 10)).padStart(2, '0');

  const emit = (hVal, mVal) => {
    const hOk = hVal !== '' && !isNaN(parseInt(hVal, 10));
    const mOk = mVal !== '' && !isNaN(parseInt(mVal, 10));
    const next = (hOk && mOk) ? `${pad(hVal)}:${pad(mVal)}` : '';
    lastEmitted.current = next;
    onChange(next);
  };

  /* 从 nativeEvent.data 提取单个数字字符（移动端安全，绕过光标位置） */
  const getChar = (e) => (e.nativeEvent?.data ?? '').replace(/\D/g, '');

  /* 小时输入 */
  const handleH = (e) => {
    const char = getChar(e);
    if (!char) {
      /* 删除/清空：直接读 target.value */
      const v = e.target.value.replace(/\D/g, '').slice(0, 2);
      hRef.current = v;
      setH(v);
      emit(v, mRef.current);
      return;
    }
    /* 用 ref 拿最新值，避免闭包过期 */
    const next = (hRef.current + char).slice(0, 2);
    const n = parseInt(next, 10);
    if (!isNaN(n) && n >= 0 && n <= 23) {
      hRef.current = next;
      setH(next);
      emit(next, mRef.current);
      if (next.length === 2) minRef.current?.focus();
    } else if (next.length === 2) {
      /* 超出范围（如 31）：丢弃旧值，从新字符重新开始 */
      hRef.current = char;
      setH(char);
      emit(char, mRef.current);
    }
  };

  /* 分钟输入 */
  const handleM = (e) => {
    const char = getChar(e);
    if (!char) {
      const v = e.target.value.replace(/\D/g, '').slice(0, 2);
      mRef.current = v;
      setM(v);
      emit(hRef.current, v);
      return;
    }
    const next = (mRef.current + char).slice(0, 2);
    const n = parseInt(next, 10);
    if (!isNaN(n) && n >= 0 && n <= 59) {
      mRef.current = next;
      setM(next);
      emit(hRef.current, next);
    } else if (next.length === 2) {
      mRef.current = char;
      setM(char);
      emit(hRef.current, char);
    }
  };

  /* 失焦补零 */
  const padH = () => {
    if (hRef.current !== '') {
      const p = pad(hRef.current);
      hRef.current = p;
      setH(p);
      emit(p, mRef.current);
    }
  };
  const padM = () => {
    if (mRef.current !== '') {
      const p = pad(mRef.current);
      mRef.current = p;
      setM(p);
      emit(hRef.current, p);
    }
  };

  /* 上下键步进 */
  const stepH = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const cur = hRef.current === '' ? 0 : parseInt(hRef.current, 10);
      const next = e.key === 'ArrowUp' ? Math.min(23, cur + 1) : Math.max(0, cur - 1);
      const p = String(next).padStart(2, '0');
      hRef.current = p;
      setH(p);
      emit(p, mRef.current);
    }
  };
  const stepM = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const cur = mRef.current === '' ? 0 : parseInt(mRef.current, 10);
      const next = e.key === 'ArrowUp' ? Math.min(59, cur + 1) : Math.max(0, cur - 1);
      const p = String(next).padStart(2, '0');
      mRef.current = p;
      setM(p);
      emit(hRef.current, p);
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
