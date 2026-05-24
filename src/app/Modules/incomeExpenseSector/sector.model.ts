import { Schema, model } from 'mongoose';
import { TSector } from './sector.interface';


const sectorSchema = new Schema<TSector>(
    {
        head: {
            type: String,
            required: [true, 'Head is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,

        },
    },
    {
        timestamps: true
    }
);

sectorSchema.index({ head: 1, category: 1 }, { unique: true })

export const SectorModel = model<TSector>('Sector', sectorSchema);