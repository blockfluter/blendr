var path = require("path");
var webpack = require("webpack");

var BUILD_FOLDER = "build";
var HtmlWebpackPlugin = require("html-webpack-plugin");
var CleanWebpackPlugin = require("clean-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
//   devtool: 'source-map',

module.exports = {
	devtool: "cheap-module-source-map",
	entry: "./src/index.js",
	output: {
		path: path.resolve(__dirname, BUILD_FOLDER),
		filename: "[name]-bundle-[hash].js"
	},
	module: {
		loaders: [
			{
				test: /\.css$/,
				loader: "style-loader!css-loader"
			},
			{
				test: /\.scss$/,
				loader:
					"style-loader!css-loader?modules=true!sass-loader!postcss-loader"
			},
			{
				test: /\.jpeg|png$/,
				loader: "url-loader"
			},
			{
				test: /\.html$/,
				loader: "html-loader"
			},
			{
				test: /\.js$/,
				loader: "babel-loader",
				query: { compact: "auto" }
			},
			{
				test: /\.svg$/,
				loader: "svg-inline-loader"
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "randallwiggins",
			template: "src/index.template",
			inject: "body"
		}),
		new CleanWebpackPlugin([BUILD_FOLDER], {
			verbose: true,
			dry: false,
			exclude: []
		}),
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production")
			}
		}),
		new ExtractTextPlugin("[name]-[hash].css"),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: false,
			compressor: {
				warnings: false
			}
		})
	],
}
