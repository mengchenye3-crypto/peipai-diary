/* 冲突检测算法 */
import { timeToMinutes } from './timeUtils';

/**
 * 检测两个订单之间的冲突类型
 * @param {Object} a - 订单 A
 * @param {Object} b - 订单 B
 * @returns {'hard' | 'soft' | 'safe'}
 */
export function detectConflict(a, b) {
  // 拍摄时间段（分钟）
  const aStart = timeToMinutes(a.startTime);
  const aEnd   = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd   = timeToMinutes(b.endTime);

  // 含通勤的完整区间
  const aFullStart = aStart - (a.commuteBefore || 0);
  const aFullEnd   = aEnd   + (a.commuteAfter  || 0);
  const bFullStart = bStart - (b.commuteBefore || 0);
  const bFullEnd   = bEnd   + (b.commuteAfter  || 0);

  // 硬冲突：拍摄时间段直接重叠
  const hardOverlap = aStart < bEnd && bStart < aEnd;
  if (hardOverlap) return 'hard';

  // 软冲突：含通勤的完整区间重叠
  const softOverlap = aFullStart < bFullEnd && bFullStart < aFullEnd;
  if (softOverlap) return 'soft';

  return 'safe';
}

/**
 * 给某一天的订单列表计算每个订单的冲突状态
 * @param {Array} dayOrders - 同一天的订单数组
 * @returns {Map<string, 'hard'|'soft'|'safe'>} id => 冲突状态
 */
export function getDayConflictMap(dayOrders) {
  const resultMap = new Map();
  dayOrders.forEach(o => resultMap.set(o.id, 'safe'));

  for (let i = 0; i < dayOrders.length; i++) {
    for (let j = i + 1; j < dayOrders.length; j++) {
      const type = detectConflict(dayOrders[i], dayOrders[j]);
      if (type === 'hard') {
        resultMap.set(dayOrders[i].id, 'hard');
        resultMap.set(dayOrders[j].id, 'hard');
      } else if (type === 'soft') {
        // 软冲突不覆盖硬冲突
        if (resultMap.get(dayOrders[i].id) !== 'hard') resultMap.set(dayOrders[i].id, 'soft');
        if (resultMap.get(dayOrders[j].id) !== 'hard') resultMap.set(dayOrders[j].id, 'soft');
      }
    }
  }

  return resultMap;
}
