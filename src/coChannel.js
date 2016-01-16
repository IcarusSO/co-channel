var coChannel = function(no_buffer, type){
  this._no_buffer = no_buffer == undefined ? 0: no_buffer;
  this._type = type == undefined? coChannel.DEFAULT: type;
  this._getRequest = [];
  this._putRequest = [];
  this._bricks = [];
  this._isClosed = false;
  this._isClosing = false;


  this.put.selected = function(){
    var _this = this;
    var res;
    var queueCb
    var rtn =  new Promise((resolve, reject)=>{
      res = resolve;
    })
    rtn.queue = function(){
      _this.put()
        .then(_ => {
          res(_);
        })
        .catch(err => console.log('err', err));
      queueCb = _this._putRequest[_this._putRequest.length - 1];
    }
    rtn.unqueue = function(){
      var index = _this._putRequest.indexOf(queueCb);
      if(index == -1) return;
      else _this._putRequest.splice(index, 1);
    }
    return rtn;
  }.bind(this);


  this.take.selected = function(){
    var _this = this;
    var res;
    var queueCb
    var rtn =  new Promise((resolve, reject)=>{
      res = resolve;
    })
    rtn.queue = function(){
      _this.take()
        .then(_ => {
          res(_);
        })
        .catch(err => console.log('err', err));
      queueCb = _this._getRequest[_this._getRequest.length - 1];
    }
    rtn.unqueue = function(){
      var index = _this._getRequest.indexOf(queueCb);
      if(index == -1) return;
      else _this._getRequest.splice(index, 1);
    }
    return rtn;
  }.bind(this);

  return this;
}

coChannel.select = function(selectedArr){
  for(var i = 0; i < selectedArr.length; i++){
    var selected = selectedArr[i];
    selected.queue();
  }

  var removeChReserve = function(){
    selectedArr.forEach(selected => selected.unqueue());
  }

  return Promise.race(selectedArr)
    .then(_ => {
      removeChReserve();
      return _;
    })
}


coChannel.prototype.put = function(brick){
  var _this = this;
  if(this._isClosing) return Promise.resolve(false);
  var promise = new Promise((resolve, reject) => {
    this._askForVacancy(() => {
      _this._bricks.push(brick);
      _this._alertNewBrick();
      resolve(true);
    })
  })
  return promise; 
}

coChannel.prototype.take = function(){
  var _this = this;
  var promise = new Promise((resolve, reject) => {
    _this._askForBrick(brick => {
      resolve(brick);
    })
  })
  return promise;
}


coChannel.prototype.sput = function(brick){
  if(!this._canPut()) return false;
  this.put(brick);
  return true;
}

coChannel.prototype.stake = function(){
  if(!this._canTake()) return false;
  return [this._takeBrick()];
}

coChannel.prototype.close = function(){
  var promise = this.put(coChannel.CLOSED);
  this._isClosing = true;
  return promise;
}

coChannel.prototype._canPut = function(){
  if(this._getRequest.length > 0) return true;
  if(this._type == coChannel.DISCARD){
    if(this._bricks.length == this._no_buffer){
      this._bricks.pop();
    }
  }
 return (this._bricks.length < this._no_buffer);
}

coChannel.prototype._canTake = function(){
  return this._bricks.length != 0 || this._putRequest.length != 0;
}

coChannel.prototype._askForVacancy = function(cb){
  if(this._canPut()) cb();
  else this._putRequest.push(cb);
}

coChannel.prototype._askForBrick = function(cb){
  this._alertNewVacancy();
  var bricksLength = this._bricks.length;
  if(bricksLength != 0) this._assignBick(cb);
  else this._getRequest.push(cb);
}

coChannel.prototype._assignBick = function(cb){
  var brick = this._takeBrick();
  cb(brick);
  this._alertNewVacancy();
}

coChannel.prototype._takeBrick = function(){
  this._alertNewVacancy();
  var brick = this._bricks[0];
  if(brick != coChannel.CLOSED){
    this._bricks.splice(0, 1)[0];
  }else{
    this._isClosed = true;
  }
  return brick;
}

coChannel.prototype._alertNewBrick = function(){
  if(this._getRequest.length == 0) return;
  var cb = this._getRequest.splice(0, 1)[0];
  this._assignBick(cb);
}

coChannel.prototype._alertNewVacancy = function(){
  if(this._putRequest.length == 0) return;
  var cb = this._putRequest.splice(0, 1)[0];
  cb();
}

coChannel.CLOSED = {};
coChannel.DISCARD = 'discard';
coChannel.DEFAULT = 'default';

module.exports = coChannel;