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

  describe('!winning', () => {
    beforeEach(() => {
      getModResponse('!clearVotes', 'stlvrd');
    });

    it('votes for a valid player', async() => {
      const result = await getUnpermissionedResponse('!winning jeff', {username: 'foobar'});

      expect(result).to.have.string('1 vote for jeff');
    });

    it('gives error messages for an invalid player', async() => {
      const result = await getUnpermissionedResponse('!winning blahblahblah', {username: 'foobar'});

      expect(result).to.have.string('Try voting for one of these');
    });
  });

  describe('!pick', () => {
    it('gives stats for a known card', async() => {
      const result = await getUnpermissionedResponse('!pick Black Lotus');

      expect(result).to.have.string('14 times');
      expect(result).to.have.string('at pick 1.3 (round 1)');
    });

    it('says an undrafted card is not playable', async() => {
      const result = await getUnpermissionedResponse('!pick Crocanura');

      expect(result).to.have.string('has not been picked');
    });

    it('does fuzzy matching for a partial card', async() => {
      const result = await getUnpermissionedResponse('!pick Lim-D');

      expect(result).to.have.string('"Lim-D" doesn\'t exist. lim-dul\'s vault has');
      expect(result).to.have.string('3 times');
    });

    it('does fuzzy matching for an unknown card', async() => {
      const result = await getUnpermissionedResponse('!pick Black Lotsu');

      expect(result).to.have.string('"Black Lotsu" doesn\'t exist. black lotus has');
      expect(result).to.have.string('14 times');
    });

    it('gives accurate name when fuzzy matching for a known split card', async() => {
      const result = await getUnpermissionedResponse('!pick Fire');

      expect(result).to.have.string('"Fire" isn\'t a full card name. fire diamond has');
      expect(result).to.have.string('1 time ');
    });

    it('gives up if nothing matches', async() => {
      const result = await getUnpermissionedResponse('!pick &&&&');

      expect(result).to.have.string('Sorry');
    });
  });
});
