import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Param,
    UseGuards
  } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserService } from "../providers/user.service";
import { storage, limits, fileFilter } from "../config/storage.config";
import * as fs from "fs"; 
import { extname } from "path";
import { v4 as uuid } from 'uuid';
import JwtRefreshGuard from "../guards/jwt-refresh-guard";

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
            console.error("Error while writing file for user ", user?.id);
            return;
          }
          console.log("New file written successfully for user @" + user?.tagName);
          console.log("Now deleting temp file...", tmpFile);
          fs.unlink(tmpFile, (err) => {
            if(err) {
              console.error("Error while deleting temp file for user ", user?.id);
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

    private newBackgroundPicture = (userId: string, file: any) => {
      fs.readFile(`./tmp/${file.filename}`, 
        { encoding: 'base64' }, 
        async (err, data) => {
          if(err) throw err;
          const ext = extname(`${file.filename}`); 
          const fileName = `background-pic-${uuid()}${ext}`;
          const fullPath = `./background-pics/${userId}/${fileName}`;
          const user = await this.userService.findOne(userId);
          const _user = await this.userService.setBackgroundPic(userId, fileName);  
          if(!fs.existsSync(`./background-pics/${userId}/`)){
            fs.mkdir(`./background-pics/${userId}/`, {}, (err) => {
              if(err) throw err; 
              this.write(fullPath, data, _user, `./tmp/${file.filename}`); 
            });
          } else {
            console.log("Checking for old background picture with name ", user.backgroundPicture);
            this.deleteOldPic(_user.id, user.backgroundPicture);
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
            return `User profile picture upload successful`;
        } else {
            console.error("Error: cannot upload file for user with ID " + userId);
            return `Error: user profile picture upload failed`;
        }
    }

    @Post("/:userId/uploadBackgroundPicture")
    @UseGuards(JwtRefreshGuard)
    @UseInterceptors(
      FileInterceptor(
        "file",
        { storage: storage, limits: limits, fileFilter: fileFilter }
      )
    )
    async uploadBackground(@UploadedFile() file, @Param('userId') userId) {
        const user = await this.userService.findOne(userId); 
        if(user) {
          console.log("Uploading new background picture for user @" + user.tagName);
          this.newBackgroundPicture(user.id, file);
          return `User background picture upload successful`;
        } else {
          console.error("Error: cannot upload new background picture for user with ID " + userId);
          return `Error: user background picture upload failed`;
        }
    }
  }