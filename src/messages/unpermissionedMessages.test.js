const {expect} = require('chai');
const {getUnpermissionedResponse} = require('./unpermissionedMessages');

describe('Unpermissioned Messages', () => {
  it('gives youtube link', () => {
    expect(getUnpermissionedResponse('!youtube')).to.have.string('youtube');
  });

  it('gives twitter link', () => {
    expect(getUnpermissionedResponse('!twitter')).to.have.string('twitter');
  });

  it('lets users be salty', () => {
    expect(getUnpermissionedResponse('!salt')).to.have.string('PJSalt');
  });

  it('links to archives', () => {
    ['!vrd1', '!vrd2', '!archives'].forEach(item => {
      expect(getUnpermissionedResponse(item)).to.have.string('1AdrhW', `${item} failed to get spreadsheet`);
    });
  });
});
