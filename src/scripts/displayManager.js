const pileManager = require("./pileManager")

const displayManager = Object.create({}, {
    //Flag to control behavior of the socket listener when it recieves a new message for the library.
    pilesVisible: {
        value: false,
        writable: true
    },
    //Reference to the main body of content for later reference
    body: {
        value: $("#content")
    },
    //Displays the cards currently held in the user's hand
    displayUserHand: {
        value: function () {
            const gameManager = require("./gameManager")
            //Removes the user's hand window if it exists, then creates a new hand window
            $("#userHand").remove()
            $("#content").append(
                `<section id="userHand">
                    <h1>Hand</h1>
                    <div id="handImages"></div
                </section>`
            )
            //Adds card images to the user hand window based on the user hand array
            gameManager.userHand.forEach(element => {
                $("#handImages").append(`<img src = '${element.imageUrl}' alt = '${element.name}' draggable='false'>`)
            })
        }
    },

    //Removes the pile display window
    closePile: {
        value: function () {
            $("#pileDisplaySection").remove()
        }
    },

    isEmpty: {
        value: function (pileName, pileToCheck) {
            if (pileToCheck.length === 0) {
                $(`#${pileName} img`).css("visibility", "hidden")
            }
        }
    },
    makePileUI: {
        value: function () {
            const gameManager = require("./gameManager")

            displayManager.body.append("<div id='selectionArea'></div>")
    
            const selectionArea = $("#selectionArea")

            for (let i= 1; i <= 3; i++) {
                selectionArea.prepend(`<section class="cardPile clickable" id="pile${i}">
                                        <h1>Pile ${i}</h1>
                                        <img draggable=\"false\" src=\"http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card\" alt='Card Back'></img>
                                        </section>`)
            }

            selectionArea.prepend("<section class=\"cardPile clickable\" id=\"library\">\n<h1>Library</h1><img src=\"http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card\" alt='Card Back'></img></section>")
    
    
            displayManager.body.prepend("<input type='button' value='New Draft' id='newDraftBtn'>")
    
            $(".clickable").click(pileManager.pileClick)
            $("#newDraftBtn").click(gameManager.newGame)
            pileManager.countPile()
            pileManager.DragDropManager()
            displayManager.pilesVisible = true
        }
    }
})


module.exports = displayManager