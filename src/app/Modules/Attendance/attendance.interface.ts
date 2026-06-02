import { Types } from "mongoose"

export type TAttendance = {
    employee: Types.ObjectId;
    date: Date;
    score: number
    status: string
}