// Member names
const hogwartsMembers = ["Harry", "Hermione", "Ron", "Luna", "Neville", "Malfoy"];
const fotrMembers = ["Legolas", "Gimli", "Aragorn", "Boromir", "Merry", "Pippen"];

// Global simulation object
var sim;


class Simulation {
    // Store all variables and methods for execution of Gale-Shapley algorithm

    constructor() {
        this.round = 1;
        this.numMatches = 0;
        this.currProposer = 0; // Keep track of next proposer

        this.proposerMatches = {}; // Who proposers are matched to
        this.proposerNextProposal = {}; // Index of next player to propose to
        this.proposeeMatchPosition = {}; // Position in preferences of current proposee matches

        // Initialize random preferences
        this.hogwartsPreferences = {};
        this.fotrPreferences = {};

        for (var member of hogwartsMembers) {
            this.hogwartsPreferences[member] = shuffleArray(fotrMembers);
        }

        for (var member of fotrMembers) {
            this.fotrPreferences[member] = shuffleArray(hogwartsMembers);
        }
    }

    start(proposerPreferences, proposeePreferences, proposer, proposee) {
        // Initializes both sides based on which one was chosen to propose

        this.proposers = Object.keys(proposerPreferences);
        this.proposees = Object.keys(proposeePreferences);
        this.proposerPreferences = proposerPreferences;
        this.proposeePreferences = proposeePreferences;

        // Initialize simulation dictionaries
        for (var member of this.proposers) {
            this.proposerNextProposal[member] = 0;
            this.proposerMatches[member] = 0;
        }

        for (var member of this.proposees) {
            this.proposeeMatchPosition[member] = Infinity;
        }

        // Set sices
        this.proposer = proposer;
        this.proposee = proposee;

        displayNext();
        this.next(); // Perform first step
    }

    next() {
        // Perform one step of Gale-Shapley

        let proposer = this.proposers[this.currProposer];

        // Get next unmatched
        while (this.currProposer < (this.proposers.length) && this.proposerMatches[proposer] != 0) {
            this.currProposer++;
            proposer = this.proposers[this.currProposer];
        }

        // When reaching a new round
        if (this.currProposer >= this.proposers.length) {
            // Update round info
            this.round++;
            document.getElementById("round-title").innerHTML = "Round " + this.round;

            // Continue from start of proposers
            this.currProposer = 0;
            this.next();
            return
        }

        // Propose to next most preferred
        let proposeePosition = this.proposerNextProposal[proposer];
        let proposee = this.proposerPreferences[proposer][proposeePosition];
        this.proposerNextProposal[proposer] += 1;

        addEntry(proposer, proposee);

        // Check if proposer is better than current
        let proposerPosition = this.getProposeePref(proposee, proposer);
        if (proposerPosition < this.proposeeMatchPosition[proposee]) {

            // Remove previous match
            for (var member in this.proposerMatches) {
                if (this.proposerMatches[member] == proposee) {
                    this.proposerMatches[member] = 0;
                    this.colorCells(member, proposee, "rejected");
                    this.numMatches--;
                }
            }

            // Add match
            this.proposeeMatchPosition[proposee] = proposerPosition;
            this.proposerMatches[proposer] = proposee;
            this.colorCells(proposer, proposee, "paired");
            updateMatches();

            // Update number of matches
            this.numMatches++;
            if (this.numMatches == this.proposers.length) {
                terminate();
                return
            }
        } else {
            // If not better show as rejected
            this.colorCells(proposer, proposee, "rejected");
        }
        this.currProposer++;
    }

    getProposerPref(proposer, proposee) {
        // Get position of proposee in proposer's preferences
        return this.proposerPreferences[proposer].indexOf(proposee);
    }

    getProposeePref(proposee, proposer) {
        // Get position of proposer in proposee's preferences
        return this.proposeePreferences[proposee].indexOf(proposer);
    }

    colorCells(proposer, proposee, color) {
        // Colors cells in proposer and proposee tables with give color
        this.colorCell(this.proposee + "-preferences", this.proposees.indexOf(proposee), this.getProposeePref(proposee, proposer), color);
        this.colorCell(this.proposer + "-preferences", this.proposers.indexOf(proposer), this.getProposerPref(proposer, proposee), color);
    }

    colorCell(tableID, row, col, color) {
        // Colors cell at corresponding row/col with color
        let table = document.getElementById(tableID);
        let cell = table.tHead.children[row + 1].children[col + 1]; // Increment both row/col by one since we ignore first of each
        cell.className = color;
    }
}


// BUTTON CLICKS
document.getElementById("random-start-button").addEventListener("click", function () {
    initializesim();
})

document.getElementById("simulation-button").addEventListener("click", function () {
    initializesim();
})

document.getElementById("hogwarts-button").addEventListener("click", function () {
    sim.start(sim.hogwartsPreferences, sim.fotrPreferences, "hogwarts", "fotr");
})

document.getElementById("fotr-button").addEventListener("click", function () {
    sim.start(sim.fotrPreferences, sim.hogwartsPreferences, "fotr", "hogwarts");
})

document.getElementById("next-button").addEventListener("click", function () {
    sim.next();
})


// GENERAL FUNCTIONS
function initializesim() {
    // Resets and initializes simulation
    sim = new Simulation();

    document.getElementById("introduction").style.display = "none";
    document.getElementById("simulation-container").style.display = "block";

    // Reset buttons and text
    document.getElementById("start-container").style.display = "flex";
    document.getElementById("round-container").style.display = "none";
    document.getElementById("done-container").style.display = "none";

    document.getElementById("proposals").innerHTML = "";
    document.getElementById("matches").innerHTML = "";
    document.getElementById("round-title").innerHTML = "Round 1"

    // Reset table
    let hogwartsTable = document.getElementById("hogwarts-preferences");
    let fotrTable = document.getElementById("fotr-preferences");

    let numRows = hogwartsTable.tHead.children.length;
    for (var i = 1; i < numRows; i++) {
        hogwartsTable.tHead.deleteRow(1);
        fotrTable.tHead.deleteRow(1);
    }

    // Fill table
    createTable(hogwartsTable, sim.hogwartsPreferences);
    createTable(fotrTable, sim.fotrPreferences);
}

function createTable(table, preferences) {
    // Fills preference table according to preferences
    for (var member in preferences) {
        let row = table.insertRow()
        let cell = row.insertCell();
        cell.innerHTML = member;

        for (var preference of preferences[member]) {
            cell = row.insertCell();
            cell.innerHTML = preference
        }
    }
}

function shuffleArray(array) {
    // Return randomized version of array using Durstenfeld shuffle algorithm 
    arrayClone = [...array];

    for (var i = arrayClone.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arrayClone[i];
        arrayClone[i] = arrayClone[j];
        arrayClone[j] = temp;
    }
    return arrayClone
}

function displayNext() {
    // Change start simulation header to next step header
    document.getElementById("start-container").style.display = "none";
    document.getElementById("round-container").style.display = "flex";
}

function addEntry(proposer, proposee) {
    // Add entry to text box
    let proposalList = document.getElementById("proposals");
    let li = document.createElement("li");
    li.innerHTML = proposer + " proposes to " + proposee;
    proposalList.prepend(li)
}

function updateMatches() {
    // Update list of matches
    let matchesContainer = document.getElementById("matches");
    matchesContainer.innerHTML = "";

    for (var match in sim.proposerMatches) {
        if (sim.proposerMatches[match] != 0) {
            let li = document.createElement("li");
            li.innerHTML = match + " and " + sim.proposerMatches[match];
            matchesContainer.append(li)
        }
    }
}

function terminate() {
    // Update header when simulation is done (i.e. Gale-Shapley terminates)
    document.getElementById("round-container").style.display = "none";
    document.getElementById("done-container").style.display = "flex";
}