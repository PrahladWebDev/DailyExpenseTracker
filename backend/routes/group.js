import express from 'express';
import auth from '../middleware/auth.js';
import Group from '../models/Group.js';
import Wallet from '../models/Wallet.js';
import Expense from '../models/Expense.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ participants: req.user.id });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, participantIds } = req.body;
  try {
    if (!name || !participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ msg: 'Invalid input' });
    }
    const group = new Group({
      name,
      creatorId: req.user.id,
      participants: [...new Set([req.user.id, ...participantIds])], // Ensure unique participants
    });
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/expense', auth, async (req, res) => {
  const { groupId, amount, category, description, contributions } = req.body;
  try {
    if (!groupId || !amount || amount <= 0 || !category || !contributions) {
      return res.status(400).json({ msg: 'Invalid input' });
    }
    const group = await Group.findById(groupId);
    if (!group) return res.status(400).json({ msg: 'Group not found' });
    if (!group.participants.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const totalContributions = Object.values(contributions).reduce(
      (sum, val) => sum + parseFloat(val || 0),
      0
    );
    if (totalContributions !== parseFloat(amount)) {
      return res.status(400).json({ msg: 'Total contributions must equal provided amount' });
    }

    const splitAmount = amount / group.participants.length;

    // Check balances
    for (const userId of group.participants) {
      const contribution = parseFloat(contributions[userId] || 0);
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        return res.status(400).json({ msg: `No wallet found for user ${userId}` });
      }
      const netChange = contribution - splitAmount;
      if (wallet.balance + netChange < 0) {
        return res.status(400).json({ msg: `Insufficient balance for user ${userId}` });
      }
    }

    // Update wallets and create expenses
    for (const userId of group.participants) {
      const contribution = parseFloat(contributions[userId] || 0);
      const wallet = await Wallet.findOne({ userId });
      const netChange = contribution - splitAmount;
      wallet.balance += netChange;
      await wallet.save();
      console.log(`User ${userId}: Contributed ₹${contribution}, Net ₹${netChange}, New balance ₹${wallet.balance}`);
      await new Expense({
        userId,
        amount: splitAmount,
        category,
        description,
        isShared: true,
        groupId,
        contributions,
      }).save();
    }

    res.json({ msg: 'Shared expense added' });
  } catch (error) {
    console.error(`Expense creation error for user ${req.user.id}:`, error);
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;
