const sinon = require('sinon');
const expect = require('chai').expect

global.sinon = sinon;
global.expect = expect;

module.exports = {
  'exit': true,
  'reporter': 'dot',
};
