const {expect} = require('chai');
const {getUnpermissionedResponse} = require('./unpermissionedMessages');

describe('Unpermissioned Messages', () => {
  beforeEach(() => {
    sinon.stub(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  it('handles missing message', () => {
    expect(getUnpermissionedResponse()).to.be.undefined;
  });

  it('gives youtube link', () => {
    expect(getUnpermissionedResponse('!youtube')).to.have.string('youtube');
  });

  it('gives link to ban list', () => {
    ['!banned', '!ban', '!banlist', '!bans'].forEach(item => {
      expect(getUnpermissionedResponse(item)).to.have.string('/rulings');
    });
  });

  it('gives twitter link', () => {
    expect(getUnpermissionedResponse('!twitter')).to.have.string('twitter');
  });

  it('is case insensitive', () => {
    expect(getUnpermissionedResponse('!twIttEr')).to.have.string('twitter');
  });

  it('lets users be salty', () => {
    expect(getUnpermissionedResponse('!salt')).to.have.string('PJSalt');
  });

  it('links to archives', () => {
    ['!vrd1', '!vrd2', '!vrd3', '!vrd4', '!vrd5', '!vrd6', '!archives'].forEach(item => {
      expect(getUnpermissionedResponse(item)).to.have.string('1AdrhW', `${item} failed to get spreadsheet`);
    });
  });

  it('links to current draft', () => {
    ['!decks', '!decklists', '!draft', '!picks', '!sheet'].forEach(item => {
      expect(getUnpermissionedResponse(item)).to.have.string('Spreadsheet with draft picks', `${item} failed to get spreadsheet`);
    });
  });

  it('links to bracket', () => {
    ['!bracket', '!standings', '!record', '!challonge'].forEach(item => {
      expect(getUnpermissionedResponse(item)).to.have.string('challonge', `${item} failed to get challonge`);
    });
  });

  it('links to suicide prevention', () => {
    expect(getUnpermissionedResponse('!gethelp')).to.have.string('trevorproject');
  });

  describe('!pick', () => {
    it('gives stats for a known card', async() => {
      const result = await getUnpermissionedResponse('!pick Black Lotus');

      expect(result).to.have.string('times (of ');
      expect(result).to.have.string('(round 1)');
    });

    it('says an undrafted card is not playable', async() => {
      const result = await getUnpermissionedResponse('!pick Crocanura');

      expect(result).to.have.string('has not been picked');
    });

    it('does fuzzy matching for a partial card', async() => {
      const result = await getUnpermissionedResponse('!pick Lim-D');

      expect(result).to.have.string('"lim-d" doesn\'t exist. lim-dul\'s vault has');
    });

    it('does fuzzy matching for an unknown card', async() => {
      const result = await getUnpermissionedResponse('!pick Black Lotsu');

      expect(result).to.have.string('"black lotsu" doesn\'t exist. black lotus has');
    });

    it('gives accurate name without sass when fuzzy matching for a known split card', async() => {
      const result = await getUnpermissionedResponse('!pick Fire');

      expect(result).to.have.string('fire // ice has');
      expect(result).not.to.have.string('doesn\'t exist');
    });

    it('does not give stilted language for cards drafted once', async() => {
      const result = await getUnpermissionedResponse('!pick Copper Gnomes');

      expect(result).not.to.have.string('on average');
    });

    it('gives up if nothing matches', async() => {
      const result = await getUnpermissionedResponse('!pick &&&&');

      expect(result).to.have.string('Sorry');
    });
  });
});
