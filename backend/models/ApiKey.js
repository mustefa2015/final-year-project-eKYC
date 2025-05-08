import mongoose from 'mongoose'; 

const ApiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'API key is required'],
    unique: true,
    index: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required']
  }, 
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  expiresAt: {  // Added for key expiration
    type: Date,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },
  lastUsed: {
    type: Date
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  rateLimit: {
    type: Number,
    default: 100,
    min: 1
  },
  permissions: {  // Added for fine-grained access control
    sendOtp: { type: Boolean, default: true },
    verifyOtp: { type: Boolean, default: true },
    userInfo: { type: Boolean, default: true }
  }, 
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ApiKeySchema.index({ client: 1 });
ApiKeySchema.index({ key: 1 }, { unique: true });
ApiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


ApiKeySchema.virtual('clientDetails', {
  ref: 'Client',
  localField: 'client',
  foreignField: '_id',
  justOne: true
});

// Virtual for checking if key is expired
ApiKeySchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

const ApiKey = mongoose.model('ApiKey', ApiKeySchema);
export default ApiKey;