import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";

// const upload = multer({
//     dest: "./uploads",
//     fileFilter: function (req, file, cb) {
//         if (
//             file.mimetype === "image/png" ||
//             file.mimetype === "image/jpeg" ||
//             file.mimetype === "image/jpg"
//         ) {
//             cb(null, true);
//         } else {
//             cb(new Error("Wrong file type"));
//         }
//     },
//     limits: {
//         fileSize: 10000000, // 10MB
//     },
// });

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      var id =  Date.now() + '-' + file.originalname;
      cb(null, id);
    }
  });
  var upload = multer({ storage: storage }).single('image');

async function uploadFile(req: Request, res: Response) {
    try {
        upload(req, res, function (err) {
            if (err){
              console.log(JSON.stringify(err));
              res.status(400).send('fail saving image');
            } else {
              console.log('The filename is ' + res?.req?.file?.filename);
              res.send(res?.req?.file?.filename);  
            }
        });
    } catch (error) {
        
    }
    
        
}

export { uploadFile };
