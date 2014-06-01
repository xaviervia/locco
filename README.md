locco
======

[Docco](//github.com/jashkenas/docco) port that doesn't depend on
[Pygments](//pygments.org/). It uses
[Github Flavored Markdown](//github.github.com/github-flavored-markdown/)
for Markdown processing and [Highlight.js](//highlightjs.org) for syntax highlight.

Supports template customization using [Mustache](//mustache.github.com).

### Installation

    npm install locco --save

Test
----

    grunt vows

Usage
-----

### locco( pattern, options )

Parses a series of files found using a [`glob`](//github.com/isaacs/minimatch)
pattern. The resulting HTML files are written in
the default `doc` directory.

Here goes an example:

```js
var locco = require("locco");

var documentedFiles = locco("js/**/*.js");
```

The `documentedFiles` variable will be an array containing the parsed files.

> **locco** does everything synchronously. Why is that?
> Because locco is useful in contexts where asynchronicity means nothing
> but troble.
> In **locco**, doc generation for each file is intended to be atomic. Files
> are usually too many for you to be able to handle callbacks without
> serious acrobatics, and with no real benefit, why should you?

#### Options

The second, optional argument allows you to configure both the output folder
and whether the base folder in the glob pattern will be excluded from
the hierarchy in the output files.

##### `output`

Sets the path of the output folder. Default: **doc**

```js
var locco = require("locco");

var documentedFiles = locco("js/**/*.js", {output: "documentation"});
```

##### `includeBase`

If `true`, includes the full relative file path in the folder. If
`false`, includes the path starting from the `**` or `*` wildcards in
the glob pattern, which is more clean.

Default is `false`.

For example, if your project source files are all contained in a `src`
directory, setting the pattern to `src/**/*js`
will produce the files to be output directly into the `doc` directory
discarding the `src` prefix.

```js
var locco = require("locco");

var documentedFiles = locco("src/**/*.js", {includeBase: false});
```

#### Arguments

- `String` pattern
- _optional_ `Object` options
  - output: `String`
  - includeBase: `Boolean`

#### Returns

- `Array` parsedFiles


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
