const mtg = require("mtgsdk")
const body = $("#content")
const FileSaver = require('file-saver');

var pubnub = new PubNub({
    subscribeKey: 'sub-c-c1435070-69c3-11e8-9683-aecdde7ceb31', // always required
    publishKey: 'pub-c-9266a6ef-5936-4c7c-8b2a-3b15287b986b' // only required if publishing
});


pubnub.publish(
    {
        message: {
            title: "THIS IS A TEST",
            description: "Test"
        },
        channel: 'MagicWinston'
    },
    function (status, response) {
        if (status.error) {
            console.log(status)
        } else {
            console.log("message Published w/ timetoken", response.timetoken)
        }
    }
);


pubnub.addListener({
    status: function(statusEvent) {
        if (statusEvent.category === "PNConnectedCategory") {
            publishSampleMessage()
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
    message: function(msg) {
        console.log(msg.message.title);
        console.log(msg.message.description)
    }
})

pubnub.subscribe({
    channels: ['MagicWinston']
});

function publishSampleMessage() {
    var publishConfig = {
        channel : "hello_world",
        message: {
            title: "greeting",
            description: "hello world!"
        }
    }
    pubnub.publish(publishConfig, function(status, response) {
        console.log(status, response);
    })
}






let totalCardArray = []
let pile1 = []
let pile2 = []
let pile3 = []
let userHand = []


function cardURLLookup (cardName) {
    return new Promise((resolve, reject) => {
        mtg.card.where({name: cardName})
        .then(result => {
            resolve(result.find(element => {
                return element.imageUrl && element.name === cardName
            }));
        })
    })
}


function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const cardListArea = $("#cardList")
const searchButton = $("#searchButton")



function addCardToPile (pileToAddTo) {
    if (totalCardArray.length !== 0) {
        pileToAddTo.push(totalCardArray.shift())
        if (totalCardArray.length === 0) {
            $("#library img").css("visibility", "hidden")
            $("#library h4").fadeIn()
        }
    }
}

searchButton.click (function () {
    body.append("<h1>Working...<h1>")
    $("form").hide()
    let promises = []
    let cardList = cardListArea.val().trim()
    cardList = cardList.split("\n")
    cardList.forEach(element => {
        element = element.trim()
        const firstLetter = element.split("")[0]
        if (!isNaN(firstLetter)) {
           let cardArray = element.split(" ")
           cardArray.shift()
        //    console.log(cardArray)
           const nameWithoutNum = cardArray.reduce(function (current, next) {
               return current += ` ${next}`
           })
           element = nameWithoutNum
        }

        promises.push(cardURLLookup(element).then(cardObj => {
            // frag.appendChild(addIMG(cardObj.imageUrl));
            return cardObj
        }))
    });
    Promise.all(promises).then(function(values){
        let cardNames = []
        values.forEach(card =>{
            cardNames.push(card.name)
        })
        // let blob = new Blob([cardNames.join("\n")], {type: "text/plain;charset=utf-8"});
        // FileSaver.saveAs(blob, "test.txt");
        $("body h1").remove()
        totalCardArray = values
        totalCardArray = shuffle(totalCardArray)
        addCardToPile(pile1)
        addCardToPile(pile2)
        addCardToPile(pile3)
        makePileUI()
    })
})


function pileClick () {
    if ($(this).children("img").css("visibility") === "visible") {
        $("#pileDisplaySection").remove()
        $("#newDraftBtn").after("<section id='pileDisplaySection'></section>")
        const pileDisplaySection = $("#pileDisplaySection")
        let pileActivated
        switch (this.id) {
            case "pile1":
            pileActivated = pile1
            pileDisplaySection.append("<h1>Pile 1</h1>")
            $("#pileDisplaySection").addClass("pile1")
            break;
            case "pile2":
            pileActivated = pile2
            pileDisplaySection.append("<h1>Pile 2</h1>")
            $("#pileDisplaySection").addClass("pile2")
            break;
            case "pile3":
            pileActivated = pile3
            pileDisplaySection.append("<h1>Pile 3</h1>")
            $("#pileDisplaySection").addClass("pile3")
            break;
            case "library":
            return
        }

        pileDisplaySection.append("<section id='cardImageSection' class='cardPiles'></section>")
        const cardImageSection = $("#cardImageSection")

        // pileDisplaySection.appendChild(pileDisplayHeader)
        pileActivated.forEach(element => {
            cardImageSection.append(`<img src = '${element.imageUrl}' alt = '${element.name}' draggable='false'></img> `)
        });



        pileDisplaySection.append("<section id='pileDisplayBtns'><input type='button' value='Take Pile' class='takePileBtn'><input type='button' value='Close Pile' class='closePileBtn'></section>")

        $(".closePileBtn").click(closePile)
        $(".takePileBtn").click(takePile)
    }
}

function displayUserHand () {
    userHandSection = $("#userHand")
    userHandSection.remove()
    $("#content").append(
        `<section id="userHand">
            <h1>Hand</h1>
        </section>`
    )
    userHand.forEach(element => {
        $("#userHand").append(`<img src = '${element.imageUrl}' alt = '${element.name}' draggable='false'>`)
    })
}

function closePile () {
    $("#pileDisplaySection").remove()
}

function takePile () {
    let $currentSection = $(this)
    if ($currentSection.parent().parent().hasClass("pile1")) {
        userHand = userHand.concat(pile1)
        pile1 = []
        addCardToPile(pile1)
        closePile()
        if (pile1.length === 0) {
            $("#pile1 img").css("visibility", "hidden")
        }
    } else if ($currentSection.parent().parent().hasClass("pile2")) {
        userHand = userHand.concat(pile2)
        pile2 = []
        addCardToPile(pile2)
        closePile()
        if (pile2.length === 0) {
            $("#pile2 img").css("visibility", "hidden")
        }
    } else if ($currentSection.parent().parent().hasClass("pile3")) {
        userHand = userHand.concat(pile3)
        pile3 = []
        addCardToPile(pile3)
        closePile()
        if (pile3.length === 0) {
            $("#pile3 img").css("visibility", "hidden")
        }
    }
    displayUserHand()
}

function makePileUI () {

    body.append("<div id='selectionArea'></div>")

    const selectionArea = $("#selectionArea")

    selectionArea.prepend("<section class=\"cardPile clickable\" id=\"pile3\"><h1>Pile 3</h1><img draggable=\"false\" src=\"http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card\"></img></section>")

    selectionArea.prepend("<section class=\"cardPile clickable\" id=\"pile2\"><h1>Pile 2</h1><img draggable=\"false\" src=\"http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card\"></img></section>")


    selectionArea.prepend("<section class=\"cardPile clickable\" id=\"pile1\"><h1>Pile 1</h1><img draggable=\"false\" src=\"http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card\"></img></section>")


    selectionArea.prepend("<section class=\"cardPile\" id=\"library\">\n<h1>Library</h1><img src=\"http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card\"></img></section>")


    body.prepend("<input type='button' value='New Draft' id='newDraftBtn'>")

    $(".clickable").click(pileClick)
    $("#newDraftBtn").click(function () {
        $("#selectionArea").empty()
        $("form").show()
        $("#userHand").remove()
        closePile()
        pile1 = []
        pile2 = []
        pile3 = []
        totalCardArray = []
        userHand = []
    })
    DragDropManager()
}



function DragDropManager () {
    const pile1Section = document.querySelector("#pile1")
    pile1Section.ondragover = event => {
        event.preventDefault()
    }
    pile1Section.ondrop = event => {
        event.preventDefault()
        addCardToPile(pile1)
        M.toast({html: "Card Added To Pile 1", classes: "move"})
        closePile()
    }

    const pile2Section = document.querySelector("#pile2")
    pile2Section.ondragover = event => {
        event.preventDefault()
    }
    pile2Section.ondrop = event => {
        event.preventDefault()
        addCardToPile(pile2)
        M.toast({html: "Card Added To Pile 2", classes: "move"})
        closePile()
    }

    const pile3Section = document.querySelector("#pile3")
    pile3Section.ondragover = event => {
        event.preventDefault()
    }
    pile3Section.ondrop = event => {
        event.preventDefault()
        addCardToPile(pile3)
        M.toast({html: "Card Added To Pile 3", classes: "move"})
        closePile()
    }
}