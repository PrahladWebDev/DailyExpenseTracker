// models/Group.js

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const groupSchema = new Schema({
  name: { type: String, required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

const Group = model('Group', groupSchema);

export default Group;
