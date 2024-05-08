import { Contact, validPhoneNumberRegex } from "../models/contact.js";
import validator from "validator";


export const createContact = async (req, res) => {

  const body = req.body;

  for (const key in body) {
    if (typeof body[key] === "string") {
      body[key] = validator.trim(body[key]);
    }
  }

  const { name, lastName, email, phoneNumber, company } = body;

  const errorResponse = {
    message: 'Incorrect fields validation error',
    errors: []
  };
  
  if (!name) {

    errorResponse.errors.push({
      message: 'Required field missing',
      field: 'name',
    });

  }

  if (!lastName) {

    errorResponse.errors.push({
      message: 'Required field missing',
      field: 'lastName',
    });

  }

  if (email && !validator.isEmail(email)) {

    errorResponse.errors.push({
      message: 'Invalid email',
      field: 'email',
    });

  }

  if (phoneNumber && phoneNumber !== '') {

    if (!validator.isNumeric(phoneNumber, { no_symbols: true }) || phoneNumber.length !== 10) {

      errorResponse.errors.push({
        message: "Invalid phone number: it must be a string of ten digits",
        field: "phoneNumber",
      });

    }
  }

  if (errorResponse.errors.length > 0) {

    return res.status(400).json(errorResponse);

  }

  try {
    
    const contact = await Contact.create({
      name,
      lastName,
      email,
      phoneNumber,
      company,
    });

    return res
      .status(201)
      .json(contact);

  } catch (error) {

    console.log('Error in createContact', error)

    return res
      .status(500)
      .json({
        message: `Could not create contact: ${
          error._message ? error._message : "server error"
        }`,
      });

  }
}


export const getContacts = async (req, res) => {

  let { limit, offset, search_query } = req.query;

  if (
    limit &&
    validator.isNumeric(limit, { no_symbols: true }) &&
    parseInt(limit) >= 0
  ) {
    limit = parseInt(limit);
  } else {
    limit = 10;
  }

  if (
    offset &&
    validator.isNumeric(offset, { no_symbols: true }) &&
    parseInt(offset) >= 0
  ) {
    offset = parseInt(offset);
  } else {
    offset = 0;
  }


  const options = {
    limit,
    skip: offset,
  }

  let filter = {};

  if (search_query) {
    const searchRegex = new RegExp(search_query, 'i');

    filter = {
      $or: [
        { name: searchRegex },
        { lastName: searchRegex },
        { company: searchRegex },
      ],
    };
    
  }

  try {
    
    const results = await Contact.find(filter, {}, options)
      .sort({ lastName: 1 })
      .exec();

    const totalRecords = await Contact.find(filter).count();

    let previousLink = null;

    if (offset - limit >= 0) {
      previousLink = new URL(
        `${req.baseUrl}?limit=${limit}&offset=${offset - limit}${
          search_query ? `&search_query=${search_query}` : ''}`,
        process.env.ORIGIN_URL
      );
    }

    let nextLink = null;

    if (offset + limit < totalRecords) {
      nextLink = new URL(
        `${req.baseUrl}?limit=${limit}&offset=${offset + limit}${
          search_query ? `&search_query=${search_query}` : ''}`,
        process.env.ORIGIN_URL
      );
    }

    return res.status(200).json({
      totalRecords,
      previousLink,
      nextLink,
      results,
    });

  } catch (error) {

    console.log('Error in getContacts():', error)
    
    return res
      .status(500)
      .json({
        message: `Could not get contacts: ${
          error._message ? error._message : "server error"
        }`,
      });

  }

}


export const getOneContact = async (req, res) => {

  const id = req.params.contactId;

  if (!validator.isMongoId(id)) {
    return res.status(400).json({
      message: "Invalid contact identifier",
      errors: [
        {
          message: "Route parameter is not a MongoDB ObjectId",
          parameter: "contactId",
        },
      ],
    });
  }

  try {
    
    const contact = await Contact.findById(id).exec();

    if (contact) {
      return res.status(200).json(contact);
    }

    return res.status(404).json({
      message: "Contact not found",
    })


  } catch (error) {

    console.log('Error in getOneContact()', error);

    return res
      .status(500)
      .json({
        message: `Could not get contact: ${
          error._message ? error._message : "server error"
        }`,
      });
    
  }  

}

export const updateContact = async (req, res) => {

  const id = req.params.contactId;

  if (!validator.isMongoId(id)) {
    return res.status(400).json({
      message: "Invalid contact identifier",
      errors: [
        {
          message: "Route parameter is not a MongoDB ObjectId",
          parameter: "contactId",
        },
      ],
    });
  }
  

  let contact;

  try {
    
    contact = await Contact.findById(id).exec();

  } catch (error) {
    
    console.log('Error in updateContact()', error);

    return res
      .status(500)
      .json({
        message: `Could not update contact: ${
          error._message ? error._message : "server error"
        }`,
      });

  }

  if (!contact) {
    return res.status(404).json({
      message: "Contact not found",
    });
  }

  const body = req.body;

  for (const key in body) {
    if (typeof body[key] === "string") {
      body[key] = validator.trim(body[key]);
    }
  }

  const { name, lastName, email, phoneNumber, company } = body;

  const errorResponse = {
    message: 'Incorrect fields validation error',
    errors: []
  };

  if (name) {
    contact.name = name;
  }

  if (lastName) {
    contact.lastName = lastName;
  }

  if (email) {

    if (validator.isEmail(email)) {

      contact.email = email;

    } else {

      errorResponse.errors.push({
        message: 'Invalid email',
        field: 'email',
      });

    }

  }


  if (phoneNumber) {

    if (validPhoneNumberRegex.test(phoneNumber)) {
      contact.phoneNumber = phoneNumber;
    } else {
      errorResponse.errors.push({
        message: "Invalid phone number: it must be a string of ten digits",
        field: "phoneNumber",
      });
    }

  }

  if (company) {
    contact.company = company;
  }
 

  if (errorResponse.errors.length > 0) {
    return res.status(400).json(errorResponse);
  }

  try {
    
    await contact.save();

  } catch (error) {

    console.log(error);
    
    return res
      .status(500)
      .json({
        message: `Could not update contact: ${
          error._message ? error._message : "server error"
        }`,
      });

  }

  return res.status(200).json(contact);

} // End updateContact()


export const deleteContact = async (req, res) => {

  const id = req.params.contactId;

  if (!validator.isMongoId(id)) {
    return res.status(400).json({
      message: "Invalid contact identifier",
      errors: [
        {
          message: "Route parameter is not a MongoDB ObjectId",
          parameter: "contactId",
        },
      ],
    });
  }

  try {
    
    const contact = await Contact.findById(id).exec();

    if (contact) {
      await contact.deleteOne();
    }

    return res.status(204).json();

  } catch (error) {

    console.log(error);
    
    return res
      .status(500)
      .json({
        message: `Could not delete contact: ${
          error._message ? error._message : "server error"
        }`,
      });
    
  }

} // End deleteContact()
