var spec      = require("washington")
var assert    = require("assert")
var Mediador  = require("mediador")

var clone = function (object) {
  var clone = {}
  Object.keys(object).forEach(function (key) {
    clone[key] = object[key] })
  return clone
}

var CommentExtractor = function () {

}

CommentExtractor.prototype = Object.create(Mediador.prototype)

CommentExtractor.prototype.comment = function (comment) {
  var argument    = null

  this.collector  = this.collector || {}

  this.collector[comment.file] = this.collector[comment.file] || []
  this.collector[comment.file].push(comment)
  console.log(this.collector)
  console.log(comment.file.lines.length)

  if (comment.file.lines.length - 1 === comment.index) {
    argument = clone(comment)
    argument.comments = this.collector[comment.file].map(function (item) {
        return item.comment
      })
      .join("\n")
    this.emit("comments", [argument])
  }
}

spec("should collect comments", function () {
  //! given
  var file = {
    file: "file.txt",
    lines: ["some", "some", "some"],
    text: "some\nsome\nsome"
  }
  var options = {
    first: {
      comment: "Some comments",
      file: file
    },

    second: {
      comment: "Second comment",
      file: file
    },

    eof: {
      comment: "Third",
      index: 2,
      file: file
    }
  }

  var listener = {
    comments: function (comments) {
      (this.comments.calls = this.comments.calls || [])
        .push(comments) }
  }

  var emitter = new Mediador

  emitter.on(
    new CommentExtractor()
      .on(listener) )

  //! when
  emitter.emit("comment", [options.first])
  emitter.emit("comment", [options.second])
  emitter.emit("comment", [options.eof])

  //! then
  assert.equal(
    listener.comments.calls[0].comments,
    "Some comments\nSecond comment\nThird" )
  assert.equal(
    listener.comments.calls[0].file.file, "file.txt" )
})

module.exports = CommentExtractor
