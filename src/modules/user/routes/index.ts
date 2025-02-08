import { Router } from "express";
import { login, logout, signin } from "../controllers";
import { authenticateUser } from "../../../middlewares/authenticate";
import { loginValidate, signinValidate } from "../../../middlewares/validator";

const router = Router();

router.post("/signin", signinValidate(), signin);
router.post("/login", loginValidate(), login);

router.use(authenticateUser);
router.get("/logout", logout);

export default router;
