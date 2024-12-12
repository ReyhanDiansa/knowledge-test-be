const { del } = require("@vercel/blob");
const fs = require("fs");
const path = require("path");

const deleteFile = async (url) => {
  try {
    if (process.env.APP_ENV === "local") {
      const filename = url.split(
        `http://localhost:${process.env.PORT}/${process.env.LOCAL_UPLOAD_FOLDER}/`
      );

      const filePath = path.join(
        path.resolve(__dirname, ".."),
        process.env.LOCAL_UPLOAD_FOLDER,
        filename[1]
      );

      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            return false;
          }
        });
        return true;
      } else {
        return false;
      }
    } else {
      await del(url);
      return true;
    }
  } catch (error) {
    return false;
  }
};

module.exports = { deleteFile };
