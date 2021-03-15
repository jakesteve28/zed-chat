/*
    2021 Jacob Stevens 
    A few util functions for uploading files and images. Used by the storage controller. 
    Most the code here is self explanatory. 
    I use multer and local disk storage for the images, and limit how many uploads allowed per user.  
*/

import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuid } from 'uuid';

const maxSize = 10 * 1024 * 1024; //10MB should be enough ;

export const storage = diskStorage({
    destination: "./tmp",
    filename: (req, file, callback) => {
      callback(null, generateFilename(file));
    }
});
  
export const limits = {
  fileSize: maxSize
}

export const fileFilter = (req, file, cb) => {
    if(req?.user?.maxUploadsReached === true) {
      console.log("Error: user cannot upload anymore files")
      cb(null, false); 
      return;
    }
    switch(file?.mimetype){
      case "image/jpeg" : cb(null, true); break;
      case "image/bmp" : cb(null, true);  break;
      case "image/gif" : cb(null, true);  break;
      case "image/png" : cb(null, true);  break;
      case "image/webp" : cb(null, true);  break;
      default: {
        console.log("Error: file uploaded does not have allowabe mimetype ")
        cb(null, false); 
        break;
      }
    }
}

function generateFilename(file: any) {
    return `tmp-file-${uuid()}${extname(file.originalname)}`;
}
  