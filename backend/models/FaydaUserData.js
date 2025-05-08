import mongoose from "mongoose";

const faydaUserDataSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, "Client reference is required"],
      index: true
    },
    apiKeyUsed: {  // Track which API key was used for this request
      type: String,
      required: true
    },
    security: {
      hashAlgorithm: String,
      saltRounds: Number,
      hashedAt: Date
    },
    source: {
      type: String,
      enum: ['API', 'WEB', 'MOBILE'],
      default: 'API'
    },
    name: {  // Added for key identification
      type: String,
      required: [true, 'name is required'],
      trim: true
    },
    fan: {
      type: String,
      required: [true, "FAN is required"], 
      validate: {
        validator: function(v) {
          return /^\d{16}$/.test(v);
        },
        message: props => `${props.value} is not a valid 16-digit FAN!`
      }
    },
    photo: {
      type: String,
      required: [true, "User photo is required"],
      validate: {
        validator: function(v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"]
    },
    password: {  
      type: String, // Store as hashed password
      required:  false, 
    },

    firstName: {  // Changed to camelCase
      type: String,
      trim: true
    },
    middleName: {  // Changed to camelCase
      type: String,
      trim: true
    },
    lastName: {  // Changed from SurName to lastName
      type: String,
      trim: true
    },
    region: {  // Changed from RegionOrCityAdmin
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: String,
      validate: {
        validator: function(v) {
          if (!/^\d{4}[-\/]\d{2}[-\/]\d{2}$/.test(v)) return false;
          const parts = v.split(/[-\/]/);
          const date = new Date(parts[0], parts[1]-1, parts[2]);
          return date && date.getMonth()+1 === parseInt(parts[1]) && date <= new Date();
        },
        message: props => `${props.value} is not a valid date (use YYYY-MM-DD or YYYY/MM/DD format)`
      },
      set: function(v) {
        if (typeof v === 'string') {
          return v.replace(/\//g, '-');
        }
        return v;
      }
    },
    zone: {  // Changed from ZoneOrSubCity
      type: String,
      trim: true
    },
    gender: {  // Changed from Sex to gender
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
      lowercase: true
    },
    woreda: {
      type: String,
      trim: true
    },
    nationality: {
      type: String,
      trim: true
    },
    phoneNumber: {  // Changed to camelCase
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return /^\+?[0-9\s\-\(\)]{7,}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    verificationStatus: {  // Added for tracking verification state
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    metadata: {  // For additional unstructured data
      type: mongoose.Schema.Types.Mixed
    },
    auditLog: [  // Track changes and access
      {
        action: { type: String },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
        timestamp: {
          type: Date,
          default: Date.now
        },
        details: mongoose.Schema.Types.Mixed
      }
    ]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
faydaUserDataSchema.index({ clientId: 1 });
faydaUserDataSchema.index({ "verificationStatus": 1 });
faydaUserDataSchema.index({ createdAt: 1 });


// Define a clean virtual for fullName
faydaUserDataSchema.virtual('fullName').get(function () {
  // Join first, middle (only if exists), and last name
  return [this.firstName, this.middleName, this.lastName]
    .filter(Boolean) // Remove undefined/null/missing middleName
    .join(' ');
});

// Ensure virtuals are included when converting to JSON or Object
faydaUserDataSchema.set('toJSON', { virtuals: true });
faydaUserDataSchema.set('toObject', { virtuals: true });


const FaydaUserData = mongoose.model('FaydaUserData', faydaUserDataSchema);
export default FaydaUserData;
