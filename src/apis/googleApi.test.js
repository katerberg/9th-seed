const {expect} = require('chai');
const {sheetUrlToExportUrl} = require('./googleApi');

describe('googleApi', () => {
  describe('sheetUrlToExportUrl()', () => {
    it('translates for bare edit url', () => {
      expect(
        sheetUrlToExportUrl(
          'https://docs.google.com/spreadsheets/d/1AdrhWkDX7i9p2rZbEKzDs3nQAhCvcH0LAXZQNwWMsnA/edit'
        )
      ).to.equal(
        'https://docs.google.com/spreadsheets/d/1AdrhWkDX7i9p2rZbEKzDs3nQAhCvcH0LAXZQNwWMsnA/export?format=csv'
      );
    });

    it('translates for edit url with gid', () => {
      expect(
        sheetUrlToExportUrl(
          'https://docs.google.com/spreadsheets/d/1AdrhWkDX7i9p2rZbEKzDs3nQAhCvcH0LAXZQNwWMsnA/edit?gid=1812669631'
        )
      ).to.equal(
        'https://docs.google.com/spreadsheets/d/1AdrhWkDX7i9p2rZbEKzDs3nQAhCvcH0LAXZQNwWMsnA/export?format=csv&gid=1812669631'
      );
    });

    it('translates for edit url with gid and hash gid', () => {
      expect(
        sheetUrlToExportUrl(
          'https://docs.google.com/spreadsheets/d/1AdrhWkDX7i9p2rZbEKzDs3nQAhCvcH0LAXZQNwWMsnA/edit?gid=1812669631#gid=1812669631'
        )
      ).to.equal(
        'https://docs.google.com/spreadsheets/d/1AdrhWkDX7i9p2rZbEKzDs3nQAhCvcH0LAXZQNwWMsnA/export?format=csv&gid=1812669631'
      );
    });

    it('gives empty string for invalid draft', () => {
      expect(sheetUrlToExportUrl('https://mtgtop8.com')).to.equal('');
    });
  });
});
