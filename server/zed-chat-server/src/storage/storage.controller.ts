import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Param,
    UseGuards
  } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserService } from "../users/user.service";
import { storage, limits, fileFilter } from "./storage.config";
import * as fs from "fs"; 
import { extname } from "path";
import { v4 as uuid } from 'uuid';
import JwtRefreshGuard from "../auth/jwt-refresh-guard";

@Controller('storage')
export class StorageController {
    constructor(private userService: UserService){
        
    }
    //MULTER automatically uploads and images from a user to the tmp folder. 
    //So after that's done, this copies it over to a dedicated user folder asynchronously. 
    //It renames the file, and also sets the filename in the user's db column
    private write = (path, data, user, tmpFile) => {
      fs.writeFile(path, 
        data,
        { 
          encoding: "base64"
        },
        (err) => {
          if(err) {
            console.error("Error while writing profile picture for user ", user?.id);
            return;
          }
          console.log("New profile picture file written successfully for user @" + user?.tagName);
          console.log("User's new profile picture filename: " + user?.profilePicture)
          console.log("Now deleting temp file...", tmpFile);
          fs.unlink(tmpFile, (err) => {
            if(err) {
              console.error("Error while deleting temp profile picture for user ", user?.id);
              return;
            }
            console.log("Successfully deleted tmp file");
          })
      });
    }
    
    private deleteOldPic = (userId, oldPicName) => {
      fs.stat(`./profile-pics/${userId}/${oldPicName}`, (err, stats) => {
        if(err) {
          console.error("Old profile picture doesnt exist, not deleting");
          return;
        }
        console.log("Old profile picture exists, now deleting");
        fs.unlink(`./profile-pics/${userId}/${oldPicName}`, (err) => {
          if(err) {
            console.error("Error while deleting old profile picture for user ", userId);
            return;
          }
          console.log("Successfully deleted old profile picture. Now copying new one");
        })
      });
    }

    private newProfilePic = (userId: string, file: any) => {
      fs.readFile(`./tmp/${file.filename}`, 
        { encoding: 'base64' }, 
        async (err, data) => {
          if(err) throw err;
          const ext = extname(`${file.filename}`); 
          const fileName = `profile-pic-${uuid()}${ext}`;
          const fullPath = `./profile-pics/${userId}/${fileName}`;
          const user = await this.userService.findOne(userId);
          const _user = await this.userService.setProfilePic(userId, fileName);  
          if(!fs.existsSync(`./profile-pics/${userId}/`)){
            fs.mkdir(`./profile-pics/${userId}/`, {}, (err) => {
              if(err) throw err; 
              this.write(fullPath, data, _user, `./tmp/${file.filename}`); 
            });
          } else {
            console.log("Checking for old profile picture with name ", user.profilePicture);
            this.deleteOldPic(_user.id, user.profilePicture);
            this.write(fullPath, data, _user, `./tmp/${file.filename}`); 
          }
      });    
    }

    @Post("/:userId/uploadProfilePicture")
    @UseGuards(JwtRefreshGuard)
    @UseInterceptors(
      FileInterceptor(
        "file", // name of the field being passed
        { storage: storage, limits: limits, fileFilter: fileFilter }
      )
    )
    async uploadNew(@UploadedFile() file, @Param('userId') userId) {
        const user = await this.userService.findOne(userId); 
        if(user) {
            console.log("Uploading new profile picture for user @" + user.tagName); 
            this.newProfilePic(user.id, file);   
        } else {
            console.error("Error: cannot upload file for user with ID " + userId)
            throw "Error: User Not Found";
        }
    }
  }