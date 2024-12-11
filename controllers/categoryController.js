const categoryModel = require("../models/categoryModel");
const mongoose = require("mongoose");
const { addCategorySchema } = require("../utils/validationSchema");
const { responseFormatter } = require("../utils/utils");

exports.addCategory = async (request, response) => {
  try {
    const { error } = addCategorySchema.validate(request.body);
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
      description: request.body.description,
    };

    const lowercaseName = data.name.toLowerCase();
    const category = await categoryModel.findOne({
      name: { $regex: new RegExp(`^${lowercaseName}$`, "i") },
    });

    if (!category) {
      const createdCategory = await categoryModel.create(data);

      return responseFormatter(
        response,
        201,
        true,
        "Successfully Create Category",
        createdCategory
      );
    } else {
      return responseFormatter(
        response,
        400,
        true,
        `Categroy with name ${data.name} already exists, please look for another name`,
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.deleteCategory = async (request, response) => {
  try {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseFormatter(response, 400, false, "Invalid Id", null);
    }
    const category = await categoryModel.findByIdAndDelete(id);

    if (!category) {
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
      "Successfully delete category",
      null
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

//with pagination
exports.getCategory = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const { name } = request.query;
    const skip = (page - 1) * limit;
    let totalItems;
    let category;

    if (name) {
      const lowercaseName = name.toLowerCase();

      totalItems = await categoryModel.countDocuments({
        name: { $regex: new RegExp(lowercaseName, "i") },
      });
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No categories data",
          null
        );
      }

      category = await categoryModel
        .find({ name: { $regex: new RegExp(lowercaseName, "i") } })
        .skip(skip)
        .limit(pageSize);
    } else {
      totalItems = await categoryModel.countDocuments();
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No categories data",
          null
        );
      }

      category = await categoryModel.find().skip(skip).limit(limit);
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
        items: category,
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
        "Successfully get categories data",
        responseData
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.updateCategory = async (request, response) => {
  try {
    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseFormatter(response, 400, false, "Invalid Id", null);
    }

    const find = await categoryModel.findOne({ _id: id });
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
      description: request.body.description,
    };

    const lowercaseName = data.name.toLowerCase();

    let checkCategory = await categoryModel.findOne({
      $and: [
        {
          _id: { $ne: id },
          name: { $regex: new RegExp(`^${lowercaseName}$`, "i") },
        },
      ],
    });

    if (!checkCategory || checkCategory === null) {
      await categoryModel.findByIdAndUpdate(id, data);
      const newItem = await categoryModel.findOne({ _id: id });
      return responseFormatter(
        response,
        200,
        true,
        "Successfully update category",
        newItem
      );
    } else {
      return responseFormatter(
        response,
        400,
        false,
        `Categroy with name ${data.name} already exists, please look for another name`,
        null
      );
    }
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};

exports.findCategory = async (request, response) => {
  try {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseFormatter(response, 400, false, "Invalid Id", null);
    }

    const category = await categoryModel.findById(id);
    if (!category) {
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
      "Successfully get category",
      category
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
    let category;

    if (name) {
      const lowercaseName = name.toLowerCase();

      totalItems = await categoryModel.countDocuments({
        name: { $regex: new RegExp(lowercaseName, "i") },
      });
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No categories data",
          null
        );
      }

      category = await categoryModel.find({
        name: { $regex: new RegExp(lowercaseName, "i") },
      });
    } else {
      totalItems = await categoryModel.countDocuments();
      if (totalItems === 0) {
        return responseFormatter(
          response,
          404,
          false,
          "No categories data",
          null
        );
      }

      category = await categoryModel.find();
    }

    return responseFormatter(
      response,
      200,
      true,
      "Successfully get categories data",
      category
    );
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};
