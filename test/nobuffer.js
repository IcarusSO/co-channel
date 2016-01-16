var co = require('co');
var assert = require('assert');
var channel = require('../src/coChannel');

var sleep = function(millSec){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millSec);
  })
}

describe('Channel with no buffer', _ => {
	describe('put a brick then take it', _ => {
		it('should the brick is awaiting to put until a take request', done => {
			var ch = new channel(0);
			var sequence = '';
			Promise.all([
				co(function*(){
					sequence += 0;
					yield ch.put(1);
					sequence += 2;
				}),
				co(function*(){
					sequence += 1;
					var brick = yield ch.take();
					sequence += 2;
				})
			]).then(_ => {
				if(sequence == '0122') done();
				else done(sequence);
			}).catch(err => done(err));
		})
	})

	describe('take a brick then put it', _ => {
		it('should wait unit a brick is put', done => {
			var ch = new channel(0);
			var sequence = '';
			Promise.all([
				co(function*(){
					sequence += 0;
					var brick = yield ch.take();
					sequence += 2;
				}),
				co(function*(){
					sequence += 1;
					yield ch.put(1);
					sequence += 2;
				})
			])
			.then(_ => {
				if(sequence == '0122') done();
				else done(sequence);
			})
			.catch(err => done(err));
		})
	})

	describe('# of bricks be put > # of take', _ => {
		it('should the extra brick cannot be processed', done => {
			var ch = new channel(0);
			var sequence = '';
			Promise.race([
				Promise.all([
					co(function*(){
						sequence += 0;
						yield ch.put(1);
						sequence += 2;
						yield ch.put(1);
						sequence += 'error';
					}),
					co(function*(){
						sequence += 1;
						var brick = yield ch.take();
						sequence += 2;
					})
				]),
				sleep(100)
			]).then(_ => {
				if(sequence == '0122') done();
				else done(sequence);
			}).catch(err => done(err));
		})
	})
})



