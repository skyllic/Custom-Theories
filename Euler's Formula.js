import {CustomCost, ExponentialCost, FreeCost, LinearCost} from "./api/Costs";
import { Localization } from "./api/Localization";
import {BigNumber, parseBigNumber} from "./api/BigNumber";
import {QuaternaryEntry, theory} from "./api/Theory";
import {log, Utils} from "./api/Utils";
import {GraphQuality} from "./api/Settings";
import {ui} from "./api/ui/UI";

var id = "eulers_formula";
var name = "Euler's Formula";
var description = "You're a student hired by a professor at a famous university. Since your works have been successful in the past, and have received a lot of attention from your colleagues, you decide to go into a subject not yet covered by your old professor, which has  interested you since day 1 of deciding to study mathematics - Complex Numbers. \n" +
    "You hope that with your research into this subject, you can finally get your breakthrough you always wanted in the scientific world.\n" +
    "\n" +
    "This theory explores the world of complex numbers, their arrangement and proves that i is an integral part of mathematics, on which basic math is functioning on. The theory, named after famous mathematician Leonhard Euler and first stated by Roger Cotes in 1714, explores the relationship between exponential functions and trigonometric functions.\n" +
    "Your task is to use this formula, and with the help of the pythagorean theorem, calculate the distances of cos(t) and isin(t) from the origin, and grow them as large as possible using many different methods and even modifying the formula using multipliers of sine and cosine!\n" +
    "\n" +
    "Huge thanks to:\n" +
    "\n" +
    "- Gilles-Philippe, for implementing integral features we proposed, helping us a *ton* during development, answering our questions and giving us beta features to use in our theories! \n" +
    "\n" +
    "- XLII, for helping us a TON during balancing, deciding various integral features of the theory such as but not limited to: milestone placement, milestone costs, publish multipliers and a lot more!\n" +
    "\n" +
    "- The entire discord community, who've playtested this theory and reported many bugs, especially those active at #custom-theories-dev\n" +
    "\n" +
    "and of course a personal thanks from peanut to:\n" +
    "\n" +
    "- Snaeky, without whom this theory would not have been possible as he was the one with the original idea of structuring a theory around Euler's Formula, and always answering my questions and motivating all of us to push this theory forwards.\n" +
    "\n" +
    "We hope you enjoy playing this theory as much as we had developing it and coming up with ideas for it!\n" +
    "\n" +
    "- The Eulers-Formula-CT Development Team"

var authors = "Snaeky (SnaekySnacks#1161) - Idea, General Structuring\n" +
    "peanut (peanut#6368) - Developer"

var version = "beta-28042022\\_3";

// init variables
var currency, currency_R, currency_I;
var quaternaryEntries;

// upgrade variables
var q1, q2;
var a1, a2, a3;
var b1, b2;
var c1, c2;
var q = BigNumber.ONE;
var nuclearOption, nBool;

// milestone variables
var a_base, a_exp, a_term;
var dimension;

// graph variables
var scale;
var R = BigNumber.ZERO;
var I = BigNumber.ZERO;
var t_graph = BigNumber.ZERO;   // distance from origin to current x value
var t_speed;                    // multiplies dt by given value (1 + t_multiplier * dt)
var t = BigNumber.ZERO;         // time elapsed ( -> cos(t), sin(t) etc.)
var max_R, max_I;
var max_currency;

// vector variables
var state = new Vector3(0, 0, 0);
var center = new Vector3(0, 0, 0);
var swizzles = [(v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.y, v.z, v.x), (v) => new Vector3(v.x, v.y, v.z)];

// story variables
var chapter1;

// achievment variables
var achievement1;



var init = () => {
    scale = 0.2;
    currency = theory.createCurrency();
    currency_R = theory.createCurrency("R", "R");
    currency_I = theory.createCurrency("I", "I");

    max_currency = BigNumber.ZERO;
    max_R = BigNumber.ZERO;
    max_I = BigNumber.ZERO;

    quaternaryEntries = [];

    // Regular Upgrades

    // t
    {
        let getDesc = (level) => "\\dot{t}=" + 0.2 * getT(level).toString(0);
        let getInfo = (level) => "\\dot{t}=" + 0.2 * getT(level).toString(0);
        t_speed = theory.createUpgrade(0, currency, new ExponentialCost(1e6, Math.log2(1e6)));
        t_speed.getDescription = (_) => Utils.getMath(getDesc(t_speed.level));
        t_speed.getInfo = (amount) => Utils.getMathTo(getInfo(t_speed.level), getInfo(t_speed.level + amount));
        t_speed.maxLevel = 4;
    }

    // q1
    {
        let getDesc = (level) => "q_1=" + getQ1(level).toString(0);
        let getInfo = (level) => "q_1=" + getQ1(level).toString(0);
        q1 = theory.createUpgrade(1, currency, new FirstFreeCost(new ExponentialCost(10, Math.log2(1.61328))));
        q1.getDescription = (_) => Utils.getMath(getDesc(q1.level));
        q1.getInfo = (amount) => Utils.getMathTo(getDesc(q1.level), getDesc(q1.level + amount));
    }

    // q2
    {
        let getDesc = (level) => "q_2=2^{" + level + "}";
        let getInfo = (level) => "q_2=" + getQ2(level).toString(0);
        q2 = theory.createUpgrade(2, currency, new ExponentialCost(5, Math.log2(60)));
        q2.getDescription = (_) => Utils.getMath(getDesc(q2.level));
        q2.getInfo = (amount) => Utils.getMathTo(getInfo(q2.level), getInfo(q2.level + amount));
    }

    // b1
    {
        let getDesc = (level) => "b_1=" + getB1(level).toString(0);
        let getInfo = (level) => "b_1=" + getB1(level).toString(0);
        b1 = theory.createUpgrade(3, currency_R, new FirstFreeCost(ExponentialCost(20, Math.log2(200))));
        b1.getDescription = (_) => Utils.getMath(getDesc(b1.level));
        b1.getInfo = (amount) => Utils.getMathTo(getDesc(b1.level), getDesc(b1.level + amount));
    }

    // b2
    {
        let getDesc = (level) => "b_2=1.1^{" + level + "}";
        let getInfo = (level) => "b_2=" + getB2(level).toString(2);
        b2 = theory.createUpgrade(4, currency_R, new ExponentialCost(100, Math.log2(2)));
        b2.getDescription = (_) => Utils.getMath(getDesc(b2.level));
        b2.getInfo = (amount) => Utils.getMathTo(getInfo(b2.level), getInfo(b2.level + amount));
    }


    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        let getInfo = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(5, currency_I, new FirstFreeCost(new ExponentialCost(20, Math.log2(200))));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=1.1^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(2);
        c2 = theory.createUpgrade(6, currency_I, new ExponentialCost(100, Math.log2(2)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    // a1
    {
        let getDesc = (level) => "a_1=" + getA1(level).toString(0);
        let getInfo = (level) => "a_1=" + getA1(level).toString(0);
        a1 = theory.createUpgrade(7, currency, new FirstFreeCost(new ExponentialCost(2000, 2.2)));
        a1.getDescription = (_) => Utils.getMath(getDesc(a1.level));
        a1.getInfo = (amount) => Utils.getMathTo(getDesc(a1.level), getDesc(a1.level + amount));
    }

    // a2
    {
        let getDesc = (level) => "a_2=" + getA2(level).toString(0);
        let getInfo = (level) => "a_2=" + getA2(level).toString(0);
        a2 = theory.createUpgrade(8, currency_R, new ExponentialCost(500, 2.2));
        a2.getDescription = (_) => Utils.getMath(getDesc(a2.level));
        a2.getInfo = (amount) => Utils.getMathTo(getInfo(a2.level), getInfo(a2.level + amount));
    }

    // a3
    {
        let getDesc = (level) => "a_3=2^{" + level + "}";
        let getInfo = (level) => "a_3=" + getQ2(level).toString(0);
        a3 = theory.createUpgrade(9, currency_I, new ExponentialCost(500, 2.2));
        a3.getDescription = (_) => Utils.getMath(getDesc(a3.level));
        a3.getInfo = (amount) => Utils.getMathTo(getInfo(a3.level), getInfo(a3.level + amount));
    }


    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e20);

    // t
    {
        nuclearOption = theory.createPermanentUpgrade(3, currency, new FreeCost());
        nuclearOption.getDescription = (_) => "Let theory explode";
        nuclearOption.getInfo = (amount) => "$q_2\\; \\rightarrow \\;q_2^{10}$";
        nuclearOption.boughtOrRefunded = (_) => nBool = !nBool;
    }


    // Milestone Upgrades
    theory.setMilestoneCost(new CustomCost(total => BigNumber.from(total < 5 ? 4*(1+total) : 24 + 8*(total-4))));

    {
        dimension = theory.createMilestoneUpgrade(0, 2);
        dimension.getDescription = () => dimension.level == 0 ? "Unlock the real component R" : "Unlock the imaginary component I";
        dimension.getInfo = () => Localization.getUpgradeAddDimensionDesc();
        dimension.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); theory.invalidateSecondaryEquation(); theory.invalidateTertiaryEquation(); updateAvailability(); }
        dimension.refunded = (_) => {
            if(dimension.level == 1) {
                a_term.level = 0;
                a_exp.level = 0;
                a_base.level = 0;
            }
        }
    }

    {
        a_term = theory.createMilestoneUpgrade(1, 1);
        a_term.getDescription = (_) => Localization.getUpgradeAddTermDesc("a_1");
        a_term.getInfo = (_) => Localization.getUpgradeAddTermInfo("a_1");
        a_term.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
    }

    {
        a_exp = theory.createMilestoneUpgrade(2, 5);
        a_exp.getDescription = (_) => Localization.getUpgradeIncCustomExpDesc("a", "0.1");
        a_exp.getInfo = (_) => Localization.getUpgradeIncCustomExpInfo("a", "0.1");
        a_exp.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
    }

    {
        a_base = theory.createMilestoneUpgrade(3, 2);
        a_base.getDescription = (_) => Localization.getUpgradeAddTermDesc(a_base.level == 0 ? "a_2" : "a_3");
        a_base.getInfo = (_) => Localization.getUpgradeAddTermInfo(a_base.level == 0 ? "a_2" : "a_3");
        a_base.boughtOrRefunded = (_) => { theory.invalidatePrimaryEquation(); updateAvailability(); }
    }

    var achievement_category_1 = theory.createAchievementCategory(0, "Publications");
    var achievement_category_2 = theory.createAchievementCategory(1, "Currencies");

    // Story chapters

    let storyChapter1 = "";
    storyChapter1 += "One of your students comes to you with a problem.\n"
    storyChapter1 += "They say, \"Professor, all the other experts in our field keep saying that this equation can't be used to further our research, \nbut I think I can get something out of it.\"\n\n"
    storyChapter1 += "He hands you the paper with e^ix = cos(x) + i * sin(x).\n"
    storyChapter1 += "You look at him and say,\n";
    storyChapter1 += "This is Eulers Identity, are you sure you can get work out of something that has imaginary numbers?\"\n";
    storyChapter1 += "\"Yes! I believe I can!\"\n\n\n";
    storyChapter1 += "You give them the green light to work on the project.";
    chapter1 = theory.createStoryChapter(0, "Circular Reasoning", storyChapter1, () => q1.level == 0); //unlock story chapter when a1 is purchased

    updateAvailability();
}

// INTERNAL FUNCTIONS
// -------------------------------------------------------------------------------
var updateAvailability = () => {

    a_term.isAvailable = dimension.level > 1;
    a_exp.isAvailable = a_term.level > 0;
    a_base.isAvailable = a_term.level > 0;

    a1.isAvailable = a_term.level > 0;
    a2.isAvailable = a_base.level > 0;
    a3.isAvailable = a_base.level > 1;

    b1.isAvailable = dimension.level > 0;
    b2.isAvailable = dimension.level > 0;
    c1.isAvailable = dimension.level > 1;
    c2.isAvailable = dimension.level > 1;

    currency_R.isAvailable = dimension.level > 0;
    currency_I.isAvailable = dimension.level > 1;
}

var postPublish = () => {
    scale = 0.2;
    max_currency = BigNumber.ZERO;
    t_graph = BigNumber.ZERO;
    t = BigNumber.ZERO;
    q = BigNumber.ONE;
}

var getInternalState = () => `${q} ${t}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) q = parseBigNumber(values[0]);
    if (values.length > 1) t = parseBigNumber(values[1]);
    theory.clearGraph();
    state.x = t_graph.toNumber();
    state.y = R.toNumber();
    state.z = I.toNumber();
}

var checkForScale = () => {
    if(max_R > 1.3 / scale || max_I > 1.3 / scale) { // scale down everytime R or I gets larger than the screen
        t_graph = BigNumber.ZERO;
        theory.clearGraph();
        state.x = t_graph.toNumber();
        state.y = R.toNumber();
        state.z = I.toNumber();
        let old_scale = scale; // save previous scale
        scale = (60 / 100) * old_scale // scale down by 50%
    }
}

var getEquationOverlay = (_) => {
    let result = ui.createLatexLabel({text: version, displacementY: 4, displacementX: 4, fontSize: 9, textColor: Color.TEXT_MEDIUM});
    return result;
}

// TODO: release this when new update comes out
// var get3DGraphTranslation = () => swizzles[0]((new Vector3(-t_graph.toNumber() + 6, 0, 0) - center) * scale);

var tick = (elapsedTime, multiplier) => {
    currency.value = BigNumber.from("1e127");

    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    // q calc
    let vq1 = getQ1(q1.level);
    let vq2 = getQ2(q2.level);
    q += vq1 * vq2.pow(BigNumber.ONE) * dt * bonus;

    let maxT = BigNumber.ZERO;
    // t calc
    if(q1.level != 0) {
        t += ((1 + t_speed.level) / 5) * dt;
    }

    // a calc
    let va1 = getA1(a1.level);
    let va2 = getA2(a2.level);
    let va3 = getA3(a3.level);
    let va_exp = getAExp(a_exp.level);
    let va_base = BigNumber.ONE;
    switch (a_base.level) {
        case 0:
            va_base = va1;
            break;
        case 1:
            va_base = va1 * va2;
            break;
        case 2:
            va_base = va1 * va2 * va3;
    }
    let a = a_term.level == 0 ? BigNumber.ONE : va_base.pow(va_exp);

    // b calc
    let vb1 = getB1(b1.level);
    let vb2 = getB2(b2.level);
    let b = BigNumber.from(vb1 * vb2);

    // c calc
    let vc1 = getC1(c1.level);
    let vc2 = getC2(c2.level);
    let c = BigNumber.from(vc1 * vc2);

    // these R and I values are used for coordinates on the graph
    R = BigNumber.from(b * t.cos()); // b * cos(t) - real part of solution
    I = BigNumber.from(c * t.sin()); // c * i * sin(t) - "imaginary" part of solution
    max_R = max_R.max(R);
    max_I = max_I.max(I);

    let base_currency_multiplier = dt * bonus;

    t_graph += dt / (scale * BigNumber.TEN);

    // CURRENCY CALC
    // this check exists to stop rho from growing when every variable is 0
    // q1 = 0 basically means at start of every pub
    if(q1.level == 0) {
        currency.value = 0;
        currency_I.value = 0;
        currency_R.value = 0;
    } else {

        // rho calculation
        switch (dimension.level) {
            case 0:
                currency.value += 1000000 * base_currency_multiplier * (t * q.pow(BigNumber.TWO)).sqrt();
                break;
            case 1:
                currency.value += 1000000 * base_currency_multiplier * (t * q.pow(BigNumber.TWO) + (currency_R.value).pow(BigNumber.TWO)).sqrt();
                break;
            case 2:
                currency.value += 1000000 * base_currency_multiplier * a * (t * q.pow(BigNumber.TWO) + (currency_R.value).pow(BigNumber.TWO) + (currency_I.value).pow(BigNumber.TWO)).sqrt();
                break;
        }
        max_currency = max_currency.max(currency.value);

        // R calculation
        if(dimension.level > 0) {
            currency_R.value += base_currency_multiplier * (R.abs()).pow(BigNumber.TWO);
        } else {
            currency_R.value = 0;
        }

        // I calculation
        if(dimension.level > 1) {
            currency_I.value += base_currency_multiplier * (I.abs()).pow(BigNumber.TWO);
        } else {
            currency_I.value = 0;
        }
    }

    // graph drawn
    state.x = t_graph.toNumber();
    state.y = R.toNumber();
    state.z = I.toNumber();

    // if graph gets too tall, reset back to 0
    if(t_graph > BigNumber.from(32) / (scale * BigNumber.TEN)) {
        t_graph = BigNumber.ZERO;
        theory.clearGraph();
        state.x = t_graph.toNumber();
        state.y = R.toNumber();
        state.z = I.toNumber();
    }

    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
    theory.invalidateQuaternaryValues();

    // constantly check for scale
    checkForScale();

}
// -------------------------------------------------------------------------------


// EQUATIONS
// -------------------------------------------------------------------------------
var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 80;
    let result = "\\begin{array}{c}\\dot{\\rho} = ";

    // let a draw on equation
    let a_eq_base = "";
    let a_eq_term = "";
    let a_eq_exp = getAExp(a_exp.level).toString(1);
    switch(a_base.level) {
        case 0:
            a_eq_base = "a_1";
            break;
        case 1:
            a_eq_base = "a_1a_2";
            break;
        case 2:
            a_eq_base = "a_1a_2a_3";
            break;
    }

    // if a has been unlocked, show a term
    if(a_term.level > 0) {
        a_eq_term = a_eq_base;
    }
    // if a has an exponent, show exponent only when bigger than lvl 0
    if(a_exp.level > 0) {
        a_eq_term = a_eq_base + "^{\\;" + a_eq_exp + "}\\,";
    }
    // show brackets when exponent is shown and a term is bigger than lvl 0
    if(a_exp.level > 0 && a_base.level > 0) {
        a_eq_term = "(" + a_eq_base + ")" + "^{" + a_eq_exp + "}";
    }

    result += a_eq_term;

    switch(dimension.level) {
        case 0:
            result += "\\sqrt{tq^2}\\\\";
            result += "G(t) = r_x + i_y";
            break;
        case 1:
            result += "\\sqrt{\\text{\\,}tq^2 + R^2\\text{ }}\\\\";
            result += "G(t) = r_x + i_y";
            break;
        case 2:
            result += "\\sqrt{\\text{\\,}tq^2 + R^2 + I^2\\text{ }}\\\\";
            result += "G(t) = r_x + i_y";
            break;
    }

    result += "\\end{array}";
    return result;
}

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 50;
    let result = "\\begin{array}{c}";

    if(nBool) {
        result += "\\text{Nuclear option activated}\\\\"
    }
    switch(dimension.level) {
        case 0:
            result += "r_x = \\cos(t),\\quad i_y = i\\sin(t)\\\\";
            result += "\\dot{q} = q_1q_2";
            break;
        case 1:
            result += "r_x = b_1b_2\\cos(t),\\quad i_y = i\\sin(t)\\\\";
            result += "\\dot{q} = q_1q_2, \\quad\\dot{R} = (r_x)^2";
            break;
        case 2:
            result += "r_x = b_1b_2\\cos(t),\\quad i_y = ic_1c_2\\sin(t)\\\\";
            result += "\\dot{q} = q_1q_2, \\quad\\dot{R} = (r_x)^2, \\quad\\dot{I} = -(i_y)^{2}";
            break;
    }

    result += "\\end{array}"

    return result;
}

var getTertiaryEquation = () => {
    let result = theory.latexSymbol + "=\\max\\rho^{0.4}";
    return result;
}

var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0) {
        quaternaryEntries.push(new QuaternaryEntry("q", null));
        quaternaryEntries.push(new QuaternaryEntry("t", null));
        quaternaryEntries.push(new QuaternaryEntry("r_x", null));
        quaternaryEntries.push(new QuaternaryEntry("i_y", null));
    }

    quaternaryEntries[0].value = q.toString(2);
    quaternaryEntries[1].value = t.toString(2);
    quaternaryEntries[2].value = R.toString(2);
    quaternaryEntries[3].value = I.toString(2) + "i";

    return quaternaryEntries;
}
// -------------------------------------------------------------------------------

var get3DGraphPoint = () => swizzles[0]((state - center) * scale);
var getPublicationMultiplier = (tau) => tau.pow(0.387);
var getPublicationMultiplierFormula = (symbol) => symbol + "^{0.387}";
var isCurrencyVisible = (index) => index == 0 || (index == 1 && dimension.level > 0) || (index == 2 && dimension.level > 1);
var getTau = () => currency.value.pow(BigNumber.from(0.4));

var getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getQ2 = (level) => BigNumber.TWO.pow(level);
var getA1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getA2 = (level) => Utils.getStepwisePowerSum(level, 40, 10, 1);
var getA3 = (level) => BigNumber.TWO.pow(level);
var getAExp = (level) => BigNumber.from(1 + 0.1 * level);
var getB1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getB2 = (level) => BigNumber.from(1.1).pow(level);
var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getC2 = (level) => BigNumber.from(1.1).pow(level);
var getT = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);

init();