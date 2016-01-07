"use strict";
var co = require('co');
var channel = require('../../coChannel');

var sleep = function(millSec){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millSec);
  })
}

// scripting pages
var scripter1Co = function* (outCh){
	for(let page = 0; page < 5; page++){
		yield sleep(500).then(_ => console.log('page', page, 'catched'));
		var rows = [];
		for(let row = 0; row < 7; row++){
			rows.push(row);
		}
		var brick = {page: page, rows: rows};
		yield outCh.put(brick);
	}
	outCh.close();
}

// scripting coordinate of each row
var scripter2Co = function* (inCh){
	while(true){
		var brick = yield inCh.take();
		if(brick == channel.CLOSED) return;
		var page = brick.page;
		var rows = brick.rows;
		for(var i = 0; i < rows.length; i++){
			var coord = yield sleep(100).then(_ => ""+Math.random());
			console.log('page', page, 'row', i, 'coord', coord);
		}
	}
}


var ch = new channel(1000);
co.wrap(scripter1Co)(ch).catch(err => console.log('scripter1Go', err));
co.wrap(scripter2Co)(ch).catch(err => console.log('scripter2Go', err));

