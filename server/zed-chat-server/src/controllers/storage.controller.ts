/** 
    2021 Jacob Stevens 

    My storage controller. It's for handling conversation, user, and profile picture asset storage. 
    Conversations can have messages that point to a link the conversation's users can request, as verified by their access cookie. 
    They can play sounds files, view images, small videos, all inside the chat room. These assets have a lifespan set by the user, up to 24 hours, before deleted.  
    Users can upload a background image and profile image, (profile image is permenently saveable, always public)
    This controller facilitates uploading, storing, organizing and linking the user's profile/conversations to those assets using HTTP POST requests.
*/

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
    
    /**
     * Deletes a user's profile picture
     * @param userId user's ID as a string
     * @param oldPicName the picture's filename as a string, typically a uuidv4
     */
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

    /**
     * Checks for an existing temporary file. If it can't find it, fails. 
     * If it can find it, generates a new file name with uuidv4 library, copies the file to 
     * /profile-pics/{their userId}/{new_filename}
     * @param userId Their user ID
     * @param file The file
     */
    private newProfilePic = (userId: string, file: any) => {
      try {
          fs.readFile(`./tmp/${file.filename}`, 
          { encoding: 'base64' }, 
          async (err, data) => {
            try {
              if(err) throw err;
              const ext = extname(`${file.filename}`); 
              const fileName = `profile-pic-${uuid()}${ext}`;
              const fullPath = `./profile-pics/${userId}/${fileName}`;
              const user = await this.userService.findOne(userId);
              const _user = await this.userService.setProfilePic(userId, fileName);  
              if(!fs.existsSync(`./profile-pics/${userId}/`)){
                fs.mkdir(`./profile-pics/${userId}/`, {}, (err) => {
                  try {
                    if(err) throw err; 
                    this.write(fullPath, data, _user, `./tmp/${file.filename}`); 
                  } catch(err) {
                    console.error("Error while creating new directory for new profile picture", userId, err); 
                    return -1;
                  }              
                });
              } else {
                console.log("Checking for old profile picture with name ", user.profilePicture);
                this.deleteOldPic(_user.id, user.profilePicture);
                this.write(fullPath, data, _user, `./tmp/${file.filename}`); 
              }
            } catch (err) {
              console.error("Error while checking for temp profile picture", userId, err); 
              return -1;
            }           
        });   
      } catch(err) {
        console.error("Error while uploading a new profile picture for user with ID ", userId, err); 
        return -1;
      }  
    }

     /**
     * Same procedure as above, but for background pictures and the background-pic asset storage directory
     * @param userId Their user ID
     * @param file The file
     */
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

    /**
     * Post to route included with a multipart-formdata body and file in the "file" field, then this method will 
     * store the file as a temp file with Multer middleware, use the methods above to save it permanently and set the
     * new asset's path to the user's profile in the database.
     * @param file The file, which is a buffer (I believe... saved with base64 in private methods above)
     * @param userId The user's ID
     * @returns a string that indicates whether the operation was successful
     */
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

    /**
     * Same procedure as above, but for background images
     * @param file 
     * @param userId 
     * @returns 
     */
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