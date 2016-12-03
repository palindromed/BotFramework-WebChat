"use strict";

const chai = require('chai');
const expect = chai.expect;
const history = require('../built/Store.js').history;
const HistoryState = require('../built/Store.js').HistoryState;
const BotConnection = require('../built/BotConnection');
const deepFreeze = require('deep-freeze');

chai.use(require('chai-subset'));

describe('history', () => {
    it('should start with an empty history', () => {
        expect(history(undefined, { type: undefined })).to.containSubset({
            activities: [],
            selectedActivity: null,
            clientActivityCounter: 0
        });
    });
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
