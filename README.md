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
// Communicating sequential processes
// Each process is considered as executing independently and communicated via co-channel
// Process 1 initilize a data brick, pass to process 2 via channel-1
// Process 2 reveive data via channel-1, and pass to process 3 via channel-2
// Process 3 receive data via channel-2, and pass back to process 1 via channel-1
// Process 1 wait until data received from process 3 and print the data out
var ch1 = new channel();
var ch2 = new channel();
var ch3 = new channel();
// Process 1
co(function*(){
    var data = '0';
    yield ch1.put(data);
    data = yield ch3.take();
    console.log(data);
})
// Process 2
co(function*(){
    var data = ch1.take();
    data += '-1';
    ch2.put(data);
})
// Process 3
co(function*(){
    var data = ch2.take();
    data += '-2';
    ch3.put(data)
})
```
```javascript
// selecting the channel which is available first 
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
```javascript
// Scrapper
// Another milestone of co-channel is to allow co-routine scrapping
// co-channel allow wrapping a promise to limit the number of co-occurrence
var download = function(url){
	return new Promise((resolve, reject) => {
		http.get(url, function(response){
			response.setEncoding('utf8');
			var data = '';
			response.on('data', function(chunk){
				data += chunk;
			})
			response.on('end', function(){
				resolve(data);
			})
		})
		.on('error', function(err){
			reject(err);
		})
	})
}
var downloadCo = channel.wrap(download); // wrapping a http-download promise
var ch = new channel(2); // limiting the co-occurrence be 2

downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))
downloadCo('http://www.example.com/', ch).then(_ => console.log(i++)).catch(err => console.log(err))

// Those http requests are queued and doing max 2 http request in the same time
```


### Api
* [new channel(buffer_no, type='default')] - create a new co-channel with number of buffers, default is zero. Types of channel can be 'default', 'sliding' or 'droping'
* [channel.put(brick)] - return a Promise which will be resolved when the channel has vacancy and the brick is put to the channel.
* [channel.take()] - return a Promise which will be resolved with a brick in the channel
* [channel.close()] - add a channel.CLOSED brick to the channel and return a promise when the all the bricks 
* [channel.stake()] - attempt to take a brick immediately. return [brick] if there is a brick in the channel, return false if there is no bricks
* [channel.sput(brick)] - attemp to put a brick immediately. return true if there the brick successfully and return false if can't
* [channel.select(selectedArr)] - selecting the first channel which is valid, return a Prmise
* [channel.take.selected()] - used in channel.select, take action if it is the selected channel
* [channel.put.selected()] - used in channel.select, put action if it is the selected channel
* [channel.wrap(promise)] - wrapping a promise to make it accepting channel as the last argument which be used to control to co-occurrence
* [channel.DEFAULT] - type of a channel, extra buffers are queued
* [channel.DROPPING] - type of a channel, extra buffers are dropped
* [channel.SLIDING] - type of a channel, extra buffers replace the eraliest buffers

   [new channel(buffer_no, type='default')]: <https://github.com/IcarusSO/co-channel>
   [channel.put(brick)]: <https://github.com/IcarusSO/co-channel>
   [channel.take()]: <https://github.com/IcarusSO/co-channel>
   [channel.close()]: <https://github.com/IcarusSO/co-channel>
   [channel.stake()]: <https://github.com/IcarusSO/co-channel>
   [channel.sput(brick)]: <https://github.com/IcarusSO/co-channel>
   [channel.select(selectedArr)]: <https://github.com/IcarusSO/co-channel>
   [channel.take.selected()]: <https://github.com/IcarusSO/co-channel>
   [channel.put.selected()]: <https://github.com/IcarusSO/co-channel>
   [channel.wrap()]: <https://github.com/IcarusSO/co-channel>
   [channel.DEFAULT]: <https://github.com/IcarusSO/co-channel>
   [channel.SLIDING]: <https://github.com/IcarusSO/co-channel>
   [channel.DROPING]: <https://github.com/IcarusSO/co-channel>
   


### Future development
By default, javascript's coroutine is not good at handling heavy calculation routines without IO-blocking. Machine-learning is one of the example. co-channel a step close to using muli-processor and web-workers to better structure the program.

### Contact
Icarus icarus.so.ch@gmail.com

## License
MIT

