// import { Schema, model } from "mongoose";
// import { TIncome } from "./income.interface";

// const incomeSchema = new Schema<TIncome>(
//     {
//         source: { type: Schema.Types.String, required: true },
//         amount: { type: Number, required: true },
//         description: { type: String },
//         date: { type: Date, default: Date.now },
//         addedBy: { type: Schema.Types.ObjectId, ref: "User" },
//     },
//     { timestamps: true }
// );

// export const Income = model<TIncome>("Income", incomeSchema);
