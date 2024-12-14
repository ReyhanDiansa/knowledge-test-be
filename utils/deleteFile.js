const { del } = require("@vercel/blob");
const fs = require("fs");
const path = require("path");

const deleteFile = async (url) => {
  try {
    if (process.env.APP_ENV === "local") {
      const filename = url.split(
        `http://localhost:${process.env.PORT}/api/v1/file/`
      );
      
      if(filename[1]){
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
        }
      }
      return true;  
    } else {
      await del(url);
      return true;
    }
  } catch (error) {    
    return false;
  }
};

module.exports = { deleteFile };
