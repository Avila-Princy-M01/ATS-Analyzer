import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    entry: path.resolve(__dirname, "main.jsx"),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/"
    },
    resolve: {
        extensions: [".js", ".jsx"]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "index.html")
        }),
        new webpack.DefinePlugin({
            "process.env.REACT_APP_API_URL": JSON.stringify(process.env.REACT_APP_API_URL)
        })
    ],
    devServer: {
        port: 3000,
        historyApiFallback: true,
        proxy: [
            {
                context: ["/auth", "/resume"],
                target: "http://localhost:5000"
            }
        ]
    }
};
