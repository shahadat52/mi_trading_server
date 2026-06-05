// import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs';
import config from '../config';
// cloudinary.config({
//   cloud_name: 'daahwsoyo',
//   api_key: '191141413514713',
//   api_secret: 'tMKFXSv5Wcwb9jGCZyUw7owwljg',
// });


export const sendImageToImgbb = (path: string, fileName: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const image = fs.readFileSync(path, { encoding: "base64" });

            const formData = new URLSearchParams();
            formData.append("image", image);
            formData.append("name", fileName);

            const res = await fetch(
                `https://api.imgbb.com/1/upload?key=${config.imgbb_api_key}`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();

            fs.unlink(path, (err) => {
                if (err) {
                    console.error("Delete Error:", err);
                } else {
                    console.log('image uploded')
                }
            });

            resolve(data);
        } catch (err) {
            reject(err);
        }
    });
};

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
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.cwd() + '/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    },
});

export const upload = multer({ storage: storage });
