import { CompositeCost, CustomCost, ExponentialCost, FirstFreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { parseBigNumber, BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "fractional_integration";
var name = "Fractional Integration";
var description = "The functions between a function and it's derivative have many ways of being shown, this is one of them."+
                    "Fractional integration is a way to calculate what is between a function and its integral and is a smooth transition."+
                    "As such, as a fractional integral approaches 1, it should become the integral.";
var authors = "Snaeky (SnaekySnacks#1161) - Idea\nGen (Gen#3006) - Coding\nXLII (XLII#0042) - Balancing";
var version = 1;
var releaseOrder = "6";

var rho_dot = BigNumber.ZERO;
var t_cumulative = BigNumber.ZERO;

// lambda = 1 - 1/2^k
// lambda = 1 - `lambda_man`e`lambda_exp` 
// 1/2^k in xxxe-xxx form
//man =  10^((log(1)-k*log(2)) - exp)
//exp = floor(log(1) - k*log(2))
var lambda_man = BigNumber.ZERO;
var lambda_exp = BigNumber.ZERO;

//used for approx calculation
var lambda_base = BigNumber.TWO;

//ID - f(x)
//0 - cos(x)
//1 - sin(x)
//2 - log10(1+x)    
//3 - e^x -1 
var f_x = 0;

var q = BigNumber.ZERO;
var r = BigNumber.ZERO;

var update_divisor = true;

var q1, q2, t, k, m, n;
var q1Exp, MTerm, NTerm, fxUpg, baseUpg;

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades
    
    //t
    {
        let getDesc = (level) => "\\dot{t}=" + getT(level).toString(1);
        let getInfo = (level) => "\\dot{t}=" + getT(level).toString(1);
        t = theory.createUpgrade(0, currency, new ExponentialCost(1e25, Math.log2(1e50)));
        t.getDescription = (amount) => Utils.getMath(getDesc(t.level));
        t.getInfo = (amount) => Utils.getMathTo(getInfo(t.level), getInfo(t.level + amount));
        t.maxLevel=4;
    }

    // q1
    {
        let getDesc = (level) => "q_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "q_1=" + getQ1(level).toString(0);
        q1 = theory.createUpgrade(1, currency, new FirstFreeCost(new ExponentialCost(20, 5)));
        q1.getDescription = (amount) => Utils.getMath(getDesc(q1.level));
        q1.getInfo = (amount) => Utils.getMathTo(getInfo(q1.level), getInfo(q1.level + amount));
    }

    //q2
    {
        let getDesc = (level) => "q_2=2^{" + level+"}";
        let getInfo = (level) => "q_2=" + getQ2(level).toString(0);
        q2 = theory.createUpgrade(2, currency, new CustomCost(
            level => q2Costs[Math.min(2,fxUpg.level)].getCost(level) ,
            (level,extra) => q2Costs[Math.min(2,fxUpg.level)].getSum(level,level+extra),
            (level,vrho) => q2Costs[Math.min(2,fxUpg.level)].getMax(level,vrho)
        ));
        q2.getDescription = (amount) => Utils.getMath(getDesc(q2.level));
        q2.getInfo = (amount) => Utils.getMathTo(getInfo(q2.level), getInfo(q2.level + amount));
    }

    //K
    {
        let getDesc = (level) => "K= " + getK(level).toString(0);
        let getInfo = (level) => "K=" + getK(level).toString(0);
        k = theory.createUpgrade(3, currency, new CustomCost(
            level => KCosts[baseUpg.level].getCost(level),
            (level,extra) => KCosts[baseUpg.level].getSum(level,level+extra),
            (level,vrho) => KCosts[baseUpg.level].getMax(level,vrho)
        ));
        k.getDescription = (amount) => Utils.getMath(getDesc(k.level));
        k.getInfo = (amount) => Utils.getMathTo(getInfo(k.level), getInfo(k.level + amount));
        k.bought = (_) => update_divisor = true;
        k.level = 1;
    }

    //M
    {
        let getDesc = (level) => "m= 1.5^{" + level + "}";
        let getInfo = (level) => "m=" + getM(level).toString(0);
        m = theory.createUpgrade(4, currency, new ExponentialCost(1e3, Math.log2(4.44)));
        m.getDescription = (amount) => Utils.getMath(getDesc(m.level));
        m.getInfo = (amount) => Utils.getMathTo(getInfo(m.level), getInfo(m.level + amount));
    }

    //N
    {
        let getDesc = (level) => "n= " + getN(level).toString(0);
        let getInfo = (level) => "n=" + getN(level).toString(0);
        n = theory.createUpgrade(5, currency, new ExponentialCost(1e10, Math.log2(1.531)));
        n.getDescription = (amount) => Utils.getMath(getDesc(n.level));
        n.getInfo = (amount) => Utils.getMathTo(getInfo(n.level), getInfo(n.level + amount));
        n.level = 1;
    }


    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e8);
    theory.createBuyAllUpgrade(1, currency, 1e15);
    theory.createAutoBuyerUpgrade(2, currency, 1e25);

    {
        perm1 = theory.createPermanentUpgrade(3, currency, new ExponentialCost(1e300,Math.log2(1e20)));
        perm1.getDescription = (amount) => "$\\text{Unlock f(x) Milestone lv }$"+(perm1.level+1);
        perm1.getInfo = (amount) => "$\\text{Unlocks the f(x) Milestone lv }$"+(perm1.level+1);
        perm1.boughtOrRefunded = (_) => updateAvailability();
        perm1.maxLevel = 3;
    }

    {
        perm2 = theory.createPermanentUpgrade(4, currency, new ExponentialCost(1e300,Math.log2(1e50)));
        perm2.getDescription = (amount) => "$\\text{Unlock }\\lambda \\text{ Milestone lv }$"+(perm2.level+1);
        perm2.getInfo = (amount) => "$\\text{Unlocks the }\\lambda \\text{ Milestone lv }$"+(perm2.level+1);
        perm2.boughtOrRefunded = (_) => updateAvailability();
        perm2.maxLevel = 2;
    }


    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(new CustomCost(total => BigNumber.from(getMilCustomCost(total))));

    {
        q1Exp = theory.createMilestoneUpgrade(0, 3);
        q1Exp.description = Localization.getUpgradeIncCustomExpDesc("q_1", "0.15");
        q1Exp.info = Localization.getUpgradeIncCustomExpInfo("q_1", "0.15");
        q1Exp.boughtOrRefunded = (_) => {theory.invalidateSecondaryEquation();updateAvailability();};
    }

    {
        MTerm = theory.createMilestoneUpgrade(1, 1);
        MTerm.description = Localization.getUpgradeAddTermDesc("m");
        MTerm.info = Localization.getUpgradeAddTermInfo("m");
        MTerm.boughtOrRefunded = (_) => {theory.invalidatePrimaryEquation(); updateAvailability(); };
    }

    {
        NTerm = theory.createMilestoneUpgrade(2, 1);
        NTerm.description = Localization.getUpgradeAddTermDesc("n");
        NTerm.info = Localization.getUpgradeAddTermInfo("n");
        NTerm.boughtOrRefunded = (_) => {theory.invalidatePrimaryEquation(); updateAvailability(); };
    }

    {
        fxUpg = theory.createMilestoneUpgrade(3, 3);
        fxUpg.getDescription = (_) => {
            if (fxUpg.level == 0){
                return "$\\text{Approximate }\\sin(x) \\text{ to 5 terms}$";
            }else if (fxUpg.level == 1){
                return "$\\text{Approximate }\\log_{10}(1+x) \\text{ to 5 terms}$";
            }
            return "$\\text{Approximate }e^{x} \\text{ to 5 terms \\& {} Remove / } \\pi \\text{ in Integral limit} $";
        };
        fxUpg.getInfo = (_) => {
            if (fxUpg.level == 0){
                return "$\\text{Change f(x) to } x-\\frac{x^3}{3!}+\\frac{x^5}{5!}$";
            }else if (fxUpg.level == 1){
                return "$\\text{Change f(x) to } (x-\\frac{x^2}{2}+\\frac{x^3}{3}-\\frac{x^4}{4}+\\frac{x^5}{5})/\\ln(10)$";                
            }
            return "$\\text{Change f(x) to } 1+x+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\frac{x^4}{4!}+\\frac{x^5}{5!} \\text{ \\& {} q/} \\pi \\to q$";

        };
        fxUpg.boughtOrRefunded = (_) => {
            //Bought/Refunded 1st/2nd milestone
            if(!(f_x == 3 || fxUpg.level == 3)){
                q2.level = 0;
                q = 0;
            }
            f_x = fxUpg.level;           
            theory.invalidatePrimaryEquation();
            theory.invalidateSecondaryEquation();
            updateAvailability();
        }
        fxUpg.canBeBought = (_) => fxUpg.level < perm1.level;
    }

    {
        baseUpg = theory.createMilestoneUpgrade(4, 2);
        baseUpg.getDescription = (_) => {
            if(baseUpg.level == 0){
                return "$\\text{Improve } \\lambda \\text{ Fraction to } 2/3^{i}$";
            }
            return "$\\text{Improve } \\lambda \\text{ Fraction to } 3/4^{i}$"
        }
        baseUpg.getInfo = (_) => {
            if(baseUpg.level == 0){
                return "$\\text{Improve } \\lambda \\text{ Fraction to } 2/3^{i}$";
            }
            return "$\\text{Improve } \\lambda \\text{ Fraction to } 3/4^{i}$"
        } ;
        baseUpg.boughtOrRefunded = (_) => {
            lambda_base = BigNumber.from(2 + baseUpg.level);
            k.level = 1;
            update_divisor = true;
            theory.invalidateSecondaryEquation();
            theory.invalidateTertiaryEquation();
            updateAvailability();
        }
        baseUpg.canBeBought = (_) => baseUpg.level < perm2.level;
    }

    updateAvailability();
}

var updateAvailability = () => {
    fxUpg.isAvailable = perm1.level > 0;
    baseUpg.isAvailable = perm2.level > 0;

    m.isAvailable = MTerm.level > 0;
    n.isAvailable = NTerm.level > 0;
}

var tick = (elapsedTime, multiplier) => {
    let speedup = 3*Math.log10(theory.publicationMultiplier)+1;
	
    let dt = BigNumber.from(elapsedTime*multiplier*speedup); 
    let bonus = theory.publicationMultiplier; 
    let vq1 = getQ1(q1.level).pow(getQ1Exp(q1Exp.level));
    let vq2 = getQ2(q2.level);
    let vt = getT(t.level);
    let vk = getK(k.level);
    let vm = (MTerm.level > 0) ? getM(m.level) : 1;
    let vn = (NTerm.level > 0) ? getN(n.level) : 1;

    let vapp = approx(vk,lambda_base);

    if(update_divisor){
        var temp = -vk*lambda_base.log10();
        lambda_exp = Math.floor(temp);
        lambda_man = BigNumber.TEN.pow(temp-lambda_exp);
        update_divisor = false;
    }

    if (q1.level > 0) t_cumulative += vt * dt;
    q += vq1 * vq2 * dt;
    if (q1.level > 0) r += vapp * dt;
    
    rho_dot = vm * vn * t_cumulative * norm_int(q/(f_x < 3 ? BigNumber.PI : 1)).pow(1/3) * r;
    currency.value += bonus * rho_dot * dt;

    theory.invalidateTertiaryEquation();
}

var getInternalState = () => `${t_cumulative} ${lambda_man} ${lambda_exp} ${q} ${r}`;

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) t_cumulative = parseBigNumber(values[0]);
    if (values.length > 1) lambda_man = parseBigNumber(values[1]);
    if (values.length > 2) lambda_exp = parseBigNumber(values[2]);
    if (values.length > 3) q = parseBigNumber(values[3]);
    if (values.length > 4) r = parseBigNumber(values[4]);
}


//Q2 Cost
var q2Cost1 = new ExponentialCost(1e7, Math.log2(5e3)); //fx == 0 
var q2Cost2 = new ExponentialCost(1e7, Math.log2(3e5)); //fx == 1 
var q2Cost3 = new ExponentialCost(1, Math.log2(3e5));   //fx >= 2
var q2Costs = [q2Cost1,q2Cost2,q2Cost3];

//K Cost
var KCost1 = new ExponentialCost(1e2,Math.log2(10));                     //base == 2
var KCost2 = new ExponentialCost(1e2,Math.log2(38));                     // base == 3
var KCost3 = new ExponentialCost(BigNumber.TEN.pow(47.5),Math.log2(78)); //base == 4
var KCosts = [KCost1,KCost2,KCost3];

//Milestone Cost
var getMilCustomCost = (level) => {
    //20,70,210,300,425,530,650,800,950,1100
    switch(level){
        case 0:
            return 2;
        case 1:
            return 7;
        case 2:
            return 21;
        case 3:
            return 30;
        case 4:
            return 42.5;
        case 5:
            return 53;
        case 6:
            return 65;
        case 7:
            return 80;
        case 8:
            return 95;
    }
    return 110;
};


var postPublish = () => {
    t_cumulative = BigNumber.ZERO;
    q = BigNumber.ZERO;
    r = BigNumber.ZERO;
    update_divisor = true;
    k.level = 1;
    n.level = 1;
}

var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 85;
    theory.primaryEquationScale = 1.3;
    let result = "\\begin{matrix}";
    result += "\\dot{\\rho}=tr";
    if(MTerm.level > 0) result +="m";
    if(NTerm.level > 0) result +="n";
    result += "\\sqrt[3]{\\int_{0}^{";
    if(f_x<3){
        result += "q/\\pi"
    }else{
        result += "q";
    }
    result += "}f(x)dx}\\\\\\\\";
    result += "\\dot{r}=(\\int_{0}^{\\pi}f(x)dx - _{\\lambda}\\int_{0}^{\\pi}f(x)dx^{\\lambda})^{-1}";
    result += "\\end{matrix}";
    return result;
}

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 100;
    theory.secondaryEquationScale = 1.2;
    let result = "";
    result += "&f(x) = ";
    result += fx_latex();
    result += ",\\quad\\lambda = \\sum_{i=1}^{K}\\frac{"+(lambda_base-1).toString(0)+"}{"+lambda_base.toString(0)+"^{i}}\\\\\\\\";
    result += "&\\quad\\qquad\\qquad\\dot{q}=q_1"
    if (q1Exp.level > 0) result += `^{${1+q1Exp.level*0.15}}`;
    result += "q_2\\quad"+theory.latexSymbol + "=\\max\\rho^{0.1}";
    result += ""
    return result;
}

var getTertiaryEquation = () => {
    let result = "";
    result += "\\begin{matrix}";
    result += "&\\qquad\\qquad\\quad1/"+lambda_base.toString(0)+"^{k}=";
    if(getK(k.level) < 8 && 1/lambda_base.pow(getK(k.level))>0.001){
        result += (1/lambda_base.pow(getK(k.level))).toString(4);
    }else{
        result += lambda_man+"e"+lambda_exp;
    }
    
    result += ",&\\qquad\\qquad\\quad\\dot{\\rho} ="
    result += rho_dot.toString()+"\\\\";


    result += ",&\\qquad t=";
    result += t_cumulative.toString();

    result += ",&q=";
    result += q.toString();

    result += ",&r=";
    result += r.toString()
    result += "\\end{matrix}";

    return result;
}

//Approximates value for 1/(normal integral - fractional integral) https://www.desmos.com/calculator/ua2v7q9mza
var approx = (k_v,base) => {
    return BigNumber.TEN.pow(-norm_int(BigNumber.PI).log10()-BigNumber.ONE/(BigNumber.E+BigNumber.from(1.519))+k_v*base.log10());
}

//integrates f(x) and returns value with 0 -> limit, as limits
//abs not really needed?
var norm_int = (limit) => {
    switch (f_x){
        case 0:
            return (limit.pow(5)/120 - limit.pow(3)/6 + limit).abs();
        case 1:
            return (limit.pow(6)/720 - limit.pow(4)/24 + limit.pow(2)/2).abs();
        case 2:
            return ((limit.pow(6)/30 - limit.pow(5)/20 + limit.pow(4)/12 - limit.pow(3)/6 + limit.pow(2)/2)/BigNumber.TEN.log()).abs();
        case 3:
            return limit.pow(6)/720 + limit.pow(5)/120 + limit.pow(4)/24 + limit.pow(3)/6 + limit.pow(2)/2 + limit;
    }
}

//Returns correct latex for each f(x)
var fx_latex = () => {
    switch (f_x){
        case 0:
            return "1-\\frac{x^2}{2!}+\\frac{x^4}{4!}";
        case 1:
            return "x-\\frac{x^3}{3!}+\\frac{x^5}{5!}";
        case 2:
            return "\\frac{x-\\frac{x^2}{2}+\\frac{x^3}{3}-\\frac{x^4}{4}+\\frac{x^5}{5}}{\\ln(10)}";
        case 3:
            return "1+x+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\frac{x^4}{4!}+\\frac{x^5}{5!}";
    }
}

var getPublicationMultiplier = (tau) => tau.isZero ? BigNumber.ONE : tau.pow(0.78);
var getPublicationMultiplierFormula = (symbol) => symbol + "^{0.78}";
var getTau = () => currency.value.pow(BigNumber.from(0.1));
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(10), currency.symbol];
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getT = (level) => BigNumber.from(0.2 + level * 0.2);
var getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getQ2 = (level) => BigNumber.TWO.pow(level);
var getK = (level) => BigNumber.from(level);
var getM = (level) => BigNumber.from(1.5).pow(level);
var getN = (level) => Utils.getStepwisePowerSum(level, 2, 11,0);

var getQ1Exp = (level) => BigNumber.from(1 + level * 0.15);

init();