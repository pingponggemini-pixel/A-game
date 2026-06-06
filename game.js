const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 直接在畫布上畫一個橘色正方形（X: 100, Y: 400, 寬: 40, 高: 60）
ctx.fillStyle = '#ff922b';
ctx.fillRect(100, 400, 40, 60);

console.log("成功畫出方塊了！");
