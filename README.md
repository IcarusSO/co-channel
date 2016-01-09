# co-channel
Channels for javascript concurrency pattern

### Introduction
This is a light weight framework implementing the channel object for javascript coroutine behaviour. It makes coroutines communication easy.

### Differences between javascript coroutine and goroutine
It is important to understand the differences between javascript's coroutine and goroutine. Javascript's coroutine will switch the execution at any yield point (most yield point in Javascript are IO blocking). Goroutine will switch the execution at any point.

Three cases are investigated.
- [Case I: Heavy calculation processes without IO blocking] 
- [Case II: Heavy calculation processes with IO blocking] 
- [Case III: Light calculation processes with IO blocking] 

   [Case I: Heavy calculation processes without IO blocking]: <https://raw.githubusercontent.com/IcarusSO/co-channel/master/doc/Case%20I-%20Heavy%20calculation%20processes%20without%20IO%20blocking%20.png>
   [Case II: Heavy calculation processes with IO blocking]: <https://raw.githubusercontent.com/IcarusSO/co-channel/master/doc/Case%20II-%20Heavy%20calculation%20processes%20with%20IO%20blocking%20.png>
   [Case III: Light calculation processes with IO blocking]: <https://raw.githubusercontent.com/IcarusSO/co-channel/master/doc/Case%20III-%20Light%20calculation%20processes%20with%20IO%20blocking%20.png>

To-conclude: Coroutine has compatible performance with goroutine when the routines are lightweight computation with heavy IO blocking where is most the cases in real life.

### Examples
The following example illustrating a scripting process. The first data source including the basic information and need to script from another source to get the geolocation.
```javascript
var co = require('co');
var channel = require('co-channel');
```
```javascript
var sleep = function(millSec){
	return new Promise((resolve, reject) => {
		setTimeout(resolve, millSec);
	})
}
```
```javascript
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
```


```javascript
// selecting the channel which is valid first 
var sequence = '';
var ch1 = new channel();
var ch2 = new channel();

co(function*(){
	var brick = yield channel.select([
		ch1.take.selected(),
		ch2.take.selected()
	]);
	console.log('brick from channel 2 is token', brick);
})

ch2.put(2).then(_ => sequence += 2);
ch1.put(1).then( _=> sequence += 1);
```


### Api
* [new channel(buffer_no)] - create a new co-channel with number of buffers, default is one
* [channel.put(brick)] - return a Promise which will be resolved when the channel has vacancy and the brick is put to the channel.
* [channel.take()] - return a Promise which will be resolved with a brick in the channel
* [channel.close()] - add a channel.CLOSED brick to the channel and return a promise when the all the bricks 
* [channel.stake()] - attempt to take a brick immediately. return [brick] if there is a brick in the channel, return false if there is no bricks
* [channel.sput(brick)] - attemp to put a brick immediately. return true if there the brick successfully and return false if can't
* [channel.select(selectedArr)] - selecting the first channel which is valid, return a Prmise
* [channel.take.selected()] - used in channel.select, take action if it is the selected channel
* [channel.put.selected()] - used in channel.select, put action if it is the selected channel

   [new channel(buffer_no)]: <>
   [channel.put(brick)]: <>
   [channel.take()]: <>
   [channel.close()]: <>
   [channel.stake()]: <>
   [channel.sput(brick)]: <>
   [channel.select(selectedArr)]: <>
   [channel.take.selected()]: <>
   [channel.put.selected()]: <>
   


### Future development
By default, javascript's coroutine is not good at handling heavy calculation routines without IO-blocking. Machine-learning is one of the example. co-channel a step close to using muli-processor and web-workers to better structure the program.

### Contact
Icarus icarus.so.ch@gmail.com

## License
MIT

