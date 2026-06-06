// 取得 HTML 的畫布
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 暫時用一個簡單的方形代表我們的「楓之谷主角」
const player = {
    x: 100,
    y: 400,
    width: 40,
    height: 60,
    color: '#ff922b' // 橘色（像菇菇寶貝的顏色）
};

// 遊戲主迴圈 (Game Loop)
function update() {
    // 1. 清空上一格的畫面
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. 畫出主角
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 3. 不斷重複執行這個 function
    requestAnimationFrame(update);
}

// 啟動遊戲
update();
