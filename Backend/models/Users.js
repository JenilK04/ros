import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  country: {type:String, default:'India'},
  password: String,
  role:{type: String, default: 'user'},
  userType:{ type: String, default:"Buyer" },
  companyName: String,
  licenseNumber: String,
  experience: String,
  specialization: [String],
  photo: {
    type: String, // store base64 string here
    contentType: String, // store MIME type (optional but useful)
  }
});

const User = mongoose.model('User', userSchema);

export default User;
