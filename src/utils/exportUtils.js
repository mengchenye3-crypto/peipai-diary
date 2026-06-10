/* 数据导出工具函数 */

const STATUS_LABEL = {
  pending:   '待确认',
  confirmed: '已确认',
  done:      '已完成',
};

/**
 * 生成本月订单文本摘要（适合复制到微信/备忘录）
 * @param {object[]} orders  - 当月订单列表（已排序）
 * @param {number}   year
 * @param {number}   month   - 0-indexed
 * @returns {string}
 */
export function buildTextSummary(orders, year, month) {
  const title = `📷 ${year}年${month + 1}月 陪拍订单摘要`;
  const sep   = '─────────────────';

  if (orders.length === 0) {
    return `${title}\n${sep}\n（本月暂无订单）`;
  }

  /* 按日期排序 */
  const sorted = [...orders].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.startTime.localeCompare(b.startTime);
  });

  /* 收入统计（仅已确认 + 已完成） */
  const income = sorted
    .filter(o => o.status === 'confirmed' || o.status === 'done')
    .reduce((s, o) => s + (Number(o.price) || 0), 0);

  const counts = {
    pending:   sorted.filter(o => o.status === 'pending').length,
    confirmed: sorted.filter(o => o.status === 'confirmed').length,
    done:      sorted.filter(o => o.status === 'done').length,
  };

  /* 逐单拼接 */
  const lines = sorted.map((o, i) => {
    const parts = [
      `${i + 1}. ${formatDisplayDate(o.date)} ${o.startTime}–${o.endTime}`,
      `   👤 ${o.clientName}  |  ${STATUS_LABEL[o.status]}`,
      `   💴 ¥${Number(o.price).toLocaleString()}${o.depositPaid ? '（定金已收）' : ''}`,
    ];
    if (o.location)   parts.push(`   📍 ${o.location}`);
    if (o.preference) parts.push(`   💬 ${o.preference}`);
    return parts.join('\n');
  });

  const summary = [
    title,
    sep,
    `共 ${sorted.length} 单  |  待确认 ${counts.pending}  已确认 ${counts.confirmed}  已完成 ${counts.done}`,
    `收入合计（确认+完成）：¥${income.toLocaleString()}`,
    sep,
    lines.join('\n\n'),
    sep,
    `导出自 潘潘的陪拍日记 🐻`,
  ];

  return summary.join('\n');
}

/**
 * 生成 CSV 内容（UTF-8 BOM，Excel 可直接打开）
 * @param {object[]} orders
 * @param {number}   year
 * @param {number}   month
 * @returns {string}
 */
export function buildCSV(orders, year, month) {
  const BOM = '﻿';   // Excel 识别 UTF-8 所需 BOM

  const header = ['日期','星期','客户名','开始时间','结束时间',
    '前通勤(分钟)','后通勤(分钟)','价格(元)','状态','定金已收','地点','备注'];

  const WEEKDAYS = ['日','一','二','三','四','五','六'];

  const rows = [...orders]
    .sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      return d !== 0 ? d : a.startTime.localeCompare(b.startTime);
    })
    .map(o => {
      const [y, m, d] = o.date.split('-');
      const weekday = WEEKDAYS[new Date(Number(y), Number(m)-1, Number(d)).getDay()];
      return [
        o.date,
        `周${weekday}`,
        o.clientName,
        o.startTime,
        o.endTime,
        o.commuteBefore ?? 60,
        o.commuteAfter  ?? 60,
        o.price,
        STATUS_LABEL[o.status] || o.status,
        o.depositPaid ? '是' : '否',
        o.location   || '',
        o.preference || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

  return BOM + [header.join(','), ...rows].join('\r\n');
}

/**
 * 触发浏览器下载文件
 * @param {string} content
 * @param {string} filename
 * @param {string} mimeType
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* 内部辅助：日期字符串格式化显示 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const WEEKDAYS  = ['日','一','二','三','四','五','六'];
  const weekday   = WEEKDAYS[new Date(Number(y), Number(m)-1, Number(d)).getDay()];
  return `${Number(m)}月${Number(d)}日（周${weekday}）`;
}
