var co = require('co');
var assert = require('assert');
var channel = require('../src/coChannel');

var sleep = function(millSec){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millSec);
  })
}

describe('Channel with 3 buffer', _ => {
	it('should wait when the fourth brick is attempting to put', done => {
		var ch = new channel(3);
		var sequence = '';
		Promise.all([
			co(function*(){
				sequence += 0;
				yield ch.put(1);
				yield ch.put(1);
				yield ch.put(1);
				sequence += 2;
				yield ch.put(1);
				sequence += 3;
			}),
			co(function*(){
				sequence += 1;
				var brick = yield ch.take();
				var brick = yield ch.take();
				var brick = yield ch.take();
				sequence += 2;
				var brick = yield ch.take();
				sequence += 3;
			})
		]).then(_ => {
			if(sequence == '012233') done();
			else done(sequence);
		}).catch(err => done(err));
	})

	it('should wait when the seventh brick is attempting to put', done => {
		var ch = new channel(3);
		var sequence = '';
		Promise.race([
			Promise.all([
				co(function*(){
					sequence += 0;
					var brick = yield ch.take();
					var brick = yield ch.take();
					var brick = yield ch.take();
					sequence += 2;
				}),
				co(function*(){
					sequence += 0;
					yield ch.put(1);
					sequence += 1;
					yield ch.put(1);
					sequence += 1;
					yield ch.put(1);
					sequence += 2;
					yield ch.put(1);
					yield ch.put(1);
					yield ch.put(1);
					sequence += 2;
					yield ch.put(1);
					sequence += 'error';
				})
			]),
			sleep(100)
		])
		.then(_ => {
			if(sequence == '0011222') done();
			else done(sequence);
		})
		.catch(err => done(err));
	})
})



