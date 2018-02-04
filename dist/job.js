'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require('eventemitter2');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// .output
// .result
// .status
// .on(...)
// .close()
// events:
//  write
//  statusChanged
var Job = function () {
  function Job(bridge) {
    var _this = this;

    _classCallCheck(this, Job);

    this.eventsLoop = [];
    this.emitter = new _eventemitter.EventEmitter2();
    this.outputs = [];
    bridge.sub(function (_ref) {
      var type = _ref.type,
          data = _ref.data;

      if (_this.closed) {
        return;
      }
      switch (type) {
        case 'push':
          _this.eventsLoop.push(data);
          break;
        case 'rm':
          _this.eventsLoop = _this.eventsLoop.filter(function (x, i) {
            return x === data && _this.eventsLoop.indexOf(data) === i;
          });
          break;
        case 'write':
          _this.emitter.emit('write', data);
          data.time = Date.now();
          _this.outputs.push(data);
          break;
        case 'crashed':
          _this.crashed = true;
          _this.error = data;
          break;
        case 'result':
          _this.result = data;
          break;
        default:
      }
      _this.updateStatus();
    });
    this.on = this.emitter.on;
  }

  _createClass(Job, [{
    key: 'updateStatus',
    value: function updateStatus() {
      var status = 'running';
      if (this.crashed) {
        status = 'crashed';
      } else if (this.eventsLoop.length === 0) {
        status = 'finished';
      }
      if (status !== this.status) {
        this.status = status;
        this.emitter.emit('statusChanged', status);
      }
    }
  }, {
    key: 'close',
    value: function close() {
      this.closed = true;
      this.status = 'closed';
    }
  }]);

  return Job;
}();

exports.default = Job;