const webpack = require("webpack");

module.exports = ({ entry, output, babelOptions }) => {
    // This prevents printing of messages from previous builds.
    delete require.cache[require.resolve("webpackbar")];
    const WebpackBar = require("webpackbar");

    if (typeof process.env["GENERATE_SOURCEMAP"] === "undefined") {
        process.env.GENERATE_SOURCEMAP = "false";
    }

    // Source maps are resource heavy and can cause out of memory issue for large source files.
    const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";
    let sourceMapRegister = null;
    if (!shouldUseSourceMap) {
        sourceMapRegister = {
            test: /source-map-support/,
            use: require.resolve("null-loader", { paths: [__dirname] })
        };
    }

    return {
        entry,
        output: {
            filename: output.filename,
            path: output.path,
            libraryTarget: "commonjs",
            publicPath: process.env.PUBLIC_URL
        },
        resolve: {
            alias: {
                webfontloader: "null-loader",
                "react-spinner-material": "null-loader"
            },
            extensions: [".ts", ".tsx", ".js", ".json", ".jsx", ".mjs"]
        },
        devtool: shouldUseSourceMap ? "source-map" : false,
        target: "node",
        mode: "production",
        node: {
            __dirname: false
        },
        plugins: [
            new WebpackBar({ name: "SSR" }),
            new webpack.DefinePlugin({
                "process.env.REACT_APP_GRAPHQL_API_URL": JSON.stringify(
                    process.env.REACT_APP_GRAPHQL_API_URL
                ),
                "process.env.REACT_APP_ENV": JSON.stringify(process.env.REACT_APP_ENV || "browser"),
                "process.env.PUBLIC_URL": JSON.stringify(process.env.PUBLIC_URL)
            })
        ],
        module: {
            rules: [
                {
                    oneOf: [
                        sourceMapRegister,
                        {
                            test: [/\.mjs$/, /\.tsx?$/, /\.jsx?$/],
                            exclude: /node_modules/,
                            loader: "babel-loader",
                            options: babelOptions
                        },
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: "url-loader",
                            options: { limit: 10000, name: "static/media/[name].[hash:8].[ext]" }
                        },
                        {
                            exclude: [/\.mjs$/, /\.js$/, /\.html$/, /\.json$/],
                            loader: "file-loader",
                            options: {
                                name: "static/media/[name].[hash:8].[ext]",
                                publicPath: process.env.PUBLIC_URL,
                                // Do not emit file since this is a server-side render
                                emitFile: false
                            }
                        }
                    ].filter(Boolean)
                }
            ]
        }
    };
};
