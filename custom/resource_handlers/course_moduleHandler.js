const path = require('path');
const fs = require('fs');
const s3 = require('./s3_config');
const { PutObjectCommand } = require('@aws-sdk/client-s3');


  async function handleCourseModuleAction(args) {
    var record = args?.data?.view?.course_modules?.records[0].columns;
    console.log("RECORD IS : ",record);

    if (args.action == 'insert' || args.action == 'update') {
      if (record.thumbnail) {
        
        const isURL = record.thumbnail.startsWith('http');
  
        if (!isURL) {
          // file name of the image
          var fname = record.thumbnail;
          // file path of image
          var fpath = path.join(args.upath, fname);
  
          try {
            // file content type
            const fileContent = fs.readFileSync(fpath);
            const contentType = args?.upload?.view?.course_modules?.records[0].columns.thumbnail.headers["content-type"];
  
            const params = {
              Bucket: "actor-truth",
              Key: `courses/modules/${Date.now()}_${fname}`, // File name you want to save as in S3
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
              file_link = `https://actor-truth.s3.ap-south-1.amazonaws.com/courses/modules/image/${Date.now()}_${fname}`;
            } else if (contentType.startsWith('video/')) {
              file_link = `https://actor-truth.s3.ap-south-1.amazonaws.com/courses/modules/video/${Date.now()}_${fname}`;
            } else if (contentType.endsWith('/pdf')) {
              file_link = `https://actor-truth.s3.ap-south-1.amazonaws.com/courses/modules/pdf/${Date.now()}_${fname}`;
            }
  
            record.thumbnail = file_link;
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
          console.log("Course link is already a URL, no need to upload.");
        }
      }
    }
  }
module.exports = { handleCourseModuleAction };
