var id = "eaux_qol";
var name = "QoL Theory";
var description = "A custom theory for finer main theory auto-purchase controls and heuristic-based star/student reallocation";
var authors = "Eaux Tacous#1021";
var version = 19;
var permissions = Permissions.PERFORM_GAME_ACTIONS

var autoBuyPopups, publicationRatioPopups, autoFreqPopup;
var autoBuyModes, publicationRatios, autoFreq, useR9;

const MIN_FREQ = 10;

var init = () => {

    setupToggles();

    genTables();
    setInternalState("");

    setActiveCallbacks();

    theory.createCurrency(); // required for graph activation
}

var get2DGraphValue = () => {
    const aTheory = game.activeTheory;
    if (aTheory == null || aTheory.id == 8) return 0;
    return (aTheory.nextPublicationMultiplier/aTheory.publicationMultiplier).log().toNumber();
}
var getPrimaryEquation = () => {
    const aTheory = game.activeTheory;
    if (aTheory == null || aTheory.id == 8) return "Invalid";
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
        onClicked: () => autoFreqPopup.show()
    });

    const pubRatio = ui.createButton({
        text: () => {
            const aTheory = game.activeTheory;
            if (aTheory == null || aTheory.id == 8) return "Error: Invalid Theory";
            const s = (publicationRatios[aTheory.id] > 1) ? publicationRatios[aTheory.id].toString() : "auto"
            return "Publication Ratio:\ " + s;
        },
        onClicked: () => {
            const aTheory = game.activeTheory;
            if (aTheory == null || aTheory.id == 8) return;
            publicationRatioPopups[aTheory.id].show();
        }
    });
    const theoryButton = ui.createButton({
        text: "Theory Autobuy Menu",
        onClicked: () => {
            const aTheory = game.activeTheory;
            if (aTheory == null || aTheory.id == 8) return;
            autoBuyPopups[aTheory.id].show();
        }
    });

    const stack = ui.createStackLayout({
        children: [
            autoGrid, autoFreqButton, pubRatio, theoryButton
        ]
    });
    return stack;
}

// Callbacks
var setActiveCallbacks;
{
    setActiveCallbacks = () => {
        const aTheory = game.activeTheory;
        if (aTheory !== null)
            aTheory.publishing = () => {log(`${aTheory.id} publishing`);resetStats(aTheory);}
    }

    game.activeTheoryChanged = () => {
        setActiveCallbacks();
        setupToggles();
    }

}

// Toggle setups
var setupToggles = () => {
    return; // TODO disable theory autobuy only if CT autobuy is active.

    const aTheory = game.activeTheory;
    if (aTheory == null || aTheory.id == 8) return;
    aTheory.isAutoBuyerActive = false;
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

    simpleStudent = () => {

        // number of purchases to backtrack and brute force; 4 if gradf < ee30k, 10 otherwise
        // const REFUND_CNT = game.statistics.graduationF < BigNumber.fromComponents(1, 2, 29994) ? 4 : 10;

        const upgrades = Array.from(game.researchUpgrades).filter(x => x.id <= 101 && x.isAvailable);
        upgrades.forEach(x => x.refund(-1));

        if (useR9) game.researchUpgrades[8].buy(-1);
        else game.researchUpgrades[8].refund(-1)

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

    }
}




// Analyze Theory behavior
var pubStep, resetStats, pubStats;
{
    const HISTORY_LEN = 5;

    const GROWTH_WEIGHT = 2;
    const DECAY_WEIGHT = 1;
    const DECAY_LIMIT = 5;

    const addel = (history, newelt) => {
        if (history.elts.length == HISTORY_LEN) {
            const oldelt = history.elts.shift();
            history.sum -= oldelt;
        }
        history.elts.push(newelt);
        history.sum += newelt;
    }

    resetStats = (aTheory) => {

        pubStats[aTheory.id] = {
            duration: 0,
            mult: aTheory.nextPublicationMultiplier,
            prevrate: 0,
            history: {elts: [], sum: 0},
            decayCnt: 0
        }

    }

    pubStep = (aTheory) => {
        if (!aTheory.canPublish) return false;

        const stat = pubStats[aTheory.id];

        const ratio = aTheory.nextPublicationMultiplier / stat.mult;
        const rate = (ratio.log() / stat.duration);

        addel(stat.history, rate - stat.prevrate);
        stat.prevrate = rate;

        if (stat.history.sum > 0) {
            stat.decayCnt = Math.max(0, stat.decayCnt - GROWTH_WEIGHT);
        }
        else if (stat.decayCnt < DECAY_LIMIT) {
            stat.decayCnt += DECAY_WEIGHT;
        }
        else {
            return true;
        }

        return false;
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
        for (const upgrade of aTheory.upgrades) {
            if (!upgrade.isAvailable) continue;
            const config = autoBuyModes[aTheory.id][upgrade.id];
            if (buyCheck(upgrade, config)) {
                if (!bought) bought = true;
                buyProcess(upgrade, config);
            }
        }
        return bought;
    }

    theoryHandler = (elapsedTime) => {
        const aTheory = game.activeTheory;
        if (aTheory == null || aTheory.id == 8) return;

        pubStats[aTheory.id].duration += elapsedTime;

        if (publicationRatios[aTheory.id] > 1) {
            publishHandler(aTheory);
            theoryBuyHandler(aTheory);
        } else {
            const bought = theoryBuyHandler(aTheory);
            if (bought) {
                const shouldPub = pubStep(aTheory);
                if (shouldPub) aTheory.publish();
            }
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

    buyCheck = (upgrade, config) => {
        switch (config.mode) {
            case BUY_MODES.never:
                return never(upgrade);
            case BUY_MODES.always:
                return always(upgrade);
            case BUY_MODES.tenth:
                return tenth(upgrade);
            case BUY_MODES.free_only:
                return free_only(upgrade);
            case BUY_MODES.custom:
                return custom(upgrade, config.ratio);
        }
    }
}
var buyProcess;
{
    const never = (_) => {};
    const free_only = (upgrade) => {
        if (upgrade.cost.getCost(upgrade.level) == 0) upgrade.buy(1);
    }
    const custom = (upgrade, ratio) => {
        while (upgrade.currency.value >= upgrade.cost.getSum(upgrade.level, upgrade.level+100) * ratio) upgrade.buy(100);
        while (upgrade.currency.value >= upgrade.cost.getCost(upgrade.level) * ratio) upgrade.buy(1);
    };
    const always = (upgrade) => custom(upgrade, 1);
    const tenth = (upgrade) => custom(upgrade, 10);

    buyProcess = (upgrade, config) => {
        switch (config.mode) {
            case BUY_MODES.never:
                return never(upgrade);
            case BUY_MODES.always:
                return always(upgrade);
            case BUY_MODES.tenth:
                return tenth(upgrade);
            case BUY_MODES.free_only:
                return free_only(upgrade);
            case BUY_MODES.custom:
                return custom(upgrade, config.ratio);
        }
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

        autoBuyModes = {};
        publicationRatios = {};

        pubStats = {};

        for (const aTheory of game.theories) {
            if (aTheory.id == 8) continue;

            autoBuyModes[aTheory.id] = {};
            for (const upgrade of aTheory.upgrades) {
                autoBuyModes[aTheory.id][upgrade.id] = {mode: BUY_MODES.never, ratio: BigNumber.TEN};
            }

            publicationRatios[aTheory.id] = BigNumber.HUNDRED;

            resetStats(aTheory);
        }

    }

}

var genpopups;
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

    const genAutoBuyPopups = () => {
        autoBuyPopups = {}
        const NUM_COLS = 3;
        for (const aTheory of game.theories) {
            if (aTheory.id == 8) continue;
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

            let popup = ui.createPopup({
                title: `${aTheory.name} Panel`,
                content: ui.createGrid({
                    rowDefinitions: rowDefinitions,
                    children: buttons.concat(labels)
                })
            })

            autoBuyPopups[aTheory.id] = popup;

        }
    }

    const genPublicationRatioPopups = () => {
        publicationRatioPopups = {};
        for (const aTheory of game.theories) {
            if (aTheory.id == 8) continue;

            const heading = `${aTheory.name} Ratio`;
            const placeholder = publicationRatios[aTheory.id].toString();
            const description = `Enter the publication ratio desired. Values 1 or less count as auto (beta; will not work properly unless you publish each time you enable this CT)`;
            const onClicked = (record) => {
                const isSuccess = BigNumber.tryParse(record, null);
                if (!isSuccess) return false;
                const num = parseBigNumber(record);
                publicationRatios[aTheory.id] = num;
                return true;
            }
            const popup = makeSimpleApplyPopup(heading, placeholder, description, onClicked);

            publicationRatioPopups[aTheory.id] = popup;
        }
    }

    const genAutoFreqPopup = () => {

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
            const num = parseInt(record);
            if (isNaN(num)) return;
            autoFreq = num;
            popup.hide();
        }

        autoFreqPopup = popup
    }

    genpopups = () => {
        genAutoBuyPopups();
        genPublicationRatioPopups();
        genAutoFreqPopup();
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
    pubStats: pubStats,
    useR9: useR9,
    saveVersion: version
}, customReplacer);

var setInternalState = (state) => {
    if (state) {
        const newState = JSON.parse(state, customReviver);
        Object.assign(this, newState);
    }
    genpopups();
}

init();