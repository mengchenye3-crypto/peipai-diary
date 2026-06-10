# DESIGN.md — 陪拍日程工具设计规范

## 设计定位

面向陪拍摄影师的个人日程管理工具。风格关键词：**可爱、清爽、薄荷奶油感**。
像一本清新的日系手账本，带着淡淡的薄荷凉意。
克制的配色，圆润的形态，每次打开都有一点小愉悦感。

---

## 色彩系统

```
主色       --color-primary:      #6DCFB0   /* 薄荷绿，清透不刺眼 */
主色深     --color-primary-dark: #4DB898   /* 悬停/按压状态 */
主色浅     --color-primary-light:#C2EDE3   /* 背景浅染/标签底色 */
主色极浅   --color-primary-mist: #E8F8F4   /* 大面积浅底 */

辅色       --color-accent:       #FFCF77   /* 奶油黄，点缀用 */
辅色浅     --color-accent-light: #FFF8E7   /* 辅色背景 */

背景       --color-bg:           #F4FBF8   /* 极浅薄荷白 */
卡片背景   --color-surface:      #FFFFFF
边框       --color-border:       #C2EDE3   /* 薄荷细边框 */

文字主色   --color-text:         #1F3D35   /* 深墨绿，柔和不突兀 */
文字次色   --color-text-sub:     #6A9E8F   /* 灰绿，辅助信息 */
文字占位   --color-text-muted:   #A8D4C8
```

### 订单状态色

```
待确认     --color-pending:      #FFBF47   /* 暖黄，配薄荷很和谐 */
待确认浅   --color-pending-bg:   #FFF8E0
已确认     --color-confirmed:    #6DCFB0   /* 主题薄荷绿 */
已确认浅   --color-confirmed-bg: #C2EDE3
已完成     --color-done:         #AECCC6   /* 灰薄荷，低调退场 */
已完成浅   --color-done-bg:      #EBF5F3
通勤缓冲   opacity: 0.25 基于对应状态色，虚线边框
冲突警告   --color-conflict:     #FF7F7F   /* 柔化的红 */
软冲突     --color-soft-conflict:#FFD93D
```

---

## 字体

```css
/* 中英文主字体 */
font-family: 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans SC', sans-serif;

/* 数字/时间专用 */
font-family: 'DM Sans', 'Inter', sans-serif;

/* 字号阶梯 */
--text-xs:   11px;
--text-sm:   13px;
--text-base: 15px;
--text-md:   17px;
--text-lg:   20px;
--text-xl:   26px;

/* 字重 */
--font-normal:  400;
--font-medium:  500;
--font-bold:    600;
```

---

## 圆角与间距

```css
--radius-sm:   8px;
--radius-md:   12px;
--radius-lg:   16px;
--radius-xl:   24px;
--radius-full: 9999px;

--space-xs:  4px;
--space-sm:  8px;
--space-md:  16px;
--space-lg:  24px;
--space-xl:  32px;
--space-2xl: 48px;
```

---

## 阴影

```css
--shadow-sm: 0 2px 8px rgba(109, 207, 176, 0.12);
--shadow-md: 0 4px 16px rgba(109, 207, 176, 0.18);
--shadow-lg: 0 8px 32px rgba(109, 207, 176, 0.22);
--shadow-modal: 0 16px 48px rgba(31, 61, 53, 0.18);
```

---

## 组件规范

### 按钮

```
主按钮：背景 #6DCFB0，白色文字，border-radius: 9999px
        padding: 10px 24px，font-weight: 600
        悬停：背景 #4DB898，translateY(-1px)

次按钮：背景透明，边框 1.5px solid #6DCFB0，薄荷绿文字
        悬停：背景 #E8F8F4

危险按钮：背景 #FFF5F5，文字 #FF7F7F
```

### 输入框

```
背景：#FFFFFF
边框：1.5px solid #C2EDE3
圆角：12px
聚焦：边框 #6DCFB0 + box-shadow: 0 0 0 3px rgba(109,207,176,0.15)
placeholder：#A8D4C8
```

### 标签/状态徽章

```
圆角：9999px
padding：3px 10px
字号：12px，font-weight: 500
待确认：背景 #FFF8E0，文字 #D4920A
已确认：背景 #C2EDE3，文字 #3A9E82
已完成：背景 #EBF5F3，文字 #6A9E8F
```

### 日历格子

```
普通日期：背景 #FFFFFF，圆角 12px
今天：背景 #C2EDE3，边框 1.5px solid #6DCFB0
选中：背景 #6DCFB0，文字白色
周末数字：颜色 #6DCFB0
有订单：右上角小圆点，颜色对应订单状态
```

### 订单色块（周视图/日视图）

```
圆角：8px
padding：6px 8px
文字：白色，font-size: 12px
通勤块：同色系 opacity 0.25，1px dashed 边框
冲突边框：2px solid #FF7F7F + box-shadow: 0 0 0 2px rgba(255,127,127,0.3)
```

### 模态框

```
圆角：24px
背景：#FFFFFF
最大宽度：480px
遮罩：rgba(31, 61, 53, 0.4)
进入动画：translateY(20px) → translateY(0)，250ms ease-out
```

---

## 装饰细节（可爱感来源）

```
- 顶部 Logo 区域放小图标：🌿 或 📷
- 页面背景极微弱圆点纹理（opacity: 0.025，颜色 #6DCFB0）
- 空状态配线条风小插画（薄荷绿调）
- 成功保存时短暂出现薄荷绿 ✓ 弹出动画
- 今天日期格子有浅绿光晕
- 侧边栏头部用渐变：linear-gradient(135deg, #C2EDE3, #FFF8E7)
- 快捷时长按钮用胶囊形，默认浅薄荷背景，选中变深薄荷
```

---

## 动效原则

```
- 过渡 duration：150ms ~ 250ms
- easing：ease-out 进入，ease-in 退出
- 模态框：slide-up
- 侧边栏：slide-in-right
- 订单色块 hover：scale(1.01) + shadow 加深
- 遵守 prefers-reduced-motion
```

---

## 禁止事项

```
- 不用纯黑 #000000 或冷灰背景
- 不用蓝色、紫色系主色
- 圆角最小 8px，不允许直角
- 不用过重阴影
- 按钮文字不全大写
- 不超过 3 种主要字重
```
