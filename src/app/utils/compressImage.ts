import sharp from "sharp";

export const compressImage = async (buffer: Buffer) => {
    const compressedBuffer = await sharp(buffer)
        .resize(1200) // max width
        .jpeg({ quality: 70 }) // quality reduce
        .toBuffer();

    return compressedBuffer;
};