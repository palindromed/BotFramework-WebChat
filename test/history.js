"use strict";

const chai = require('chai');
const expect = chai.expect;
const history = require('../built/Store.js').history;
const HistoryState = require('../built/Store.js').HistoryState;
const deepFreeze = require('deep-freeze');
const builderFunctions = require('./state.js')

chai.use(require('chai-subset'));

describe('history', function () {

    /* Tests for history reducer */
    it('should start with an empty history', function () {
        expect(history(undefined, { type: undefined })).to.containSubset(builderFunctions.initialStateBuilder({}));
    });

    it('should add a message to activities after empty history', function () {
        const builtActivities = builderFunctions.createActivities();
        let appState = history(builderFunctions.initialStateBuilder({}),
            {
                type: 'Receive_Message',
                activity: builtActivities.message1
            });
        expect(appState).to.containSubset(builderFunctions.initialStateBuilder({ activities: [builtActivities.message1] }));
        expect(appState).to.have.property('activities').to.have.length(1);
    });

    it('receiving message should not increase clientActivityCounter', function () {
        const builtActivities = builderFunctions.createActivities();        
        let appState = history(builderFunctions.initialStateBuilder({}),
            {
                type: 'Receive_Message',
                activity: builtActivities.message1
            });
        expect(appState).to.have.property('clientActivityCounter').to.equal(0);
    });

    it('should add another message from same user when a message already in memory', function () {
        const builtActivities = builderFunctions.createActivities();        
        
        let initialState = builderFunctions.initialStateBuilder(
            {
                clientActivityCounter: 1,
                activities: [
                    builtActivities.message1
                ]
            });
        let appState = history(initialState,
            {
                type: 'Receive_Message',
                activity: builtActivities.message2
            });
        expect(appState).to.have.property('activities').to.have.length(2);
        expect(appState.activities[1]).to.have.property('id').to.equal(builtActivities.message2.id);

    });

    it('should not add a duplicate message', function () {
        const builtActivities = builderFunctions.createActivities();        
        
        let preState = builderFunctions.initialStateBuilder({
            clientActivityCounter: 1,
            activities: [
                builtActivities.message1,
                builtActivities.message2
            ]
        });
        let appState = history(preState, {
            type: 'Receive_Message',
            activity: builtActivities.message2
        });
        expect(preState).to.have.property('activities').to.have.length(2);

        expect(appState).to.containSubset(preState);
        expect(appState).to.have.property('activities').to.have.length(2);
        expect(appState).to.have.property('clientActivityCounter').to.equal(1);
    });

    it('sho`uld add sent message to activities', function () {
        const builtActivities = builderFunctions.createActivities();        
        
        let initialState = builderFunctions.initialStateBuilder({
            clientActivityCounter: 2,
            activities: [
                builtActivities.message1,
                builtActivities.message2
            ]
        });

        let appState = history(initialState, {
            type: 'Send_Message',
            activity: builtActivities.message3
        });
        expect(initialState).to.have.property('activities').to.have.length(2);
        expect(appState).to.have.property('activities').to.have.length(3);
        expect(appState.activities[2]).to.have.property('id').to.equal(builtActivities.message3.id);

    });

    it('sending a message should cause activity counter to increases', function () {
        const builtActivities = builderFunctions.createActivities();        
        
        let initialState = builderFunctions.initialStateBuilder({
            clientActivityCounter: 2,
            activities: [
                builtActivities.message1,
                builtActivities.message2
            ]
        });

        let appState = history(initialState, {
            type: 'Send_Message',
            activity: builtActivities.message3
        });
        expect(initialState).to.have.property('clientActivityCounter').to.equal(2);
        expect(appState).to.have.property('clientActivityCounter').to.equal(3);

    });

    it('should add received message of type typing to activities', function () {
        const builtActivities = builderFunctions.createActivities();        
        
        let initialState = builderFunctions.initialStateBuilder({
            clientActivityCounter: 2,
            activities: [
                builtActivities.message1,
                builtActivities.message2,
                builtActivities.message3
            ]
        });
        let appState = history(initialState, {
            type: 'Receive_Message',
            activity: builtActivities.typingActivity
        })
        expect(appState).to.have.property('activities').to.have.length(4)
        expect(appState.activities[3]).to.have.property('type').to.equal('typing');


    });

    it('receiving typing should not increase clientActivityCounter', function () {
        const builtActivities = builderFunctions.createActivities();        
        
        let initialState = builderFunctions.initialStateBuilder({
            clientActivityCounter: 2,
            activities: [
                builtActivities.message1,
                builtActivities.message2,
                builtActivities.message3
            ]
        });
        let appState = history(initialState, {
            type: 'Receive_Message',
            activity: builtActivities.typingActivity
        })

        expect(appState).to.have.property('clientActivityCounter').to.equal(initialState.clientActivityCounter);


    });

    it('should replace typing with an incoming message', function () {
        const builtActivities = builderFunctions.createActivities();        
        
        let initialState = builderFunctions.initialStateBuilder({
            clientActivityCounter: 2,
            activities: [
                builtActivities.message1,
                builtActivities.message2,
                builtActivities.message3,
                builtActivities.typingActivity
            ]
        });
        let appState = history(initialState, {
            type: 'Receive_Message',
            activity: builtActivities.message4
        });
        expect(appState).to.containSubset(builderFunctions.initialStateBuilder({
            clientActivityCounter: 2,
            activities: [
                builtActivities.message1,
                builtActivities.message2,
                builtActivities.message3,
                builtActivities.message4
            ]
        }));
        expect(initialState).to.have.property('activities').to.have.length(4);
        expect(initialState.activities[3]).to.have.property('type').to.equal('typing');
        expect(appState).to.have.property('activities').to.have.length(4); // typing activity gone
        expect(appState.activities[3]).to.have.property('type').to.equal('message');
    });

    it('should not add a postback message to activities', function () {
        // Receive_Sent_Message would be called due to no channelData
        const builtActivities = builderFunctions.createActivities();        
        
        let initialState = builderFunctions.initialStateBuilder({});
        let appState = history(initialState, {
            type: 'Receive_Sent_Message',
            activity: builtActivities.postBackMsg
        });
        expect(appState).to.containSubset(initialState);
        expect(appState).to.have.property('activities').to.have.length(0);
        expect(appState).to.have.property('clientActivityCounter').to.equal(0);

    });

    it('should add typing if user different', function () {
        const builtActivities = builderFunctions.createActivities();        
        
        let initialState = builderFunctions.initialStateBuilder({ activities: [ builtActivities.typingActivity ] });
        let appState = history(initialState, {
            type: 'Show_Typing',
            activity: builtActivities.userTyping
        });
        let newAppstate = history(appState, {
            type: 'Show_Typing',
            activity: builtActivities.typingActivity
        });
        expect(newAppstate).to.containSubset(builderFunctions.initialStateBuilder({
            clientActivityCounter: 0,
            activities: [
                builtActivities.userTyping,
                builtActivities.typingActivity,
            ]
        }));
        expect(newAppstate).to.containSubset(initialState);
        expect(newAppstate).to.have.property('activities').to.have.length(2);
        expect(newAppstate.activities[1]).to.have.property('type').to.equal('typing');
        expect(newAppstate.activities[0]).to.have.property('id').to.equal(5);
        expect(newAppstate.activities[1]).to.have.property('id').to.equal(4);
    });

    it('should not add more typing action from same user', function () {
        const builtActivities = builderFunctions.createActivities();        
        
        let initialState = builderFunctions.initialStateBuilder({ activities: [builtActivities.userTyping, builtActivities.typingActivity] });
        let appState = history(initialState, {
            type: 'Show_Typing',
            activity: builtActivities.userTyping
        });

        expect(appState).to.containSubset(builderFunctions.initialStateBuilder({
            clientActivityCounter: 0,
            activities: [
                builtActivities.userTyping,
                builtActivities.typingActivity,
            ]
        }));
        expect(appState).to.containSubset(initialState);
        expect(appState).to.have.property('activities').to.have.length(2);
        expect(appState.activities[1]).to.have.property('type').to.equal('typing');
        expect(appState.activities[0]).to.have.property('id').to.equal(4);
        expect(appState.activities[1]).to.have.property('id').to.equal(5);
        expect(appState.activities[1]).to.have.property('from').to.have.property('id').to.equal(55);
        expect(appState.activities[0]).to.have.property('from').to.have.property('id').to.equal(42);


    });

    it('should clear typing for given id when in activities', function () {
        const builtActivities = builderFunctions.createActivities();        
        
        let initialState = builderFunctions.initialStateBuilder({ activities: [builtActivities.userTyping, builtActivities.typingActivity] });
        let appState = history(initialState, {
            type: 'Clear_Typing',
            id: 4
        });

        expect(appState).to.containSubset(builderFunctions.initialStateBuilder({
            clientActivityCounter: 0,
            activities: [
                builtActivities.userTyping
            ]
        }));
        expect(initialState).to.have.property('activities').to.have.length(2);
        expect(appState).to.have.property('activities').to.have.length(1);
        expect(appState.activities[0]).to.have.property('type').to.equal('typing');
        expect(appState.activities[0]).to.have.property('id').to.equal(5);
        expect(appState.activities[0]).to.have.property('from').to.have.property('id').to.equal(55);

    });

    it('should allow for the selections of an activity', function () {
        const builtActivities = builderFunctions.createActivities();        
        
        let initialState = builderFunctions.initialStateBuilder({ activities: [ builtActivities.message1 ] });
        let appState = history(initialState, {
            clientActivityCounter: 1,
            type: 'Select_Activity',
            selectedActivity: builtActivities.message2
        });

        expect(appState).to.have.property('selectedActivity').to.equal(builtActivities.message2);
        expect(appState).to.have.property('activities').to.equal(initialState.activities);
    });

    // it('should be able to try sending message', function () {
    //     let initialState = initialStateBuilder({
    //         clientActivityCounter: 2,
    //         activities: [
    //             message1,
    //             message2
    //         ]
    //     });

    //     let appState = history(initialState, {
    //         type: 'Send_Message_Try',
    //         activity: message3
    //     });
    //     expect(appState).to.containSubset(initialState);
    //     expect(appState).to.have.property('clientActivityCounter').to.equal(3);
    //     expect(appState).to.have.property('activities').to.have.length(3);
    // });


    // var typingActivity = activityBuilder(4, 42, '', 'typing');
    // id, fromId, text, type

    it('should add a message to activities after empty history', () => {
        expect(history(
            deepFreeze({
                activities: [],
                input: null,
                selectedActivity: "",
                clientActivityCounter: 0
            }),
            {
                type: 'Receive_Message',
                activity: {
                    type: "message",
                    text: 'string',
                    id: 1,
                    from: {
                        id: 42
                    }
                }
            })
        ).to.containSubset(

            {
                clientActivityCounter: 0,
                activities: [{
                    type: "message",
                    text: 'string',
                    id: 1,
                    from: {
                        id: 42
                    }
                }],
            })
    });
    it('should add another message from same user when a message alread in memory', () => {
        expect(history(
            deepFreeze({
                clientActivityCounter: 1,
                activities: [{
                    type: "message",
                    text: 'string',
                    id: 1,
                    from: {
                        id: 42
                    }
                }],
            }),
            {
                type: 'Receive_Message',
                activity: {
                    type: "message",
                    text: 'test',
                    id: 2,
                    from: {
                        id: 42
                    }
                }
            })
        ).to.containSubset(
            {
                clientActivityCounter: 1, // counter does not increment on receive
                activities: [{
                    type: "message",
                    text: 'string',
                    id: 1,
                    from: {
                        id: 42
                    }
                },
                {
                    type: "message",
                    text: 'test',
                    id: 2,
                    from: {
                        id: 42
                    }
                }],
            });
    });
    it('should not add a duplicate message', () => {
        let state = {
            clientActivityCounter: 1,
            activities: [{
                type: "message",
                text: 'string',
                id: 1,
                from: {
                    id: 42
                }
            },
            {
                type: "message",
                text: 'test',
                id: 2,
                from: {
                    id: 42
                }
            }]
        };
        deepFreeze(state)
        expect(history(state, {
            type: 'Receive_Message',
            activity: {
                type: "message",
                text: 'test',
                id: 2,
                from: {
                    id: 42
                }
            }
        })).to.containSubset(state);
    });







    // Test Sending Messages
    it('should be able to send message', () => {
        let state = {
            clientActivityCounter: 2,
            activities: [{
                type: "message",
                text: 'string',
                id: 1,
                from: {
                    id: 42
                }
            },
            {
                type: "message",
                text: 'test',
                id: 2,
                from: {
                    id: 42
                }
            }]
        };
        deepFreeze(state);
        expect(history(state, {
            type: 'Send_Message',
            activity: {
                type: "message",
                text: 'test',
                id: 3,
                from: {
                    id: 4
                }
            }
        })).to.containSubset({
            clientActivityCounter: 3, // counter should increment on this activity
            activities: [{
                type: "message",
                text: 'string',
                id: 1,
                from: {
                    id: 42
                }
            },
            {
                type: "message",
                text: 'test',
                id: 2,
                from: {
                    id: 42
                }
            },
            {
                type: "message",
                text: 'test',
                id: 3,
                from: {
                    id: 4
                }
            }]
        });
    });
    
});

// 'Update_Input'
// 'Receive_Sent_Message'
// 'Receive_Message':
// 'Send_Message'
// 'Send_Message_Try'
// 'Send_Message_Succeed'
// 'Send_Message_Fail'
//  'Show_Typing'
//  'Clear_Typing'
// 'Select_Activity'
