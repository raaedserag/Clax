// Modules
const eventEmmiter = require("events").EventEmitter;
const requestsEvent = new eventEmmiter()
module.exports.requestsEvent = requestsEvent;

// Events Names
const interruptRequest = 'stop_request'
const idleRequest = 'consume_request'

//********************* Emmiters ******************
// Arrise request interruption signal
module.exports.arriseReqInterrupt = function (requestRef) {
    return requestsEvent.emit(interruptRequest, requestRef)
}

//Arrise request consumption signal
module.exports.arriseReqConsume = function (requestRef) {
    return requestsEvent.emit(idleRequest, requestRef)
}

//********************* Listeners ******************
// Attach request interruption callback
module.exports.listenReqInterrupt = function (callback) {
    return requestsEvent.on(interruptRequest, callback)
}

// Attach request consumption callback
module.exports.listenReqConsume = function (callback) {
    return requestsEvent.on(idleRequest, callback)
}

//********************* Deafening ******************
// Attach request interruption callback
module.exports.deafReqInterrupt = function (callback) {
    return requestsEvent.removeListener(interruptRequest, callback)
}

// Attach request consumption callback
module.exports.deafReqConsume = function (callback) {
    return requestsEvent.removeListener(idleRequest, callback)
}

