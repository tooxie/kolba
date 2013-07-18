var acceptHeaderParser = require('kolba/util').acceptHeaderParser;
var expect = require('expect.js');

describe('acceptHeaderParser utility', function() {
    it('parses */*', function() {
        var parsed = acceptHeaderParser('*/*');

        expect(parsed).to.eql(['*/*']);
    });

    it('parses 2 types without q', function() {
        var html = 'text/html';
        var xhtml = 'application/html+xml';

        var type = [html, xhtml].join(',');

        var parsed = acceptHeaderParser(type);

        expect(parsed).to.eql([html, xhtml])
    });

    it('parses 2 types with q', function() {
        var html = 'text/html;q=0.8';
        var xhtml = 'application/html+xml';

        var type = [html, xhtml].join(',');

        var parsed = acceptHeaderParser(type);
        var expected = ['application/html+xml', 'text/html'];

        expect(parsed).to.eql(expected);
    });

    it('parses types with no q=1', function() {
        var html = 'text/html;q=0.8';
        var xhtml = 'application/html+xml;q=0.9';

        var type = [html, xhtml].join(',');

        var parsed = acceptHeaderParser(type);
        var expected = ['application/html+xml', 'text/html'];

        expect(parsed).to.eql(expected);
    });

    it('parses types with repeated higher q', function() {
        var html = 'text/html;q=0.8';
        var text = 'plain/text;q=0.8';
        var xhtml = 'application/html+xml;q=0.7';

        var type = [html, text, xhtml].join(',');

        var parsed = acceptHeaderParser(type);
        var expected = ['text/html', 'plain/text', 'application/html+xml'];

        expect(parsed).to.eql(expected);
    });

    it('parses types with repeated lower q', function() {
        var html = 'text/html;q=0.7';
        var text = 'plain/text;q=0.7';
        var xhtml = 'application/html+xml;q=0.8';

        var type = [html, text, xhtml].join(',');

        var parsed = acceptHeaderParser(type);
        var expected = ['application/html+xml', 'text/html', 'plain/text'];

        expect(parsed).to.eql(expected);
    });

    it('parses types with q > 1', function() {
        var html = 'text/html';
        var text = 'plain/text;q=2';

        var type = [html, text].join(',');

        var parsed = function() { acceptHeaderParser(type); };

        expect(parsed).to.throwError();
    });

    it("parses firefox's default Accept header", function() {
        var type = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

        var parsed = acceptHeaderParser(type);
        var expected = ['text/html', 'application/xhtml+xml', 'application/xml', '*/*'];

        expect(parsed).to.eql(expected);
    });
});
