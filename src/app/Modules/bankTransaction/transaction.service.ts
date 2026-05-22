import { JwtPayload } from "jsonwebtoken";
import { TTransaction } from "./transaction.interface"
import { BankTxnModel } from "./transaction.model"

const transactionEntryInDB = async (payload: TTransaction, user: JwtPayload) => {

    payload.createdBy = user._id;

    const postingDate = new Date(payload.postingDate);
    postingDate.setHours(0, 0, 0, 0);

    payload.postingDate = postingDate;
    const result = await BankTxnModel.create(payload);
    return result;
};

const getAllTransactionFromDB = async (options: any) => {
    const {
        dateFrom,
        dateTo,
        id,
    } = options;
    const query: any = {};

    //✅ Date range
    if (dateFrom && dateTo) {
        query.date = {
            $gte: new Date(dateFrom),
            $lte: new Date(dateTo),
        };
    }


    const result = await BankTxnModel.find(query)
        .populate([
            { path: 'party' },
            { path: 'createdBy' },
        ])
        .sort({ createdAt: -1 });


    return result
};

const getAllOutstandingTxnFromDB = async () => {
    const query: any = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0); // time remove

    query.postingDate = {
        $gte: today, // date compare only
    };

    const result = await BankTxnModel.find(query)
        .populate([
            { path: 'party' },
            { path: 'createdBy' },
        ])
        .sort({ postingDate: 1 });

    return result;
};

const updateTxnStatusInDB = async (id: any, status: any) => {
    const result = await BankTxnModel.findByIdAndUpdate(id, { status: status.status }, { new: true });
    return result
};


export const transactionServices = {
    transactionEntryInDB,
    getAllTransactionFromDB,
    getAllOutstandingTxnFromDB,
    updateTxnStatusInDB
}