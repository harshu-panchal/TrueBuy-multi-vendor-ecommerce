import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['credit', 'debit'], required: true },
        description: { type: String, required: true },
        referenceModel: { type: String, enum: ['Order', 'ReturnRequest', 'Refund', 'Deposit', 'Withdrawal'], required: true },
        referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
        balanceAfter: { type: Number, required: true },
    },
    { timestamps: true }
);

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
export { WalletTransaction };
export default WalletTransaction;
