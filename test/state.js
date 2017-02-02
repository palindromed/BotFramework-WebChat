const deepFreeze = require('deep-freeze');


const activityBuilder = function (args) {

    return deepFreeze({
        type: args.type,
        id: args.id,
        text: args.text || '',
        from: args.from,
        channelData: args.channelData || undefined,
        channelId: args.channelId || undefined,
        conversation: args.conversation || undefined
    });
}

module.exports = {
        initialStateBuilder: (state) => {
        // return empty state by default or a built and frozen state to test against
        return deepFreeze(
            {
                activities: state.activities || [],
                selectedActivity: state.selectedActivity || null,
                input: state.input || '',
                clientActivityCounter: state.clientActivityCounter || 0
            }
        )
    },

    createActivities: () => {

        return {
            message1: activityBuilder(
                {
                    type: 'message',
                    id: 1,
                    text: 'string',
                    from: {
                        id: 42
                    },
                    channelData: {
                        clientActivityId: 89
                    },
                    channelId: 'a bit of data',
                    conversation: {
                        id: 752
                    }
                }),

            message2: activityBuilder(
                {
                    type: 'message',
                    id: 2,
                    text: 'test',
                    from: {
                        id: 42
                    },
                    channelData: {
                        clientActivityId: 89
                    },
                    channelId: 'a bit of data',
                    conversation: {
                        id: 752
                    }
                }),

            message3: activityBuilder(
                {
                    type: 'message',
                    id: 23,
                    text: 'send this',
                    from: {
                        id: 4
                    },
                    channelId: 'a bit of data',
                    conversation: {
                        id: 752
                    }
                }),

            message4: activityBuilder(
                {
                    type: 'message',
                    id: 3,
                    text: 'no more typing',
                    from: {
                        id: 42
                    },
                    channelData: {
                        clientActivityId: 89
                    },
                    channelId: 'a bit of data',
                    conversation: {
                        id: 752
                    }
                }),

            typingActivity: activityBuilder(
                {
                    type: 'typing',
                    id: 4,
                    from: {
                        id: 42
                    },
                    conversation: {
                        id: 752
                    },
                    channelData: {
                        clientActivityId: 89
                    },
                    channelId: 'a bit of data',
                    conversation: {
                        id: 752
                    }
                }),

            userTyping: activityBuilder(
                {
                    type: 'typing',
                    id: 5,

                    from: {
                        id: 55
                    },
                    channelData: {
                        clientActivityId: 89
                    },
                    channelId: 'a bit of data',
                    conversation: {
                        id: 752
                    }
                }),


            postBackMsg: activityBuilder(
                {
                    type: 'message',
                    id: 67,
                    from: {
                        id: 42
                    },

                    conversation: {
                        id: 752
                    }
                })

        }

    }

}
