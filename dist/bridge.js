'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// A simple Brige to pass data from evaluated code to Job class (not-reverse)

var Bridge = function () {
  function Bridge() {
    _classCallCheck(this, Bridge);

    this.subscribers = [];
    this.pub = this.pub.bind(this);
    this.sub = this.sub.bind(this);
  }

  _createClass(Bridge, [{
    key: 'pub',
    value: function pub(message) {
      this.subscribers.forEach(function (subscriber) {
        return subscriber(message);
      });
    }
  }, {
    key: 'sub',
    value: function sub(method) {
      if (typeof subscriber !== 'function') {
        return false;
      }
      this.subscriber.push(method);
      return true;
    }
  }]);

  return Bridge;
}();

exports.default = Bridge;