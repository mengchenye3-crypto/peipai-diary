/* 日视图 — 单日完整 24h 时间轴 */
import { useMemo, useRef, useEffect } from 'react';
import OrderCard from '../Order/OrderCard';
import {
  formatDate, isSameDay,
  timeToMinutes, minutesToTime, snapMinutes,
} from '../../utils/timeUtils';
import './DayView.css';

/* ── 布局常量（与 WeekView 相同） ── */
const HOUR_HEIGHT  = 72;   // 日视图比周视图略高，更易读
const BASE_HOUR    = 6;
const END_HOUR     = 24;
const TOTAL_HOURS  = END_HOUR - BASE_HOUR;
const BASE_MINUTES = BASE_HOUR * 60;

const minToPx = (min) => (min / 60) * HOUR_HEIGHT;

/** 同一天多订单水平分列（复用 WeekView 逻辑） */
function resolveLayout(dayOrders) {
  const sorted = [...dayOrders].sort((a, b) =>
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  const cols = [];
  const layout = {};
  sorted.forEach(order => {
    const start = timeToMinutes(order.startTime);
    let placed = false;
    for (let i = 0; i < cols.length; i++) {
      if (cols[i] <= start) {
        cols[i] = timeToMinutes(order.endTime);
        layout[order.id] = { colIdx: i };
        placed = true; break;
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
 * @param {Date}     props.date         - 当前查看的日期
 * @param {object[]} props.orders       - 所有订单
 * @param {Map}      props.conflictMap
 * @param {Function} props.onSlotClick  - (dateStr, timeStr)
 * @param {Function} props.onOrderClick - (dateStr)
 */
export default function DayView({ date, orders, conflictMap, onSlotClick, onOrderClick }) {
  const scrollRef = useRef(null);
  const today     = new Date();
  const dateStr   = formatDate(date);
  const isToday   = isSameDay(date, today);

  /* 当天订单（按时间排序） */
  const dayOrders = useMemo(() =>
    orders
      .filter(o => o.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [orders, dateStr]
  );

  const layout = useMemo(() => resolveLayout(dayOrders), [dayOrders]);

  /* 初始滚动定位 */
  useEffect(() => {
    if (!scrollRef.current) return;
    const now = new Date();
    const targetMin = isToday
      ? Math.max(now.getHours() * 60 + now.getMinutes() - 60, BASE_MINUTES)
      : dayOrders.length > 0
        ? Math.max(timeToMinutes(dayOrders[0].startTime) - 60, BASE_MINUTES)
        : 8 * 60;
    scrollRef.current.scrollTop = Math.max(0, minToPx(targetMin - BASE_MINUTES) - 40);
  }, [dateStr]);

  /* 点击空白格计算时间 */
  const handleColClick = (e) => {
    if (e.target.closest('.order-card')) return;
    const col      = e.currentTarget;
    const rect     = col.getBoundingClientRect();
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    const rawY     = e.clientY - rect.top + scrollTop;
    const rawMin   = (rawY / HOUR_HEIGHT) * 60 + BASE_MINUTES;
    const snapped  = Math.max(BASE_MINUTES, Math.min(END_HOUR * 60 - 30, snapMinutes(rawMin)));
    onSlotClick(dateStr, minutesToTime(snapped));
  };

  /* 当前时间 */
  const nowMin = today.getHours() * 60 + today.getMinutes();
  const nowTop = minToPx(nowMin - BASE_MINUTES);
  const showNow = isToday && nowMin >= BASE_MINUTES && nowMin < END_HOUR * 60;

  /* 格式化日期标题 */
  const WEEKDAYS = ['日','一','二','三','四','五','六'];
  const dateTitle = `${date.getMonth()+1}月${date.getDate()}日 · 周${WEEKDAYS[date.getDay()]}`;

  /* 当天收入合计 */
  const totalIncome = dayOrders.reduce((s, o) => s + (Number(o.price) || 0), 0);

  return (
    <div className="day-view">

      {/* ── 日期头部 ── */}
      <div className={`day-header ${isToday ? 'day-header--today' : ''}`}>
        <div className="day-header-main">
          <span className={`day-title ${isToday ? 'day-title--today' : ''}`}>{dateTitle}</span>
          {isToday && <span className="today-chip">今天</span>}
        </div>
        <div className="day-header-stats">
          <span className="day-stat">📋 {dayOrders.length} 个订单</span>
          {totalIncome > 0 && (
            <span className="day-stat day-stat--income">💰 ¥{totalIncome.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* ── 可滚动区域 ── */}
      <div className="day-scroll" ref={scrollRef}>
        <div className="day-body" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>

          {/* 时间轴 */}
          <div className="day-time-axis">
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <div key={i} className="time-label" style={{ top: i * HOUR_HEIGHT }}>
                {String(BASE_HOUR + i).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* 主内容列 */}
          <div className="day-col" onClick={handleColClick}>
            {/* 网格线 */}
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <div key={i} className={`hour-line ${i === 0 ? 'hour-line--first' : ''}`}
                style={{ top: i * HOUR_HEIGHT }} />
            ))}
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <div key={`h${i}`} className="half-line"
                style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
            ))}

            {/* 当前时间线 */}
            {showNow && (
              <div className="now-line" style={{ top: nowTop }}>
                <span className="now-dot" />
              </div>
            )}

            {/* 订单色块 */}
            {dayOrders.map(order => {
              const startMin = timeToMinutes(order.startTime);
              const endMin   = timeToMinutes(order.endTime);
              const top      = minToPx(startMin - BASE_MINUTES);
              const height   = Math.max(minToPx(endMin - startMin), 24);
              const cbH      = minToPx(order.commuteBefore || 0);
              const caH      = minToPx(order.commuteAfter  || 0);
              const { colIdx: ci = 0, totalCols: tc = 1 } = layout[order.id] || {};

              return (
                <OrderCard
                  key={order.id}
                  order={order}
                  conflict={conflictMap?.get(order.id) || 'safe'}
                  top={top}
                  height={height}
                  left={ci * (100 / tc)}
                  width={100 / tc}
                  showCommute
                  commuteBeforeH={cbH}
                  commuteAfterH={caH}
                  onClick={() => onOrderClick(dateStr)}
                />
              );
            })}

            {/* 空状态提示 */}
            {dayOrders.length === 0 && (
              <div className="day-empty">
                <span>点击任意时间段新建订单 ✨</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
