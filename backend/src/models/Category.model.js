import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, trim: true, default: '' },
        image: { type: String },
        icon: { type: String },
        parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        showOnHomePage: { type: Boolean, default: false },
        badgeText: { type: String, trim: true, default: '' },
        badgeStyle: { type: String, enum: ['primary', 'secondary', 'success', 'danger', 'warning'], default: 'primary' },
        externalLink: { type: String, trim: true, default: '' },
    },
    { timestamps: true }
);

categorySchema.index({ parentId: 1, order: 1 });

const Category = mongoose.model('Category', categorySchema);
export { Category };
export default Category;
