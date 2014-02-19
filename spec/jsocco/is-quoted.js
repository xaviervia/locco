var vows      = require("vows"),
    assert    = require("assert"),
    jsocco    = require("../../jsocco"),
    highlight = require("highlight.js"),
    marked    = require("marked");

vows.describe("jsocco").addBatch({
  '.isQuoted(index, text) : ': {
    
    'adfa | 2 | false': function () {
      assert.isFalse(jsocco.isQuoted(2, "adfa"));  
    },

    '"a" | 1 | true': function () {
      assert.isTrue(jsocco.isQuoted(1, '"a"'));
    },

    '"a"b" | 3 | false': function () {
      assert.isFalse(jsocco.isQuoted(3, '"a"b"'));
    },

    "'a' | 1 | true": function () {
      assert.isTrue(jsocco.isQuoted(1, "'a'"));
    },

    "'a'b' | 3 | false": function () {
      assert.isFalse(jsocco.isQuoted(3, "'a'b'"));
    }, 
  }
}).export(module);