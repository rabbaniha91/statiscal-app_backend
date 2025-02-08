import { Router } from "express";
import { login, logout, signin } from "../controllers";
import { authenticateUser } from "../../../middlewares/authenticate";
import { loginValidate, signinValidate } from "../../../middlewares/validator";
import { validateRequest } from "../../../middlewares/validateRequest";

const router = Router();

router.post("/signin", signinValidate(), validateRequest, signin);
router.post("/login", loginValidate(), validateRequest, login);

router.use(authenticateUser);
router.get("/logout", logout);

export default router;
