import { ExponentialCost, FirstFreeCost } from "../api/Costs";
import { Localization } from "../api/Localization";
import { parseBigNumber, BigNumber } from "../api/BigNumber";
import { theory } from "../api/Theory";
import { Utils } from "../api/Utils";

var id = "probability distributions"
var name = "Normal Distribution";
var description = "A custom theory based on the normal probability distribution.";
var authors = "Playspout";
var version = 1;

var q = BigNumber.ONE;

var m1, m2, s1, s2, c3;
var m = BigNumber.ONE;
var s = BigNumber.ONE;
var sdot, mdot, rhodot;
var q1Exp, c3Term, c3Exp;
var t=0; 
var displayTime=0;

var init = () => {
    currency = theory.createCurrency();
    
   
    
    

    ///////////////////
    // Regular Upgrades

    // mu 1
    {
        let getDesc = (level) => "\\mu_1=" + getM1(level).toString(0);
        let getInfo = (level) => "\\mu_1=" + getM1(level).toString(0);
        m1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(10, Math.log2(10**0.2))));
        m1.getDescription = (amount) => Utils.getMath(getDesc(m1.level));
        m1.getInfo = (amount) => Utils.getMathTo(getInfo(m1.level), getInfo(m1.level + amount));
    }

    // mu 2
    {
        let getDesc = (level) => "\\mu_2=2^{" + level + "}";
        let getInfo = (level) => "\\mu_2=" + getM2(level).toString(0);
        m2 = theory.createUpgrade(1, currency, new ExponentialCost(15, Math.log2(10)));
        m2.getDescription = (amount) => Utils.getMath(getDesc(m2.level));
        m2.getInfo = (amount) => Utils.getMathTo(getInfo(m2.level), getInfo(m2.level + amount));
    }

   // sigma 1
    {
        let getDesc = (level) => "\\sigma_1=" + getS1(level).toString(0);
        let getInfo = (level) => "\\sigma_1=" + getS1(level).toString(0);
        s1 = theory.createUpgrade(2, currency, new FirstFreeCost(new ExponentialCost(10, Math.log2(10**0.2))));
        s1.getDescription = (amount) => Utils.getMath(getDesc(s1.level));
        s1.getInfo = (amount) => Utils.getMathTo(getInfo(s1.level), getInfo(s1.level + amount));
    }

    // sigma 2
    {
        let getDesc = (level) => "\\sigma_2=16^{" + level + "}";
        let getInfo = (level) => "\\sigma_2=" + getS2(level).toString(0);
        s2 = theory.createUpgrade(3, currency, new ExponentialCost(15, Math.log2(10000)));
        s2.getDescription = (amount) => Utils.getMath(getDesc(s2.level));
        s2.getInfo = (amount) => Utils.getMathTo(getInfo(s2.level), getInfo(s2.level + amount));
    }

    // c3
    {
        let getDesc = (level) => "c_3=2^{" + level + "}";
        let getInfo = (level) => "c_3=" + getC3(level).toString(0);
        c3 = theory.createUpgrade(4, currency, new ExponentialCost(1e3, Math.log2(8.85507e7)));
        c3.getDescription = (amount) => Utils.getMath(getDesc(c3.level));
        c3.getInfo = (amount) => Utils.getMathTo(getInfo(c3.level), getInfo(c3.level + amount));
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e7);
    theory.createBuyAllUpgrade(1, currency, 1e10);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));

    {
        q1Exp = theory.createMilestoneUpgrade(0, 3);
        q1Exp.description = Localization.getUpgradeIncCustomExpDesc("q_1", "0.05");
        q1Exp.info = Localization.getUpgradeIncCustomExpInfo("q_1", "0.05");
        q1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        c3Term = theory.createMilestoneUpgrade(1, 1);
        c3Term.description = Localization.getUpgradeAddTermDesc("c_3");
        c3Term.info = Localization.getUpgradeAddTermInfo("c_3");
        c3Term.canBeRefunded = (amount) => c3Exp.level == 0;
        c3Term.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
    }

    {
        c3Exp = theory.createMilestoneUpgrade(2, 2);
        c3Exp.description = Localization.getUpgradeIncCustomExpDesc("c_3", "0.05");
        c3Exp.info = Localization.getUpgradeIncCustomExpInfo("c_3", "0.05");
        c3Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    updateAvailability();
}

var updateAvailability = () => {
    c3.isAvailable = c3Term.level > 0;
    c3Exp.isAvailable = c3Term.level > 0;
}

var tick = (elapsedTime, multiplier) => {
    
    let dt = BigNumber.from(elapsedTime);
    let bonus = theory.publicationMultiplier;

    m += (getM1(m1.level) * getM2(m2.level)) * dt;
    s += getS1(s1.level) * getS2(s2.level) * dt;


    let normal = gaussianRand(m,s);

    
    currency.value += bonus * dt * (normal + s);
    
    



    t += 0.1;
    
    
    



    theory.invalidateTertiaryEquation();
}

var getInternalState = () => `${q}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) q = parseBigNumber(values[0]);
}

var postPublish = () => {
    q = BigNumber.ONE;
}

var getPrimaryEquation = () => {
    let result = "\\begin{matrix}";

    result += "\\dot{\\rho}=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}\\\\";
    result += "\\dot{\\mu} = \\mu_1\\mu_2, \\;\\; \\dot{\\sigma} = \\sigma_1\\sigma_2"
  
    result += "\\end{matrix}";

    theory.primaryEquationHeight = 100;

    return result;
}

var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho";
var getTertiaryEquation = () => "\\mu =" + m.toString() +
"\\;\\;\\;\\;\\sigma =" + s.toString() + "\\;\\;\\;\\;t=" + Math.floor(t).toString();


var getPublicationMultiplier = (tau) => tau.pow(0.159);
var getPublicationMultiplierFormula = (symbol) => "{" + symbol + "}^{0.159}";
var getTau = () => currency.value;
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getM1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getM2 = (level) => BigNumber.TWO.pow(level);
var getS1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getS2 = (level) => BigNumber.from("16").pow(level);
var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getC2 = (level) => BigNumber.TWO.pow(level);
var getC3 = (level) => BigNumber.TWO.pow(level);
var getQ1Exp = (level) => BigNumber.from(1 + level * 0.05);
var getC3Exp = (level) => BigNumber.from(1 + level * 0.05);

//Uses the Central Limit Theorem to generate an approximate N~(mu, sigma) random variable.
function gaussianRand(mu, sigma) {
  var rand = 0;

  for (var i = 0; i < 108; i += 1) {
    rand += Math.random();
  }

  //Scale Irwin-Hall distribution to a N~(mu, sigma) distribution.
  rand = rand - (108/2);
  rand = rand * Math.sqrt(12 / 108) * sigma;
  rand = rand + mu;


  return rand;
}
init();