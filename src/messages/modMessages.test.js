const {expect} = require('chai');
const {getModResponse} = require('./modMessages');

describe('Mod Messages', () => {
  it('gives shout out if user is channel owner', () => {
    const result = getModResponse('!so neem', {username: process.env.CHANNEL || 'stlotusmtg'});

    expect(result).to.have.string('content');
    expect(result).to.have.string('neem');
  });

  it('gives shout out if user is mod', () => {
    const result = getModResponse('!so neem', {mod: true});

    expect(result).to.have.string('content');
    expect(result).to.have.string('neem');
  });

  it('does not give shout out if missing parameter', () => {
    const result = getModResponse('!so', {mod: true});

    expect(result).to.be.null;
  });

  it('does not give shout out for random user', () => {
    const result = getModResponse('!so neem', {username: 'foobar'});

    expect(result).to.be.null;
  });
});
