// models/Wallet.js

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const walletSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, default: 0 },
});

const Wallet = model('Wallet', walletSchema);

export default Wallet;
