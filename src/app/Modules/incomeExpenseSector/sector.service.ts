import AppError from "../../errors/appErrors";
import { TSector } from "./sector.interface";
import { SectorModel } from "./sector.model";
import httpStatus from "http-status"

const createSectorInDB = async (payload: TSector) => {
    const isExist = await SectorModel.find(payload);
    if (isExist.length >= 1) {
        throw new AppError(httpStatus.ALREADY_REPORTED, 'Already Exist');
    };
    const result = await SectorModel.create(payload);
    return result
};

const getSectorsFromDB = async (head?: any) => {
    const matchStage: any = {};

    if (head !== undefined && head !== null && head !== '') {
        matchStage.head = head;
    }

    const result = await SectorModel.aggregate([
        {
            $match: matchStage
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 0,
                head: 1,
                label: "$category",
                value: "$category"
            }
        }
    ]);

    return result;
};


export const sectorServices = {
    createSectorInDB,
    getSectorsFromDB
}