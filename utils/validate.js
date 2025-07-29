import validator from "validator";

export const validateSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new Error("All Fields Are Required");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};

export const validateEditFieldUpdates = (req) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "photoURL",
    "skills",
    "about",
    "age",
    "gender",
  ];

  const validFields = Object.keys(req.body).every((fields) =>
    allowedFields.includes(fields)
  );

  return validFields;
};
