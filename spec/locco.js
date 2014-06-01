vows      = require("vows")
assert    = require("assert")
locco     = require("../locco"),
highlight = require("highlight.js")
marked    = require("marked")
fs        = require("fs")
mustache  = require("mustache")
rm        = require("rimraf")
mkpath    = require("mkpath")


handcraft = function (options) {
  return mustache.render(
    fs.readFileSync(options.template).toString(),
    options )
}

// locco API test battery
// =====================
//
vows.describe("locco", {

  // Pattern: `temp/*.js`
  // File: `temp/test.js`
  // Content: `var i;`
  // Result: `doc/temp/test.js.html`
  '("temp/*.js")': {

    // The resulting collection of files should include the
    // file `temp/test.js`. This is because the argument for
    // locco is a glob pattern that in this case matches all the
    // files ending in `.js` within the `temp` directory.

    'the test.js file should be in the resulting array': function () {
      //! Create the temp directory
      mkpath.sync("temp")

      //! Write a simple javascript file within it
      fs.writeFileSync("temp/test.js", "var i;")

      //! Run locco, get the files
      files = locco("temp/*.js")

      //! Assert that the file is included in the results
      assert.include(
        locco("temp/*.js"),
        "temp/test.js" )

      //! Remove the directories
      rm.sync("temp")
      rm.sync("doc")

    },

    'should write the html file in the doc folder': function () {

      //! Create the temp directory
      mkpath.sync("temp")

      //! Create the demo file test.js with only javascript content
      fs.writeFileSync("temp/test.js", "var i;")

      //! Run locco
      locco( "temp/*.js" )

      //! Get the file content
      locced = fs.readFileSync("doc/temp/test.js.html").toString()

      //! Get the content as is should be, directly from Mustache
      handcrafted = handcraft({
        template:      "template/locco.html",
        fileName:      "test.js",
        path:          "temp",
        content:       locco.parse("var i;"),
        breadcrumbs:   "../"
      })

      //! Assert that both are equal
      assert.equal(
        handcrafted,
        locced )

      //! Remove the temp directory
      rm.sync("temp")
      rm.sync("doc")

    },

    'should copy the .css': function () {

      //! Create the temp directory
      mkpath.sync("temp")

      //! Write a simple javascript file
      fs.writeFileSync("temp/test.js", "var i;")

      //! Run locco
      locco( "temp/*.js" )

      //! Get the content of the css files
      css = {
        source: fs.readFileSync("template/locco.css").toString(),
        destination: fs.readFileSync("doc/locco.css").toString()
      }

      //! Compare them for equality
      assert.equal(css.destination, css.source)

      //! Remove the directories
      rm.sync("temp")
      rm.sync("doc")

    }
  },

  // Pattern: `temp/*.js`
  // File: `temp/test.js`
  // Content: `var i;`
  // Result: `docs/temp/test.js.html`
  'different destination folder': {

    'should do the same but for the other folder': function () {

      //! Create the temp directory
      mkpath.sync("temp")

      //! Write a simple javascript file
      fs.writeFileSync("temp/test.js", "var i;")

      //! Run locco with docs as output directory
      locco( "temp/*.js", {output: "docs"} )

      //! Get the result file from the new dir
      locced = fs.readFileSync("docs/temp/test.js.html").toString();

      //! Handcraft the same file
      handcrafted = handcraft({
        template:    "template/locco.html",
        fileName:    "test.js",
        path:        "temp",
        content:     locco.parse("var i;"),
        breadcrumbs: "../"
      })

      //! Assert they are the same
      assert.equal(
        handcrafted,
        locced )

      //! Remove the directories
      rm.sync("temp")
      rm.sync("docs")
    }
  },

  // Pattern: `temp/*.js`
  // File: `temp.js`
  // Content: `8`
  // Result: `docs/temp.js.html`
  'file from base folder': {
    'should have nothing in the breadcrumbs': function () {

      //! Create the temp.js file
      fs.writeFileSync("temp.js", "8")

      //! Run locco for the temp.js file
      locco("temp.js")

      //! Get the locced file
      locced = fs.readFileSync("doc/temp.js.html").toString()

      //! Handcraft the same result
      handcrafted = handcraft({
        template:    "template/locco.html",
        fileName:    "temp.js",
        path:        "",
        content:     locco.parse("8"),
        breadcrumbs: ""
      })

      //! Compare both results
      assert.equal(
        handcrafted,
        locced )

      //! Remove the temp.js file
      fs.unlinkSync("temp.js")
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
