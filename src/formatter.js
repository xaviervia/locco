// bufferResolver
// ==============
//
// Buffer processing module. Collects the chunks in the buffer
// and exports the html with marked (markdown) or highlight (code)
// according to the buffer token type

"use strict"

var marked    = require("marked")
var mustache  = require("mustache")
var highlight = require("highlight.js")

var formatter = {

  // markdown( buffer )
  // ------------------
  //
  // Processes a markdown buffer.
  //
  // #### Options
  //
  // - `String` templates.markdown: The mustache template for markdown
  // - `String` language: The language identifier for Highlight
  //
  // #### Arguments
  //
  // - `Array` buffer
  // - `Object` options
  //
  // #### Returns
  //
  // - `String` html
  //
  markdown: function (buffer, options) {
    return "\n" +
      mustache.render(
        options.templates.markdown,
        {
          content: marked(
            buffer.map(function (token) {
              return token.text })
            .join("\n")
          )
        }
      ).trim()
  },

  // code( buffer, options )
  // -----------------------
  //
  // Processes a code buffer. Takes options
  //
  // #### Options
  //
  // - `String` templates.code: The mustache template for the code
  // - `String` language: The language identifier for Highlight
  //
  // #### Arguments
  //
  // - `Array` buffer
  // - `Object` options
  //
  // #### Returns
  //
  // - `String` html
  //
  code: function (buffer, options) {
    return "\n" +
      mustache.render(
        options.templates.code,
        {
          content: highlight.highlight(
            options.language,
            buffer.map(function (token) {
              return token.text  })
            .join("\n")
          ).value
        }
      )
  }

}

module.exports = formatter
