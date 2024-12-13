const path = require("path");
const { responseFormatter } = require("../utils/utils");

exports.getFile = (request, response) => {
  try {
    const { filename } = request.params;

    // ">" for sub folder ex. LOCAL_UPLOAD_FOLDER/user/filename.png
    // the request params is user>filename.png 
    const [subfolder, ...fileParts] = filename.split(">");
    
    const filePath = fileParts.length
      ? path.join(
          path.resolve(__dirname, ".."),
          process.env.LOCAL_UPLOAD_FOLDER,
          subfolder,
          fileParts.join("-")
        )
      : path.join(
          path.resolve(__dirname, ".."),
          process.env.LOCAL_UPLOAD_FOLDER,
          filename
        );

    response.sendFile(filePath, (err) => {
      if (err) {
        return responseFormatter(response, 404, false, "File not found", null);
      }
    });
  } catch (error) {
    return responseFormatter(response, 500, false, error.message, null);
  }
};
