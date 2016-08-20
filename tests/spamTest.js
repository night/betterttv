const assert = require('assert');
var spam = require('../src/js/features/spam-filter.js').filterRepetitive;


var msg1 = 'ddddddddddddddddddddddddddd';
var msg2 = 'vddddddddddddddddd';
var msg3 = 'vdvddddddddd';
var msg4 = 'Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online SwiftRage Play Online Swif';
var msg5 = 'This game is so boring ResidentSleeper ResidentSleeper    ResidentSleeper ResidentSleeper ResidentSleeper ResidentSleeper ResidentSleeper ResidentSleeper';
var msg6 = 'MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK MOD GREEK';

assert.deepEqual(spam(msg1), 'd');
assert.deepEqual(spam(msg2), 'd');
assert.deepEqual(spam(msg3), 'd');
assert.deepEqual(spam(msg4), 'Play Online SwiftRage');
assert.deepEqual(spam(msg5), 'ResidentSleeper');
assert.deepEqual(spam(msg6), 'MOD GREEK');




