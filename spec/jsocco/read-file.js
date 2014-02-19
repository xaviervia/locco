var vows      = require("vows"),
    assert    = require("assert"),
    jsocco    = require("../../jsocco"),
    highlight = require("highlight.js"),
    marked    = require("marked"),
    fs        = require("fs");

vows.describe("jsocco").addBatch({
  '.readFile(path)': {
    'var i;': {
      'should parse the file contents': function () {
        fs.writeFileSync("tmp.1.js", "var i;");
        jsocco.parse = function (text) {
          jsocco.parseCalled = true;
          assert.equal(text, "var i;");
        }
        jsocco.readFile("tmp.1.js");        

        assert.isTrue(jsocco.parseCalled);
        fs.unlinkSync("tmp.1.js");
      }
    }
  } 
}).export(module);