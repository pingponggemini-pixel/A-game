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
            player.attack +
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

    let r =
        Math.random();

    if(r < 0.60){

        player.attack += 1;

        addLog("N 木劍 攻擊+1");
    }

    else if(r < 0.90){

        player.attack += 3;

        addLog("R 鋼鐵劍 攻擊+3");
    }

    else if(r < 0.99){

        player.attack += 7;

        addLog("SR 楓葉劍 攻擊+7");
    }

    else{

        player.attack += 20;

        addLog("SSR 傳說楓葉劍 攻擊+20");
    }

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
