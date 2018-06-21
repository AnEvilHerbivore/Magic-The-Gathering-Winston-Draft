//This module controls functions related to accessing the external Magic The Gathering API

const mtg = require("mtgsdk")

const apiManager = Object.create({}, {
    //Searches the MTG API for the card based on the name provided, returns a promise for the card object
    cardLookup: {
        value: function (cardName) {
            return new Promise((resolve, reject) => {
                mtg.card.where({name: cardName})
                .then(result => {
                    resolve(result.find(element => {
                        return element.imageUrl && element.name === cardName
                    }))
                })
            })
        }
    }

})

module.exports = apiManager
