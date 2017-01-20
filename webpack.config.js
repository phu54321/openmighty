/**
 * Created by whyask37 on 2017. 1. 19..
 */

module.exports = {
    output: {
        path: __dirname + "/public",
        filename: "app.js",
    },
    devtool: 'source-map',
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /(node_modules|bower_components)/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};
