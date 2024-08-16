const path = require('path');
const fs = require('fs');
const s3 = require('./s3_config');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

  async function handleCourseAction(args) {
    var record = args?.data?.view?.courses?.records[0].columns;
    console.log("RECORD IS : ",record);

    if (args.action == 'insert' || args.action == 'update') {
      if (record.intro_video) {
        
        const isURL = record.intro_video.startsWith('http');
  
        if (!isURL) {
          // file name of the image
          var fname = record.intro_video;
          // file path of image
          var fpath = path.join(args.upath, fname);
  
          try {
            // file content type
            const fileContent = fs.readFileSync(fpath);
            const contentType = args?.upload?.view?.courses?.records[0].columns.intro_video.headers["content-type"];
  
            const params = {
              Bucket: "actor-truth",
              Key: `courses/${Date.now()}_${fname}`, // File name you want to save as in S3
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
              file_link = `https://actor-truth.s3.ap-south-1.amazonaws.com/courses/image/${Date.now()}_${fname}`;
            } else if (contentType.startsWith('video/')) {
              file_link = `https://actor-truth.s3.ap-south-1.amazonaws.com/courses/video/${Date.now()}_${fname}`;
            } else if (contentType.endsWith('/pdf')) {
              file_link = `https://actor-truth.s3.ap-south-1.amazonaws.com/courses/pdf/${Date.now()}_${fname}`;
            }
  
            record.intro_video = file_link;
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
module.exports = { handleCourseAction };
