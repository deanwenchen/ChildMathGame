# 冒险模式设计系统 (Adventure Mode Design System)

## 项目概述

**项目名称**: 儿童算数小能手 - 冒险模式
**目标用户**: 6-8 岁儿童 (小学 1-2 年级)
**设计版本**: 1.0.0
**创建日期**: 2026-03-04

---

## 文档导航

### 核心文档

| 文档 | 说明 | 路径 |
|------|------|------|
| 🎨 视觉风格指南 | 色彩、字体、组件样式 | `/ui-design/adventure-mode/visual-style-guide.md` |
| 📐 线框图 | 6 个关键屏幕布局 | `/ui-design/adventure-mode/wireframes.md` |
| 🔄 用户流程图 | 7 个核心交互流程 | `/ui-design/adventure-mode/user-flows.md` |
| 👶 儿童友好指南 | 适龄设计规范 | `/ui-design/adventure-mode/child-friendly-guidelines.md` |
| ✨ 动画规格 | 完整动画系统 | `/ui-design/adventure-mode/animation-specs.md` |

---

## 设计系统总览

```
┌─────────────────────────────────────────────────────────────────┐
│                     冒险模式设计系统                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  视觉风格   │  │  组件库     │  │  图案库     │             │
│  │  Style      │  │  Components │  │  Icons      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │               │               │                       │
│         └───────────────┼───────────────┘                       │
│                         ▼                                       │
│              ┌─────────────────────┐                           │
│              │   屏幕设计 Screens   │                           │
│              │  ┌───────────────┐  │                           │
│              │  │ 冒险地图      │  │                           │
│              │  │ 宠物收集      │  │                           │
│              │  │ 装备商店      │  │                           │
│              │  │ 每日任务      │  │                           │
│              │  │ Boss 战斗     │  │                           │
│              │  └───────────────┘  │                           │
│              └─────────────────────┘                           │
│                         │                                       │
│         ┌───────────────┼───────────────┐                       │
│         ▼               ▼               ▼                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  用户流程   │  │  动画系统   │  │  音效系统   │             │
│  │  Flows      │  │  Motion     │  │  Sound      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 设计原则 (Design Principles)

### 1. 儿童优先 (Kids First)
- 大按钮 (最小 56x56px)
- 大文字 (最小 18px)
- 简单手势 (单击为主)
- 即时反馈

### 2. 教育为本 (Education First)
- 符合 pedagogy.md 教学原则
- 题目难度梯度合理
- 错题有详细解析
- 正向鼓励为主

### 3. 趣味驱动 (Fun Driven)
- 可爱宠物系统
- 丰富装备道具
- 成就奖励反馈
- 渐进式挑战

### 4. 可访问性 (Accessibility)
- WCAG 2.1 AA 标准
- 色盲友好设计
- 动画可减弱
- 音量可调节

---

## 色彩系统快速参考

```css
/* 主色 */
--primary-orange: #FF9F43;
--secondary-blue: #54A0FF;

/* 功能色 */
--success-green: #1DD1A1;
--error-red: #FF6B6B;
--warning-yellow: #FECA57;
--star-gold: #FFD700;

/* 背景色 */
--bg-cream: #FFF8F0;
--bg-white: #FFFFFF;

/* 文字色 */
--text-primary: #2D3436;
--text-secondary: #636E72;
```

---

## 字体系统快速参考

```css
/* 字号 */
--text-base: 18px;      /* 正文 */
--text-lg: 22px;        /* 小标题 */
--text-xl: 28px;        /* 卡片标题 */
--text-2xl: 36px;       /* 页面标题 */
--text-3xl: 48px;       /* 大数字 */
--text-4xl: 64px;       /* 超大显示 */
```

---

## 核心屏幕索引

### 1. 冒险地图 (Adventure Map)
**功能**: 关卡选择、进度查看
**关键元素**:
- 章节路径节点
- 星级进度显示
- 资源状态栏

[查看线框图](./wireframes.md#屏幕 1-冒险地图屏幕-adventure-map-screen)

### 2. 宠物收集 (Pet Collection)
**功能**: 宠物展示、孵化管理
**关键元素**:
- 宠物卡片网格
- 孵化进度显示
- 宠物详情弹窗

[查看线框图](./wireframes.md#屏幕 2-宠物收集屏幕-pet-collection-screen)

### 3. 装备商店 (Equipment Shop)
**功能**: 道具购买、装备管理
**关键元素**:
- 分类标签
- 商品卡片
- 购买确认弹窗

[查看线框图](./wireframes.md#屏幕 3-装备商店屏幕-equipment-shop-screen)

### 4. 每日任务 (Daily Quest Board)
**功能**: 任务追踪、奖励领取
**关键元素**:
- 任务进度条
- 领取按钮
- 批量领取

[查看线框图](./wireframes.md#屏幕 4-每日任务板-daily-quest-board)

### 5. Boss 战斗 (Boss Battle)
**功能**: 限时答题、挑战 Boss
**关键元素**:
- Boss 形象与血条
- 倒计时器
- 紧急状态提示

[查看线框图](./wireframes.md#屏幕 5-boss 战斗屏幕-boss-battle-screen)

### 6. 答题界面 (Answer Screen)
**功能**: 题目展示、选项选择
**关键元素**:
- 题目显示区
- 四选项按钮
- 进度指示器

[查看线框图](./wireframes.md#屏幕 6-答题界面通用-answer-screen---general)

---

## 核心交互流程索引

| 流程 | 说明 | 链接 |
|------|------|------|
| 开始关卡 | 选择并进入关卡 | [流程 1](./user-flows.md#流程 1-开始关卡-starting-a-level) |
| 答题流程 | 选择答案与反馈 | [流程 2](./user-flows.md#流程 2-答题流程-answering-questions) |
| 使用道具 | 装备使用流程 | [流程 3](./user-flows.md#流程 3-使用道具-using-equipment-during-a-level) |
| 孵化宠物 | 宠物蛋孵化 | [流程 4](./user-flows.md#流程 4-孵化宠物蛋-hatching-a-pet-egg) |
| Boss 战斗 | 战斗完整流程 | [流程 5](./user-flows.md#流程 5-boss 战斗完成-completing-a-boss-battle) |
| 领取奖励 | 任务奖励领取 | [流程 6](./user-flows.md#流程 6-领取任务奖励-claiming-quest-rewards) |
| 页面导航 | 页面跳转逻辑 | [流程 7](./user-flows.md#流程 7-页面导航流程-page-navigation) |

---

## 动画系统索引

### 页面转场
| 类型 | 时长 | 说明 |
|------|------|------|
| 滑入 | 300ms | 进入下一级 |
| 淡入 | 250ms | 弹窗显示 |
| 滑上 | 350ms | 模态全屏 |
| 缩放 | 400ms | 成就解锁 |

[查看动画规格](./animation-specs.md#2-页面转场动画-page-transitions)

### 反馈动画
| 类型 | 时长 | 说明 |
|------|------|------|
| 正确 | 500ms | 答案正确 |
| 错误 | 500ms | 答案错误 |
| 连击 | 400ms | 连击显示 |

[查看动画规格](./animation-specs.md#3-反馈动画-feedback-animations)

### 特殊动画
| 类型 | 时长 | 说明 |
|------|------|------|
| 孵化 | 8000ms | 宠物诞生 |
| 星级 | 1400ms | 三星揭示 |
| Boss | 1000ms | Boss  defeat |

[查看动画规格](./animation-specs.md#4-宠物孵化动画-pet-hatching-animation)

---

## 设计资源

### Figma 组件库
```
待创建 Figma 文件后更新链接
```

### 设计资源包
```
待创建 Sketch/Adobe XD 文件后更新链接
```

### 图标库
- [Phosphor Icons](https://phosphoricons.com/)
- [Tabler Icons](https://tabler-icons.io/)
- 自定义宠物/装备图标 (待制作)

### 字体资源
- Noto Sans SC (中文主字体)
- Source Han Sans CN (备选)

---

## 开发对接指南

### CSS 变量使用

```css
/* 在组件中使用设计令牌 */
.button {
  background: var(--primary-orange);
  color: var(--text-inverse);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
}
```

### React 组件结构建议

```tsx
// 按钮组件
<Button variant="primary" size="large" onClick={handleClick}>
  开始挑战
</Button>

// 卡片组件
<Card interactive onClick={handleCardClick}>
  <CardImage src={pet.image} />
  <CardTitle>{pet.name}</CardTitle>
  <CardSubtitle>等级 {pet.level}</CardSubtitle>
</Card>

// 进度条组件
<ProgressBar
  value={progress}
  max={100}
  color="primary"
  animated
/>
```

### 动画钩子

```tsx
// 使用动画 Hook
const { enter, exit } = usePageTransition();

// 使用序列动画
const { playSequence } = useAnimationSequence(HATCH_SEQUENCE);

// 使用粒子系统
const { spawn } = useParticleSystem({
  type: 'confetti',
  count: 50,
});
```

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| 1.0.0 | 2026-03-04 | 初始版本 - 完成核心设计系统 |

---

## 后续工作

### 待完成项目
- [ ] Figma 组件库搭建
- [ ] 宠物角色原画设计
- [ ] 音效资源制作
- [ ] 动效原型制作 (Lottie)
- [ ] 设计系统文档站点

### 设计验证计划
- [ ] 儿童可用性测试 (5-8 名)
- [ ] 家长访谈反馈
- [ ] A/B 测试方案
- [ ] 数据埋点规划

---

## 联系方式

**设计负责人**: UI Designer Agent
**项目**: 儿童算数小能手
**文档位置**: `D:\Claude\ChildMathGame\ui-design\adventure-mode\`

---

*最后更新：2026-03-04*
