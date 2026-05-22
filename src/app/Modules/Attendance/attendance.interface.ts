import { Types } from "mongoose"

export type TAttendance = {
    employee: Types.ObjectId;
    date: Date;
    status: string
}