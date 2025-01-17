## rollup.js

Rollup is a module bundler for JavaScript which compiles small pieces of code into something larger
and more complex, such as a library or application. It uses the new standardized format for code
modules included in the ES6 revision of JavaScript, instead of previous idiosyncratic solutions such
as CommonJS and AMD. ES modules let you freely and seamlessly combine the most useful individual
functions from your favorite libraries. This will eventually be possible natively everywhere,
but Rollup lets you do it today.

Install rollup.js

```
$ npm install rollup -D
```

# rollup.js Config

Rollup configuration files are optional, but they are powerful and convenient and thus recommended. A config file is an ES module that exports a default object with the desired options.

```js
module.exports = {
    input: './src/components/index.js',
    output: {
        dir: 'dist',
        format: 'es',
    },
};
```

We have created config using CommonJS syntax so we don't have to update our `package.json` or use `.cjs` extension.

Create a script in the `package.json` and run it:

```
$  npm run rollup:build
```

Immediately, we can see error resulting from running this command:

```
./src/components/index.js → dist...
[!] RollupError: src/components/index.js (5:51): Expression expected
src/components/index.js (5:51)
3: import AppComponent from '@/components/App'; // thanks to alias field in the resolve object
4:
5: createRoot(document.getElementById('root')).render(<AppComponent />);
```

Our current setup doesn't understand the JSX syntax used in the React component.

# Babel

Many developers use Babel in their projects in order to use the latest JavaScript features that aren't yet supported by browsers and Node.js.

The easiest way to use both Babel and Rollup is with [@rollup/plugin-babel](https://github.com/rollup/plugins/tree/master/packages/babel). First, install the plugin:

```
$ npm i -D @rollup/plugin-babel
```

Register the plugin in the rollup.config.js:

```js
const babel = require('@rollup/plugin-babel');

module.exports = {
    input: './src/components/index.js',
    output: {
        dir: 'dist',
        format: 'es',
    },
    plugins: [babel({ babelHelpers: 'bundled' })],
};
```

# Babel.js

Install the following packages:

```
$ npm i -D @babel/core @babel/preset-env
```

Create Babel.js configuration file in the root of the project, namely `.babelrc.json`.

```json
{
    "presets": ["@babel/preset-env"]
}
```

Run the build script again:

```
$ npm run rollup:build
```

We now have another error:
_[!] TypeError: react is not a function: ...: Support for the experimental syntax 'jsx' isn't currently enabled_

We need to include another babel preset in our `rollup.config.js` configuration, namely `"@babel/preset-react"`.

This preset was already installed in the previous session when we were creating a build tool based on webpack.

In `.babelrc.json` add that package:

```json
{
    "presets": ["@babel/env", "@babel/preset-react"]
}
```

```
$ npm run rollup:build
```

Now the build succeeded but with some warnings:

_./src/components/index.js → dist...
(!) Unresolved dependencies
https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency
react (imported by "src/components/index.js")
react-dom/client (imported by "src/components/index.js")
@/components/App (imported by "src/components/index.js")
created dist in 182ms_

We cannot use such code directly in the browser and we will try to do that only to see the errors emerging from the attempt to do so.

But for that we will install another rollupjs plugin to run our bundle with the development server in the browser:

```
$ npm install --save-dev rollup-plugin-livereload rollup-plugin-serve
```

Update the rollup.config.js

```js
const babel = require('@rollup/plugin-babel');
const serve = require('rollup-plugin-serve');
const livereload = require('rollup-plugin-livereload');

module.exports = {
    input: './src/components/index.js',
    output: {
        dir: 'dist',
        format: 'es',
    },
    plugins: [babel({ babelHelpers: 'bundled' }), serve('dist'), livereload()],
};
```

Run the build again:

```
npm run rollup:build
```

_./src/components/index.js → dist...
http://localhost:10001 -> /Users/../../build-react-w-rollup/dist
LiveReload enabled
(!) Unresolved dependencies
https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency
react (imported by "src/components/index.js")
react-dom/client (imported by "src/components/index.js")
@/components/App (imported by "src/components/index.js")
created dist in 264ms_

If we visit http://localhost:10001, we can see that the error is completely different - /dist/index.html file cannot be found.

In the earlier session for webpack, we used the `html-webpack-plugin` plugin, which copied the html file from the `public` directory with script tags pointing to created bundles to the `dist` directory.
We need something similar here.

```
$ npm install @rollup/plugin-html --save-dev
```

Update the configuration file:

```js
const babel = require('@rollup/plugin-babel');
const serve = require('rollup-plugin-serve');
const livereload = require('rollup-plugin-livereload');
const html = require('@rollup/plugin-html');

module.exports = {
    input: './src/components/index.js',
    output: {
        dir: 'dist',
        format: 'es',
    },
    plugins: [
        babel({ babelHelpers: 'bundled' }),
        html(),
        serve('dist'),
        livereload(),
    ],
};
```

Run the build again:

```
$ npm run rollup:build
```

The plugin created `dist/index.html` with the same content than the one in the `public/index.html` but with the following script tag:
`<script src="index.js" type="module"></script>`.

Sure, we might expected this will now work, but...
The page now loads in the browser, and we inspect it we see the error:

_Uncaught TypeError: Failed to resolve module specifier "react". Relative references must start with either "/", "./", or "../"._

The root of of our error lies in how we defined path aliases in the webpack session in the `public/index.js` for `AppComponent` import:

```js
import AppComponent from '@/components/App';
```

Remove that `@` in the path and prepare for another build attempt.

```
$ npm run rollup:build
```

Not surprisingly, another error:

\*./src/components/index.js → dist...
(!) Unresolved dependencies
https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency
react (imported by "src/components/index.js" and "src/components/App.js")
react-dom/client (imported by "src/components/index.js")
[!] RollupError: Could not resolve "../shared/Button" from "src/components/App.js"
src/components/App.js

-

It says, rollup cannot resolve it as is, so we need yet another plugin, namely `@rollup/plugin-node-resolve`.

```
$ npm install --save-dev @rollup/plugin-node-resolve
```

And add it to the config file:

```js
const babel = require('@rollup/plugin-babel');
const serve = require('rollup-plugin-serve');
const livereload = require('rollup-plugin-livereload');
const html = require('@rollup/plugin-html');
const resolve = require('@rollup/plugin-node-resolve');

module.exports = {
    input: './src/components/index.js',
    output: {
        dir: 'dist',
        format: 'es',
    },
    plugins: [
        resolve({
            extensions: ['.js', '.jsx'],
        }), // make sure it is first resolved ...
        babel({ babelHelpers: 'bundled' }), // ... then translated
        html(),
        serve('dist'),
        livereload(),
    ],
};
```

This time, when you `npm run rollup:build`, no errors are emitted — the bundle contains the imported module.
This plugin can now import external modules.

Also, we need to precise which extensions of files that the plugin will operate on - in our case that are `.js` and `.jsx`.

```
$ npm run rollup:build
```

_./src/components/index.js → dist...
[!] RollupError: public/dog-img.jpg (1:0): Unexpected character '�' (Note that you need plugins to import files that are not JavaScript)
public/dog-img.jpg (1:0)_

We need another plugin for this - `@rollup/plugin-url`.

```
$ npm install @rollup/plugin-url --save-dev
```

Again, make the following modification to the configuration:

```js
...
const url = require('@rollup/plugin-url');

module.exports = {
    input: './src/components/index.js',
    output: {
        dir: 'dist',
        format: 'es',
    },
    plugins: [
        resolve({
            extensions: ['.js', '.jsx'],
        }),
        babel({ babelHelpers: 'bundled' }),
        url(),
        html(),
        serve('dist'),
        livereload(),
    ],
};

```

```
$ npm run rollup:build
```

Now the error is related to CSS, we need another, well guess - plugin, namely `rollup-plugin-css-only`:

```
$ npm install --save-dev rollup-plugin-css-only
```

Make necessary configuration updates:

```js
...
const css = require('rollup-plugin-css-only');

module.exports = {
    ...
    plugins: [
        resolve({
            extensions: ['.js', '.jsx'],
        }),
        babel({ babelHelpers: 'bundled' }),
        css(),
        url(),
        html(),
        serve('dist'),
        livereload(),
    ],
};
```

```
$ npm run rollup:build
```

Another error emerges:

_./src/components/index.js → dist...
[!] RollupError: src/components/App.js (1:7): "default" is not exported by "node_modules/react/index.js", imported by "src/components/App.js".
https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module
src/components/App.js (1:7)
1: import React, { lazy } from 'react';_

To resolve it we need to install the `@rollup/plugin-commonjs` plugin:

```
$ npm install @rollup/plugin-commonjs --save-dev
```

Some libraries expose ES modules that you can import as-is — the-answer is one such module. But at the moment, the majority of packages on NPM are exposed as CommonJS modules instead. Until that changes, we need to convert CommonJS to ES2015 before Rollup can process them.

The @rollup/plugin-commonjs plugin does exactly that.

Note that most of the time @rollup/plugin-commonjs should go before other plugins that transform your modules — this is to prevent other plugins from making changes that break the CommonJS detection. An exception for this rule is the Babel plugin, if you're using it then place it before the commonjs one.

Make necessary config update:

```js
...
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
    ...
    plugins: [
        resolve({
            extensions: ['.js', '.jsx'],
        }),
        commonjs({
            include: ['node_modules/**'],
        }),
        babel({ babelHelpers: 'bundled' }),
        css(),
        url(),
        html(),
        serve('dist'),
        livereload(),
    ],
};
```

```
$ npm run rollup:build
```

_./src/components/index.js → dist...
[BABEL] Note: The code generator has deoptimised the styling of /Users/.../build-react-w-rollup/node_modules/react-dom/cjs/react-dom-client.production.js as it exceeds the max of 500KB.
[BABEL] Note: The code generator has deoptimised the styling of /Users/.../coding_2025/build-react-w-rollup/node_modules/react-dom/cjs/react-dom-client.development.js as it exceeds the max of 500KB.
http://localhost:10001 -> /Users/.../coding_2025/build-react-w-rollup/dist
LiveReload enabled
created dist in 1.4s_

Now, if we visit `http://localhost:10001` we will notice a runtime error:

```
Uncaught ReferenceError: process is not defined
```

We have to use a plugin that will replace each instance of `process.env.NODE_ENV` with `'production'` string whenever it finds it in the output bundle.

```
$ npm install @rollup/plugin-replace --save-dev
```

```js
...
const replace = require('@rollup/plugin-replace');

module.exports = {
    ...
    plugins: [
        resolve({
            extensions: ['.js', '.jsx'],
        }),
        commonjs({
            include: ['node_modules/**'],
        }),
        babel({ babelHelpers: 'bundled' }),
        css(),
        url(),
        html(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
            preventAssignment: true,
        }),
        serve('dist'),
        livereload(),
    ],
};

```


```
$ npm run rollup:build
```

We get yet another error in the runtime, and by inspecting the browser console we can identify it:

*Uncaught Error: Minified React error #299; visit https://react.dev/errors/299 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
    at reactDomClient_production.createRoot (index.js:872:367101)
    at index.js:928:15*

If we check the output version of the `index.html` in the `dist`, we can see the following:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Rollup Bundle</title>
    </head>
    <body>
        <script src="index.js" type="module"></script>
        <script src="Dynamic-Bxt9_ovx.js" type="module"></script>
    </body>
</html>
```

But we are working with React, and there is no `<div>` tag with `id="root"` as in the `public` directory:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Webpack</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

React is not able to load the `App` component in that placeholder.
We need to make use of the installed `@rollup/plugin-html` plugin, i.e. pass in a configuration object that holds a callback function that receives our bundle, we can then extract the bundle keys, make some mappings, rewrite the tags for `<link>` and `<script>` to point to the correct `href` and `src` respectively. 
After that we return the original html file from the `public` directory but injected with that rewritten tags that point to the correct bundled files.