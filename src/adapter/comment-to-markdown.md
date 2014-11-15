CommentToMarkdown
=================

Adapt a venue emitting `comment` events with `file.path`
metadata to append lines to file with `.md` extension.

Usage
-----

```javascript
stream
  .on(new CommentToMarkdown()
    .on("post", function (filename, line) {
      // write to file
    } ) )

stream.emit("comment", [{
  comment: "text",
  file: {
    path: "path/to/file.js"
  }
}])
```

Methods
-------

### comment

Receives a comment string and a file path and emits a `post` event with the
new path and

#### Arguments

- `Object` options
  - `String` comment
  - `Object` file
    - `String` path

#### Events

- `post`
  - `String` targetFile
  - `String` line
