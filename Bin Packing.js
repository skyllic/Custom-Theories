import { CompositeCost, CustomCost, ExponentialCost, FirstFreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { parseBigNumber, BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "bin_packing";
var name = "Bin Packing";
var description = "Pack as many Items as you can into Bins, each Bin has a set size.\n"+
                  "Each strategy tries to minimise the amount of Bins needed to store all the Items.\n"+
                  "The Full Bin Strategy tries to combine Items so that they complelty fill a Bin, with the leftover Items it then performs First Fit Descending Strategy.\n"+
                  "The First Fit Decreasing Strategy first sorts all Items into Descending Order, it then takes the first Item and goes through each Bin until the Item fits, if no Bins can fit the Item it adds a new Bin at the end and places the item there, this repeats until no Items are left.\n"+
                  "The Next Fit Strategy first sorts Items into Ascending Order, it then takes the first Item and tries to fit it into the current Bin, if it doesnt fit it goes to a new empty Bin and adds it there, this repeats until no Items are left.\n";
var authors = "Gen (Gen#3006) - Idea\nXLII (XLII#0042) - Balancing";
var version = 1;
var releaseOrder = "7";

var rho1_dot = BigNumber.ZERO;
var rho2_dot = BigNumber.ZERO;

var updateBin_flag = false, updateMaxLv_flag = false;

var q1, q2, B_1, B_3, B_5, B_7, B_17, B_37, B_57, B_97, B_99;

var X = BigNumber.ONE;
var Y = BigNumber.ONE;
var Z = BigNumber.ONE;

var B5Term, B7Term, B17Term, B57Term, B97Term, B99Term;

var init = () => {
    currency = theory.createCurrency();
    currency2 = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // q1
    {
        let getDesc = (level) => "q_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "q_1=" + getQ1(level).toString(0);
        q1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(20, Math.log2(1.7))));
        q1.getDescription = (amount) => Utils.getMath(getDesc(q1.level));
        q1.getInfo = (amount) => Utils.getMathTo(getInfo(q1.level), getInfo(q1.level + amount));
    }

    // q2
    {
        let getDesc = (level) => "q_2=2^{" + level + "}";
        let getInfo = (level) => "q_2=" + getQ2(level).toString(0);
        q2 = theory.createUpgrade(1, currency, new ExponentialCost(20, Math.log2(5.43)));
        q2.getDescription = (amount) => Utils.getMath(getDesc(q2.level));
        q2.getInfo = (amount) => Utils.getMathTo(getInfo(q2.level), getInfo(q2.level + amount));
    }
    
    // B1
    {
        let getDesc = (level) => "B_1=" + level;
        let getInfo = (level) => "B_1=" + level;
        B_1 = theory.createUpgrade(2, currency, new ExponentialCost(100, Math.log2(1e4)));
        B_1.getDescription = (amount) => Utils.getMath(getDesc(B_1.level));
        B_1.getInfo = (amount) => Utils.getMathTo(getInfo(B_1.level), getInfo(B_1.level + amount));
        B_1.bought = (_) => updateBin_flag = true;
        B_1.level = 1;
    }
    
    // B3
    {
        let getDesc = (level) => "B_3=" + level;
        let getInfo = (level) => "B_3=" + level;
        B_3 = theory.createUpgrade(3, currency2, new ExponentialCost(5, Math.log2(5)));
        B_3.getDescription = (amount) => Utils.getMath(getDesc(B_3.level));
        B_3.getInfo = (amount) => Utils.getMathTo(getInfo(B_3.level), getInfo(B_3.level + amount));
        B_3.bought = (_) => updateBin_flag = true;
    }

    // B5
    {
        let getDesc = (level) => "B_5=" + level;
        let getInfo = (level) => "B_5=" + level;
        B_5 = theory.createUpgrade(4, currency, new ExponentialCost(1e3, Math.log2(2)));
        B_5.getDescription = (amount) => Utils.getMath(getDesc(B_5.level));
        B_5.getInfo = (amount) => Utils.getMathTo(getInfo(B_5.level), getInfo(B_5.level + amount));
        B_5.bought = (_) => updateBin_flag = true;
    }

    // B7
    {
        let getDesc = (level) => "B_7=" + level;
        let getInfo = (level) => "B_7=" + level;
        B_7 = theory.createUpgrade(5, currency2, new ExponentialCost(1e-7, Math.log2(2)));
        B_7.getDescription = (amount) => Utils.getMath(getDesc(B_7.level));
        B_7.getInfo = (amount) => Utils.getMathTo(getInfo(B_7.level), getInfo(B_7.level + amount));
        B_7.bought = (_) => updateBin_flag = true;
    }

    // B17
    {
        let getDesc = (level) => "B_{17}=" + level;
        let getInfo = (level) => "B_{17}=" + level;
        B_17 = theory.createUpgrade(6, currency, new ExponentialCost(3e57, Math.log2(10)));
        B_17.getDescription = (amount) => Utils.getMath(getDesc(B_17.level));
        B_17.getInfo = (amount) => Utils.getMathTo(getInfo(B_17.level), getInfo(B_17.level + amount));
        B_17.bought = (_) => updateBin_flag = true;
    }

    //B37
    {
        let getDesc = (level) => "B_{37}=" + level;
        let getInfo = (level) => "B_{37}=" + level;
        B_37 = theory.createUpgrade(7, currency2, new ExponentialCost(1e2, Math.log2(3)));
        B_37.getDescription = (amount) => Utils.getMath(getDesc(B_37.level));
        B_37.getInfo = (amount) => Utils.getMathTo(getInfo(B_37.level), getInfo(B_37.level + amount));
        B_37.bought = (_) => updateBin_flag = true;
        B_37.maxLevel = 100;

    }

    //B57
    {
        let getDesc = (level) => "B_{57}=" + level;
        let getInfo = (level) => "B_{57}=" + level;
        B_57 = theory.createUpgrade(8, currency, new ExponentialCost(1e150, Math.log2(1e8)));
        B_57.getDescription = (amount) => Utils.getMath(getDesc(B_57.level));
        B_57.getInfo = (amount) => Utils.getMathTo(getInfo(B_57.level), getInfo(B_57.level + amount));
        B_57.bought = (_) => updateBin_flag = true;
    }

    //B97
    {
        let getDesc = (level) => "B_{97}=" + level;
        let getInfo = (level) => "B_{97}=" + level;
        B_97 = theory.createUpgrade(9, currency2, new ExponentialCost(1e44, Math.log2(1e8)));
        B_97.getDescription = (amount) => Utils.getMath(getDesc(B_97.level));
        B_97.getInfo = (amount) => Utils.getMathTo(getInfo(B_97.level), getInfo(B_97.level + amount));
        B_97.bought = (_) => updateBin_flag = true;
    }

    //B99
    {
        let getDesc = (level) => "B_{99}=" + level;
        let getInfo = (level) => "B_{99}=" + level;
        B_99 = theory.createUpgrade(10, currency2, new ExponentialCost(1e59, Math.log2(1e9)));
        B_99.getDescription = (amount) => Utils.getMath(getDesc(B_99.level));
        B_99.getInfo = (amount) => Utils.getMathTo(getInfo(B_99.level), getInfo(B_99.level + amount));
        B_99.bought = (_) => updateBin_flag = true;
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e8);
    theory.createBuyAllUpgrade(1, currency, 1e20);
    theory.createAutoBuyerUpgrade(2, currency, 1e25);
    
    {
        perm1 = theory.createPermanentUpgrade(3, currency, new ExponentialCost(100,Math.log2(1e20)));
        perm1.getDescription = (amount) => Localization.getUpgradeMultCustomDesc("\\rho_2 \\text{ gain}", "2^{"+perm1.level+"}");
        perm1.getInfo = (amount) => Localization.getUpgradeMultCustomInfo("\\rho_2 \\text{ gain}", "2^{"+perm1.level+"}");
    }

    {
        perm2 = theory.createPermanentUpgrade(4, currency2, new ExponentialCost(1e80,Math.log2(1e5)));
        perm2.getDescription = (amount) => "$\\uparrow \\text{B_{37} Max Level by 3}$";
        perm2.getInfo = (amount) => "$\\text{Increases B_{37} max level by "+(perm2.level*3)+"}$";
        perm2.bought = (_) => updateMaxLv_flag = true;
    }

    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(new CustomCost(total => BigNumber.from(getMilCustomCost(total))));

    {
        B5Term = theory.createMilestoneUpgrade(0, 1);
        B5Term.description = Localization.getUpgradeAddTermDesc("B_5");
        B5Term.info = Localization.getUpgradeAddTermInfo("B_5");
        B5Term.boughtOrRefunded = (_) => {updateAvailability(); };
        B5Term.canBeRefunded = (_) => B17Term.level == 0 && B57Term.level == 0;
    }

    {
        B7Term = theory.createMilestoneUpgrade(1, 1);
        B7Term.description = Localization.getUpgradeAddTermDesc("B_7");
        B7Term.info = Localization.getUpgradeAddTermInfo("B_7");
        B7Term.boughtOrRefunded = (_) => {updateAvailability(); };
        B7Term.canBeRefunded = (_) => B17Term.level == 0 && B57Term.level == 0;
    }

    {
        B17Term = theory.createMilestoneUpgrade(2, 1);
        B17Term.description = Localization.getUpgradeAddTermDesc("B_{17}");
        B17Term.info = Localization.getUpgradeAddTermInfo("B_{17}");
        B17Term.boughtOrRefunded = (_) => {updateAvailability(); };
        B17Term.isAvailable = false;
        B17Term.canBeRefunded = (_) => B97Term.level == 0 && B99Term.level == 0;
    }

    {
        B57Term = theory.createMilestoneUpgrade(3, 1);
        B57Term.description = Localization.getUpgradeAddTermDesc("B_{57}");
        B57Term.info = Localization.getUpgradeAddTermInfo("B_{57}");
        B57Term.boughtOrRefunded = (_) => {updateAvailability(); };
        B57Term.isAvailable = false;
        B57Term.canBeRefunded = (_) => B97Term.level == 0 && B99Term.level == 0;
    }

    {
        B97Term = theory.createMilestoneUpgrade(4, 1);
        B97Term.description = Localization.getUpgradeAddTermDesc("B_{97}");
        B97Term.info = Localization.getUpgradeAddTermInfo("B_{97}");
        B97Term.boughtOrRefunded = (_) => {updateAvailability(); };
        B97Term.isAvailable = false;
        B97Term.canBeRefunded = (_) => ZEffect.level == 0;
    }

    {
        B99Term = theory.createMilestoneUpgrade(5, 1);
        B99Term.description = Localization.getUpgradeAddTermDesc("B_{99}");
        B99Term.info = Localization.getUpgradeAddTermInfo("B_{99}");
        B99Term.boughtOrRefunded = (_) => {updateAvailability(); };
        B99Term.isAvailable = false;
        B99Term.canBeRefunded = (_) => ZEffect.level == 0;
    }

    {
        ZEffect = theory.createMilestoneUpgrade(6, 1);
        ZEffect.getDescription = (amount) => "$\\dot{\\rho_1}\\text{ gain}\\times (Y-10(Z-1)), \\text{ }\\dot{\\rho_2}\\text{ gain}\\times Z$";
        ZEffect.getInfo = (amount) => "$\\text{Multiplies }\\dot{\\rho_1} \\text{ by } (Y-10(Z-1)), \\text{ Multiplies }\\dot{\\rho_2} \\text{ by } Z$";
        ZEffect.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            theory.invalidateSecondaryEquation();
            theory.invalidateTertiaryEquation();
             updateAvailability(); };
        ZEffect.isAvailable = false;
        ZEffect.canBeRefunded = (_) => ZExp.level == 0;

    }

    {
        ZExp = theory.createMilestoneUpgrade(7, 4);
        ZExp.description = Localization.getUpgradeIncCustomExpDesc("Z", "0.05");
        ZExp.getInfo = (amount) => "$\\text{Increases }Z\\text{ exponent by 0.05 for }\\dot{\\rho_2}$";
        ZExp.boughtOrRefunded = (_) => {
            theory.invalidatePrimaryEquation();
            updateAvailability(); 
        };
        ZExp.isAvailable = false;
    }

    updateAvailability();
}

var updateAvailability = () => {
    B17Term.isAvailable = B5Term.level == 1 && B7Term.level == 1; 
    B57Term.isAvailable = B5Term.level == 1 && B7Term.level == 1; 
    B97Term.isAvailable = B17Term.level == 1 && B57Term.level == 1
    B99Term.isAvailable = B17Term.level == 1 && B57Term.level == 1; 
    ZEffect.isAvailable = B97Term.level == 1 && B99Term.level == 1; 
    ZExp.isAvailable = ZEffect.level == 1;

    B_5.isAvailable = B5Term.level == 1;
    B_7.isAvailable = B7Term.level == 1;
    B_17.isAvailable = B17Term.level == 1;
    B_57.isAvailable = B57Term.level == 1;
    B_97.isAvailable = B97Term.level == 1;
    B_99.isAvailable = B99Term.level == 1;

    updateBin_flag = true;
}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime*multiplier) * (3*Math.log10(theory.publicationMultiplier)+1); 
    let bonus = theory.publicationMultiplier; 
    let vq1 = getQ1(q1.level);
    let vq2 = getQ2(q2.level);
    
    if(updateMaxLv_flag){
        B_37.maxLevel = 100 + perm2.level*3;
        updateMaxLv_flag = false;
    }

    if (updateBin_flag) {
        let Bins  = [
            B99Term.level == 1 ? B_99.level : 0,
            B97Term.level == 1 ? B_97.level : 0, 
            B57Term.level == 1 ? B_57.level : 0, 
            B_37.level,
            B17Term.level == 1 ? B_17.level : 0,
            B7Term.level == 1 ? B_7.level : 0, 
            B5Term.level == 1 ? B_5.level : 0, 
            B_3.level, B_1.level]
        let Bins2 = Bins.slice().reverse();
        let Bins3 = Bins.slice();

        X = getX(Bins);
        Y = getY(Bins2);
        Z = ZEffect.level == 1 ? getZ(Bins3) : BigNumber.ONE;

        updateBin_flag = false;
    }

    rho1_dot = vq1 * vq2 * BigNumber.TWO.pow(X) * (ZEffect.level == 1 ? (Y-BigNumber.TEN*(Z-BigNumber.ONE)) : BigNumber.ONE); 
    rho2_dot = q1.level > 0 ? BigNumber.FIVE.pow(Y-X) * BigNumber.TWO.pow(perm1.level) * BigNumber.from(Z).pow(getZExp(ZExp.level)) : BigNumber.ZERO ; 

    currency.value += bonus * rho1_dot * dt;
    currency2.value += bonus * rho2_dot * dt;

    theory.invalidateTertiaryEquation();
}

var getInternalState = () => ``;

var setInternalState = (state) => {
    let values = state.split(" ");
    
    updateBin_flag = true;
    updateMaxLv_flag = true;
}

var postPublish = () => {
    updateBin_flag = true;
    B_1.level = 1;
}

var getMilCustomCost = (lvl) =>{
    //10,70,90,160,210,260,300,360,410,460,510 (rho)
    //1.5,10.5,13.5,24,31.5,39,45,54,61.5,69,76.5 (tau)
    switch (lvl){
        case 0:
            return 10*0.15;
        case 1:
            return 70*0.15;
        case 2:
            return 90*0.15;
        case 3:
            return 160*0.15;
        case 4:
            return 210*0.15;
        case 5:
            return 260*0.15;
        case 6:
            return 300*0.15;
        case 7:
            return 360*0.15;
        case 8:
            return 410*0.15;
        case 9:
            return 460*0.15;
    }
    return 510*0.15;
}

var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 65;
    theory.primaryEquationScale = 1;
    let result = "\\begin{matrix}";

    result += "\\dot{\\rho_1}=";
    result += "2^X";
    if(ZEffect.level == 1) result += "(Y-10(Z-1))";

    result += "q_1q_2\\\\\\\\\\dot{\\rho_2}=";

    if (ZEffect.level == 1) result += "Z";
    if (ZExp.level > 0) result += "^{"+(1+0.05*ZExp.level)+"}";

    if (ZEffect.level == 1) result += "(";

    result += "5^{Y-X}";

    if(ZEffect.level == 1) result += ")";

    result += "\\end{matrix}\\\\";
    return result;
}

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 130;
    theory.secondaryEquationScale = 0.95;
    let result = "\\text{For each X/Y Bin: } (B_i+B_j+...)\\le 100\\\\";
    if(ZEffect.level == 1) result += "\\text{For each Z Bin: } (B_i+B_j+...)\\le 1000\\\\";

    result += "\\\\";
    result += "\\text{X = Bins used with Full Bin Strategy}\\\\";
    result += "\\text{Y = Bins used with Next Fit Strategy}\\\\";
    if(ZEffect.level == 1) result += "\\text{Z = Bins used with Best Fit Strategy}\\\\";
    
    result += "\\\\\\qquad\\qquad\\qquad\\qquad";
    result += theory.latexSymbol + "=\\max\\rho^{0.15}"
    return result;
}

var getTertiaryEquation = () => {
    let result = "\\begin{matrix}";

    result += "X ="
    result += X.toString();

    result += ",&Y ="
    result += Y.toString();
    
    if(ZEffect.level == 1) result += ",&Z ="
    if(ZEffect.level == 1) result += Z.toString();

    result += "\\end{matrix}";
    return result;
}

var indexToValue = [1,3,5,7,17,37,57,97,99];
var RindexToValue = [99,97,57,37,17,7,5,3,1];
var RValueToIndexObj = {99:0, 97:1, 57:2, 37:3, 17:4, 7:5,5:6, 3:7, 1:8};

//Full Bin Strategy
//First fills up Bins with easy sequences, then brute forces full bins, then uses First Fit Decreasing on rest of items
var getX = (XItems) => {
    let TotalXBins = 0;

    //99 + 1 = 100
    let itr = Math.min(XItems[0],XItems[8]);
    XItems[0] -= itr;
    XItems[8] -= itr;
    TotalXBins += itr;

    //97 + 3 = 100
    itr = Math.min(XItems[1],XItems[7]);
    XItems[1] -= itr;
    XItems[7] -= itr;
    TotalXBins += itr;

    //97 + 3*1 = 100
    itr = Math.floor(Math.min(XItems[1],XItems[8]/3));
    XItems[1] -= itr;
    XItems[8] -= 3*itr;
    TotalXBins += itr;

    //57 + 37 + 5 + 1 = 100 
    itr = Math.min(XItems[2],XItems[3],XItems[6],XItems[8]);
    XItems[2] -= itr;
    XItems[3] -= itr;
    XItems[6] -= itr;
    XItems[8] -= itr;  
    TotalXBins += itr;

    //57 + 37 + 3 + 3 = 100
    itr = Math.floor(Math.min(XItems[2],XItems[3],XItems[7]/2));
    XItems[2] -= itr;
    XItems[3] -= itr;
    XItems[7] -= 2*itr;
    TotalXBins += itr;

    //57 + 17 + 17 + 5 + 3 + 1 = 100
    itr = Math.floor(Math.min(XItems[2],XItems[4]/2,XItems[6],XItems[7],XItems[8]));
    XItems[2] -= itr;
    XItems[4] -= 2*itr;
    XItems[6] -= itr;
    XItems[7] -= itr;
    XItems[8] -= itr;
    TotalXBins += itr;

    //57 + 17 + 17 + 3*3 = 100
    itr = Math.floor(Math.min(XItems[2],XItems[4]/2,XItems[7]/3));
    XItems[2] -= itr;
    XItems[4] -= 2*itr;
    XItems[7] -= 3*itr;
    TotalXBins += itr;

    //37 + 37 + 17 + 7 + 1 + 1 = 100
    itr = Math.floor(Math.min(XItems[3]/2,XItems[4],XItems[5],XItems[8]/2));
    XItems[3] -= 2*itr;
    XItems[4] -= itr;
    XItems[5] -= itr;
    XItems[6] -= 2*itr;
    TotalXBins += itr;

    //37 + 3*17 + 7 + 5 = 100
    itr = Math.floor(Math.min(XItems[3],XItems[4]/3,XItems[5],XItems[6]));
    XItems[3] -= itr;
    XItems[4] -= 3*itr;
    XItems[5] -= itr;
    XItems[6] -= itr;
    TotalXBins += itr;

    //37 + 17 + 17 + 4*7 + 1 = 100
    itr = Math.floor(Math.min(XItems[3],XItems[4]/2,XItems[5]/4,XItems[8]));
    XItems[3] -= itr;
    XItems[4] -= 2*itr;
    XItems[5] -= 4*itr;
    XItems[8] -= itr;
    TotalXBins += itr;

    //37 + 7*9 = 100
    itr = Math.floor(Math.min(XItems[3],XItems[5]/9));
    XItems[3] -= itr;
    XItems[5] -= 9*itr;
    TotalXBins += itr;

    //17*5 + 5*3= 100
    itr = Math.floor(Math.min(XItems[4]/5,XItems[6]/3));
    XItems[4] -= 5*itr;
    XItems[6] -= 3*itr;
    TotalXBins += itr;

    //17*5 + 7 + 7 + 1 = 100
    itr = Math.floor(Math.min(XItems[4]/5,XItems[5]/2,XItems[8]));
    XItems[4] -= 5*itr;
    XItems[5] -= 2*itr;
    XItems[8] -= itr;
    TotalXBins += itr;

    //17*5 + 3*5= 100
    itr = Math.floor(Math.min(XItems[4]/5,XItems[7]/5));
    XItems[4] -= 5*itr;
    XItems[7] -= 5*itr;
    TotalXBins += itr;

    //57 + 17 + 5*5 + 1 = 100
    itr = Math.floor(Math.min(XItems[2],XItems[4],XItems[6]/5,XItems[8]));
    XItems[2] -= itr;
    XItems[4] -= itr;
    XItems[6] -= 5*itr;
    XItems[8] -= itr;
    TotalXBins += itr;

    //57 + 37 + 6*1 = 100
    itr = Math.floor(Math.min(XItems[2],XItems[3],XItems[8]/6));
    XItems[2] -= itr;
    XItems[3] -= itr;
    XItems[8] -= 6*itr;
    TotalXBins += itr;

    //37 + 21*3 = 100
    itr = Math.floor(Math.min(XItems[3],XItems[5]/21));
    XItems[3] -= itr;
    XItems[7] -= 21*itr;
    TotalXBins += itr;

    //13*7 + 3*3 = 100
    itr = Math.floor(Math.min(XItems[5]/13,XItems[7]/3));
    XItems[5] -= 13*itr;
    XItems[7] -= 3*itr;
    TotalXBins += itr;

    //14*7 + 1 + 1 = 100
    itr = Math.floor(Math.min(XItems[5]/14,XItems[8]/2));
    XItems[5] -= 14*itr;
    XItems[8] -= 2*itr;
    TotalXBins += itr;

    //5*20 = 100
    itr = Math.floor(XItems[6]/20);
    XItems[6] -= 20*itr;
    TotalXBins += itr;

    //Brute Force

    //Sets the Starting Item to start packing
    let currentShift = 2; //Skip 99 & 97 since all possible combinations are already done
    let currentSpaceLeft;
    let ItemsUsed;
    let checkSpace;

    while(true){
        while(currentShift < 9 && XItems[currentShift] == 0){
            currentShift++;
        }
        
        if(currentShift == 9){
            break;
        }
        
        currentSpaceLeft = 100;
        ItemsUsed = [0,0,0,0,0,0,0,0,0]

        //For each type of Item
        for(let i = currentShift; i<9; i++){    
            //take minimum of either floor div or amount of the specific Items left
            itr = Math.floor(Math.min(currentSpaceLeft/RindexToValue[i],XItems[i]));
            XItems[i] -= itr;
            ItemsUsed[i] += itr;
            currentSpaceLeft -= RindexToValue[i]*itr;

            //Check if that filled the Bin
            if(currentSpaceLeft == 0){
                TotalXBins++;
                break;
            }

            //Depth 1 check to see if Bin can be filled
            checkSpace = RValueToIndexObj[currentSpaceLeft];
            if(checkSpace != undefined && XItems[checkSpace] != 0){
                XItems[checkSpace]--;
                ItemsUsed[checkSpace]++;
                currentSpaceLeft = 0;
                TotalXBins++;
                break;
            }
        }

        //Once a 100 combination is found repeat it until one or more of the items run out
        if(currentSpaceLeft == 0){
            itr = Infinity;
            for(let i=2;i<9;i++){//Start at 2 since: 99 & 97 all possible combinations are already done
                if(ItemsUsed[i]!=0){
                    itr = Math.min(itr,Math.floor(XItems[i]/ItemsUsed[i]))
                }
            }
            for(let i=2;i<9;i++){
                XItems[i] -= ItemsUsed[i]*itr;
            }
            TotalXBins += itr;
        }
        //If 100 is not reached refund the Items and increase shift
        else{
            for(let i=currentShift;i<9;i++){
                XItems[i] += ItemsUsed[i];
            }
            currentShift++;
        }
    }

    //Use First Fit decreasing on the Items that are left
    let FFDBins = FFD(XItems);

    if(FFDBins != -1){
        TotalXBins = TotalXBins + FFDBins;
    }else{
        TotalXBins = TotalXBins + Math.floor(approxBins(XItems));
    }
    return TotalXBins;

}

//Fixes reaching max statments when only buying large Items
var approxBins = (AItems) =>{
    return (99*AItems[0]+97*AItems[1]+57*AItems[2]+37*AItems[3]+17*AItems[4]+7*AItems[5])/100;
}

//First Fit Decreasing Algorithm
var FFD = (FFDItems) => {
    let numItems = FFDItems.reduce((partialSum, a) => partialSum + a, 0);

    //if there are no Items then no Bins needed
    if(numItems == 0){
        return 0;
    }

    //IF about to reach max statements stop
    if (approxBins(FFDItems)>140){
        return -1;
    }

    //Setup
    let TotalFFDBins = 1;
    let spaceLeftInBins = [100];
    let currentItemIndex = 0;
    let fitBin;
    let spaceLeftInBinsLength = 1;
    let itr;

    //While Items are still left
    while(numItems != 0){
        //while no Items at current index change index
        while(FFDItems[currentItemIndex] == 0){
            currentItemIndex++;
        }

        //Flag if an Item was added or not to a Bin
        fitBin = false;

        //Go through each Bin
        for(let j = 0; j < spaceLeftInBinsLength; j++){
            //If there is space to add an item to a bin, add it, set flag and break
            if(spaceLeftInBins[j] > RindexToValue[currentItemIndex]){
                //Add Items to Bin until either same items run out, or not enough space anymore
                itr = Math.floor(Math.min(spaceLeftInBins[j]/RindexToValue[currentItemIndex],FFDItems[currentItemIndex]))
                spaceLeftInBins[j] -= itr*RindexToValue[currentItemIndex];
                FFDItems[currentItemIndex] -= itr;
                numItems -= itr;
                fitBin = true;
                break;
            }//If it fills up Bin, then remove it from array and update correct length (performance reasons)
            else if(spaceLeftInBins[j] == RindexToValue[currentItemIndex]){
                fitBin = true;
                spaceLeftInBins.splice(j,1);
                spaceLeftInBinsLength--;

                FFDItems[currentItemIndex]--;
                numItems--;
                break;
            }
        }

        //If there was no space in any of the Bins, create a new bin and add the item there
        if(!fitBin){
            spaceLeftInBins.push(100 - RindexToValue[currentItemIndex]);
            TotalFFDBins++;
            spaceLeftInBinsLength++;
            FFDItems[currentItemIndex]--;
            numItems--;
        }
    }

    return TotalFFDBins;
}

//Uses Next Fit with Items sorted in Ascending Order
var getY = (YItems) => {
    //Setup
    let numItems = YItems.reduce((partialSum, a) => partialSum + a, 0) 
    let TotalYBins = 1;
    let spaceLeftInBin = 100;
    let currentItemIndex = 0;
    let itr;

    // Place Items one by one
    while(numItems != 0){
        //while no Items at current index change index
        while(YItems[currentItemIndex] == 0){
            currentItemIndex++;
        }
        // If this Item can't fit in current Bin, create a new Bin
        if (indexToValue[currentItemIndex] > spaceLeftInBin) {
            TotalYBins++;
            spaceLeftInBin = 100 - indexToValue[currentItemIndex];
            YItems[currentItemIndex]--;
            numItems--;
        }else{
            //itr here for more performance
            //Half implement it for when Items <= 17
            if(currentItemIndex > 4){
                spaceLeftInBin -= indexToValue[currentItemIndex];
                YItems[currentItemIndex]--;
                numItems--;
            }else{
                itr = Math.floor(Math.min(spaceLeftInBin/indexToValue[currentItemIndex],YItems[currentItemIndex]));
                spaceLeftInBin -= itr*indexToValue[currentItemIndex];
                YItems[currentItemIndex] -= itr;
                numItems -= itr;
            }
        }
    }
    return TotalYBins;
}

//Best Fit, 1000 Bin Size Descending Order
var getZ = (ZItems) => {
    let numItems = ZItems.reduce((partialSum, a) => partialSum + a, 0);

    //if there are no Items then no Bins needed
    if(numItems == 0){
        return 0;
    }

    //Setup
    let TotalZBins = 1;
    let spaceLeftInBins = [1000];
    let spaceLeftInBinsLength = 1;
    let currentItemIndex = 0;
    let fitABin;
    let smallestSpace;
    let smallestSpaceIndex;
    let perfectFit;
    let itr;

    //While Items remain
    while (numItems != 0){
        //while no Items at current index change index
        while(ZItems[currentItemIndex] == 0){
            currentItemIndex++;
        }

        //Flag if an Item can be possibly added or not to a Bin
        fitABin = false;
        smallestSpace = 1001;
        perfectFit = false;

        //Go through each Bin
        for(let j = 0; j < spaceLeftInBinsLength; j++){
            //If there is space to add an item to a bin, check if it has the smallest space left, if so then record it, set flag 
            if(spaceLeftInBins[j] < smallestSpace && spaceLeftInBins[j] > RindexToValue[currentItemIndex]){
                smallestSpace = spaceLeftInBins[j];
                smallestSpaceIndex = j;
                fitABin = true;
            }//Skip rest of Bins if a perfect fit
            else if(spaceLeftInBins[j] == RindexToValue[currentItemIndex]){
                smallestSpaceIndex = j;
                fitABin = true;
                perfectFit = true;
                break;
            } 
        }

        //If there was no space in any of the Bins, create a new bin and add the item there
        if(!fitABin){
            spaceLeftInBins.push(1000 - RindexToValue[currentItemIndex]);
            TotalZBins++;
            spaceLeftInBinsLength++;
            ZItems[currentItemIndex]--;
            numItems--;
        }else{
            if(perfectFit){
                spaceLeftInBins.splice(smallestSpaceIndex,1);
                spaceLeftInBinsLength--;
                ZItems[currentItemIndex]--;
                numItems--;
            }else{
                //Add Items to Bin until either same items run out, or not enough space anymore
                itr = Math.floor(Math.min(smallestSpace/RindexToValue[currentItemIndex],ZItems[currentItemIndex]))
                spaceLeftInBins[smallestSpaceIndex] -= itr*RindexToValue[currentItemIndex];
                ZItems[currentItemIndex] -= itr;
                numItems -= itr;
            }
        }
    }

    return TotalZBins;
}

var getPublicationMultiplier = (tau) => tau.isZero ? BigNumber.ONE : tau;
var getPublicationMultiplierFormula = (symbol) => "{" + symbol + "}";
var getTau = () => currency.value.pow(BigNumber.from(0.15));
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(1/0.15), currency.symbol];
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getQ1 = (level) => Utils.getStepwisePowerSum(level, 4, 10, 0);
var getQ2 = (level) => BigNumber.TWO.pow(level);
var getZExp = (level) => (1 + 0.05 * level);

init();