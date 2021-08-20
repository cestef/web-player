# Web-Player

This is just a random quick project I made during vacations because I had no internet for almost a week

The webapp is clearly not optimized, please do not yell at me for declaring 32 states in a row and re-rendering every 2ms ':)

## Starting the app

If you want to run the app locally, execute the following:

```
npm install
npm start
```

## Live Demo

If you are too lazy to run it locally or just want to see how it looks first, there is a demo available at [player.cstef.dev](player.cstef.dev)

## Common Problems

### "Cannot find module: 'react-native-fs'. Make sure this package is installed."

This is a problem related to `jsmediatags` package. You need to edit the `main` and `browser` fields in the `package.json` from the module and set them both to `dist/jsmediatags.min.js`

### "Module '"jsmediatags"' has no exported member 'Tags'."

Make sure the `postinstall` script has been ran. If not, execute it manually by running `npm run postinstall` or if the world is about to end soon and nothing is working: `patch-package` (if doing so, make sure to install it first with `npm i -g patch-package`)

## Contributing

Pull requests are welcome, I will review them as quick as possible
