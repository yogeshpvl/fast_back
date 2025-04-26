const mongoose = require("mongoose");

// Schema Definition
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    state: {
      type: String,
      required: true,
      default: "karnataka",
    },
    city: {
      type: String,
      required: true,
      default: "bangalore",
    },
    pincode: {
      type: String,
    },
    role: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "active",
    },
    type: {
      type: String,
  
    },
    fastTagPrice: {
      basePrice: {
        type: Number,
        required: true,
        default: 250,
      },
      activationFee: {
        type: Number,
        required: true,
        default: 0,
      },
      paymentGatewayFee: {
        type: Number,
        required: true,
        default: 0,
      },
      platformFee: {
        type: Number,
        required: true,
        default: 0,
      },
      gst: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    wallet: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for total FastTag price
adminSchema.virtual("fastTagPrice.total").get(function () {
  const p = this.fastTagPrice || {};
  return (
    (p.basePrice || 0) +
    (p.activationFee || 0) +
    (p.paymentGatewayFee || 0) +
    (p.platformFee || 0) +
    (p.gst || 0)
  );
});

const AdminModel = mongoose.model("admin", adminSchema);
module.exports = AdminModel;
