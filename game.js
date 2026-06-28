const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const player = {
    x: 180,
    y: 180,
    size: 40,
    color: '#7FFF00'
};
ctx.fillStyle = player.color;
ctx.fillRect(player.x, player.y, player.size, player.size);
