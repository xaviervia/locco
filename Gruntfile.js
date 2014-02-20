var fs = require("fs"),
    rm = require("rimraf");

module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-vows");

  grunt.initConfig({
    vows: {
      parse: {
        src: ["spec/locco/parse.js"]
      },
      'is-quoted': {
        src: ["spec/locco/is-quoted.js"]
      },
      'read-file': {
        src: ["spec/locco/read-file.js"]
      },

      main: {
        src: ["spec/locco.js"]
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
    grunt.log.writeln("Generating documentation for `locco.js`");
    require("./locco")("locco.js");
  });

  grunt.registerTask("default", ["clean", "doc"]);
};