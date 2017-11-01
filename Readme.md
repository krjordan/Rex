# Rex
**Simple single page app pre renderer cli**

## Use

Just tell rex where your app is.
```sh
rex dist
```

### Options

By default rex will only render the '/' route.
You can pass the routes you want prerendered using the `--routes` flag.
```sh
rex dist --routes=/,/contact,/blog
```

The output should be
* `index.html`
* `contact/index.html`
* `blog/index.html`

### Config File

You can also add a config file named `rex.config.js`,
This file merges with the cli options.
Currently there are only 2 options.
```js
// rex.config.js

module.exports = function() {
  return {
    directory: 'dist' // path to to serve
    routes: ['/', '/contact', '/blog']
  }
}
```
