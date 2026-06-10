/* 订单色块 — 周视图 / 日视图中按时间定位的色块 */
import './OrderCard.css';

/**
 * @param {object}  props
 * @param {object}  props.order        - 订单数据
 * @param {string}  props.conflict     - 'hard' | 'soft' | 'safe'
 * @param {number}  props.top          - CSS top (px)
 * @param {number}  props.height       - CSS height (px)
 * @param {number}  props.left         - CSS left (%)，多订单并排时使用
 * @param {number}  props.width        - CSS width (%)
 * @param {boolean} props.showCommute  - 是否显示通勤块
 * @param {number}  props.commuteBeforeH - 前置通勤高度 (px)
 * @param {number}  props.commuteAfterH  - 后置通勤高度 (px)
 * @param {Function} props.onClick
 */
export default function OrderCard({
  order,
  conflict = 'safe',
  top,
  height,
  left = 0,
  width = 100,
  showCommute = true,
  commuteBeforeH = 0,
  commuteAfterH  = 0,
  onClick,
}) {
  const tooShort = height < 32; // 高度太小时简化显示

  return (
    <div
      className="order-card-wrap"
      style={{ top, left: `${left}%`, width: `${width}%` }}
    >
      {/* 前置通勤块 */}
      {showCommute && commuteBeforeH > 0 && (
        <div
          className={`commute-block commute-block--before commute-block--${order.status}`}
          style={{ height: commuteBeforeH }}
        />
      )}

      {/* 主订单色块 */}
      <div
        className={[
          'order-card',
          `order-card--${order.status}`,
          conflict !== 'safe' && `order-card--${conflict}`,
        ].filter(Boolean).join(' ')}
        style={{ height }}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onClick?.()}
        aria-label={`${order.startTime}–${order.endTime} ${order.clientName}`}
      >
        {tooShort ? (
          /* 极窄：只显示一行 */
          <span className="card-mini">
            {order.startTime} {order.clientName}
          </span>
        ) : (
          <>
            <span className="card-time">
              {order.startTime}–{order.endTime}
            </span>
            <span className="card-name">{order.clientName}</span>
            {!tooShort && order.location && height >= 56 && (
              <span className="card-loc">📍 {order.location}</span>
            )}
            {conflict === 'hard' && <span className="card-badge card-badge--hard">冲突</span>}
            {conflict === 'soft' && <span className="card-badge card-badge--soft">通勤紧</span>}
          </>
        )}
      </div>

      {/* 后置通勤块 */}
      {showCommute && commuteAfterH > 0 && (
        <div
          className={`commute-block commute-block--after commute-block--${order.status}`}
          style={{ height: commuteAfterH }}
        />
      )}
    </div>
  );
}
