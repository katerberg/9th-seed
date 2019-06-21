const {expect} = require('chai');
const {getModResponse} = require('./modMessages');

describe('Mod Messages', function() {
  it('gives shout out if user is channel owner', function() {
    const result = getModResponse('!so neem', {username: 'stlvrd'});

    expect(result).to.have.string('content');
    expect(result).to.have.string('neem');
  });

  it('gives shout out if user is mod', function() {
    const result = getModResponse('!so neem', {mod: true});

    expect(result).to.have.string('content');
    expect(result).to.have.string('neem');
  });

  it('does not give shout out for random user', function() {
    const result = getModResponse('!so neem', {username: 'foobar'});

    expect(result).to.be.null;
  });
});


