/* 新建/编辑订单表单 — 少女可爱风 */
import { useState, useEffect } from 'react';
import TimeInput from '../UI/TimeInput';
import { timeToMinutes, minutesToTime } from '../../utils/timeUtils';
import './OrderForm.css';

const EMPTY_FORM = {
  clientName: '',
  date: '',
  startTime: '',
  endTime: '',
  commuteBefore: 60,
  commuteAfter: 60,
  price: '',
  preference: '',
  location: '',
  status: 'pending',
  depositPaid: false,
};

export default function OrderForm({ initialDate, initialStartTime, order, onSave, onCancel }) {
  const [form, setForm] = useState(() =>
    order
      ? { ...EMPTY_FORM, ...order }
      : { ...EMPTY_FORM, date: initialDate || '', startTime: initialStartTime || '' }
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (order) setForm({ ...EMPTY_FORM, ...order });
  }, [order]);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  /* 快捷时长 */
  const applyDuration = (min) => {
    if (!form.startTime) return;
    const end = Math.min(timeToMinutes(form.startTime) + min, 23 * 60 + 59);
    set('endTime', minutesToTime(end));
  };

  const applyFullDay  = () => setForm(p => ({ ...p, startTime: '08:00', endTime: '20:00' }));
  const applyHalfDay  = () => {
    const base = form.startTime || '08:00';
    setForm(p => ({ ...p, startTime: base, endTime: minutesToTime(timeToMinutes(base) + 240) }));
  };

  /* 校验 */
  const validate = () => {
    const e = {};
    if (!form.clientName.trim()) e.clientName = '请填写客户名～';
    if (!form.date)              e.date       = '请选择日期～';
    if (!form.startTime)         e.startTime  = '请填写开始时间';
    if (!form.endTime)           e.endTime    = '请填写结束时间';
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
      e.endTime = '结束时间要晚于开始时间哦';
    if (form.price === '' || isNaN(Number(form.price))) e.price = '请填写有效金额～';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...form,
      price: Number(form.price),
      commuteBefore: Number(form.commuteBefore),
      commuteAfter:  Number(form.commuteAfter),
    });
  };

  return (
    <form className="order-form" onSubmit={handleSubmit} noValidate>

      {/* 客户名 */}
      <div className="form-field">
        <label className="form-label">👤 客户名 <span className="required">*</span></label>
        <input
          className={`form-input ${errors.clientName ? 'form-input--error' : ''}`}
          type="text"
          placeholder="输入客户姓名或昵称"
          value={form.clientName}
          onChange={e => set('clientName', e.target.value)}
        />
        {errors.clientName && <p className="form-error">✦ {errors.clientName}</p>}
      </div>

      {/* 日期 */}
      <div className="form-field">
        <label className="form-label">📅 拍摄日期 <span className="required">*</span></label>
        <input
          className={`form-input ${errors.date ? 'form-input--error' : ''}`}
          type="date"
          value={form.date}
          onChange={e => set('date', e.target.value)}
        />
        {errors.date && <p className="form-error">✦ {errors.date}</p>}
      </div>

      {/* 开始 / 结束时间（自定义 24h 输入器） */}
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">🕐 开始 <span className="required">*</span></label>
          <TimeInput
            value={form.startTime}
            onChange={v => set('startTime', v)}
            error={!!errors.startTime}
          />
          {errors.startTime && <p className="form-error">✦ {errors.startTime}</p>}
        </div>
        <div className="form-field">
          <label className="form-label">🕔 结束 <span className="required">*</span></label>
          <TimeInput
            value={form.endTime}
            onChange={v => set('endTime', v)}
            error={!!errors.endTime}
          />
          {errors.endTime && <p className="form-error">✦ {errors.endTime}</p>}
        </div>
      </div>

      {/* 快捷时长 */}
      <div className="form-field">
        <label className="form-label">⚡ 快捷时长</label>
        <div className="duration-btns">
          <button type="button" className="duration-btn" onClick={() => applyDuration(60)}>＋1小时</button>
          <button type="button" className="duration-btn" onClick={() => applyDuration(120)}>＋2小时</button>
          <button type="button" className="duration-btn" onClick={applyHalfDay}>半天</button>
          <button type="button" className="duration-btn" onClick={applyFullDay}>全天</button>
        </div>
      </div>

      {/* 通勤时间 */}
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">🚗 前置通勤（分钟）</label>
          <input
            className="form-input form-input--num"
            type="number" min="0" max="240"
            value={form.commuteBefore}
            onChange={e => set('commuteBefore', e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">🚗 后置通勤（分钟）</label>
          <input
            className="form-input form-input--num"
            type="number" min="0" max="240"
            value={form.commuteAfter}
            onChange={e => set('commuteAfter', e.target.value)}
          />
        </div>
      </div>

      {/* 价格 */}
      <div className="form-field">
        <label className="form-label">💴 价格（元）<span className="required">*</span></label>
        <div className="price-wrap">
          <span className="price-symbol">¥</span>
          <input
            className={`form-input form-input--price ${errors.price ? 'form-input--error' : ''}`}
            type="number" min="0" placeholder="0"
            value={form.price}
            onChange={e => set('price', e.target.value)}
          />
        </div>
        {errors.price && <p className="form-error">✦ {errors.price}</p>}
      </div>

      {/* 拍摄地点 */}
      <div className="form-field">
        <label className="form-label">📍 拍摄地点</label>
        <input
          className="form-input"
          type="text"
          placeholder="选填，如：人民广场、外滩…"
          value={form.location}
          onChange={e => set('location', e.target.value)}
        />
      </div>

      {/* 客户偏好 */}
      <div className="form-field">
        <label className="form-label">💬 客户偏好 / 备注</label>
        <textarea
          className="form-textarea"
          placeholder="记录客户风格偏好、注意事项…"
          rows={3}
          value={form.preference}
          onChange={e => set('preference', e.target.value)}
        />
      </div>

      {/* 定金已收 */}
      <label className="form-checkbox">
        <input
          type="checkbox"
          checked={form.depositPaid}
          onChange={e => set('depositPaid', e.target.checked)}
        />
        <span className="checkbox-label">💰 定金已收</span>
      </label>

      {/* 操作按钮 */}
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>取消</button>
        <button type="submit" className="btn-primary">✨ 保存订单</button>
      </div>
    </form>
  );
}
