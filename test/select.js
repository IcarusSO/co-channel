var co = require('co');
var assert = require('assert');
var channel = require('../src/coChannel');

var sleep = function(millSec){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millSec);
  })
}

describe('Selecting a channel', _ => {
	describe('selected from two put channel', _ => {
		it('should select the one with take first', done => {
			var sequence = '';
			var ch1 = new channel();
			var ch2 = new channel();

			co(function*(){
				yield channel.select([
					ch1.put.selected(),
					ch2.put.selected()
				]);
			})

			ch2.take().then(_ => sequence += 2);
			ch1.take().then( _=> sequence += 1);
			sleep(100).then(_ => {
				if(sequence == '2') done();
				else done(sequence);
			})
		})
	})	

	describe('selected from two take channel', _ => {
		it('should select the one with put first', done => {
			var sequence = '';
			var ch1 = new channel();
			var ch2 = new channel();

			co(function*(){
				var brick = yield channel.select([
					ch1.take.selected(),
					ch2.take.selected()
				]);
				sequence += brick;
			})

			ch2.put(2).then(_ => sequence += 2);
			ch1.put(1).then( _=> sequence += 1);
			sleep(100).then(_ => {
				if(sequence == '22') done();
				else done(sequence);
			})
		})
	})	
})



