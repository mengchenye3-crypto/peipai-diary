/* 顶部统计数据条 — 显示本月收入与订单状态分布 */
import './StatsBar.css';

/**
 * @param {object}   props
 * @param {object[]} props.orders      - 所有订单（用于计算本月数据）
 * @param {number}   props.year        - 当前月视图年份
 * @param {number}   props.month       - 当前月视图月份（0-indexed）
 * @param {Function} props.onExport    - 点击导出按钮回调
 */
export default function StatsBar({ orders, year, month, onExport }) {
  /* 只统计当月订单 */
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthOrders = orders.filter(o => o.date && o.date.startsWith(monthStr));

  /* 收入合计（只计入已确认 + 已完成） */
  const totalIncome = monthOrders
    .filter(o => o.status === 'confirmed' || o.status === 'done')
    .reduce((s, o) => s + (Number(o.price) || 0), 0);

  /* 各状态计数 */
  const counts = {
    pending:   monthOrders.filter(o => o.status === 'pending').length,
    confirmed: monthOrders.filter(o => o.status === 'confirmed').length,
    done:      monthOrders.filter(o => o.status === 'done').length,
  };

  return (
    <div className="stats-bar">
      {/* 移动端导出小按钮（桌面端通过 header 按钮操作） */}
      {onExport && (
        <button className="stats-export-btn" onClick={onExport} aria-label="导出订单">
          ↑
        </button>
      )}
      {/* 本月收入 */}
      <div className="stat-item stat-item--income">
        <span className="stat-label">本月收入</span>
        <span className="stat-value stat-value--income">
          ¥{totalIncome > 0 ? totalIncome.toLocaleString() : '0'}
        </span>
      </div>

      <div className="stat-divider" />

      {/* 待确认 */}
      <div className="stat-item">
        <span className="stat-dot stat-dot--pending" />
        <span className="stat-label">待确认</span>
        <span className="stat-value">{counts.pending}</span>
      </div>

      {/* 已确认 */}
      <div className="stat-item">
        <span className="stat-dot stat-dot--confirmed" />
        <span className="stat-label">已确认</span>
        <span className="stat-value">{counts.confirmed}</span>
      </div>

      {/* 已完成 */}
      <div className="stat-item">
        <span className="stat-dot stat-dot--done" />
        <span className="stat-label">已完成</span>
        <span className="stat-value">{counts.done}</span>
      </div>
    </div>
  );
}
