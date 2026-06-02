import { UserModel } from "../Modules/User/user.model";
import { EmployeeModel } from "../Modules/employee/employee.model";

export const uniqueId = async () => {
  const lastUser = await UserModel.findOne(
    {},
    { id: 1 }
  ).sort({ createdAt: -1 });

  if (!lastUser) {
    return 'USR-0001';
  }

  const lastIdNumber = parseInt(lastUser.id.split('-')[1], 10);
  const newIdNumber = lastIdNumber + 1;

  return `USR-${String(newIdNumber).padStart(4, '0')}`;
};




export const generateEmployeeId = async () => {
  const lastEmployee = await EmployeeModel.findOne(
    {},
    { id: 1 }
  ).sort({ createdAt: -1 });

  if (!lastEmployee) {
    return 'EM-0001';
  }

  const lastIdNumber = parseInt(lastEmployee.id.split('-')[1], 10);
  const newIdNumber = lastIdNumber + 1;

  return `EM-${String(newIdNumber).padStart(4, '0')}`;
};
