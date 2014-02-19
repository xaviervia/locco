var fs = require("fs"),
    rm = require("rimraf");

module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-vows");

  grunt.initConfig({
    vows: {
      parse: {
        src: ["spec/jsocco/parse.js"]
      },
      'is-quoted': {
        src: ["spec/jsocco/is-quoted.js"]
      },
      'read-file': {
        src: ["spec/jsocco/read-file.js"]
      },

      main: {
        src: ["spec/jsocco.js"]
      }
    }
  });

  grunt.registerTask("clean", "Clean after yourself", function () {
    ['tmp', 'doc', 'docs'].forEach(function (dir) {
      grunt.log.writeln("Removing dir `" + dir + "`");
      rm.sync(dir);      
    });
  });

  grunt.registerTask("doc", "Generate documentation using itself", function () {
    grunt.log.writeln("Generating documentation for `jsocco.js`");
    require("./jsocco")("jsocco.js");
  });
};