module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-vows");

  grunt.initConfig({
    vows: {
      all: {
        src: ["spec/jsocco.js", "spec/jsocco/*.js"]
      },
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
};