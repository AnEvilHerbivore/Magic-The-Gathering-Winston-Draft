//This module controls then functions related to the game state, including the current values of the library and 3 piles.


const FileSaver = require('file-saver');
const displayManager = require("./displayManager")
const apiManger = require("./apiManager")
const pileManager = require("./pileManager")
const pubNubManager= require("./pubNubManager")

const gameManager = Object.create({},{
    //totalCardArray holds the library of cards from which the other piles are made
    //toalCardArray and piles 1-3 are initialized as empty arrays so values can be pushed into them later
    //The arrays are set as properties of gameManager to ensure other modules can access them as needed
    totalCardArray: {
        value: [],
        writable: true,
        enumerable: true
    },
    pile1: {
        value: [],
        writable: true,
        enumerable: true
    },
    pile2: {
        value: [],
        writable: true,
        enumerable: true
    },
    pile3: {
        value: [],
        writable: true,
        enumerable: true
    },
    userHand: {
        value: [],
        writable: true,
        enumerable: true
    },


    
    //This function starts the new draft and is called when the search button is clicked
    startDraft: {
        value: function () {
            //creates empty array to hold promises for Promise.all
            let promises = []
            //get the value of the card list textarea and trim off excess whitespace
            let cardList = $("#cardList").val().trim()
            //create array of card names, using the return space as a break point
            cardList = cardList.split("\n")
            //loop through the array of card names
            if (cardList.length > 146) {
                alert("Too many cards")
            } else if (cardList.length < 4) {
                alert("You need more cards")
            } else {
                //Adds "working..." message to the dom to let players know that the function is performing correctly during promise resolution delay
                displayManager.body.append("<h1 id='working'>Working...<h1>")
                //Hides the card list input field and search button
                $("form").hide()
                cardList.forEach(element => {
                    //trim the name of excess whitespace
                    element = element.trim()
                    //find the first character of the name provided
                    const firstLetter = element.split("")[0]
                    //If the first character is a number, split the element into an array, shift the first index off the array, combine the array back into a string. This removes any numbers from the front of the card names, as this is a common format for card lists to be saved in
                    if (!isNaN(firstLetter)) {
                    let cardArray = element.split(" ")
                    cardArray.shift()
                    const nameWithoutNum = cardArray.reduce(function (current, next) {
                        return current += ` ${next}`
                    })
                    element = nameWithoutNum
                    }
                    //creates a promise to look up the card in the Magic the Gathering API based off of the card's name, and pushes that promise into the promises array
                    promises.push(apiManger.cardLookup(element).then(cardObj => {
                        return cardObj
                    }))
                });
                //waits for all card objects to be returned 
                Promise.all(promises).then(function(values){
                    //removes the "working..." message
                    $("#working").remove()

                    //assigns the array of returned card objects and assigns it to the totalCardArray
                    gameManager.totalCardArray = values

                    //Total card array is shuffled, piles are created based on the shuffled array
                    gameManager.totalCardArray = pileManager.shuffle(gameManager.totalCardArray)
                    pileManager.addCardToPile(gameManager.pile1)
                    pileManager.addCardToPile(gameManager.pile2)
                    pileManager.addCardToPile(gameManager.pile3)

                    //Makes the UI for the draft to proceed
                    displayManager.makePileUI()
            
                    //Creates an array to hold the id, imageURL, and name of each card.This condenses the information in order to be able to pass it through PubNub
                    let cardsCondensed= []
                    gameManager.totalCardArray.forEach(item => cardsCondensed.push({id: item.id, imageUrl: item.imageUrl, name: item.name}))
                    gameManager.totalCardArray = cardsCondensed
                    

                    //Send pile information through the socket
                    pubNubManager.publishPileChange("pile1", gameManager.pile1)
                    pubNubManager.publishPileChange("pile2", gameManager.pile2)
                    pubNubManager.publishPileChange("pile3", gameManager.pile3)
                    //Pile needs to be published last for edge case
                    pubNubManager.publishPileChange("library", gameManager.totalCardArray)
                })
            }
        }
    },
    
    draftFinished: {
        value: function () {
            //checks whether the library and 3 piles are empty. If so, it removes the draft area and adds a "save hand" button to allow the player to save the final results to be imported elsewhere
            if (gameManager.pile1.length === 0
                && gameManager.pile2.length === 0
                && gameManager.pile3.length === 0
                && gameManager.totalCardArray.length === 0) {
                    $("#selectionArea").remove()
                    $("#saveHandBtn").remove()
                    $("#newDraftBtn").after("<input type='button' value='Save Hand' id='saveHandBtn'>")
                    $("#saveHandBtn").click(function () {
                        //Creates an array of the names of each of the cards in the players hand, then saves it as a .txt file seperated by the return character (a common format for importing/exporting card lists in the Magic: The Gathering Community). Default save name is "NewDraft.txt"
                        let userHandNames = []
                        gameManager.userHand.forEach(card => userHandNames.push(card.name))
                        let blob = new Blob([userHandNames.join("\n")], {type: "text/plain;charset=utf-8"})
                        FileSaver.saveAs(blob, "NewDraft.txt")
                    })
                }
        }
    },
    
    newGame: {
        //Function resets the game to the initial state of the program to allow a new draft to start without needing to refresh. 
        value: function () {
            //Removes UI elements, unhides the form for entering in new cards for the draft
            $("#selectionArea").empty()
            $("#newDraftBtn").remove()
            $("form").show()
            $("#userHand").remove()
            $("#saveHandBtn").remove()
            displayManager.closePile()
            //changes gameplay variables back to initial state
            displayManager.pilesVisible = false
            gameManager.pile1 = []
            gameManager.pile2 = []
            gameManager.pile3 = []
            gameManager.totalCardArray = []
            gameManager.userHand = []
            //Sends empty data to the opponent to reset their draft as well. New draft message tells recieving computer to empty draft area contents and display card list form.
            pubNubManager.publishPileChange("newDraft")
        }
    }

})

module.exports = gameManager