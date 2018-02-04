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
  it('should be function', () => {
    expect(createContext).to.be.a('function');
  });
  it('should return string', () => {
    expect(createContext()).to.be.a('string');
  });
});

describe('run', () => {
  let context = createContext();
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
});
