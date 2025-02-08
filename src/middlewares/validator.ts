import { body } from "express-validator";

export const signinValidate = () => {
  return [
    body("firstname")
      .notEmpty()
      .withMessage("Please enter your first name")
      .isLength({ min: 3 })
      .withMessage("The first name should not be less than 3 letters.")
      .isLength({ max: 50 })
      .withMessage("First name should not exceed 50 characters."),
    body("lastname")
      .notEmpty()
      .withMessage("Please enter your last name")
      .isLength({ min: 3 })
      .withMessage("The last name should not be less than 3 letters.")
      .isLength({ max: 50 })
      .withMessage("Last name should not exceed 50 characters."),
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
