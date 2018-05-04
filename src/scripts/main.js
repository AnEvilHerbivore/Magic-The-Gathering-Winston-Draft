const mtg = require("mtgsdk")
const body = document.querySelector("body")
let totalCardArray = []
let pile1 = []
let pile2 = []
let pile3 = []


function addIMG (url) {
    const newIMG = document.createElement("img")
    newIMG.src = url
    return newIMG
}

function cardURLLookup (cardName) {
    return new Promise((resolve, reject) => {
        mtg.card.where({name: cardName})
        .then(result => {
            resolve(result.find(element => {
                return element.imageUrl && element.name === cardName
            })); // "Black Lotus
        })
    })
}

function totalCardList (cardObject) {
    if (cardObject) {
        totalCardArray.push(cardObject)
    }
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const cardListArea = document.querySelector("#cardList")
const searchButton = document.querySelector("#searchButton")



function addCardToPile (arrayOfCards, pileToAddTo) {
    pileToAddTo.push(arrayOfCards.shift())
}

searchButton.addEventListener("click", function () {
    let promises = []
    let cardList = cardListArea.value.trim()
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
            totalCardList(cardObj)
        }))
    });
    Promise.all(promises).then(function(values){
        // body.appendChild(frag)
        totalCardArray = shuffle(totalCardArray)
        addCardToPile(totalCardArray, pile1)
        addCardToPile(totalCardArray, pile2)
        addCardToPile(totalCardArray, pile3)
        makePileUI()
    })


    // console.log(shuffle(totalCardArray))
})


function pileClick () {
    const pileDisplaySection = document.createElement("section")
    const pilePicturesDiv = document.createElement("div")
    const pileDisplayHeader = document.createElement("h1")
    const takePileButton = document.createElement("input")
    const closePileButton = document.createElement("input")
    let pileActivated
    switch (this.id) {
        case "pile1":
            pileActivated = pile1
            pileDisplayHeader.textContent = "Pile 1"
            break;
        case "pile2":
            pileActivated = pile2
            pileDisplayHeader.textContent = "Pile 2"
            break;
        case "pile3":
            pileActivated = pile3
            pileDisplayHeader.textContent = "Pile 3"
            break;
        case "library":
            pileActivated = totalCardArray
            pileDisplayHeader.textContent = "Library"
            break;
        }
    pileDisplaySection.appendChild(pileDisplayHeader)
    pileActivated.forEach(element => {
        pilePicturesDiv.appendChild(addIMG(element.imageUrl))
    });
    pileDisplaySection.appendChild(pilePicturesDiv)


    takePileButton.value = "Take Pile"
    closePileButton.value = "Close Pile"

    takePileButton.type = "button"
    closePileButton.type = "button"

    closePileButton.addEventListener("click", closePile)


    pileDisplaySection.appendChild(takePileButton)
    pileDisplaySection.appendChild(closePileButton)



    body.insertBefore(pileDisplaySection, body.childNodes[0])
}


function closePile () {
    event.target.parentElement.remove()
}


function makePileUI () {
    const frag = document.createDocumentFragment()
    const librarySection = document.createElement("section")
    const pile1Section = document.createElement("section")
    const pile2Section = document.createElement("section")
    const pile3Section = document.createElement("section")

    librarySection.appendChild(addIMG("http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card"))
    pile1Section.appendChild(addIMG("http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card"))
    pile2Section.appendChild(addIMG("http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card"))
    pile3Section.appendChild(addIMG("http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=0&type=card"))

    const libraryHeader = document.createElement("h1")
    const pile1Header = document.createElement("h1")
    const pile2Header = document.createElement("h1")
    const pile3Header = document.createElement("h1")

    libraryHeader.textContent = "Library"
    pile1Header.textContent = "Pile 1"
    pile2Header.textContent = "Pile 2"
    pile3Header.textContent = "Pile 3"

    librarySection.addEventListener("click", pileClick)
    pile1Section.addEventListener("click", pileClick)
    pile2Section.addEventListener("click", pileClick)
    pile3Section.addEventListener("click", pileClick)


    librarySection.appendChild(libraryHeader)
    pile1Section.appendChild(pile1Header)
    pile2Section.appendChild(pile2Header)
    pile3Section.appendChild(pile3Header)

    librarySection.id = "library"
    pile1Section.id = "pile1"
    pile2Section.id = "pile2"
    pile3Section.id = "pile3"



    frag.appendChild(librarySection)
    frag.appendChild(pile1Section)
    frag.appendChild(pile2Section)
    frag.appendChild(pile3Section)

    body.insertBefore(frag, body.childNodes[0])
    // body.appendChild(frag)
}

