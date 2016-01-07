var co = require('co');
var channel = require('../../src/coChannel');

var sleep = function(millSec){
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millSec);
  })
}

function* player(name, table) {
  while (true) {
    var ball = yield table.take();
    if (ball === channel.CLOSED) {
      console.log(name + ": table's gone");
      return;
    }
    ball.hits ++;
    console.log(name + " " + ball.hits);
    yield sleep(100);
    yield table.put(ball);
  }
}

co(function* () {
  var table = new channel(2);

  co.wrap(player)('ping', table).catch(err => console.log('ping', err));
  co.wrap(player)('pong', table).catch(err => console.log('pong', err));

  yield table.put({hits: 0});
  yield sleep(1000);
  table.close();
}).catch(err => console.log('err', err));