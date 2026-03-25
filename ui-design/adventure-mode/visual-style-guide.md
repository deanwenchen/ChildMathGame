# 冒险模式视觉风格指南 (Adventure Mode Visual Style Guide)

## 1. 色彩系统 (Color Palette)

### 主色调 (Primary Colors)
```css
/* 主色 - 活力橙 (Energy Orange) */
--primary-orange: #FF9F43;      /* 主按钮、重要交互 */
--primary-orange-light: #FFB976; /* 悬停状态 */
--primary-orange-dark: #E67E22;  /* 按下状态 */

/* 辅色 - 天空蓝 (Sky Blue) */
--secondary-blue: #54A0FF;       /* 信息提示、次要按钮 */
--secondary-blue-light: #7AB8FF; /* 悬停状态 */
--secondary-blue-dark: #2E86DE;  /* 按下状态 */
```

### 功能色 (Functional Colors)
```css
/* 成功 - 草地绿 */
--success-green: #1DD1A1;        /* 正确答案、完成状态 */
--success-green-light: #55EFC4;

/* 错误 - 柔和红 */
--error-red: #FF6B6B;            /* 错误答案、警告 (柔和不刺眼) */
--error-red-light: #FF9999;

/* 警告 - 柠檬黄 */
--warning-yellow: #FECA57;       /* 倒计时、注意提示 */
--warning-yellow-light: #FFD93D;

/* 星星 - 金色 */
--star-gold: #FFD700;            /* 星级评价、成就 */
--star-gold-light: #FFE44D;
```

### 背景色 (Background Colors)
```css
/* 主背景 - 奶油白 */
--bg-cream: #FFF8F0;             /* 页面主背景 */

/* 卡片背景 - 纯白 */
--bg-white: #FFFFFF;             /* 卡片、弹窗背景 */

/* 游戏背景 - 渐变天空 */
--bg-sky-gradient-start: #87CEEB; /* 游戏场景顶部 */
--bg-sky-gradient-end: #E0F7FA;   /* 游戏场景底部 */
```

### 中性色 (Neutral Colors)
```css
--text-primary: #2D3436;         /* 主要文字 */
--text-secondary: #636E72;       /* 次要文字 */
--text-disabled: #B2BEC3;        /* 禁用文字 */
--border-light: #DFE6E9;         /* 边框 */
--shadow-soft: rgba(45, 52, 54, 0.1); /* 柔和阴影 */
```

### 色彩可访问性 (Accessibility)
所有色彩组合通过 WCAG 2.1 AA 标准：
- 正文文字对比度 ≥ 4.5:1
- 大文字对比度 ≥ 3:1
- 色盲友好 (不单独依赖颜色传达信息)

---

## 2. 字体排印 (Typography)

### 中文字体栈
```css
font-family: 'Noto Sans SC', 'Source Han Sans CN', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

### 字号系统 (基于 16px = 1rem)
```css
/* 标题层级 */
--text-xs: 12px;      /* 辅助说明 */
--text-sm: 14px;      /* 标签、按钮小字 */
--text-base: 18px;    /* 正文 (儿童易读) */
--text-lg: 22px;      /* 小标题 */
--text-xl: 28px;      /* 卡片标题 */
--text-2xl: 36px;     /* 页面标题 */
--text-3xl: 48px;     /* 大数字显示 */
--text-4xl: 64px;     /* 得分、倒计时 */

/* 字重 */
--font-normal: 400;
--font-medium: 500;
--font-bold: 700;
```

### 行高与间距
```css
--leading-tight: 1.25;    /* 紧凑 */
--leading-normal: 1.5;    /* 正文 */
--leading-relaxed: 1.75;  /* 宽松 (儿童阅读) */

--tracking-normal: 0;
--tracking-wide: 0.05em;  /* 标题 */
```

---

## 3. 图标风格 (Icon Style)

### 设计原则
- **圆润可爱**: 所有图标使用圆角 (border-radius: 4px+)
- **简洁轮廓**: 2px 描边，内部填充
- **统一尺寸**: 24x24, 32x32, 48x48, 64x64
- **色彩鲜明**: 配合功能色使用

### 图标分类

#### 导航图标 (24x24)
```
🏠 首页    🔙 返回    ⚙️ 设置    ❓ 帮助
```

#### 功能图标 (32x32)
```
⭐ 星星    💎 宝石    🎁 奖励    📚 学习
🎮 游戏    👤 个人    🏆 成就    🔊 声音
```

#### 大图标 (48x48+)
```
🐾 宠物蛋   ⚔️ 武器    🛡️ 护盾    👢 靴子
📜 任务    🗺️ 地图    ⚡ 能量    ❤️ 生命
```

### 图标库推荐
- [Phosphor Icons](https://phosphoricons.com/) - 圆润风格
- [Tabler Icons](https://tabler-icons.io/) - 简洁线条
- 自定义绘制宠物/装备相关图标

---

## 4. 按钮样式 (Button Styles)

### 主按钮 (Primary Button)
```css
.btn-primary {
  background: linear-gradient(180deg, #FFB976 0%, #FF9F43 100%);
  border: 3px solid #E67E22;
  border-radius: 16px;
  padding: 16px 32px;
  font-size: 20px;
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  box-shadow: 0 4px 0 #E67E22, 0 6px 12px rgba(230,126,34,0.4);
  min-width: 160px;
  min-height: 56px;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #E67E22, 0 8px 16px rgba(230,126,34,0.4);
}

.btn-primary:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #E67E22, 0 2px 4px rgba(230,126,34,0.4);
}
```

### 次要按钮 (Secondary Button)
```css
.btn-secondary {
  background: linear-gradient(180deg, #7AB8FF 0%, #54A0FF 100%);
  border: 3px solid #2E86DE;
  border-radius: 16px;
  padding: 14px 28px;
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  box-shadow: 0 4px 0 #2E86DE, 0 6px 12px rgba(46,134,222,0.3);
}
```

### 成功按钮 (Success Button)
```css
.btn-success {
  background: linear-gradient(180deg, #55EFC4 0%, #1DD1A1 100%);
  border: 3px solid #10AC84;
  border-radius: 16px;
  padding: 14px 28px;
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  box-shadow: 0 4px 0 #10AC84, 0 6px 12px rgba(16,172,132,0.3);
}
```

### 图标按钮 (Icon Button)
```css
.btn-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid #E67E22;
  background: #FFB976;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 0 #E67E22;
}
```

### 最小点击区域
所有按钮必须满足:
- 最小尺寸: 56x56px (移动端友好)
- 图标按钮：至少 48x48px
- 按钮间距：至少 12px

---

## 5. 卡片样式 (Card Styles)

### 基础卡片
```css
.card {
  background: #FFFFFF;
  border-radius: 20px;
  border: 3px solid #DFE6E9;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
```

### 可点击卡片
```css
.card-interactive {
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-interactive:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-color: #54A0FF;
}

.card-interactive:active {
  transform: translateY(-2px);
}
```

### 进度卡片
```css
.card-progress {
  background: linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%);
  border-radius: 20px;
  padding: 16px;
}

.progress-bar {
  height: 12px;
  background: #DFE6E9;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD700 0%, #FF9F43 100%);
  border-radius: 6px;
  transition: width 0.5s ease;
}
```

---

## 6. 阴影系统 (Shadow System)

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 2px 4px rgba(0,0,0,0.06);
--shadow-md: 0 4px 8px rgba(0,0,0,0.08);
--shadow-lg: 0 6px 16px rgba(0,0,0,0.1);
--shadow-xl: 0 10px 24px rgba(0,0,0,0.12);
--shadow-2xl: 0 16px 40px rgba(0,0,0,0.16);

/* 彩色阴影 (用于按钮) */
--shadow-primary: 0 4px 0 #E67E22, 0 6px 12px rgba(230,126,34,0.4);
--shadow-secondary: 0 4px 0 #2E86DE, 0 6px 12px rgba(46,134,222,0.3);
```

---

## 7. 圆角系统 (Radius System)

```css
--radius-sm: 8px;       /* 小元素 */
--radius-md: 12px;      /* 输入框 */
--radius-lg: 16px;      /* 按钮 */
--radius-xl: 20px;      /* 卡片 */
--radius-2xl: 28px;     /* 大卡片 */
--radius-full: 9999px;  /* 圆形 */
```

---

## 8. 间距系统 (Spacing System)

基于 4px 网格:
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

## 9. 响应式断点 (Responsive Breakpoints)

```css
/* 手机竖屏 */
--bp-phone-portrait: 375px;
/* 手机横屏 */
--bp-phone-landscape: 667px;
/* 平板竖屏 */
--bp-tablet-portrait: 768px;
/* 平板横屏 */
--bp-tablet-landscape: 1024px;
/* 桌面 */
--bp-desktop: 1280px;
```

---

## 10. 暗黑模式适配 (Dark Mode Adaptation)

```css
@media (prefers-color-scheme: dark) {
  --bg-cream: #1A1A2E;
  --bg-white: #16213E;
  --text-primary: #F8F9FA;
  --text-secondary: #ADB5BD;
  --border-light: #343A40;

  /* 调整色彩饱和度 */
  --primary-orange: #FF8C42;
  --secondary-blue: #4A90E2;
}
```
