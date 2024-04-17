const UserEntity = require("../entity/UserEntity");
import e, { Request, Response, NextFunction } from "express";
import StatusCodes from "http-status-codes";
import { userService } from "../Services/UserService";
import { UserType } from "../@types/UserType";
import { LoginType } from "../@types/LoginType";
module.exports = {
    async ListAll(req: Request, res: Response) {
        try {
            console.log("list alll");
            const usersList: UserType[] = await userService.GetUsers();
            if (usersList) {
                return res.status(StatusCodes.OK).json(usersList);
            } else {
                return res.status(StatusCodes.NO_CONTENT).send([]);
            }
        } catch (error) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send("Erro na lista de usuários: " + error);
        }
    },

    async GetById(req: Request, res: Response) {
        try {
            const user: UserType = await userService.GetById(
                Number(req.params.id)
            );
            if (!user) {
                return res
                    .status(StatusCodes.NOT_FOUND)
                    .send("Usuário não encontrado");
            }

            return res.status(StatusCodes.OK).json(user);
        } catch (error) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send("Erro ao buscar usuário: " + req.params.Id);
        }
    },

    async GetByEmail(req: Request, res: Response) {
        try {
            const user: UserType = await userService.GetByEmail(
                req.params.email
            );
            if (!user) {
                return res
                    .status(StatusCodes.NOT_FOUND)
                    .send("Usuário não encontrado");
            }
            return res.status(StatusCodes.OK).json(user);
        } catch (error) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send("Erro ao buscar usuário: " + req.params.Email);
        }
    },

    async Create(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await userService.GetByEmail(req.body.Email);
            if (user) {
                return res
                    .status(StatusCodes.CREATED)
                    .json("Já existe usuário cadastrado com este email.");
            }

            const body: UserType = {
                Id: 0,
                Name: req.body.Name,
                Birth: req.body.Birth,
                Email: req.body.Email,
                Pass: req.body.Pass,
            };

            const userCreated: UserType = await userService.Create(body);

            if (userCreated) {
                return res
                    .status(StatusCodes.CREATED)
                    .json("Usuário adicionado com sucesso.");
            }
        } catch (error) {
            console.error(error);
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json("Ocorreu um erro ao adicionar o usuário.");
        }
    },

    async Login(req: Request, res: Response, next: NextFunction) {
        try {
            const loginDatas: LoginType = {
                Email: req.body.Email,
                Pass: req.body.Pass,
            };

            const login = await userService.Login(loginDatas);
            if (login) {
                console.log(login);
                return res.status(StatusCodes.OK).send(login);
            }
        } catch (error) {
            console.log(error);

            return res
                .status(StatusCodes.BAD_REQUEST)
                .send("Erro no login usuário: " + error);
        }
    },

    async Update(req: Request, res: Response) {
        try {

            const body: UserType = {
                Id: req.body.Id,
                Name: req.body.Name,
                Birth: req.body.Birth,
                Email: req.body.Email,
                Pass: req.body.Pass,
            };

            const user = await userService.Update(body);

            if(user){
                return res
                .status(StatusCodes.OK)
                .send("Usuário alterado com sucesso.");
            }
        } catch (error) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send("Erro ao alterar usuário: " + error);
        }
    },

    async Delete(req: Request, res: Response) {
        try {
            const userEntity = await UserEntity.findByPk(req.body.Id);
            await userEntity.destroy();
            return res
                .status(StatusCodes.OK)
                .send("Usuário excluído com sucesso.");
        } catch (error) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send("Erro ao deletar usuário: " + error);
        }
    },
};
