// locco
// =====
//
// Simple documentation extractor.
//
var spec              = require("washington")
var assert            = require("assert")

var locco = function (options) {

  new locco.File.Reader()
    .on(new locco.Parser(options)
      .on(options.adapter
        .on(new locco.File.Writer)))
    .get(options.source)

}

locco.File              = require("./src/file")
locco.Parser            = require("./src/parser")
locco.Adapter           = require("./src/adapter")

module.exports = locco

//
// License
// -------
//
// Copyright 2014 Xavier Via
//
// ISC license.
//
// See [LICENSE](LICENSE) attached.
