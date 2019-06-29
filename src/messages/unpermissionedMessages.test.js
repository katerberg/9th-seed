const {expect} = require('chai');
const {getUnpermissionedResponse} = require('./unpermissionedMessages');

describe('Unpermissioned Messages', () => {
  it('gives youtube link', () => {
    expect(getUnpermissionedResponse('!youtube')).to.have.string('youtube');
  });
});
