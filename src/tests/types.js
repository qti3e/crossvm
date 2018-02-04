import {registerVMDef, createContext, run} from '../lib';
import {expect} from 'chai';

describe('registerVMDef', () => {
  it('should be function', () => {
    expect(registerVMDef).to.be.a('function');
  });
  it('should set global variable', () => {
    registerVMDef('name', {a: 5});
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
  it('should be function', () => {
    expect(createContext).to.be.a('function');
  });
});
