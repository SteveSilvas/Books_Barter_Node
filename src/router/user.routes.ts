import {Router, Request, Response, NextFunction} from "express";
const UserController = require("../controller/UserController");
const UserRoute = Router();

UserRoute.get('/users', UserController.ListAll);

UserRoute.post('/users/add', UserController.Create);

UserRoute.post('/users/login', UserController.Login);

UserRoute.get('/users/:id', UserController.GetById);

UserRoute.get('/users/email/:email', UserController.GetByEmail);

UserRoute.put('/users/update', UserController.Update);

UserRoute.delete('/users/delete', UserController.Delete)

export default UserRoute;