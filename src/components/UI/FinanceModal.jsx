/* 本月收支面板 */
import './FinanceModal.css';

const STATUS_LABEL = { pending: '待确认', confirmed: '已确认', done: '已完成' };
const STATUS_ORDER = ['confirmed', 'done', 'pending'];

function fmt(n) {
  return Number(n || 0).toLocaleString();
}

export default function FinanceModal({ open, onClose, orders, year, month }) {
  if (!open) return null;

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const mo = orders.filter(o => o.date && o.date.startsWith(monthStr));

  /* 统计数据 */
  const confirmedIncome = mo
    .filter(o => o.status === 'confirmed' || o.status === 'done')
    .reduce((s, o) => s + (Number(o.price) || 0), 0);

  const pendingIncome = mo
    .filter(o => o.status === 'pending')
    .reduce((s, o) => s + (Number(o.price) || 0), 0);

  const carFeeTotal = mo.reduce((s, o) => s + (Number(o.carFee) || 0), 0);

  const depositCollected = mo
    .filter(o => o.depositPaid)
    .reduce((s, o) => s + (Number(o.depositAmount) || 0), 0);

  const depositPending = mo
    .filter(o => !o.depositPaid && Number(o.depositAmount) > 0)
    .reduce((s, o) => s + (Number(o.depositAmount) || 0), 0);

  /* 按状态分组 */
  const grouped = STATUS_ORDER.map(status => ({
    status,
    list: mo.filter(o => o.status === status).sort((a, b) => a.date.localeCompare(b.date)),
  })).filter(g => g.list.length > 0);

  const monthLabel = `${year}年${month + 1}月`;

  return (
    <div className="finance-overlay" onClick={onClose}>
      <div className="finance-panel" onClick={e => e.stopPropagation()}>

        {/* 拖拽手柄 */}
        <div className="finance-handle" />

        {/* 标题 */}
        <div className="finance-header">
          <span className="finance-title">💰 {monthLabel}收支</span>
          <button className="finance-close" onClick={onClose} aria-label="关闭">✕</button>
        </div>

        {/* 顶部统计卡片 */}
        <div className="finance-stats">
          <div className="fstat fstat--income">
            <span className="fstat-label">月度收入</span>
            <span className="fstat-value">¥{fmt(confirmedIncome)}</span>
          </div>
          <div className="fstat fstat--pending">
            <span className="fstat-label">待收款</span>
            <span className="fstat-value">¥{fmt(pendingIncome)}</span>
          </div>
          <div className="fstat fstat--car">
            <span className="fstat-label">车费合计</span>
            <span className="fstat-value">¥{fmt(carFeeTotal)}</span>
          </div>
          <div className="fstat fstat--deposit">
            <span className="fstat-label">已收定金</span>
            <span className="fstat-value">¥{fmt(depositCollected)}</span>
          </div>
          {depositPending > 0 && (
            <div className="fstat fstat--deposit-pending">
              <span className="fstat-label">待收定金</span>
              <span className="fstat-value">¥{fmt(depositPending)}</span>
            </div>
          )}
        </div>

        {/* 订单列表（按状态分组） */}
        <div className="finance-list">
          {mo.length === 0 && (
            <p className="finance-empty">本月暂无订单 ˙ᵕ˙</p>
          )}
          {grouped.map(({ status, list }) => (
            <div key={status} className="finance-group">
              <div className={`finance-group-title finance-group-title--${status}`}>
                {STATUS_LABEL[status]} · {list.length} 单
              </div>
              {list.map(o => (
                <div key={o.id} className="finance-row">
                  <div className="finance-row-left">
                    <span className="finance-row-name">{o.clientName}</span>
                    <span className="finance-row-date">
                      {o.date.slice(5).replace('-', '/')} {o.startTime}–{o.endTime}
                    </span>
                  </div>
                  <div className="finance-row-right">
                    <span className="finance-row-price">¥{fmt(o.price)}</span>
                    {Number(o.carFee) > 0 && (
                      <span className="finance-row-tag finance-row-tag--car">
                        🚕 ¥{fmt(o.carFee)}
                      </span>
                    )}
                    {Number(o.depositAmount) > 0 && (
                      <span className={`finance-row-tag ${o.depositPaid ? 'finance-row-tag--deposit-paid' : 'finance-row-tag--deposit-due'}`}>
                        {o.depositPaid ? '✓' : '…'} 定金¥{fmt(o.depositAmount)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
