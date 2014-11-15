// locco
// =====
//
// ![Codeship status](https://www.codeship.io/projects/173f7bd0-ad2d-0131-d326-5a3e053281b1/status)
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
