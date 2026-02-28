@echo off
echo ========================================
echo    儿童算术学习工具 - 启动脚本
echo ========================================
echo.

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js
    echo 请先安装 Node.js 18 或更高版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [信息] 检测到 Node.js:
node --version
echo.

REM 检查是否已安装依赖
if not exist "node_modules\" (
    echo [提示] 未检测到依赖，正在安装...
    echo.
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo.
)

if not exist "frontend\node_modules\" (
    echo [提示] 前端依赖未安装，正在安装...
    echo.
    cd frontend
    call npm install
    if errorlevel 1 (
        echo [错误] 前端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo.
)

if not exist "backend\node_modules\" (
    echo [提示] 后端依赖未安装，正在安装...
    echo.
    cd backend
    call npm install
    if errorlevel 1 (
        echo [错误] 后端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo.
)

echo ========================================
echo    依赖安装完成，启动应用...
echo ========================================
echo.
echo 前端地址: http://localhost:5173
echo 后端API: http://localhost:3000/api
echo.
echo 按 Ctrl+C 可停止服务
echo.

REM 启动开发服务器
call npm run dev

pause
