"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const status_routes_1 = __importDefault(require("./router/status.routes"));
var cors = require("cors");
require('dotenv').config({ path: '.env' });
const api = (0, express_1.default)();
const serverPort = process.env.PORT || 3000;
api.use(cors({ credentials: true, origin: '*', crossorigin: true }));
api.use(express_1.default.json());
api.use(status_routes_1.default);
// api.use(UserRoute);
// api.use(BookRoute);
// api.use(BookCopyRoute);
// api.use(BookCategoryRoute);
// api.use(AddressRoute);
api.use(express_1.default.static('public'));
// api.use((req, res, next) => {
// 	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
//     res.header("Access-Control-Allow-Origin", "http://localhost:3000");
// 	//Quais são os métodos que a conexão pode realizar na API
//     res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
//     api.use(cors());
//     next();
// });
// api.use((req,res,next)=>{
//     res.setHeader('Access-Control-Allow-Origin','*');
//     res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
//     res.setHeader('Access-Control-Allow-Methods','Content-Type');
//     next(); 
// })
api.listen(serverPort);
