var id = "theory_auto";
var name = "Theory automator";
var description = "Automates purchases and publications in theories.";
var authors = "rus9384";
var version = "1.6b";
var permissions = Permissions.PERFORM_GAME_ACTIONS;

var theoryManager;
var timer = 0;
var requirements = [150, 250, 175, 175, 150, 150, 175, 220];
var R8;
var R9;
var test;

var upgradeCost = upgrade => upgrade.cost.getCost(upgrade.level);
var toBig = number => BigNumber.from(number);
var publicationMultiplier = theory => theory.nextPublicationMultiplier / theory.publicationMultiplier;
var getR9 = () => (game.sigmaTotal / 20) ** game.researchUpgrades[8].level;

var primaryEquation = "";
theory.primaryEquationHeight = 45;
function getPrimaryEquation() {

	if (primaryEquation != "") return primaryEquation;
	
	if (game.activeTheory === null || game.activeTheory.id === 8) return "";
	
	let coastText = "\\begin{eqnarray}";
	if (theoryManager.id != 1 && theoryManager.id != 2)
		coastText += "Coast\\;" + theoryManager.theory.latexSymbol + "&=&" + theoryManager.coast + "\\\\";
	else
		coastText += "Phase&=&" + theoryManager.phase + "\\\\";
	
	let pubTau = theoryManager.pub;
	if (theoryManager.id == 1)
		pubTau = theoryManager.theory.tauPublished * theoryManager.pub ** (1 / 0.198);
	else if (theoryManager.id == 2)
		pubTau = theoryManager.theory.tauPublished * theoryManager.pub ** (1 / 0.147);
	
	return coastText + "Next\\;\\overline{" + theoryManager.theory.latexSymbol + "}&=&" + pubTau + "\\end{eqnarray}";
				
}

var secondaryEquation = "";
var getSecondaryEquation = () => "" + secondaryEquation;

var quaternaryEntries = [];
for (let i = 0; i < 8; i++) {
	quaternaryEntries.push(new QuaternaryEntry("τ_" + (i + 1), 0));
}
var getQuaternaryEntries = () => {

	let decay = [
		30.1935671759384,
		37.4972532637665,
		30.7608639120181,
		44.9544911685781,
		39.2687021300084,
		102.119195226465,
		26.7695950304505,
		17.6476778516314
	];
	let timeMult = [1, 10.2, 1, 1.5, 1, 3, 1, 1];
	let base = [
		2.59,
		11.4,
		1.36,
		2.85,
		44.3,
		4.52,
		2.15,
		4.93
	];
		
	let tau;
	let tauH;	
		
	for (let i = 0; i < Math.min(8, game.researchUpgrades[7].level); i++) {
		try {
			tau = game.theories[i].tauPublished.log10();
		} catch(e) {
			tau = 1;
		}
		tauH = base[i] * R9 ** (1 / timeMult[i]) / 2 ** ((tau - requirements[i]) / decay[i]);
		quaternaryEntries[i].value = formatQValue(tauH);
	}
	for (let i = game.researchUpgrades[7].level; i < 8; i++) {
		quaternaryEntries[i].value = formatQValue(0);
	}
	
	// T4 low tau check
	if (game.researchUpgrades[7].level < 4) return quaternaryEntries;
	
	decay = 27.0085302950228;
	base = 1.51;
	timeMult = 1;
	
	try {
		tau = game.theories[3].tauPublished.log10();
	} catch (e) {
		tau = 1;
	}
	tauH = base * R9 ** (1 / timeMult) / 2 ** ((tau - requirements[3]) / decay);
	quaternaryEntries[3].value = formatQValue(Math.max(tauH, quaternaryEntries[3].value));
	
	// T6 low tau check
	if (game.researchUpgrades[7].level < 6) return quaternaryEntries;
	
	decay = 70.0732254255212;
	base = 7;
	timeMult = 2;
	
	try {
		tau = game.theories[5].tauPublished.log10();
	} catch(e) {
		tau = 1;
	}
	tauH = base * R9 ** (1 / timeMult) / 2 ** ((tau - requirements[5]) / decay);
	quaternaryEntries[5].value = formatQValue(Math.max(tauH, quaternaryEntries[5].value));

    return quaternaryEntries;
	
}

function formatQValue(input) {
	let string = ("" + input).substring(0, 9);
	if (string.charAt(8) == '.') string = string.substring(0, 8);
	return string;
}

function buyMax(upgrade, value) {
	let spend = value.min(upgrade.currency.value);
	let levelBefore = upgrade.level;
	upgrade.buy(upgrade.cost.getMax(upgrade.level, spend));
	return upgrade.level > levelBefore;
}

function buyRatio(upgrade, ratio) {
	let BigNumRatio = typeof(ratio) === 'object' ? ratio : toBig(ratio);
	return buyMax(upgrade, upgrade.currency.value / BigNumRatio);
}

function buySkip() {
	
		if (!enableVariablePurchase.level) return true;
		
		if (theoryManager?.theory?.isAutoBuyerActive === true)
			theoryManager.theory.isAutoBuyerActive = false;
				
		if (theoryManager.upgrades === undefined) return true;
		
		return false;
		
}

function buyMilestones() {
	
	if (!enableMSPurchase.level) return;
	
	for (let i = 0; i < game.activeTheory.milestoneUpgrades.length; i++) {
		if (i == 0 && theoryManager.id == 7) continue;
		game.activeTheory.milestoneUpgrades[i].buy(-1);
	}
	
}

function switchTheory(manualSwitch = false) {
	
	theory.invalidateQuaternaryValues();
	
	if (!enableTheorySwitch.level && !manualSwitch) return;

	let iMax = -1;
	let max  = 0;
	for (let i = 0; i < Math.min(8, game.researchUpgrades[7].level); i++) {
		if (!theory.upgrades[i].level) continue;
		let value = parseFloat(theory.quaternaryValue(i));
		if (value > max) {
			iMax = i;
			max = value;
		}
	}

	if (iMax >= 0)
		game.activeTheory = game.theories[iMax];

}

function refreshTheoryManager() {
	
	let theoryId = game.activeTheory?.id;
	if (theoryId == 0) theoryManager = new T1;
	if (theoryId == 1) theoryManager = new T2;
	if (theoryId == 2) theoryManager = new T3;
	if (theoryId == 3) theoryManager = new T4;
	if (theoryId == 4) theoryManager = new T5;
	if (theoryId == 5) theoryManager = new T6;
	if (theoryId == 6) theoryManager = new T7;
	if (theoryId == 7) theoryManager = new T8;
	
	theory.invalidatePrimaryEquation();

	secondaryEquation = "";
	theory.invalidateSecondaryEquation();

}

// Utilizes T1SolarXLII strategy with cyclic publication multipliers
class T1 {
	
	constructor() {	
	
		this.id = 0;
		this.theory = game.activeTheory;
		
		this.upgrades = this.theory.upgrades;
		this.q1 = this.upgrades[0];
		this.q2 = this.upgrades[1];
		this.c3 = this.upgrades[4];
		this.c4 = this.upgrades[5];

		this.lastPub = this.theory.tauPublished;

		this.setPub();	

		this.scheduledUpgrades = [];
		this.scheduledLevels   = [0, 0, 0, 0];

		theory.secondaryEquationHeight = 20;

	}

	get c4NC() {
		let BN10 = toBig(10);
		return BN10.pow(((this.lastPub / BN10.pow(BN10)).log10() / 8).ceil() * 8 + 10);
	}

	setPub() {
		
		let diff = (this.c4NC / this.lastPub).log10();
		
		let mult = diff < 3 ? 100 : diff < 5 ? 0.015 : 0.00014;
		this.pub = this.c4NC * mult;
		
		mult = diff < toBig(3) ? toBig(30) : diff < toBig(5) ? toBig(0.003) : toBig(0.00003);
		this.coast = this.c4NC * mult;
		
	}	

	upgradeByIndex(upgradeIndex) {
		
		let upgrade;
		let ratio;
		switch (upgradeIndex) {
			case 0:
				upgrade = this.q1;
				ratio 	= 5;
				break;
			case 1:
				upgrade = this.q2;
				ratio 	= 1.11;
				break;
			case 2:
				upgrade = this.c3;
				ratio 	= 5;
				break;
			case 3:
				upgrade = this.c4;
				ratio 	= 1;
				break;
		}
		
		return [upgrade, ratio];
		
	}
	
	updateSchedule() {

		if (this.scheduledUpgrades.length >= 25) return false;
		
		let veryBigNumber = parseBigNumber("ee999999");

		while (this.scheduledUpgrades.length < 25) {

			let q1cost = this.q1.cost.getCost(this.q1.level + this.scheduledLevels[0]);
			let q2cost = this.q2.cost.getCost(this.q2.level + this.scheduledLevels[1]);
			let c4cost = this.c4.cost.getCost(this.c4.level + this.scheduledLevels[3]);

			let q1weightedCost = q1cost * 5;
			if (
				q1cost * (6.9 + (this.q1.level + this.scheduledLevels[0]) % 10) >= q2cost ||
				q1cost * (15.2 + (this.q1.level + this.scheduledLevels[0]) % 10) >= c4cost
			) 
				q1weightedCost = veryBigNumber;

			let costs = [
				q1weightedCost,
				q2cost * 1.11,
				this.c3.cost.getCost(this.c3.level + this.scheduledLevels[2]) * 5,
				c4cost
			];

			let minCost = [parseBigNumber("ee999999"), null];
			for (let i = 0; i < costs.length; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];

			let upgrade = this.upgradeByIndex(minCost[1])[0];
			let cost = upgrade.cost.getCost(upgrade.level + this.scheduledLevels[minCost[1]]);
			if (cost >= this.coast)
				break;

			if (minCost[1] != null) {
				this.scheduledLevels[minCost[1]]++;
				let lastUpgrade = this.scheduledUpgrades[this.scheduledUpgrades.length - 1];
				if (lastUpgrade != undefined && lastUpgrade[0] == minCost[1]) 
					lastUpgrade[1]++;
				else
					this.scheduledUpgrades.push([minCost[1], 1]);
			}
			else break;

		}	

		return true;

	}
	
	showSchedule() {
		secondaryEquation = "";
		if (this.scheduledUpgrades.length)
			secondaryEquation = "Next\\ upgrades: ";
		for (let i = 0; i < Math.min(this.scheduledUpgrades.length, 5); i++){
			if (this.scheduledUpgrades[i][1] > 1)
				secondaryEquation += this.scheduledUpgrades[i][1];
			secondaryEquation += (this.scheduledUpgrades[i][0] < 2 ? "q_" + (this.scheduledUpgrades[i][0] + 1) : "c_" + (this.scheduledUpgrades[i][0] + 1));
			if (i + 1 < Math.min(this.scheduledUpgrades.length, 5))
				secondaryEquation += ", ";
		}
		theory.invalidateSecondaryEquation();		
	}
	
	buy() {
		
		if (buySkip()) return;

		if (theoryManager.theory.tau >= theoryManager.coast && enablePublications.level) return;
		
		let schedulerRefresh = false;
		if (buyRatio(this.q1, 50)) schedulerRefresh = true;
		if (buyRatio(this.q2,  2)) schedulerRefresh = true;
		if (buyRatio(this.c3, 10)) schedulerRefresh = true;
		if (buyRatio(this.c4,  2)) schedulerRefresh = true;

		if (schedulerRefresh) {
			this.scheduledUpgrades = [];
			this.scheduledLevels   = [0, 0, 0, 0];
		}

		let bought = false;
		while (this.scheduledUpgrades.length) {

			let upgradeIndex = this.scheduledUpgrades[0][0];
			let upgradeRatio = this.upgradeByIndex(upgradeIndex);

			let levelBefore = upgradeRatio[0].level;
			buyRatio(upgradeRatio[0], upgradeRatio[1]);

			if (levelBefore == upgradeRatio[0].level)
				break;

			bought = true;
			this.scheduledUpgrades[0][1]--; 
			this.scheduledLevels[upgradeIndex]--;
			if (this.scheduledUpgrades[0][1] <= 0)
				this.scheduledUpgrades.shift();

		}

		if (this.theory.currencies[0].value > this.theory.tauPublished / 1e20 && (this.updateSchedule() || bought)) this.showSchedule();

	}

	tick(elapsedTime, multiplier) {

		if (!theory.upgrades[this.id].level) return;

		buyMilestones();

		if (enablePublications.level && this.theory.tau > this.pub) {
			game.activeTheory.publish();
			return true;
		}

		this.buy();

		return false;

	}

}

// Utilizes T2MC strategy with fixed publication multipliers
class T2 {
	
	constructor() {

		this.id = 1;
		this.theory = game.activeTheory;

		this.upgrades = this.theory.upgrades;

		this.pub = 8000;
		this.qr1 = 4650;
		this.qr2 = 2900;
		this.qr3 = 2250;
		this.qr4 = 1150;
		this.phase = 1;

		this.scheduledUpgrades = [];
		this.scheduledLevels;

		theory.secondaryEquationHeight = 20;

	}

	updateSchedule() {

		if (this.phase >= 5) return true;

		let veryBigNumber = parseBigNumber("ee999999");

		this.scheduledUpgrades = [];
		this.scheduledLevels = [0, 0, 0, 0, 0, 0, 0, 0];

		while (this.scheduledUpgrades.length < 5) {

			let costs = [];
			for (let i = 0; i < 8; i++)
				costs.push(this.upgrades[i].cost.getCost(this.upgrades[i].level + this.scheduledLevels[i]));
			
			if (this.phase > 1) {
				costs[3] = veryBigNumber;
				costs[7] = veryBigNumber;
			}
			
			if (this.phase > 2) {
				costs[2] = veryBigNumber;
				costs[6] = veryBigNumber;
			}
			
			if (this.phase > 3) {
				costs[1] = veryBigNumber;
				costs[5] = veryBigNumber;
			}

			let minCost = [veryBigNumber, null];
			for (let i = 0; i < costs.length; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];
			let cost = this.upgrades[minCost[1]].cost.getCost(this.upgrades[minCost[1]].level + this.scheduledLevels[minCost[1]]);
			if (minCost[1] != null) {
				this.scheduledLevels[minCost[1]]++;
				let lastUpgrade = this.scheduledUpgrades[this.scheduledUpgrades.length - 1];
				if (lastUpgrade != undefined && lastUpgrade[0] == minCost[1]) 
					lastUpgrade[1]++;
				else
					this.scheduledUpgrades.push([minCost[1], 1]);
			}
			else break;

		}	

		return true;

	}
	
	showSchedule() {
		secondaryEquation = "";
		if (this.scheduledUpgrades.length)
			secondaryEquation = "Next\\ upgrades: ";
		for (let i = 0; i < Math.min(this.scheduledUpgrades.length, 5); i++){
			if (this.scheduledUpgrades[i][1] > 1)
				secondaryEquation += this.scheduledUpgrades[i][1];
			secondaryEquation += this.scheduledUpgrades[i][0] <= 3 ? "q_" + (this.scheduledUpgrades[i][0] + 1) : "r_" + (this.scheduledUpgrades[i][0] - 3);
			if (i + 1 < Math.min(this.scheduledUpgrades.length, 5))
				secondaryEquation += ", ";
		}
		theory.invalidateSecondaryEquation();		
	}
	
	buy() {

		if (secondaryEquation == "" && this.updateSchedule()) this.showSchedule();

		if (buySkip()) return;

		if (this.updateSchedule()) this.showSchedule();

		if (publicationMultiplier(this.theory) >= this.qr1 && enablePublications.level) {
			if (this.phase != 5) {
				this.phase = 5;
				theory.invalidatePrimaryEquation();
			}
			return;
		}
		this.upgrades[0].buy(-1);
		this.upgrades[4].buy(-1);
		
		if (publicationMultiplier(this.theory) >= this.qr2 && enablePublications.level) {
			if (this.phase != 4) {
				this.phase = 4;
				theory.invalidatePrimaryEquation();
			}
			return;
		}
		this.upgrades[1].buy(-1);
		this.upgrades[5].buy(-1);

		if (publicationMultiplier(this.theory) >= this.qr3 && enablePublications.level) {
			if (this.phase != 3) {
				this.phase = 3;
				theory.invalidatePrimaryEquation();
			}
			return;
		}
		this.upgrades[2].buy(-1);
		this.upgrades[6].buy(-1);
		
		if (publicationMultiplier(this.theory) >= this.qr4 && enablePublications.level) {
			if (this.phase != 2) {
				this.phase = 2;
				theory.invalidatePrimaryEquation();
			}
			return;
		}
		this.upgrades[3].buy(-1);
		this.upgrades[7].buy(-1);		

	}
		
	tick(elapsedTime, multiplier) {

		if (!theory.upgrades[this.id].level) return;

		buyMilestones();

		if (enablePublications.level && publicationMultiplier(this.theory) > this.pub) {
			game.activeTheory.publish();
			return true;
		}

		this.buy();	
		
		return false;
		
	}
	
}

// Utilizes slightly altered T3Play2 strategy with fixed publication multipliers
class T3 {
	
	constructor() {
	
		this.id = 2;
		this.theory = game.activeTheory;
		
		this.upgrades = this.theory.upgrades;
		this.b1  = this.upgrades[ 0];
		this.b2  = this.upgrades[ 1];
		this.b3  = this.upgrades[ 2];
		this.c12 = this.upgrades[ 4];
		this.c22 = this.upgrades[ 7];
		this.c23 = this.upgrades[ 8];
		this.c31 = this.upgrades[ 9];
		this.c32 = this.upgrades[10];
		this.c33 = this.upgrades[11];

		this.phase1 = this.theory.tauPublished / 10;
		this.phase2 = 1.2;
		this.phase3 = 2.4;				
		this.pub 	= 2.5;
		this.phase  = 1;
		
		this.scheduledUpgrades1 = [];
		this.scheduledUpgrades2 = [];
		this.scheduledUpgrades3 = [];
		this.scheduledLevels1   = [0, 0];
		this.scheduledLevels2   = [0, 0, 0, 0];
		this.scheduledLevels3   = [0, 0, 0];
				
	}

	upgradeByIndex1(upgradeIndex) {

		let upgrade;
		switch (upgradeIndex) {
			case 0:
				upgrade = this.b1;
				break;
			case 1:
				upgrade = this.c31;
				break;
		}			

		return upgrade;

	}

	updateSchedule1() {
		
		if (this.scheduledUpgrades1.length >= 15) return false;
		
		while (this.scheduledUpgrades1.length < 15) {
			
			let costs = [
				this.b1.cost.getCost(this.b1.level + this.scheduledLevels1[0]) * 8,
				this.c31.cost.getCost(this.c31.level + this.scheduledLevels1[1])
			];

			let minCost = [parseBigNumber("ee999999"), null];
			for (let i = 0; i < costs.length; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];
			if (minCost == null) break;
			let upgrade = this.upgradeByIndex1(minCost[1]);
			let cost = upgrade.cost.getCost(upgrade.level + this.scheduledLevels1[minCost[1]]);
			if (cost >= this.theory.tauPublished / 10)
				break;
			this.scheduledLevels1[minCost[1]]++;
			let lastUpgrade = this.scheduledUpgrades1[this.scheduledUpgrades1.length - 1];
			if (lastUpgrade != undefined && lastUpgrade[0] == minCost[1])
				lastUpgrade[1]++;
			else
				this.scheduledUpgrades1.push([minCost[1], 1]);
			
		}
		
		return true;

	}
	
	updateSchedule2() {
		
		if (this.scheduledUpgrades2.length >= 15) return false;
		
		let veryBigNumber = parseBigNumber("ee999999");
				
		while (this.scheduledUpgrades2.length < 15) {
			
			let costs;
			if (this.phase <= 2)
				costs = [
					this.b2.cost.getCost(this.b2.level + this.scheduledLevels2[0]) * 5,
					this.c12.cost.getCost(this.c12.level + this.scheduledLevels2[1]) * 100,
					this.c22.cost.getCost(this.c22.level + this.scheduledLevels2[2]) * 2.5,
					this.c32.cost.getCost(this.c32.level + this.scheduledLevels2[3])
				];
			else if (this.phase == 3)
				costs = [
					this.b2.cost.getCost(this.b2.level + this.scheduledLevels2[0]) * 8,
					this.c12.cost.getCost(this.c12.level + this.scheduledLevels2[1]),
					this.c22.cost.getCost(this.c22.level + this.scheduledLevels2[2]) * 8,
					this.c32.cost.getCost(this.c32.level + this.scheduledLevels2[3]) * 8
				];
			else
				costs = [
					this.b2.cost.getCost(this.b2.level + this.scheduledLevels2[0]),
					this.c12.cost.getCost(this.c12.level + this.scheduledLevels2[1]),
					veryBigNumber, // does not buy c22 after 2.2 multiplier
					veryBigNumber  // does not buy c32 after 2.2 multiplier
				];				
			let minCost = [veryBigNumber, null];
			for (let i = 0; i < costs.length; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];
			if (minCost[1] != null) {
				this.scheduledLevels2[minCost[1]]++;
				let lastUpgrade = this.scheduledUpgrades2[this.scheduledUpgrades2.length - 1];
				if (lastUpgrade != undefined && lastUpgrade[0] == minCost[1]) 
					lastUpgrade[1]++;
				else
					this.scheduledUpgrades2.push([minCost[1], 1]);
			}
			else break;

		}
		
		return true;

	}

	updateSchedule3() {
		
		if (this.scheduledUpgrades3.length >= 15) return false;
		
		let veryBigNumber = parseBigNumber("ee999999");
		
		while (this.scheduledUpgrades3.length < 15) {
			
			let costs = [
					this.b3.cost.getCost(this.b3.level + this.scheduledLevels3[0]) * (this.phase == 4 ? 1 : 8),
					this.c23.cost.getCost(this.c23.level + this.scheduledLevels3[1]),
					this.phase <= 2 ? this.c33.cost.getCost(this.c33.level + this.scheduledLevels3[2]) * 10 : veryBigNumber
				];			
			let minCost = [veryBigNumber, null];
			for (let i = 0; i < costs.length; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];
			if (minCost[1] != null) {
				this.scheduledLevels3[minCost[1]]++;
				let lastUpgrade = this.scheduledUpgrades3[this.scheduledUpgrades3.length - 1];
				if (lastUpgrade != undefined && lastUpgrade[0] == minCost[1]) 
					lastUpgrade[1]++;
				else
					this.scheduledUpgrades3.push([minCost[1], 1]);
			}
			else break;

		}
		
		return true;

	}

	showSchedule() {
		let height = 15;
		secondaryEquation = "";
		if (this.scheduledUpgrades1.length) {
			secondaryEquation += "Next\\ \\rho_1\\ upgrades: ";
			height += 12;
		}
		for (let i = 0; i < Math.min(this.scheduledUpgrades1.length, 5); i++){
			if (this.scheduledUpgrades1[i][1] > 1)
				secondaryEquation += this.scheduledUpgrades1[i][1];
			secondaryEquation += this.scheduledUpgrades1[i][0] == 0 ? "b_1" : "c_{31}";
			if (i + 1 < Math.min(this.scheduledUpgrades1.length, 5))
				secondaryEquation += ", ";
		}
		if (this.scheduledUpgrades1.length)
			secondaryEquation += "\\\\";
		if (this.scheduledUpgrades2.length) {
			secondaryEquation += "Next\\ \\rho_2\\ upgrades: ";
			height += 12;
		}
		for (let i = 0; i < Math.min(this.scheduledUpgrades2.length, 5); i++){
			if (this.scheduledUpgrades2[i][1] > 1) 
				secondaryEquation += this.scheduledUpgrades2[i][1];
			secondaryEquation += this.scheduledUpgrades2[i][0] == 0 ? "b_2" : "c_{" + this.scheduledUpgrades2[i][0] + "2}";
			if (i + 1 < Math.min(this.scheduledUpgrades2.length, 5))
				secondaryEquation += ", ";
		}
		if (this.scheduledUpgrades2.length)
			secondaryEquation += "\\\\";
		if (this.scheduledUpgrades3.length) {
			secondaryEquation += "Next\\ \\rho_3\\ upgrades: ";
			height += 12;
		}
		for (let i = 0; i < Math.min(this.scheduledUpgrades3.length, 5); i++){
			if (this.scheduledUpgrades3[i][1] > 1)
				secondaryEquation += this.scheduledUpgrades3[i][1];
			secondaryEquation += this.scheduledUpgrades3[i][0] == 0 ? "b_3" : "c_{" + (this.scheduledUpgrades3[i][0] + 1) + "3}";
			if (i + 1 < Math.min(this.scheduledUpgrades3.length, 5))
				secondaryEquation += ", ";
		}
		theory.secondaryEquationHeight = height;
		theory.invalidateSecondaryEquation();
	}

	buy() {

		let prevPhase = this.phase;
		if (publicationMultiplier(this.theory) > this.phase3) this.phase = 4;
		else if (publicationMultiplier(this.theory) > this.phase2) this.phase = 3;
		else if (publicationMultiplier(this.theory) > this.phase1) this.phase = 2;
		
		if (prevPhase != this.phase)
			theory.invalidatePrimaryEquation();

		if (buySkip()) return;

		let schedulerRefresh1 = false;
		let schedulerRefresh2 = false;
		let schedulerRefresh3 = false;

		if (buyRatio(this.b1 , 100000)) schedulerRefresh1 = true;
		if (buyRatio(this.c31,  10000)) schedulerRefresh1 = true;
		if (buyRatio(this.b2 ,     10)) schedulerRefresh2 = true;
		if (buyRatio(this.c12,    100)) schedulerRefresh2 = true;
		if (buyRatio(this.c22,     10)) schedulerRefresh2 = true;
		if (buyRatio(this.c32,     10)) schedulerRefresh2 = true;
		if (buyRatio(this.b3 ,    100)) schedulerRefresh3 = true;
		if (buyRatio(this.c23,      2)) schedulerRefresh3 = true; 
		if (buyRatio(this.c33,    100)) schedulerRefresh3 = true;
				
		if (prevPhase != this.phase) {
			schedulerRefresh2 = true;
			schedulerRefresh3 = true;
		}
		
		if (schedulerRefresh1) {
			this.scheduledUpgrades1 = [];
			this.scheduledLevels1   = [0, 0];
		}
		
		if (schedulerRefresh2) {
			this.scheduledUpgrades2 = [];
			this.scheduledLevels2   = [0, 0, 0, 0];
		}
		
		if (schedulerRefresh3) {
			this.scheduledUpgrades3 = [];
			this.scheduledLevels3   = [0, 0, 0];
		}

		let update = false;
		
		// rho1 purchases
		while (this.scheduledUpgrades1.length) {

			let upgradeIndex = this.scheduledUpgrades1[0][0];
			let upgrade = this.upgradeByIndex1(upgradeIndex);

			let levelBefore = upgrade.level;
			upgrade.buy(1);
			
			if (levelBefore == upgrade.level)
				break;

			update = true;
			this.scheduledUpgrades1[0][1]--;
			this.scheduledLevels1[upgradeIndex]--;
			if (this.scheduledUpgrades1[0][1] <= 0)
				this.scheduledUpgrades1.shift();

		}

		// rho2 purchases
		while (this.scheduledUpgrades2.length) {

			let upgradeIndex = this.scheduledUpgrades2[0][0];
			let upgrade;
			switch (upgradeIndex) {
				case 0:
					upgrade = this.b2;
					break;
				case 1:
					upgrade = this.c12;
					break;
				case 2:
					upgrade = this.c22;
					break;
				case 3:
					upgrade = this.c32;
					break;
			}

			let levelBefore = upgrade.level;
			upgrade.buy(1);
			
			if (levelBefore == upgrade.level)
				break;
			
			update = true;
			
			this.scheduledUpgrades2[0][1]--;
			this.scheduledLevels2[upgradeIndex]--;
			if (this.scheduledUpgrades2[0][1] <= 0)
				this.scheduledUpgrades2.shift();

		}
		
		// rho3 purchases
		while (this.scheduledUpgrades3.length) {

			let upgradeIndex = this.scheduledUpgrades3[0][0];
			let upgrade;
			switch (upgradeIndex) {
				case 0:
					upgrade = this.b3;
					break;
				case 1:
					upgrade = this.c23;
					break;
				case 2:
					upgrade = this.c33;
					break;
			}			

			let levelBefore = upgrade.level;
			upgrade.buy(1);
			
			if (levelBefore == upgrade.level)
				break;
			
			update = true;

			this.scheduledUpgrades3[0][1]--;
			this.scheduledLevels3[upgradeIndex]--;
			if (this.scheduledUpgrades3[0][1] <= 0)
				this.scheduledUpgrades3.shift();

		}
		
		if (this.theory.currencies[0].value > this.theory.tauPublished / 1e20) {
			if (this.updateSchedule1()) update = true;
			if (this.updateSchedule2()) update = true;
			if (this.updateSchedule3()) update = true;
		}
		if (update) this.showSchedule();
		
	}
		
	tick(elapsedTime, multiplier) {

		if (!theory.upgrades[this.id].level) return;
		
		buyMilestones();

		if (enablePublications.level && publicationMultiplier(this.theory) > this.pub) {
			game.activeTheory.publish();
			return true;
		}

		this.buy();	
		
		return false;
		
	}
	
}

// Utilizes T4AI (based on T4C3C12rcv) strategy with calculated publication multipliers 
class T4 {
	
	constructor() {	

		this.id = 3;
		this.theory = game.activeTheory;

		this.upgrades = this.theory.upgrades;
		this.c1 = this.upgrades[0];
		this.c2 = this.upgrades[1];
		this.c3 = this.upgrades[2];
		this.q1 = this.upgrades[6];
		this.q2 = this.upgrades[7];

		this.q2weight = 1 / (2 - Math.sqrt(2));

		this.setPub();

		this.ratio = 1 + ((this.q + 1.0) * toBig(2).pow(this.c3.level) / (toBig(2).pow(this.c2.level) * this.getC1));

		this.scheduledUpgrades = [];
		this.scheduledLevels   = [0, 0, 0, 0, 0];

		theory.secondaryEquationHeight = 35;

	}

	get getC1() {
		return Utils.getStepwisePowerSum(this.c1.level, 2, 10, 0).pow(this.theory.milestoneUpgrades[0].level * 0.05 + 1);	
	}

	get q() {
		return parseBigNumber(this.theory.tertiaryEquation.substring(2));
	}

	upgradeByIndex(upgradeIndex) {
		
		let upgrade; 
		switch (upgradeIndex) {
			case 0:
				upgrade = this.c1;
				break;
			case 1:
				upgrade = this.c2;
				break;
			case 2:
				upgrade = this.c3;
				break;
			case 3:
				upgrade = this.q1;
				break;
			case 4:
				upgrade = this.q2;
				break;
		}
		
		return upgrade;
		
	}
	
	updateSchedule() {

		if (this.scheduledUpgrades.length >= 6) return false;

		let veryBigNumber = parseBigNumber("ee999999");
		
		while (this.scheduledUpgrades.length < 6) {

			let k = this.q * toBig(2).pow(this.c3.level) / (toBig(2).pow(this.c2.level) * this.getC1);
			let p = k > 0 ? 1 / k : 1;
			let c1WithWeight = this.c1.cost.getCost(this.c1.level + this.scheduledLevels[0]) * (10 + (this.c1.level % 10) / 2);
			let q1WithWeight = this.q1.cost.getCost(this.q1.level + this.scheduledLevels[3]) * (10 + this.q1.level % 10);
			let c2cost = this.c2.cost.getCost(this.c2.level + this.scheduledLevels[1]);
			let q2cost = this.q2.cost.getCost(this.q2.level + this.scheduledLevels[4]);

			let costs = [
				c1WithWeight < c2cost ? c1WithWeight : veryBigNumber,
				c2cost * k.max(1),
				this.c3.cost.getCost(this.c3.level + this.scheduledLevels[2]) * p,
				q1WithWeight < q2cost ? q1WithWeight : veryBigNumber,
				q2cost * 1.7
			];

			let minCost = [veryBigNumber, null];
			for (let i = 0; i < costs.length; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];

			let upgrade = this.upgradeByIndex(minCost[1]);
			let cost = upgrade.cost.getCost(upgrade.level + this.scheduledLevels[minCost[1]]);
			if (cost >= this.coast)
				break;

			if (minCost[1] != null) {
				this.scheduledLevels[minCost[1]]++;
				let lastUpgrade = this.scheduledUpgrades[this.scheduledUpgrades.length - 1];
				if (lastUpgrade != undefined && lastUpgrade[0] == minCost[1]) 
					lastUpgrade[1]++;
				else
					this.scheduledUpgrades.push([minCost[1], 1]);
			}
			else break;

		}

		return true;

	}

	showSchedule() {
		secondaryEquation = "\\begin{eqnarray}";
		if (this.scheduledUpgrades.length)
			secondaryEquation += "Next\\;upgrades&:& ";
		for (let i = 0; i < Math.min(this.scheduledUpgrades.length, 5); i++){
			if (this.scheduledUpgrades[i][1] > 1)
				secondaryEquation += this.scheduledUpgrades[i][1];
			if (this.scheduledUpgrades[i][0] >= 3)
				secondaryEquation += "q_" + (this.scheduledUpgrades[i][0] - 2);
			else
				secondaryEquation += "c_" + (this.scheduledUpgrades[i][0] + 1) + "^\\ast";
			if (i + 1 < Math.min(this.scheduledUpgrades.length, 5))
				secondaryEquation += ",\\;";
		}
		if (this.scheduledUpgrades.length)
			secondaryEquation += "\\\\";
		secondaryEquation += "term\\;ratio&:& " + this.ratio + "\\end{eqnarray}";
		theory.invalidateSecondaryEquation();
	}
	
	c3Cost(rho) {
		if (rho < 2000)
			return toBig(0);
		return toBig(2.468).pow(((rho / 2000).log2() / Math.log2(2.468)).floor()) * 2000;
	}

	c3CostNext(rho) {
		if (rho < 2000)
			return toBig(2000);		
		return toBig(2.468).pow(((rho / 2000).log2() / Math.log2(2.468)).ceil()) * 2000;
	}

	q2Cost(rho) {
		if (rho < 10000)
			return toBig(0);		
		return toBig(1000).pow(((rho / 10000).log10() / 3).floor()) * 10000;
	}

	setPub() {
		
		let c3Step = 2.468;
		let lastPub = this.theory.tauPublished;
		let threshold = this.q2weight * toBig(1000 / 2.468 ** 8);
		let c3Near;
		let c3Last = this.c3Cost(lastPub);
		if (lastPub / c3Last > 5)
		  c3Last *= 2.468;
		let c3Amount;
		
		let q2Last = this.q2Cost(lastPub);
		while (true) {
		  c3Near = this.c3CostNext(q2Last);
		  if (c3Near > q2Last * threshold && c3Near < q2Last * this.q2weight) {
			c3Amount = ((c3Last / c3Near).log2() / Math.log2(2.468)).round();
			if (
			  c3Amount ==  0 || c3Amount == 10 || c3Amount == 11 || 
			  c3Amount == 19 || c3Amount == 20 || c3Amount == 28 ||
			  c3Amount == 29 || c3Amount == 37 || c3Amount >= 38
			) {
			  break;
			}
		  }
		  q2Last /= 1000;
		}

		let block = 5;     
		let nc3Near = c3Near * 2.468 ** 38;
		let q2Next  = q2Last *    10 ** 15;
		if (nc3Near > q2Next * threshold && nc3Near < q2Next * this.q2weight)
		  block = 4;
	 
		this.pub = c3Near; 
		if (block == 5) {
		  if (c3Amount <= 5)
			this.pub *= 2.468 ** 10;
		  else if (c3Amount <= 14)
			this.pub *= 2.468 ** 19;
		  else if (c3Amount <= 23) 
			this.pub *= 2.468 ** 28;
		  else if (c3Amount <= 32)
			this.pub *= 2.468 ** 37;
		  else 
			this.pub *= 2.468 ** 46;
		} 
		else {
		  if (c3Amount <= 5)
			this.pub *= 2.468 ** 10;
		  else if (c3Amount <= 15)
			this.pub *= 2.468 ** 20;
		  else if (c3Amount <= 24) 
			this.pub *= 2.468 ** 29;
		  else
			this.pub *= 2.468 ** 38;
		}

		if (this.pub < lastPub * 10) { // in case the calculation goes wrong
		  this.pub = lastPub * 80;
		}
		this.pub *= 1.3;

		this.coast = this.pub / 2.468;	
		
	}

	buy() {

		if (this.c1.level && secondaryEquation == "" && this.updateSchedule()) this.showSchedule();

		if (buySkip()) return;
		
		if (this.theory.tau >= this.coast && enablePublications.level) return;

		if (this.theory.currencies[0].value == 0)
			this.c1.buy(1);

		let k = (this.q+1) * toBig(2).pow(this.c3.level) / (toBig(2).pow(this.c2.level) * this.getC1);
		let p = k > 0 ? 1 / k : 1;

		let schedulerRefresh = false;

		
		if (buyMax(this.c3, this.theory.currencies[0].value * k)) schedulerRefresh = true;
		if (buyMax(this.q2, upgradeCost(this.c3) / this.q2weight)) schedulerRefresh = true;
		if (buyMax(this.q1, upgradeCost(this.c3).min(upgradeCost(this.q2)) / 10)) schedulerRefresh = true;
		if (buyMax(this.c2, this.theory.currencies[0].value * p)) schedulerRefresh = true;
		if (buyMax(this.c1, upgradeCost(this.c2) / 10)) schedulerRefresh = true;

		if (!schedulerRefresh && "" + k != "" + this.ratio) 
			this.showSchedule();

		this.ratio = k;

		if (this.theory.currencies[0].value > this.theory.tauPublished / 1e20 && schedulerRefresh) {
			this.scheduledUpgrades = [];
			this.scheduledLevels = [0, 0, 0, 0, 0, 0, 0];
			if (this.updateSchedule()) this.showSchedule();
		}

	}

	tick(elapsedTime, multiplier) {

		if (!theory.upgrades[this.id].level) return;

		buyMilestones();

		if (enablePublications.level && this.theory.tau >= this.pub) {
			game.activeTheory.publish();
			return true;
		}

		this.buy();
		
		return false;
		
	}
	
}

// Utilizes T5AI2 strategy with calculated publication multipliers
class T5 {
	
	constructor() {	
	
		this.id = 4;
		this.theory = game.activeTheory;
		
		this.upgrades = this.theory.upgrades;
		this.q1 = this.upgrades[0];
		this.q2 = this.upgrades[1];
		this.c1 = this.upgrades[2];
		this.c2 = this.upgrades[3];
		this.c3 = this.upgrades[4];

		this.setPub();
		
		this.scheduledUpgrades = [];
		this.scheduledLevels   = [0, 0, 0, 0];
		
		theory.secondaryEquationHeight = 35;
				
	}
			
	get q() {
		return parseBigNumber(this.theory.tertiaryEquation.substring(2)).max(Number.MIN_VALUE);
	}
	
	get getC1() {
		return Utils.getStepwisePowerSum(this.c1.level, 2, 10, 1);
	}
	
	get getC2() {
		return toBig(2).pow(this.c2.level);
	}
	
	get getC3() {
		return toBig(2).pow(this.c3.level * (1 + 0.05 * this.theory.milestoneUpgrades[2].level));
	}

	predictQ(multiplier) {
		
		let vc2 = this.getC2;
		let vc3 = this.getC3;
		let q = this.q;
		let dqPred = (this.getC1 / vc2 * q * (vc3 - q / vc2)) * multiplier;
		
		let qPred = q + dqPred.max(0);
		qPred = qPred.min(vc2 * vc3);
		return qPred;
		
	}

	upgradeByIndex(upgradeIndex) {
		
		let upgrade; 
		switch (upgradeIndex) {
			case 0:
				upgrade = this.q1;
				break;
			case 1:
				upgrade = this.q2;
				break;
			case 2:
				upgrade = this.c2;
				break;
			case 3:
				upgrade = this.c3;
				break;
		}
		
		return upgrade;
		
	}
	
	updateSchedule() {

		if (this.scheduledUpgrades.length >= 6) return false;

		let veryBigNumber = parseBigNumber("ee999999");

		while (this.scheduledUpgrades.length < 6) {

			let costs = [
				this.q1.cost.getCost(this.q1.level + this.scheduledLevels[0]) * (5.5 + ((this.q1.level + this.scheduledLevels[0]) % 10) * 0.35),
				this.q2.cost.getCost(this.q2.level + this.scheduledLevels[1]),
				this.c2.cost.getCost(this.c2.level + this.scheduledLevels[2]),
				this.c3.cost.getCost(this.c3.level + this.scheduledLevels[3])
			];
			if (costs[0] > this.pub * 0.28)
				costs[0] = veryBigNumber;

			let minCost = [veryBigNumber, null];
			for (let i = 0; i < costs.length; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];

			let upgrade = this.upgradeByIndex(minCost[1]);
			let cost = upgrade.cost.getCost(upgrade.level + this.scheduledLevels[minCost[1]]);
			if (cost >= this.coast)
				break;

			if (minCost[1] != null) {
				this.scheduledLevels[minCost[1]]++;
				let lastUpgrade = this.scheduledUpgrades[this.scheduledUpgrades.length - 1];
				if (lastUpgrade != undefined && lastUpgrade[0] == minCost[1]) 
					lastUpgrade[1]++;
				else
					this.scheduledUpgrades.push([minCost[1], 1]);
			}
			else break;

		}

		return true;

	}

	showSchedule() {
		secondaryEquation = "\\begin{eqnarray}";
		if (this.scheduledUpgrades.length)
			secondaryEquation += "Next\\;upgrades&:& ";
		for (let i = 0; i < Math.min(this.scheduledUpgrades.length, 5); i++){
			if (this.scheduledUpgrades[i][1] > 1)
				secondaryEquation += this.scheduledUpgrades[i][1];
			secondaryEquation += this.scheduledUpgrades[i][0] <= 1 ? "q_" + (this.scheduledUpgrades[i][0] + 1) : "c_" + this.scheduledUpgrades[i][0] + "^\\ast";
			if (i + 1 < Math.min(this.scheduledUpgrades.length, 5))
				secondaryEquation += ",\\;";
		}
		if (this.scheduledUpgrades.length)
			secondaryEquation += "\\\\";
		secondaryEquation += "q\\;flip\\;point &:& " + (this.getC3 * this.getC2 * 2 / 3) + "\\end{eqnarray}";
		theory.invalidateSecondaryEquation();
	}
	
	c3CostNext(rho) {
		if (rho < 1000)
			return toBig(1000);		
		return toBig(88550700).pow(((rho / 1000).log2() / Math.log2(88550700)).ceil()) * 1000;
	}
	
	q2Cost(rho) {
		if (rho < 15)
			return toBig(0);
		return toBig(64).pow(((rho / 15).log2() / 6).floor()) * 15;
	}
	
	setPub() {
		
		let lastPub = this.theory.tauPublished;		
		let c3Next = this.c3CostNext(lastPub);
		let q2Near = this.q2Cost(c3Next);  

		let ratio = 9.5;

		while (c3Next / q2Near >= ratio) {
			c3Next *= 88550700;
			q2Near = this.q2Cost(c3Next);
		}

		let counter = 1;
		let c3Prev = c3Next / 88550700;
		let q2NearP = this.q2Cost(c3Prev);       
		while (c3Prev / q2NearP >= ratio && c3Prev > 0) {
			c3Prev /= 88550700;
			q2NearP = this.q2Cost(c3Prev);
			counter++;
		}

		let target = 105;

		let step = (c3Next / (ratio * c3Prev * target)).pow(1 / (counter * 3 - 1));
		this.pub = c3Prev * target;
		while (lastPub * 64 >= this.pub) {
			this.pub *= step;
		}
		
		if (this.pub > c3Next) {
			this.pub = c3Next * target;
		}		
		
		this.coast = this.pub / 2;
		
	}
		
	buy(multiplier) {
		
		if (secondaryEquation == "" && this.updateSchedule()) this.showSchedule();
		
		if (buySkip()) return;
		
		if (this.theory.tau >= this.coast && enablePublications.level) return;

		let schedulerRefresh = false;
		if (buyRatio(this.q1,   100)) schedulerRefresh = true;
		if (buyRatio(this.q2,     4)) schedulerRefresh = true;
		if (buyRatio(this.c1, 10000)) schedulerRefresh = true;
		if (buyRatio(this.c3,     2)) schedulerRefresh = true;

		let c2worth;

		let veryBigNumber = parseBigNumber("ee999999");

		for (let i = 0; i < 40; i++) { // limited with 40 purchases per tick

			c2worth = this.predictQ(multiplier) >= this.getC3 * this.getC2 * 2 / 3;

			let costs = [
				upgradeCost(this.q1) * (5.5 + (this.q1.level % 10) * 0.35),
				upgradeCost(this.q2),
				c2worth ? veryBigNumber : upgradeCost(this.c1) * 2,
				c2worth ? upgradeCost(this.c2) : veryBigNumber,
				upgradeCost(this.c3)
			];
			if (costs[0] > this.pub * 0.28)
				costs[0] = veryBigNumber;

			let minCost = [veryBigNumber, null];
			for (let i = 0; i < costs.length; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];
			if (minCost[1] == null) break;

			let upgrade;
			switch (minCost[1]) {
				case 0:
					upgrade = this.q1;
					break;
				case 1:
					upgrade = this.q2;
					break;
				case 2:
					upgrade = this.c1;
					break;					
				case 3:
					upgrade = this.c2;
					break;
				case 4:
					upgrade = this.c3;
					break;
			}
			
			if (upgradeCost(upgrade) <= this.theory.currencies[0].value) {
				upgrade.buy(1);
				schedulerRefresh = true;
			}
			else break;

		}

		if (this.theory.currencies[0].value > this.theory.tauPublished / 1e20 && schedulerRefresh) {
			this.scheduledUpgrades = [];
			this.scheduledLevels = [0, 0, 0, 0];
			if (this.updateSchedule()) this.showSchedule();
		}

	}
	
	tick(elapsedTime, multiplier) {

		if (!theory.upgrades[this.id].level) return;

		buyMilestones();

		if (enablePublications.level && this.theory.tau >= this.pub) {
			game.activeTheory.publish();
			return true;
		}

		this.buy(multiplier);
		
		return false;
		
	}

}

// Utilizes T6AI strategy with calculated publication multipliers
class T6 {
	
	constructor() {

		this.id = 5;
		this.theory = game.activeTheory;

		this.upgrades = this.theory.upgrades;
		this.q1 = this.upgrades[0];
		this.q2 = this.upgrades[1];
		this.r1 = this.upgrades[2];
		this.r2 = this.upgrades[3];
		this.c1 = this.upgrades[4];
		this.c2 = this.upgrades[5];		
		this.c5 = this.upgrades[8];

		this.setPub();

		this.ratio = (this.getMaxC5 * this.r / 2) / (this.getC1 * this.getC2);

		this.scheduledUpgrades = [];
		this.scheduledLevels   = [0, 0, 0, 0, 0, 0, 0];

		theory.secondaryEquationHeight = 35;

	}

	get getC1() {
		return Utils.getStepwisePowerSum(this.c1.level, 2, 10, 1).pow(1 + this.theory.milestoneUpgrades[3].level * 0.05);
	}

	get getC2() {
		return toBig(2).pow(this.c2.level);
	}

	get maxRho() {
		let max = toBig(0);
		for (let i = 0; i < this.upgrades.length; i++) {
			let upgrade = this.upgrades[i];
			if (upgrade.level) {
				let cost = upgrade.cost.getCost(upgrade.level - 1);
				max = max.max(cost);
			}
		}
		max = max.max(this.theory.currencies[0].value);
		return max;
	}

	get getMaxC5() {
		let rho = this.maxRho;
		if (rho < 15)
			return 0;
		return toBig(2).pow((rho / 15).log2() / Math.log2(3.9));
	}

	get r() {
		let string = this.theory.tertiaryEquation;
		let begin  = string.indexOf("r=");
		let end    = string.indexOf(",", begin);
		return parseBigNumber(string.substring(begin + 2, end)).max(Number.MIN_VALUE);
	}

	upgradeByIndex(upgradeIndex) {
		
		let upgrade; 
		switch (upgradeIndex) {
			case 0:
				upgrade = this.q1;
				break;
			case 1:
				upgrade = this.q2;
				break;
			case 2:
				upgrade = this.r1;
				break;
			case 3:
				upgrade = this.r2;
				break;
			case 4:
				upgrade = this.c1;
				break;
			case 5:
				upgrade = this.c2;
				break;
			case 6:
				upgrade = this.c5;
				break;
		}
		
		return upgrade;
		
	}
	
	updateSchedule() {

		if (this.scheduledUpgrades.length >= 6) return false;

		let veryBigNumber = parseBigNumber("ee999999");
		
		let rHalf = this.r / 2;

		while (this.scheduledUpgrades.length < 6) {

			let k = (this.getMaxC5 * rHalf) / (this.getC1 * this.getC2);
			let c1WithWeight = this.c1.cost.getCost(this.c1.level + this.scheduledLevels[4]) * (8 + this.c1.level % 10);
			let c2Cost = this.c2.cost.getCost(this.c2.level + this.scheduledLevels[5]);
			let q2cost = this.q2.cost.getCost(this.q2.level + this.scheduledLevels[1]);
			let r2cost = this.r2.cost.getCost(this.r2.level + this.scheduledLevels[3]);
			let c2weight = (c2Cost * 2 ** 0.5 > r2cost.min(q2cost)) ? 2 ** 0.5 : 1;

			let costs = [
				this.q1.cost.getCost(this.q1.level + this.scheduledLevels[0]) * (7 + (this.q1.level % 10) / 2),
				q2cost,
				this.r1.cost.getCost(this.r1.level + this.scheduledLevels[2]) * (2 + (this.r1.level % 10) / 4),
				r2cost,
				c1WithWeight < c2Cost ? c1WithWeight : veryBigNumber,
				c2Cost * k.max(1) * c2weight,
				this.c5.cost.getCost(this.c5.level + this.scheduledLevels[6]) / k.max(Number.MIN_VALUE).min(1)
			];

			let minCost = [veryBigNumber, null];
			for (let i = 0; i < costs.length; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];

			let upgrade = this.upgradeByIndex(minCost[1]);
			let cost = upgrade.cost.getCost(upgrade.level + this.scheduledLevels[minCost[1]]);
			if (cost >= this.coast)
				break;

			if (minCost[1] != null) {
				this.scheduledLevels[minCost[1]]++;
				let lastUpgrade = this.scheduledUpgrades[this.scheduledUpgrades.length - 1];
				if (lastUpgrade != undefined && lastUpgrade[0] == minCost[1]) 
					lastUpgrade[1]++;
				else
					this.scheduledUpgrades.push([minCost[1], 1]);
			}
			else break;

		}

		return true;

	}

	showSchedule() {
		secondaryEquation = "\\begin{eqnarray}";
		if (this.scheduledUpgrades.length)
			secondaryEquation += "Next\\;upgrades&:& ";
		for (let i = 0; i < Math.min(this.scheduledUpgrades.length, 5); i++){
			if (this.scheduledUpgrades[i][1] > 1)
				secondaryEquation += this.scheduledUpgrades[i][1];
			if (this.scheduledUpgrades[i][0] <= 1)
				secondaryEquation += "q_" + (this.scheduledUpgrades[i][0] + 1);
			else if (this.scheduledUpgrades[i][0] <= 3)
				secondaryEquation += "r_" + (this.scheduledUpgrades[i][0] - 1);
			else if (this.scheduledUpgrades[i][0] <= 5)
				secondaryEquation += "c_" + (this.scheduledUpgrades[i][0] - 3) + "^\\ast";
			else
				secondaryEquation += "c_5^\\ast";
			if (i + 1 < Math.min(this.scheduledUpgrades.length, 5))
				secondaryEquation += ",\\;";
		}
		if (this.scheduledUpgrades.length)
			secondaryEquation += "\\\\";
		secondaryEquation += "term\\;ratio&:& " + this.ratio + "\\end{eqnarray}";
		theory.invalidateSecondaryEquation();
	}
	
	c5Cost(rho) {
		if (rho < 15)
			return toBig(0);
		return toBig(3.9).pow(((rho / 15).log2() / Math.log2(3.9)).floor()) * 15;
	}

	setPub() {

		let target;
		let lastPub = this.theory.tauPublished.log10().toNumber();

		if (lastPub % 10 < 3) 
		  target = Math.floor(lastPub / 10) * 10 + 7 + Math.log10(3); 
		else if (lastPub % 10 < 6)
		  target = Math.floor(lastPub / 10) * 10 + 11 + Math.log10(5); 
		else
		  target = Math.floor(lastPub / 10) * 10 + 14;

		let c5Near = this.c5Cost(toBig(10).pow(target));
		this.pub   = c5Near * 4.2; 
		this.coast = this.pub / 4;

	}

	buy() {

		if (secondaryEquation == "" && this.updateSchedule()) this.showSchedule();

		if (buySkip()) return;

		if (this.theory.tau >= this.coast && enablePublications.level) return;

		let schedulerRefresh = false;
		if (buyRatio(this.r2,     10)) schedulerRefresh = true;
		if (buyRatio(this.q2,     10)) schedulerRefresh = true;
		if (buyRatio(this.r1,    100)) schedulerRefresh = true;
		if (buyRatio(this.q1,    100)) schedulerRefresh = true;
		if (buyRatio(this.c5,    100)) schedulerRefresh = true;
		if (buyRatio(this.c2,  10000)) schedulerRefresh = true;
		if (buyRatio(this.c1, 100000)) schedulerRefresh = true;

		let rHalf = this.r / 2;

		let veryBigNumber = parseBigNumber("ee999999");
		let k = 1;

		for (let n = 0; n < 50; n++) { // limited with 50 purchases per tick
			
			k = (this.getMaxC5 * rHalf) / (this.getC1 * this.getC2);
			let c1WithWeight = upgradeCost(this.c1) * (8 + this.c1.level % 10);
			let c2Cost = upgradeCost(this.c2);
			let c2weight = (c2Cost * 2 ** 0.5 > upgradeCost(this.r2).min(upgradeCost(this.q2))) ? 2 ** 0.5 : 1;
						
			let costs = [
				upgradeCost(this.q1) * (7 + (this.q1.level % 10) / 2),
				upgradeCost(this.q2),
				upgradeCost(this.r1) * (2 + (this.r1.level % 10) / 4),
				upgradeCost(this.r2),
				c1WithWeight < c2Cost ? c1WithWeight : veryBigNumber,
				c2Cost * k.max(1) * c2weight,
				veryBigNumber, // does not buy c3
				veryBigNumber, // does not buy c4
				upgradeCost(this.c5) / k.max(Number.MIN_VALUE).min(1)
			];
			let minCost = [veryBigNumber, null];
			for (let i = 0; i < 9; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];
			if (minCost[1] != null && upgradeCost(this.upgrades[minCost[1]]) <= this.theory.currencies[0].value) {
				game.activeTheory.upgrades[minCost[1]].buy(1);
				schedulerRefresh = true;
			}
			else break;
		}

		if (!schedulerRefresh && "" + k != "" + this.ratio) 
			this.showSchedule();
		
		this.ratio = k;

		if (this.theory.currencies[0].value > this.theory.tauPublished / 1e20 && schedulerRefresh) {
			this.scheduledUpgrades = [];
			this.scheduledLevels = [0, 0, 0, 0, 0, 0, 0];
			if (this.updateSchedule()) this.showSchedule();
		}

	}
	
	tick(elapsedTime, multiplier) {

		if (!theory.upgrades[this.id].level) return;

		buyMilestones();

		if (enablePublications.level && this.theory.tau >= this.pub) {
			game.activeTheory.publish();
			return true;
		}

		this.buy();
		
		return false;
		
	}	
	
}

// Utilizes T7PlaySpqcey with cyclic corrected multipliers
class T7 {
	
	constructor() {

		this.id = 6;
		this.theory = game.activeTheory;

		this.upgrades = this.theory.upgrades;
		this.q1 = this.upgrades[0];
		this.c1 = this.upgrades[1];	
		this.c2 = this.upgrades[2];		
		this.c3 = this.upgrades[3];	
		this.c4 = this.upgrades[4];
		this.c5 = this.upgrades[5];
		this.c6 = this.upgrades[6];

		this.setPub();

		this.scheduledUpgrades = [];
		this.scheduledLevels   = [0, 0, 0, 0, 0];

		theory.secondaryEquationHeight = 20;

	}
	
	c6CostNext(rho) {
		if (rho < 100)
			return toBig(100);
		return toBig(2.81).pow(((rho / 100).log2() / Math.log2(2.81)).ceil()) * 100;
	}
	
	setPub() {
		
		let lastPub = this.theory.tauPublished;
		let c6Next = this.c6CostNext(lastPub);
		
		c6Next *= 2.81 ** 5;
		this.pub = c6Next * 1.03;
		
		if (this.pub / lastPub < 491) // correction
			this.pub *= 2.81;
			
		this.coast = this.pub / 2;	
		
	}
	
	upgradeByIndex(upgradeIndex) {
		
		let upgrade; 
		switch (upgradeIndex) {
			case 0:
				upgrade = this.q1;
				break;
			case 1:
				upgrade = this.c3;
				break;
			case 2:
				upgrade = this.c4;
				break;
			case 3:
				upgrade = this.c5;
				break;
			case 4:
				upgrade = this.c6;
				break;
		}
		
		return upgrade;
		
	}
	
	updateSchedule() {

		if (this.scheduledUpgrades.length >= 25) return false;

		while (this.scheduledUpgrades.length < 25) {
			
			let costs = [
				this.q1.cost.getCost(this.q1.level + this.scheduledLevels[0]) * 4,
				this.c3.cost.getCost(this.c3.level + this.scheduledLevels[1]) * 10,
				this.c4.cost.getCost(this.c4.level + this.scheduledLevels[2]) * 10,
				this.c5.cost.getCost(this.c5.level + this.scheduledLevels[3]) * 4,
				this.c6.cost.getCost(this.c6.level + this.scheduledLevels[4]),
			];

			let minCost = [parseBigNumber("ee999999"), null];
			for (let i = 0; i < costs.length; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];

			let upgrade = this.upgradeByIndex(minCost[1]);
			let cost = upgrade.cost.getCost(upgrade.level + this.scheduledLevels[minCost[1]]);
			if (cost >= this.coast)
				break;

			if (minCost[1] != null) {
				this.scheduledLevels[minCost[1]]++;
				let lastUpgrade = this.scheduledUpgrades[this.scheduledUpgrades.length - 1];
				if (lastUpgrade != undefined && lastUpgrade[0] == minCost[1]) 
					lastUpgrade[1]++;
				else
					this.scheduledUpgrades.push([minCost[1], 1]);
			}
			else break;

		}	
				
		return true;
		
	}
	
	showSchedule() {
		secondaryEquation = "";
		if (this.scheduledUpgrades.length)
			secondaryEquation = "Next\\ upgrades: ";
		for (let i = 0; i < Math.min(this.scheduledUpgrades.length, 5); i++){
			if (this.scheduledUpgrades[i][1] > 1)
				secondaryEquation += this.scheduledUpgrades[i][1];
			secondaryEquation += (this.scheduledUpgrades[i][0] == 0 ? "q_1" : "c_" + (this.scheduledUpgrades[i][0] + 2));
			if (this.scheduledUpgrades[i][0] == 0 || this.scheduledUpgrades[i][0] == 4) 			
				secondaryEquation += "^\\ast";
			if (i + 1 < Math.min(this.scheduledUpgrades.length, 5))
				secondaryEquation += ",\\;";
		}
		theory.invalidateSecondaryEquation();		
	}
	
	buy() {
				
		if (buySkip()) return;
		
		if (this.theory.tau >= this.coast && enablePublications.level) return;
		
		let q1level = this.q1.level;
		let c6level = this.c6.level;
		
		let schedulerRefresh = false;
		if (buyRatio(this.q1, 10)) schedulerRefresh = true;
		if (buyRatio(this.c3, 20)) schedulerRefresh = true;
		if (buyRatio(this.c4, 20)) schedulerRefresh = true;
		if (buyRatio(this.c5, 10)) schedulerRefresh = true;
		if (buyRatio(this.c6,  2)) schedulerRefresh = true;

		if (schedulerRefresh) {
			this.scheduledUpgrades = [];
			this.scheduledLevels   = [0, 0, 0, 0, 0];
		}

		let bought = false;

		while (this.scheduledUpgrades.length) {

			let upgradeIndex = this.scheduledUpgrades[0][0];
			let upgrade = this.upgradeByIndex(upgradeIndex);

			let levelBefore = upgrade.level;
			upgrade.buy(1);
			
			if (levelBefore == upgrade.level)
				break;

			bought = true;

			this.scheduledUpgrades[0][1]--; 
			this.scheduledLevels[upgradeIndex]--;
			if (this.scheduledUpgrades[0][1] <= 0)
				this.scheduledUpgrades.shift();

		}

		if (this.theory.currencies[0].value < this.theory.tauPublished / 1e20) return;

		if (this.updateSchedule() || bought) this.showSchedule();

		if (this.theory.currencies[0].value < this.theory.tauPublished / 1e11) return;
		if (this.theory.currencies[0].value * 4 >= upgradeCost(this.c6)) return;

		if (q1level < this.q1.level || c6level < this.c6.level) {
			this.upgrades[1].buy(-1);
			this.upgrades[2].buy(-1);
		}

	}
	
	tick(elapsedTime, multiplier) {

		if (!theory.upgrades[this.id].level) return;

		buyMilestones();

		if (enablePublications.level && this.theory.tau >= this.pub) {
			game.activeTheory.publish();
			return true;
		}

		this.buy();
		
		return false;
		
	}	
	
}

// Utilizes T8PlaySolarswap strategy with calculated publication multipliers
class T8 {
	
	constructor() {
		
		this.id = 7;
		this.theory = game.activeTheory;
		
		this.upgrades = this.theory.upgrades;
		this.c1 = this.upgrades[0];
		this.c2 = this.upgrades[1];
		this.c3 = this.upgrades[2];	
		this.c4 = this.upgrades[3];
		this.c5 = this.upgrades[4];
						
		this.setPub();
				
		this.resetAttractor();
		
		this.scheduledUpgrades = [];
		this.scheduledLevels   = [0, 0, 0, 0, 0];
				
		theory.secondaryEquationHeight = 20;
				
	}
	
	c2CostNext(rho) {
		if (rho < 20)
			return toBig(20);
		return toBig(64).pow(((rho / 20).log2() / Math.log2(64)).ceil()) * 20;
	}
	
	c4Cost(rho) {
		if (rho < 100)
			return toBig(0);
		return toBig(5 ** 1.15).pow(((rho / 100).log2() / Math.log2(5 ** 1.15)).floor()) * 100;
	}
		
	setPub() {
		
		let lastPub = this.theory.tauPublished;
		let c4Step = 5 ** 1.15;
		let c4Last = this.c4Cost(lastPub); 
		let c2NearC4 = this.c2CostNext(c4Last);  

		let coef = c2NearC4 / c4Last > 7 ? 3 : 4; 
		this.pub = c4Last * c4Step ** coef * 1.1;
		this.coast = this.pub / 4;
		
	}
	
	updateSchedule() {

		if (this.scheduledUpgrades.length >= 25) return false;

		while (this.scheduledUpgrades.length < 25) {
			
			let costs = [
				this.c1.cost.getCost(this.c1.level + this.scheduledLevels[0]) * (5.5 + ((this.c1.level + this.scheduledLevels[0]) % 10) / 1.5),
				this.c2.cost.getCost(this.c2.level + this.scheduledLevels[1]),
				this.c3.cost.getCost(this.c3.level + this.scheduledLevels[2]) * 4,
				this.c4.cost.getCost(this.c4.level + this.scheduledLevels[3]) * 1.3,
				this.c5.cost.getCost(this.c5.level + this.scheduledLevels[4]) * 2.5,
			];
			let minCost = [parseBigNumber("ee999999"), null];
			for (let i = 0; i < costs.length; i++)
				if (costs[i] < minCost[0])
					minCost = [costs[i], i];
			let cost = this.upgrades[minCost[1]].cost.getCost(this.upgrades[minCost[1]].level + this.scheduledLevels[minCost[1]]);
			if (cost >= this.coast)
				break;
			if (minCost[1] != null) {
				this.scheduledLevels[minCost[1]]++;
				let lastUpgrade = this.scheduledUpgrades[this.scheduledUpgrades.length - 1];
				if (lastUpgrade != undefined && lastUpgrade[0] == minCost[1]) 
					lastUpgrade[1]++;
				else
					this.scheduledUpgrades.push([minCost[1], 1]);
			}

		}	
		
		return true;
		
	}
	
	showSchedule() {
		secondaryEquation = "";
		if (this.scheduledUpgrades.length)
			secondaryEquation = "Next\\ upgrades: ";
		for (let i = 0; i < Math.min(this.scheduledUpgrades.length, 5); i++){
			if (this.scheduledUpgrades[i][1] > 1)
				secondaryEquation += this.scheduledUpgrades[i][1];
			secondaryEquation += "c_" + (this.scheduledUpgrades[i][0] + 1);
			if (i + 1 < Math.min(this.scheduledUpgrades.length, 5))
				secondaryEquation += ", ";
		}
		theory.invalidateSecondaryEquation();		
	}
	
	buy() {

		if (buySkip()) return;

		if (this.theory.tau >= this.coast && enablePublications.level) return;

		let schedulerRefresh = false;

		if (buyRatio(this.c1, 25)) schedulerRefresh = true;
		if (buyRatio(this.c2,  2)) schedulerRefresh = true;
		if (buyRatio(this.c3, 10)) schedulerRefresh = true; 
		if (buyRatio(this.c4,  3)) schedulerRefresh = true;
		if (buyRatio(this.c5,  5)) schedulerRefresh = true;

		if (schedulerRefresh) {
			this.scheduledUpgrades = [];
			this.scheduledLevels   = [0, 0, 0, 0, 0];
		}

		let bought = false;

		while (this.scheduledUpgrades.length) {

			let upgradeIndex = this.scheduledUpgrades[0][0];

			let levelBefore = this.upgrades[upgradeIndex].level;
			game.activeTheory.upgrades[upgradeIndex].buy(1);
			
			if (levelBefore == this.upgrades[upgradeIndex].level)
				break;

			bought = true;

			this.scheduledUpgrades[0][1]--;
			this.scheduledLevels[upgradeIndex]--;
			if (this.scheduledUpgrades[0][1] <= 0)
				this.scheduledUpgrades.shift();

		}
		
		if (this.theory.currencies[0].value > this.theory.tauPublished / 1e20 && (this.updateSchedule() || bought)) this.showSchedule();

	}		
	
	resetAttractor() {
		this.timer = 0;
		game.activeTheory.milestoneUpgrades[0].refund(-1);
		game.activeTheory.milestoneUpgrades[0].buy(-1);
	}
	
	tick(elapsedTime, multiplier) {

		if (!theory.upgrades[this.id].level) return;

		buyMilestones();

		if (enablePublications.level && this.theory.tau >= this.pub) {
			game.activeTheory.publish();
			return true;
		}

		this.timer++;
		if (this.timer >= 335 && enableMSPurchase.level)
			this.resetAttractor();

		this.buy();
		
		return false;
		
	}	
	
}

class UIutils {
	
	static createLatexButton(header, variable, id = -1) {
		
		let labelLeft = ui.createLatexLabel({
			text: header + ": ",
			horizontalTextAlignment: TextAlignment.START,
			verticalTextAlignment: TextAlignment.CENTER,
			textColor: variable.level == 1 ? Color.TEXT : Color.TEXT_MEDIUM,
			column: 0
		});
		
		let labelRight = ui.createLabel({
			text: variable.level == 1 ? "✓" : "✗",
			horizontalTextAlignment: TextAlignment.CENTER,
			verticalTextAlignment: TextAlignment.START,
			textColor: variable.level == 1 ? Color.TEXT : Color.TEXT_MEDIUM,
			fontSize: 28
		});
		
		let frameRight = ui.createFrame({
			padding: Thickness(0, 0, 0, 5),
			verticalOptions: LayoutOptions.CENTER,
			content: labelRight,
			borderColor: Color.TRANSPARENT,
			column: 1
		});
		
		let grid = ui.createGrid({
			columnDefinitions: ["1*", 25],
			children: [labelLeft, frameRight]
		});
		
		let buttonFrame = ui.createFrame({
			padding: Thickness(10, 2, 10, 2),
			verticalOptions: LayoutOptions.CENTER,
			content: grid,
			borderColor: variable.level == 1 ? Color.MINIGAME_TILE_BORDER : Color.BORDER
		});
		
		buttonFrame.onTouched = (touchEvent) => {
			if (touchEvent.type == TouchType.SHORTPRESS_RELEASED || touchEvent.type == TouchType.LONGPRESS_RELEASED) {
				
				variable.level = (variable.level + 1) % 2;
				if (id >= 0 && game.theories[id].tau.log10() < requirements[id]) {
					variable.level = 0;
					timer = 5;
					primaryEquation = "Theory\\; " + (id + 1) + "\\; requires\\; " + requirements[id] + "\\; " + game.theories[id].latexSymbol;
					theory.invalidatePrimaryEquation();
				}
				
				if (!variable.level && (game.activeTheory?.id == id || variable == enableVariablePurchase)) {
					secondaryEquation = "";
					theory.invalidateSecondaryEquation();
				}
				
				labelRight.text = variable.level == 1 ? "✓" : "✗";
				labelLeft.textColor = variable.level == 1 ? Color.TEXT : Color.TEXT_MEDIUM;
				labelRight.textColor = variable.level == 1 ? Color.TEXT : Color.TEXT_MEDIUM;
				buttonFrame.borderColor = variable.level == 1 ? Color.MINIGAME_TILE_BORDER : Color.BORDER;
				
			}
		}
		
		return buttonFrame;
		
	}
	
	static createTheorySwitchButton() {
		
		let labelLeft = ui.createLatexLabel({
			text: "Switch the theory now",
			horizontalTextAlignment: TextAlignment.START,
			verticalTextAlignment: TextAlignment.CENTER,
			textColor: Color.TEXT
		});
		
		let labelRight = ui.createLabel({
			horizontalTextAlignment: TextAlignment.CENTER,
			verticalTextAlignment: TextAlignment.START,
			textColor: Color.TEXT,
			fontSize: 28
		});
		
		let frameRight = ui.createFrame({
			padding: Thickness(0, 0, 0, 5),
			verticalOptions: LayoutOptions.CENTER,
			content: labelRight,
			borderColor: Color.TRANSPARENT,
			column: 1
		});
		
		let grid = ui.createGrid({
			columnDefinitions: ["1*", 25],
			children: [labelLeft, frameRight]
		});
		
		let buttonFrame = ui.createFrame({
			padding: Thickness(10, 2, 10, 2),
			verticalOptions: LayoutOptions.CENTER,
			content: grid,
			borderColor: Color.MINIGAME_TILE_BORDER
		});
		
		buttonFrame.onTouched = (touchEvent) => {
			if (touchEvent.type == TouchType.SHORTPRESS_RELEASED || touchEvent.type == TouchType.LONGPRESS_RELEASED) {
				buttonFrame.borderColor = Color.MINIGAME_TILE_BORDER;
				switchTheory(true);
			}
			else if (touchEvent.type == TouchType.PRESSED || touchEvent.type == TouchType.LONGPRESS) {
				buttonFrame.borderColor = Color.BORDER;
			}
		}
		
		return buttonFrame;
		
	}
	
}

var getUpgradeListDelegate = () => {
		
	let performTheorySwitchButton = UIutils.createTheorySwitchButton();
	
	let height = ui.screenHeight * 0.055;
		
	let performTheorySwitchGrid = ui.createGrid({
		rowDefinitions: [height],
		children: [performTheorySwitchButton]
	})
			
	let enableVariablePurchaseButton = UIutils.createLatexButton("Variable purchase", enableVariablePurchase);
	enableVariablePurchaseButton.row = 0;
	enableVariablePurchaseButton.column = 0;
	
	let enableMSPurchaseButton = UIutils.createLatexButton("Milestone purchase", enableMSPurchase);
	enableMSPurchaseButton.row = 0;
	enableMSPurchaseButton.column = 1;
	
	let enablePublicationsButton = UIutils.createLatexButton("Publications", enablePublications);
	enablePublicationsButton.row = 1;
	enablePublicationsButton.column = 0;
	
	let enableTheorySwitchButton = UIutils.createLatexButton("Theory switch", enableTheorySwitch);
	enableTheorySwitchButton.row = 1;
	enableTheorySwitchButton.column = 1;

    let topGrid = ui.createGrid({
		columnSpacing: 3,
		rowSpacing: 3,
		rowDefinitions: [height, height],
		children: [
			enableVariablePurchaseButton, 
			enableMSPurchaseButton, 
			enablePublicationsButton,
			enableTheorySwitchButton
		]
    });
	
	buttonArray = [];
	for (let i = 0; i < 8; i++) {
		let newButton = UIutils.createLatexButton("Theory " + (i + 1), theory.upgrades[i], i);
		newButton.row = i % 4;
		newButton.column = Math.floor(i / 4);
		buttonArray.push(newButton);	
	}
	
    let bottomGrid = ui.createGrid({
		columnSpacing: 3,
		rowSpacing: 3,
		rowDefinitions: [height, height, height, height],
		children: buttonArray
    });
	
	let scrollView = ui.createScrollView({
		content: bottomGrid
	})
	
	let separator = ui.createBox({
		heightRequest: 1
	});
			
    let stack = ui.createStackLayout({
		padding: Thickness(0, 3, 0, 0),
		spacing: 3,
        children: [
			performTheorySwitchGrid, topGrid, separator, scrollView
        ]
    });    
			
	return stack;
	
}
 
var	isCurrencyVisible = index => false;

var tick = (elapsedTime, multiplier) => {

	if (game.activeTheory?.id === 8) return;

	if (game.activeTheory !== null) {
		if (game.activeTheory.id !== theoryManager?.id || game.activeTheory.currencies[0].value == 0)
			refreshTheoryManager();
		if (theoryManager.tick(elapsedTime, multiplier))
			switchTheory();
	}
	
	if (timer > 0) {
		timer -= Math.max(0, elapsedTime);
		if (timer <= 0) {
			primaryEquation = "";
			theory.invalidatePrimaryEquation();
		}
	}
	
	let newR8 = game.researchUpgrades[7].level;
	let newR9 = getR9();
	if (R8 !== newR8 || R9 !== newR9) {
		R8 = newR8;
		R9 = newR9;
		theory.invalidateQuaternaryValues();
	}
	
}

// creating theory settings
{

	fictitiousCurrency = theory.createCurrency();

	// Theory on/off upgrades
	for (let i = 0; i < 8; i++)
		theory.createUpgrade(i, fictitiousCurrency, new FreeCost);

	enableVariablePurchase = theory.createUpgrade(8, fictitiousCurrency, new FreeCost);

	enableMSPurchase = theory.createUpgrade(9, fictitiousCurrency, new FreeCost);

	enablePublications = theory.createUpgrade(10, fictitiousCurrency, new FreeCost);

	enableTheorySwitch = theory.createUpgrade(11, fictitiousCurrency, new FreeCost);
	
}

refreshTheoryManager(); // creating theory manager on initialization