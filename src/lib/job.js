import {EventEmitter2} from 'eventemitter2';

// .output
// .result
// .status
// .on(...)
// .close()
// events:
//  write
//  statusChanged
export default class Job {
  constructor(bridge) {
    this.eventsLoop = [];
    this.emitter = new EventEmitter2();
    this.outputs = [];
    bridge.sub(({type, data}) => {
      if(this.closed) {
        return;
      }
      switch (type) {
      case 'push':
        this.eventsLoop.push(data);
        break;
      case 'rm':
        this.eventsLoop = this.eventsLoop
          .filter((x, i) => x === data && this.eventsLoop.indexOf(data) === i);
        break;
      case 'write':
        this.emitter.emit('write', data);
        data.time = Date.now();
        this.outputs.push(data);
        break;
      case 'crashed':
        this.crashed = true;
        this.error = data;
        break;
      case 'result':
        this.result = data;
        break;
      default:
      }
      this.updateStatus();
    });
    this.on = this.emitter.on;
  }

  updateStatus() {
    let status = 'running';
    if(this.crashed) {
      status = 'crashed';
    } else if(this.eventsLoop.length === 0) {
      status = 'finished';
    }
    if(status !== this.status) {
      this.status = status;
      this.emitter.emit('statusChanged', status);
    }
  }

  close() {
    this.closed = true;
    this.status = 'closed';
  }
}
