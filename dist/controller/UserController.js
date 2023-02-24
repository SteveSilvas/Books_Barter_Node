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
module.exports = {
    ListAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usersList = yield UserEntity.findAll();
                return res.status(http_status_codes_1.default.OK).json(usersList);
            }
            catch (error) {
                return res.status(http_status_codes_1.default.BAD_REQUEST).send("Erro na lista de usuários: " + error);
            }
        });
    },
    GetById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserEntity.findByPk(req.params.Id);
                return res.status(http_status_codes_1.default.OK).json(user);
            }
            catch (error) {
                return res.status(http_status_codes_1.default.BAD_REQUEST).send("Erro ao buscar usuário: " + req.params.Id);
            }
        });
    },
    GetByEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield UserEntity.findAll();
                users.map((user) => {
                    if (user.Email === req.params.Email) {
                        return res.status(http_status_codes_1.default.OK).json(user);
                    }
                });
                return res
                    .status(http_status_codes_1.default.BAD_REQUEST)
                    .json("Usuário não encontrado com o email " + req.params.Email);
            }
            catch (error) {
                return res.status(http_status_codes_1.default.BAD_REQUEST).send("Erro ao buscar usuário: " + req.params.Email);
            }
        });
    },
    addUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserEntity.create({
                    Name: req.body.Name,
                    Birth: req.body.Birth,
                    Email: req.body.Email,
                    Pass: req.body.Pass,
                });
                return res.status(http_status_codes_1.default.CREATED).send("Usuário adicionado com sucesso.");
            }
            catch (error) {
                return res.status(http_status_codes_1.default.BAD_REQUEST).send("Erro ao adicionar usuário: " + error);
            }
        });
    },
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield UserEntity.findAll();
                let found = false;
                users.map((user) => {
                    if (user.Email == req.body.data.Email) {
                        if (user.Pass == req.body.data.Pass) {
                            found = true;
                            return res.status(http_status_codes_1.default.OK).send(user);
                        }
                        else {
                            return res.status(http_status_codes_1.default.BAD_REQUEST).send("Senhas não conferem");
                        }
                    }
                });
                // if (!found) {
                //     return res.status(StatusCodes.BAD_REQUEST).send("Usuário não encontrado");
                // }
            }
            catch (error) {
                // return res.status(StatusCodes.BAD_REQUEST).send("Erro no login usuário: " + error);
                console.log(error);
            }
        });
    },
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userEntity = yield UserEntity.findByPk(req.body.Id);
                if (userEntity) {
                    (userEntity.Name = req.body.Name),
                        (userEntity.Email = req.body.Email),
                        (userEntity.Nascimento = req.body.Nascimento);
                    userEntity.save();
                }
                return res.status(http_status_codes_1.default.OK).send("Usuário alterado com sucesso.");
            }
            catch (error) {
                return res.status(http_status_codes_1.default.BAD_REQUEST).send("Erro ao alterar usuário: " + error);
            }
        });
    },
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userEntity = yield UserEntity.findByPk(req.body.Id);
                yield userEntity.destroy();
                return res.status(http_status_codes_1.default.OK).send("Usuário excluído com sucesso.");
            }
            catch (error) {
                return res.status(http_status_codes_1.default.BAD_REQUEST).send("Erro ao deletar usuário: " + error);
            }
        });
    },
};
