// Simple Express + MongoDB Backend Example
// File: backend/src/server.ts

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/millionaires-club')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ============= SCHEMAS =============

const MemberSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  joinDate: { type: String },
  accountStatus: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  phone: String,
  address: String,
  beneficiary: String,
  totalContribution: { type: Number, default: 0 },
  activeLoanId: String,
  lastLoanPaidDate: String,
}, { timestamps: true });

const LoanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  borrowerId: { type: String, required: true },
  cosignerId: String,
  originalAmount: { type: Number, required: true },
  remainingBalance: { type: Number, required: true },
  termMonths: { type: Number, required: true },
  status: { type: String, enum: ['ACTIVE', 'PAID', 'DEFAULTED'], default: 'ACTIVE' },
  startDate: String,
  nextPaymentDue: String,
}, { timestamps: true });

const TransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  memberId: { type: String, required: true },
  type: { type: String, enum: ['CONTRIBUTION', 'LOAN_DISBURSAL', 'LOAN_REPAYMENT', 'FEE'] },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  description: String,
  paymentMethod: String,
  receivedBy: String,
}, { timestamps: true });

// Models
const Member = mongoose.model('Member', MemberSchema);
const Loan = mongoose.model('Loan', LoanSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

// ============= ROUTES =============

// MEMBER ROUTES
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error });
  }
});

app.get('/api/members/:id', async (req, res) => {
  try {
    const member = await Member.findOne({ id: req.params.id });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching member', error });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: 'Error creating member', error });
  }
});

app.put('/api/members/:id', async (req, res) => {
  try {
    const member = await Member.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: 'Error updating member', error });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    const member = await Member.findOneAndDelete({ id: req.params.id });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting member', error });
  }
});

// LOAN ROUTES
app.get('/api/loans', async (req, res) => {
  try {
    const loans = await Loan.find();
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loans', error });
  }
});

app.post('/api/loans', async (req, res) => {
  try {
    const loan = new Loan(req.body);
    await loan.save();
    
    // Update member's active loan
    await Member.findOneAndUpdate(
      { id: req.body.borrowerId },
      { activeLoanId: loan.id }
    );
    
    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ message: 'Error creating loan', error });
  }
});

app.post('/api/loans/:id/payment', async (req, res) => {
  try {
    const loan = await Loan.findOne({ id: req.params.id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    
    const { amount } = req.body;
    loan.remainingBalance -= amount;
    
    if (loan.remainingBalance <= 0) {
      loan.status = 'PAID';
      loan.remainingBalance = 0;
      
      // Clear member's active loan
      await Member.findOneAndUpdate(
        { id: loan.borrowerId },
        { activeLoanId: null, lastLoanPaidDate: new Date().toISOString() }
      );
    }
    
    await loan.save();
    
    // Create transaction record
    const transaction = new Transaction({
      id: `TXN-${Date.now()}`,
      memberId: loan.borrowerId,
      type: 'LOAN_REPAYMENT',
      amount,
      date: new Date().toISOString(),
      description: `Loan payment for ${loan.id}`,
    });
    await transaction.save();
    
    res.json(loan);
  } catch (error) {
    res.status(400).json({ message: 'Error processing payment', error });
  }
});

// TRANSACTION ROUTES
app.get('/api/transactions', async (req, res) => {
  try {
    const { startDate, endDate, memberId } = req.query;
    const filter: any = {};
    
    if (memberId) filter.memberId = memberId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }
    
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    
    // Update member's contribution if applicable
    if (transaction.type === 'CONTRIBUTION') {
      await Member.findOneAndUpdate(
        { id: transaction.memberId },
        { $inc: { totalContribution: transaction.amount } }
      );
    }
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: 'Error creating transaction', error });
  }
});

// STATS ROUTES
app.get('/api/stats/dashboard', async (req, res) => {
  try {
    const activeMembers = await Member.countDocuments({ accountStatus: 'Active' });
    const activeLoans = await Loan.countDocuments({ status: 'ACTIVE' });
    
    const totalContributions = await Member.aggregate([
      { $group: { _id: null, total: { $sum: '$totalContribution' } } }
    ]);
    
    const totalDisbursed = await Loan.aggregate([
      { $group: { _id: null, total: { $sum: '$originalAmount' } } }
    ]);
    
    res.json({
      activeMembers,
      activeLoans,
      totalFund: totalContributions[0]?.total || 0,
      totalDisbursed: totalDisbursed[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
