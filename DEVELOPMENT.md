# 开发说明

## 项目已完成内容

### ✅ 后端 (Backend)

#### 数据库层
- [x] SQLite 数据库初始化 (`backend/src/database/database.ts`)
- [x] 用户模型 (User) - CRUD 操作
- [x] 成绩模型 (Score) - 完整的数据操作和统计查询

#### 业务逻辑层
- [x] 题目生成器 (`QuestionGenerator.service.ts`) - 支持四则运算，智能生成（减法非负、除法整除）
- [x] 答案验证器 (`AnswerValidator.service.ts`) - 精确验证 + 友好反馈
- [x] 计分系统 (`ScoreCalculator.service.ts`) - 基础分 + 难度加成 + 时间奖励

#### API 路由
- [x] `/api/users` - 用户管理（创建、查询）
- [x] `/api/scores` - 成绩管理（提交、查询、统计）
- [x] `/api/questions` - 题目生成和答案验证
- [x] 健康检查和限流中间件

### ✅ 前端 (Frontend)

#### 核心架构
- [x] React 18 + TypeScript
- [x] Vite 构建工具
- [x] React Router 路由管理
- [x] Material-UI 组件库
- [x] GameContext 全局状态管理
- [x] Axios API 服务封装

#### 页面组件
- [x] `WelcomePage` - 首页登录
- [x] `HomePage` - 主页，功能入口
- [x] `PracticePage` - 练习模式选择（难度、运算类型）
- [x] `PracticeGamePage` - 答题游戏界面（10题/轮）
- [x] `GameResultPage` - 游戏结果展示
- [x] `ScorePage` - 历史成绩和统计
- [x] `ProfilePage` - 个人资料管理

#### 功能特性
- [x] 四则运算支持（加减乘除）
- [x] 三个难度级别（简单、中等、困难）
- [x] 智能题目生成（保证减法非负、除法整除）
- [x] 实时计分系统
- [x] 成绩历史记录
- [x] 本地存储用户信息
- [x] 路由守卫（登录保护）
- [x] 响应式设计

## 运行项目

### 1. 安装依赖

```bash
# 安装所有依赖（推荐）
npm run install:all

# 或分别安装
npm install                    # 根目录
cd frontend && npm install     # 前端
cd ../backend && npm install   # 后端
```

### 2. 启动开发环境

```bash
# 方式1：同时启动前后端（推荐）
npm run dev

# 前端: http://localhost:5173
# 后端: http://localhost:3000
```

### 3. 分别启动

```bash
# 终端1 - 前端
cd frontend
npm run dev

# 终端2 - 后端
cd backend
npm run dev
```

## API 文档

### 用户接口
- `POST /api/users` - 创建用户
- `GET /api/users/:id` - 获取用户信息
- `GET /api/users` - 获取所有用户

### 成绩接口
- `POST /api/scores` - 提交成绩
- `GET /api/scores/user/:userId` - 获取用户历史成绩
- `GET /api/scores/user/:userId/summary` - 获取成绩统计摘要
- `GET /api/scores/user/:userId/recent` - 获取最近成绩

### 题目接口
- `GET /api/questions?difficulty=easy&operation=addition` - 生成题目
- `POST /api/questions/validate` - 验证答案
- `POST /api/questions/calculate-score` - 计算分数

## 项目结构

```
arithmetic-learning-tool/
├── frontend/                    # React 前端
│   ├── src/
│   │   ├── components/         # UI 组件
│   │   ├── pages/              # 页面组件
│   │   ├── hooks/              # React Hooks
│   │   ├── contexts/           # Context 状态管理
│   │   ├── services/           # API 服务
│   │   ├── utils/              # 工具函数
│   │   ├── types/              # TypeScript 类型
│   │   └── App.tsx             # 应用入口
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                     # Express 后端
│   ├── src/
│   │   ├── controllers/        # 路由控制器
│   │   ├── routes/             # 路由定义
│   │   ├── services/           # 业务逻辑
│   │   ├── models/             # 数据模型
│   │   ├── database/           # 数据库层
│   │   ├── middleware/         # 中间件
│   │   └── app.ts              # 应用入口
│   ├── data/                   # SQLite 数据库文件
│   ├── tsconfig.json
│   └── package.json
│
├── README.md                    # 项目说明
├── QUICKSTART.md                # 快速开始
├── DEVELOPMENT.md               # 开发说明（本文档）
└── package.json                 # 根目录（工作区配置）
```

## 技术栈

### 前端
- React 18.2.0
- TypeScript 5.0.0
- Vite 4.1.0
- Material-UI 5.11.0
- React Router 6.8.0
- Axios 1.3.0

### 后端
- Node.js 18 LTS
- Express 4.18.0
- SQLite3 5.1.0
- TypeScript 5.0.0

## 下一步开发建议

### 可选功能增强
1. **音效和动画**
   - 答对/答错音效
   - 题目切换动画
   - 进度条动画

2. **更多游戏模式**
   - 闯关模式（逐步解锁）
   - 计时挑战模式
   - 对战模式（本地多人）

3. **数据可视化**
   - 使用 Recharts 显示成绩趋势图
   - 难度分布饼图
   - 进步曲线图

4. **成就系统**
   - 完成特定数量练习获得勋章
   - 连续答对奖励
   - 难度挑战成就

5. **个性化设置**
   - 自定义题目数量
   - 主题切换（浅色/深色）
   - 音效开关

6. **离线支持**
   - Service Worker 缓存
   - 离线答题，联网同步

7. **导出功能**
   - 成绩报告导出为 PDF
   - 学习进度分享

### 代码优化
1. 添加单元测试（Jest + React Testing Library）
2. 添加 E2E 测试（Playwright）
3. 性能优化（代码分割、懒加载）
4. 错误边界处理
5. 加载状态优化

## 注意事项

1. **数据库文件**：`backend/data/arithmetic.db` 会自动创建
2. **端口占用**：如果 3000 或 5173 端口被占用，修改相应配置
3. **跨域问题**：开发环境已配置 proxy，生产环境需部署在同一域名下
4. **TypeScript**：确保 IDE 支持 TypeScript 以获得最佳开发体验

## 贡献指南

1. 遵循现有代码风格
2. 使用 TypeScript 类型
3. 编写清晰的组件注释
4. 保持组件单一职责
5. 测试新功能

## 问题反馈

如有问题或建议，欢迎提交 Issue。
