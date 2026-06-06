const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 遊戲物理設定
const GRAVITY = 0.5; // 重力加速度

// 楓之谷主角物件
const player = {
    x: 100,
    y: 300,          // 讓角色一開始從空中掉下來測試重力
    width: 40,
    height: 60,
    color: '#ff922b',
    vx: 0,           // X軸速度（左右移動）
    vy: 0,           // Y軸速度（上下跳躍/掉落）
    speed: 5,        // 移動速度
    jumpForce: 12,   // 跳躍力（數字越大跳越高）
    isGrounded: false // 是否踩在地面上
};

// 紀錄鍵盤按下的狀態
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// 監聽鍵盤按下事件
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.ArrowLeft = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.ArrowRight = true;
    if (e.key === ' ' || e.key === 'Spacebar') keys.Space = true; // 空白鍵
});

// 監聽鍵盤放開事件
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.ArrowLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.ArrowRight = false;
    if (e.key === ' ' || e.key === 'Spacebar') keys.Space = false;
});

// 遊戲邏輯更新
function update() {
    // 1. 處理左右移動
    if (keys.ArrowLeft) {
        player.vx = -player.speed;
    } else if (keys.ArrowRight) {
        player.vx = player.speed;
    } else {
        player.vx = 0; // 沒按按鍵就停下
    }

    // 2. 處理跳躍（只有在踩在地上時才能跳）
    if (keys.Space && player.isGrounded) {
        player.vy = -player.jumpForce; // 往上跳（套用負的Y速度）
        player.isGrounded = false;     // 離開地面了
    }

    // 3. 套用重力（角色會一直想往下掉）
    player.vy += GRAVITY;

    // 4. 更新位置
    player.x += player.vx;
    player.y += player.vy;

    // 5. 簡易地面碰撞（暫時把畫布底部當作地面）
    const groundLevel = canvas.height - player.height - 20; // 留 20px 當草地厚度
    if (player.y >= groundLevel) {
        player.y = groundLevel; // 卡在地面，不要掉下去
        player.vy = 0;          // Y軸速度歸零
        player.isGrounded = true; // 重新設定為踩在地上
    }

    // 6. 限制角色不要走出畫布左右邊界
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

    // 7. 渲染畫面
    draw();

    // 8. 不斷循環
    requestAnimationFrame(update);
}

// 畫面繪製功能
function draw() {
    // 清空畫面
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 畫出一個簡單的灰色地面
    ctx.fillStyle = '#795548';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // 畫出橘色主角
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// 啟動遊戲迴圈
update();
