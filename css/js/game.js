// alert("game.js 已載入"); 測試完可以先註解掉以免干擾

let player = {
    name: "",
    level: 1,
    hp: 100,
    maxHp: 100,
    baseAttack: 10,
    gold: 0,
    exp: 0,
    inventory: [],
    weapon: null
};

const monsters = {
    "菇菇寶貝": { hp: 30, attack: 5, exp: 10, gold: 5 },
    "綠水靈": { hp: 50, attack: 8, exp: 20, gold: 10 }, // 補上了這裡的逗號
    "藍寶王": { hp: 300, attack: 20, exp: 100, gold: 100 }
};

function login() {
    const username = document.getElementById("username").value;
    if(!username) return;

    player.name = username;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    updateUI();
}

function updateUI() {
    player.hp = Math.max(0, player.hp); // 確保 HP 不會變負數

    document.getElementById("playerName").innerText = player.name;
    document.getElementById("level").innerText = player.level;
    document.getElementById("hp").innerText = player.hp + " / " + player.maxHp;
    document.getElementById("atk").innerText = getAttack(); 
    document.getElementById("gold").innerText = player.gold;
}

function addLog(text) {
    const logDiv = document.getElementById("log");
    logDiv.innerHTML += text + "<br>";
    logDiv.scrollTop = logDiv.scrollHeight; // 自動捲動到最底
}

function saveGame() {
    localStorage.setItem("mapleSave", JSON.stringify(player));
    addLog("【系統】存檔成功！");
}

// 新增的讀檔功能
function loadGame() {
    const savedData = localStorage.getItem("mapleSave");
    if (savedData) {
        player = JSON.parse(savedData);
        addLog("【系統】讀檔成功！歡迎回來，" + player.name);
        updateUI();
        updateInventory();
    } else {
        addLog("【系統】找不到存檔紀錄。");
    }
}

function getAttack() {
    let atk = player.baseAttack;
    if(player.weapon) {
        atk += player.weapon.attack;
    }
    return atk;
}

function fight(name) {
    // 深拷貝怪物資料，避免打死一次後血量不恢復
    let monster = JSON.parse(JSON.stringify(monsters[name]));
    let currentAtk = getAttack(); // 抓取總攻擊力

    addLog("=========== 戰鬥開始 ===========");
    addLog("遭遇野生 " + name + "！");

    while(player.hp > 0 && monster.hp > 0) {
        // 玩家攻擊
        monster.hp -= currentAtk;
        addLog("你攻擊了 " + name + "，造成 " + currentAtk + " 點傷害");

        if(monster.hp <= 0) {
            addLog("👉 " + name + " 被擊敗了！");
            addLog("獲得 " + monster.gold + " 金幣與 " + monster.exp + " 經驗值");
            
            player.gold += monster.gold;
            player.exp += monster.exp;
            
            levelCheck();
            updateUI();
            return;
        }

        // 怪物反擊
        player.hp -= monster.attack;
        addLog("⚠️ " + name + " 攻擊你，造成 " + monster.attack + " 點傷害");

        if(player.hp <= 0) {
            addLog("☠️ 你被擊敗了...");
            player.hp = player.maxHp; // 死亡懲罰暫時設定為補滿血復活
            updateUI();
            return;
        }
    }
    updateUI();
}

function levelCheck() {
    // 升級門檻可以設定得有變化，目前先用 50
    if(player.exp >= 50) {
        player.exp -= 50; // 扣除升級所需經驗值
        player.level++;
        player.maxHp += 20;
        player.hp = player.maxHp; // 升級回滿血
        player.baseAttack += 5;   // 修正：增加基礎攻擊力

        addLog("🌟 升級了！目前等級：Lv." + player.level);
    }
}

function gacha() {
    if(player.gold < 20) {
        addLog("❌ 金幣不足，需要 20 金幣");
        return;
    }

    player.gold -= 20;
    let r = Math.random();
    let item;

    if(r < 0.60) {
        item = { name: "木劍", attack: 1 };
    } else if(r < 0.90) {
        item = { name: "鋼鐵劍", attack: 3 };
    } else if(r < 0.99) {
        item = { name: "楓葉劍", attack: 7 };
    } else {
        item = { name: "傳說楓葉劍", attack: 20 };
        addLog("🎉 抽到大獎了！！");
    }

    player.inventory.push(item);
    addLog("🎁 轉蛋獲得： " + item.name + " (攻擊力 +" + item.attack + ")");
    
    updateInventory();
    updateUI();
}

function updateInventory() {
    let html = "";
    player.inventory.forEach((item, index) => {
        html += `
        <div>
            <strong>${item.name}</strong><br>
            ATK +${item.attack}<br>
            <button onclick="equipWeapon(${index})">裝備</button>
        </div>
        `;
    });
    document.getElementById("inventory").innerHTML = html;
}

function equipWeapon(index) {
    player.weapon = player.inventory[index];
    addLog("🗡️ 裝備了 " + player.weapon.name);
    updateUI();
}
