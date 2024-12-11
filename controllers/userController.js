const userModel = require("../models/userModel");
const md5 = require("md5");
var validator = require("email-validator");

const jsonwebtoken = require("jsonwebtoken");
const { responseFormatter } = require("../utils/utils");
const { loginSchema, registerSchema } = require("../utils/validationSchema");

exports.Login = async (request, response) => {
  try {
    const { error } = loginSchema.validate(request.body);
    if (error) {
      return responseFormatter(response, 400, false, error.details[0].message, null);
    }

    const data = {
      email: request.body.email,
      password: md5(request.body.password),
    };

    const user = await userModel.findOne(data);

    if (!user) {
      return responseFormatter(
        response,
        400,
        false,
        "Email or Password incorrect",
        null
      );
    } else {
      const tokenPayload = {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
      };

      const token = jsonwebtoken.sign(
        tokenPayload,
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: process.env.JWT_EXPIRATION,
        }
      );

      return responseFormatter(
        response,
        200,
        true,
        "Successfully login",
        token
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.Register = async (request, response) => {
  try {

    const { error } = registerSchema.validate(request.body);
    if (error) {
      return responseFormatter(response, 400, false, error.details[0].message, null);
    }

    const data = {
      name: request.body.name,
      email: request.body.email,
      password: md5(request.body.password),
      gender: request.body.gender,
    };

    const validationEmail = validator.validate(data.email);
    if (!validationEmail) {
      return responseFormatter(
        response,
        400,
        false,
        `Email is not valid`,
        null
      );
    }

    const emailLowerCase = data.email.toLowerCase();
    const user = await userModel.findOne({
      $or: [{ email: { $regex: new RegExp(`^${emailLowerCase}$`, "i") } }],
    });

    if (!user) {
      const createdUser = await userModel.create(data);

      return responseFormatter(
        response,
        201,
        true,
        "Success register",
        createdUser
      );
    } else {
      return responseFormatter(
        response,
        400,
        true,
        "User already exists, please look for another email",
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};
