// locco
// =====
//
//
var spec              = require("washington")
var assert            = require("assert")
var File              = require("./src/file")
var Parser            = require("./src/parser")

var toMD = function () {
  var file = new File

  file.on(
    new Parser({
      commentStart: "//",
      escapeSequence: "!"
    })

    .on("comment", function (comment) {
      var targetFile = comment.file.path.replace(/\.[0-9A-Za-z].+?$/, ".md")
      targetFile = targetFile.replace(/index\.md$/, "README.md")
      file.emit("post", [targetFile, comment.comment + "\n"])
    })
  )

  file.emit("get", ["**/*.js"])
}

toMD()
