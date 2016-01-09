var co = require('co');
var channel = require('../src/coChannel');

var sleep = function(millSec){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millSec);
  })
}

function test1(){
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
		console.log('test1', sequence == '012233', sequence);
	}).catch(err => console.log('err', err));
}

function test2(){
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
		console.log('test2', sequence == '0011222', sequence);
	})
	.catch(err => console.log('err', err));
}

test1();
test2();

