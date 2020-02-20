const {expect} = require('chai');
const {getCommandParams, isPermissioned} = require('./utils');

describe('Utils', () => {
  describe('getCommandParams()', () => {
    it('gives things after a space', () => {
      expect(getCommandParams('foo bar toor')).to.equal('bar toor');
    });

    it('gives null for short message', () => {
      expect(getCommandParams('foo')).to.equal(null);
    });
  });

  describe('isPermissioned()', () => {
    it('is true for owner of channel', () => {
      expect(isPermissioned({username: process.env.CHANNEL || 'stlotusmtg'})).to.be.true;
    });

    it('is true for mod', () => {
      expect(isPermissioned({mod: true})).to.be.true;
    });

    it('is false for rando', () => {
      expect(isPermissioned({username: 'someone'})).to.be.false;
    });
  });
});
