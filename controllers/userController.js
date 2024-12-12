const userModel = require("../models/userModel");
const md5 = require("md5");
var validator = require("email-validator");

const jsonwebtoken = require("jsonwebtoken");
const { responseFormatter } = require("../utils/utils");
const { loginSchema, registerSchema, userUpdateSchema } = require("../utils/validationSchema");
const mongoose = require("mongoose");

exports.Login = async (request, response) => {
  try {
    const { error } = loginSchema.validate(request.body);
    if (error) {
      return responseFormatter(
        response,
        400,
        false,
        error.details[0].message,
        null
      );
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
      return responseFormatter(
        response,
        400,
        false,
        error.details[0].message,
        null
      );
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

exports.findUser = async (request, response) => {
  try {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseFormatter(response, 400, false, "Invalid Id", null);
    }

    const user = await userModel.findById(id);
    if (!user) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    return responseFormatter(
      response,
      200,
      true,
      "Successfully get user",
      user
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.updateUser = async (request, response) => {
  try {
    const { error } = userUpdateSchema.validate(request.body);
    if (error) {
      return responseFormatter(
        response,
        400,
        false,
        error.details[0].message,
        null
      );
    }

    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseFormatter(response, 400, false, "Invalid Id", null);
    }

    const find = await userModel.findOne({ _id: id });
    if (!find || find === null) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    const data = {
      name: request.body.name,
      email: request.body.email,
      gender: request.body.gender,
    };

    if (request.body.password) {
      data.password = md5(request.body.password);
    }

    const lowercaseName = data.name.toLowerCase();

    let checkUser = await userModel.findOne({
      $and: [
        {
          _id: { $ne: id },
          name: { $regex: new RegExp(`^${lowercaseName}$`, "i") },
        },
      ],
    });

    if (!checkUser || checkUser === null) {
      await userModel.findByIdAndUpdate(id, data);
      const newItem = await userModel.findOne({ _id: id });
      return responseFormatter(
        response,
        200,
        true,
        "Successfully update user",
        newItem
      );
    } else {
      return responseFormatter(
        response,
        400,
        false,
        `User with name ${data.name} already exists, please look for another name`,
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.getUser = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const { name } = request.query;
    const skip = (page - 1) * limit;
    let totalItems;
    let category;

    if (name) {
      const lowercaseName = name.toLowerCase();

      totalItems = await userModel.countDocuments({
        name: { $regex: new RegExp(lowercaseName, "i") },
      });
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No users data",
          null
        );
      }

      users = await userModel
        .find({ name: { $regex: new RegExp(lowercaseName, "i") } })
        .skip(skip)
        .limit(limit);
    } else {
      totalItems = await userModel.countDocuments();
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No users data",
          null
        );
      }

      users = await userModel.find().skip(skip).limit(limit);
    }

    const totalPages = Math.ceil(totalItems / limit);
    if (page > totalPages) {
      return responseFormatter(
        response,
        400,
        false,
        "Page exceed total pages",
        null
      );
    } else {
      const responseData = {
        items: users,
        meta: {
          total_items: totalItems,
          current_page: page,
          total_pages: totalPages,
          per_page: limit,
        },
      };
      return responseFormatter(
        response,
        200,
        true,
        "Successfully get users data",
        responseData
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};