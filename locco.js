var highlight = require("highlight.js"),
    marked    = require("marked"),
    fs        = require("fs"),
    glob      = require("glob"),
    mkpath    = require("mkpath"),
    mustache  = require("mustache");

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
// `npm install git://github.com/xaviervia/locco.git --save`
//
// Test
// ----
//
//     grunt vows
//
// Usage
// -----
//
// ### locco( String pattern [, Object options ] )
//
// To parse a series of JavaScript files using a [`minimatch`](//github.com/isaacs/minimatch) 
// pattern from the folders within the `js` directory. The resulting HTML files will be output in
// the default `doc` directory.
//
// ```js
// var locco = require("locco");
//
// var listOfFiles = locco("js/**/*.js");
// ```
//
// The `listOfFiles` variable will be an array containing the parsed files.
//
// > `locco` is an entirely synchronous tool.
//
// ### Options
//
// The second, optional argument allows you to configure both the output folder and
// a base folder to be excluded from the hierarchy in the output files.
//
// #### `path`
//
// Sets the path of the output folder.
//
// ```js
// var locco = require("locco");
//
// var listOfFiles = locco("js/**/*.js", {path: "documentation"});
// ```
//
// #### `base`
//
// Sets the path to be excluded in the output files names. For example, if
// your project source files are all contained in a `src` directory, setting
// the pattern to `src/**/*js` and the `base` to `src` will produce the files
// to be output directly into the `doc` directory discarding the `src` prefix. 
// A file named `src/data.js` will be parsed into `doc/data.js` instead of the
// default behavior `doc/src/data.js`.
//
// If some file, for some reason, does not match the `base` path, the `base` option
// will be ignored.
//
// ```js
// var locco = require("locco");
//
// var listOfFiles = locco("src/**/*.js", {base: "src"});
// ```
//
// #### Arguments
//
// - String pattern
// - _optional_ Object options
//   - path: String destinationPath
//   - base: String baseDirectoryToExclude
//
// #### Returns
//
// - Array parsedFiles
//
locco = function (pattern, options) {

  //! Load some required default options
  options       = options || locco.defaults;
  options.path  = options.path || locco.defaults.path;

  //! Get the file list by using sync
  var fileList = glob.sync(pattern);
  fileList.forEach(function (file) {
    var destinationFileName;

    //! If there is a "base path" filter on, 
    //! it should filter the base path in the destination file name
    if (options.base && options.base.length > 0 && file.indexOf(options.base) == 0) 
      destinationFileName = options.path + "/" + 
        file.substring(options.base.length - 1) + ".html";

    //! If there is no "base path" filter, use the full path
    else destinationFileName = options.path + "/" + file + ".html";

    //! Get the current file content
    var content = fs.readFileSync(file).toString();

    //! Parse it with locco into HTML
    var content = locco.parse(content);

    //! Get the folder path for the destination file
    var folderPath = destinationFileName.split("/")
      .slice(0, destinationFileName.split("/").length - 1)
      .join("/");

    //! Obtain the breadcrumbs
    var breadcrumbs = destinationFileName
      .substring(options.path.length + 1)
      .split("/")
      .slice(0, destinationFileName
        .substring(options.path.length + 1)
        .split("/")
        .length - 1)
      .map(function (token) { return ".."; })
      .join("/") + "/";

    //! Prepare the data object for Mustache
    var data = {
      content: content,
      path: folderPath.substring(options.path.length + 1),
      fileName: destinationFileName
        .substring(
          folderPath.length + 1, 
          destinationFileName.length - 5),
      breadcrumbs: breadcrumbs
    }

    //! Get the Mustache template from the package's dir
    var template = fs.readFileSync(__dirname + "/template/locco.html").toString();

    //! Get the final HTML
    var html = mustache.render(template, data);

    //! Make sure the folder is built
    mkpath.sync(folderPath);

    //! Copy the CSS into the final folder
    fs.writeFileSync( 
      options.path + "/locco.css", 
      fs.readFileSync(__dirname + "/template/locco.css") );

    //! Write the file
    fs.writeFileSync(
      destinationFileName,
      html);
  });

  return fileList;
}

locco.defaults = {
  path: "doc",
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
    fs.readFileSync(path));
}

//
// isQuoted( Integer position, String text )
// -----------------------------------------------------
//
// Returns whether or not the given position is surrounded by quotes.
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
  var firstPart = text.substring(0, position);
  var lastPart  = text.substring(position);
  if (firstPart.indexOf('"') != -1 && firstPart.match(/"/g).length % 2 == 1 && lastPart.indexOf('"') != -1)
    return true;
  else if (firstPart.indexOf("'") != -1 && firstPart.match(/'/g).length % 2 == 1 && lastPart.indexOf("'") != -1)
    return true;
  else 
    return false;
}

module.exports = locco;