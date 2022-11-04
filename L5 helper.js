var init = () => {
	while(true) {
		buy(2,-1, false);
	}

}

var tick = (elapsedTime, multiplier) => {
	for (let i = 0; i < 1000; i++) {
		buy(2,-1, false);
	}
}