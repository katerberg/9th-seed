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

  it('links to current draft', () => {
    ['!vrd3', '!decks', '!decklists', '!draft', '!picks', '!sheet'].forEach(item => {
      expect(getUnpermissionedResponse(item)).to.have.string('1u7G5', `${item} failed to get spreadsheet`);
    });
  });

  it('links to bracket', () => {
    ['!bracket', '!standings', '!record'].forEach(item => {
      expect(getUnpermissionedResponse(item)).to.have.string('challonge', `${item} failed to get challonge`);
    });
  });

  it('links to suicide prevention', () => {
    expect(getUnpermissionedResponse('!gethelp')).to.have.string('trevorproject');
  });

  describe('!pick', () => {
    it('gives number of times taken for a known card', async() => {
      const result = await getUnpermissionedResponse('!pick Black Lotus');

      expect(result).to.have.string('13 times');
    });

    it('gives unknown message for an unknown card', async() => {
      const result = await getUnpermissionedResponse('!pick Black Lotsu');

      expect(result).to.have.string('Sorry');
    });
  });
});
