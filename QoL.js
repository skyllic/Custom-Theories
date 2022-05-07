var id = "eaux_qol2";
var name = "QoL2 Theory";
var description = "A custom theory for finer main theory auto-purchase controls and heuristic-based star/student reallocation";
var authors = "Eaux Tacous#1021";
var version = 20;
var permissions = Permissions.PERFORM_GAME_ACTIONS

var autoBuyPopups, publicationRatioPopups, autoFreqPopup;
var autoBuyModes, publicationRatios, autoFreq;
var useR9, useAutobuy;
var aTheoryId;
var debug;
const MIN_FREQ = 10;
var init = () => {

    genTables();

    setupTheory();

    setInternalState("");

    theory.createCurrency(); // required for graph activation
}

var get2DGraphValue = () => {
    if (aTheoryId < 0) return 0;
    const aTheory = game.activeTheory;
    return (aTheory.nextPublicationMultiplier/aTheory.publicationMultiplier).log().toNumber();
}
var getPrimaryEquation = () => {
    if (aTheoryId < 0) return "Invalid";
    const aTheory = game.activeTheory;
    return (aTheory.nextPublicationMultiplier/aTheory.publicationMultiplier).toString();
}

var getCurrencyBarDelegate = () => {
    let reStar = ui.createButton({
        text: "Reallocate ★",
        onClicked: () => simpleStar()
    });
    let reSigma = ui.createButton({
        text: "Reallocate σ",
        onClicked: () => simpleStudent()
    });

    let r9toggle = ui.createStackLayout({
        children: [
            ui.createLabel({
                text: "Buy R9?",
                fontSize: 10,
                verticalTextAlignment: TextAlignment.END,
                horizontalTextAlignment: TextAlignment.CENTER,
                textColor: () => {return useR9 ? Color.TEXT : Color.DEACTIVATED_UPGRADE}
            }),
            ui.createSwitch({
                onColor: Color.SWITCH_BACKGROUND,
                isToggled: () => useR9,
                onTouched: (e) => {if (e.type == TouchType.PRESSED) useR9 = !useR9}
            })
        ]
    })

    reStar.row = 0;
    reStar.column = 0;
    reSigma.row = 0;
    reSigma.column = 1;
    r9toggle.row = 0;
    r9toggle.column = 2;

    const autoGrid = ui.createGrid({
        columnDefinitions: ["1*", "1*", "50"],
        children: [reStar, reSigma, r9toggle]
    });

    let autoFreqButton = ui.createButton({
        text: () => {
            const f = (autoFreq < MIN_FREQ) ? "Never" : autoFreq.toString() + " ticks";
            return "Auto-reallocation frequency: " + f
        },
        onClicked: () => showAutoFreqPopup()
    });

    const pubRatio = ui.createButton({
        text: () => {
            if (aTheoryId < 0) return "Error: Invalid Theory";
            const s = (publicationRatios[aTheoryId] > 1) ? publicationRatios[aTheoryId].toString() : "auto"
            return "Publication Ratio:\ " + s;
        },
        onClicked: () => {
            if (aTheoryId >= 0) showPubRatioPopup(aTheoryId);
        },
        isVisible: () => aTheoryId >= 0
    });


    let theoryButton = ui.createButton({
        text: "Theory Autobuy Menu",
        onClicked: () => {
            if (aTheoryId >= 0) showAutoBuyPopup(aTheoryId);
        },
        isVisible: () => aTheoryId >= 0
    });
    let theoryToggle = ui.createStackLayout({
        children: [
            ui.createLabel({
                text: "Use Autobuy?",
                fontSize: 10,
                verticalTextAlignment: TextAlignment.END,
                horizontalTextAlignment: TextAlignment.CENTER,
                textColor: () => aTheoryId >= 0 && useAutobuy[aTheoryId] ? Color.TEXT : Color.DEACTIVATED_UPGRADE 
            }),
            ui.createSwitch({
                onColor: Color.SWITCH_BACKGROUND,
                isToggled: () => aTheoryId >= 0 ? false || useAutobuy[aTheoryId] : false,
                onTouched: (e) => {if (e.type == TouchType.PRESSED && aTheoryId >= 0) {
                    useAutobuy[aTheoryId] = !useAutobuy[aTheoryId];
                    setupToggles();
                }}
            })
        ],
        isVisible: () => aTheoryId >= 0
    })

    theoryButton.row = 0;
    theoryButton.column = 0;
    theoryToggle.row = 0;
    theoryToggle.column = 1;
    const theoryGrid = ui.createGrid({
        columnDefinitions: ["1*", "50"],
        children: [theoryButton, theoryToggle]
    });

    const debugLabel = ui.createLabel({
        text: "DEBUG ON",
        isVisible: () => debug
    });

    const stack = ui.createStackLayout({
        children: [
            autoGrid, autoFreqButton, pubRatio, theoryGrid, debugLabel
        ]
    });
    return stack;
}

// Callbacks, toggle setups
var setupTheory, setupToggles;
{
    game.activeTheoryChanged = () => {
        setupTheory();
    }

    setupTheory = () => {
        updateATheory();
        setupToggles();
    }

    setupToggles = () => {
        if (aTheoryId >= 0 && useAutobuy[aTheoryId]) game.activeTheory.isAutoBuyerActive = false;
    }

    const updateATheory = () => {
        const aTheory = game.activeTheory;
        if (aTheory == null || aTheory.id == 8) {
            aTheoryId = -1;
        } else {
            aTheoryId = aTheory.id;
        }
    }
}

// Star utility

var simpleStar;
{
    const nextDouble = (level) => {
        if (level >= 24000) return 400 - (level % 400);
        if (level >= 10000) return 200 - (level % 200);
        if (level >= 6000) return 100 - (level % 100);
        if (level >= 1500) return 50 - (level % 50);
        if (level >= 10) return 25 - (level % 25);
        return 10 - level;
    }

    const lastDouble = (level) => {
        if (level >= 24000) return level % 400;
        if (level >= 10000) return level % 200;
        if (level >= 6000) return level % 100;
        if (level >= 1500) return level % 50;
        if (level >= 25) return level % 25;
        if (level >= 10) return level - 10;
        return level;
    }

    simpleStar = () => {

        const starUps = Array.from(game.starBonuses).filter(x => x.id >= 4000 && x.id < 5000 && x.isAvailable);
        const variables = Array.from(game.variables).filter(x => x.id > 0 && x.isAvailable);

        starUps.forEach(x => x.refund(-1));

        const len = Math.min(starUps.length, variables.length);

        let doubleUps = new Set(Array(len).keys());
        let singleUps = new Set();

        const dThreshold = 0.00001; // 0.001%
        const sThreshold = dThreshold / 100;
        const trivialStars = 0.001 * game.starsTotal;
        const MAX_ITER = 100;

        for (let k = 0; k < MAX_ITER; k++) {

            let toMove = [];
            let toDelete = [];

            let best = null;
            let best2 = null;

            for (const i of doubleUps) {

                const up = starUps[i];

                up.buy(-1);
                const maxLevels = up.level;
                up.refund(-1);

                const doubleLevels = nextDouble(variables[i].level);

                if (maxLevels < doubleLevels) {
                    toMove.push(i);
                    continue;
                }

                const dumpLevels = maxLevels - lastDouble(variables[i].level + maxLevels);

                let cost = up.currency.value;
                up.buy(dumpLevels);
                cost -= up.currency.value;
                let dx = game.x;
                up.refund(dumpLevels);
                dx -= game.x;

                if (dx < dThreshold * game.x) {
                    toDelete.push(i);
                    continue;
                }

                if (best == null || best.dx * cost < dx * best.cost) {
                    best2 = best;
                    best = {
                        isDouble: true,
                        i: i,
                        dx: dx,
                        cost: cost,
                        cnt: dumpLevels
                    };
                } else if (best2 == null || best2.dx * cost < dx * best2.cost) {
                    best2 = {
                        isDouble: true,
                        i: i,
                        dx: dx,
                        cost: cost,
                        cnt: dumpLevels
                    };
                }

            }

            toMove.forEach(i => {doubleUps.delete(i); singleUps.add(i);});
            toDelete.forEach(i => {doubleUps.delete(i);});
            toDelete = [];

            for (const i of singleUps) {

                const up = starUps[i];
                const cost = up.cost.getCost(up.level);

                if (cost > up.currency.value) {
                    toDelete.push(i);
                    continue;
                }

                up.buy(1);
                let dx = game.x;
                up.refund(1);
                dx -= game.x;

                if (dx < sThreshold * game.x) {
                    toDelete.push(i);
                    continue;
                }

                if (best == null || best.dx * cost < dx * best.cost) {
                    best2 = best;
                    best = {
                        isDouble: false,
                        i: i,
                        dx: dx,
                        cost: cost,
                        cnt: 1
                    };
                } else if (best2 == null || best2.dx * cost < dx * best2.cost) {
                    best2 = {
                        isDouble: false,
                        i: i,
                        dx: dx,
                        cost: cost,
                        cnt: 1
                    };
                }

            }

            toDelete.forEach(i => {singleUps.delete(i);});

            if (best == null) break;

            if (best.isDouble) {
                starUps[best.i].buy(best.cnt);
                doubleUps.delete(best.i);
                singleUps.add(best.i);
            } else if (best2 == null) {
                starUps[best.i].buy(-1);
                singleUps.delete(best.i);
            } else {
                const bestup = starUps[best.i];
                let cost = best.cost;
                let dx = best.dx;
                for (let i = 0; i < MAX_ITER; i++) {
                    bestup.buy(1);

                    cost = bestup.cost.getCost(bestup.level);
                    if (cost > bestup.currency.value) break;
                    // mitigate edge cases where we have a cheap variable competing with an expensive one.
                    if (cost < trivialStars) continue;

                    bestup.buy(1);
                    dx = game.x;
                    bestup.refund(1);
                    dx -= game.x;

                    if (best2.dx * cost > dx * best2.cost) break;
                }
            }

        }

    }
}


// Student utility

var simpleStudent;
{

    const MAX_DFS_SIZE = 1000;

    const researchCost = curLevel => Math.floor(curLevel/2 + 1);

    const maxPurchaseCount = (curLevel, sigma) => {
        let levels = 0;

        if (researchCost(curLevel) > sigma) return levels;

        if (curLevel % 2 == 1) {
            sigma -= researchCost(curLevel);
            curLevel += 1;
            levels += 1;
        }

        curLevel += 1;
        const bulks = Math.floor((-curLevel + Math.sqrt(curLevel*curLevel + 4*sigma)) / 2);

        sigma -= bulks*(curLevel + bulks);
        curLevel += 2 * bulks - 1;
        levels += 2 * bulks;

        if (researchCost(curLevel) <= sigma) {
            // sigma -= researchCost(curLevel);
            // curLevel += 1;
            levels += 1;
        }

        return levels;

    }

    const debugSimpleStudentSnapshot = () => {

        let output = {}
        output.sigma = game.sigma.toNumber();
        output.useR9 = useR9;
        Array.from(game.researchUpgrades).forEach(x => {output[x.id] = x.level;});
        return JSON.stringify(output);

    }

    const debugSimpleStudentPopup = (debugTexts) => {
        const output = debugTexts.join("\n");
        const popup = ui.createPopup({
            title: "STUDENT ERROR",
            content: ui.createStackLayout({
                children: [
                    ui.createLabel({text:output}),
                    ui.createEntry({placeholder:output})
                ]
            })
        })
        popup.show();
    }

    simpleStudent = () => {

        // number of purchases to backtrack and brute force; 4 if gradf < ee30k, 10 otherwise
        // const REFUND_CNT = game.statistics.graduationF < BigNumber.fromComponents(1, 2, 29994) ? 4 : 10;

        var debugTexts = [];

        if (debug) debugTexts.push(debugSimpleStudentSnapshot());

        const upgrades = Array.from(game.researchUpgrades).filter(x => x.id <= 101 && x.isAvailable);
        upgrades.forEach(x => x.refund(-1));

        if (debug) debugTexts.push(debugSimpleStudentSnapshot());

        if (useR9) game.researchUpgrades[8].buy(-1);
        else game.researchUpgrades[8].refund(-1);

        if (debug) debugTexts.push(debugSimpleStudentSnapshot());

        const maxLevels = upgrades.map(x => x.maxLevel);
        const expIndex = upgrades.length - 1;
        let levels = upgrades.map(x => x.level);

        let sigma = game.sigma.toNumber();

        let curSum = BigNumber.ZERO;
        let history = [];

        // edit in case of emergency
        const vals = [
            (game.dt * game.acceleration * (game.isRewardActive ? 1.5 : 1)).log(),
            (1 + game.t).log() * 0.7,
            (1 + game.starsTotal).log(),
            (1 + game.db).log() / (100 * (10 + game.db).log10()).sqrt(),
            (1 + game.dmu).log() / 1300,
            (1 + game.dpsi).log() / 255 * (10 + game.dpsi).log10().sqrt()
        ].map(v => v.toNumber());

        if (debug) debugTexts.push(`vals: [${vals.toString()}]`);
        if (debug) debugTexts.push(`pass0(${sigma}): [${levels.toString()}]`);

        while (true) {

            let cand = null;
            let cval = BigNumber.ZERO;

            for (let i = 0; i < upgrades.length; i++) {

                if (levels[i] >= maxLevels[i]) continue;

                const cost = (i == expIndex) ? 2 : researchCost(levels[i]);
                const curval = (i == expIndex) ? curSum/20 : vals[i]/cost;

                if (curval > cval) {
                    cand = (cost <= sigma) ? i : null; // flag if best is unreachable.
                    cval = curval;
                }
            }

            if (cand == null) break;

            history.push(cand);
            if (cand == expIndex) {
                sigma -= 2;
            } else {
                curSum += vals[cand];
                sigma -= researchCost(levels[cand]);
            }
            levels[cand] += 1;
        }

        if (debug) debugTexts.push(`pass1(${sigma}): [${levels.toString()}]`);

        while (history.length > 0) {
            let pool = 1;

            for (let i = 0; i < upgrades.length; i++) {
                if (levels[i] >= maxLevels[i]) continue;
                const more = (i == expIndex) ? Math.floor(sigma / 2) : maxPurchaseCount(levels[i], sigma);
                pool *= Math.min(more, maxLevels[i] - levels[i]);
            }

            if (pool > MAX_DFS_SIZE) break;

            const lastbest = history.pop();

            if (lastbest == expIndex) {
                levels[lastbest] -= 1;
                sigma += 2;
            } else {
                const lastlevel = levels[lastbest] - 1;
                const lastcost = researchCost(lastlevel);
                levels[lastbest] -= 1;
                sigma += lastcost;
                curSum -= vals[lastbest];
            }
        }

        if (debug) debugTexts.push(`pass2(${sigma}): [${levels.toString()}]`);

        let search = (i, sigma, curSum) => { // TODO un-reuse variables
            if (i == expIndex) {
                const cnt = Math.min(levels[i] + sigma/2 >> 0, 6);
                return {cnt: [cnt], maxSum: curSum * (1 + cnt / 10)};
            }
            let maxres = null;
            for (let j = levels[i]; j <= maxLevels[i]; j++) {
                let res = search(i+1, sigma, curSum);
                if (maxres == null || res.maxSum >= maxres.maxSum) {
                    maxres = res;
                    maxres.cnt.push(j);
                }
                sigma -= researchCost(j);
                if (sigma < 0) break;
                curSum += vals[i];
            }
            return maxres;
        }

        const found = search(0, sigma, curSum);
        for (let i = 0; i <= expIndex; i++)
            upgrades[i].buy(found.cnt[expIndex - i]);

        if (debug) debugTexts.push(debugSimpleStudentSnapshot());

        if (debug && game.researchUpgrades[8].level != (useR9 ? 3 : 0)) {
            debugSimpleStudentPopup(debugTexts);
        }
    }
}

// Tick actions

var theoryHandler;
{
    const publishHandler = (aTheory) => {
        if (aTheory.nextPublicationMultiplier >= publicationRatios[aTheory.id] * aTheory.publicationMultiplier) {
            aTheory.publish();
        }
    }

    const theoryBuyHandler = (aTheory) => {
        let bought = false;
        var ct = -1;
        lastrho = (aTheory.upgrades[0]).currency.value
        for (const upgrade of aTheory.upgrades) {
            ct++;
         //   if (!upgrade.isAvailable) continue;
            const config = autoBuyModes[aTheory.id][upgrade.id];
            if (buyCheck(upgrade, ct, lastrho) && (upgrade.isAvailable)) {
                if (!bought) bought = true;
                buyProcess(upgrade, ct);
            }
           // ct++;
        }
        return bought;
    }

    theoryHandler = (elapsedTime) => {
        if (aTheoryId < 0) return;

        const aTheory = game.activeTheory;

        if (publicationRatios[aTheory.id] > 1) {
            publishHandler(aTheory);
        }

        if (useAutobuy[aTheoryId]) {
            theoryBuyHandler(aTheory);
        }
    }
}

var tick = (elapsedTime, multiplier) => {

    theoryHandler(elapsedTime);

    if (autoFreq >= MIN_FREQ && game.statistics.tickCount % autoFreq == 0) {
        simpleStar();
        simpleStudent();
    }

    theory.invalidatePrimaryEquation(); // TODO move this

}

const BUY_MODES = {
    never: 0,
    always: 1,
    tenth: 2,
    free_only: 3,
    custom: 4,

    next: (val) => (val + 1) % 5
}
var buyCheck;
{
    const never = (_) => false;
    const free_only = (upgrade) => upgrade.cost.getCost(upgrade.level) == 0;
    const custom = (upgrade, ratio) => upgrade.currency.value >= upgrade.cost.getCost(upgrade.level) * ratio;
    const always = (upgrade) => custom(upgrade, 1);
    const tenth = (upgrade) => custom(upgrade, 10);
  //  var nextpurchaseid; //qwe
   // const aTheory;
   
    buyCheck = (upgrade, config, lastrho) => {
        const aTheory = game.theories[aTheoryId];
        var varcosts = [];
        var nextpurchase;

        for (const upgrade of aTheory.upgrades) {
            varcosts.push((upgrade.cost.getCost(upgrade.level)))
          //  log(upgrade.cost.getCost(upgrade.level))
            }
        
      const upgrade = aTheory.upgrades[0];
     // log(aTheoryId)
      var big = BigNumber.TEN.pow(1900);
      var currmulti = aTheory.nextPublicationMultiplier/aTheory.publicationMultiplier;
  //    log(currmulti)
    //  log(varcosts.size)
      switch (aTheoryId) {
        case 0:
            var upg = aTheory.upgrades[0];
            var q1c = varcosts[0]
            var q2c = varcosts[1]
            var c3c = varcosts[4]
            var c4c = varcosts[5]
            var rho = upg.currency.value
            
            if ((q1c*18<c4c && q1c*12<q2c && q1c*4.84<rho) || q1c<=0) {
                nextpurchaseid = 0
            //    break
            }
            else if (q2c*1.01<c4c && q2c*1.111111<rho) {
                nextpurchaseid = 1
            //    break
            }
            else if (c3c*5<rho && c3c*22<c4c) {
                nextpurchaseid = 4
              //  break
            }
            else if (1==1) {
                nextpurchaseid = 5
               // break
            }
            Statistics.
            log(rho)
            break;
        case 1:
            //please don't use qol for t2
            var q=1+1; //just some filler
            break;
        case 2:
            if (currmulti<=1) {
                varcosts[0] = big;
                varcosts[1] *= 5;
                varcosts[2] *= 8;
                varcosts[3] = big
                varcosts[4] *= 100
                varcosts[5] = big
                varcosts[6] = big
                varcosts[7] *= 2.5
                varcosts[8] *= 1
                varcosts[9] = big
                varcosts[10] *= 1
                varcosts[11] *= 10
              //  min = BigNumber.TEN.pow(1900)
            
        
            }
            else if (currmulti<=2) {
                varcosts[0] = big;
                varcosts[1] *= 8;
                varcosts[2] *= 8;
                varcosts[3] = big
                varcosts[4] *= 1
                varcosts[5] = big
                varcosts[6] = big
                varcosts[7] *= 8
                varcosts[8] *= 1
                varcosts[9] = big
                varcosts[10] *= 8
                varcosts[11] = big
            }
            else {
                varcosts[0] = big;
                varcosts[1] *= 1;
                varcosts[2] *= 1;
                varcosts[3] = big
                varcosts[4] *= 1
                varcosts[5] = big
                varcosts[6] = big
                varcosts[7] = big
                varcosts[8] *= 1
                varcosts[9] = big
                varcosts[10] = big
                varcosts[11] = big
            }

            varcosts1 = [];
            varcosts2 = [];
            varcosts3 = [];
            ind = 0
            for (const j of varcosts) {
                if (ind%3==0) {
                    varcosts1.push(j)
                }
                else if (ind%3==1){
                    varcosts2.push(j)
                }
                else {
                    varcosts3.push(j)
                }
                ind+=1
            }
            min = BigNumber.TEN.pow(1900)
            ind = 0
            minind = 0
            
            for (const j of varcosts1) {
                
                min = min>j?j:min
                minind = min>j?ind:minind
                ind += 1
            }
            minind = varcosts1.indexOf(min)
            nextpurchaseid1 = minind*3
            min = BigNumber.TEN.pow(1900)
            ind = 0
            minind = 0
            
            for (const j of varcosts2) {
              //  log(j)
                min = min>j?j:min
                minind = min>j?ind:minind
                ind += 1
            }
            minind = varcosts2.indexOf(min)
            nextpurchaseid2 = minind*3+1
            min = BigNumber.TEN.pow(1900)
            ind = 0
            minind = 0
            
            for (const j of varcosts3) {
                min = min>j?j:min
                minind = min>j?ind:minind
                ind += 1
            }
            minind = varcosts3.indexOf(min)
            nextpurchaseid = minind*3+2
          //  log(nextpurchaseid)
            //log(nextpurchaseid2)
            nextpurchaseid1 = nextpurchaseid; //remove rho1 buys
            break;
        case 3:
          //  log(varcosts[4])
            var r = 1+BigNumber.from(currmulti).pow(BigNumber.from(0.7))
            varcosts[0] = (varcosts[0]==0) ? 0:big;
            varcosts[1] = (varcosts[1]==0) ? 0:big;
            varcosts[2] = varcosts[2];
            varcosts[3] = big;
            varcosts[4] = big;
            varcosts[5] = big;
            varcosts[6] = varcosts[6]*10*r;
            varcosts[7] = varcosts[7]*r;
            //log(varcosts[4])
            break;
        case 4:
            upg = aTheory.upgrades[0]
            c1 = upg.level
            rho = upg.currency.value
            //log(c1)
            var C = 0;
            var jlastrho = (aTheory.publicationMultiplier / (game.sigmaTotal/20).pow(3)).pow((1/0.159))
         //   log(jlastrho)
          //  log(game.sigmaTotal)
            if (jlastrho<rho * BigNumber.from(10).pow(30)) {C = 1}
            else {C = BigNumber.from((jlastrho / rho)).pow(0.15)/BigNumber.TEN.pow(30*0.15)}
            varcosts[0] *= 10/1.5
            varcosts[1] *= 1
            varcosts[4] *= 1
            
            varcosts[2] *= 100
            varcosts[3] *= C
           // log(C)
            break;
        case 5:
            if (currmulti<=1.01) {
                varcosts[0] *= 5
                varcosts[1] *= 1
                varcosts[2] *= 1
                varcosts[3] *= 1
                varcosts[4] *= 20
                varcosts[5] *= 2
                varcosts[6] *= big
                varcosts[7] *= big
                varcosts[8] *= 1
                //log(9)
            }
            else {
                varcosts[0] *= 8
                varcosts[1] *= 1
                varcosts[2] *= 1
                varcosts[3] *= 1
                varcosts[4] *= 100
                varcosts[5] *= 10
                varcosts[6] *= big
                varcosts[7] *= big
                varcosts[8] *= 1
            }
         //   log(varcosts[0])
            break;
        case 6:
            varcosts[0] = varcosts[0]*4
            varcosts[1] = big
            varcosts[2] = big //BigNumber.TEN.pow(1900)
            varcosts[3] = varcosts[3]*10//(upgrade.currency.value>varcosts[3]*10) ? varcosts[3]*8:BigNumber.TEN.pow(1900)
            varcosts[4] = varcosts[4]*10//(upgrade.currency.value>varcosts[4]*10) ? varcosts[4]*8:BigNumber.TEN.pow(1900)
            varcosts[5] = varcosts[5]*4
            varcosts[6] = varcosts[6]
            break;
        
        case 7: //no solarswap
            var q1lv = (aTheory.upgrades[0].level)%10
            varcosts[0] = varcosts[0]*(1/0.15) * BigNumber.from(1.8).pow(q1lv/10)
            varcosts[1] = varcosts[1]*1
            varcosts[2] = varcosts[2]*3.4
            varcosts[3] = varcosts[3]*1.25
            varcosts[4] = varcosts[4]*2.5
            break;
       }
        if (aTheoryId!=2 && aTheoryId!=0) {
            var nextpurchaseid1 = 1000;
            var nextpurchaseid2 = 1000;
        }
     //   log(varcosts[4])
        min = BigNumber.TEN.pow(1900)
        ind = 0
        minind = 0
      
        for (const j of varcosts) {
            min = min>j?j:min
            minind = min>j?ind:minind
            ind += 1
      //      log(j)
        }

        minind = varcosts.indexOf(min)
        nextpurchaseid = minind
     //   log(min)
    //    log(nextpurchaseid)
        //log(nextpurchaseid)
       // log(varcosts[4])
       // log(r)
       // if (0<nextpurchaseid<8) {
       //     console.log(10)
      //  }
        var nextpurchase = (aTheory.upgrades)[nextpurchaseid]
      //  if (config==nextpurchaseid) {
       //     console.log(0)
        //}
        //log(nextpurchaseid)
    
            return config==nextpurchaseid || config==nextpurchaseid1 || config==nextpurchaseid2;
        }
        
    }

var buyProcess;
{
    const never = (_) => {};
    const free_only = (upgrade) => {
        if (upgrade.cost.getCost(upgrade.level) == 0) upgrade.buy(1);
    }
    const custom = (upgrade, ratio) => {
      //  while (upgrade.currency.value >= upgrade.cost.getSum(upgrade.level, upgrade.level+100) * ratio) upgrade.buy(100);
        while (upgrade.currency.value >= upgrade.cost.getCost(upgrade.level) * ratio) upgrade.buy(1);
    };
    const always = (upgrade) => custom(upgrade, 1);
    const tenth = (upgrade) => custom(upgrade, 10);

    buyProcess = (upgrade, config) => {
        return always(upgrade);
    }
}
var buyString;
{
    buyString = (config) => {
        switch (config.mode) {
            case BUY_MODES.never:
                return "never";
            case BUY_MODES.always:
                return "always";
            case BUY_MODES.tenth:
                return "1/10";
            case BUY_MODES.free_only:
                return "free only";
            case BUY_MODES.custom:
                return `custom: 1/${config.ratio}`;
        }
    }
}

var genTables;
{
    genTables = () => {

        autoFreq = -1;
        useR9 = true;
        debug = false;

        autoBuyModes = {};
        publicationRatios = {};
        useAutobuy = {};



        for (const aTheory of game.theories) {
            if (aTheory.id == 8) continue;

            autoBuyModes[aTheory.id] = {};
            for (const upgrade of aTheory.upgrades) {
                autoBuyModes[aTheory.id][upgrade.id] = {mode: BUY_MODES.never, ratio: BigNumber.TEN};
            }

            publicationRatios[aTheory.id] = BigNumber.from(0.1);
            useAutobuy[aTheory.id] = false;
        }

    }

}

var showAutoBuyPopup, showPubRatioPopup, showAutoFreqPopup;
{
    const makeSimpleApplyPopup = (heading, placeholder, description, onClicked) => {

        let record = placeholder;

        let entry = ui.createEntry({
            placeholder: placeholder,
            onTextChanged: (_, s) => {record = s}
        })
        let apply = ui.createButton({
            text: "Apply"
        })
        let text = ui.createLabel({
            text: description
        })

        let popup = ui.createPopup({
            title: heading,
            content: ui.createStackLayout({
                children: [entry, text, apply]
            }),
        })

        apply.onClicked = () => {
            const res = onClicked(record);
            if (res) popup.hide();
        }

        return popup;
    }

    {

        showAutoBuyPopup = (aTheoryId) => {

            aTheory = game.theories[aTheoryId];
    
    
            let popup = ui.createPopup({
                title: `${aTheory.name} Panel`
            })

            popup.content = ratioContent(aTheory);
            
            popup.show();
        }

        const ratioContent = (aTheory) => {
    
            const NUM_COLS = 3;
    
            let buttons = [];
            let labels = [];
            for (const upgrade of aTheory.upgrades) {
                const desc = upgrade.description;
                const varname = desc.substring(2, desc.indexOf("=")); // Hacky way to get name
    
                const config = autoBuyModes[aTheory.id][upgrade.id];
    
                let label = ui.createLatexLabel({
                    text: `\\(${varname}\\)`,
                    horizontalTextAlignment: TextAlignment.CENTER,
                    verticalTextAlignment: TextAlignment.END});
                labels.push(label);
    
                let button = ui.createButton();
                button.text = () => buyString(config);
    
                const toggle = () => {
                    config.mode = BUY_MODES.next(config.mode);
                }
                const makePopup = () => {
                    const heading = `${varname} ratio`;
                    const placeholder = config.ratio.toString();
                    const description = "Enter the desired ratio of (rho)/(price). Must be at least 1.";
                    const onClicked = (record) => {
                        const isSuccess = BigNumber.tryParse(record, null);
                        if (!isSuccess) return false;
                        const num = parseBigNumber(record);
                        if (num < 1) return false;
                        config.ratio = num;
                        config.mode = BUY_MODES.custom;
                        log(config.ratio.toNumber());
                        return true;
                    }
    
                    const popup = makeSimpleApplyPopup(heading, placeholder, description, onClicked);
                    popup.show();
                }
                button.onTouched = (e) => {
                    if (e.x < 0 || e.x > button.width || e.y < 0 || e.y > button.height) return;
                    switch (e.type) {
                        case TouchType.SHORTPRESS_RELEASED:
                            toggle();
                            break;
                        case TouchType.LONGPRESS:
                            makePopup();
                            break;
                        default:
                            break;
                    }
                }
                buttons.push(button);
            }
    
            for (let i = 0; i < aTheory.upgrades.length; i++) {
                const rem = i % NUM_COLS;
                const quo = (i - rem) / NUM_COLS;
                labels[i].row = 2 * quo;
                labels[i].column = rem;
                buttons[i].row = 2 * quo + 1;
                buttons[i].column = rem;
            }
    
            let rowDefinitions = [];
            for (let i = 0; i < aTheory.upgrades.length; i = i + NUM_COLS) {
                rowDefinitions.push("1*");
                rowDefinitions.push("2*");
            }

            const content = ui.createGrid({
                rowDefinitions: rowDefinitions,
                children: buttons.concat(labels)
            })

            return content;
        }
    }
    

    showPubRatioPopup = (aTheoryId) => {
        aTheory = game.theories[aTheoryId];

        const heading = `${aTheory.name} Ratio`;
        const placeholder = publicationRatios[aTheoryId].toString();
        const description = `Enter the publication ratio desired. Values 1 or less count as auto (beta; will not work properly unless you publish each time you enable this CT)`;
        const onClicked = (record) => {
            const isSuccess = BigNumber.tryParse(record, null);
            if (!isSuccess) return false;
            const num = parseBigNumber(record);
            publicationRatios[aTheoryId] = num;
            return true;
        }
        const popup = makeSimpleApplyPopup(heading, placeholder, description, onClicked);

        popup.show();
    }

    showAutoFreqPopup = () => {

        let record = autoFreq.toString();

        let entry = ui.createEntry({
            placeholder: record,
            onTextChanged: (_, s) => {record = s}
        })
        let apply = ui.createButton({
            text: "Apply"
        })

        let text = ui.createLabel({
            text: `Enter the frequency of auto reallocation. Values less than ${MIN_FREQ} are ignored.`
        })

        let popup = ui.createPopup({
            title: `Reallocation Frequency`,
            content: ui.createStackLayout({
                children: [entry, text, apply]
            }),
        })

        apply.onClicked = () => {
            if (record.endsWith('debug')) {
                debug = true;
                record = record.slice(0, -5);
            } else {
                debug = false;
            }
            const num = parseInt(record);
            if (isNaN(num)) return;
            autoFreq = num;
            popup.hide();
        }

        popup.show();

    }
}


var customReplacer = (_, val) => {
    try {
        if (val instanceof BigNumber) return "BigNumber" + val.toBase64String();
    } catch {}
    return val;
}
var customReviver = (_, val) => {
    if (val && typeof val === 'string' && val.startsWith("BigNumber")) return BigNumber.fromBase64String(val.substring(9));
    return val;
}

var getInternalState = () => JSON.stringify({
    autoBuyModes: autoBuyModes,
    publicationRatios: publicationRatios,
    autoFreq: autoFreq,
    useR9: useR9,
    saveVersion: version,
    useAutobuy: useAutobuy,
    debug: debug
}, customReplacer);

var setInternalState = (state) => {
    if (state) {
        const newState = JSON.parse(state, customReviver);
        Object.assign(this, newState);
    }
}

init();