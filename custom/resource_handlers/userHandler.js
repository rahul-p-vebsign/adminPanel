const path = require('path');
const fs = require('fs');
const s3 = require('./s3_config');
const { PutObjectCommand } = require('@aws-sdk/client-s3');


  async function handleUserAction(args) {
    var record = args?.data?.view?.users?.records[0].columns;
  
    if (args.action == 'insert' || args.action == 'update') {
      if (record.profile_image) {
        // Check if the profile_image is a URL or a local file path
        const isURL = record.profile_image.startsWith('http');
  
        if (!isURL) {
          // file name of the image
          var fname = record.profile_image;
          // file path of image
          var fpath = path.join(args.upath, fname);
  
          try {
            // file content type
            const fileContent = fs.readFileSync(fpath);
            const contentType = args?.upload?.view?.users?.records[0].columns.profile_image.headers["content-type"];
  
            const params = {
              Bucket: "actor-truth",
              Key: `user_profile/${Date.now()}_${fname}`, // File name you want to save as in S3
              Body: fileContent,
              ContentDisposition: "inline",
              ContentType: contentType,
              ACL: "public-read"
            };
  
            // Upload to S3
            const command = new PutObjectCommand(params);
            const data = await s3.send(command);
            console.log("data is : ", data);
  
            let file_link = "";
            if (contentType.startsWith('image/')) {
              file_link = `https://actor-truth.s3.ap-south-1.amazonaws.com/user_profile/image/${Date.now()}_${fname}`;
            } else if (contentType.startsWith('video/')) {
              file_link = `https://actor-truth.s3.ap-south-1.amazonaws.com/user_profile/video/${Date.now()}_${fname}`;
            } else if (contentType.endsWith('/pdf')) {
              file_link = `https://actor-truth.s3.ap-south-1.amazonaws.com/user_profile/pdf/${Date.now()}_${fname}`;
            }
  
            record.profile_image = file_link;
            console.log("fpath is : ", fpath);
            if (fpath) {
              fs.unlink(fpath, (err) => {
                if (err) {
                  console.log("err is : ", err);
                } else {
                  console.log("File deleted successfully.");
                }
              });
            }
          } catch (error) {
            console.error("Error reading file or uploading to S3: ", error);
          }
        } else {
          console.log("Profile image is already a URL, no need to upload.");
        }
      }
    }
  }
module.exports = { handleUserAction };
