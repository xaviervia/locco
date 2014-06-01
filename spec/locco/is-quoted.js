vows      = require("vows")
assert    = require("assert")
locco     = require("../../locco")
highlight = require("highlight.js")
marked    = require("marked")

vows.describe("locco", {

  // isQuoted
  // --------
  //
  // Returns whether or not the character at the given position is
  // surrounded by quotes.
  '.isQuoted(index, text) : ': {

    'adfa | 2 | false': function () {
      assert.isFalse(locco.isQuoted(2, "adfa"))
    },

    '"a" | 1 | true': function () {
      assert.isTrue(locco.isQuoted(1, '"a"'))
    },

    '"a"b" | 3 | false': function () {
      assert.isFalse(locco.isQuoted(3, '"a"b"'))
    },

    "'a' | 1 | true": function () {
      assert.isTrue(locco.isQuoted(1, "'a'"))
    },

    "'a'b' | 3 | false": function () {
      assert.isFalse(locco.isQuoted(3, "'a'b'"))
    },
  }

}).export(module)
