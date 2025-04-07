import mongoose from "mongoose";

const legoDealSchema = new mongoose.Schema({
  setId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegoSet', required: true },
  source: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discountPercentage: { type: Number, required: true },
  url: { type: String, required: true },
  isAvailable: { type: Boolean, required: true },
  isProfitable: { type: Boolean, required: true },
  profitAmount: { type: Number, required: true },
  lastChecked: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
}, {
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
legoDealSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const LegoDealModel = mongoose.model("LegoDeal", legoDealSchema);

export default LegoDealModel;
