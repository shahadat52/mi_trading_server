// import { v2 as cloudinary } from 'cloudinary';
// import multer from 'multer';
// import fs from 'fs';
// cloudinary.config({
//   cloud_name: 'daahwsoyo',
//   api_key: '191141413514713',
//   api_secret: 'tMKFXSv5Wcwb9jGCZyUw7owwljg',
// });

// export const sendImageToCloudinary = (path: string, fileName: string) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(
//       path,
//       { public_id: fileName },
//       function (error, result) {
//         if (error) {
//           reject(error);
//         }
//         resolve(result);
//         fs.unlink(path, (err) => {
//           if (err) {
//             reject(err);
//           } else {
//             console.log('File is deleted.');
//           }
//         });
//       },
//     );
//   });
// };

// //file uploader in local folder from local pc
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, process.cwd() + '/uploads/');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + '-' + uniqueSuffix);
//   },
// });

// export const upload = multer({ storage: storage });
