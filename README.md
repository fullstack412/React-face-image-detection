React face detection tool
=========================

### Usage

**Install**
```
npm install
```

**Configure app**

* Rename `config.example.js` to `config.js` in `/src` dir.
* In `config.js` file, replace `YOUR_CLARIFAI_API_KEY` and `YOUR_CLARIFAI_APP_ID` with your clarifai api key and app id.

**Start app**
```
npm run start
```

Open http://localhost:8080 in your browser.

Static files are served from the `public` folder, project JavaScript files are bundled from the `src` folder.

**for production**
```
npm run build
```

This will generate a minimized bundle.js file on the `public` folder.

### Dependencies

* React & React-DOM
* Webpack & webpack-dev-server
* Babel Core
* Babel Loader (With "es2015" and "react" presets)
