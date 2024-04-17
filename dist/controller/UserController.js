"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserEntity = require("../entity/UserEntity");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const UserService_1 = require("../Services/UserService");
module.exports = {
    ListAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("list alll");
                const usersList = yield UserService_1.userService.GetUsers();
                if (usersList) {
                    return res.status(http_status_codes_1.default.OK).json(usersList);
                }
                else {
                    return res.status(http_status_codes_1.default.NO_CONTENT).send([]);
                }
            }
            catch (error) {
                return res
                    .status(http_status_codes_1.default.BAD_REQUEST)
                    .send("Erro na lista de usuários: " + error);
            }
        });
    },
    GetById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserService_1.userService.GetById(Number(req.params.id));
                if (!user) {
                    return res
                        .status(http_status_codes_1.default.NOT_FOUND)
                        .send("Usuário não encontrado");
                }
                return res.status(http_status_codes_1.default.OK).json(user);
            }
            catch (error) {
                return res
                    .status(http_status_codes_1.default.BAD_REQUEST)
                    .send("Erro ao buscar usuário: " + req.params.Id);
            }
        });
    },
    GetByEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserService_1.userService.GetByEmail(req.params.email);
                if (!user) {
                    return res
                        .status(http_status_codes_1.default.NOT_FOUND)
                        .send("Usuário não encontrado");
                }
                return res.status(http_status_codes_1.default.OK).json(user);
            }
            catch (error) {
                return res
                    .status(http_status_codes_1.default.BAD_REQUEST)
                    .send("Erro ao buscar usuário: " + req.params.Email);
            }
        });
    },
    Create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserService_1.userService.GetByEmail(req.body.Email);
                if (user) {
                    return res
                        .status(http_status_codes_1.default.CREATED)
                        .json("Já existe usuário cadastrado com este email.");
                }
                const body = {
                    Id: 0,
                    Name: req.body.Name,
                    Birth: req.body.Birth,
                    Email: req.body.Email,
                    Pass: req.body.Pass,
                };
                const userCreated = yield UserService_1.userService.Create(body);
                if (userCreated) {
                    return res
                        .status(http_status_codes_1.default.CREATED)
                        .json("Usuário adicionado com sucesso.");
                }
            }
            catch (error) {
                console.error(error);
                return res
                    .status(http_status_codes_1.default.INTERNAL_SERVER_ERROR)
                    .json("Ocorreu um erro ao adicionar o usuário.");
            }
        });
    },
    Login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginDatas = {
                    Email: req.body.Email,
                    Pass: req.body.Pass,
                };
                const login = yield UserService_1.userService.Login(loginDatas);
                if (login) {
                    console.log(login);
                    return res.status(http_status_codes_1.default.OK).send(login);
                }
            }
            catch (error) {
                console.log(error);
                return res
                    .status(http_status_codes_1.default.BAD_REQUEST)
                    .send("Erro no login usuário: " + error);
            }
        });
    },
    Update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = {
                    Id: req.body.Id,
                    Name: req.body.Name,
                    Birth: req.body.Birth,
                    Email: req.body.Email,
                    Pass: req.body.Pass,
                };
                const user = yield UserService_1.userService.Update(body);
                if (user) {
                    return res
                        .status(http_status_codes_1.default.OK)
                        .send("Usuário alterado com sucesso.");
                }
            }
            catch (error) {
                return res
                    .status(http_status_codes_1.default.BAD_REQUEST)
                    .send("Erro ao alterar usuário: " + error);
            }
        });
    },
    Delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userEntity = yield UserEntity.findByPk(req.body.Id);
                yield userEntity.destroy();
                return res
                    .status(http_status_codes_1.default.OK)
                    .send("Usuário excluído com sucesso.");
            }
            catch (error) {
                return res
                    .status(http_status_codes_1.default.BAD_REQUEST)
                    .send("Erro ao deletar usuário: " + error);
            }
        });
    },
};
