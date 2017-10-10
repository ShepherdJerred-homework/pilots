// http://taz.harding.edu/~jshepherd/pilots/

var MAX_CONTESTANTS = 6;
var MIN_CONTESTANTS = 6;
var FRAMES_PER_SECOND = 120;

var names = [];
var contestants = [];
var winner = null;
var gameLoop = null;
var backgroundLoop = null;
var maxPosition = 0;
var backgroundCounter = 0;

window.onload = function () {
    showElement("intro", true);

    if (localStorage.getItem("names") != null) {
        document.querySelector("#input > textarea").value = JSON.parse(localStorage.getItem("names")).toString().split(",").join("\n");
    }

    // Set text for input field
    document.querySelector("#input > h2").innerHTML = "Enter at least " + MIN_CONTESTANTS + " names";

    // Intro start button
    document.querySelector("#intro > button").addEventListener("click", function () {
        showElement("intro", false);
        showElement("input", true);
    });

    // Input pick contestants button
    document.querySelector("#input > button").addEventListener("click", function () {
        getNames();
        validateNames();

        localStorage.setItem("names", JSON.stringify(names));

        if (names.length < MIN_CONTESTANTS)
            alert("You need to enter at least " + MIN_CONTESTANTS + " name(s)");
        else {
            pickNames();
            createContestants();
            clearOldContestants();
            displayContestants();
            showElement("input", false);
            showElement("contestants", true);
        }
    });

    // Contestants race button
    document.querySelector("#race").addEventListener("click", function () {
        showElement("contestants", false);
        showElement("game", true);
        startGame();
    });

    // Contestants cancel button
    document.querySelector("#cancel").addEventListener("click", function () {
        showElement("contestants", false);
        showElement("input", true);
    });

    // Results new race button
    document.querySelector("#results > button").addEventListener("click", function () {
        showElement("results", false);
        showElement("input", true);
    });

};

function showElement(id, boolean) {
    var element = document.getElementById(id);
    if (boolean)
        element.style.display = "block";
    else
        element.style.display = "none";
}

function getNames() {
    names = document.querySelector("#input > textarea").value.split("\n");
    console.log("Names: " + names);
}

function validateNames() {
    var validatedNames = [];
    names.forEach(function (name) {
        if (name !== "" && name !== " " && name !== "\n")
            validatedNames.push(name);
    });
    names = validatedNames;
    console.log("Validated Names: " + names);
}

function pickNames() {
    var pickedNames = [];
    if (MAX_CONTESTANTS <= names.length) {
        for (var i = 0; i < MAX_CONTESTANTS; i++) {
            let index = Math.floor((Math.random() * names.length));
            pickedNames.push(names[index]);
            names.splice(index, 1);
        }
        names = pickedNames;
    }
    console.log("Picked Names: " + names);
}

function createContestants() {
    contestants = [];
    for (var i = 0; i < names.length; i++) {
        var contestant = new Object();
        contestant.name = names[i];
        contestant.sprite = i;
        contestant.position = 0;
        contestant.height = 0;
        contestant.alive = true;
        contestant.id = i;
        contestants.push(contestant);
    }
}

function clearOldContestants() {
    document.querySelector("#contestantsList").innerHTML = "";
}

function displayContestants() {
    var holder = document.querySelector("#contestantsList");
    contestants.forEach(function (contestant) {
        var entry = document.createElement("div");
        entry.innerHTML = "<img src='img/players/" + contestant.sprite + ".png' alt='Player Sprite'>" + "<p>" + contestant.name + "</p>";
        holder.appendChild(entry);
    });
}

function clearOldImages() {
    document.querySelector("#gameContainer").innerHTML = "";
}

function startGame() {

    document.querySelector("#game > audio").play();

    document.getElementById("game").style.backgroundPositionX = "0px";
    clearOldImages();

    winner = null;
    maxPosition = 2000;
    backgroundCounter = 0;

    var container = document.querySelector("#gameContainer");

    contestants.forEach(function (contestant) {
        var plane = document.createElement("img");
        plane.setAttribute("id", "player_" + contestant.id);
        plane.src = "img/players/" + contestant.sprite + ".png";
        container.appendChild(plane);
    });

    setTimeout(function () {
        gameLoop = window.setInterval(runGameLoop, 1000 / FRAMES_PER_SECOND);
        backgroundLoop = window.setInterval(runBackgroundLoop, 1000 / (FRAMES_PER_SECOND / 8));
    }, 500);

}

function runBackgroundLoop() {
    backgroundCounter += 4;
    document.getElementById("game").style.backgroundPositionX = backgroundCounter + "px";
}

function runGameLoop() {
    var tempMax = maxPosition;

    contestants.forEach(function (contestant) {
        contestant.position += Math.floor((Math.random() * 2) + .5);
        document.getElementById("player_" + contestant.id).style.left = contestant.position + "px";
        if (tempMax < contestant.position)
            tempMax = contestant.position;
        else {
            let random = Math.random();
            if (random < .1)
                contestant.position *= 1.005;
            else if (random < .25)
                contestant.position *= 1.00125;
            else if (random < 35)
                contestant.position *= 1.0025;
        }

        let random = Math.random();
        if (random < .025) {
            if (contestant.height < 0 && contestant.height != -20)
                contestant.height -= 1;
            else if (contestant.height < 20)
                contestant.height += 1;
        } else if (random < .05) {
            if (contestant.height > 0 && contestant.height != 20)
                contestant.height += 1;
            else if (contestant.height > -20)
                contestant.height -= 1;
        }

        document.getElementById("player_" + contestant.id).style.top = contestant.height + "px";

        if (contestant.position >= window.innerWidth - 75)
            if (winner == null)
                winner = contestant;
    });

    maxPosition = tempMax;

    if (winner != null) {
        document.querySelector("#game > audio").pause();
        window.clearInterval(gameLoop);
        window.clearInterval(backgroundLoop);
        setTimeout(function () {
            updateResults();
            showElement("game", false);
            showElement("results", true)
        }, 1500);
    }
}

function updateResults() {
    document.querySelector("#results > h2").innerHTML = "Winner: " + winner.name;
    var canvas = document.querySelector("#results > canvas");
    var context = canvas.getContext("2d");
    var image = new Image();
    image.src = "img/players/" + winner.sprite + ".png";
    context.drawImage(image, canvas.width / 2 - image.width / 2, canvas.height / 2 - image.height / 2);
}