// A simple Brige to pass data from evaluated code to Job class (not-reverse)

export default class Bridge {
  constructor() {
    this.subscribers = [];
    this.pub = this.pub.bind(this);
    this.sub = this.sub.bind(this);
  }

  pub(message) {
    this.subscribers.forEach(subscriber => subscriber(message));
  }

  sub(method) {
    if(typeof method !== 'function') {
      return false;
    }
    this.subscribers.push(method);
    return true;
  }
}
