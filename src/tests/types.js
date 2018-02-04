import {expect, assert} from 'chai';
import {registerVMDef, createContext, run} from '../lib';
import Job from '../lib/job';

describe('registerVMDef', () => {
  it('should be function', () => {
    expect(registerVMDef).to.be.a('function');
  });
  it('should set global variable', () => {
    registerVMDef('name', function () {});
    expect(global.crossVMDef).to.have.property('name');
  });
});

describe('createContext', () => {
  let context = createContext();
  it('should be function', () => {
    expect(createContext).to.be.a('function');
  });
  it('should return context object', () => {
    expect(context).to.have.property('ref');
    expect(context).to.have.property('get');
    expect(context).to.have.property('getSandbox');
  });
  describe('get', () => {
    run('a = "Hello from CrossVM"', context);
    it('should return the right value', () => {
      expect(context.get('a')).to.equal('Hello from CrossVM');
    });
  });
});

describe('run', () => {
  let context = createContext({x: 10});
  let context2 = createContext();
  it('should be function', () => {
    expect(createContext).to.be.a('function');
  });
  it('should return a Job', () => {
    let job = run('', context);
    assert(job instanceof Job);
  });
  it('should return expression', () => {
    let job = run('a = 4', context);
    expect(job.result).to.equal(4);
  });
  it('should update sandbox', () => {
    let job = run('a += 4', context);
    expect(job.result).to.equal(8);
  });
  it('should not change other context', () => {
    let job2 = run('a = 2', context2);
    let job1 = run('a', context);
    expect(job2.result).to.equal(2);
    expect(job1.result).to.equal(8);
  });
  it('should write data to console', () => {
    let job = run('console.log("Hello")', context);
    job.on('write', ({data}) => {
      expect(data[0]).to.equal('Hello');
    });
  });
  it('should use sandbox initial values', () => {
    run('x += 5', context);
    expect(context.get('x')).to.equal(15);
  });
  describe('crash', () => {
    it('cause by parse error', () => {
      let job = run('x += a.', context);
      expect(job.status).to.equal('crashed');
    });
    it('cause by run-time', () => {
      let job = run('f()', context);
      expect(job.status).to.equal('crashed');
    });
  });
});

describe('timers', () => {
  let context = createContext();
  let job = run('setTimeout(function(){}, 200)', context);
  it('should be in `running` mode when timer is not finished', () => {
    setTimeout(function () {
      expect(job.status).to.equal('running');
    }, 50);
  });
  it('should finish after timer', () => {
    setTimeout(function () {
      expect(job.status).to.equal('finished');
    }, 250);
  });
});
