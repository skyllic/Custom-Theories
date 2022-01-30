import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";
var id = "axolotl_OuO";
var name = "fission reactor";
var description = "fission reactor(and some other things)(ps:this is not nuclear craft)";
var authors = "a nub ouo (nubest#1001)";
var version = 1.11;
var currency1, currency2, currency3, currency4, currency5, currency6, currency7, currency8, currency9;
var Um ,UD, URU, UR, NpRU, NpR, PuRU, PuR, AmRU, AmR, CmRU, CmR, BkRU, BkR, CfRU, CfR, URT, NpRT, PuRT, AmRT, CmRT, BkRT, CfRT,OPHWR, OMSR;
var UDExp, PHWR, MSR;
quaternaryEntries = [];
var isCurrencyVisible = (index) => index == 8;
var init = () => {
    currency1 = theory.createCurrency("U","U");
    currency2 = theory.createCurrency("Np","Np");
    currency3 = theory.createCurrency("Pu","Pu");
    currency4 = theory.createCurrency("Am","Am");
    currency5 = theory.createCurrency("Cm","Cm");
    currency6 = theory.createCurrency("Bk","Bk");
    currency7 = theory.createCurrency("Cf","Cf");
    currency8 = theory.createCurrency("Es","Es");
    currency9 = theory.createCurrency("P", "P")
    currency1.value = BigNumber.ZERO
    currency2.value = BigNumber.ZERO
    currency3.value = BigNumber.ZERO
    currency4.value = BigNumber.ZERO
    currency5.value = BigNumber.ZERO
    currency6.value = BigNumber.ZERO
    currency7.value = BigNumber.ZERO
    currency8.value = BigNumber.ZERO
    currency9.value = BigNumber.ZERO
    {
        let getDesc = (level) => "(\\text{U}_1)\\text{Uranium Mine level:" + level+ "}"
        let getInfo = (level) => "(\\text{U}_1)\\text{U mine level:}" +getUm(level).toString(0);
        Um = theory.createUpgrade(0, currency9, new FreeCost());
        Um.getDescription = (_) => Utils.getMath(getDesc(Um.level));
        Um.getInfo = (amount) => Utils.getMathTo(getInfo(Um.level), getInfo(Um.level + 1));
    }
    {
        let getDesc = (level) => "(\\text{U}_1)\\text{Uranium mine Drill level:" + level+ "}"
        let getInfo = (level) => "(\\text{U}_2)\\text{Drill power:}" +getUD(level).toString(0);
        UD = theory.createUpgrade(8, currency1, new ExponentialCost(20, Math.log2(5)));
        UD.getDescription = (_) => Utils.getMath(getDesc(UD.level));
        UD.getInfo = (amount) => Utils.getMathTo(getInfo(UD.level), getInfo(UD.level + 1));
    }
    {
        let getDesc = (level) => "(\\text{U}_3)\\text{Uranium Reactor level:" + level+ "}"
        let getInfo = (level) => "(\\text{U}_3)\\text{Reactor power:}" +getUR(level).toString(0);
        UR = theory.createUpgrade(1, currency1, new ExponentialCost(1, Math.log2(1.3)));
        UR.getDescription = (_) => Utils.getMath(getDesc(UR.level));
        UR.getInfo = (amount) => Utils.getMathTo(getInfo(UR.level), getInfo(UR.level + 1));
        UR.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{U}_4)\\text{Uranium fuel purifier power:}2^{" + level + "}";
        let getInfo = (level) => "(\\text{U}_4)\\text{purifier power:}" +getURT(level).toString(0);
        URT = theory.createUpgrade(9, currency2, new ExponentialCost(1, Math.log2(3.4)));
        URT.getDescription = (_) => Utils.getMath(getDesc(URT.level));
        URT.getInfo = (amount) => Utils.getMathTo(getInfo(URT.level), getInfo(URT.level + 1));
        URT.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Np}_1)\\text{Neptunium Reactor level:" + level+ "}"
        let getInfo = (level) => "(\\text{Np}_1)\\text{Reactor power:}" +getNpR(level).toString(0);
        NpR= theory.createUpgrade(2, currency2, new ExponentialCost(1, Math.log2(1.8)));
        NpR.getDescription = (_) => Utils.getMath(getDesc(NpR.level));
        NpR.getInfo = (amount) => Utils.getMathTo(getInfo(NpR.level), getInfo(NpR.level + 1));
        NpR.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Np}_2)\\text{Neptunium fuel purifier power:}2^{" + level + "}";
        let getInfo = (level) => "(\\text{Np}_2)\\text{purifier power:}" + getNpRT(level).toString(0);
        NpRT= theory.createUpgrade(10, currency3, new ExponentialCost(1, Math.log2(4.1)));
        NpRT.getDescription = (_) => Utils.getMath(getDesc(NpRT.level));
        NpRT.getInfo = (amount) => Utils.getMathTo(getInfo(NpRT.level), getInfo(NpRT.level + 1));
        NpRT.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Pu}_1)\\text{Plutonium Reactor level:" + level+ "}"
        let getInfo = (level) => "(\\text{Pu}_1)\\text{Reactor power:}" +getPuR(level).toString(0);
        PuR = theory.createUpgrade(3, currency3, new ExponentialCost(1, Math.log2(1.8)));
        PuR.getDescription = (_) => Utils.getMath(getDesc(PuR.level));
        PuR.getInfo = (amount) => Utils.getMathTo(getInfo(PuR.level), getInfo(PuR.level + 1));
        PuR.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Pu}_2)\\text{Plutonium fuel purifier power:}2^{" + level + "}";
        let getInfo = (level) => "(\\text{Pu}_2)\\text{purifier power:}" + getPuRT(level).toString(0);
        PuRT = theory.createUpgrade(11, currency4, new ExponentialCost(1, Math.log2(5.1)));
        PuRT.getDescription = (_) => Utils.getMath(getDesc(PuRT.level));
        PuRT.getInfo = (amount) => Utils.getMathTo(getInfo(PuRT.level), getInfo(PuRT.level + 1));
        PuRT.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Am}_1)\\text{Americium Reactor level:" + level+ "}"
        let getInfo = (level) => "(\\text{Am}_1)\\text{Reactor power:}" +getAmR(level).toString(0);
        AmR = theory.createUpgrade(4, currency4, new ExponentialCost(1, Math.log2(1.8)));
        AmR.getDescription = (_) => Utils.getMath(getDesc(AmR.level));
        AmR.getInfo = (amount) => Utils.getMathTo(getInfo(AmR.level), getInfo(AmR.level + 1));
        AmR.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Am}_2)\\text{Americium fuel purifier power:}2^{" + level + "}";
        let getInfo = (level) => "(\\text{Am}_2)\\text{purifier power:}" + getAmRT(level).toString(0);
        AmRT = theory.createUpgrade(12, currency5, new ExponentialCost(1, Math.log2(4.1)));
        AmRT.getDescription = (_) => Utils.getMath(getDesc(AmRT.level));
        AmRT.getInfo = (amount) => Utils.getMathTo(getInfo(AmRT.level), getInfo(AmRT.level + 1));
        AmRT.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Cm}_1)\\text{Curium Reactor level:" + level+ "}" 
        let getInfo = (level) => "(\\text{Cm}_1)\\text{Reactor power:}" +getCmR(level).toString(0);
        CmR = theory.createUpgrade(5, currency5, new ExponentialCost(1, Math.log2(1.8)));
        CmR.getDescription = (_) => Utils.getMath(getDesc(CmR.level));
        CmR.getInfo = (amount) => Utils.getMathTo(getInfo(CmR.level), getInfo(CmR.level + 1));
        CmR.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Cm}_2)\\text{Curium fuel purifier power:}2^{" + level + "}";
        let getInfo = (level) => "(\\text{Cm}_2)\\text{purifier power:}" + getCmRT(level).toString(0);
        CmRT = theory.createUpgrade(13, currency6, new ExponentialCost(1, Math.log2(3.1)));
        CmRT.getDescription = (_) => Utils.getMath(getDesc(CmR.level));
        CmRT.getInfo = (amount) => Utils.getMathTo(getInfo(CmR.level), getInfo(CmR.level + 1));
        CmRT.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Bk}_1)\\text{Berkelium Reactor level:" + level+ "}"
        let getInfo = (level) => "(\\text{Bk}_1)\\text{Reactor power:}" +getBkR(level).toString(0);
        BkR = theory.createUpgrade(6, currency6, new ExponentialCost(1, Math.log2(1.8)));
        BkR.getDescription = (_) => Utils.getMath(getDesc(BkR.level));
        BkR.getInfo = (amount) => Utils.getMathTo(getInfo(BkR.level), getInfo(BkR.level + 1));
        BkR.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Bk}_2)\\text{Berkelium fuel purifier power:}2^{" + level + "}";
        let getInfo = (level) => "(\\text{Bk}_2)\\text{purifier power:}" + getBkRT(level).toString(0);
        BkRT = theory.createUpgrade(14, currency7, new ExponentialCost(1, Math.log2(5.1)));
        BkRT.getDescription = (_) => Utils.getMath(getDesc(BkR.level));
        BkRT.getInfo = (amount) => Utils.getMathTo(getInfo(BkR.level), getInfo(BkR.level + 1));
        BkRT.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Cf}_1)\\text{Californium Reactor level:" + level+ "}" 
        let getInfo = (level) => "(\\text{Cf}_1)\\text{Reactor power:}" +getCfR(level).toString(0);
        CfR = theory.createUpgrade(7, currency7, new ExponentialCost(1, Math.log2(1.8)));
        CfR.getDescription = (_) => Utils.getMath(getDesc(CfR.level));
        CfR.getInfo = (amount) => Utils.getMathTo(getInfo(CfR.level), getInfo(CfR.level + 1));
        CfR.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{Cf}_2)\\text{Californium fuel purifier power:}2^{" + level + "}";
        let getInfo = (level) => "(\\text{Cf}_2)\\text{purifier power:}" + getCfRT(level).toString(0);
        CfRT = theory.createUpgrade(15, currency8, new ExponentialCost(1, Math.log2(3.1)));
        CfRT.getDescription = (_) => Utils.getMath(getDesc(CfRT.level));
        CfRT.getInfo = (amount) => Utils.getMathTo(getInfo(CfRT.level), getInfo(CfRT.level + 1));
        CfRT.isAvailable = false;
    }
    {
        let getDesc = (level) => "(\\text{R}_1)\\text{Overall Pressurized heavy-water reactor level:" + level + "}";
        let getInfo = (level) => "(\\text{R}_1)\\text{OPHWR power:}" + getOPHWR(level).toString(0);
        OPHWR = theory.createUpgrade(16, currency8, new ExponentialCost(1e10, Math.log2(10)));
        OPHWR.getDescription = (_) => Utils.getMath(getDesc(OPHWR.level));
        OPHWR.getInfo = (amount) => Utils.getMathTo(getInfo(OPHWR.level), getInfo(OPHWR.level + 1));
        OPHWR.isAvailable = false;
        OPHWR.maxLevel = 10
    }
    {
        let getDesc = (level) => "(\\text{R}_2)\\text{Overall Molten salt reactor upgrade level:" + level + "}";
        let getInfo = (level) => "(\\text{R}_2)\\text{OMSR Upgrade power}:}" + getOMSR(level).toString(0);
        OMSR = theory.createUpgrade(17, currency8, new ExponentialCost(1e20, Math.log2(10)));
        OMSR.getDescription = (_) => Utils.getMath(getDesc(OMSR.level));
        OMSR.getInfo = (amount) => Utils.getMathTo(getInfo(OMSR.level), getInfo(OMSR.level + 1));
        OMSR.isAvailable = false;
        OMSR.maxLevel = 100
    }
    theory.createPublicationUpgrade(0, currency2, 1000);
    theory.createBuyAllUpgrade(1, currency6, 1);
    theory.createAutoBuyerUpgrade(2, currency8, 10);
    {
        URU = theory.createPermanentUpgrade(3, currency1, new LinearCost(1000000, 0));
        URU.maxLevel = 1;
        URU.getDescription = (_) => Localization.getUpgradeUnlockDesc("\\text{Uranium Reactor}");
        URU.getInfo = (_) => Localization.getUpgradeUnlockInfo("\\text{Uranium Reactor}");
        URU.boughtOrRefunded = (_) => updateAvailability()
    }
    {
        NpRU = theory.createPermanentUpgrade(4, currency2, new LinearCost(100000, 0));
        NpRU.maxLevel = 1;
        NpRU.getDescription = (_) => Localization.getUpgradeUnlockDesc("\\text{Neptunium Reactor}");
        NpRU.getInfo = (_) => Localization.getUpgradeUnlockInfo("\\text{Neptunium Reactor}");
        NpRU.boughtOrRefunded = (_) => updateAvailability()
    }
    {
        PuRU = theory.createPermanentUpgrade(5, currency3, new LinearCost(200000, 0));
        PuRU.maxLevel = 1;
        PuRU.getDescription = (_) => Localization.getUpgradeUnlockDesc("\\text{Plutonium Reactor}");
        PuRU.getInfo = (_) => Localization.getUpgradeUnlockInfo("\\text{Plutonium Reactor}");
        PuRU.boughtOrRefunded = (_) => updateAvailability()
    }
    {
        AmRU = theory.createPermanentUpgrade(6, currency4, new LinearCost(400000, 0));
        AmRU.maxLevel = 1;
        AmRU.getDescription = (_) => Localization.getUpgradeUnlockDesc("\\text{Americium Reactor}");
        AmRU.getInfo = (_) => Localization.getUpgradeUnlockInfo("\\text{Americium Reactor}");
        AmRU.boughtOrRefunded = (_) => updateAvailability()
    }
    {
        CmRU = theory.createPermanentUpgrade(7, currency5, new LinearCost(400000, 0));
        CmRU.maxLevel = 1;
        CmRU.getDescription = (_) => Localization.getUpgradeUnlockDesc("\\text{Curium Reactor}");
        CmRU.getInfo = (_) => Localization.getUpgradeUnlockInfo("\\text{Curium Reactor}");
        CmRU.boughtOrRefunded = (_) => updateAvailability()
    }
    {
        BkRU = theory.createPermanentUpgrade(8, currency6, new LinearCost(200000, 0));
        BkRU.maxLevel = 1;
        BkRU.getDescription = (_) => Localization.getUpgradeUnlockDesc("\\text{Berkelium Reactor}");
        BkRU.getInfo = (_) => Localization.getUpgradeUnlockInfo("\\text{Berkelium Reactor}");
        BkRU.boughtOrRefunded = (_) => updateAvailability()
    }
    {
        CfRU = theory.createPermanentUpgrade(9, currency7, new LinearCost(3000000, 0));
        CfRU.maxLevel = 1;
        CfRU.getDescription = (_) => Localization.getUpgradeUnlockDesc("\\text{Californium Reactor}");
        CfRU.getInfo = (_) => Localization.getUpgradeUnlockInfo("\\text{Californium Reactor}");
        CfRU.boughtOrRefunded = (_) => updateAvailability()
    }
    theory.setMilestoneCost(new LinearCost(40, 20));
    {
        UDExp = theory.createMilestoneUpgrade(0, 2);
        UDExp.description = Localization.getUpgradeIncCustomExpDesc("\\text{U}_2", "0.1");
        UDExp.info = Localization.getUpgradeIncCustomExpInfo("\\text{U}_2", "0.1");
    }
    {
        PHWR=theory.createMilestoneUpgrade(1,1)
        PHWR.description = Localization.getUpgradeAddTermDesc("\\text{Pressurized heavy-water reactor}")
        PHWR.info=Localization.getUpgradeAddTermInfo("\\text{Unlock Pressurized heavy-water reactor}")
        PHWR.boughtOrRefunded = (_) => updateAvailability()
        PHWR.canBeRefunded = (_) => MSR.level == 0
    }
    {
        MSR=theory.createMilestoneUpgrade(2,1)
        MSR.description = Localization.getUpgradeAddTermDesc("\\text{Molten salt reactor}")
        MSR.info=Localization.getUpgradeAddTermInfo("\\text{Unlock Molten salt reactor}")
        MSR.boughtOrRefunded = (_) => updateAvailability()
        MSR.isAvailable = false;
    }
    achievement1 = theory.createSecretAchievement(0, "Warm Green Glow", "Unlock Uranium Reactor", "Unlock Uranium Reactor", () => URU.level > 0);
    achievement2 = theory.createSecretAchievement(1, "Sweet Neptune", "Unlock Neptunium Reactor", "Unlock Neptunium Reactor", () => NpRU.level > 0);
    achievement3 = theory.createSecretAchievement(2, "Criticality", "Unlock Plutonium Reactor", "Unlock Plutonium Reactor", () => PuRU.level > 0);
    achievement4 = theory.createSecretAchievement(3, "In Physics We Trust", "Unlock Americium Reactor", "Unlock Americium Reactor", () => AmRU.level > 0);
    achievement5 = theory.createSecretAchievement(4, "Curious Marie", "Unlock Curium Reactor", "Unlock Curium Reactor", () => CmRU.level > 0);
    achievement6 = theory.createSecretAchievement(5, "Made in Alameda", "Unlock Berkelium Reactor", "Unlock Berkelium Reactor", () => BkRU.level > 0);
    achievement7 = theory.createSecretAchievement(6, "California Dreamin'", "Unlock Californium Reactor", "Unlock Californium Reactor", () => CfRU.level > 0);
    achievement8 = theory.createSecretAchievement(7, "E=mc²", "Einstenium amout > 1e10","no", () => currency8.value > BigNumber.from(1e10));
    achievement9 = theory.createSecretAchievement(8, "who on earth will do this", "buy 1 million U_1 level", "professional clicker", () => Um.level>1000000)
    achievement10 = theory.createSecretAchievement(9,"you are half way to make this theory crash", "1b/2.17b", "rip u device", ()=>Um.level>BigNumber.from(1e9))
}
var updateAvailability = () => {
    UR.isAvailable = URU.level > 0;
    NpR.isAvailable = NpRU.level > 0;
    PuR.isAvailable = PuRU.level > 0;
    AmR.isAvailable = AmRU.level > 0;
    CmR.isAvailable = CmRU.level > 0;
    BkR.isAvailable = BkRU.level > 0;
    CfR.isAvailable = CfRU.level > 0;
    URT.isAvailable = URU.level > 0;
    NpRT.isAvailable = NpRU.level > 0;
    PuRT.isAvailable = PuRU.level > 0;
    AmRT.isAvailable = AmRU.level > 0;
    CmRT.isAvailable = CmRU.level > 0;
    BkRT.isAvailable = BkRU.level > 0;
    CfRT.isAvailable = CfRU.level > 0;
    MSR.isAvailable = PHWR.level > 0;
    OPHWR.isAvailable = PHWR.level >0;
    OMSR.isAvailable = MSR.level>0;
}
var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    //decay
    currency1.value += dt*bonus*(getUD(UD.level).pow(getUDExponent(UDExp.level)))*Math.log2(Um.level+1)
    currency2.value += currency1.value*BigNumber.from(1.123141e-12)*30*dt-currency2.value*BigNumber.from(2e-5)*dt*30
    currency3.value += currency1.value*BigNumber.from(4.1341e-10)*30*dt-currency3.value*BigNumber.from(5.5202256e-11)*dt*30
    currency4.value += currency3.value*BigNumber.from(1.231e-12)*30*dt-currency4.value*BigNumber.from(1.36298592e-10)*dt*30
    currency5.value += currency4.value*BigNumber.from(1.266e-12)*30*dt-currency5.value*BigNumber.from(2.83824e-11)*dt*30
    currency6.value += currency5.value*BigNumber.from(5.67648e-12)*30*dt-currency6.value*BigNumber.from(4.351968e-10)*dt*30
    currency7.value += currency1.value*BigNumber.from(1e-11)*30*dt-currency7.value*BigNumber.from(1.538784e-6)*dt*30
    currency8.value += currency7.value*BigNumber.from(1.538784e-4)*Math.log2(bonus+0.1)*dt*3
    currency9.value += ((currency1.value)*dt*0.001+(currency2.value)*dt*10.0+(currency3.value)*dt*62.2+(currency4.value)*dt*317.22+(currency5.value)*dt*315.0+(currency6.value)*dt*10880+(currency7.value)*dt*30000)*(currency8.value+1).pow(1)
    //Uranium
    currency1.value += currency1.value < UR.level ? 0 : UR.level*0.55*dt*30*(Math.log2(bonus))
    currency2.value += currency1.value < UR.level ? 0 : UR.level*0.06*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency3.value += currency1.value < UR.level ? 0 : UR.level*0.02*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency4.value += currency1.value < UR.level ? 0 : UR.level*0.006*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency5.value += currency1.value < UR.level ? 0 : UR.level*0.005*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency6.value += currency1.value < UR.level ? 0 : UR.level*0.00003*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency7.value += currency1.value < UR.level ? 0 : UR.level*0.00001*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency8.value += currency1.value < UR.level ? 0 : UR.level*0.00000002*URT.level*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency9.value += currency1.value < UR.level ? 0 : UR.level*dt*BigNumber.from(2.22517e3)*URT.level*(Math.log2(bonus))*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    //neptunium
    currency1.value += currency2.value < NpR.level ? 0 : NpR.level*0.1*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency2.value += currency2.value < NpR.level ? 0 : NpR.level*0.412*dt*30*(Math.log2(bonus))
    currency3.value += currency2.value < NpR.level ? 0 : NpR.level*0.165*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency4.value += currency2.value < NpR.level ? 0 : NpR.level*0.014*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency5.value += currency2.value < NpR.level ? 0 : NpR.level*0.016*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency6.value += currency2.value < NpR.level ? 0 : NpR.level*0.001*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency7.value += currency2.value < NpR.level ? 0 : NpR.level*0.008*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency8.value += currency2.value < NpR.level ? 0 : NpR.level*0.0001*NpRT.level*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency9.value += currency2.value < NpR.level ? 0 : UR.level*NpR.level*dt*BigNumber.from(2.23124e5)*NpRT.level*(Math.log2(bonus))*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    //plutonium
    currency3.value += currency3.value < PuR.level ? 0 : PuR.level*0.3*dt*30*(Math.log2(bonus))
    currency4.value += currency3.value < PuR.level ? 0 : PuR.level*0.22*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency5.value += currency3.value < PuR.level ? 0 : PuR.level*0.29*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency6.value += currency3.value < PuR.level ? 0 : PuR.level*0.01*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency7.value += currency3.value < PuR.level ? 0 : PuR.level*0.0008*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency8.value += currency3.value < PuR.level ? 0 : PuR.level*0.0003*PuRT.level*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency9.value += currency3.value < PuR.level ? 0 : UR.level*NpR.level*PuR.level*BigNumber.from(2.089e7)*dt*PuRT.level*(Math.log2(bonus))*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    //americium
    currency4.value += currency4.value < AmR.level ? 0 : AmR.level*0.4*dt*30*(Math.log2(bonus))
    currency5.value += currency4.value < AmR.level ? 0 : AmR.level*0.26*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency6.value += currency4.value < AmR.level ? 0 : AmR.level*0.03*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency7.value += currency4.value < AmR.level ? 0 : AmR.level*0.02*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency8.value += currency4.value < AmR.level ? 0 : AmR.level*0.008*AmRT.level*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency9.value += currency4.value < AmR.level ? 0 : UR.level*NpR.level*PuR.level*AmR.level*BigNumber.from(4.42e9)*dt*AmRT.level*(Math.log2(bonus))*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    //curium
    currency5.value += currency5.value < CmR.level ? 0 : CmR.level*0.34*dt*30*(Math.log2(bonus))
    currency6.value += currency5.value < CmR.level ? 0 : CmR.level*0.5*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency7.value += currency5.value < CmR.level ? 0 : CmR.level*0.1*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency8.value += currency5.value < CmR.level ? 0 : CmR.level*0.07*CmRT.level*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency9.value += currency5.value < CmR.level ? 0 : UR.level*NpR.level*PuR.level*AmR.level*CmR.level*BigNumber.from(2.3e11)*dt*CmRT.level*(Math.log2(bonus))*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    //berkelium
    currency6.value += currency6.value < BkR.level ? 0 : BkR.level*0.33*dt*30*(Math.log2(bonus))
    currency7.value += currency6.value < BkR.level ? 0 : BkR.level*0.4*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency8.value += currency6.value < BkR.level ? 0 : BkR.level*0.1*BkRT.level*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency9.value += currency6.value < BkR.level ? 0 : UR.level*NpR.level*PuR.level*AmR.level*CmR.level*BkR.level*BigNumber.from(2e13)*dt*BkRT.level*(Math.log2(bonus))*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    //californium
    currency6.value += currency7.value < CfR.level ? 0 : CfR.level*0.3*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency7.value += currency7.value < CfR.level ? 0 : CfR.level*0.2*dt*30*(Math.log2(bonus))
    currency8.value += currency7.value < CfR.level ? 0 : CfR.level*0.1*CfRT.level*dt*30*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    currency9.value += currency7.value < CfR.level ? 0 : UR.level*NpR.level*PuR.level*AmR.level*CmR.level*BkR.level*CfR.level*BigNumber.from(5e15)*dt*CfRT.level*(Math.log2(bonus))*(1+(OPHWR.level/10))*(1+(OMSR.level/10))
    //tweaks decay
    currency1.value += -currency1.value*BigNumber.from(4.1341e-10)*dt*30
    currency1.value += currency1.value < UR.level ? 0 : -UR.level*dt*URT.level;
    currency2.value += currency2.value < NpR.level ? 0 : -NpR.level*dt*NpRT.level;
    currency3.value += currency3.value < PuR.level ? 0 : -PuR.level*dt*PuRT.level;
    currency4.value += currency4.value < AmR.level ? 0 : -AmR.level*dt*AmRT.level;
    currency5.value += currency5.value < CmR.level ? 0 : -CmR.level*dt*CmRT.level;
    currency6.value += currency6.value < BkR.level ? 0 : -BkR.level*dt*BkRT.level;
    currency7.value += currency7.value < CfR.level ? 0 : -CfR.level*dt*CfRT.level;
    theory.invalidateQuaternaryValues();
}
var postPublish = () => {
    currency1.value = BigNumber.ZERO;
    currency2.value = BigNumber.ZERO;
    currency3.value = BigNumber.ZERO;
    currency4.value = BigNumber.ZERO;
    currency5.value = BigNumber.ZERO;
    currency6.value = BigNumber.ZERO;
    currency7.value = BigNumber.ZERO;
    currency8.value = BigNumber.ZERO;
    currency9.value = BigNumber.ZERO;
}
var getPrimaryEquation = () => {
    let result = "P = \\sum DE_s + \\sum RE_s"
    return result;
}
var getSecondaryEquation = () => theory.latexSymbol + "=\\max P"
var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0)
    {
        quaternaryEntries.push(new QuaternaryEntry("U", null));
        quaternaryEntries.push(new QuaternaryEntry("Np", null));
        quaternaryEntries.push(new QuaternaryEntry("Pu", null));
        quaternaryEntries.push(new QuaternaryEntry("Am", null));
        quaternaryEntries.push(new QuaternaryEntry("Cm", null));
        quaternaryEntries.push(new QuaternaryEntry("Bk", null));
        quaternaryEntries.push(new QuaternaryEntry("Cf", null));
        quaternaryEntries.push(new QuaternaryEntry("Es", null));
    }
    quaternaryEntries[0].value=currency1.value
    quaternaryEntries[1].value=currency2.value
    quaternaryEntries[2].value=currency3.value
    quaternaryEntries[3].value=currency4.value
    quaternaryEntries[4].value=currency5.value
    quaternaryEntries[5].value=currency6.value
    quaternaryEntries[6].value=currency7.value
    quaternaryEntries[7].value=currency8.value
    return quaternaryEntries
}
var getPublicationMultiplier = (tau) => tau.pow(0.2);
var getPublicationMultiplierFormula = (symbol) => symbol+"^{0.2}";
var getTau = () => currency9.value.pow(1)
var get2DGraphValue = () => currency9.value.sign * (BigNumber.ONE + currency9.value.abs()).log10().toNumber();
var getUm = (level) => Utils.getStepwisePowerSum(level, 1.0000000001, 10, 0);
var getUR = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getNpR = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getPuR = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getAmR = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getCmR = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getBkR = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getCfR = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getOPHWR = (level) => Utils.getStepwisePowerSum(level,1.00000001,10,0)
var getOMSR = (level) => Utils.getStepwisePowerSum(level,1.00000001,10,0)
var getUD = (level) => BigNumber.TWO.pow(level);
var getURT = (level) => BigNumber.TWO.pow(level);
var getNpRT = (level) => BigNumber.TWO.pow(level);
var getPuRT = (level) => BigNumber.TWO.pow(level);
var getAmRT = (level) => BigNumber.TWO.pow(level);
var getCmRT = (level) => BigNumber.TWO.pow(level);
var getBkRT = (level) => BigNumber.TWO.pow(level);
var getCfRT = (level) => BigNumber.TWO.pow(level);
var getUDExponent = (level) => BigNumber.from(1 + 0.11 * level)
init();