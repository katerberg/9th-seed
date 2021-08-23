const {expect} = require('chai');
const {getModResponse} = require('./modMessages');
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
    expect(getUnpermissionedResponse('!banned')).to.have.string('rules-and-formats/banned-restricted');
    expect(getUnpermissionedResponse('!ban')).to.have.string('rules-and-formats/banned-restricted');
    expect(getUnpermissionedResponse('!banlist')).to.have.string('rules-and-formats/banned-restricted');
    expect(getUnpermissionedResponse('!bans')).to.have.string('rules-and-formats/banned-restricted');
  });

  it('gives twitter link', () => {
    expect(getUnpermissionedResponse('!twitter')).to.have.string('twitter');
  });

  it('lets users be salty', () => {
    expect(getUnpermissionedResponse('!salt')).to.have.string('PJSalt');
  });

  it('links to archives', () => {
    ['!vrd1', '!vrd2', '!vrd3', '!vrd4', '!vrd5', '!archives'].forEach(item => {
      expect(getUnpermissionedResponse(item)).to.have.string('1AdrhW', `${item} failed to get spreadsheet`);
    });
  });

  it('links to current draft', () => {
    ['!vrd6', '!decks', '!decklists', '!draft', '!picks', '!sheet'].forEach(item => {
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

  describe('!winning', () => {
    beforeEach(() => {
      getModResponse('!clearVotes', process.env.CHANNEL || 'stlotusmtg');
    });

    it('votes for a valid player', async() => {
      const result = await getUnpermissionedResponse('!winning elaine', {username: 'foobar'});

      expect(result).to.have.string('1 vote for elaine');
    });

    it('gives error messages for an invalid player', async() => {
      const result = await getUnpermissionedResponse('!winning blahblahblah', {username: 'foobar'});

      expect(result).to.have.string('Try voting for one of these');
    });
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

      expect(result).to.have.string('"Lim-D" doesn\'t exist. lim-dul\'s vault has');
    });

    it('does fuzzy matching for an unknown card', async() => {
      const result = await getUnpermissionedResponse('!pick Black Lotsu');

      expect(result).to.have.string('"Black Lotsu" doesn\'t exist. black lotus has');
    });

    it('gives accurate name when fuzzy matching for a known split card', async() => {
      const result = await getUnpermissionedResponse('!pick Fire');

      expect(result).to.have.string('"Fire" doesn\'t exist. fire // ice has');
      expect(result).to.have.string('1 time ');
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
