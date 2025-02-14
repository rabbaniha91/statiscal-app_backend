import { body } from "express-validator";

export const signinValidate = () => {
  return [
    body("username")
      .notEmpty()
      .withMessage("Please enter your username")
      .isLength({ min: 3 })
      .withMessage("The username should not be less than 3 letters.")
      .isLength({ max: 50 })
      .withMessage("Username should not exceed 50 characters.")
      .matches(/[a-zA-Z0-9]+/)
      .withMessage("Usernames can only contain uppercase and lowercase English letters and numbers."),
    body("email").notEmpty().withMessage("Please enter your email").isEmail().withMessage("The email format is not correct."),
    body("password")
      .notEmpty()
      .withMessage("Please enter your password")
      .isStrongPassword()
      .withMessage(
        "The password must be at least 8 characters long and consist of uppercase and lowercase English letters, numbers, and one special character."
      ),
  ];
};

export const loginValidate = () => {
  return [
    body("email").notEmpty().withMessage("Please enter your email").isEmail().withMessage("The email format is not correct."),
    body("password").notEmpty().withMessage("Please enter your password"),
  ];
};
