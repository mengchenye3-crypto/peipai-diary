/* 导出弹窗 — 复制文本摘要 / 下载 CSV */
import { useState } from 'react';
import { buildTextSummary, buildCSV, downloadFile } from '../../utils/exportUtils';
import './ExportModal.css';

/**
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 * @param {object[]} props.orders  - 当月订单
 * @param {number}   props.year
 * @param {number}   props.month   - 0-indexed
 */
export default function ExportModal({ open, onClose, orders, year, month }) {
  /* 复制状态：idle | copying | done */
  const [copyState, setCopyState] = useState('idle');

  if (!open) return null;

  /* 当月订单 */
  const monthStr    = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthOrders = orders.filter(o => o.date?.startsWith(monthStr));
  const monthLabel  = `${year}年${month + 1}月`;

  /* 一键复制文本摘要 */
  const handleCopyText = async () => {
    const text = buildTextSummary(monthOrders, year, month);
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('done');
      setTimeout(() => setCopyState('idle'), 2200);
    } catch {
      /* 降级：创建 textarea 手动复制 */
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopyState('done');
      setTimeout(() => setCopyState('idle'), 2200);
    }
  };

  /* 下载 CSV */
  const handleDownloadCSV = () => {
    const csv      = buildCSV(monthOrders, year, month);
    const filename = `陪拍订单_${year}年${month + 1}月.csv`;
    downloadFile(csv, filename, 'text/csv;charset=utf-8');
  };

  return (
    <div className="export-overlay" onClick={onClose}>
      <div className="export-panel" onClick={e => e.stopPropagation()}>

        {/* 顶部标题 */}
        <div className="export-header">
          <span className="export-title">📤 导出订单</span>
          <button className="export-close" onClick={onClose} aria-label="关闭">✕</button>
        </div>

        {/* 当月概览 */}
        <div className="export-meta">
          <span className="export-month">{monthLabel}</span>
          <span className="export-order-count">共 {monthOrders.length} 个订单</span>
        </div>

        {/* 导出选项 */}
        <div className="export-options">

          {/* 复制文本摘要 */}
          <button
            className={`export-btn export-btn--text ${copyState === 'done' ? 'export-btn--copied' : ''}`}
            onClick={handleCopyText}
            disabled={copyState === 'copying'}
          >
            <span className="export-btn-icon">
              {copyState === 'done' ? '✅' : '📋'}
            </span>
            <div className="export-btn-body">
              <span className="export-btn-label">
                {copyState === 'done' ? '已复制到剪贴板！' : '复制文本摘要'}
              </span>
              <span className="export-btn-desc">适合粘贴到微信、备忘录</span>
            </div>
          </button>

          {/* 下载 CSV */}
          <button className="export-btn export-btn--csv" onClick={handleDownloadCSV}>
            <span className="export-btn-icon">📊</span>
            <div className="export-btn-body">
              <span className="export-btn-label">下载 CSV 表格</span>
              <span className="export-btn-desc">可用 Excel / Numbers 打开</span>
            </div>
          </button>

        </div>

        {monthOrders.length === 0 && (
          <p className="export-empty">本月暂无订单可导出</p>
        )}
      </div>
    </div>
  );
}
