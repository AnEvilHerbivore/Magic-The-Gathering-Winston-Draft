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
    })
}