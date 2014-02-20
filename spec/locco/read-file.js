var vows      = require("vows"),
    assert    = require("assert"),
    locco    = require("../../locco"),
    highlight = require("highlight.js"),
    marked    = require("marked"),
    fs        = require("fs");

vows.describe("locco").addBatch({
  '.readFile(path)': {
    'var i;': {
      'should parse the file contents': function () {
        fs.writeFileSync("tmp.1.js", "var i;");
        locco.parse = function (text) {
          locco.parseCalled = true;
          assert.equal(text, "var i;");
        }
        locco.readFile("tmp.1.js");        

        assert.isTrue(locco.parseCalled);
        fs.unlinkSync("tmp.1.js");
      }
    }
  } 
}).export(module);