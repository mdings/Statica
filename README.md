# How to rebuild node-sass for electron

The node-sass library needs to be rebuilt against the current version of Electron. This is somethingto keep in mind when updating Electron.

First clone the node-sass git repo and install dependencies:
```
git clone --recursive https://github.com/sass/node-sass.git
cd node-sass
npm install
```

Inside the `node-sass` directory run the following (update the --target flag with the version of electron that we are using, `electron -v`):
```
HOME=~/.electron-gyp ./node_modules/node-gyp/bin/node-gyp.js rebuild --target=1.6.13 --arch=x64 --dist-url=https://atom.io/download/atom-shell --verbose --libsass_ext= --libsass_cflags= --libsass_ldflags= --libsass_library=
```

The output will be inside `build/Release/binding.node`. Copy that file into our `node_modules/node-sass/vendor/darwin-x64-49` folder. Not that the darwin-x64-49 name should match our environment. Electron will thrown an error stating which folder it is expecting the binding file, so look for that if you're not sure which environment we're running on.

## Icons
Icons are from the Material Core
Link: http://bit.ly/ZrkDJq