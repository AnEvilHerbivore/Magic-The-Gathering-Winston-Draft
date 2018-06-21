const pubNubManager = require("./pubNubManager")
const pileManager = Object.create({}, {
    //Function handles drag and drop operations to enable a card to be dragged from the library onto a pile
    DragDropManager: {
        value: function () {
            const gameManager = require("./gameManager")
            const pile1Section = document.querySelector("#pile1")
            pile1Section.ondragover = event => {
                event.preventDefault()
            }
            pile1Section.ondrop = event => {
                pileManager.dropEvent(event, gameManager.pile1, "pile1")
            }
        
            const pile2Section = document.querySelector("#pile2")
            pile2Section.ondragover = event => {
                event.preventDefault()
            }
            pile2Section.ondrop = event => {
                pileManager.dropEvent(event, gameManager.pile2, "pile2")
            }
        
            const pile3Section = document.querySelector("#pile3")
            pile3Section.ondragover = event => {
                event.preventDefault()
            }
            pile3Section.ondrop = event => {
                pileManager.dropEvent(event, gameManager.pile3, "pile3")
            }
        }
    },
    
    //Function to execute when a card is dropped onto a pile, accepts the drop event, the pile, and the string name of the pile as parameters.
    dropEvent: {
        value: function (event, pileDropped, pileDroppedName) {
            const gameManager = require("./gameManager")
            const displayManager = require("./displayManager")
            event.preventDefault()
            pileManager.addCardToPile(pileDropped)
            pubNubManager.publishPileChange(pileDroppedName, pileDropped)
            pubNubManager.publishPileChange("library", gameManager.totalCardArray)
            M.toast({html: "Card Added To Pile", classes: "move"})
            displayManager.closePile()
        }
    },

    //Function to randomize the order of an array, used in order to "shuffle" the piles
    shuffle: {
        value: function (a) {
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a
        }
    },

    takePile: {
        value: function () {
            const gameManager = require("./gameManager")
            const displayManager = require("./displayManager")
            let $currentSection = $(this).parent().parent()
            if ($currentSection.hasClass("pile1")) {
                pileManager.pileAction(gameManager.pile1, "pile1")
            } else if ($currentSection.hasClass("pile2")) {
                pileManager.pileAction(gameManager.pile2, "pile2")
            } else if ($currentSection.hasClass("pile3")) {
                pileManager.pileAction(gameManager.pile3, "pile3")
            }
            displayManager.closePile()
            displayManager.displayUserHand()
            pileManager.countPile()
            gameManager.draftFinished()
        }
    },

    pileAction: {
        value: function (pileInput, pileInputName) {
            const gameManager = require("./gameManager")
            const displayManager = require("./displayManager")
            gameManager.userHand = gameManager.userHand.concat(pileInput)
            pileInput = []
            pileManager.addCardToPile(pileInput)
            pubNubManager. publishPileChange("library", gameManager.totalCardArray)
            pubNubManager.publishPileChange(pileInputName, pileInput)
            displayManager.isEmpty(pileInputName, pileInput)
        }
    },
    
    pileClick: {
        value: function () {
            const displayManager = require("./displayManager")
            const gameManager = require("./gameManager")
            if ($(this).children("img").css("visibility") === "visible") {
                $("#pileDisplaySection").remove()
                if (this.id !== "library") {
                    $("#newDraftBtn").after("<section id='pileDisplaySection'></section>")
                }
                const pileDisplaySection = $("#pileDisplaySection")
                let pileActivated
                switch (this.id) {
                    case "pile1":
                    pileActivated = gameManager.pile1
                    pileDisplaySection.append("<h1>Pile 1</h1>")
                    $("#pileDisplaySection").addClass("pile1")
                    break;
                    case "pile2":
                    pileActivated = gameManager.pile2
                    pileDisplaySection.append("<h1>Pile 2</h1>")
                    $("#pileDisplaySection").addClass("pile2")
                    break;
                    case "pile3":
                        pileActivated = gameManager.pile3
                        pileDisplaySection.append("<h1>Pile 3</h1>")
                        $("#pileDisplaySection").addClass("pile3")
                    break;
                    case "library":
                        if (gameManager.totalCardArray.length !== 0) {
                            let r = confirm("Take card from top of Library?");
                            if (r === true) {
                                gameManager.userHand.push(gameManager.totalCardArray.shift())
                                pubNubManager.publishPileChange("library", gameManager.totalCardArray)
                                if (gameManager.totalCardArray.length === 0) {
                                    $("#library img").css("visibility", "hidden")
                                    $("#library h4").fadeIn()
                                }
                                displayManager.displayUserHand()
                            }
                            
                        }
                    break;
        
                    gameManager.draftFinished()
                }
        
                pileDisplaySection.append("<section id='cardImageSection' class='cardPiles'></section>")
                const cardImageSection = $("#cardImageSection")
        
                if (this.id !== "library") {
                pileActivated.forEach(element => {
                    cardImageSection.append(`<img src = '${element.imageUrl}' alt = '${element.name}' draggable='false'></img> `)
                });
            }
        
        
                pileDisplaySection.append("<section id='pileDisplayBtns'><input type='button' value='Take Pile' class='takePileBtn'><input type='button' value='Close Pile' class='closePileBtn'></section>")
        
                $(".closePileBtn").click(displayManager.closePile)
                $(".takePileBtn").click(pileManager.takePile)
                $("html").scrollTop(0)
            }
        }
    },
    
    
    addCardToPile: {
        value: function (pileToAddTo) {
            const gameManager = require("./gameManager")
            const displayManager = require("./displayManager")
            if (gameManager.totalCardArray.length !== 0) {
                pileToAddTo.push(gameManager.totalCardArray.shift())
                displayManager.isEmpty("library", gameManager.totalCardArray)
                pileManager.countPile()
            }
        }
    },
    countPile: {
        value: function () {
            const gameManager = require("./gameManager")
            let count = gameManager.totalCardArray.length
            $(`#libraryCount`).remove()
            $(`#library`).append(`<h4 class="pileCount" id="libraryCount">${count} Cards</h4>`)
            count = gameManager.pile1.length
            $(`#pile1Count`).remove()
            $(`#pile1`).append(`<h4 class="pileCount" id="pile1Count">${count} Cards</h4>`)
            count = gameManager.pile2.length
            $(`#pile2Count`).remove()
            $(`#pile2`).append(`<h4 class="pileCount" id="pile2Count">${count} Cards</h4>`)
            count = gameManager.pile3.length
            $(`#pile3Count`).remove()
            $(`#pile3`).append(`<h4 class="pileCount" id="pile3Count">${count} Cards</h4>`)
        }
    }
})

module.exports = pileManager