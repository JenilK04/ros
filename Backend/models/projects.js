import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  ProjectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  DeveloperName: {
    type: String,
    required: [true, 'Developer name is required'],
    trim: true
  },
  ProjectType: {
    type: String,
    enum: ['Apartment', 'Villa', 'Township', 'Commercial','Mixed-Use','Industrial'],
    default: 'Apartment'
  },
  ProjectStatus: {
    type: String,
    enum: ['Under Construction', 'Ready to Move', 'Upcoming'],
    required: [true, 'Project status is required']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zip: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true
    }
  },
  unitConfigurations: [{
    type: {
      type: String,
      required: [true, 'Unit type is required'],
      trim: true
    },
    area: {
      type: String,
      required: [true, 'Unit area is required'],
      min: [0, 'Area cannot be negative']
    },
    minPrice: {
      type: Number,
      required: [true, 'Minimum price is required'],
      min: [0, 'Price cannot be negative']
    },
    maxPrice: {
      type: Number,
      required: [true, 'Maximum price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function(value) {
          return value > this.minPrice;
        },
        message: 'Maximum price must be greater than minimum price'
      }
    }
  }],
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  ProjectArea: {
    type: Number,
    required: [true, 'Area is required'],
    min: [0, 'Area cannot be negative']
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  contactName: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    match: [/^\d{10,15}$/, 'Please enter a valid phone number']
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    trim: true,
    lowercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

projectSchema.index({ userId: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;