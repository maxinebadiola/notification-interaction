let currentScore = 0;
let gameRunning = false;
let notificationTriggered = false;
let scoreText;

/*****************************************************************************************/
/*IMPORTANT DO NOT MOVE: BOTH FUNCTIONS MUST BE GLOBAL*/

//FOOTER FUNCTIONS -> Display what score notif will appear, [type of notif]

//update footer information
function updateFooterInfo(scoreToSpawn, comboToSpawn) {
    const footerInfo = document.getElementById("footerInfo");
    footerInfo.innerHTML = `<p>Next notification will spawn at score: ${scoreToSpawn}</p>`;
    // footerInfo.innerHTML += `<p>Next notification combination: ${comboToSpawn.color} - ${comboToSpawn.category}</p>`;
    //above is no longer accurate -> truncated
}
//retrieve current score via SVG inner HTML
function extractScoreFromFooter() {
    const footerInfo = document.getElementById('footerInfo');
    const paragraphText = footerInfo.getElementsByTagName('p')[0].innerHTML;
    const scoreToSpawn = parseInt(paragraphText.split(': ')[1]);
    return scoreToSpawn;
}
/**************************************************************************************** */

//control func
const startGame = () => {
    const sleep = m => new Promise(r => setTimeout(r, m));
    const maxScore = 8; //max score (simon says)

    const oneSixteenth = (Math.PI * 2) / 16;
    const centerX = 200, centerY = 200;
    const circleRadius = 200;
    const quarterRadius = 170;
    const centralCircleRadius = 80;
    const distance = 10;
    const brightnessFactor = 2;
    const cpuMilliseconds = 200,
          userMilliseconds = 100;

    //audio 
    const loadSound = function (source) {
        const sound = document.createElement("audio");
        sound.src = source;
        sound.setAttribute("preload", "auto");
        sound.setAttribute("controls", "none");
        sound.style.display = "none";
        document.body.appendChild(sound);
        return sound;
    };


    //sound files
    const soundTopLeft = loadSound("sound/1.mp3"), //green
         soundTopRight = loadSound("sound/2.mp3"), //red
          soundBottomLeft = loadSound("sound/3.mp3"), //yellow
          soundBottomRight = loadSound("sound/4.mp3"); //blue


    let canPlay = false;
    let counter = 0;
    let score = 0;
    let sequence = [];

    //colors
    const green = d3.color("#1B5E20"),
          red = d3.color("#B71C1C"),
          yellow = d3.color("#F9A825"),
          blue = d3.color("#0D47A1"),
          black = d3.color("#212121");

    /** SVG VARIABLES (for simon says visuals) */
    const backgroundCircle = d3.arc()
        .innerRadius(0)
        .outerRadius(circleRadius)
        .startAngle(0)
        .endAngle(Math.PI * 2);

    const centralCircle = d3.arc()
        .innerRadius(0)
        .outerRadius(centralCircleRadius)
        .startAngle(0)
        .endAngle(Math.PI * 2);

    const $svg = d3.select("#gameContainer")
        .append("svg")
        .attr('width', 400)
        .attr('height', 400);

    $svg.append("g")
        .attr("transform", `translate(${centerX},${centerY})`)
        .append("path")
        .attr("d", backgroundCircle)
        .attr("fill", black);

    const topLeft = $svg.append("g")
        .attr("transform", `translate(${centerX - distance},${centerY - distance})`)
        .attr("class", "button")
        .append("path")
        .attr("d",
            d3.arc()
                .innerRadius(0)
                .outerRadius(quarterRadius)
                .startAngle(oneSixteenth * 12)
                .endAngle(oneSixteenth * 16)
        )
        .attr("fill", green);

    const topRight = $svg.append("g")
        .attr("transform", `translate(${centerX + distance},${centerY - distance})`)
        .attr("class", "button")
        .append("path")
        .attr("d",
            d3.arc()
                .innerRadius(0)
                .outerRadius(quarterRadius)
                .startAngle(0)
                .endAngle(oneSixteenth * 4)
        )
        .attr("fill", red);

    const bottomLeft = $svg.append("g")
        .attr("transform", `translate(${centerX - distance},${centerY + distance})`)
        .attr("class", "button")
        .append("path")
        .attr("d",
            d3.arc()
                .innerRadius(0)
                .outerRadius(quarterRadius)
                .startAngle(oneSixteenth * 8)
                .endAngle(oneSixteenth * 12)
        )
        .attr("fill", yellow);

    const bottomRight = $svg.append("g")
        .attr("transform", `translate(${centerX + distance},${centerY + distance})`)
        .attr("class", "button")
        .append("path")
        .attr("d",
            d3.arc()
                .innerRadius(0)
                .outerRadius(quarterRadius)
                .startAngle(oneSixteenth * 4)
                .endAngle(oneSixteenth * 8)
        )
        .attr("fill", blue);

    $svg.append("g")
        .attr("transform", `translate(${centerX},${centerY})`)
        .append("path")
        .attr("d", centralCircle)
        .attr("fill", black);

        scoreText = $svg.append("text")
        .attr("transform", `translate(${centerX},${centerY})`)
        .attr("fill", "#ffffff")
        .attr("font-size", 30)
        .attr("font-weight", "bold")
        .attr("font-family", "Courier")
        .style("text-anchor", "middle")
        .style("dominant-baseline", "central")
        .text("0");

    //SIMON SAYS GAMEPLAY FUNCTIONS 

    const toggleButton = async (button, duration) => {
        canPlay = false;
        const currentColor = button.attr("fill");
        let soundToPlay;
        if (compareButtons(button, topLeft)) {
            soundToPlay = soundTopLeft;
        } else if (compareButtons(button, topRight)) {
            soundToPlay = soundTopRight;
        } else if (compareButtons(button, bottomLeft)) {
            soundToPlay = soundBottomLeft;
        } else {
            soundToPlay = soundBottomRight;
        }
        soundToPlay.currentTime = 0;
        await soundToPlay.play();
        button.attr("fill", d3.color(currentColor).brighter(brightnessFactor));
        await sleep(duration);
        button.attr("fill", d3.color(currentColor));
        await sleep(duration);
        await soundToPlay.pause();
        canPlay = true;
    };

    const playSequence = async sequence => {
        for (const button of sequence) {
            await toggleButton(button, cpuMilliseconds);
        }
    };

    const buttons = [topLeft, topRight, bottomLeft, bottomRight];
    const getRandomFromArr = arr => arr[Math.floor(Math.random() * arr.length)]; //select random button
    const addToSequence = sequence => sequence.push(getRandomFromArr(buttons)); //add to seq

    //game func
    const compareButtons = (button, otherButton) => {
        return button.attr("fill") === otherButton.attr("fill");
    };
    const compareUserSequenceWithOriginal = (originalSequence, userButton, index) => {
        return compareButtons(originalSequence[index], userButton);
    };

    const updateScoreDisplay = score => {
        scoreText.text(score.toString());
        currentScore = score;
        getScore(score);
    };
    
    const resetGame = () => {
        sequence = [];
        canPlay = false;
        counter = score = 0;
        updateScoreDisplay(score);
    };

    const enableStartButton = () => {
        const startButton = document.getElementById("start");
        startButton.disabled = false;
    };

    // Event listener for button clicks
    buttons.forEach(button => {
        button.on("click", async () => {
            if (!canPlay) {
                console.log("You cannot play.");
                return;
            }
            canPlay = false;
            const isCorrect = compareUserSequenceWithOriginal(sequence, button, counter);
            //ADDED March 17 - End the game when all notifications spawned.
            const comboToSpawn = selectNotificationCombo();
            if(comboToSpawn)
            {
                if (isCorrect) {
                    await toggleButton(button, userMilliseconds);
                    if (counter >= sequence.length - 1) {
                        score++;
                        updateScoreDisplay(score);
    
                        //ADDED: check if score = score to spawn notif
                        if (score === extractScoreFromFooter()) {
                            //const comboToSpawn = selectNotificationCombo();
                            displayNotification(comboToSpawn);
                        }
                        
                        //ADDED: check if user has reached max score
                        if (score === maxScore) {
                            alert(`Congratulations! You reached the max score of ${maxScore}.`);
                            resetGame();
                            //updateAdminPage(); //update notif logs
                            enableStartButton(); //reenable start btn
                        } else {
                            await sleep(500);
                            await cpuTurn();
                        }
                    } else {
                        counter++;
                    }
                    canPlay = true;
                } else {
                    alert(`You Lost! Your score was ${score}. \nTry again?`);
                    resetGame(); //reset game
                    enableStartButton(); //reenable start btn
                }
            } 
        });
    });

    // Function for the CPU's turn
    const cpuTurn = async () => {
        canPlay = false;
        addToSequence(sequence);
        await playSequence(sequence);
        counter = 0;
        canPlay = true;
    };

   // Start button event listener
    const startButton = document.getElementById("start");
    startButton.addEventListener("click", () => {
        startButton.disabled = true;
        resetGame();
        cpuTurn();
        gameRunning = true; // Set the game as running when a new game starts
        startNotificationSystem(); // Start the notification system when a new game starts
    });

};
