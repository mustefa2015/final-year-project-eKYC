import mongoose from "mongoose";
import crypto from "crypto";

const clientSchema = new mongoose.Schema(
  {
    apiKey: {
      type: String,
      unique: true,
      required: true,
      default: () => crypto.randomBytes(32).toString('hex')  
    },
    secretKey: {
      type: String,
      required: true,
      default: () => crypto.randomBytes(32).toString('hex')  
    },
    
    organizationName: {  
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    systemDescription: {
      type: String,
      required: [true, 'System description is required'],
      trim: true
    },
    callbackURL: {
      type: String,
      required: [true, 'Callback URL is required'],
      validate: {
        validator: function(v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    },
    security: {
      hashAlgorithm: {
        type: String,
        default: 'bcrypt'
      },
      saltRounds: {
        type: Number,
        default: 12
      },
      lastPasswordChange: {
        type: Date,
        default: Date.now
      }
    },
    registrationIp: String,
    verified: {
      type: Boolean,
      default: false
    },
    fan : {  // Changed from FAN to fan for consistency
      type: String, 
      required: [true, 'FAN is required'],
      unique: true,
      trim: true
    },
    name: {  // Added for key identification
      type: String,
      required: [true, 'Key name is required'],
      trim: true
    },
    photo: {
      type: String,
      required: [true, 'Client photo is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    
    password: {  
      type: String,
      required:  false, 
    },
    firstName: {  // Changed to camelCase for consistency
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    middleName: {  // Changed to camelCase
      type: String,
      trim: true
    },
    lastName: {  // Changed from SurName to lastName for consistency
      type: String,
      required: [true, 'Last name is required'],
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
    gender: {  // Changed from Sex to gender for modern terminology
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
    isActive: {  // Added for client management
      type: Boolean,
      default: true
    },
    tier: {  // Added for SaaS tier management
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


// Add virtual for API keys (instead of direct reference)
clientSchema.virtual('apiKeys', {
  ref: 'ApiKey',
  localField: '_id',
  foreignField: 'client'
});

// Add index
clientSchema.index({ email: 1 }, { unique: true });
 
const Client = mongoose.model('Client', clientSchema);
export default Client;
