var spec      = require("washington")
var assert    = require("assert")
var Mediador  = require("mediador")

var Liner = function (options) {
  if (options)
    this.text = options.text
}

Liner.prototype = Object.create(Mediador.prototype)

Liner.prototype.file = function (options) {
  if (options.text && options.text.split instanceof Function)
    options.text.split("\n").forEach(function (line, index) {
      this.emit("line", [{
        index: index,
        line: line,
        file: options
      }])
    }.bind(this))
}

spec("should emit lines and forward file and extras", function () {
  //! given
  var argument = {
    file: "name.text",
    text: "line1\nline2\nline3",
    lines: ["line1", "line2", "line3"],
    extra: {}
  }

  var listener = {
    "line": function (line) {
      (this.line.calls = this.line.calls || [])
        .push(line) }
  }

  var emitter = new Mediador

  emitter.on(
    new Liner()
      .on(listener) )

  //! when
  emitter.emit("file", [argument])

  //! then
  assert.equal(listener.line.calls[0].line, "line1")
  assert.equal(listener.line.calls[0].index, 0)
  assert.equal(listener.line.calls[0].file.text, argument.text)
  assert.equal(listener.line.calls[0].file.lines, argument.lines)
  assert.equal(listener.line.calls[0].file.file, argument.file)
  assert.equal(listener.line.calls[0].file.extra, argument.extra)

  assert.equal(listener.line.calls[1].line, "line2")
  assert.equal(listener.line.calls[1].index, 1)
  assert.equal(listener.line.calls[1].file.text, argument.text)
  assert.equal(listener.line.calls[1].file.lines, argument.lines)
  assert.equal(listener.line.calls[1].file.file, argument.file)
  assert.equal(listener.line.calls[1].file.extra, argument.extra)

  assert.equal(listener.line.calls[2].line, "line3")
  assert.equal(listener.line.calls[2].index, 2)
  assert.equal(listener.line.calls[2].file.text, argument.text)
  assert.equal(listener.line.calls[2].file.lines, argument.lines)
  assert.equal(listener.line.calls[2].file.file, argument.file)
  assert.equal(listener.line.calls[2].file.extra, argument.extra)
})

module.exports = Liner
