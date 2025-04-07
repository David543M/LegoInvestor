import mongoose from "mongoose";
import { LegoSet } from '../../shared/schema';

const legoSetSchema = new mongoose.Schema<LegoSet>({
    setNumber: { type: String, required: true, unique: true },
    name: { type: String, required: false, default: "" },
    theme: { type: String, required: false, default: "Unknown" },
    retailPrice: { type: Number, required: false, default: 0 },
    imageUrl: { type: String, required: false, default: "https://placeholder.com/lego.png" },
    pieceCount: { type: Number, required: false, default: 0 },
    yearReleased: { type: Number, required: false, default: () => new Date().getFullYear() },
    avgRating: { type: Number, required: false, default: 0 },
    numReviews: { type: Number, required: false, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toObject: {
        virtuals: true,
        flattenMaps: true,
        getters: true,
        versionKey: false
    },
    toJSON: {
        virtuals: true,
        flattenMaps: true,
        getters: true,
        versionKey: false
    }
});

// Add a virtual id field that returns the _id as a string
legoSetSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised
legoSetSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

export const LegoSetModel = mongoose.model<LegoSet>("LegoSet", legoSetSchema);