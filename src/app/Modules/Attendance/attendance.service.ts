import { format } from "date-fns";
import { UserModel } from "../User/user.model";
import { AttendanceModel } from "./attendance.model";
import mongoose from 'mongoose';
import { startOfMonth, endOfMonth } from 'date-fns';


const generateEmployeesAttendance = async () => {
    try {

        const today = format(new Date(), 'yyyy-MM-dd');

        const employees = await UserModel.find({
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
            status: 'present',
        }));

        await AttendanceModel.insertMany(attendancePayload, {
            ordered: false,
        });

        console.log('Attendance generated');

    } catch (error) {
        console.log(error);
    }
};



const getAttendanceByIdFromDb = async ({ id, year, month }: any) => {

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    const [result] = await UserModel.aggregate([
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
                            status: 1
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

const updateEmployeeStatus = async ({ id, status, date: statusDate }: any) => {
    const date = format(new Date(statusDate), 'yyyy-MM-dd');
    const result = await AttendanceModel.findOneAndUpdate(
        { _id: id, date: date },
        { $set: { status: status } },
        {
            upsert: true,
            new: true,
            runValidators: true,

        }
    );

    return result;
};

const updateBasicSalaryInDB = async ({ id, basicSalary }: any) => {
    const result = await UserModel.findOneAndUpdate(
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



export const attendanceServices = {
    generateEmployeesAttendance,
    getAttendanceByIdFromDb,
    updateEmployeeStatus,
    updateBasicSalaryInDB
}