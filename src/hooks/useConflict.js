/* 冲突检测 hook */
import { useMemo } from 'react';
import { getDayConflictMap } from '../utils/conflictDetect';
import { formatDate } from '../utils/timeUtils';

/**
 * 根据所有订单，计算每个订单的冲突状态
 * @param {Array} orders - 全部订单
 * @returns {Map<string, 'hard'|'soft'|'safe'>} id => 冲突状态
 */
export function useConflict(orders) {
  return useMemo(() => {
    // 按日期分组
    const byDate = {};
    orders.forEach(o => {
      if (!byDate[o.date]) byDate[o.date] = [];
      byDate[o.date].push(o);
    });

    // 合并每天的冲突 Map
    const result = new Map();
    Object.values(byDate).forEach(dayOrders => {
      const dayMap = getDayConflictMap(dayOrders);
      dayMap.forEach((status, id) => result.set(id, status));
    });

    return result;
  }, [orders]);
}

/**
 * 判断某一天是否有冲突（用于月视图圆点）
 * @param {Array} dayOrders - 某天订单列表
 * @returns {'hard'|'soft'|'safe'}
 */
export function getDayConflictLevel(dayOrders) {
  if (dayOrders.length < 2) return 'safe';
  const map = getDayConflictMap(dayOrders);
  const statuses = [...map.values()];
  if (statuses.includes('hard')) return 'hard';
  if (statuses.includes('soft')) return 'soft';
  return 'safe';
}
