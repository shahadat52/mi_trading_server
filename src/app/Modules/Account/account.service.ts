import { TAccount } from "./account.interface";
import { AccountModel } from "./account.model";


const createAccountInDB = async (payload: TAccount) => {
    const result = await AccountModel.create(payload)
    return result
}

const getAllBankAccountsFromDB = async () => {
    const result = await AccountModel.find();
    return result
}

export const accountServices = {
    createAccountInDB,
    getAllBankAccountsFromDB
}