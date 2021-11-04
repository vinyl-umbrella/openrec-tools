const webpack = require('webpack');

module.exports = {
    productionSourceMap: false,
    configureWebpack: {
        plugins: [
            new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ja/),
        ]
    }
};
