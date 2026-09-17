// ==========================================
// VELLAR TERRITORY — VERSION 0.1
// ==========================================

const STARTING_BALANCE = 100;
const LAND_PRICE = 20;
const BUILDING_PRICE = 50;
const INCOME_PER_BUILDING = 5;

let game = {
    balance: STARTING_BALANCE,
    ownedCells: [12],
    buildings: [],
    level: 1,
    pendingIncome: 0
};


// ==========================================
// LOAD GAME
// ==========================================

function loadGame() {

    const saved = localStorage.getItem("vellarGame");

    if (saved) {

        try {

            game = JSON.parse(saved);

        } catch (error) {

            console.log("Save error:", error);

        }

    }

}


// ==========================================
// SAVE GAME
// ==========================================

function saveGame() {

    localStorage.setItem(
        "vellarGame",
        JSON.stringify(game)
    );

}


// ==========================================
// ELEMENTS
// ==========================================

const balanceElement = document.getElementById("balance");
const territoryElement = document.getElementById("territory");
const buildingsElement = document.getElementById("buildings");
const incomeElement = document.getElementById("income");
const levelElement = document.getElementById("level");
const landCountElement = document.getElementById("landCount");

const mapElement = document.getElementById("map");

const buyButton = document.getElementById("buyButton");
const buildButton = document.getElementById("buildButton");
const collectButton = document.getElementById("collectButton");

const activityLog = document.getElementById("activityLog");


// ==========================================
// MAP
// ==========================================

function createMap() {

    mapElement.innerHTML = "";

    for (let i = 0; i < 25; i++) {

        const cell = document.createElement("div");

        cell.className = "cell";

        if (game.ownedCells.includes(i)) {

            cell.classList.add("owned");

            if (i === 12) {

                cell.classList.add("capital");
                cell.innerHTML = "🏴";

            }

            if (game.buildings.includes(i)) {

                cell.classList.add("building");

                if (i !== 12) {
                    cell.innerHTML = "🏠";
                }

            }

        }

        cell.dataset.id = i;

        cell.addEventListener("click", () => {

            selectCell(i);

        });

        mapElement.appendChild(cell);

    }

}


// ==========================================
// SELECT CELL
// ==========================================

let selectedCell = null;

function selectCell(id) {

    selectedCell = id;

    const isOwned = game.ownedCells.includes(id);

    const hasBuilding = game.buildings.includes(id);

    if (isOwned) {

        if (hasBuilding) {

            addActivity(
                "🏠",
                "Building selected",
                "This building generates 5 VEL / min."
            );

        } else {

            addActivity(
                "🟩",
                "Territory selected",
                "You can build on this land."
            );

        }

    } else {

        addActivity(
            "🌐",
            "Free territory",
            "Buy this land for 20 VEL."
        );

    }

}


// ==========================================
// BUY LAND
// ==========================================

buyButton.addEventListener("click", () => {

    if (game.balance < LAND_PRICE) {

        addActivity(
            "⚠️",
            "Not enough VEL",
            "You need 20 VEL to buy land."
        );

        return;
    }


    const available = getAvailableCells();

    if (available.length === 0) {

        addActivity(
            "🏴",
            "Territory complete",
            "You own the entire test map."
        );

        return;

    }


    const cell = available[
        Math.floor(Math.random() * available.length)
    ];


    game.balance -= LAND_PRICE;

    game.ownedCells.push(cell);

    checkLevel();

    saveGame();

    updateUI();

    addActivity(
        "🌍",
        "New territory acquired",
        "You purchased a new territory for 20 VEL."
    );

});


// ==========================================
// GET AVAILABLE CELLS
// ==========================================

function getAvailableCells() {

    const result = [];

    for (let i = 0; i < 25; i++) {

        if (!game.ownedCells.includes(i)) {

            result.push(i);

        }

    }

    return result;

}


// ==========================================
// BUILD
// ==========================================

buildButton.addEventListener("click", () => {

    if (selectedCell === null) {

        addActivity(
            "👆",
            "Select territory",
            "Choose one of your cells first."
        );

        return;

    }


    if (!game.ownedCells.includes(selectedCell)) {

        addActivity(
            "🔒",
            "Territory unavailable",
            "You need to purchase this land first."
        );

        return;

    }


    if (game.buildings.includes(selectedCell)) {

        addActivity(
            "🏠",
            "Already developed",
            "There is already a building here."
        );

        return;

    }


    if (game.balance < BUILDING_PRICE) {

        addActivity(
            "⚠️",
            "Not enough VEL",
            "You need 50 VEL to build."
        );

        return;

    }


    game.balance -= BUILDING_PRICE;

    game.buildings.push(selectedCell);

    checkLevel();

    saveGame();

    updateUI();

    addActivity(
        "🏠",
        "Building constructed",
        "Your building now generates 5 VEL / min."
    );

});


// ==========================================
// INCOME
// ==========================================

collectButton.addEventListener("click", () => {

    const income =
        game.buildings.length * INCOME_PER_BUILDING;


    if (income <= 0) {

        addActivity(
            "💰",
            "No income",
            "Build something to start generating VEL."
        );

        return;

    }


    game.balance += income;

    game.pendingIncome = 0;

    saveGame();

    updateUI();

    addActivity(
        "💰",
        "Income collected",
        `You received ${income} VEL.`
    );

});


// ==========================================
// LEVEL
// ==========================================

function checkLevel() {

    const newLevel =
        Math.floor(
            (game.ownedCells.length + game.buildings.length) / 3
        ) + 1;


    if (newLevel > game.level) {

        game.level = newLevel;

        addActivity(
            "📈",
            "Level increased",
            `Your republic reached level ${newLevel}.`
        );

    }

}


// ==========================================
// ACTIVITY
// ==========================================

function addActivity(icon, title, description) {

    const item = document.createElement("div");

    item.className = "activity-item";

    item.innerHTML = `
        <span>${icon}</span>

        <div>
            <strong>${title}</strong>
            <small>${description}</small>
        </div>
    `;

    activityLog.prepend(item);


    while (activityLog.children.length > 5) {

        activityLog.removeChild(
            activityLog.lastChild
        );

    }

}


// ==========================================
// UPDATE UI
// ==========================================

function updateUI() {

    balanceElement.textContent =
        Math.floor(game.balance);

    territoryElement.textContent =
        game.ownedCells.length;

    buildingsElement.textContent =
        game.buildings.length;

    incomeElement.textContent =
        game.buildings.length * INCOME_PER_BUILDING;

    levelElement.textContent =
        game.level;

    landCountElement.textContent =
        game.ownedCells.length;


    createMap();


    if (game.balance < LAND_PRICE) {

        buyButton.disabled = true;

    } else {

        buyButton.disabled = false;

    }


    if (
        selectedCell === null ||
        !game.ownedCells.includes(selectedCell) ||
        game.buildings.includes(selectedCell)
    ) {

        buildButton.disabled = false;

    }

}


// ==========================================
// START
// ==========================================

loadGame();

checkLevel();

updateUI();


// ==========================================
// TELEGRAM MINI APP
// ==========================================

if (window.Telegram && Telegram.WebApp) {

    Telegram.WebApp.ready();

    Telegram.WebApp.expand();

}
