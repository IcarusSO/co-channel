var coChannel = function(no_buffer){
  this._no_buffer = no_buffer ? no_buffer: 1;
  this._getRequest = [];
  this._putRequest = [];
  this._bricks = [];
  this._isClosed = false;
  this._isClosing = false;
  return this;
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

coChannel.prototype.close = function(){
  var promise = this.put(coChannel.CLOSED);
  this._isClosing = true;
  return promise;
}

coChannel.prototype._askForVacancy = function(cb){
  var bricksLength = this._bricks.length;
  if(bricksLength < this._no_buffer) cb();
  else this._putRequest.push(cb);
}

coChannel.prototype._askForBrick = function(cb){
  var bricksLength = this._bricks.length;
  if(bricksLength != 0) this._assignBick(cb);
  else this._getRequest.push(cb);
}

coChannel.prototype._assignBick = function(cb){
  var brick = this._bricks[0];
  if(brick != coChannel.CLOSED){
    this._bricks.splice(0, 1)[0];
    cb(brick);
  }else{
    // close
    this._isClosed = true;
    cb(coChannel.CLOSED);
  }
  this._alertNewVacancy();
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

module.exports = coChannel;