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
const CategoryEntity = require("../entity/CategoryEntity");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
module.exports = {
    ListAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categoriesList = yield CategoryEntity.findAll();
                return res.status(http_status_codes_1.default.OK).json(categoriesList);
            }
            catch (error) {
                return res.status(http_status_codes_1.default.BAD_REQUEST).send("Erro na lista de categorias: " + error);
            }
        });
    },
    GetById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const category = yield CategoryEntity.findByPk(req.params.Id);
                return res.status(http_status_codes_1.default.OK).json(category);
            }
            catch (error) {
                return res.status(http_status_codes_1.default.BAD_REQUEST).send("Erro ao buscar Categoria - Id: " + req.params.Id);
            }
        });
    },
    addCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const category = yield CategoryEntity.create({
                    Description: req.body.Description
                });
                return res.status(http_status_codes_1.default.CREATED).send("Categoria adicionada com sucesso.");
            }
            catch (error) {
                return res.status(http_status_codes_1.default.BAD_REQUEST).send("Erro ao adicionar categoria: " + error);
            }
        });
    },
    updateCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categoryEntity = yield CategoryEntity.findByPk(req.body.Id);
                if (categoryEntity) {
                    categoryEntity.Description = req.body.Description;
                    categoryEntity.save();
                }
                return res.status(http_status_codes_1.default.OK).send("Categoria alterada com sucesso.");
            }
            catch (error) {
                return res.status(http_status_codes_1.default.BAD_REQUEST).send("Erro ao alterar categoria: " + error);
            }
        });
    },
    deleteCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categoryEntity = yield CategoryEntity.findByPk(req.body.Id);
                yield categoryEntity.destroy();
                return res.status(http_status_codes_1.default.OK).send("Categoria excluída com sucesso.");
            }
            catch (error) {
                return res.status(http_status_codes_1.default.BAD_REQUEST).send("Erro ao deletar categoria: " + error);
            }
        });
    },
};
