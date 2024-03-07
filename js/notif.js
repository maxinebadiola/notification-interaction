let notificationTimeout //when notif will expire
let currentCombo; //current notif being displayed (color/category)

//Notif Variables
const colors = ["Red", "Orange", "Yellow", "Blue", "Green", "Purple"];
const categories = ["Emergency", "Work", "Social"];

const notificationCombinations = []; //to be printed for "notif log"

function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

// all possible notif combinations (TOTAL = 18)
for (const color of colors) {
    for (const category of categories) {
        notificationCombinations.push({ color, category, status: "NAN" });
    }
}

// Possible Header/Content for each notif category
//TODO: Add more pairs (5 each?)
const notificationPairs = {
    "emergency": [
        {"header": "Typhoon Warning: Seek Shelter", "body": "A typhoon warning has been issued for your area. Please seek shelter immediately."},
        {"header": "Earthquake Alert: Prepare for Shaking", "body": "Seismic activity has been detected. An earthquake may occur soon."},
        {"header": "Flood Advisory: High Water Levels", "body": "Due to heavy rainfall, a flood advisory has been issued. Stay away from low-lying areas."},
        {"header": "Heatwave Alert: Stay Cool and Hydrated", "body": "A heatwave is expected in your area. Stay indoors and keep hydrated."},
        {"header": "Cold Snap Warning: Bundle Up", "body": "A sudden drop in temperature is expected. Stay warm and check on vulnerable neighbors."}
    ],    
    "social": [
        {"header": "New Friend Request from John Doe", "body": "John Doe sent you a friend request. Connect now!"},
        {"header": "You've Been Tagged in a Photo", "body": "You've been tagged in a new photo by Jane Doe."},
        {"header": "Your Post Received 100 Likes", "body": "Your post has received 100 likes. Check it out!"},
        {"header": "Event Reminder: Sarah's Birthday", "body": "Don't forget Sarah's birthday party tomorrow."},
        {"header": "New Message from Group Chat", "body": "You have a new message in the 'Weekend Plans' group chat."}
    ],
    "work": [
        {"header": "Meeting Reminder: Project Sync at 3PM", "body": "Don't forget the project sync meeting at 3PM."},
        {"header": "New Email: Weekly Report Due", "body": "The weekly report is due tomorrow. Please submit your updates."},
        {"header": "Task Assigned: Review Design Mockups", "body": "You've been assigned a new task to review the design mockups."},
        {"header": "Deadline Alert: Proposal Submission", "body": "The deadline for proposal submission is approaching. Please submit your documents."},
        {"header": "Calendar Invite: Team Lunch", "body": "You've been invited to a team lunch next Friday."}
    ]
};

//random number between 3-6 (score at which notif will spawn)
function notificationScoreSpawn() {
   return Math.floor(Math.random() * 4) + 3;

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

//selects notif combo to be displayed next
function selectNotificationCombo() {
   //selected notif must be unencountered (no status logged)
   const unencounteredCombinations = notificationCombinations.filter(combo => combo.status === "NAN");
   const randomIndex = Math.floor(Math.random() * unencounteredCombinations.length);
   const selectedCombo = unencounteredCombinations[randomIndex];
   return { color: selectedCombo.color, category: selectedCombo.category };
   //returns { color: "red", category: "emergency" }; 
}


//display function
function displayNotification(combo) {
   currentCombo = combo
   console.log("displayNotification called");
   console.log(`Displaying notification - combo: ${JSON.stringify(combo)}`);

   //get header/body pair based on category
   const pair = getRandomNotificationPair(combo.category.toLowerCase());
   const notificationContainer = document.getElementById('notificationContainer');

   //clear
   notificationContainer.innerHTML = '';

   //notif chunk
   const notification = document.createElement("div");
   notification.className = "notification-box";
   notification.style.backgroundColor = combo.color.toLowerCase(); // Set the background color
   notification.innerHTML = `
       <div class="notification-header" style="color: white; font-size: 20px; font-weight: bold;">${pair.header}</div>
       <div class="notification-content" style="color: white;">${pair.body}</div>
       <button class="accept-btn">Accept</button>
       <button class="dismiss-btn">Dismiss</button>
   `;

   notificationContainer.appendChild(notification);
   notificationContainer.style.display = "block";

   //10s timeout
   notificationTimeout = setTimeout(() => {
      hideNotification();
      updateComboStatus(combo, "ignored");
   }, 10000);
}



//hide notif
function hideNotification() {
   const notificationContainer = document.getElementById("notificationContainer");
   notificationContainer.style.display = "none";
}

function updateComboStatus(combo, status) {
   const comboIndex = notificationCombinations.findIndex(c => c.color.toLowerCase() === combo.color.toLowerCase() && c.category.toLowerCase() === combo.category.toLowerCase());

   if (comboIndex !== -1) {
      notificationCombinations[comboIndex].status = status;
      console.log(`Combo ${comboIndex} ${status}: ${JSON.stringify(notificationCombinations[comboIndex])}`);
   }
}

//NOTIF BTNS
$(document).on("click", ".accept-btn", function() {
   clearTimeout(notificationTimeout);
   hideNotification();
   updateComboStatus(currentCombo, "accepted"); // Use currentCombo instead of combo
   console.log(`Combo accepted: ${JSON.stringify(currentCombo)}`);
});

$(document).on("click", ".dismiss-btn", function() {
   clearTimeout(notificationTimeout);
   hideNotification();
   updateComboStatus(currentCombo, "dismissed"); // Use currentCombo instead of combo
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

//record notif interaction -> admin page
function recordInteractionStatus(combo, status) {
    combo.status = status;
    updateAdminPage();
}

function updateAdminPage() {
    const adminContent = document.getElementById("adminContent");
    adminContent.innerHTML = "<h2>Admin Page</h2>";

    // Display the status of each notification combination
    for (const combo of notificationCombinations) {
        const comboStatus = combo.status === "NAN" ? "Not interacted" : combo.status;
        const comboElement = document.createElement("p");
        comboElement.textContent = `${combo.color} - ${combo.category}: ${comboStatus}`;
        adminContent.appendChild(comboElement);
    }
}
$("#adminButton").click(() => {
    console.log(`Current notification combinations: ${JSON.stringify(notificationCombinations)}`);
});


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
           scoreToSpawn = notificationScoreSpawn();
           comboToSpawn = selectNotificationCombo();
           updateFooterInfo(scoreToSpawn, comboToSpawn);
           initialValuesSet = true;
       }
   });

}

//SPAWN NOTIF TEST
$(document).on("click", "#notifButton", () => {
   // alert("Clicked Notif")
   const combo1 = { color: "blue", category: "social" }; 
   displayNotification(combo1);
   
});