// File
// ====
//
// File adapter for Mediador. Concentrates a Reader and a Writer which
// expose a basic API for reading the content of files using a glob pattern and
// writing to them with events.
var Reader    = require("./reader")
var Writer    = require("./writer")
var Mediador  = require("mediador")

var example = require("washington")
var assert  = require("assert")

var File = function () {
  this.on(new Writer)
  this.on(new Reader().on(this))
}

File.prototype = Object.create(Mediador.prototype)

File.prototype.file = function (file) {
  this.emit("file", [file]) }

File.prototype.line = function (line) {
  this.emit("line", [line]) }

example("proxies the call to file", function () {
  var file = new File
  var listener = {
    file: function (file) {
      (listener.file.calls = listener.file.calls || [])
        .push(file) } }

  file.on(listener)

  file.file("content")

  assert.equal(listener.file.calls[0], "content")
})

example("proxies the call to line", function () {
  var file = new File
  var listener = {
    line: function (file) {
      (listener.line.calls = listener.line.calls || [])
        .push(file) } }

  file.on(listener)

  file.line("content")

  assert.equal(listener.line.calls[0], "content")
})

module.exports = File
