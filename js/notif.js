let notificationTimeout //when notif will expire
let currentCombo; //current notif being displayed (color/category)
let notificationBehaviour; //notif behaviour (timeout behaviour/allows stacking)
let scoreQueue = [];
let tempScore = 0;
let scoreCounter = 0;

//Notif Variables (REMOVED: Orange, Yellow, Purple)
const colors = ["Red", "Green", "Blue" ];
const categories = ["Emergency", "Work", "Social"];

const notificationCombinations = []; //to be printed for "notif log"

function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

// all possible notif combinations
// Variable Overview
//     1. interactionTime 
//     - (Date.now() - notificationDisplayTime) / 1000;
//     - calculated and updated via function calculateInteractionTime(combo)
//     2. notificationDisplayTime 
//     - timestamp when notif was displayed 
//     3. isDisplayed
//     - Boolean, if notif is being displayed 
for (const color of colors) {
    for (const category of categories) {
        notificationCombinations.push
        ({  color, category, status: "NAN", interactionTime: -1.0, 
            notificationDisplayTime: -1.0, isDisplayed: false 
        });
    }
}

//UPDATED: Now STATIC, 1 header/body for each category
const notificationPairs = {
    "emergency": [
        {"header": "Earthquake Alert: Seek Shelter", "body": "NDRRMC: (1:25PM,13Mar24)<br>Isang Magnitude 7.3 na lindol ang naganap kaninang 1:05PM.<br> Aftershocks ay inaasahan."},
    ],    
    "social": [
        {"header": "Facebook Messenger", "body": "John Doe sent you a friend request."},
    ],
    "work": [ //STUDENT
        {"header": "Canvas Student", "body": "New Assignment: [Problem Set] Cache Memory Analysis: <br> [1232_CSARCH2_S11]"},
    ]
};

// TODO: gets current combo of the function
function getCurrCombo(target) {
  console.log({ color: target.dataset.color, category: target.dataset.category });
  return { color: target.dataset.color, category: target.dataset.category };
}
//random number between 3-6 (score at which notif will spawn)
function notificationScoreSpawn() {
   return Math.floor(Math.random() * 4) + 3;

}
//generates random sequence in which notifications will spawn (based on CUMULATIVE session score)
function generateRandomSequence() {
  let numList = []
  // number ranges
  const min = 2;
  const max = 4;
  let adderNum; // ranges between 3-6
  let startingRandNum = 0;

  for (let i = 0; i < 18-1; i++) {
    // generating a random number between 3-6
    adderNum = Math.floor(Math.random() * (max - min + 1)) + min;
    startingRandNum += adderNum;
    //adding to that difference
    numList.push(startingRandNum);
  }
  console.log(numList);
  return numList;
}

// prepares to create a new notification
function spawningNewNotification() {
  let scoreToSpawn = scoreQueue.shift();
  let comboToSpawn = selectNotificationCombo();
  console.log(scoreQueue)
  updateFooterInfo(scoreToSpawn, comboToSpawn);
}
//extract score from SVG
const getCurrentScore = () => {
   const scoreTextElement = document.getElementById("scoreText");
   if (scoreTextElement) {
       const currentScore = parseInt(scoreTextElement.textContent, 10);
       return isNaN(currentScore) ? 0 : currentScore;
   } else {
       return 0;
   }
};

//selects notif combo to be displayed next + check if data collection is complete
function selectNotificationCombo() {
   //selected notif must be unencountered (isDisplayed = false)
   const unencounteredCombinations = notificationCombinations.filter(combo => combo.isDisplayed === false);
   const uninteractedCombinations = notificationCombinations.filter(combo => combo.status === "NAN");
   console.log("unencounteredCombinations ", unencounteredCombinations.length);
   console.log("uninteractedCombinations ", uninteractedCombinations.length);
   //if all notifs have been displayed, export results
   if (unencounteredCombinations.length === 0 && uninteractedCombinations.length === 0) {
        exportResults();
        alert("Data collection is complete, your results are being downloaded. Please refresh the page to start the experiment again.")
        return; 
   }
   if (unencounteredCombinations.length === 0) {
    return;
   }
   const randomIndex = Math.floor(Math.random() * unencounteredCombinations.length);
   const selectedCombo = unencounteredCombinations[randomIndex];
   return { color: selectedCombo.color, category: selectedCombo.category };
   //returns { color: "red", category: "emergency" }; 
}

//select notification behaviour for data collection
function setNotificationBehaviour(value, behaviour) {
    notificationBehaviour = value;
    document.getElementById("chosenBehaviour").textContent = behaviour;
    document.getElementById("behaviourModal").style.display = "none";
}

//notif behaviour modal
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("behaviourModal").style.display = "block";

    document.getElementById("urgentButton").addEventListener("click", function() {
        setNotificationBehaviour(0, "Urgent");
    });

    document.getElementById("nonUrgentButton").addEventListener("click", function() {
        setNotificationBehaviour(1, "Non-Urgent");
    });
});

//display notifs
function displayNotification(combo) {
   currentCombo = combo
   console.log("displayNotification called");
   console.log(`Displaying notification - combo: ${JSON.stringify(combo)}`);

  
   if (notificationBehaviour == 0) {
    const pair = getRandomNotificationPair(combo.category.toLowerCase());
    const notificationContainer = document.getElementById('notificationContainer');
    notificationContainer.innerHTML = '';

    //notif chunk
    const notification = document.createElement("div");
    notification.className = "notification-box";
    notification.style.backgroundColor = combo.color.toLowerCase(); // Set the background color

    notification.setAttribute("data-color", combo.color);
    notification.setAttribute("data-category", combo.category);

    notification.innerHTML = `
        <div class="notification-header" style="color: white; font-size: 20px; font-weight: bold;">${pair.header}</div>
        <div class="notification-content" style="color: white;">${pair.body}</div>
        <button class="accept-btn">Accept</button>
        <button class="dismiss-btn">Dismiss</button>
    `;

    notificationContainer.appendChild(notification);
    notificationContainer.style.display = "block";

    //NEW: Get time when notification is displayed 
      notificationDisplayTime = Date.now();

    //10s timeout
    notificationTimeout = setTimeout(() => {
        hideNotification();
        updateComboStatus(combo, "ignored");
    }, 10000);
   }
   else if (notificationBehaviour == 1) {
    const pair = getRandomNotificationPair(combo.category.toLowerCase());
    const notificationContainer = document.getElementById('notificationContainer');

    //notif chunk
    const notification = document.createElement("div");
    notification.className = "notification-box";
    notification.style.backgroundColor = combo.color.toLowerCase(); // Set the background color
    // set combo properties as data attributes
    notification.setAttribute("data-color", combo.color);
    notification.setAttribute("data-category", combo.category);

    notification.innerHTML = `
        <div class="notification-header" style="color: white; font-size: 20px; font-weight: bold;">${pair.header}</div>
        <div class="notification-content" style="color: white;">${pair.body}</div>
        <button class="accept-btn">Accept</button>
        <button class="dismiss-btn">Dismiss</button>
    `;

    notificationContainer.prepend(notification);
    notificationContainer.style.display = "block";

    //NEW: Get time when notification is displayed 
    //10s timeout
    notificationTimeout = setTimeout(() => {
        updateComboStatus(combo, "ignored");
    }, 10000);
   }
   
   //UPDATED: Get time when notification is displayed ->  Update notificationDisplayTime
   const comboIndex = notificationCombinations.findIndex(c => c.color.toLowerCase() === combo.color.toLowerCase() && c.category.toLowerCase() === combo.category.toLowerCase());
   if (comboIndex !== -1) {
      notificationCombinations[comboIndex].notificationDisplayTime = Date.now();
   }
   //NEW: Set isDisplayed to true
    notificationCombinations[comboIndex].isDisplayed = true;

   // update footer and prepare the next new notification
   spawningNewNotification();
}



//hide notif
function hideNotification() {
  const notificationContainer = document.getElementById("notificationContainer");
  notificationContainer.style.display = "none";
}

function clickedNotification(target) {
  const notificationContainer = document.getElementById("notificationContainer");
  console.log("clickedNotification");
  // console.log(notificationContainer.firstElementChild.innerHTML);
  // notificationContainer.firstElementChild.remove();
  target.remove();
}

//Update Combo Status
function updateComboStatus(combo, status) {
   const comboIndex = notificationCombinations.findIndex(c => c.color.toLowerCase() === combo.color.toLowerCase() && c.category.toLowerCase() === combo.category.toLowerCase());

   if (comboIndex !== -1) {
      notificationCombinations[comboIndex].status = status;
      console.log(`Combo ${comboIndex} ${status}: ${JSON.stringify(notificationCombinations[comboIndex])}`);
   }
}

//NEW: calculates + updates interaction time
function calculateInteractionTime(combo) {
    const comboIndex = notificationCombinations.findIndex(c => c.color.toLowerCase() === combo.color.toLowerCase() && c.category.toLowerCase() === combo.category.toLowerCase());
    if (comboIndex !== -1) {
        const interactionTime = (Date.now() - notificationCombinations[comboIndex].notificationDisplayTime) / 1000; 
        notificationCombinations[comboIndex].interactionTime = interactionTime;
        console.log(`Combo ${comboIndex} interaction time updated: ${JSON.stringify(notificationCombinations[comboIndex])}`); //console checking 
    }
}


//NOTIF BTNS
$(document).on("click", ".accept-btn", function(e) {
    clearTimeout(notificationTimeout);
    let target = e.target.parentElement;
    clickedNotification(target);

    currentCombo = getCurrCombo(target);
    updateComboStatus(currentCombo, "accepted");
    calculateInteractionTime(currentCombo);
    console.log(`Combo accepted: ${JSON.stringify(currentCombo)}`);
});

$(document).on("click", ".dismiss-btn", function(e) {
    clearTimeout(notificationTimeout);
    let target = e.target.parentElement;
    clickedNotification(target);

    currentCombo = getCurrCombo(target);
    updateComboStatus(currentCombo, "dismissed");
    calculateInteractionTime(currentCombo);
    console.log(`Combo dismissed: ${JSON.stringify(currentCombo)}`);
  });

function getRandomNotificationPair(category) {
   const pairs = notificationPairs[category];
   const randomIndex = Math.floor(Math.random() * pairs.length);
   return pairs[randomIndex];
}

function hideNotification() {
    const notificationContainer = document.getElementById("notificationContainer");
    notificationContainer.style.display = "none";
}

//select random header/body pair per category
function getRandomNotificationText(category) {
    const notificationTexts = notificationPairs[category];
    const randomIndex = Math.floor(Math.random() * notificationTexts.length);
    return `<strong>${notificationTexts[randomIndex].header}</strong><br>${notificationTexts[randomIndex].body}`;
}

//OLD: shows data via html
// function updateAdminPage() {
//     const adminContent = document.getElementById("adminContent");
//     adminContent.innerHTML = "<h2>Admin Page</h2>";

//     // Display the status of each notification combination
//     for (const combo of notificationCombinations) {
//         const comboStatus = combo.status === "NAN" ? "Not interacted" : combo.status;
//         const comboElement = document.createElement("p");
//         comboElement.textContent = `${combo.color} - ${combo.category}: ${comboStatus}`;
//         //print interaction time 
//         comboElement.textContent += ` - Interaction Time: ${combo.interactionTime}`;
//         adminContent.appendChild(comboElement);
//     }
// }



//NEW: export results (contents of notificationCombinations array)
//https://www.geeksforgeeks.org/converting-javascript-arrays-csvs-vice-versa/
function exportResults() {
    //convert array data -> csv
    function arrayToCsv(objArray) {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        //EXCLUDE: notificationDisplayTime, notificationInteractionTime, isDisplayed
        let csvString = 'color,category,status,interactionTime\r\n';
        array.forEach(item => {
            csvString += `${item.color},${item.category},${item.status},${item.interactionTime}\r\n`;
        });

        return csvString;
    }

    function downloadCsv() {
        const csvStr = arrayToCsv(notificationCombinations);
        const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        if (notificationBehaviour === 0) {
          link.setAttribute("download", "urgent-results.csv");
        }
        else if (notificationBehaviour === 1) {
          link.setAttribute("download", "nonurgent-results.csv");
        }
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    downloadCsv();
}

function clearNotificationTimeout() {
    clearTimeout(notificationTimeout);
}

// Function to start the notification system
function startNotificationSystem() {
   let scoreToSpawn;
   let comboToSpawn;
   let initialValuesSet = false;


   const startButton = document.getElementById("start");
   startButton.addEventListener("click", () => {
       if (!initialValuesSet) {
           // Set initial values only if they haven't been set before

           
           scoreQueue = generateRandomSequence();
          
           scoreToSpawn = scoreQueue.shift();
           comboToSpawn = selectNotificationCombo();
           updateFooterInfo(scoreToSpawn, comboToSpawn);
           initialValuesSet = true;
       }
   });

}

//Get the overall score from the game. This should go to the CSV file
function getScore(newScore)
{
    if(newScore != 0)
    {
        tempScore = newScore;
        scoreCounter++;
        document.getElementById("scoreHolder").textContent = scoreCounter;
    }
    
}

//TEST FEATURES BELOW

//spawn notif
$(document).on("click", "#notifButton", () => {
   // alert("Clicked Notif")
   const combo1 = { color: "blue", category: "work" }; 
   displayNotification(combo1);
   
});

//export results
$("#adminButton").click(() => {
    exportResults();
});