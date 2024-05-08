import express from 'express';
import {
  createContact,
  getContacts,
  getOneContact,
  updateContact,
  deleteContact,
} from "../controllers/contactsController.js";

export const contactRouter = express.Router();

contactRouter.route('/')
  .get(getContacts)
  .post(createContact)
  
contactRouter.route('/:contactId')
  .get(getOneContact)
  .put(updateContact)
  .delete(deleteContact)

