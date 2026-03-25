@echo off
REM 好友系统集成测试脚本 (Windows)
REM 使用方法: test_friendship.bat [BASE_URL]

setlocal enabledelayedexpansion

set BASE_URL=%1
if "%BASE_URL%"=="" set BASE_URL=http://localhost:3000/api
set USER1_ID=1
set USER2_ID=2

echo =========================================
echo   好友系统 API 集成测试
echo   服务地址: %BASE_URL%
echo =========================================

set pass_count=0
set fail_count=0

echo.
echo ========== 1. 用户搜索测试 ==========

echo.
echo [测试] 搜索用户
curl -s -X GET "%BASE_URL%/friends/search?q=test&limit=5" -H "x-user-id: %USER1_ID%" -H "Content-Type: application/json"
echo.

echo.
echo [测试] 空搜索词
curl -s -X GET "%BASE_URL%/friends/search?q=" -H "x-user-id: %USER1_ID%" -H "Content-Type: application/json"
echo.

echo.
echo ========== 2. 好友请求测试 ==========

echo.
echo [测试] 获取待处理请求
curl -s -X GET "%BASE_URL%/friends/requests/pending" -H "x-user-id: %USER1_ID%" -H "Content-Type: application/json"
echo.

echo.
echo [测试] 发送好友请求
curl -s -X POST "%BASE_URL%/friends/request" -H "x-user-id: %USER1_ID%" -H "Content-Type: application/json" -d "{\"addresseeId\": %USER2_ID%}"
echo.

echo.
echo ========== 3. 好友列表测试 ==========

echo.
echo [测试] 获取好友列表
curl -s -X GET "%BASE_URL%/friends" -H "x-user-id: %USER1_ID%" -H "Content-Type: application/json"
echo.

echo.
echo [测试] 获取在线好友
curl -s -X GET "%BASE_URL%/friends/online" -H "x-user-id: %USER1_ID%" -H "Content-Type: application/json"
echo.

echo.
echo ========== 4. 加油功能测试 ==========

echo.
echo [测试] 获取加油消息类型
curl -s -X GET "%BASE_URL%/friends/cheers/messages" -H "Content-Type: application/json"
echo.

echo.
echo [测试] 获取未读加油数量
curl -s -X GET "%BASE_URL%/friends/cheers/unread" -H "x-user-id: %USER1_ID%" -H "Content-Type: application/json"
echo.

echo.
echo ========== 5. 在线状态测试 ==========

echo.
echo [测试] 更新在线状态
curl -s -X PUT "%BASE_URL%/friends/status" -H "x-user-id: %USER1_ID%" -H "Content-Type: application/json" -d "{\"status\": \"online\"}"
echo.

echo.
echo [测试] 更新离线状态
curl -s -X PUT "%BASE_URL%/friends/status" -H "x-user-id: %USER1_ID%" -H "Content-Type: application/json" -d "{\"status\": \"offline\"}"
echo.

echo.
echo =========================================
echo   测试完成
echo =========================================

endlocal