const chek = document.getElementById("check").addEventListener("click", function(){checkComm();});
const attek= document.getElementById('attack').addEventListener("click", function(){attackComm();});
const magek = document.getElementById('magic').addEventListener("click", function(){magicComm();});
const flei = document.getElementById('flee').addEventListener("click", function(){fleeComm();});
const rest = document.getElementById('reset').addEventListener("click", function(){main();});
let playerHP = 100;
let enemyHP = 100;
let buffCount = 0;
let debCount = 0;
let healCount = 0;
let chckCount = 0;
let itemCount = 0;
let gameCount = 0;
let enemyName = "Bug";
let enemyCheck = "A very annoying Bug.";
let buff = "ATK Up";
let debuff = "Enemy ATK Down";
let heal = "Heal";
let playerTurn = true;
let enemyTurn = false;
let fleeBattle = false;
let enemyLowHealth = false;

let turnChange = setTimeout(function(){enemyAI}, 1500);

console.log(playerHP);
console.log(enemyHP);
console.log(enemyLowHealth);
/*console.log(buffCount);
console.log(debCount);
console.log(healCount);*/

function main()
{
    document.getElementById("reset").className = "hidden";
    document.getElementById("check").className = "checq";
    document.getElementById("attack").className = "atk";
    document.getElementById("magic").className = "exe";
    document.getElementById("flee").className = "run";
    
    document.getElementById("gamename").innerHTML = "A Bug Attacked!";
    document.getElementById("textarea").innerHTML = 
    "Your HP = " + playerHP + "<br>" + "<br>" + "What will you do?" + "<br>" + "<br>" + "<br>";
    document.getElementById("menu").innerHTML = "..."
    
    if (playerHP < 0 || playerHP == 0)
    {
        playerHP = 0;
        death();
    }
    else if (playerHP > 100)
    {
        playerHP = 100;
    }
    
    if (enemyHP < 0 || enemyHP == 0)
    {
        enemyHP = 0;
        document.getElementById("menu").innerHTML = 
        "Bug Defeated!";
        end();
    }
    if (enemyHP > 100)
    {
        enemyHP = 100;
    }
}

function checkComm()
{
    document.getElementById("menu").innerHTML = "...";
    
    if (itemCount < 2) 
    {
        document.getElementById("item1").className = 'itemhid';
        document.getElementById("item2").className = 'itemhid';
        document.getElementById("item3").className = 'itemhid';
        itemCount = 0;
    }
    
    chckCount ++;
    if (chckCount < 2) 
    {
        document.getElementById("textarea").innerHTML = 
        enemyName + "<br>" + "<br>" + "HP = " + enemyHP + "<br>" + "<br>" + enemyCheck;
    }
    else if (chckCount >1)
    {
        chckCount = 0;
        document.getElementById("textarea").innerHTML = 
        "Your HP = " + playerHP + "<br>" + "<br>" + "What will you do?" + "<br>" + "<br>" + "<br>";
        
        playerTurn = false
        enemyTurn = true
    
        if (enemyTurn == true)
        {
            turnChange;
        }
    }
}

function attackComm()
{
    document.getElementById("menu").innerHTML = "...";
    
    if (itemCount < 2) 
    {
        document.getElementById("item1").className = 'itemhid';
        document.getElementById("item2").className = 'itemhid';
        document.getElementById("item3").className = 'itemhid';
        itemCount = 0;
    }
    
    if (enemyHP == 50 || enemyHP < 50)
    {
        enemyLowHealth = true;
    }
    else
    {
        enemyLowHealth = false;
    }
    
    
    if (enemyHP == 0 || enemyHP < 1)
    {
        document.getElementById("menu").innerHTML = 
        "Bug Defeated!";
        end();
    }
    
    if (buffCount == 1) 
    {
        //Random rdm = new Random();
        number = rnGen() + 5;
        enemyHP = enemyHP - number;
        
        if (number == 0 || number < 1)
        {
            document.getElementById("menu").innerHTML = 
            "You missed!";
        }
        else
        {
            document.getElementById("menu").innerHTML = 
            "You dealt " + number + " damage to " + enemyName + "!";
        }
        document.getElementById("textarea").innerHTML = 
        enemyName + "<br>" + "<br>" + "HP = " + enemyHP + "<br>" + "<br>" + enemyCheck;
    }
    else if (buffCount == 2) 
    {
        //Random rdm = new Random();
        number = rnGen() + 10;
        enemyHP = enemyHP - number;
        
        if (number == 0 || number < 1)
        {
            document.getElementById("menu").innerHTML = 
            "You missed!";
        }
        else
        {
            document.getElementById("menu").innerHTML = 
            "You dealt " + number + " damage to " + enemyName + "!";
        }
        document.getElementById("textarea").innerHTML = 
        enemyName + "<br>" + "<br>" + "HP = " + enemyHP + "<br>" + "<br>" + enemyCheck;
    }
    else if (buffCount == 3 || buffCount > 3) 
    {
        //Random rdm = new Random();
        number = rnGen() + 15;
        enemyHP = enemyHP - number;
        
        if (number == 0 || number < 1)
        {
            document.getElementById("menu").innerHTML = 
            "You missed!";
        }
        else
        {
            document.getElementById("menu").innerHTML = 
            "You dealt " + number + " damage to " + enemyName + "!";
        }
        document.getElementById("textarea").innerHTML = 
        enemyName + "<br>" + "<br>" + "HP = " + enemyHP + "<br>" + "<br>" + enemyCheck;
    }
    else
    {
        number = rnGen();
        enemyHP = enemyHP - number;
        
        if (number == 0 || number < 1)
        {
            document.getElementById("menu").innerHTML = 
            "You missed!";
        }
        else
        {
            document.getElementById("menu").innerHTML = 
            "You dealt " + number + " damage to " + enemyName + "!";
        }
        document.getElementById("textarea").innerHTML = 
        enemyName + "<br>" + "<br>" + "HP = " + enemyHP + "<br>" + "<br>" + enemyCheck;
    }
    
    if (enemyHP == 50 || enemyHP < 50)
    {
        enemyLowHealth = true;
    }
    
    if (enemyHP == 0 || enemyHP < 1)
    {
        document.getElementById("menu").innerHTML = 
        "Bug Defeated!";
        end();
    }
    
    playerTurn = false
    enemyTurn = true
    
    if (enemyTurn == true)
    {
        console.log("Switch to Enemy Turn")
        turnChange;
    }
    
    console.log(enemyHP);
    console.log(playerHP);
}

function magicComm()
{
    itemCount++;
    if (itemCount < 2) 
    {
        document.getElementById("textarea").innerHTML = 
        "Which item do you want to use?" + "<br>" + "<br>" + "(1) " + buff + "<br>" + "(2) " + debuff + "<br>" + "(3) " + heal +"<br>";
        document.getElementById("item1").className = 'itemshow1';
        document.getElementById("item2").className = 'itemshow';
        document.getElementById("item3").className = 'itemshow';
    }
    else if (itemCount >1)
    {
        document.getElementById("item1").className = 'itemhid';
        document.getElementById("item2").className = 'itemhid';
        document.getElementById("item3").className = 'itemhid';
        main();
        itemCount = 0;
    }
    
    document.getElementById("item1").addEventListener("click", function(){buffHndl()});
    document.getElementById("item2").addEventListener("click", function(){debfHndl()});
    document.getElementById("item3").addEventListener("click", function(){healHndl()});
    
    playerTurn = false
    enemyTurn = true
    
    if (enemyTurn == true)
    {
        setTimeout(enemyAI(), 1000);
    }
}

function buffHndl()
{
    document.getElementById("menu").innerHTML = "You used " + buff + "!";
    buffCount++;
    if (buffCount == 4 || buffCount > 3)
    {
        document.getElementById("item1").innerHTML = "USED";
        document.getElementById("menu").innerHTML = "You can't use this item anymore!";
    }
}

function debfHndl()
{
    document.getElementById("menu").innerHTML = "You used " + debuff + "!";
    debCount++;
    if (debCount == 4 || debCount > 3)
    {
        document.getElementById("item2").innerHTML = "USED";
        document.getElementById("menu").innerHTML = "You can't use this item anymore!";
    }
}

function healHndl()
{
    document.getElementById("menu").innerHTML = "You used " + heal + "!";
    healCount++;
    if (healCount == 4 || healCount > 3)
    {
        document.getElementById("item3").innerHTML = "USED";
        document.getElementById("menu").innerHTML = "You can't use this item anymore!";
    }
}

function fleeComm()
{
    roenforyalife = Math.floor(Math.random() * 50);
    
    if (itemCount < 2) 
    {
        document.getElementById("item1").className = 'itemhid';
        document.getElementById("item2").className = 'itemhid';
        document.getElementById("item3").className = 'itemhid';
        itemCount = 0;
    }
    
    if (roenforyalife == 2 || roenforyalife > 1)
    {
        document.getElementById("menu").innerHTML = "Failed to Escape!";
    }
    else
    {
        loser();
    }
    
    playerTurn = false
    enemyTurn = true
    
    if (enemyTurn == true)
    {
        setTimeout(enemyAI(), 1000);
    }
}

function enemyAI()
{
    document.getElementById("check").className = "hidden";
    document.getElementById("attack").className = "hidden";
    document.getElementById("magic").className = "hidden";
    document.getElementById("flee").className = "hidden";
    document.getElementById("item1").className = "itemhid";
    document.getElementById("item2").className = "itemhid";
    document.getElementById("item3").className = "itemhid";
    
    clearTimeout(turnChange);
    
    number = rnGen();
    
    if (number < 1 || number == 0)
    {
        enemyHeal();
    }
    else (number > 1)
    {
        enemyATK();
    }
}

function enemyHeal()
{
    if (enemyLowHealth == false)
    {
        number = rnGen() + 10;
        enemyHP = enemyHP + number;
        document.getElementById("menu").innerHTML = enemyName + " got healed by " + number + "!";
    }
    else 
    {
        number = rnGen() + 20;
        enemyHP = enemyHP + number;
        document.getElementById("menu").innerHTML = enemyName + " got healed by " + number + "!";
    }
    
    playerTurn = true
    enemyTurn = false
}

function enemyATK()
{
    number = rnGen() + rnGen();
    
    if (enemyLowHealth == false)
    {
        number = rnGen() + rnGen();
    }
    else
    {
        number = rnGen() * rnGen();
    }
    
    if (number < 1 || number == 0)
    {
        playerHP = playerHP - number;
        document.getElementById("menu").innerHTML = enemyName + " missed!";
    }
    else
    {
        playerHP = playerHP - number;
        document.getElementById("menu").innerHTML = enemyName + " dealt " + number + " damage!";
    }
    
    playerTurn = true 
    enemyTurn = false
}

function rnGen()
{
    return Math.floor(Math.random() * 5);
}

function death()
{
    buffCount = 0;
    debCount = 0;
    healCount = 0;
    gameCount = 0;
    console.log = "You died.";
    document.getElementById("gamename").innerHTML = "A Bug Won...";
    document.getElementById("textarea").innerHTML = "Y O U &nbsp;D I E D";
    document.getElementById("menu").innerHTML = "Try Again?";
    document.getElementById("check").className = "hidden";
    document.getElementById("attack").className = "hidden";
    document.getElementById("magic").className = "hidden";
    document.getElementById("flee").className = "hidden";
    document.getElementById("item1").className = "itemhid";
    document.getElementById("item2").className = "itemhid";
    document.getElementById("item3").className = "itemhid";
    document.getElementById("reset").className = "restart";
}

function loser()
{
    playerHP = 100;
    enemyHP = 100;
    buffCount = 0;
    debCount = 0;
    healCount = 0;
    gameCount = 0;
    console.log = "You escaped.";
    document.getElementById("gamename").innerHTML = "A Bug Attacked?";
    document.getElementById("textarea").innerHTML = "Y O U &nbsp;E S C A P E D";
    document.getElementById("menu").innerHTML = "Try Again?";
    document.getElementById("check").className = "hidden";
    document.getElementById("attack").className = "hidden";
    document.getElementById("magic").className = "hidden";
    document.getElementById("flee").className = "hidden";
    document.getElementById("item1").className = "itemhid";
    document.getElementById("item2").className = "itemhid";
    document.getElementById("item3").className = "itemhid";
    document.getElementById("reset").className = "restart";
}

function end()
{
    playerHP = 100;
    enemyHP = 100;
    buffCount = 0;
    debCount = 0;
    healCount = 0;
    gameCount++;
    console.log = "You win!";
    
    if (gameCount > 1 || gamecount != 0)
    {
        document.getElementById("textarea").innerHTML = "Y O U &nbsp;W O N" + "<br>" + "You've won " + gameCount + " times in a row!";
    }
    else
    {
        document.getElementById("textarea").innerHTML = "Y O U &nbsp;W O N";
    }
    document.getElementById("gamename").innerHTML = "A Bug Defeated!";
    document.getElementById("menu").innerHTML = "Play Again?";
    document.getElementById("check").className = "hidden";
    document.getElementById("attack").className = "hidden";
    document.getElementById("magic").className = "hidden";
    document.getElementById("flee").className = "hidden";
    document.getElementById("item1").className = "itemhid";
    document.getElementById("item2").className = "itemhid";
    document.getElementById("item3").className = "itemhid";
    document.getElementById("reset").className = "restart";
}