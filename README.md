
locco
======

![Codeship status](https://www.codeship.io/projects/173f7bd0-ad2d-0131-d326-5a3e053281b1/status)

[Docco](//github.com/jashkenas/docco) port that doesn't depend on 
[Pygments](//pygments.org/). It uses 
[Github Flavored Markdown](//github.github.com/github-flavored-markdown/) 
for Markdown processing and [Highlight.js](//highlightjs.org) for syntax highlight.

Supports template customization using [Mustache](//mustache.github.com).

### Installation

`npm install git://github.com/xaviervia/locco.git --save`

Test
----

    grunt vows

Usage
-----

### locco( String pattern [, Object options ] )

To parse a series of JavaScript files using a [`minimatch`](//github.com/isaacs/minimatch) 
pattern from the folders within the `js` directory. The resulting HTML files will be output in
the default `doc` directory.

```js
var locco = require("locco");

var listOfFiles = locco("js/**/*.js");
```

The `listOfFiles` variable will be an array containing the parsed files.

> `locco` is an entirely synchronous tool.

### Options

The second, optional argument allows you to configure both the output folder and
a base folder to be excluded from the hierarchy in the output files.

#### `path`

Sets the path of the output folder.

```js
var locco = require("locco");

var listOfFiles = locco("js/**/*.js", {path: "documentation"});
```

#### `base`

Sets the path to be excluded in the output files names. For example, if
your project source files are all contained in a `src` directory, setting
the pattern to `src/**/*js` and the `base` to `src` will produce the files
to be output directly into the `doc` directory discarding the `src` prefix. 
A file named `src/data.js` will be parsed into `doc/data.js` instead of the
default behavior `doc/src/data.js`.

If some file, for some reason, does not match the `base` path, the `base` option
will be ignored.

```js
var locco = require("locco");

var listOfFiles = locco("src/**/*.js", {base: "src"});
```

#### Arguments

- String pattern
- _optional_ Object options
  - path: String destinationPath
  - base: String baseDirectoryToExclude

#### Returns

- Array parsedFiles


Methods
-------

### parse( String text [, String language] )

Returns HTML code from the `text`, parsed with `marked` inside the comments and
with `highlight.js` for the rest of the code. If no language identifier is passed,
`js` is assumed.

#### Arguments

- String text
- _optional_ String language

#### Returns

- String html


### readFile( String path )

Reads and parses the contents of the file. Does this always synchronously.
Returns the HTML formatted content.

#### Arguments

- String path

#### Returns

- String html



### isQuoted( Integer position, String text )

Returns whether or not the given position is surrounded by quotes.

#### Arguments

- Integer position
- String text

#### Returns

- Boolean isQuoted

License
-------

Copyright (C) 2014 Fernando Vía

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
