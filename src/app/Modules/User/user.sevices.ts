/* eslint-disable no-unused-vars */
import { TUser } from './user.interface';
import { UserModel } from './user.model';

const createUserInDB = async (user: TUser) => {
  const isExist = await UserModel.findOne({ id: user.id });
  if (isExist) {
    throw new Error('User already exists');
  }
  const result = await UserModel.create(user);
  return result;
};

const updateUserInDB = async (id: string, user: Partial<TUser>) => {
  // console.log(id)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, phone, ...userData } = user;
  const isExist = await UserModel.isUserExists(id);
  if (!isExist) {
    throw new Error('User does not exist');
  }
  const updatedUser = await UserModel.findByIdAndUpdate(id, userData, {
    new: true, // return the updated document
    runValidators: true, // validate before update
  });
  return updatedUser;
};

export const userServices = {
  createUserInDB,
  updateUserInDB,
};
