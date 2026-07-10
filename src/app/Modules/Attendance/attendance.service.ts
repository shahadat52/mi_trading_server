import { format, getDaysInMonth } from "date-fns";
import { UserModel } from "../User/user.model";
import mongoose from 'mongoose';
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { AttendanceModel } from "./attendance.model";
import { TxnModel } from "../incomeExpanseTxn/transaction.model";
import { EmployeeModel } from "../employee/employee.model";


const generateEmployeesAttendance = async () => {
    try {

        const today = format(new Date(), 'yyyy-MM-dd');

        const employees = await EmployeeModel.find({
            status: 'active',
        });

        const existingCount = await AttendanceModel.countDocuments({ date: today });

        if (existingCount > 0) {
            console.log('Attendence Already generated');
            return;
        }

        const attendancePayload = employees.map((employee) => ({
            employee: employee._id,
            date: today,
            score: 0,
            status: 'present',
        }));

        await AttendanceModel.insertMany(attendancePayload, {
            ordered: false,
        });

        console.log('Attendance generated');

    } catch (error) {
    }
};

const getAttendanceByIdFromDb = async ({ id, year, month }: any) => {

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    const [result]: any = await EmployeeModel.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup: {
                from: 'attendances',
                let: {
                    employee: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$employee', '$$employee']
                            },

                            date: {
                                $gte: startDate,
                                $lte: endDate
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            date: 1,
                            status: 1,
                            score: 1
                        }
                    }
                ],
                as: 'attendances'
            }
        },
        {
            $project: {
                _id: 0,
                employee: '$name',
                basicSalary: 1,
                attendances: 1
            }
        }
    ]);

    return result;
};

const updateEmployeeStatus = async ({ id, status, date: statusDate, score }: any) => {
    const date = format(new Date(statusDate), 'yyyy-MM-dd');
    const result = await AttendanceModel.findOneAndUpdate(
        { _id: id, date: date },
        { $set: { status: status, score: score } },
        {
            upsert: true,
            new: true,
            runValidators: true,

        }
    );

    return result;
};

const updateBasicSalaryInDB = async ({ id, basicSalary }: any) => {
    const result = await EmployeeModel.findOneAndUpdate(
        { _id: id },
        { $set: { basicSalary } },
        {
            upsert: true,
            new: true,
            runValidators: true,

        }
    );

    return result;
};




const monthlyEmployeePayroll = async () => {


    const now = new Date();

    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const startDate = start.toISOString();
    const endDate = end.toISOString();

    const daysInMonth = getDaysInMonth(now);

    const attendanceSummary = await AttendanceModel.aggregate([
        {
            $match: {
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
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

        { $unwind: "$employee" },

        {
            $match: {
                "employee.status": "active",
                "employee.isDeleted": false,
            },
        },

        {
            $project: {
                employeeId: "$_id",
                name: "$employee.name",
                basicSalary: "$employee.basicSalary",
                present: 1,
                paid_leave: 1,

                payableSalary: {
                    $round: [
                        {
                            $add: [
                                {
                                    $multiply: [
                                        { $divide: ["$employee.basicSalary", daysInMonth] },
                                        "$present",
                                    ],
                                },
                                {
                                    $multiply: [
                                        { $divide: ["$employee.basicSalary", daysInMonth] },
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
    ]);

    if (!attendanceSummary.length) return;
    const transactions = attendanceSummary.map((emp) => ({
        head: "income",
        category: emp.name,
        type: "credit",
        paymentMethod: "cash",
        amount: emp.payableSalary,
        date: new Date().toISOString(),
        note: `Salary for ${start.toLocaleString("default", {
            month: "long",
        })}`,
        createdBy: "692eafd46849534f2a9da7f2"
    }));

    const monthKey = `${start.getFullYear()}-${start.getMonth() + 1}`;

    const existing = await TxnModel.findOne({
        head: "income",
        note: new RegExp(monthKey),
    });

    if (existing) {
        console.log("Payroll already generated for this month");
        return;
    }
    const result = await TxnModel.insertMany(transactions);
};


export const attendanceServices = {
    generateEmployeesAttendance,
    getAttendanceByIdFromDb,
    updateEmployeeStatus,
    updateBasicSalaryInDB,
    monthlyEmployeePayroll
}