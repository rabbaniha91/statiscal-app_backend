import { Router } from "express";
import { login, logout, refreshTokens, signup } from "../controllers";
import { authenticateAccessToken } from "../../../middlewares/authenticate";
import { loginValidate, signinValidate } from "../../../middlewares/validator";
import { validateRequest } from "../../../middlewares/validateRequest";

const router = Router();

router.post("/signup", signinValidate(), validateRequest, signup);
router.post("/login", loginValidate(), validateRequest, login);
router.post("/refresh-token", refreshTokens);

router.use(authenticateAccessToken);
router.get("/logout", logout);

export default router;
