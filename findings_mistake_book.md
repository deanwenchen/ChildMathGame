# 错题本系统 - 设计与发现

## 方案概述

基于 `pedagogy.md` 中的"常见错误及对策"章节，设计错题本系统帮助儿童有效复习和掌握薄弱环节。

## 教育合规性校验（pedagogy.md）

### 错误类型分类对齐
根据 pedagogy.md 第六章节"常见错误及对策"：

| 错误类型 | 原因 | 对策 |
|----------|------|------|
| 不知道拆几 | 10 的组成不熟练 | 强化凑十歌记忆 |
| 拆分错误 | 数的分解不熟练 | 加强分解练习 |
| 忘记加剩数 | 步骤遗漏 | 强调"加剩数"步骤 |
| 计算太慢 | 熟练度不够 | 增加练习量，形成肌肉记忆 |

### 艾宾浩斯遗忘曲线
- 间隔复习：1 天、2 天、4 天、7 天、15 天
- 每次复习正确，间隔升级
- 复习错误，重置到第 1 天

## 交互风险预测

1. **挫败感风险**：儿童可能会对反复出现的错题感到挫败
   - 缓解：使用温和的鼓励语言，避免"错误"等负面词汇

2. **认知负荷**：过多的待复习题目可能造成压力
   - 缓解：每日限制复习题目数量（5-10 题）

3. **视觉反馈**：需要清晰的进度可视化
   - 缓解：使用星星、进度条等直观元素

## 逻辑边界

### 数据存储
- 使用 Local Storage 持久化错题数据
- Key 命名：`mistakeBook_v1`

### 题目结构
```typescript
interface MistakeRecord {
  id: string;           // 唯一标识
  expression: string;   // 题目表达式（如 "9+5"）
  userAnswer: number;   // 用户答案
  correctAnswer: number; // 正确答案
  errorType: ErrorType; // 错误类型
  mistakeCount: number; // 错误次数
  reviewCount: number;  // 已复习次数
  correctCount: number; // 连续正确次数
  lastReviewDate: string; // 最后复习日期
  nextReviewDate: string; // 下次复习日期
  createdAt: string;    // 首次记录时间
}
```

### 错误类型定义
```typescript
type ErrorType =
  | 'decomposition_error'  // 分解错误（拆小数错误）
  | 'calculation_error'    // 计算错误（10 加几算错）
  | 'step_missing'         // 步骤遗漏（忘记加剩数）
  | 'timeout'              // 超时
```

### 复习间隔（天）
```typescript
const REVIEW_INTERVALS = [1, 2, 4, 7, 15];
// 索引 0 = 第 1 次复习（1 天后）
// 索引 1 = 第 2 次复习（2 天后）
// 索引 2 = 第 3 次复习（4 天后）
// 索引 3 = 第 4 次复习（7 天后）
// 索引 4 = 第 5 次复习（15 天后）
// 5 次全对 = 掌握，移出复习队列
```

## 文件结构

```
frontend/src/
├── hooks/
│   └── useMistakeBook.ts      # 错题本状态管理 Hook
├── utils/
│   └── mistakeAnalyzer.ts     # 错题分析工具
└── types/
    └── index.ts               # 扩展类型定义
```

## 集成点

1. **GameContext.tsx**: 在答题逻辑中添加错题捕获
2. **PracticeGamePage.tsx**: 答错时调用 captureMistake
3. **ProfilePage.tsx**: 添加错题本入口
4. **App.tsx**: 添加复习页面路由 `/mistake-review`

## 实现完成情况（2026-03-03）

### ✅ 已完成

1. **类型定义扩展** (`types/index.ts`):
   - `ErrorType` - 错误类型
   - `MistakeRecord` - 错题记录
   - `MistakeBookStats` - 错题本统计
   - `MistakeFiltersState` - 筛选器状态

2. **工具函数** (`utils/mistakeAnalyzer.ts`):
   - `captureMistake()` - 捕获答错题目
   - `analyzeErrorType()` - 分析错误类型
   - `getReviewQueue()` - 根据艾宾浩斯曲线获取待复习队列
   - `recordReview()` - 记录复习结果
   - `generateVariantQuestion()` - 生成变式题（可选）
   - `getMistakeBookStats()` - 获取统计信息

3. **React Hook** (`hooks/useMistakeBook.ts`):
   - `useMistakeBook` - 完整状态管理
   - `useMistakeCapture` - 简化捕获 Hook

4. **上下文扩展** (`contexts/GameContext.tsx`):
   - 添加错题本状态
   - 添加捕获、复习、查询方法

5. **游戏集成** (`PracticeGamePage.tsx`):
   - 答错时自动调用 `captureMistake`

6. **复习页面** (`pages/MistakeReviewPage.tsx`):
   - 展示待复习队列
   - 用户作答后记录结果
   - 完成后的统计和反馈

7. **个人中心集成** (`ProfilePage.tsx`):
   - 显示待复习数量
   - 显示总错题数和已掌握数
   - 点击进入复习页面

8. **路由配置** (`App.tsx`):
   - 添加 `/mistake-review` 路由

### 现有组件（已存在于项目中）

- `components/mistakes/MistakeCard.tsx` - 错题卡片组件
- `components/mistakes/MistakeFilters.tsx` - 筛选器组件
- `components/mistakes/ReviewButton.tsx` - 复习按钮组件
- `pages/MistakeBookPage.tsx` - 错题本主页

## 复习算法说明

### 艾宾浩斯复习间隔

| 复习次数 | 间隔天数 | 说明 |
|----------|----------|------|
| 第 1 次 | 1 天 | 初次学习后的第 1 天 |
| 第 2 次 | 2 天 | 第 1 次复习后的第 2 天 |
| 第 3 次 | 4 天 | 第 2 次复习后的第 4 天 |
| 第 4 次 | 7 天 | 第 3 次复习后的第 7 天 |
| 第 5 次 | 15 天 | 第 4 次复习后的第 15 天 |

### 升级/重置规则

- **复习正确**: 进入下一间隔阶段
- **复习错误**: 重置到第 1 天（索引 0）
- **5 次全对**: 标记为"已掌握"，不再出现在复习队列中

## 下一步建议

1. 在凑十法游戏页面（`CuoshiGamePage.tsx`）中集成错题捕获
2. 添加变式题生成和练习功能
3. 添加复习提醒通知（可选）
4. 添加错题导出/打印功能（便于线下练习）
