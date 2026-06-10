/* 设置弹窗 — 时薪配置 */
import { useState } from 'react';
import { loadSettings, saveSettings } from '../../utils/settingsStorage';
import './SettingsModal.css';

/**
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 * @param {Function} props.onSave  - (settings) 保存后通知父组件
 */
export default function SettingsModal({ open, onClose, onSave }) {
  const [rate, setRate] = useState(() => {
    const s = loadSettings();
    return s.hourlyRate > 0 ? String(s.hourlyRate) : '';
  });

  if (!open) return null;

  const handleSave = () => {
    const n = parseFloat(rate);
    const newSettings = { hourlyRate: isNaN(n) || n < 0 ? 0 : n };
    saveSettings(newSettings);
    onSave?.(newSettings);
    onClose();
  };

  const handleClear = () => {
    setRate('');
    saveSettings({ hourlyRate: 0 });
    onSave?.({ hourlyRate: 0 });
    onClose();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>

        <div className="settings-header">
          <span className="settings-title">⚙️ 设置</span>
          <button className="settings-close" onClick={onClose} aria-label="关闭">✕</button>
        </div>

        <div className="settings-body">
          <label className="settings-label" htmlFor="hourly-rate">
            💰 时薪（元 / 小时）
          </label>
          <p className="settings-hint">设置后，新建订单填写时间时自动计算参考价格</p>
          <div className="settings-input-row">
            <span className="settings-currency">¥</span>
            <input
              id="hourly-rate"
              className="settings-input"
              type="text"
              inputMode="decimal"
              placeholder="例如 300"
              value={rate}
              onChange={e => setRate(e.target.value.replace(/[^\d.]/g, ''))}
            />
            <span className="settings-unit">/ 小时</span>
          </div>

          {rate && parseFloat(rate) > 0 && (
            <p className="settings-preview">
              拍摄 2 小时 = <strong>¥{(parseFloat(rate) * 2).toLocaleString()}</strong>
            </p>
          )}
        </div>

        <div className="settings-actions">
          {loadSettings().hourlyRate > 0 && (
            <button className="settings-btn settings-btn--clear" onClick={handleClear}>
              清除时薪
            </button>
          )}
          <button className="settings-btn settings-btn--save" onClick={handleSave}>
            保存
          </button>
        </div>

      </div>
    </div>
  );
}
