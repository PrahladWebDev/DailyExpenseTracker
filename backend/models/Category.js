// models/Category.js

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const categorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, unique: true },
});

const Category = model('Category', categorySchema);

export default Category;
