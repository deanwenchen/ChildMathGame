# 快速开始指南

## 前置要求

- Node.js 18+ 已安装
- npm 或 yarn 包管理器

## 安装步骤

### 1. 安装所有依赖

在项目根目录运行：

```bash
npm run install:all
```

这将自动安装根目录、frontend 和 backend 的所有依赖。

### 2. 或者分别安装

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

## 运行开发环境

### 同时启动前后端（推荐）

```bash
npm run dev
```

这将同时启动：
- 前端：http://localhost:5173
- 后端：http://localhost:3000

### 分别启动

```bash
# 前端
cd frontend
npm run dev

# 后端（另开终端）
cd backend
npm run dev
```

## 项目结构

```
arithmetic-learning-tool/
├── frontend/              # React 前端应用
│   ├── src/
│   │   ├── components/   # UI 组件
│   │   ├── pages/        # 页面组件
│   │   ├── contexts/     # React Context
│   │   └── App.tsx       # 主应用
│   └── package.json
├── backend/               # Express 后端服务
│   ├── src/
│   │   ├── controllers/  # 路由控制器
│   │   ├── services/     # 业务逻辑
│   │   ├── models/       # 数据模型
│   │   └── app.ts        # Express 应用
│   └── package.json
├── README.md
└── package.json
```

## 使用说明

1. 启动开发环境后，打开浏览器访问 http://localhost:5173
2. 在首页输入用户名开始使用
3. 选择练习模式（难度和运算类型）
4. 开始答题，系统会自动计分
5. 查看成绩和历史记录

## 构建生产版本

```bash
# 构建前端
npm run build

# 构建后端（TypeScript 编译）
cd backend
npm run build
```

## 常见问题

### 1. 端口被占用

修改端口配置：
- 前端：`frontend/vite.config.ts` 中的 `server.port`
- 后端：`backend/src/app.ts` 中的 `PORT`

### 2. 数据库初始化失败

确保 `backend/data` 目录存在且有写入权限。

### 3. 依赖安装失败

尝试清除缓存后重新安装：
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 下一步

- [查看完整文档](README.md)
- [查看 API 文档](http://localhost:3000/api)
- [开始开发](docs/)
