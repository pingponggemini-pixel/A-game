// ==========================================
// ui.js - 負責處理網頁介面更新、登入與日誌
// ==========================================

// 登入邏輯
function login() {
    const usernameInput = document.getElementById("username").value.trim();
    if(!usernameInput) {
        alert("請輸入角色名稱！");
        return;
    }

    // 將名字存入玩家資料（player 物件會在 player.js 中定義）
    player.name = usernameInput;
    
    // 切換畫面
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "flex";
    
    // 顯示歡迎訊息，James 出現啦！
    addLog(`【系統】冒險者 <b style="color:#ff6600;">${player.name}</b> 降臨在弓手村！`);
    
    // 初始化遊戲
    initGame(); 
}

// 更新畫面上的數據
function updateUI() {
    // 確保 HP 不會變成負數
    player.hp = Math.max(0, player.hp);

    document.getElementById("playerName").innerHTML = "🍁 冒險者： " + player.name;
    document.getElementById("level").innerText = player.level;
    document.getElementById("hp").innerText = player.hp + " / " + player.maxHp;
    document.getElementById("atk").innerText = getAttack(); 
    document.getElementById("gold").innerText = player.gold;
}

// 在日誌框中新增訊息
function addLog(text) {
    const logDiv = document.getElementById("log");
    logDiv.innerHTML += text + "<br>";
    logDiv.scrollTop = logDiv.scrollHeight; // 自動捲動到最底部
}

// 更新背包畫面
function updateInventory() {
    const invDiv = document.getElementById("inventory");
    if(player.inventory.length === 0) {
        invDiv.innerHTML = '<span style="color: #aaa;">背包空空如也...</span>';
        return;
    }

    let html = "";
    player.inventory.forEach((item, index) => {
        let isEquipped = player.weapon && player.weapon === item;
        html += `
        <div class="inv-item" style="${isEquipped ? 'border-color: red; background: #ffe6e6;' : ''}">
            <strong>${item.name}</strong><br>
            攻擊力 +${item.attack}<br>
            ${isEquipped ? '<b style="color:green;">[已裝備]</b>' : `<button style="padding:2px 5px; font-size:11px;" onclick="equipWeapon(${index})">裝備</button>`}
        </div>
        `;
    });
    invDiv.innerHTML = html;
}
