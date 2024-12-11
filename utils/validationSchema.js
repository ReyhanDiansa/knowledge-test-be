// validationSchemas.js
const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  gender: Joi.string().valid("laki-laki", "perempuan").required(),
});

const addCategorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
});

const addProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  stock: Joi.number().required(),
  category_id: Joi.required(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().optional(),
  stock: Joi.number().optional(),
  category_id: Joi.optional(),
});

module.exports = {
  loginSchema,
  registerSchema,
  addCategorySchema,
  addProductSchema,
  updateProductSchema,
};
