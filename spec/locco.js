var vows      = require("vows"),
    assert    = require("assert"),
    locco    = require("../locco"),
    highlight = require("highlight.js"),
    marked    = require("marked"),
    fs        = require("fs"),
    mustache  = require("mustache"),
    rm        = require("rimraf"),
    mkpath    = require("mkpath");

vows.describe("locco(pattern [, options])").addBatch({
  'tmp/*.js | tmp/1.js > var i;': {
    'should parse the file contents, create the doc folder, write the output': function () {
      mkpath.sync("tmp");
      fs.writeFileSync("tmp/1.js", "var i;");
      var files  = locco( "tmp/*.js" );
      var result = fs.readFileSync("doc/tmp/1.js.html").toString();
      assert.include(files, "tmp/1.js");

      var independentResult = mustache.render(
        fs.readFileSync("template/locco.html").toString(),
        {
          fileName: "1.js",
          path: "tmp",
          content: locco.parse("var i;"),
          breadcrumbs: "../"
        });
      
      assert.equal(
        independentResult,
        result);

      rm.sync("tmp");
    },

    'should copy the .css': function () {
      mkpath.sync("tmp");
      fs.writeFileSync("tmp/1.js", "var i;");
      var files  = locco( "tmp/*.js" );
      
      var css = {
        source: fs.readFileSync("template/locco.css").toString(),
        destination: fs.readFileSync("doc/locco.css").toString()
      }      

      assert.equal(css.destination, css.source);

      rm.sync("tmp");
    }
  },

  'different destination folder': {
    'should do the same but for the other folder': function () {
      mkpath.sync("tmp");
      fs.writeFileSync("tmp/1.js", "var i;");
      var files  = locco( "tmp/*.js", {path: "docs"} );
      var result = fs.readFileSync("docs/tmp/1.js.html").toString();
      assert.include(files, "tmp/1.js");

      var independentResult = mustache.render(
        fs.readFileSync("template/locco.html").toString(),
        {
          fileName: "1.js",
          path: "tmp",
          content: locco.parse("var i;"),
          breadcrumbs: "../"
        });
      
      assert.equal(
        independentResult,
        result);

      rm.sync("tmp");
    }
  },

  'file from base folder': {
    'should have nothing in the breadcrumbs': function () {
      fs.writeFileSync("tmp.js", "8");
      locco("tmp.js");
      var result = fs.readFileSync("doc/tmp.js.html").toString();

      var independentResult = mustache.render(
        fs.readFileSync("template/locco.html").toString(),
        {
          fileName: "tmp.js",
          path: "",
          content: locco.parse("8"),
          breadcrumbs: ""
        });

      assert.equal(
        independentResult,
        result);

      fs.unlinkSync("tmp.js");
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