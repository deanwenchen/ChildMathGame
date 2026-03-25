# 动画规格说明 (Animation Specifications)

## 1. 动画原则 (Animation Principles)

### 迪士尼动画原则应用

| 原则 | 应用说明 | 示例 |
|------|---------|------|
| 挤压与拉伸 | 按钮点击、角色跳跃 | 按下变扁，弹起恢复 |
| 预期动作 | 跳跃前下蹲 | 答题前按钮高亮 |
|  staged | 分阶段呈现 | 孵化动画分步骤 |
| 慢入慢出 | 缓动曲线 | ease-in-out |
| 弧形运动 | 自然轨迹 | 星星飞入路径 |
| 夸张 | 放大情绪 | 成功时大振幅庆祝 |
| 吸引力 | 可爱设计 | 宠物角色设计 |

### 动画时长标准

```css
/* 快速反馈 (即时操作) */
--duration-fast: 150ms;    /* 按钮点击 */
--duration-normal: 300ms;  /* 页面转场 */
--duration-slow: 500ms;    /* 复杂反馈 */

/* 庆祝动画 (可观看) */
--duration-celebration: 1500ms;  /* 星星飞溅 */
--duration-achievement: 2000ms;  /* 成就解锁 */

/* 循环动画 (背景) */
--duration-loop: 2000ms;   /* 脉动效果 */
```

### 缓动函数 (Easing Functions)

```css
/* 标准缓动 */
--ease-default: cubic-bezier(0.4, 0.0, 0.2, 1);      /* ease-in-out */
--ease-enter: cubic-bezier(0.0, 0.0, 0.2, 1);        /* ease-out */
--ease-exit: cubic-bezier(0.4, 0.0, 1, 1);           /* ease-in */

/* 弹性缓动 (活泼感) */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* 超调效果 */
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 弹簧效果 */

/* 儿童友好缓动 (更夸张) */
--ease-playful: cubic-bezier(0.34, 1.56, 0.64, 1);   /* 大幅超调 */
```

---

## 2. 页面转场动画 (Page Transitions)

### 滑入转场 (Slide In)

```css
/* 从右侧滑入 - 进入下一级 */
.slide-in-enter {
  transform: translateX(100%);
  opacity: 0;
}

.slide-in-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: all 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
}

.slide-in-exit {
  transform: translateX(0);
  opacity: 1;
}

.slide-in-exit-active {
  transform: translateX(-100%);
  opacity: 0;
  transition: all 300ms cubic-bezier(0.4, 0.0, 1, 1);
}
```

### 淡入转场 (Fade In)

```css
/* 淡入淡出 - 弹窗显示 */
.fade-enter {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: all 250ms ease-out;
}

.fade-exit {
  opacity: 1;
  transform: scale(1);
}

.fade-exit-active {
  opacity: 0;
  transform: scale(0.95);
  transition: all 200ms ease-in;
}
```

### 从下向上转场 (Slide Up)

```css
/* 从底部滑入 - 模态弹窗 */
.slide-up-enter {
  transform: translateY(100%);
}

.slide-up-enter-active {
  transform: translateY(0);
  transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-exit {
  transform: translateY(0);
}

.slide-up-exit-active {
  transform: translateY(100%);
  transition: transform 300ms cubic-bezier(0.4, 0.0, 1, 1);
}
```

### 缩放转场 (Scale)

```css
/* 中心放大 - 关卡完成 */
.scale-burst-enter {
  transform: scale(0);
  opacity: 0;
}

.scale-burst-enter-active {
  transform: scale(1);
  opacity: 1;
  transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 3. 反馈动画 (Feedback Animations)

### 正确答案反馈

```css
/* 按钮正确状态 */
@keyframes correct-pop {
  0% {
    transform: scale(1);
    background-color: #55EFC4;
  }
  30% {
    transform: scale(1.15);
    background-color: #1DD1A1;
  }
  50% {
    transform: scale(0.95);
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    background-color: #55EFC4;
  }
}

.answer-correct {
  animation: correct-pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 分数飞出动画 */
@keyframes score-fly {
  0% {
    opacity: 1;
    transform: translateY(0) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translateY(-30px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-60px) scale(1);
  }
}

.score-popup {
  animation: score-fly 600ms ease-out forwards;
}

/* 星星飞溅 */
@keyframes star-burst {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0) rotate(0deg);
  }
  20% {
    opacity: 1;
    transform: translate(0, 0) scale(1.5) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), var(--ty)) scale(0.3) rotate(360deg);
  }
}

.star-particle {
  animation: star-burst 800ms ease-out forwards;
}

/* 多方向星星 */
.star-container {
  --star-1: { --tx: -100px; --ty: -150px; };
  --star-2: { --tx: 100px; --ty: -120px; };
  --star-3: { --tx: 0px; --ty: -180px; };
  --star-4: { --tx: -80px; --ty: -80px; };
  --star-5: { --tx: 80px; --ty: -100px; };
}
```

### 错误答案反馈

```css
/* 按钮错误状态 */
@keyframes wrong-shake {
  0%, 100% {
    transform: translateX(0);
    background-color: #FF9999;
  }
  20% {
    transform: translateX(-10px);
  }
  40% {
    transform: translateX(10px);
  }
  60% {
    transform: translateX(-8px);
  }
  80% {
    transform: translateX(8px);
  }
}

.answer-wrong {
  animation: wrong-shake 500ms cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

/* 裂开效果 (可选) */
@keyframes crack-appear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

.crack-overlay {
  animation: crack-appear 400ms ease-out;
}

/* 伤心表情落下 */
@keyframes sad-drop {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(50px) scale(0.5);
  }
}

.sad-emoji {
  animation: sad-drop 600ms ease-in forwards;
}
```

### 连击反馈 (Combo)

```css
/* 连击数字跳动 */
@keyframes combo-pulse {
  0% {
    transform: scale(0.5) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) rotate(5deg);
    opacity: 1;
  }
  70% {
    transform: scale(0.9) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.combo-counter {
  animation: combo-pulse 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 连击火焰效果 */
@keyframes combo-fire {
  0% {
    filter: hue-rotate(0deg) brightness(1);
    transform: scale(1);
  }
  50% {
    filter: hue-rotate(30deg) brightness(1.2);
    transform: scale(1.1);
  }
  100% {
    filter: hue-rotate(60deg) brightness(1);
    transform: scale(1);
  }
}

.combo-fire-effect {
  animation: combo-fire 300ms ease-in-out;
}
```

---

## 4. 宠物孵化动画 (Pet Hatching Animation)

### 完整孵化序列

```javascript
const HATCH_SEQUENCE = [
  {
    name: 'egg-appear',
    duration: 500,
    easing: 'ease-out',
  },
  {
    name: 'egg-float',
    duration: 1000,
    easing: 'ease-in-out',
    loop: true,
  },
  {
    name: 'egg-shake-1',
    delay: 2000,
    duration: 500,
    easing: 'ease-in-out',
  },
  {
    name: 'crack-sound-1',
    delay: 2500,
    duration: 200,
  },
  {
    name: 'egg-shake-2',
    delay: 3000,
    duration: 500,
    easing: 'ease-in-out',
  },
  {
    name: 'crack-sound-2',
    delay: 3500,
    duration: 200,
  },
  {
    name: 'egg-shake-strong',
    delay: 4000,
    duration: 400,
    easing: 'ease-in-out',
  },
  {
    name: 'crack-loud',
    delay: 4400,
    duration: 300,
  },
  {
    name: 'egg-break',
    delay: 4700,
    duration: 300,
    easing: 'ease-out',
  },
  {
    name: 'light-burst',
    delay: 5000,
    duration: 500,
    easing: 'ease-out',
  },
  {
    name: 'pet-appear',
    delay: 5500,
    duration: 500,
    easing: 'ease-out',
  },
  {
    name: 'pet-bounce',
    delay: 6000,
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  {
    name: 'confetti',
    delay: 6500,
    duration: 1500,
    easing: 'ease-out',
  },
  {
    name: 'sparkle',
    delay: 7000,
    duration: 1000,
    easing: 'ease-out',
  },
];
```

### 蛋壳摇晃动画

```css
@keyframes egg-shake {
  0%, 100% {
    transform: rotate(0deg) translateY(0);
  }
  25% {
    transform: rotate(-10deg) translateY(-5px);
  }
  75% {
    transform: rotate(10deg) translateY(-5px);
  }
}

.egg-floating {
  animation: egg-float 2s ease-in-out infinite;
}

.egg-shaking {
  animation: egg-shake 0.5s ease-in-out;
}

@keyframes egg-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}
```

### 蛋壳破裂效果

```css
/* 裂纹出现 */
@keyframes crack-spread {
  0% {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    opacity: 0;
  }
  100% {
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

.egg-crack {
  stroke: #FF9F43;
  stroke-width: 2;
  animation: crack-spread 300ms ease-out forwards;
}

/* 蛋壳炸开 */
@keyframes shell-explode {
  0% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  100% {
    transform: scale(0.5) translateY(-50px);
    opacity: 0;
  }
}

.shell-half-left {
  animation: shell-explode-left 400ms ease-out forwards;
}

.shell-half-right {
  animation: shell-explode-right 400ms ease-out forwards;
}

@keyframes shell-explode-left {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-80px, -60px) rotate(-30deg);
    opacity: 0;
  }
}

@keyframes shell-explode-right {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(80px, -60px) rotate(30deg);
    opacity: 0;
  }
}
```

### 光芒爆发效果

```css
@keyframes light-burst {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

.light-burst-effect {
  background: radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%);
  animation: light-burst 500ms ease-out;
}

/* 闪烁星光 */
@keyframes sparkle-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.sparkle {
  animation: sparkle-pulse 800ms ease-in-out infinite;
}
```

### 彩带庆祝

```css
@keyframes confetti-fall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(500px) rotate(720deg);
    opacity: 0;
  }
}

.confetti {
  position: absolute;
  width: 10px;
  height: 20px;
  animation: confetti-fall 1500ms ease-in forwards;
}

/* 多种颜色 */
.confetti-red { background: #FF6B6B; }
.confetti-blue { background: #54A0FF; }
.confetti-green { background: #1DD1A1; }
.confetti-yellow { background: #FECA57; }
.confetti-purple { background: #A29BFE; }
```

---

## 5. 星级揭示动画 (Star Rating Reveal)

### 星星逐个点亮

```javascript
const STAR_REVEAL_SEQUENCE = [
  { star: 1, delay: 200, duration: 400 },
  { star: 2, delay: 400, duration: 400 },
  { star: 3, delay: 600, duration: 400 },
];
```

```css
/* 星星初始状态 */
.star {
  fill: #DFE6E9;  /* 灰色未激活 */
  transform: scale(0.8);
  opacity: 0.5;
}

/* 星星点亮 */
@keyframes star-lightup {
  0% {
    fill: #DFE6E9;
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    fill: #FFE44D;
    transform: scale(1.3);
    opacity: 1;
  }
  70% {
    fill: #FFD700;
    transform: scale(0.9);
  }
  100% {
    fill: #FFD700;
    transform: scale(1);
    opacity: 1;
  }
}

.star-activated {
  animation: star-lightup 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* 星星发光效果 */
@keyframes star-glow {
  0%, 100% {
    filter: drop-shadow(0 0 5px #FFD700);
  }
  50% {
    filter: drop-shadow(0 0 15px #FFD700);
  }
}

.star-glowing {
  animation: star-glow 1500ms ease-in-out infinite;
}
```

### 星级文字揭示

```css
@keyframes rating-slide-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.rating-text {
  animation: rating-slide-up 500ms ease-out forwards;
  animation-delay: 1400ms;  /* 等星星全部点亮后 */
}
```

---

## 6. Boss 战斗动画 (Boss Battle Animations)

### Boss 受击动画

```css
@keyframes boss-hit {
  0% {
    transform: translateX(0) scale(1);
    filter: brightness(1);
  }
  20% {
    transform: translateX(-20px) scale(0.95);
    filter: brightness(2);  /* 闪白 */
  }
  40% {
    transform: translateX(20px) scale(1.05);
    filter: brightness(0.8);
  }
  60% {
    transform: translateX(-10px) scale(0.98);
  }
  80% {
    transform: translateX(10px) scale(1.02);
  }
  100% {
    transform: translateX(0) scale(1);
    filter: brightness(1);
  }
}

.boss-hit {
  animation: boss-hit 400ms ease-out;
}
```

### Boss 倒下动画

```css
@keyframes boss-defeat {
  0% {
    transform: rotate(0deg) translateY(0);
    opacity: 1;
  }
  30% {
    transform: rotate(-5deg) translateY(-10px);
    opacity: 0.8;
  }
  100% {
    transform: rotate(90deg) translateY(100px);
    opacity: 0;
  }
}

.boss-defeated {
  animation: boss-defeat 1000ms ease-in forwards;
}
```

### 血条减少动画

```css
.health-bar-fill {
  transition: width 500ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* 血条闪烁警告 */
@keyframes health-warning {
  0%, 100% {
    background-color: #1DD1A1;  /* 绿色 */
  }
  50% {
    background-color: #FECA57;  /* 黄色警告 */
  }
}

.health-bar-low {
  animation: health-warning 500ms ease-in-out infinite;
}

@keyframes health-critical {
  0%, 100% {
    background-color: #FF6B6B;  /* 红色 */
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}

.health-bar-critical {
  animation: health-critical 300ms ease-in-out infinite;
}
```

### 倒计时紧急动画

```css
@keyframes timer-urgent {
  0%, 100% {
    color: #FF6B6B;
    transform: scale(1);
  }
  50% {
    color: #FF9999;
    transform: scale(1.1);
  }
}

.timer-urgent {
  animation: timer-urgent 500ms ease-in-out infinite;
}

/* 背景脉动 */
@keyframes bg-urgent {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(0.95);
  }
}

.battle-urgent {
  animation: bg-urgent 500ms ease-in-out infinite;
}
```

---

## 7. 按钮交互动画 (Button Interaction Animations)

### 标准按钮状态

```css
.btn {
  transition: all 150ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #E67E22, 0 8px 16px rgba(230,126,34,0.4);
}

.btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #E67E22, 0 2px 4px rgba(230,126,34,0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

### 脉冲按钮 (引导点击)

```css
@keyframes btn-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 0 #E67E22, 0 6px 12px rgba(230,126,34,0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 0 #E67E22, 0 8px 20px rgba(230,126,34,0.5);
  }
}

.btn-attention {
  animation: btn-pulse 2s ease-in-out infinite;
}
```

### 涟漪效果 (点击反馈)

```css
.btn-ripple {
  position: relative;
  overflow: hidden;
}

.btn-ripple::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: scale(0);
  animation: ripple 600ms ease-out;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

---

## 8. 加载动画 (Loading Animations)

### 进度条加载

```css
@keyframes progress-bar-slide {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loading-bar {
  background: linear-gradient(
    90deg,
    #FFB976 0%,
    #FF9F43 25%,
    #FFB976 50%,
    #FF9F43 75%,
    #FFB976 100%
  );
  background-size: 200% 100%;
  animation: progress-bar-slide 1.5s linear infinite;
}
```

### 跳动加载指示器

```css
@keyframes bounce-loading {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.loading-dot {
  animation: bounce-loading 600ms ease-in-out infinite;
}

.loading-dot:nth-child(2) {
  animation-delay: 100ms;
}

.loading-dot:nth-child(3) {
  animation-delay: 200ms;
}
```

### 宠物加载动画

```css
/* 宠物跑步动画 */
@keyframes pet-run {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(10px) rotate(5deg);
  }
  75% {
    transform: translateX(-10px) rotate(-5deg);
  }
}

.loading-pet {
  animation: pet-run 800ms ease-in-out infinite;
}

/* 云朵飘动 */
@keyframes cloud-float {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(20px);
  }
}

.loading-cloud {
  animation: cloud-float 3s ease-in-out infinite;
}
```

---

## 9. 成就解锁动画 (Achievement Unlock Animation)

```css
/* 徽章飞入 */
@keyframes badge-fly-in {
  0% {
    opacity: 0;
    transform: translateY(100px) scale(0) rotate(-180deg);
  }
  60% {
    opacity: 1;
    transform: translateY(-20px) scale(1.2) rotate(10deg);
  }
  80% {
    transform: translateY(10px) scale(0.95) rotate(-5deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

.badge-unlock {
  animation: badge-fly-in 800ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 光芒环绕 */
@keyframes ring-light {
  0% {
    transform: scale(0.8) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1.5) rotate(360deg);
    opacity: 0;
  }
}

.ring-light-effect {
  animation: ring-light 1000ms ease-out;
}

/* 文字弹跳 */
@keyframes text-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.achievement-text {
  animation: text-bounce 400ms ease-out;
  animation-delay: 800ms;
}
```

---

## 10. 性能优化建议 (Performance Optimization)

### 使用 transform 而非 position

```css
/* ✅ 推荐 - 使用 transform (GPU 加速) */
.movable {
  transform: translateX(100px);
}

/* ❌ 避免 - 使用 left/top (CPU 重排) */
.movable {
  left: 100px;
}
```

### 合理使用 will-change

```css
/* 对频繁动画的元素提示浏览器优化 */
.animated-element {
  will-change: transform, opacity;
}

/* 动画结束后移除 */
.after-animation {
  will-change: auto;
}
```

### 减少重绘区域

```css
/* 使用硬件加速层 */
.hw-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### 动画帧率控制

```javascript
// 使用 requestAnimationFrame
function animate(timestamp) {
  // 更新动画
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// 避免在动画中使用 setInterval
```

### 粒子数量限制

```javascript
// 最大粒子数
const MAX_PARTICLES = {
  celebration: 50,    // 庆祝场景
  feedback: 20,       // 反馈粒子
  background: 10,     // 背景装饰
};
```

---

## 11. 动画测试清单 (Animation Testing Checklist)

### 视觉测试
- [ ] 动画流畅无卡顿
- [ ] 缓动曲线符合预期
- [ ] 颜色变化正确
- [ ] 粒子效果完整

### 性能测试
- [ ] 60fps 稳定运行
- [ ] 内存无泄漏
- [ ] 多动画同时不卡顿
- [ ] 低端设备可接受

### 可用性测试
- [ ] 动画时长适中
- [ ] 不引起眩晕
- [ ] 可跳过长动画
- [ ] 减弱模式正常

### 兼容测试
- [ ] iOS Safari 正常
- [ ] Android Chrome 正常
- [ ] 横竖屏切换正常
- [ ] 不同分辨率正常
