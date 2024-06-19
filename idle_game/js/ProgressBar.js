export default class ProgressBar {
    constructor(barElementId, labelElementId) {
        this.barElement = document.getElementById(barElementId);
        this.labelElement = document.getElementById(labelElementId);
        this.interval = null;
        this.initialTime = 15000;
        this.timeLeft = this.initialTime;
    }

    render() {
        let progressPercentage = (1 - (this.timeLeft / this.initialTime)) * 100;
        let progress = (this.initialTime-(this.timeLeft+0.25)).toFixed(2);

        if (this.barElement) {
            this.barElement.style.width = progressPercentage + '%';
        }
        if (this.labelElement) {
            this.labelElement.innerHTML = progress + 's/' + this.initialTime.toFixed(1)+'s';
            // this.labelElement.innerText = this.timeLeft.toFixed(1) + 's/' + this.initialTime.toFixed(1)+'s';
            console.log(this.labelElement.innerHTML)
        }
    }

    tick() {
        this.timeLeft -= 0.25; // Decrement by 0.01 for smoother update
        if (this.timeLeft < 0) {
            this.timeLeft = this.initialTime; // Reset the time
        }

        this.render(); // Updates HTML
    }

    start(duration) {
        this.initialTime = duration;
        this.timeLeft = this.initialTime-0.250;
        clearInterval(this.interval); // Clear any existing intervals
        this.interval = setInterval(() => this.tick(), 250); // Call tick every 10ms
        this.render();
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
        if (this.barElement) {
            this.barElement.style.width = '0%';
        }
        if (this.labelElement) {
            this.labelElement.innerText = '';
        }
    }
}
