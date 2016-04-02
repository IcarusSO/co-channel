var co = require('co');
var assert = require('assert');
var channel = require('../src/coChannel');

var sleep = function(millSec){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millSec);
  })
}


describe('Sliding channel with one buffer', _ => {
	it('should discard all previous bricks', done => {
		var ch = new channel(1, 'sliding');
		co(function*(){
			yield ch.put(1);
			yield ch.put(2);
			yield ch.put(3);
			yield ch.put(4);
			yield ch.put(5);
			done();
		})
	})

	it('should get the last brick', done => {
		var ch = new channel(1, 'sliding');
		co(function*(){
			yield ch.put(1);
			yield ch.put(2);
			yield ch.put(3);
			yield ch.put(4);
			yield ch.put(5);

			var brick = yield ch.take();
			if(brick == 5) done();
			else done(brick);
		})
	})
})