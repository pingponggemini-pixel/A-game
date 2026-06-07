let player = {
    name:"",
    level:1,
    hp:100,
    maxHp:100,

    baseAttack:10,

    gold:0,
    exp:0,

    inventory:[],

    weapon:null
};

const monsters = {
    "菇菇寶貝":{
        hp:30,
        attack:5,
        exp:10,
        gold:5
    },

    "綠水靈":{
        hp:50,
        attack:8,
        exp:20,
        gold:10
    },

    "藍寶王":{
        hp:300,
        attack:20,
        exp:100,
        gold:100
    }
};
function login(){

    const username =
        document.getElementById("username").value;

    if(!username) return;

    player.name = username;

    document.getElementById("loginScreen").style.display =
        "none";

    document.getElementById("gameScreen").style.display =
        "block";

    updateUI();
}

function updateUI(){

    player.hp =
        Math.max(0,player.hp);

    document.getElementById("playerName").innerText =
        player.name;

    document.getElementById("level").innerText =
        player.level;

    document.getElementById("hp").innerText =
        player.hp;

    document.getElementById("atk").innerText =
        getAttack();

    document.getElementById("gold").innerText =
        player.gold;
}

function addLog(text){

    document.getElementById("log").innerHTML +=
        text + "<br>";

    document.getElementById("log").scrollTop =
        document.getElementById("log").scrollHeight;
}

function fight(name){

    let monster =
        JSON.parse(
            JSON.stringify(monsters[name])
        );

    addLog("遭遇 " + name);

    while(player.hp > 0 && monster.hp > 0){

        monster.hp -= getAttack();

        addLog(
            "你攻擊 " +
            name +
            " 造成 " +
            getAttack() +
            " 傷害"
        );

        if(monster.hp <= 0){

            addLog(name + " 被擊敗");

            player.gold += monster.gold;
            player.exp += monster.exp;

            levelCheck();

            updateUI();

            return;
        }

        player.hp -= monster.attack;

        addLog(
            name +
            " 攻擊你 " +
            monster.attack +
            " 點"
        );

        if(player.hp <= 0){

            addLog("你被擊敗了");

            player.hp =
                player.maxHp;

            updateUI();

            return;
        }
    }

    updateUI();
}

function levelCheck(){

    if(player.exp >= 50){

        player.exp = 0;

        player.level++;

        player.maxHp += 20;

        player.hp =
            player.maxHp;

        player.attack += 5;

        addLog(
            "升級！目前 Lv." +
            player.level
        );
    }
}

function gacha(){

    if(player.gold < 20){

        addLog("金幣不足");
        return;
    }

    player.gold -= 20;

    let r = Math.random();

    let item;

    if(r < 0.60){

        item = {
            name:"木劍",
            attack:1
        };
    }

    else if(r < 0.90){

        item = {
            name:"鋼鐵劍",
            attack:3
        };
    }

    else if(r < 0.99){

        item = {
            name:"楓葉劍",
            attack:7
        };
    }

    else{

        item = {
            name:"傳說楓葉劍",
            attack:20
        };
    }

    player.inventory.push(item);

    addLog(
        "獲得 " +
        item.name
    );

    updateInventory();
    updateUI();
}
function getAttack(){

    let atk = player.baseAttack;

    if(player.weapon){

        atk += player.weapon.attack;
    }

    return atk;
}
function updateInventory(){

    let html = "";

    player.inventory.forEach((item,index)=>{

        html += `
        <div>
            ${item.name}
            ATK+${item.attack}

            <button onclick="equipWeapon(${index})">
            裝備
            </button>
        </div>
        `;
    });

    document.getElementById(
        "inventory"
    ).innerHTML = html;
}
function equipWeapon(index){

    player.weapon =
        player.inventory[index];

    addLog(
        "裝備了 " +
        player.weapon.name
    );

    updateUI();
}
function saveGame(){

    localStorage.setItem(
        "mapleSave",
        JSON.stringify(player)
    );

    addLog("存檔成功");
}
function loadGame(){

    let save =
        localStorage.getItem(
            "mapleSave"
        );

    if(!save) return;

    player =
        JSON.parse(save);

    updateUI();
    updateInventory();

    addLog("讀檔成功");
}
