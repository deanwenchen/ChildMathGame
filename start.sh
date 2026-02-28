#!/bin/bash

echo "========================================"
echo "   儿童算术学习工具 - 启动脚本"
echo "========================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js"
    echo "请先安装 Node.js 18 或更高版本"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "[信息] 检测到 Node.js:"
node --version
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "[提示] 未检测到依赖，正在安装..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败"
        exit 1
    fi
    echo ""
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "[提示] 前端依赖未安装，正在安装..."
    echo ""
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 前端依赖安装失败"
        cd ..
        exit 1
    fi
    cd ..
    echo ""
fi

if [ ! -d "backend/node_modules" ]; then
    echo "[提示] 后端依赖未安装，正在安装..."
    echo ""
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 后端依赖安装失败"
        cd ..
        exit 1
    fi
    cd ..
    echo ""
fi

echo "========================================"
echo "   依赖安装完成，启动应用..."
echo "========================================"
echo ""
echo "前端地址: http://localhost:5173"
echo "后端API: http://localhost:3000/api"
echo ""
echo "按 Ctrl+C 可停止服务"
echo ""

# 启动开发服务器
npm run dev
