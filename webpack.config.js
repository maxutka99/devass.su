const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs"); const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
    return templateFiles.map(item => {
        const parts = item.split(".");
        const name = parts[0];
        const extension = parts[1];

        return new HtmlWebpackPlugin({
            filename: `${name}.html`,
            template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
            inject: false,
        });
    });
}

const htmlPlugins = generateHtmlPlugins("./src/html/views");

module.exports = [{
    entry: ["./src/scss/index.scss", "./src/js/index.js"],
    output: {
        // This is necessary for webpack to compile
        // But we never use style-bundle.js
        filename: "bundle.js",
    },
    mode: "development",
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
        },
        compress: true,
        port: 9000
    },
    module: {
        rules: [{
                test: /\.scss$/,
                use: [{
                        loader: "file-loader",
                        options: {
                            name: "bundle.css",
                        },
                    },
                    {
                        loader: "extract-loader"
                    },
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            // Prefer Dart Sass
                            implementation: require("sass"),

                            // See https://github.com/webpack-contrib/sass-loader/issues/804
                            webpackImporter: false,
                            sassOptions: {
                                includePaths: ["./node_modules"]
                            },
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                options: {
                    presets: [
                        "@babel/preset-env",
                        {
                            plugins: ["@babel/plugin-proposal-class-properties"]
                        }
                    ],
                },
            },
            {
                test: /\.html$/,
                include: path.resolve(__dirname, "src/html/includes"),
                use: ["raw-loader"]
            }
        ]
    },
    plugins: htmlPlugins.concat([
        new CopyPlugin({
            patterns: [
                { from: "src/assets", to: "assets" },
                { from: "src/favicon.ico", to: "" }
            ],
        })
    ])
}];