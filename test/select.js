var co = require('co');
var channel = require('../src/coChannel');

var sleep = function(millSec){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millSec);
  })
}

function test1(){
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
	sleep(100).then(_ => console.log('test1', sequence == '2', sequence))
}

function test2(){
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
	sleep(100).then(_ => console.log('test2', sequence == '22', sequence))
}

test1();
test2();


