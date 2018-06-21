//Functions to run on startup.
const gameManager = require("./gameManager")

//Adds event listener to the search button to begin the draft. Function is stored in gameManager.
$("#searchButton").click (gameManager.startDraft)