# CLAUDE.md — 陪拍日程工具项目规范

## 项目简介

供单人陪拍摄影师使用的网页端日程管理工具。
核心功能是可视化日历，管理拍摄订单和通勤时间。

---

## 技术约束

- **纯前端**，不依赖任何后端服务
- **框架**：React + Vite
- **数据存储**：localStorage，无需登录
- **部署目标**：GitHub Pages 或 Vercel，产物为静态文件
- **不引入**：数据库、服务端、用户认证相关的任何依赖

---

## 设计规范

所有 UI 开发必须严格遵守项目根目录的 `DESIGN.md`。
开始任何界面开发前，先读取 `DESIGN.md`，所有颜色、字体、圆角、阴影、组件样式均从中取值，不得自行发挥。

---

## 代码规范

- 组件文件用 PascalCase：`CalendarMonth.jsx`
- 工具函数用 camelCase：`detectConflict.js`
- 所有中文注释，保持可读性
- 每个组件只做一件事，拆分要细
- CSS 使用 CSS Variables，变量名参照 DESIGN.md 中的命名

---

## 文件结构

```
src/
├── components/
│   ├── Calendar/
│   │   ├── MonthView.jsx       # 月视图
│   │   ├── WeekView.jsx        # 周视图（核心）
│   │   └── DayView.jsx         # 日视图
│   ├── Order/
│   │   ├── OrderForm.jsx       # 新建/编辑订单模态框
│   │   ├── OrderCard.jsx       # 订单色块（周/日视图用）
│   │   └── OrderDetail.jsx     # 侧边栏订单详情
│   └── UI/
│       ├── Modal.jsx           # 通用模态框容器
│       └── Sidebar.jsx         # 右侧详情侧边栏
├── hooks/
│   ├── useOrders.js            # 订单 CRUD + localStorage 读写
│   └── useConflict.js          # 冲突检测逻辑
├── utils/
│   ├── timeUtils.js            # 时间计算工具函数
│   ├── conflictDetect.js       # 冲突检测算法
│   └── storage.js              # localStorage 封装
├── styles/
│   └── variables.css           # 所有 CSS Variables（从 DESIGN.md 转译）
├── App.jsx
└── main.jsx
```

---

## 核心数据结构

```javascript
// 订单对象
{
  id: string,           // uuid
  clientName: string,   // 客户名，必填
  date: string,         // "YYYY-MM-DD"，必填
  startTime: string,    // "HH:MM"，必填
  endTime: string,      // "HH:MM"，必填
  commuteBefore: number,// 前置通勤分钟，默认 60
  commuteAfter: number, // 后置通勤分钟，默认 60
  price: number,        // 价格（元），必填
  preference: string,   // 客户偏好备注，选填
  location: string,     // 拍摄地点，选填
  status: 'pending' | 'confirmed' | 'done',
  depositPaid: boolean, // 定金是否已收
  createdAt: string     // ISO 时间戳
}
```

---

## 冲突检测规则

同一天内对任意两订单 A、B 进行判断：

```
硬冲突：A 和 B 的拍摄时间段直接重叠
  → 两个色块红色边框，提示"时间冲突"

软冲突：拍摄时间不重叠，但含通勤的完整区间重叠
  → 黄色边框，提示"通勤可能紧张"

安全：完整占用区间（含通勤）不重叠
  → 正常显示
```

---

## 行为规范

- 不要做超出当前需求的功能，不要提前抽象
- 遇到不确定的需求，先问再动手
- 每次只改动一个模块，不要跨模块大范围重构
- 新增功能前检查是否与现有逻辑冲突
- 不要删除注释，除非对应代码已被删除
