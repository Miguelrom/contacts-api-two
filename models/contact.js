import  mongoose  from "mongoose";
import validator from "validator";

// This regex checks the validity of the phoneNumber field. 
// It tests true for empty or 10-digit strings.
export const validPhoneNumberRegex = /^$|^\d{10}$/;

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    validate: {
      validator: (value) => value === '' || validator.isEmail(value),
      message: (props) => `${props.value} is not a valid email`
    }
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [validPhoneNumberRegex, 'Invalid phone number: it must be a string of 10 digits'],
  },
  company: {
    type: String,
    trim: true,
  }
  
});

export const Contact = mongoose.model('Contact', contactSchema);
