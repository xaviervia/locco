var vows      = require("vows"),
    assert    = require("assert"),
    locco     = require("../../locco"),
    highlight = require("highlight.js"),
    fs        = require("fs"),
    marked    = require("marked")
    mustache  = require("mustache");

options = {
  comment: "//",
  language: "js",
  templates: {
    code: fs.readFileSync("template/code.html").toString(),
    main: fs.readFileSync("template/main.html").toString(),
    markdown: fs.readFileSync("template/markdown.html").toString()
  }
}

vows.describe("locco").addBatch({
  '.parse(text, options)': {
    'var code;': {
      topic: function () {
        return locco.parse("var code;", options)
      },

      'is the result from highlight': function (content) {
        if (content instanceof Error)
          throw content

        assert.equal(
          mustache.render(
            fs.readFileSync("template/code.html").toString(),
            {content: highlight.highlight("js", "var code;").value}),
          content )
      }
    },

    '// *something*': {
      topic: function () {
        return locco.parse("// *something*", options)
      },

      'should be marked': function (content) {
        if (content instanceof Error)
          throw content

        assert.equal(
          "<div>" + marked("*something*") + "</div>",
          content  )
      }
    },

    '   // *something*': {
      topic: function () {
        return locco.parse("   // *something*", options)
      },

      'is the result from marked without the comment symbol': function (content) {
        if (content instanceof Error)
          throw content

        assert.equal(
          "<div>" + marked("*something*") + "</div>",
          content )
      }
    },

    '"   // *something*"': {
      topic: function () {
        return locco.parse('"   // *something*"', options);
      },

      'is the result from highlight since the comment is part of a string': function (content) {
        if (content instanceof Error)
          throw content

        assert.equal(
          mustache.render(
            fs.readFileSync("template/code.html").toString(),
            {content: highlight.highlight("js", '"   // *something*"').value}),

          content);
      }
    },

    'var e;\n// *this*': {
      topic: function () {
        return locco.parse("var e;\n// *this*", options)
      },

      'highlight first line, mark second': function (content) {
        if (content instanceof Error)
          throw content

        assert.equal(
          mustache.render(
            fs.readFileSync("template/code.html").toString(),
            { content: highlight.highlight("js", "var e;").value} ) +
            "\n" + "<div>" + marked("*this*") + "</div>",

          content )
      }
    },

    'var n;\nn=3;// _je_': {
      topic: function  () {
        return locco.parse("var n;\nn=3;// _je_", options)
      },

      'highlight both lines, end in marked': function (content) {
        if (content instanceof Error)
          throw content

        assert.equal(
          mustache.render(
            fs.readFileSync("template/code.html").toString(),
            { content: highlight.highlight("js", "var n;\nn=3;").value} ) +
            "\n" + "<div>" + marked("_je_") + "</div>",

          content)
      }
    },

    '// ```js\n// var i;\n// ```': {
      topic: function () {
        return locco.parse("// ```js\n// var i;\n// ```", options)
      },

      'should parse the markdown multiline just fine, and with Github Flavored Markdown': function (content) {
        if (content instanceof Error)
          throw content

        assert.equal(
          "<div>" + marked("```js\nvar i;\n```", { gfm: true }) + "</div>",
          content )
      }
    },

    '//! comment': {
      topic: function () {
        return locco.parse("//! comment", options)
      },

      'should highlight as comment': function (content) {
        if (content instanceof Error)
          throw content

        assert.equal(
          mustache.render(
            fs.readFileSync("template/code.html").toString(),
            { content: highlight.highlight("js", "//! comment").value }),
          content )
      }
    }
  }
}).export(module)
