const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const { addProductSchema, updateProductSchema } = require("../utils/validationSchema");
const { responseFormatter } = require("../utils/utils");
const upload = require("../utils/upload");
require("dotenv");
const { deleteFile } = require("../utils/deleteFile");
const handleUpload = require("../utils/upload");

exports.addProduct = [
  upload,
  async (req, res) => {
    if (!req.file) {
      return responseFormatter(
        res,
        400,
        false,
        "A file is required for this operation. Please upload a valid file and try again.",
        null
      );
    }
    try {
      const { error } = addProductSchema.validate(req.body);
      if (error) {
        await deleteFile(req.file.location);
        return responseFormatter(
          res,
          400,
          false,
          error.details[0].message,
          null
        );
      }

      const data = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        image: "",
        category_id: req.body.category_id,
      };

      const lowercaseName = data.name.toLowerCase();
      const product = await productModel.findOne({
        name: { $regex: new RegExp(`^${lowercaseName}$`, "i") },
      });

      if (!product) {
        data.image = req.file.location;

        const createdProduct = await productModel.create(data);

        return responseFormatter(
          res,
          201,
          true,
          "Successfully Create product",
          createdProduct
        );
      } else {
        await deleteFile(req.file.location);
        return responseFormatter(
          res,
          400,
          true,
          `Product with name ${data.name} already exists, please look for another name`,
          null
        );
      }
    } catch (error) {
      await deleteFile(req.file.location);
      return responseFormatter(res, 500, false, error.message, null);
    }
  },
];

exports.deleteProduct = async (request, response) => {
  try {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseFormatter(response, 400, false, "Invalid Id", null);
    }
    const product = await productModel.findById(id);

    if (!product) {
      return responseFormatter(
        response,
        404,
        false,
        `Cannot find any data with ID ${id}`,
        null
      );
    }

    const deleteImage = await deleteFile(product.image);

    if (deleteImage) {
      await productModel.findByIdAndDelete(id);
      return responseFormatter(
        response,
        200,
        true,
        "Successfully delete product",
        null
      );
    } else {
      return responseFormatter(
        response,
        400,
        false,
        `Failed delete product image`,
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

//with pagination
exports.getProduct = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const { name } = request.query;
    const skip = (page - 1) * limit;
    let totalItems;
    let product;

    if (name) {
      const lowercaseName = name.toLowerCase();

      totalItems = await productModel.countDocuments({
        name: { $regex: new RegExp(lowercaseName, "i") },
      });
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No products data",
          null
        );
      }

      product = await productModel
        .find({ name: { $regex: new RegExp(lowercaseName, "i") } })
        .skip(skip)
        .limit(limit);
    } else {
      totalItems = await productModel.countDocuments();
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No products data",
          null
        );
      }

      product = await productModel.find().skip(skip).limit(limit);
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
        items: product,
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
        "Successfully get products data",
        responseData
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.updateProduct = [
  handleUpload,
  async (request, response) => {
    try {
      const { error } = updateProductSchema.validate(request.body);
      if (error) {
        if (request.file) {
          await deleteFile(request.file.location);
        }
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

      const find = await productModel.findOne({ _id: id });
      if (!find) {
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
        description: request.body.description,
        price: request.body.price,
        stock: request.body.stock,
        image: "",
        category_id: request.body.category_id,
      };

      const lowercaseName = data.name.toLowerCase();

      // Check for duplicate product name
      let checkProduct = await productModel.findOne({
        $and: [
          {
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${lowercaseName}$`, "i") },
          },
        ],
      });

      if (!checkProduct) {
        if (request.file) {
          // Delete the old file if exists
          if (find.image) {
            await deleteFile(find.image);
          }

          // Save new image
          data.image = request.file.location;
        } else {
          data.image = find.image;
        }

        await productModel.findByIdAndUpdate(id, data);
        const updatedProduct = await productModel.findOne({ _id: id });

        return responseFormatter(
          response,
          200,
          true,
          "Successfully updated product",
          updatedProduct
        );
      } else {
        return responseFormatter(
          response,
          400,
          true,
          `Product with name ${data.name} already exists, please look for another name`,
          null
        );
      }
    } catch (error) {
      if (request.file) {
        await deleteFile(request.file.location);
      }
      return responseFormatter(response, 500, false, error.message, null);
    }
  },
];

exports.findProduct = async (request, response) => {
  try {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseFormatter(response, 400, false, "Invalid Id", null);
    }
    const product = await productModel.findById(id);
    if (!product) {
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
      "Successfully get product",
      product
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

//without pagination
exports.findAll = async (request, response) => {
  try {
    const { name } = request.query;
    let totalItems;
    let product;

    if (name) {
      const lowercaseName = name.toLowerCase();

      totalItems = await productModel.countDocuments({
        name: { $regex: new RegExp(lowercaseName, "i") },
      });
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No products data",
          null
        );
      }

      product = await productModel.find({
        name: { $regex: new RegExp(lowercaseName, "i") },
      });
    } else {
      totalItems = await productModel.countDocuments();
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No products data",
          null
        );
      }

      product = await productModel.find();
    }

    return responseFormatter(
      response,
      200,
      true,
      "Successfully get products data",
      product
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};
