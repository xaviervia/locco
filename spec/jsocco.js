var vows      = require("vows"),
    assert    = require("assert"),
    jsocco    = require("../jsocco"),
    highlight = require("highlight.js"),
    marked    = require("marked"),
    fs        = require("fs"),
    mustache  = require("mustache"),
    rm        = require("rimraf"),
    mkpath    = require("mkpath");

vows.describe("jsocco(pattern [, options])").addBatch({
  'tmp/*.js | tmp/1.js > var i;': {
    'should parse the file contents, create the doc folder, write the output': function () {
      mkpath.sync("tmp");
      fs.writeFileSync("tmp/1.js", "var i;");
      var files  = jsocco( "tmp/*.js" );
      var result = fs.readFileSync("doc/tmp/1.js.html").toString();
      assert.include(files, "tmp/1.js");

      var independentResult = mustache.render(
        fs.readFileSync("template/jsocco.html").toString(),
        {
          fileName: "1.js",
          path: "tmp",
          content: jsocco.parse("var i;"),
          breadcrumbs: ".."
        });
      
      assert.equal(
        independentResult,
        result);

      rm.sync("tmp");
    }
  },

  'different destination folder': {
    'should do the same but for the other folder': function () {
      mkpath.sync("tmp");
      fs.writeFileSync("tmp/1.js", "var i;");
      var files  = jsocco( "tmp/*.js", {path: "docs"} );
      var result = fs.readFileSync("docs/tmp/1.js.html").toString();
      assert.include(files, "tmp/1.js");

      var independentResult = mustache.render(
        fs.readFileSync("template/jsocco.html").toString(),
        {
          fileName: "1.js",
          path: "tmp",
          content: jsocco.parse("var i;"),
          breadcrumbs: ".."
        });
      
      assert.equal(
        independentResult,
        result);

      rm.sync("tmp");
    }
  },

  'base folder name exclusion': {
    'should exclude the base folder from the final folder name': "pending"
  },

  'extension exclusion': "pending",

  'change template html': "pending",

  'add files to generation': "pending",

  'extra data to the templates': "pending"

}).export(module);