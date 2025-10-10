import { TUser } from "./user.interface";
import { UserModel } from "./user.model";

const createUserInDB = async (user: TUser) => {
    // console.log(user);
    // user.password = password;

    const result = await UserModel.create(user);
    return result;

};

export const userServices = {
    createUserInDB
}