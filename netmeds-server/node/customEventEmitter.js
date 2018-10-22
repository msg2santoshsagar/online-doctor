/*jshint esversion: 6 */

var events = require('events');

const eventEmitter = new events.EventEmitter();

function emitEvent(str, code, payload) {
	'use strict';
	eventEmitter.emit(str, code, payload);
}

function registerEvent(str, callback) {
	'use strict';
	eventEmitter.on(str, callback);
}

function registerEventOnce(str, callback) {
	'use strict';
	eventEmitter.once(str, callback);
}

exports.emitEvent = emitEvent;
exports.registerEvent = registerEvent;
exports.registerEventOnce = registerEventOnce;
2