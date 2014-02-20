var vows      = require("vows"),
    assert    = require("assert"),
    locco    = require("../../locco"),
    highlight = require("highlight.js"),
    marked    = require("marked");

vows.describe("locco").addBatch({
  '.parse(text [, language])': {

    'var code;': {
      topic: function () {
        return locco.parse("var code;");
      },

      'is the result from highlight': function (content) {
        if (content instanceof Error) 
          throw content;

        assert.equal(
          "<pre><code>" + highlight.highlight("js", "var code;").value + "</code></pre>",

          content);
      }
    },

    '// *something*': {
      topic: function () {
        return locco.parse("// *something*");
      },

      'should be marked': function (content) {
        if (content instanceof Error) 
          throw content;

        assert.equal(marked("*something*"), content);
      }
    },

    '   // *something*': {
      topic: function () {
        return locco.parse("   // *something*");
      },

      'is the result from marked without the comment symbol': function (content) {
        if (content instanceof Error) 
          throw content;

        assert.equal(
          marked("*something*"),

          content);
      }
    },

    '"   // *something*"': {
      topic: function () {
        return locco.parse('"   // *something*"');
      },

      'is the result from highlight since the comment is part of a string': function (content) {
        if (content instanceof Error) 
          throw content;

        assert.equal(
          "<pre><code>" + highlight.highlight("js", '"   // *something*"').value + "</code></pre>",

          content);
      }
    },

    'var e;\n// *this*': {
      topic: function () {
        return locco.parse("var e;\n// *this*");
      },

      'highlight first line, mark second': function (content) {
        if (content instanceof Error) 
          throw content;

        assert.equal(
          "<pre><code>" + highlight.highlight("js", "var e;").value + "</code></pre>\n" + 
          marked("*this*"),

          content);
      }
    },

    'var n;\nn=3;// _je_': {
      topic: function  () {
        return locco.parse("var n;\nn=3;// _je_");
      },

      'highlight both lines, end in marked': function (content) {
        if (content instanceof Error) 
          throw content;

        assert.equal(
          "<pre><code>" + highlight.highlight("js", "var n;\nn=3;").value + "</code></pre>\n" + 
          marked("_je_"),

          content);
      }
    },

    '// ```js\n// var i;\n// ```': {
      topic: function () {
        return locco.parse("// ```js\n// var i;\n// ```");
      },

      'should parse the markdown multiline just fine, and with Github Flavored Markdown': function (content) {
        if (content instanceof Error) 
          throw content;

        assert.equal(
          marked("```js\nvar i;\n```", { gfm: true }),

          content);
      }
    },

    '//! comment': {
      topic: function () {
        return locco.parse("//! comment");
      },

      'should highlight as comment': function (content) {
        if (content instanceof Error)
          throw content;

        assert.equal(
          "<pre><code>" + highlight.highlight("js", "//! comment").value + "</code></pre>",
          content);
      }
    }
  }
}).export(module);