/* 订单 CRUD + localStorage 读写 */
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadOrders, saveOrders } from '../utils/storage';

export function useOrders() {
  const [orders, setOrders] = useState(() => loadOrders());

  /** 新建订单 */
  const addOrder = useCallback((data) => {
    const newOrder = {
      id: uuidv4(),
      clientName: '',
      date: '',
      startTime: '',
      endTime: '',
      commuteBefore: 60,
      commuteAfter: 60,
      price: 0,
      preference: '',
      location: '',
      status: 'pending',
      depositPaid: false,
      createdAt: new Date().toISOString(),
      ...data,
    };
    setOrders(prev => {
      const next = [...prev, newOrder];
      saveOrders(next);
      return next;
    });
    return newOrder;
  }, []);

  /** 更新订单 */
  const updateOrder = useCallback((id, data) => {
    setOrders(prev => {
      const next = prev.map(o => o.id === id ? { ...o, ...data } : o);
      saveOrders(next);
      return next;
    });
  }, []);

  /** 删除订单 */
  const deleteOrder = useCallback((id) => {
    setOrders(prev => {
      const next = prev.filter(o => o.id !== id);
      saveOrders(next);
      return next;
    });
  }, []);

  /** 获取某天的订单（按开始时间排序） */
  const getOrdersByDate = useCallback((dateStr) => {
    return orders
      .filter(o => o.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [orders]);

  return { orders, addOrder, updateOrder, deleteOrder, getOrdersByDate };
}
