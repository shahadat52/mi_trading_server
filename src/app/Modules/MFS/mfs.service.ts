import mongoose from "mongoose";
import AppError from "../../errors/appErrors";
import { JwtPayload } from "jsonwebtoken";
import { MfsTxnModel } from "./mfs.model";
import httpStatus from "http-status"

const mfsTxnEntryInDB = async (payload: any, user: JwtPayload) => {

    const session = await mongoose.startSession()
    try {
        session.startTransaction()

        if (user) {
            payload.txnBy = user
        }
        //✅ MFS txn entry 
        const txn = await MfsTxnModel.create([payload], { session })
        await session.commitTransaction();
        session.endSession();

        return txn[0];
    } catch (error) {
        console.log(error)
        await session.abortTransaction()
        session.endSession()
        throw new AppError(httpStatus.NOT_ACCEPTABLE, 'ট্রান্সেকসন হয়নি');

    }
};

const getMfsTxnDataFromDB = async (head: any) => {
    const result = await MfsTxnModel.find({ head })

}

export const mfsTxnServices = {
    mfsTxnEntryInDB,
    getMfsTxnDataFromDB
}