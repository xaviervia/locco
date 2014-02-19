var vows      = require("vows"),
    assert    = require("assert"),
    jsocco    = require("../jsocco"),
    highlight = require("highlight.js"),
    marked    = require("marked"),
    fs        = require("fs"),
    mustache  = require("mustache"),
    rm        = require("rimraf");

vows.describe("jsocco(pattern [, options])").addBatch({
  'tmp/*.js | tmp/1.js > var i;': {
    'should parse the file contents, create the doc folder, write the output': function () {
      fs.mkdirSync("tmp");
      fs.writeFileSync("tmp/1.js", "var i;");
      var files  = jsocco( "tmp/*.js" );
      var result = fs.readFileSync("doc/tmp/1.js.html").toString();
      assert.include(files, "tmp/1.js");

      var independentResult = mustache.render(
        fs.readFileSync("template/jsocco.html").toString(),
        {
          fileName: "1.js",
          path: "tmp",
          content: jsocco.parse("var i;")
        });
      
      assert.equal(
        independentResult,
        result);

      rm.sync("tmp");
    }
  },
/*
  'different destination folder': {
    'should do the same but for the other folder': function () {
      fs.mkdirSync("tmp");
      fs.writeFileSync("tmp/1.js", "var i;");
      var files = jsocco( "tmp/*.js", "docs" );
      var result = fs.readFileSync("docs/1.html");
      assert.include(files, "tmp/1.js");
      assert.equal(
        highlight.highlight("js", "var i;").value,
        result);
      fs.rmdirSync("tmp");
    }
  },

  'base folder name exclusion'

  'extension exclusion'

  'change template html'

  'add files to generation'

  'extra data to the templates'
*/
}).export(module);