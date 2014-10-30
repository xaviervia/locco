var spec      = require("washington")
var assert    = require("assert")
var fs        = require("fs")
var Mediador  = require("mediador")
var glob      = require("glob")

var FileReader = function () {

}

FileReader.prototype = Object.create(Mediador.prototype)

FileReader.prototype.go = function (options) {
  glob.sync(options.pattern).forEach( function (name) {
    var argument = { file: name }
    argument.text = fs.readFileSync(name).toString()
    argument.lines = argument.text.split("\n")
    this.emit("file", [argument])
  }.bind(this) )
}

spec("should emit each file matched by the pattern with metadata", function () {
  //! given
  try { fs.mkdirSync("tmp")           } catch (e) {}
  try { fs.mkdirSync("tmp/test")      } catch (e) {}
  fs.writeFileSync("tmp/test/file.txt", "some data\nlala")
  fs.writeFileSync("tmp/test/another.txt", "some other data")
  fs.writeFileSync("tmp/test/another.backup", "not match")

  var listener = {
    file: function (file) {
      (this.file.calls = this.file.calls || {})[file.file] = file }
  }

  //! when
  new FileReader()
    .on(listener)
    .go({ pattern: "tmp/**/*.txt" })

  //! then
  assert.equal(listener.file.calls["tmp/test/file.txt"].file, "tmp/test/file.txt")
  assert.equal(listener.file.calls["tmp/test/file.txt"].text, "some data\nlala")
  assert.equal(listener.file.calls["tmp/test/file.txt"].lines[0], "some data")
  assert.equal(listener.file.calls["tmp/test/file.txt"].lines[1], "lala")

  assert.equal(listener.file.calls["tmp/test/another.txt"].file, "tmp/test/another.txt")
  assert.equal(listener.file.calls["tmp/test/another.txt"].text, "some other data")
  assert.equal(listener.file.calls["tmp/test/another.txt"].lines[0], "some other data")

  assert.equal(listener.file.calls["tmp/test/another.backup"], undefined)

  fs.unlinkSync("tmp/test/file.txt")
  fs.unlinkSync("tmp/test/another.txt")
  fs.unlinkSync("tmp/test/another.backup")
  fs.rmdirSync("tmp/test")
  fs.rmdirSync("tmp")
})

module.exports = FileReader
