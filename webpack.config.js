let path = require('path');

let conf = {
	
	output: {
		filename: '[name].bundle.js',
		publicPath: '/js/',
		chunkFilename: '[name].chunk.js',
	},
	
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendor',
					chunks: 'all',
					minChunks: 1
				}
			}
		}
	},
	
	resolve: {
		alias: {
			"%": path.resolve(__dirname, "src"),
			"@components": path.resolve(__dirname, "src/components"),
			"@js-res": path.resolve(__dirname, "src/js/resources"),
			"@functions": path.resolve(__dirname, "src/js/resources/functions"),
		}
	},
	
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	}
};

module.exports = conf;