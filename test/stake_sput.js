var co = require('co');
var channel = require('../src/coChannel');

var sleep = function(millSec){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millSec);
  })
}

function test1(){
	var ch = new channel();
	ch.put(1);
	var result = ch.stake();
	console.log('test1', result && result[0] == 1, result);
}

function test2(){
	var ch = new channel();
	//ch.put(1);
	var result = ch.stake();
	console.log('test2', result == false, result);
}

function test3(){
	var ch = new channel();
	ch.take();
	var result = ch.sput(1);
	console.log('test3', result == true, result);
}

function test4(){
	var ch = new channel();
	//ch.take();
	var result = ch.sput(1);
	console.log('test4', result == false, result);
}


test1();
test2();
test3();
test3();