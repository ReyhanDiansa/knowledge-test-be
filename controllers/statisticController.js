const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const { responseFormatter } = require("../utils/utils");

exports.getCountData = async (request, response) => {
  try {
    const categoryTotal = await categoryModel.countDocuments();
    const productTotal = await productModel.countDocuments();

    const data = {
      total_category: categoryTotal,
      total_product: productTotal,
    };

    return responseFormatter(
      response,
      200,
      true,
      "Successfully get count data",
      data
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};
