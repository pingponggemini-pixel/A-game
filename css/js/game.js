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
// ==========================================
// player.js - 負責玩家(James)數據、物理與控制
// ==========================================

// 1. 玩家初始資料
let player = {
    name: "James", // 預設名字
    level: 1,
    hp: 100,
    maxHp: 100,
    baseAttack: 10,
    gold: 0,
    exp: 0,
    inventory: [],
    weapon: null,

    // 2D 動作物理屬性
    x: 100,
    y: 200,
    width: 30,
    height: 45,
    velocityX: 0,
    velocityY: 0,
    speed: 4,
    jumping: false,
    grounded: false,
    isAttacking: false,
    attackCooldown: 0,
    direction: "right" // 面向：left 或 right
};

// 2. 鍵盤輸入狀態
const keys = {};
window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

// 3. 平板/手機觸控事件綁定
function setupTouchControls() {
    // 左移動
    const btnLeft = document.getElementById("btnLeft");
    btnLeft.addEventListener("touchstart", (e) => { e.preventDefault(); keys["ArrowLeft"] = true; });
    btnLeft.addEventListener("touchend", () => { keys["ArrowLeft"] = false; });
    // 支援電腦滑鼠點擊測試平板按紐
    btnLeft.addEventListener("mousedown", () => { keys["ArrowLeft"] = true; });
    btnLeft.addEventListener("mouseup", () => { keys["ArrowLeft"] = false; });

    // 右移動
    const btnRight = document.getElementById("btnRight");
    btnRight.addEventListener("touchstart", (e) => { e.preventDefault(); keys["ArrowRight"] = true; });
    btnRight.addEventListener("touchend", () => { keys["ArrowRight"] = false; });
    btnRight.addEventListener("mousedown", () => { keys["ArrowRight"] = true; });
    btnRight.addEventListener("mouseup", () => { keys["ArrowRight"] = false; });

    // 跳躍
    const btnJump = document.getElementById("btnJump");
    btnJump.addEventListener("touchstart", (e) => { e.preventDefault(); keys["AltLeft"] = true; });
    btnJump.addEventListener("touchend", () => { keys["AltLeft"] = false; });
    btnJump.addEventListener("mousedown", () => { keys["AltLeft"] = true; });
    btnJump.addEventListener("mouseup", () => { keys["AltLeft"] = false; });

    // 攻擊
    const btnAttack = document.getElementById("btnAttack");
    btnAttack.addEventListener("touchstart", (e) => { e.preventDefault(); keys["ControlLeft"] = true; });
    btnAttack.addEventListener("touchend", () => { keys["ControlLeft"] = false; });
    btnAttack.addEventListener("mousedown", () => { keys["ControlLeft"] = true; });
    btnAttack.addEventListener("mouseup", () => { keys["ControlLeft"] = false; });
}

// 4. 計算總攻擊力
function getAttack() {
    return player.baseAttack + (player.weapon ? player.weapon.attack : 0);
}

// 5. 裝備武器邏輯
function equipWeapon(index) {
    player.weapon = player.inventory[index];
    addLog(`🗡️ James 裝備了 [${player.weapon.name}]，攻擊力提升！`);
    updateUI();
    updateInventory();
}

// 6. 經驗值與升級檢查
function levelCheck() {
    let needExp = player.level * 50;
    if(player.exp >= needExp) {
        player.exp -= needExp;
        player.level++;
        player.maxHp += 20;
        player.hp = player.maxHp; // 升級補滿血
        player.baseAttack += 4;
        addLog(`<span style="color: #ff6600; font-weight:bold;">🌟 James 升級了！目前等級達到 Lv.${player.level}！</span>`);
        updateUI();
    }
}
// ==========================================
// monster.js - 負責怪物資料、AI 走動與碰撞判定
// ==========================================

// 場上當前活著的怪物陣列
let activeMonsters = [];

// 怪物種類範本庫
const monsterTemplates = {
    "菇菇寶貝": { name: "菇菇寶貝", hp: 30, maxHp: 30, attack: 4, exp: 12, gold: 6, color: "#ff9966", width: 30, height: 30 },
    "綠水靈": { name: "綠水靈", hp: 50, maxHp: 50, attack: 8, exp: 22, gold: 12, color: "#66ff66", width: 25, height: 25 }
};

// 在畫面上隨機生成一隻怪物
function spawnMonster(type) {
    let template = monsterTemplates[type];
    if(!template) return;
    
    activeMonsters.push({
        ...JSON.parse(JSON.stringify(template)),
        x: Math.random() * (canvas.width - 200) + 150, // 隨機出現在右半邊地圖
        y: physics.groundY - template.height,
        direction: Math.random() > 0.5 ? 1 : -1, // 隨機往左或往右走
        moveTimer: Math.random() * 60
    });
}

// 矩形碰撞偵測演算法（用來算有沒有撞到怪或打到怪）
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 處理 James 的普通攻擊傷害判定
function executeAttack() {
    // 定義攻擊範圍框
    let attackRange = {
        y: player.y,
        height: player.height,
        width: 40,
        x: player.direction === "right" ? player.x + player.width : player.x - 40
    };

    // 檢查有沒有打到任何一隻怪物
    for (let i = activeMonsters.length - 1; i >= 0; i--) {
        let monster = activeMonsters[i];
        if (checkCollision(attackRange, monster)) {
            let dmg = getAttack();
            monster.hp -= dmg;
            addLog(`⚔️ James 對 ${monster.name} 造成了 ${dmg} 點傷害！`);
            
            // 怪物死亡處理
            if (monster.hp <= 0) {
                addLog(`🎉 擊敗了 ${monster.name}！獲得金幣 +${monster.gold}, 經驗 +${monster.exp}`);
                player.gold += monster.gold;
                player.exp += monster.exp;
                
                let type = monster.name;
                activeMonsters.splice(i, 1); // 將死掉的怪從場上移除
                
                // 3 秒後自動重新孵化一隻新怪
                setTimeout(() => { spawnMonster(type); }, 3000);
                
                levelCheck();
                updateUI();
            }
        }
    }
}
