/* 应用主入口 — 移动端优先布局 */
import { useState, useCallback, useMemo } from 'react';
import MonthView from './components/Calendar/MonthView';
import WeekView  from './components/Calendar/WeekView';
import DayView   from './components/Calendar/DayView';
import Modal    from './components/UI/Modal';
import Sidebar  from './components/UI/Sidebar';
import StatsBar    from './components/UI/StatsBar';
import ExportModal    from './components/UI/ExportModal';
import SettingsModal  from './components/UI/SettingsModal';
import FinanceModal   from './components/UI/FinanceModal';
import OrderForm    from './components/Order/OrderForm';
import OrderDetail  from './components/Order/OrderDetail';
import { useOrders }   from './hooks/useOrders';
import { useConflict } from './hooks/useConflict';
import { formatDate, getWeekDays, getWeekStart, isSameDay } from './utils/timeUtils';
import './App.css';

const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

const VIEW_TABS = [
  { key: 'month',   label: '月',   icon: '▦' },
  { key: 'week',    label: '周',   icon: '▤' },
  { key: 'day',     label: '日',   icon: '▣' },
  { key: 'finance', label: '收支', icon: '💴' },
];

export default function App() {
  const today = new Date();

  /* ── 月视图导航 ── */
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  /* ── 周视图导航（基准日期） ── */
  const [weekBase, setWeekBase] = useState(() => getWeekStart(today));

  /* ── 日视图导航 ── */
  const [dayBase, setDayBase] = useState(() => new Date(today));

  /* ── 当前视图 ── */
  const [view, setView] = useState('month');

  /* ── 订单数据 ── */
  const { orders, addOrder, updateOrder, deleteOrder, getOrdersByDate } = useOrders();
  const conflictMap = useConflict(orders);

  /* ── 表单状态 ── */
  const [formOpen,  setFormOpen]  = useState(false);
  const [formDate,  setFormDate]  = useState('');
  const [formTime,  setFormTime]  = useState('');   // 周视图点击时间格预填
  const [editOrder, setEditOrder] = useState(null);

  /* ── 侧边栏 ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarDate, setSidebarDate] = useState('');

  /* ── 导出弹窗 ── */
  const [exportOpen, setExportOpen] = useState(false);

  /* ── 设置弹窗 ── */
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* ── 收支弹窗 ── */
  const [financeOpen, setFinanceOpen] = useState(false);

  /* ── 周视图：本周7天 ── */
  const weekDates = useMemo(() => getWeekDays(weekBase), [weekBase]);

  /* ── 顶部标题文字 ── */
  const WEEKDAY_NAMES = ['日','一','二','三','四','五','六'];
  const headerTitle = useMemo(() => {
    if (view === 'month') return `${year} · ${MONTH_NAMES[month]}`;
    if (view === 'week') {
      const s = weekDates[0], e = weekDates[6];
      if (s.getMonth() === e.getMonth())
        return `${s.getMonth()+1}月 ${s.getDate()}–${e.getDate()}日`;
      return `${s.getMonth()+1}/${s.getDate()} – ${e.getMonth()+1}/${e.getDate()}`;
    }
    if (view === 'day') {
      return `${dayBase.getMonth()+1}月${dayBase.getDate()}日 · 周${WEEKDAY_NAMES[dayBase.getDay()]}`;
    }
    return '';
  }, [view, year, month, weekDates, dayBase]);

  /* ── 导航：上一个 ── */
  const goPrev = () => {
    if (view === 'month') {
      if (month === 0) { setYear(y => y-1); setMonth(11); }
      else setMonth(m => m-1);
    } else if (view === 'week') {
      setWeekBase(d => { const n = new Date(d); n.setDate(n.getDate()-7); return n; });
    } else if (view === 'day') {
      setDayBase(d => { const n = new Date(d); n.setDate(n.getDate()-1); return n; });
    }
  };

  /* ── 导航：下一个 ── */
  const goNext = () => {
    if (view === 'month') {
      if (month === 11) { setYear(y => y+1); setMonth(0); }
      else setMonth(m => m+1);
    } else if (view === 'week') {
      setWeekBase(d => { const n = new Date(d); n.setDate(n.getDate()+7); return n; });
    } else if (view === 'day') {
      setDayBase(d => { const n = new Date(d); n.setDate(n.getDate()+1); return n; });
    }
  };

  /* ── 今天 ── */
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setWeekBase(getWeekStart(today));
    setDayBase(new Date(today));
  };

  /* ── 切换视图，同步基准日期 ── */
  const switchView = (v) => {
    setView(v);
    if (v === 'week') setWeekBase(getWeekStart(today));
    if (v === 'day')  setDayBase(new Date(today));
  };

  /* ── 月视图：点击空日期 ── */
  const handleDayClick = useCallback((dateStr) => {
    setFormDate(dateStr); setFormTime(''); setEditOrder(null); setFormOpen(true);
  }, []);

  /* ── 月/周视图：点击有订单日期 ── */
  const handleOrderClick = useCallback((dateStr) => {
    setSidebarDate(dateStr); setSidebarOpen(true);
  }, []);

  /* ── 周视图：点击空白时间格 ── */
  const handleSlotClick = useCallback((dateStr, timeStr) => {
    setFormDate(dateStr); setFormTime(timeStr); setEditOrder(null); setFormOpen(true);
  }, []);

  /* ── 保存订单 ── */
  const handleSave = useCallback((data) => {
    if (editOrder) updateOrder(editOrder.id, data);
    else addOrder(data);
    setFormOpen(false); setEditOrder(null); setFormTime('');
  }, [editOrder, addOrder, updateOrder]);

  /* ── 编辑 ── */
  const handleEdit = useCallback((order) => {
    setEditOrder(order); setFormDate(order.date); setFormTime('');
    setSidebarOpen(false); setFormOpen(true);
  }, []);

  /* ── 状态变更 ── */
  const handleStatusChange = useCallback((id, newStatus) => {
    updateOrder(id, { status: newStatus });
  }, [updateOrder]);

  /* ── 删除 ── */
  const handleDelete = useCallback((id) => {
    if (!window.confirm('确定删除该订单？')) return;
    deleteOrder(id);
    const remaining = getOrdersByDate(sidebarDate).filter(o => o.id !== id);
    if (remaining.length === 0) setSidebarOpen(false);
  }, [deleteOrder, getOrdersByDate, sidebarDate]);

  /* ── 新建（FAB / header） ── */
  const openNewOrder = () => {
    setFormDate(formatDate(today)); setFormTime(''); setEditOrder(null); setFormOpen(true);
  };

  /* 是否在当前周期（用于 header 高亮） */
  const isCurrentPeriod =
    view === 'month' ? year === today.getFullYear() && month === today.getMonth()
    : view === 'week' ? weekDates.some(d => isSameDay(d, today))
    : isSameDay(dayBase, today);

  return (
    <div className="app">

      {/* ── 顶部 Header ── */}
      <header className="app-header">
        <span className="logo">🐻 潘潘的陪拍日记</span>

        <div className="month-nav">
          <button className="nav-arrow" onClick={goPrev} aria-label="上一个">‹</button>
          <button
            className={`month-label ${isCurrentPeriod ? 'month-label--today' : ''}`}
            onClick={goToday}
          >
            {headerTitle}
          </button>
          <button className="nav-arrow" onClick={goNext} aria-label="下一个">›</button>
        </div>

        <div className="header-actions">
          <button className="header-export-btn" onClick={() => setExportOpen(true)}>导出</button>
          <button className="header-settings-btn" onClick={() => setSettingsOpen(true)} aria-label="设置">⚙</button>
          <button className="header-new-btn" onClick={openNewOrder}>＋ 新建</button>
        </div>
      </header>

      {/* ── 本月数据统计条 ── */}
      <StatsBar orders={orders} year={year} month={month} onExport={() => setExportOpen(true)} onSettings={() => setSettingsOpen(true)} />

      {/* ── 主内容 ── */}
      <main className="app-main">
        {view === 'month' && (
          <MonthView
            year={year} month={month} orders={orders}
            onDayClick={handleDayClick}
            onOrderClick={handleOrderClick}
          />
        )}
        {view === 'week' && (
          <WeekView
            weekDates={weekDates}
            orders={orders}
            conflictMap={conflictMap}
            onSlotClick={handleSlotClick}
            onOrderClick={handleOrderClick}
          />
        )}
        {view === 'day' && (
          <DayView
            date={dayBase}
            orders={orders}
            conflictMap={conflictMap}
            onSlotClick={handleSlotClick}
            onOrderClick={handleOrderClick}
          />
        )}
      </main>

      {/* ── 底部 Tab 导航 ── */}
      <nav className="bottom-nav">
        {VIEW_TABS.map(tab => (
          <button
            key={tab.key}
            className={`bottom-tab ${view === tab.key ? 'bottom-tab--active' : ''}`}
            onClick={() => tab.key === 'finance' ? setFinanceOpen(true) : switchView(tab.key)}
          >
            <span className="bottom-tab-icon">{tab.icon}</span>
            <span className="bottom-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── 新建/编辑订单模态框 ── */}
      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditOrder(null); setFormTime(''); }}
        title={editOrder ? '编辑订单' : '新建订单'}
      >
        <OrderForm
          initialDate={formDate}
          initialStartTime={formTime}
          order={editOrder}
          onSave={handleSave}
          onCancel={() => { setFormOpen(false); setEditOrder(null); setFormTime(''); }}
        />
      </Modal>

      {/* ── 导出弹窗 ── */}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        orders={orders}
        year={year}
        month={month}
      />

      {/* ── 收支弹窗 ── */}
      <FinanceModal
        open={financeOpen}
        onClose={() => setFinanceOpen(false)}
        orders={orders}
        year={year}
        month={month}
      />

      {/* ── 设置弹窗 ── */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={() => {}}
      />

      {/* ── 侧边栏：订单详情 ── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        {sidebarDate && (
          <OrderDetail
            dateStr={sidebarDate}
            orders={getOrdersByDate(sidebarDate)}
            conflictMap={conflictMap}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onAddNew={() => {
              setSidebarOpen(false);
              setFormDate(sidebarDate); setFormTime(''); setEditOrder(null); setFormOpen(true);
            }}
          />
        )}
      </Sidebar>
    </div>
  );
}
