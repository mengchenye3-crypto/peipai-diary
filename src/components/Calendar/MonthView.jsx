/* 月视图日历 */
import { useMemo } from 'react';
import { getCalendarDays, formatDate, isSameDay } from '../../utils/timeUtils';
import { getDayConflictLevel } from '../../hooks/useConflict';
import './MonthView.css';

/** 状态 → CSS 类 */
const STATUS_CLASS = {
  pending:   'order-bar--pending',
  confirmed: 'order-bar--confirmed',
  done:      'order-bar--done',
};

const DOT_CLASS = {
  pending:   'order-dot--pending',
  confirmed: 'order-dot--confirmed',
  done:      'order-dot--done',
};

export default function MonthView({ year, month, orders, onDayClick, onOrderClick }) {
  const today = new Date();

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  /* 按日期分组，按时间排序 */
  const ordersByDate = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (!map[o.date]) map[o.date] = [];
      map[o.date].push(o);
    });
    Object.keys(map).forEach(d => {
      map[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return map;
  }, [orders]);

  const handleCellClick = (dateStr, dayOrders) => {
    if (dayOrders.length > 0) onOrderClick(dateStr);
    else onDayClick(dateStr);
  };

  return (
    <div className="month-view">
      {/* 星期标题行（周一起） */}
      <div className="month-weekdays">
        {['一','二','三','四','五','六','日'].map(d => (
          <div key={d} className="month-weekday">{d}</div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="month-grid">
        {calendarDays.map(({ date, currentMonth }) => {
          const dateStr     = formatDate(date);
          const dayOrders   = ordersByDate[dateStr] || [];
          const isToday     = isSameDay(date, today);
          const isWeekend   = date.getDay() === 0 || date.getDay() === 6;
          const conflict    = getDayConflictLevel(dayOrders);
          const hasOrders   = dayOrders.length > 0;

          return (
            <div
              key={dateStr}
              className={[
                'month-cell',
                !currentMonth  && 'month-cell--other',
                isToday        && 'month-cell--today',
              ].filter(Boolean).join(' ')}
              onClick={() => handleCellClick(dateStr, dayOrders)}
              role="button"
              tabIndex={currentMonth ? 0 : -1}
              onKeyDown={e => e.key === 'Enter' && handleCellClick(dateStr, dayOrders)}
              aria-label={`${dateStr}，${dayOrders.length}个订单`}
            >
              {/* 冲突警告圆点 */}
              {hasOrders && conflict !== 'safe' && (
                <span className={`conflict-dot conflict-dot--${conflict}`} />
              )}

              {/* 日期数字 */}
              <span className={[
                'cell-date',
                isWeekend && currentMonth && !isToday && 'cell-date--weekend',
              ].filter(Boolean).join(' ')}>
                {date.getDate()}
              </span>

              {/* ── 移动端：彩色圆点 ── */}
              {hasOrders && (
                <div className="cell-dots">
                  {dayOrders.slice(0, 4).map(order => (
                    <span
                      key={order.id}
                      className={`order-dot ${DOT_CLASS[order.status] || 'order-dot--pending'}`}
                    />
                  ))}
                  {dayOrders.length > 4 && (
                    <span className="order-dot" style={{ background: 'var(--color-text-muted)' }} />
                  )}
                </div>
              )}

              {/* ── 桌面端：文字色条（CSS控制显示） ── */}
              <div className="cell-orders">
                {dayOrders.slice(0, 3).map(order => (
                  <div
                    key={order.id}
                    className={`order-bar ${STATUS_CLASS[order.status] || 'order-bar--pending'}`}
                    title={`${order.startTime} ${order.clientName}`}
                  >
                    <span className="order-bar-time">{order.startTime}</span>
                    <span className="order-bar-name">{order.clientName}</span>
                  </div>
                ))}
                {dayOrders.length > 3 && (
                  <div className="order-bar-more">+{dayOrders.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
