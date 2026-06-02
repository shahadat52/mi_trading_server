import { Schema, model } from "mongoose";
import { TAttendance } from "./attendance.interface";

const attendanceSchema = new Schema<TAttendance>(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: [true, 'Employee Id is Required'],
            index: true
        },
        score: {
            type: Number,
            required: [true, 'Score is required'],
            default: 3,
            max: 3

        },
        date: {
            type: Date,
            required: [true, 'Date is required']
        },
        status: {
            type: String,
            enum: {
                values: ["present", "absent", "paid_leave", "unpaid_leave", "half_day"],
                message: '{VALUE} ইজ নট এ ভ্যালিড স্ট্যাটাস'
            },
            default: "present",
            trim: true,
            required: true
        }
    },
    { timestamps: false, versionKey: false }
);

attendanceSchema.index(
    { employee: 1, date: 1 },
    { unique: true }
);

export const AttendanceModel = model<TAttendance>("Attendance", attendanceSchema);
