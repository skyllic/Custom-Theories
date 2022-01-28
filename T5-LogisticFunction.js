import { ExponentialCost, FirstFreeCost } from "../api/Costs";
import { Localization } from "../api/Localization";
import { parseBigNumber, BigNumber } from "../api/BigNumber";
import { QuaternaryEntry, theory } from "../api/Theory";
import { Utils } from "../api/Utils";

var id = "monster_battle"
var name = "Monster Battle";
var description = "Fight monsters and gain rho!";
var authors = "Playspout";
var version = 1;

var q = BigNumber.ONE;

var strength, dexterity, agility, intelligence, agility;
var strengthSum = BigNumber.ZERO;
var intSum = BigNumber.ZERO;
var playerDamage = BigNumber.ZERO;
var agilBurst = BigNumber.ZERO;
var playerHitChance = 0;
var playerIntPenalty = 0;

var monsterDodge = 0;
var monsterIntelligence = 0;
var monsterDamage = 0;
var monsterName = "";
var monsterMaxHP = BigNumber.HUNDRED;
var monsterHPModifier = 1;
var monsterHP = BigNumber.HUNDRED;
var monsterLevel = 1;
var boss1Counter = 0;
var isBoss = false;
var strengthMilestone, dexterityMilestone, intelligenceMilestone;

var quaternaryEntries = [];

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // strength
    {
        let getDesc = (level) => "strength=" + getStrength(level).toString(0);
        let getInfo = (level) => "strength=" + getStrength(level).toString(0);
        strength = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(10, Math.log2(10**0.125))));
        strength.getDescription = (amount) => Utils.getMath(getDesc(strength.level));
        strength.getInfo = (amount) => Utils.getMathTo(getInfo(strength.level), getInfo(strength.level + amount));

    }

    // q2
    {
        let getDesc = (level) => "dexterity={" + level + "}";
        let getInfo = (level) => "dexterity=" + getDexterity(level).toString(0);
        dexterity = theory.createUpgrade(1, currency, new ExponentialCost(10, Math.log2(10**0.1)));
        dexterity.getDescription = (amount) => Utils.getMath(getDesc(dexterity.level));
        dexterity.getInfo = (amount) => Utils.getMathTo(getInfo(dexterity.level), getInfo(dexterity.level + amount));
    }

    // c1
    {
        let getDesc = (level) => "agility=" + getAgility(level).toString(0);
        let getInfo = (level) => "agility=" + getAgility(level).toString(0);
        agility = theory.createUpgrade(2, currency, new ExponentialCost(10, Math.log2(10**0.1)));
        agility.getDescription = (amount) => Utils.getMath(getDesc(agility.level));
        agility.getInfo = (amount) => Utils.getMathTo(getInfo(agility.level), getInfo(agility.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "Intelligence={" + level + "}";
        let getInfo = (level) => "Intelligence=" + getIntelligence(level).toString(0);
        intelligence = theory.createUpgrade(3, currency, new ExponentialCost(10, Math.log2(10**0.1)));
        intelligence.getDescription = (amount) => Utils.getMath(getDesc(intelligence.level));
        intelligence.getInfo = (amount) => Utils.getMathTo(getInfo(intelligence.level), getInfo(intelligence.level + amount));
    }

   

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e1);
    theory.createAutoBuyerUpgrade(2, currency, 1e1);

    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(new LinearCost(25*0.1, 25*0.1));

    {
        strengthMilestone = theory.createMilestoneUpgrade(0, 3);
        strengthMilestone.description = Localization.getUpgradeMultCustomDesc("damage", "log_{10}(tau)");
        strengthMilestone.info = Localization.getUpgradeMultCustomInfo("damage", "log_{10}(tau)");
        strengthMilestone.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        dexterityMilestone = theory.createMilestoneUpgrade(1, 3);
        dexterityMilestone.description = Localization.getUpgradeIncCustomDesc("hit \\; chance", "10\\% \\; additive");
        dexterityMilestone.info = Localization.getUpgradeIncCustomInfo("hit \\; chance", "10 \\% ");
        dexterityMilestone.canBeRefunded = (amount) => intelligenceMilestone.level == 0;
        dexterityMilestone.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
    }

    {
        intelligenceMilestone = theory.createMilestoneUpgrade(2, 3);
        intelligenceMilestone.description = Localization.getUpgradeIncCustomExpDesc("c_3", "0.05");
        intelligenceMilestone.info = Localization.getUpgradeIncCustomExpInfo("c_3", "0.05");
        intelligenceMilestone.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    updateAvailability();
}

var updateAvailability = () => {
    
    intelligenceMilestone.isAvailable = dexterityMilestone.level > 0;
}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    let intPenalty = 1;
    
    
    if(intelligence.level < monsterIntelligence) {
        intPenalty = 0.2;
        playerIntPenalty = "active";
    } else {
        intPenalty = 1;
        playerIntPenalty = "none";
    }
    playerHitChance = 1/(monsterDodge + 1.01 - dexterity.level);
    playerHitChance = Math.round(playerHitChance * 1000)/1000;
    if(dexterity.level > monsterDodge) {
        playerHitChance = 1.0;
    } 

    if(monsterHP <= 0 && isBoss == false) {
        monsterLevel += 1;
        currency.value += monsterMaxHP / monsterHPModifier;
        generateMonster(monsterLevel);
    } else if(monsterHP <= 0 && isBoss == true) {
        strengthSum = 0;
        intSum = 0;
        agilBurst = 0;
        
        if(boss1Counter >= 5) {
            monsterLevel += 1;
            isBoss = false;
            boss1Counter = 0;
            
        }
        currency.value += monsterMaxHP / monsterHPModifier * 2;
        generateMonster(monsterLevel);
        
    }
    
    strengthSum += getStrength(strength.level) / 10.0 * dt;
    intSum += 0.1*(intelligence.level**0.5 - intSum**0.5) * dt;
    if(intSum > intelligence.level) {
        intSum = intelligence.level
    }
    if((Math.random() < (1/(monsterDodge + 1.01 - dexterity.level)) || dexterity.level > monsterDodge)) {
        playerDamage = strengthSum * intPenalty * (Math.pow(Math.log10(bonus), strengthMilestone.level)) * bonus * dt;
        agilBurst += playerDamage * 0.1 * dt;
        
        currency.value += strengthSum * intPenalty * bonus / monsterHPModifier * dt;
        
        monsterHP -= playerDamage;
        
    }
    

    
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidatePrimaryEquation();
    //getPrimaryEquation();
    
}

var generateMonster = (monsterLevel) => {
    if(monsterLevel == 1) {
        monsterHP = 100;
        monsterMaxHP = 100;
        monsterIntelligence = 0;
        monsterDodge = 0;
        return;
    }

    if(monsterLevel % 25 == 23 && boss1Counter < 5) {
        monsterHPModifier = 300;
        monsterHP = BigNumber.TEN * monsterHPModifier * 10**monsterLevel;
        monsterMaxHP = monsterHP;
        monsterDodge = 0;
        monsterIntelligence = 0;
        monsterName = "Patchwerk Boss"; 
        isBoss = true;
        boss1Counter += 1;
        return;
    }

    if(Math.random() < 1) {//monster type 1
        monsterHPModifier = 3;
        monsterHP = BigNumber.TEN * monsterHPModifier * 10**monsterLevel;
        monsterMaxHP = monsterHP;
        monsterDodge = 0;
        monsterIntelligence = 0;
        monsterName = "Patchwerk"; 
    } else if(Math.random() < 0.0) {
        monsterHPModifier = 1;
        monsterHP = BigNumber.TEN * 10**monsterLevel;
        monsterMaxHP = monsterHP * monsterHPModifier;
        monsterDodge = Math.round(10 * monsterLevel - 9);
        monsterIntelligence = Math.round(10*monsterLevel - 10);
        monsterName = "Dodger";
    } else if(Math.random() < 1) {
        monsterHPModifier = 1;
        monsterHP = BigNumber.TEN * 10**monsterLevel;
        monsterMaxHP = monsterHP * monsterHPModifier;
        monsterDodge = Math.round(10*monsterLevel - 17);
        monsterIntelligence = Math.round(10*monsterLevel - 14);
        monsterName = "Wizzy";
    } else {
        monsterHPModifier = 1;
        monsterHP = BigNumber.TEN * 10**monsterLevel;
        monsterMaxHP = monsterHP * monsterHPModifier;
        monsterDodge = Math.round(10*monsterLevel - 11);
        monsterIntelligence = Math.round(10*monsterLevel - 11);
        monsterName = "Norm";
    }


    
}

var getInternalState = () => `${q}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) q = parseBigNumber(values[0]);
}

var postPublish = () => {
    monsterLevel = 1;
    strengthSum = 0;
    generateMonster(1);
}

var getSecondaryEquation = () => {

    let result = "\\begin{matrix}";
    result += "Player \\quad \\quad \\quad \\quad \\quad \\quad \\quad \\quad \\quad \\quad \\quad \\quad ";
    result += "{" + monsterName +"} \\; Level \\; {"+ monsterLevel+"}\\\\\\\\";
    result += "Damage={"+ playerDamage +"} \\quad \\quad \\quad \\quad \\quad HP={" + monsterHP.toString() + "} \\\\";
    result += "Hit\\; Chance={"+ (playerHitChance*100).toFixed(2) +"} \\% \\quad \\quad \\quad \\quad \\quad  \\quad Dodge={" + monsterDodge.toFixed(1) + "}\\\\";
    
    result += "Int\\; Penalty={"+ playerIntPenalty +"} \\quad \\quad \\quad \\quad  Intelligence={" + monsterIntelligence.toFixed(1) + "}\\\\";

    
  
    result += "\\end{matrix}";

    theory.primaryEquationHeight = 55;
    theory.secondaryEquationHeight = 150;

    return result;
}


var getPrimaryEquation = () => "{" + monsterHP + "} + {"+ monsterLevel +"} + {"+ boss1Counter +"}";
//var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho^{0.1}";
var getTertiaryEquation = () => "Str=" + strengthSum.toString() + "\\quad IntSum=" + intSum.toString();

var getPublicationMultiplier = (tau) => tau.pow(1.5);
var getPublicationMultiplierFormula = (symbol) => "{" + symbol + "}^{0.15}";
var getTau = () => currency.value.pow(BigNumber.from(0.1));
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getStrength = (level) => Utils.getStepwisePowerSum(level, 10, 10, 0);
var getDexterity = (level) => BigNumber.from(level);
var getAgility = (level) => BigNumber.from(level);
var getIntelligence = (level) => BigNumber.from(level);
var getAgilit = (level) => BigNumber.TWO.pow(level);
var getQ1Exp = (level) => BigNumber.from(1 + level * 0.05);
var getC3Exp = (level) => BigNumber.from(1 + level * 0.05);

init();