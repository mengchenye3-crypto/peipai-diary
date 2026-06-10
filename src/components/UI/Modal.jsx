/* 通用模态框容器 */
import { useEffect } from 'react';
import './Modal.css';

/**
 * @param {object} props
 * @param {boolean} props.open - 是否显示
 * @param {Function} props.onClose - 关闭回调
 * @param {string} [props.title] - 标题
 * @param {React.ReactNode} props.children
 */
export default function Modal({ open, onClose, title, children }) {
  // 按 ESC 关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // 禁止背景滚动
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* 标题栏 */}
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close" onClick={onClose} aria-label="关闭">✕</button>
          </div>
        )}
        {/* 内容区 */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
