/* eslint-disable no-unused-vars */
import { endOfMonth, format, getDaysInMonth, startOfMonth, subMonths } from 'date-fns';
import config from '../../config';
import AppError from '../../errors/appErrors';
import { generateEmployeeId, uniqueId } from '../../utils/uniqueIdGenerator';
import { AttendanceModel } from '../Attendance/attendance.model';
import { createToken } from '../Auth/auth.utils';
import { TxnModel } from '../incomeExpanseTxn/transaction.model';
import { TEmployee } from './employee.interface';
import { EmployeeModel } from './employee.model';
import httpStatus from 'http-status'
import { Types } from 'mongoose';

const createEmployeeInDB = async (user: TEmployee) => {
  const isExist = await EmployeeModel.findOne({ phone: user.phone, isDeleted: true });
  if (isExist) {
    throw new Error('Employee already exists');
  }
  const uid = await generateEmployeeId();
  user.id = uid;
  const result = await EmployeeModel.create(user);
  return result;
};

const getAllEmployeesFromDB = async () => {
  const employees = await EmployeeModel.find({ isDeleted: false, }).sort({ createdAt: -1 });

  return employees;
};

const getSpecificEmployeeInfoFromDB = async (id: string) => {

  const user = await EmployeeModel.findById(id).select('+password');
  if (!user) {
    throw new AppError(httpStatus.FORBIDDEN, 'User not Exists')
  }
  return user;
};



const updateEmployeeDataInDB = async (id: string, user: Partial<TEmployee>) => {
  const { phone, ...employeeData } = user;

  const isExist = await EmployeeModel.findById(id);
  if (!isExist) {
    throw new AppError(404, 'User does not exist');
  }

  delete employeeData.role;
  delete employeeData._id;
  delete employeeData.isDeleted;

  // Whitelist allowed fields (optional but safe)
  const allowedFields = ['name', 'address'];
  Object.keys(employeeData).forEach(key => {
    if (!allowedFields.includes(key)) delete (employeeData as any)[key];
  });

  const updatedEmployee = await EmployeeModel.findByIdAndUpdate(id, employeeData, {
    new: true,
    runValidators: true,
  });

  if (!updatedEmployee) {
    throw new AppError(500, "Failed to update user");
  }

  return updatedEmployee

};

const updateEmployeeRoleInDB = async (id: any, role: any) => {
  const result = await EmployeeModel.findByIdAndUpdate(
    new Types.ObjectId(id),
    { role },
    { new: true }
  );
  return result
}

const updateEmployeeStatusInDB = async (id: any, status: string) => {
  const result = await EmployeeModel.findByIdAndUpdate(
    new Types.ObjectId(id),
    { status },
    { new: true }
  );
  return result
}

const deleteEmployeeFromDB = async (id: any) => {
  return await EmployeeModel.findByIdAndDelete(id);
}


// const monthlyEmployeePayroll = async () => {


//   const now = new Date();

//   const start = startOfMonth(now);
//   const end = endOfMonth(now);

//   const startDate = start.toISOString();
//   const endDate = end.toISOString();

//   const daysInMonth = getDaysInMonth(now);

//   const attendanceSummary = await AttendanceModel.aggregate([
//     {
//       $match: {
//         date: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate),
//         },
//       },
//     },

//     {
//       $group: {
//         _id: "$employee",
//         present: {
//           $sum: {
//             $cond: [{ $eq: ["$status", "present"] }, 1, 0],
//           },
//         },
//         paid_leave: {
//           $sum: {
//             $cond: [{ $eq: ["$status", "half_day"] }, 1, 0],
//           },
//         },
//       },
//     },

//     {
//       $lookup: {
//         from: "employees",
//         localField: "_id",
//         foreignField: "_id",
//         as: "employee",
//       },
//     },

//     { $unwind: "$employee" },

//     {
//       $match: {
//         "employee.status": "active",
//         "employee.isDeleted": false,
//       },
//     },

//     {
//       $project: {
//         employeeId: "$_id",
//         name: "$employee.name",
//         basicSalary: "$employee.basicSalary",
//         present: 1,
//         paid_leave: 1,

//         payableSalary: {
//           $round: [
//             {
//               $add: [
//                 {
//                   $multiply: [
//                     { $divide: ["$employee.basicSalary", daysInMonth] },
//                     "$present",
//                   ],
//                 },
//                 {
//                   $multiply: [
//                     { $divide: ["$employee.basicSalary", daysInMonth] },
//                     "$paid_leave",
//                   ],
//                 },
//               ],
//             },
//             0,
//           ],
//         },
//       },
//     },
//   ]);

//   if (!attendanceSummary.length) return;

//   console.log(attendanceSummary)
//   const transactions = attendanceSummary.map((emp) => ({
//     head: "income",
//     category: emp.name,
//     type: "credit",
//     paymentMethod: "others",
//     amount: emp.payableSalary,
//     date: new Date().toISOString(),
//     note: `Salary for ${start.toLocaleString("default", {
//       month: "long",
//     })}`,
//     createdBy: "692eafd46849534f2a9da7f2"
//   }));

//   const monthKey = `${start.getFullYear()}-${start.getMonth() + 1}`;

//   const existing = await TxnModel.findOne({
//     head: "income",
//     note: new RegExp(monthKey),
//   });

//   if (existing) {
//     console.log("Payroll already generated for this month");
//     return;
//   }
//   const result = await TxnModel.insertMany(transactions);
// };

const monthlyEmployeePayroll = async (createdBy: any) => {
  const now = new Date();

  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const daysInMonth = getDaysInMonth(now);
  const monthName = start.toLocaleString("default", { month: "long" });

  // Prevent duplicate payroll generation
  const existing = await TxnModel.exists({
    head: `${format(subMonths(new Date(), 1), "yyyy-MM")}`,
    note: `Salary for ${monthName}`,
  });

  if (existing) {
    return {
      message: 'Already Salary generate'
    };
  }

  const attendanceSummary = await AttendanceModel.aggregate([
    {
      $match: {
        date: {
          $gte: start,
          $lte: end,
        },
      },
    },

    {
      $group: {
        _id: "$employee",
        present: {
          $sum: {
            $cond: [{ $eq: ["$status", "present"] }, 1, 0],
          },
        },
        paid_leave: {
          $sum: {
            $cond: [{ $eq: ["$status", "half_day"] }, 1, 0],
          },
        },
      },
    },

    {
      $lookup: {
        from: "employees",
        localField: "_id",
        foreignField: "_id",
        as: "employee",
      },
    },

    {
      $unwind: "$employee",
    },

    {
      $match: {
        "employee.status": "active",
        "employee.isDeleted": false,
      },
    },

    {
      $project: {
        _id: 0,
        employeeId: "$_id",
        name: "$employee.name",
        basicSalary: "$employee.basicSalary",

        present: 1,
        paid_leave: 1,

        workingDays: {
          $add: ["$present", "$paid_leave"],
        },

        payableSalary: {
          $let: {
            vars: {
              perDaySalary: {
                $divide: [
                  "$employee.basicSalary",
                  daysInMonth,
                ],
              },
            },
            in: {
              $round: [
                {
                  $multiply: [
                    "$$perDaySalary",
                    {
                      $add: [
                        "$present",
                        "$paid_leave",
                      ],
                    },
                  ],
                },
                0,
              ],
            },
          },
        },
      },
    },
  ]);

  if (!attendanceSummary.length) {
    return;
  }

  const transactions = attendanceSummary
    .filter((emp) => emp.payableSalary > 0)
    .map((emp) => ({
      head: `${format(subMonths(new Date(), 1), "yyyy-MM")}`,
      category: emp.name,
      type: "credit",
      paymentMethod: "others",
      date: new Date(Date.now()),
      amount: emp.payableSalary,
      note: `Salary for ${monthName}`,
      createdBy: createdBy._id,
    }));

  if (!transactions.length) {
    console.log("No payable salary found.");
    return;
  }
  const result = await TxnModel.insertMany(transactions);
  return {
    message: `Salery generated for ${transactions?.length} employees`
  }

};

export const employeeServices = {
  createEmployeeInDB,
  getAllEmployeesFromDB,
  getSpecificEmployeeInfoFromDB,
  updateEmployeeDataInDB,
  updateEmployeeRoleInDB,
  updateEmployeeStatusInDB,
  deleteEmployeeFromDB,
  monthlyEmployeePayroll
};
