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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const UserEntity = require("../entity/UserEntity");
exports.userService = {
    GetUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usersList = yield UserEntity.findAll();
                return usersList;
            }
            catch (error) {
                throw error;
            }
        });
    },
    GetById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserEntity.findByPk(id);
                return user;
            }
            catch (error) {
                throw error;
            }
        });
    },
    GetByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserEntity.findOne({
                    where: { email },
                });
                return user;
            }
            catch (error) {
                throw error;
            }
        });
    },
    Create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserEntity.create(data);
                return user;
            }
            catch (error) {
                throw error;
            }
        });
    },
    Login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Email = data.Email;
                const Pass = data.Pass;
                const user = yield UserEntity.findOne({
                    where: { Email },
                });
                if (!user)
                    throw "Email inválido.";
                if (user.Pass != Pass)
                    throw "Senha incorreta.";
                if (user && user.Pass == Pass) {
                    const response = {
                        message: "Usuário logado com sucesso.",
                        data: user,
                    };
                    return response;
                }
            }
            catch (error) {
                throw error;
            }
        });
    },
    Update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield UserEntity.findByPk(data.Id);
                if (!user)
                    throw "Usuário não encontrado";
                // user.
                yield user.save();
                return user;
            }
            catch (error) {
                throw error;
            }
        });
    },
};
