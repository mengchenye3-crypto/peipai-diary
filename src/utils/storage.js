/* localStorage 封装工具 */

const ORDERS_KEY = 'peipai_orders';

/** 读取所有订单 */
export function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** 保存所有订单（覆盖写入） */
export function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
