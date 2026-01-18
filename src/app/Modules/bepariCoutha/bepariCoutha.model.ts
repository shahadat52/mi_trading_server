import { Schema, model } from 'mongoose';
import { TBepariCoutha } from './bepariCoutha.interface';



const bepariCouthaSchema = new Schema<TBepariCoutha>(
    {

        supplier: {
            type: Schema.Types.ObjectId,
            ref: 'Supplier',
            required: [true, 'Supplier is required'],
        },
        import: { type: String, required: [true, 'আমদানি নাই'] },
        importDate: { type: Date, required: [true, 'আমদানির তারিখ নাই'] },
        lot: { type: String, required: [true, 'লট নাম্বার নাই'] },
        description: { type: String, default: '' },
        invoice: { type: String, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], required: [true, 'ইনভয়েস নাম্বার নাই'], unique: true },
        truck_rent: { type: Number, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], default: 0, required: [true, 'ট্র্যাক ভাড়া নেই'] },
        transport_rent: { type: Number, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], default: 0, required: [true, 'ট্রান্সপোর্ট ভাড়া নেই'] },
        kuli: { type: Number, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], default: 0, required: [true, 'কুলি খরচ নেই'] },
        brokary: { type: Number, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], default: 0, required: [true, 'ব্রোকারি খরচ নেই'] },
        arot: { type: Number, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], default: 0, required: [true, 'আড়ত খরচ নেই'] },
        haolat: { type: Number, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], default: 0, required: [true, 'হাওলাত খরচ নেই'] },
        godi: { type: Number, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], default: 0, required: [true, 'গদি খরচ নেই'] },
        tohori: { type: Number, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], default: 0, required: [true, 'তহরী খরচ নেই'] },
        subTotal: { type: Number, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], default: 0, required: [true, 'Sub total is required'] },
        joma: { type: Number, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], default: 0, required: [true, 'Joma is required'] },
        grandTotal: { type: Number, min: [0, 'নেগেটিভ মান গ্রহনযোগ্য নয়'], default: 0, required: [true, 'Grand total is required'] },
        isPaid: { type: Boolean, default: false },
        paymentMethod: { type: String, default: 'cash' },

    },
    { timestamps: true, versionKey: false }
);
bepariCouthaSchema.index(
    { supplier: 1, lot: 1 },
    { unique: true }
);

/* ✅ Model create */


export const BepariCouthaModel = model<TBepariCoutha>('BepariCoutha', bepariCouthaSchema);
