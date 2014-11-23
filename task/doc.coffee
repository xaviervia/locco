locco         = require "../locco"
loccoMarkdown = require "locco-markdown"

module.exports = ->
  locco
    source: "src/**/*.js"
    escapeSequence: "!"
    commentStart: "//"
    adapter: new loccoMarkdown()

  locco
    source: "locco.js"
    escapeSequence: "!"
    commentStart: "//"
    adapter: new loccoMarkdown
      readme: "locco.js"
