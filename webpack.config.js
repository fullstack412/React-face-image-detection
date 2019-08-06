module.exports = {
  entry: [
  	'./src/app.js'
  ],
  output: {
  	path: __dirname,
  	filename: "bundle.js"
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      loader: 'babel-loader'
  	},
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  }
};