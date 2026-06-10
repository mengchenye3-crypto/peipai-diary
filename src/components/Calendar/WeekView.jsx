/* 周视图 — 7列时间轴日历 */
import { useMemo, useRef, useEffect } from 'react';
import OrderCard from '../Order/OrderCard';
import { formatDate, isSameDay, timeToMinutes, minutesToTime, snapMinutes } from '../../utils/timeUtils';
import './WeekView.css';

/* ── 布局常量 ── */
const HOUR_HEIGHT  = 64;   // px / 小时
const BASE_HOUR    = 6;    // 从 06:00 开始
const END_HOUR     = 24;   // 到 24:00
const TOTAL_HOURS  = END_HOUR - BASE_HOUR;
const BASE_MINUTES = BASE_HOUR * 60;

/** 分钟 → px */
const minToPx = (min) => (min / 60) * HOUR_HEIGHT;

/**
 * 同一天多订单时，计算每个订单的水平位置（防重叠）
 * 返回 Map<orderId, { colIdx, totalCols }>
 */
function resolveLayout(dayOrders) {
  const sorted = [...dayOrders].sort((a, b) =>
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  const cols = []; // cols[i] = 最后一个订单的 endTime (minutes)

  const layout = {};
  sorted.forEach(order => {
    const start = timeToMinutes(order.startTime);
    let placed = false;
    for (let i = 0; i < cols.length; i++) {
      if (cols[i] <= start) {
        cols[i] = timeToMinutes(order.endTime);
        layout[order.id] = { colIdx: i };
        placed = true;
        break;
      }
    }
    if (!placed) {
      layout[order.id] = { colIdx: cols.length };
      cols.push(timeToMinutes(order.endTime));
    }
  });

  const totalCols = cols.length;
  Object.keys(layout).forEach(id => { layout[id].totalCols = totalCols; });
  return layout;
}

/**
 * @param {object}   props
 * @param {Date[]}   props.weekDates   - 7个 Date（周一到周日）
 * @param {object[]} props.orders      - 所有订单
 * @param {Map}      props.conflictMap - id → 'hard'|'soft'|'safe'
 * @param {Function} props.onSlotClick - (dateStr, timeStr) 点击空白时间格
 * @param {Function} props.onOrderClick - (dateStr) 点击订单 → 打开侧边栏
 */
export default function WeekView({
  weekDates, orders, conflictMap, onSlotClick, onOrderClick,
}) {
  const scrollRef = useRef(null);
  const today     = new Date();

  /* 按日期分组订单 */
  const ordersByDate = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (!map[o.date]) map[o.date] = [];
      map[o.date].push(o);
    });
    return map;
  }, [orders]);

  /* 初始滚动：定位到当前时间或 08:00 */
  useEffect(() => {
    if (!scrollRef.current) return;
    const now = new Date();
    const targetMin = isSameDay(now, weekDates[0]) || weekDates.some(d => isSameDay(d, now))
      ? Math.max(now.getHours() * 60 + now.getMinutes() - 60, BASE_MINUTES)
      : 8 * 60;
    const scrollTop = minToPx(targetMin - BASE_MINUTES) - 40;
    scrollRef.current.scrollTop = Math.max(0, scrollTop);
  }, [weekDates]);

  /* 点击空白区域 → 计算时间 */
  const handleColumnClick = (e, dateStr) => {
    if (e.target.closest('.order-card')) return;
    const col      = e.currentTarget;
    const rect     = col.getBoundingClientRect();
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    const rawY     = e.clientY - rect.top + scrollTop;
    const rawMin   = (rawY / HOUR_HEIGHT) * 60 + BASE_MINUTES;
    const snapped  = Math.max(BASE_MINUTES, Math.min(END_HOUR * 60 - 30, snapMinutes(rawMin)));
    onSlotClick(dateStr, minutesToTime(snapped));
  };

  /* 当前时间线 top */
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowTop = minToPx(nowMin - BASE_MINUTES);
  const showNowLine = nowMin >= BASE_MINUTES && nowMin < END_HOUR * 60;

  const WEEKDAY_NAMES = ['一','二','三','四','五','六','日'];

  return (
    <div className="week-view">

      {/* ── 固定表头：星期 + 日期 ── */}
      <div className="week-header">
        <div className="week-header-gutter" /> {/* 时间轴占位 */}
        {weekDates.map((date, idx) => {
          const dateStr  = formatDate(date);
          const isToday  = isSameDay(date, today);
          const dayCount = (ordersByDate[dateStr] || []).length;
          return (
            <div
              key={dateStr}
              className={`week-header-cell ${isToday ? 'week-header-cell--today' : ''}`}
            >
              <span className="wh-weekday">{WEEKDAY_NAMES[idx]}</span>
              <span className={`wh-date ${isToday ? 'wh-date--today' : ''}`}>
                {date.getMonth() + 1}/{date.getDate()}
              </span>
              {dayCount > 0 && (
                <span className="wh-count">{dayCount}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 可滚动区域 ── */}
      <div className="week-scroll" ref={scrollRef}>
        <div
          className="week-body"
          style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
        >
          {/* 时间轴标签 */}
          <div className="week-time-axis">
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <div
                key={i}
                className="time-label"
                style={{ top: i * HOUR_HEIGHT }}
              >
                {String(BASE_HOUR + i).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* 7 列内容区 */}
          <div className="week-cols">
            {weekDates.map((date, colIdx) => {
              const dateStr   = formatDate(date);
              const dayOrders = ordersByDate[dateStr] || [];
              const layout    = resolveLayout(dayOrders);
              const isToday   = isSameDay(date, today);

              return (
                <div
                  key={dateStr}
                  className={`week-col ${isToday ? 'week-col--today' : ''}`}
                  onClick={(e) => handleColumnClick(e, dateStr)}
                >
                  {/* 水平网格线（每小时） */}
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                    <div
                      key={i}
                      className={`hour-line ${i === 0 ? 'hour-line--first' : ''}`}
                      style={{ top: i * HOUR_HEIGHT }}
                    />
                  ))}

                  {/* 半小时虚线 */}
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                    <div
                      key={`h${i}`}
                      className="half-line"
                      style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                    />
                  ))}

                  {/* 当前时间线（仅今日列） */}
                  {isToday && showNowLine && (
                    <div className="now-line" style={{ top: nowTop }}>
                      <span className="now-dot" />
                    </div>
                  )}

                  {/* 订单色块 */}
                  {dayOrders.map(order => {
                    const startMin = timeToMinutes(order.startTime);
                    const endMin   = timeToMinutes(order.endTime);
                    const top      = minToPx(startMin - BASE_MINUTES);
                    const height   = Math.max(minToPx(endMin - startMin), 20);

                    const commuteBefore = order.commuteBefore || 0;
                    const commuteAfter  = order.commuteAfter  || 0;
                    const commuteBeforeH = minToPx(commuteBefore);
                    const commuteAfterH  = minToPx(commuteAfter);

                    const { colIdx: cIdx = 0, totalCols: tCols = 1 } = layout[order.id] || {};
                    const cardWidth = 100 / tCols;
                    const cardLeft  = cIdx * cardWidth;

                    return (
                      <OrderCard
                        key={order.id}
                        order={order}
                        conflict={conflictMap?.get(order.id) || 'safe'}
                        top={top}
                        height={height}
                        left={cardLeft}
                        width={cardWidth}
                        showCommute
                        commuteBeforeH={commuteBeforeH}
                        commuteAfterH={commuteAfterH}
                        onClick={() => onOrderClick(dateStr)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
