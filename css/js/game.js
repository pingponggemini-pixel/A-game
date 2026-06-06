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
// ==========================================
// game.js - 遊戲核心引擎、主循環與世界物理
// ==========================================

// 1. 全局環境物理常數
const physics = {
    gravity: 0.5,   // 重力加速度
    friction: 0.8,  // 地面/空氣阻力 (造成滑行感)
    groundY: 340    // 草地表面的 Y 軸高度
};

// 2. 畫布環境初始化 (在 UI 載入後取得)
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 3. 遊戲初始化主程式 (當在 ui.js 點擊開始冒險時被呼叫)
function initGame() {
    // 啟動平板觸控監聽
    setupTouchControls();

    // 初始在場上召唤兩隻怪物
    spawnMonster("菇菇寶貝");
    spawnMonster("綠水靈");

    // 刷新一次介面
    updateUI();
    updateInventory();

    // 正式啟動遊戲主循環
    requestAnimationFrame(gameLoop);
}

// 4. 遊戲主循環 (Game Loop - 每秒執行約 60 次)
function gameLoop() {
    // ---- A. 清理上一幀的畫面 ----
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ---- B. 處理玩家鍵盤與觸控輸入 ----
    if (keys["ArrowLeft"]) {
        if (player.velocityX > -player.speed) player.velocityX--;
        player.direction = "left";
    }
    if (keys["ArrowRight"]) {
        if (player.velocityX < player.speed) player.velocityX++;
        player.direction = "right";
    }
    // 跳躍限制：必須踩在地上才能跳
    if (keys["AltLeft"] && !player.jumping && player.grounded) {
        player.jumping = true;
        player.grounded = false;
        player.velocityY = -10; // 往上的跳躍初速度
    }
    // 普通攻擊
    if (keys["ControlLeft"] && player.attackCooldown <= 0) {
        player.isAttacking = true;
        player.attackCooldown = 20; // 攻擊冷卻時間 (20幀)
        executeAttack(); // 觸發 monster.js 的傷害判定
    }

    // ---- C. 處理攻擊動作計時器 ----
    if (player.attackCooldown > 0) {
        player.attackCooldown--;
        // 前 10 幀顯示揮刀特效，後 10 幀收刀
        if (player.attackCooldown < 10) player.isAttacking = false;
    }

    // ---- D. 運算玩家物理運動 (重力與阻力) ----
    player.velocityX *= physics.friction;
    player.velocityY += physics.gravity;
    player.x += player.velocityX;
    player.y += player.velocityY;

    // 地面碰撞偵測
    if (player.y + player.height >= physics.groundY) {
        player.y = physics.groundY - player.height;
        player.velocityY = 0;
        player.jumping = false;
        player.grounded = true;
    }
    // 左右地圖邊界限制
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;


    // ---- E. 運算與繪製怪物 AI ----
    activeMonsters.forEach((monster) => {
        // 隨機走動計時器遞減
        monster.moveTimer--;
        if(monster.moveTimer <= 0) {
            monster.direction = Math.random() > 0.5 ? 1 : -1; // 隨機換方向
            monster.moveTimer = Math.random() * 120 + 30;     // 隨機走 0.5 到 2 秒
        }
        
        // 讓怪物移動
        monster.x += monster.direction * 0.8;
        
        // 怪物撞牆回頭限制
        if(monster.x < 100) monster.direction = 1;
        if(monster.x + monster.width > canvas.width) monster.direction = -1;

        // 【繪製怪物主體】
        ctx.fillStyle = monster.color;
        ctx.fillRect(monster.x, monster.y, monster.width, monster.height);

        // 【繪製怪物血條】
        ctx.fillStyle = "red";
        ctx.fillRect(monster.x, monster.y - 8, monster.width, 4);
        ctx.fillStyle = "green";
        ctx.fillRect(monster.x, monster.y - 8, monster.width * (monster.hp / monster.maxHp), 4);

        // 【玩家與怪物碰撞偵測】 (James 被怪物撞到扣血)
        if (checkCollision(player, monster)) {
            // 限制受傷頻率 (約 5% 機率觸發)，否則每幀都扣血會瞬間秒殺
            if (Math.random() < 0.05) { 
                let damage = monster.attack;
                player.hp -= damage;
                addLog(`⚠️ James 被 ${monster.name} 撞到了！受到 ${damage} 點傷害。`);
                updateUI();
                
                // 玩家死亡判定
                if(player.hp <= 0) {
                    addLog("☠️ James 倒下了... 被安全傳送回弓手村復活。");
                    player.x = 100;
                    player.y = 200;
                    player.hp = player.maxHp;
                    updateUI();
                }
            }
        }
    });

    // ---- F. 繪製遊戲背景與地形 ----
    // 繪製綠色草地
    ctx.fillStyle = "#228B22";
    ctx.fillRect(0, physics.groundY, canvas.width, canvas.height - physics.groundY);

    // ---- G. 繪製玩家角色 (James) ----
    // 攻擊時方塊會變成耀眼的黃色，平常是橘紅色
    ctx.fillStyle = player.isAttacking ? "#ffff00" : "#ff4500"; 
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 繪製攻擊半透明特效
    if (player.isAttacking) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        if (player.direction === "right") {
            ctx.fillRect(player.x + player.width, player.y, 40, player.height);
        } else {
            ctx.fillRect(player.x - 40, player.y, 40, player.height);
        }
    }

    // ---- H. 不斷循環執行此函式 ----
    requestAnimationFrame(gameLoop);
}

// 5. 轉蛋功能 (配合 UI)
function gacha() {
    if(player.gold < 20) {
        addLog("<span style='color:red;'>【轉蛋】金幣不足！需要 20 金幣。</span>");
        return;
    }
    player.gold -= 20;
    let r = Math.random();
    let item;

    if(r < 0.6) item = { name: "新手木劍", attack: 3 };
    else if(r < 0.9) item = { name: "合金短劍", attack: 8 };
    else item = { name: "🍁 楓葉鋼刀 🍁", attack: 22 };

    player.inventory.push(item);
    addLog(`🎁 James 轉蛋獲得：<b>${item.name}</b> (ATK +${item.attack})`);
    updateInventory();
    updateUI();
}

// 6. 存檔功能
function saveGame() {
    localStorage.setItem("mapleModularSave", JSON.stringify(player));
    addLog("【系統】進度存檔成功！(已保存至本機瀏覽器)");
}

// 7. 讀檔功能
function loadGame() {
    const save = localStorage.getItem("mapleModularSave");
    if(save) {
        player = JSON.parse(save);
        // 跳過登入
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("gameScreen").style.display = "flex";
        
        // 重新喚醒控制與刷新
        setupTouchControls();
        updateUI();
        updateInventory();
        addLog(`【系統】成功載入存檔！歡迎回來，${player.name}`);
    } else {
        alert("找不到存檔資料！");
    }
}
