//This module handles functions related to socket connections via PubNub, including listeners


//Establishes a new connection to PubNub and sets the subscribe and publish keys to allow access
let pubnub = new PubNub({
    subscribeKey: 'sub-c-f4c9f094-6a7b-11e8-98cb-067913ebee63',
    publishKey: 'pub-c-658b3a02-beac-4112-a315-443574de6422'
});

//Adds a listener to handle incoming messages from the PubNub connection
pubnub.addListener({
    status: function(statusEvent) {
        //Checks if connection is established. If the connection fails, it throws an error to the console.
        if (statusEvent.category === "PNConnectedCategory") {
        } else if (statusEvent.category === "PNUnknownCategory") {
            var newState = {
                new: 'error'
            };
            pubnub.setState(
                {
                    state: newState
                },
                function (status) {
                    console.log(statusEvent.errorData.message)
                }
            );
        }
    },
    //Function called on reciept of message from PubNub
    message: function(msg) {
        const gameManager = require("./gameManager")
        const displayManager = require("./displayManager")
        const pileManger = require("./pileManager")
        if (msg.message.title === "library") {
            gameManager.totalCardArray = msg.message.description
            displayManager.isEmpty("library", gameManager.totalCardArray)
            if (displayManager.pilesVisible === false) {
                displayManager.makePileUI()
                $("form").hide()
            }
        } else if (msg.message.title === "pile1") {
            gameManager.pile1 = msg.message.description
            displayManager.closePile()
            displayManager.isEmpty("pile1", gameManager.pile1)
        } else if (msg.message.title === "pile2") {
            gameManager.pile2 = msg.message.description
            displayManager.closePile()
            displayManager.isEmpty("pile2", gameManager.pile2)
        } else if (msg.message.title === "pile3") {
            gameManager.pile3 = msg.message.description
            displayManager.closePile()
            displayManager.isEmpty("pile3", gameManager.pile3)
        } else if (msg.message.title === "newDraft") {
            $("#selectionArea").empty()
            $("#newDraftBtn").remove()
            $("form").show()
            $("#userHand").remove()
            displayManager.closePile()
            displayManager.pilesVisible = false
            gameManager.pile1 = []
            gameManager.pile2 = []
            gameManager.pile3 = []
            gameManager.totalCardArray = []
            gameManager.userHand = []
            $("#saveHandBtn").remove()
        }
        pileManger.countPile()
        gameManager.draftFinished()
    }
})


//Established channel for the listener to subscribe to
pubnub.subscribe({
    channels: ['MagicWinston']
})

//Object for exporting functions to other modules
const pubNubManager = Object.create({}, {
    //Function to publish a message to the PubNub server to send on to listeners subscribed to the channel
    publishPileChange: {
        value: function (pileToChange, infoToChange) {
            pubnub.publish(
                {
                    //Contents of message to send
                    message: {
                        title: pileToChange,
                        description: infoToChange
                    },
                    //Channel to publish to
                    channel: 'MagicWinston'
                },
                //If the message fails, send an error to the console
                function (status, response) {
                    if (status.error) {
                        console.log(status)
                    }
                }
            )
        }
    }
})

module.exports = pubNubManager