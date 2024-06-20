# Electron Socket.IO Playground - Develop apps without a front-end

![Playground image](https://i.imgur.com/OaQZCC9.png)

For a ready-to-use web version: https://socketio-playground.ibrod83.com/

### `npm run electron`

Launches the program in Electron(production). Note that this will require the `npm run build` to be run first.<br>

### `npm run package`

Will run `npm run build` and then `electron-forge package`, to pack the files into a working Electron build, inside "out" directory.<br>

### `npm run dev-server`

Runs the program in the browser, in development mode.<br>

### `npm run dev`

Runs the program in Electron(development). Please note, that you will need to run `npm run dev-server` in parallel
