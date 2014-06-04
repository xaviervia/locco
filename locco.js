"use strict"

var highlight = require("highlight.js")
var marked    = require("marked")
var fs        = require("fs")
var glob      = require("glob")
var mkpath    = require("mkpath")
var mustache  = require("mustache")
var Minimatch = require("minimatch").Minimatch

var formatter = require("./src/formatter")

var MARKDOWN = 0
var CODE     = 1

//
// locco
// ======
//
// ![Codeship status](https://www.codeship.io/projects/173f7bd0-ad2d-0131-d326-5a3e053281b1/status)
//
// [Docco](//github.com/jashkenas/docco) port that doesn't depend on
// [Pygments](//pygments.org/). It uses
// [Github Flavored Markdown](//github.github.com/github-flavored-markdown/)
// for Markdown processing and [Highlight.js](//highlightjs.org) for syntax highlight.
//
// Supports template customization using [Mustache](//mustache.github.com).
//
// ### Installation
//
//     npm install locco --save
//
// Test
// ----
//
//     grunt vows
//
// Usage
// -----
//
// ### locco( pattern, options )
//
// Parses a series of files found using a [`glob`](//github.com/isaacs/minimatch)
// pattern. The resulting HTML files are written in
// the default `doc` directory.
//
// Here goes an example:
//
// ```js
// var locco = require("locco");
//
// var documentedFiles = locco("js/**/*.js");
// ```
//
// The `documentedFiles` variable will be an array containing the parsed files.
//
// > **locco** does everything synchronously. Why is that?
// > Because locco is useful in contexts where asynchronicity means nothing
// > but trouble.
// > In **locco**, doc generation for each file is intended to be atomic. Files
// > are usually too many for you to be able to handle callbacks without
// > serious acrobatics, and with no real benefit, why should you?
//
// #### Options
//
// The second, optional argument allows you to configure both the output folder
// and whether the base folder in the glob pattern will be excluded from
// the hierarchy in the output files.
//
// ##### `output`
//
// Sets the path of the output folder. Default: **doc**
//
// ```js
// var locco = require("locco");
//
// var documentedFiles = locco("js/**/*.js", {output: "documentation"});
// ```
//
// ##### `includeBase`
//
// If `true`, includes the full relative file path in the folder. If
// `false`, includes the path starting from the `**` or `*` wildcards in
// the glob pattern, which is more clean.
//
// Default is `false`.
//
// For example, if your project source files are all contained in a `src`
// directory, setting the pattern to `src/**/*js`
// will produce the files to be output directly into the `doc` directory
// discarding the `src` prefix.
//
// ```js
// var locco = require("locco");
//
// var documentedFiles = locco("src/**/*.js", {includeBase: false});
// ```
var defaults = {
  output: "doc",
  includeBase: false,
  templateDir: __dirname + "/template",
  language: "js",
  comment: "//"
}

//
// #### Arguments
//
// - `String` pattern
// - _optional_ `Object` options
//   - output: `String`
//   - includeBase: `Boolean`
//
// #### Returns
//
// - `Array` parsedFiles
//
var locco = function (pattern, options) {

  //! Load some required default options
  options             = options             || defaults
  options.output      = options.output      || defaults.output
  options.templateDir = options.templateDir || defaults.templateDir
  options.language    = options.language    || defaults.language
  options.comment     = options.comment     || defaults.comment

  //! Get the template strings
  options.templates = {
    code: fs.readFileSync(options.templateDir + "/code.html").toString(),
    main: fs.readFileSync(options.templateDir + "/main.html").toString(),
    markdown: fs.readFileSync(options.templateDir + "/markdown.html").toString()
  }

  //! Get base path if includeBase is disabled
  var base = []
  if (!options.includeBase)
    base =

      //! Get the minimatch object for the pattern to extract the path
      //! to the deepest base directory not represented as a wildcard
      new Minimatch(pattern)
        .set[0]
        .filter(function (item, index, array) {
          //! Filter out all the elements that are not string
          //! This is because other elements are wildcards and we are
          //! interested in the deepest base folder defined without wildcard
          return typeof item === 'string' &&

            //! And filter out the only element if there is only one
            //! (in which case it probably is a single file name)
            array.length > 1
        })


  //! Get the file list by using sync and iterate
  return glob
    .sync(pattern)
    .map(function (file) {

    //! Declare the variable to hold the destination file name
    var destinationFilePath

    //! Filter the base from the file, if there is a base
    var filteredFile = base.length > 0 ?
      file.substring(base.join("/").length + 1) : file

    //! Get the destination file path
    destinationFilePath = options.output + "/" + filteredFile + ".html"

    //! Get the source file contents
    var content = fs.readFileSync(file).toString()

    //! Parse it with locco into HTML
    content = locco.parse(content, options)

    //! Get the folder path for the destination file
    var folderPath = destinationFilePath.split("/")
      .slice(0, destinationFilePath.split("/").length - 1)
      .join("/")

    //! Obtain the breadcrumbs (relative path to base doc folder)
    var breadcrumbs = destinationFilePath
      .substring(options.output.length + 1)
      .split("/")
      .slice(0, destinationFilePath
        .substring(options.output.length + 1)
        .split("/")
        .length - 1)
      .map(function (token) { return ".."; })
      .join("/") + "/"

    //! If the breadcrumbs are just a slash, erase 'em
    if (breadcrumbs == "/")
      breadcrumbs = null

    //! Prepare the data object for Mustache
    var data = {
      content:  content,
      path:     folderPath.substring(options.output.length + 1),
      fileName: destinationFilePath
        .substring(
          folderPath.length + 1,
          destinationFilePath.length - 5),
      breadcrumbs: breadcrumbs
    }

    //! Get the final HTML
    var html = mustache.render(options.templates.main, data)

    //! Make sure the folder exists
    mkpath.sync(folderPath)

    //! Copy the CSS into the final folder
    fs.writeFileSync(
      options.output + "/locco.css",
      fs.readFileSync(options.templateDir + "/locco.css") )

    //! Write the file
    fs.writeFileSync(
      destinationFilePath,
      html)

    return file
  })

}


//
// Methods
// -------
//
// ### parse( String text [, String language] )
//
// Returns HTML code from the `text`, parsed with `marked` inside the comments
// and with `highlight.js` for the rest of the code. If no language identifier
// is passed, `js` is assumed.
//
// #### Arguments
//
// - `String` text
// - `Object` options
//
// #### Returns
//
// - `String` html
//
locco.parse = function (text, options) {

  //! Resulting string to be returned
  var result  = ""

  //! Temporary buffer of code tokens
  var buffer   = []

  //! For each line in the text
  text
    .split("\n")
    .forEach(function (line, index, lines) {

    //! Initialize the token for the current line
    var current = {}

    //! Is there a comment in here?
    if (

      //! ...there comment string is present
      line.indexOf(options.comment) != -1 &&

      //! ...it is not in a quotation
      !locco.isQuoted(line.indexOf(options.comment), line) &&

      //! ...it is not followed by the '!'
      line.substring(
        line.indexOf(options.comment) + 2,
        line.indexOf(options.comment) + 3) != "!" ) {

      //! Is there code in the line before to this comment?
      if (

        //! (is there something after trimming whitespace leftwards)
        line
          .substring(0, line.indexOf(options.comment))
          .trim().length > 0) {

        //! Store the prior code
        var priorCode = {
          mode: CODE,
          text: line.substring(0, line.indexOf(options.comment))
        }

        //! Now that some code appeared in this line, we have to check if there
        //! was documentation in the buffer (buffer has something that
        //! is not code).
        //!
        //! If that is the case, we must format the buffer contents right now,
        //! then format the code and then clean the buffer so we can
        //! store the new documentation tokens in it.
        if (buffer.length > 0 && buffer[buffer.length - 1].mode != CODE) {

          //! Format the current buffer contents
          result += formatter.markdown(buffer)

          //! Format the mini buffer with just the code
          result += formatter.code([priorCode], options)

          //! Clean the buffer
          buffer   = []

        }

        //! If there was code in the buffer, push the current code
        else if (buffer.length > 0 && buffer[buffer.length - 1].mode == CODE)
          buffer.push(priorCode)

      }

      current.mode = MARKDOWN;
      current.text = line.substring(line.indexOf("//") + 3);
    }

    //! There is no comment, just javascript
    else {
      current.mode = CODE;
      current.text = line;
    }

    //! There is a previous item and is of different mode
    if (index > 0 && buffer[buffer.length - 1].mode != current.mode) {
      switch (buffer[buffer.length - 1].mode) {
        case CODE:
          result += formatter.code(buffer, options)
          break
        case MAIN:
          result += formatter.markdown(buffer, options)
          break
      }

      buffer = []
    }

    //! Add to the buffer
    buffer.push(current);

    //! Was it the last?
    if (index == lines.length - 1)
      switch (buffer[buffer.length - 1].mode) {
      case MARKDOWN:
          result += formatter.markdown(buffer, options)
          break
        case CODE:
          result += formatter.code(buffer, options)
      }


  });

  return result.substring(1);
}

locco._resolve = function (buffer, options) {

  //! Resolve joining with "\n";
  switch(buffer[buffer.length - 1].mode) {
  case MARKDOWN:
      return formatter.markdown(buffer)

    case CODE:
      return formatter.code(buffer, {
        language: options.language ? options.language : "js",
        template: fs.readFileSync(options.templateDir + "/code.html").toString()
      })
  }
}

//
// readFile( String path )
// -----------------------
//
// Reads and parses the contents of the file. Does this always synchronously.
// Returns the HTML formatted content.
//
// #### Arguments
//
// - String path
//
// #### Returns
//
// - String html
//
//
locco.readFile = function (path) {
  this.parse(
    fs.readFileSync(path))
}

//
// isQuoted( Integer position, String text )
// -----------------------------------------------------
//
// Returns whether or not the character at the given position is surrounded
// by quotes.
//
// #### Arguments
//
// - Integer position
// - String text
//
// #### Returns
//
// - Boolean isQuoted
//
//
locco.isQuoted = function (position, text) {

  //! Double quotes!
  if (

    //! Is there at least one double quote before this character?
    text.substring(0, position).indexOf('"') != -1 &&

    //! Are there an odd amount of double quotes before this character?
    text.substring(0, position).match(/"/g).length % 2 == 1 &&

    //! Is there at least one double quote after this character?
    text.substring(position).indexOf('"') != -1)

      //! Then it is quoted!
      return true

  //! Single quotes!
  if (

    //! Is there at least one single quote before this character?
    text.substring(0, position).indexOf("'") != -1 &&

    //! Are there an odd amount of single quotes before this character?
    text.substring(0, position).match(/'/g).length % 2 == 1 &&

    //! Is there at least one single quote after this character?
    text.substring(position).indexOf("'") != -1)

      //! Then it is quoted!
      return true

  //! Otherwise it is not quoted
  return false
}

module.exports = locco
