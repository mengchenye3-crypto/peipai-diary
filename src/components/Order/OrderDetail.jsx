/* 侧边栏订单详情 */
import './OrderDetail.css';

/** 状态配置 */
const STATUS_LABEL = {
  pending:   '待确认',
  confirmed: '已确认',
  done:      '已完成',
};

/** 状态流转：下一步操作 */
const STATUS_ACTIONS = {
  pending:   { label: '✓ 确认订单',  next: 'confirmed', cls: 'status-action--confirm' },
  confirmed: { label: '🏁 标记完成', next: 'done',      cls: 'status-action--done'    },
  done:      { label: '↩ 重新开放',  next: 'pending',   cls: 'status-action--reopen'  },
};

/**
 * @param {object}   props
 * @param {string}   props.dateStr
 * @param {Array}    props.orders
 * @param {Map}      props.conflictMap
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 * @param {Function} props.onAddNew
 * @param {Function} props.onStatusChange - (id, newStatus) 状态变更回调
 */
export default function OrderDetail({
  dateStr, orders, conflictMap, onEdit, onDelete, onAddNew, onStatusChange,
}) {
  return (
    <div className="order-detail">

      {/* ── 头部 ── */}
      <div className="detail-header">
        <p className="detail-date">{formatDisplayDate(dateStr)}</p>
        <div className="detail-header-row">
          <p className="detail-count">{orders.length} 个订单</p>
          <button className="detail-add-btn" onClick={onAddNew}>＋ 新建</button>
        </div>
        {/* 当日收入小计 */}
        {orders.length > 0 && (
          <p className="detail-income">
            💰 当日收入 ¥{orders.reduce((s, o) => s + (Number(o.price) || 0), 0).toLocaleString()}
          </p>
        )}
      </div>

      {/* ── 订单列表 ── */}
      {orders.length === 0 ? (
        <div className="detail-empty">
          <span className="detail-empty-icon">📷</span>
          <p>今天还没有订单</p>
        </div>
      ) : (
        <ul className="detail-list">
          {orders.map(order => {
            const conflict = conflictMap?.get(order.id) || 'safe';
            const action   = STATUS_ACTIONS[order.status];

            return (
              <li key={order.id} className={`detail-item detail-item--${conflict} detail-item--status-${order.status}`}>

                {/* 顶部：客户名 + 状态徽章 */}
                <div className="detail-item-top">
                  <span className="detail-client">{order.clientName}</span>
                  <span className={`status-badge status-badge--${order.status}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>

                {/* 时间 */}
                <p className="detail-time">
                  🕐 {order.startTime} – {order.endTime}
                  {order.commuteBefore > 0 && (
                    <span className="detail-commute">（前通勤 {order.commuteBefore}min）</span>
                  )}
                </p>

                {/* 地点 */}
                {order.location && (
                  <p className="detail-meta">📍 {order.location}</p>
                )}

                {/* 价格 + 定金 */}
                <p className="detail-meta">
                  💴 ¥{Number(order.price).toLocaleString()}
                  {order.depositPaid && <span className="deposit-tag">定金已收</span>}
                </p>

                {/* 冲突提示 */}
                {conflict === 'hard' && <p className="conflict-tip conflict-tip--hard">⚠️ 时间冲突</p>}
                {conflict === 'soft' && <p className="conflict-tip conflict-tip--soft">⚡ 通勤可能紧张</p>}

                {/* 备注 */}
                {order.preference && (
                  <p className="detail-note">💬 {order.preference}</p>
                )}

                {/* ── 状态快捷操作 ── */}
                <button
                  className={`status-action-btn ${action.cls}`}
                  onClick={() => onStatusChange?.(order.id, action.next)}
                >
                  {action.label}
                </button>

                {/* 编辑 / 删除 */}
                <div className="detail-item-actions">
                  <button className="action-btn action-btn--edit"   onClick={() => onEdit(order)}>编辑</button>
                  <button className="action-btn action-btn--delete" onClick={() => onDelete(order.id)}>删除</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** "YYYY-MM-DD" → "6月10日 · 周二" */
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const weekdays  = ['日','一','二','三','四','五','六'];
  const date      = new Date(Number(y), Number(m) - 1, Number(d));
  return `${Number(m)}月${Number(d)}日 · 周${weekdays[date.getDay()]}`;
}
