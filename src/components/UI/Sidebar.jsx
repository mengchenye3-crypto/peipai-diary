/* 右侧详情侧边栏容器 */
import { useEffect } from 'react';
import './Sidebar.css';

/**
 * @param {object} props
 * @param {boolean} props.open - 是否显示
 * @param {Function} props.onClose
 * @param {React.ReactNode} props.children
 */
export default function Sidebar({ open, onClose, children }) {
  // 按 ESC 关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* 遮罩（仅移动端） */}
      {open && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <button className="sidebar-close" onClick={onClose} aria-label="关闭侧边栏">✕</button>
        <div className="sidebar-content">{children}</div>
      </aside>
    </>
  );
}
