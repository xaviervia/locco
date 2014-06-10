vows      = require("vows")
assert    = require("assert")
locco     = require("../locco"),
highlight = require("highlight.js")
marked    = require("marked")
fs        = require("fs")
mustache  = require("mustache")
rm        = require("rimraf")
mkpath    = require("mkpath")

options = {
  comment: "//",
  language: "js",
  templates: {
    code: fs.readFileSync("template/code.html").toString(),
    main: fs.readFileSync("template/main.html").toString(),
    markdown: fs.readFileSync("template/markdown.html").toString()
  }
}

handcraft = function (data) {
  return mustache.render(
    options.templates.main,
    data )
}

// locco API test battery
// =====================
//
vows.describe("locco", {

  // Pattern: `temp/*.js`
  // File: `temp/test.js`
  // Content: `var i;`
  // Result: `doc/test.js.html`
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
      locced = fs.readFileSync("doc/test.html").toString()

      //! Get the content as is should be, directly from Mustache
      handcrafted = handcraft({
        template:      "template/locco.html",
        fileName:      "test.js",
        path:          "",
        content:       locco.parse("var i;", options),
        breadcrumbs:   ""
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
      locco( "temp/*.js", { output: "docs" } )

      //! Get the result file from the new dir
      locced = fs.readFileSync("docs/test.html").toString();

      //! DIY clone for changing options
      var altOptions     = JSON.parse(JSON.stringify(options))
      altOptions.output  = "docs"

      //! Handcraft the same file
      handcrafted = handcraft({
        template:    "template/locco.html",
        fileName:    "test.js",
        path:        "",
        content:     locco.parse("var i;", altOptions),
        breadcrumbs: ""
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

  'file from deep in the hierarchy': {
    'should have the path': 'pending'
  },

  // Pattern: `temp.js`
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
        content:     locco.parse("8", options),
        breadcrumbs: ""
      })

      //! Compare both results
      assert.equal(
        handcrafted,
        locced )

      //! Remove the temp.js file and the doc dir
      fs.unlinkSync("temp.js")
      rm.sync("doc")
    }
  },

  'file from deep without wildcard': {
    'the file name should not be erased': function () {

      //! Create the temp directory
      mkpath.sync("temp/deep")

      //! Write a simple javascript file
      fs.writeFileSync("temp/deep/test.js", "var i;")

      //! Run locco
      locco( "temp/deep/test.js" )

      //! Get the result file from the new dir
      locced = fs.readFileSync("docs/temp/deep/test.html").toString();

      //! DIY clone for changing options
      var altOptions     = JSON.parse(JSON.stringify(options))
      altOptions.output  = "docs"

      //! Handcraft the same file
      handcrafted = handcraft({
        template:    "template/locco.html",
        fileName:    "test.js",
        path:        "",
        content:     locco.parse("var i;", altOptions),
        breadcrumbs: ""
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

  'base folder name inclusion': {

    // Pattern: `temp/*.js`
    // File: `temp/test.js`
    // Content: `8`
    // Result: `docs/temp/test.js.html`
    'should include the base folder in the final folder name': function () {

      //! Create the temp folder
      mkpath.sync("temp")

      //! Create the test.js file
      fs.writeFileSync("temp/test.js", "8")

      //! Run locco on the file
      locco("temp/*.js", {includeBase: true})

      //! Get the file from where it was expected
      locced = fs.readFileSync("doc/temp/test.js.html").toString()

      //! DIY clone for changing options
      var altOptions          = JSON.parse(JSON.stringify(options))
      altOptions.includeBase  = true

      //! Handcraft the result...
      handcrafted = handcraft({
        template:     "template/locco.html",
        fileName:     "test.js",
        path:         "temp",
        content:      locco.parse("8", altOptions),
        breadcrumbs:  "../"
      })

      //! Showdown!
      assert.equal(
        handcrafted,
        locced )

      //! Remove the directories
      rm.sync("temp")
      rm.sync("doc")
    }
  },

  'extension inclusion': {
    'should keep the extension': function () {

      //! Create the temp directory
      mkpath.sync("temp")

      //! Create the demo file test.js with only javascript content
      fs.writeFileSync("temp/test.js", "var i;")

      //! Run locco
      locco( "temp/*.js", { includeExtension: true } )

      //! Get the file content
      locced = fs.readFileSync("doc/test.js.html").toString()

      //! Get the content as is should be, directly from Mustache
      handcrafted = handcraft({
        template:      "template/locco.html",
        fileName:      "test.js",
        path:          "",
        content:       locco.parse("var i;", options),
        breadcrumbs:   ""
      })

      //! Assert that both are equal
      assert.equal(
        handcrafted,
        locced )

      //! Remove the temp directory
      rm.sync("temp")
      rm.sync("doc")

    }
  },

  'configure templates folder': {
    'locco.html in the folder': {
      'should build with the alternative template': 'pending'
    },

    'code.html in the folder': {
      'should build the code with the alternative template': 'pending'
    }
  },

  'add files to generation': "pending",

  'extra data to the templates': "pending"

}).export(module);
