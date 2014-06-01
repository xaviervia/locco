"use strict"

var highlight = require("highlight.js")
var marked    = require("marked")
var fs        = require("fs")
var glob      = require("glob")
var mkpath    = require("mkpath")
var mustache  = require("mustache")
var Minimatch = require("minimatch").Minimatch

//
// locco
// ======
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
// > but troble.
// > In **locco**, doc generation for each file is intended to be atomic. Files
// > are usually too many for you to be able to handle callbacks without
// > serious acrobatics, and with no real benefit, why should you?
//
// #### Options
//
// The second, optional argument allows you to configure both the output folder and
// a base folder to be excluded from the hierarchy in the output files.
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
  includeBase: false
}

//
// #### Arguments
//
// - `String` pattern
// - _optional_ `Object` options
//   - path: `String` destinationPath
//   - base: `String` baseDirectoryToExclude
//
// #### Returns
//
// - `Array` parsedFiles
//
var locco = function (pattern, options) {

  //! Load some required default options
  options         = options         || defaults
  options.output  = options.output  || defaults.output

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

    //! Get the current file contents
    var content = fs.readFileSync(file).toString()

    //! Parse it with locco into HTML
    content = locco.parse(content)

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
      content: content,
      path: folderPath.substring(options.output.length + 1),
      fileName: destinationFilePath
        .substring(
          folderPath.length + 1,
          destinationFilePath.length - 5),
      breadcrumbs: breadcrumbs
    }

    //! Get the Mustache template from the package's dir
    var template = fs.readFileSync(__dirname +
      "/template/locco.html").toString()

    //! Get the final HTML
    var html = mustache.render(template, data)

    //! Make sure the folder exists
    mkpath.sync(folderPath)

    //! Copy the CSS into the final folder
    fs.writeFileSync(
      options.output + "/locco.css",
      fs.readFileSync(__dirname + "/template/locco.css") )

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
// Returns HTML code from the `text`, parsed with `marked` inside the comments and
// with `highlight.js` for the rest of the code. If no language identifier is passed,
// `js` is assumed.
//
// #### Arguments
//
// - String text
// - _optional_ String language
//
// #### Returns
//
// - String html
//
//
locco.parse = function (text, language) {
  var result  = "";
  var stack   = [];

  text.split("\n").forEach(function (line, index, lines) {

    var current = {};

    //! There is a comment in here?
    if (line.indexOf("//") != -1 && !locco.isQuoted(line.indexOf("//"), line) &&
      line.substring(line.indexOf("//") + 2, line.indexOf("//") + 3) != "!") {

      //! There is code prior to the markdown?
      if (line.substring(0, line.indexOf("//")).trim().length > 0) {
        var priorCode = {
          mode: "code",
          text: line.substring(0, line.indexOf("//"))
        }

        //! If there was something before and wasnt code, resolve and clean and
        //! stack and resolve and clean
        if (stack.length > 0 && stack[stack.length - 1].mode != "code") {
          result += locco._resolve(stack, language);
          result += locco._resolve([priorCode], language);
          stack   = [];
        }

        //! If there was something before and was code, push
        else if (stack.length > 0 && stack[stack.length - 1].mode == "code")
          stack.push(priorCode);

      }

      current.mode = "markdown";
      current.text = line.substring(line.indexOf("//") + 3);
    }

    //! There is no comment, just javascript
    else {
      current.mode = "code";
      current.text = line;
    }

    //! There is a previous item and is of different mode
    if (index > 0 && stack[stack.length - 1].mode != current.mode) {
      result += locco._resolve(stack, language);
      stack = [];
    }

    //! Add to the stack
    stack.push(current);

    //! Was it the last?
    if (index == lines.length - 1)
      result += locco._resolve(stack, language);

  });

  return result.substring(1);
}

locco._resolve = function (stack, language) {

  //! Resolve joining with "\n";
  switch(stack[stack.length - 1].mode) {
    case "markdown":
      return "\n" +
        marked(
          stack.map(function (token) {
            return token.text;
          })
          .join("\n"));

      break;

    case "code":
      return "\n" + mustache.render(
        fs.readFileSync( __dirname + "/template/code.html").toString(),
        { content: highlight.highlight(
            language ? language : "js",
            stack.map(function (token) {
              return token.text; })
            .join("\n"))
          .value });
      break;

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
