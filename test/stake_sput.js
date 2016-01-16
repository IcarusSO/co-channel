var co = require('co');
var assert = require('assert');
var channel = require('../src/coChannel');

var sleep = function(millSec){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millSec);
  })
}

describe('Check a action immediately with stake & sput', _ => {
	it('should stake with true', () => {
		var ch = new channel();
		ch.put(1);
		var result = ch.stake();
		assert.equal(result && result[0] == 1, true);
	})
	it('should stake with false', () => {
		var ch = new channel();
		var result = ch.stake();
		assert.equal(result, false);
	})
	it('should sput with true', () => {
		var ch = new channel();
		ch.take();
		var result = ch.sput(1);
		assert.equal(result, true);
	})
	it('should stake with false', () => {
		var ch = new channel();
		var result = ch.sput(1);
		assert.equal(result, false);
	})
})



