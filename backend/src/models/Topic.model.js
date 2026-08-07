import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        value: { type: String, default: '', trim: true },
    },
    { _id: false }
);

const topicSchema = new mongoose.Schema(
    {
        systemName: {
            type: String,
            required: [true, 'System name is required'],
            trim: true,
            unique: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        shortTitle: {
            type: String,
            trim: true,
            default: '',
        },
        intro: {
            type: String,
            default: '',
        },
        body: {
            type: String,
            default: '',
        },
        published: {
            type: Boolean,
            default: true,
            index: true,
        },
        priority: {
            type: Number,
            default: 0,
        },
        passwordProtected: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            default: '',
        },
        includeInSitemap: {
            type: Boolean,
            default: true,
        },
        limitedToStores: {
            type: String,
            default: 'All',
        },
        limitedToRoles: {
            type: String,
            default: 'All',
        },
        renderAsHtmlWidget: {
            type: Boolean,
            default: false,
            index: true,
        },
        htmlId: {
            type: String,
            default: '',
        },
        bodyCssClass: {
            type: String,
            default: '',
        },
        widgetZone: {
            type: String,
            default: 'All',
        },
        seoTitleTag: {
            type: String,
            default: '',
        },
        seoMetaDescription: {
            type: String,
            default: '',
        },
        seoMetaKeywords: {
            type: String,
            default: '',
        },
        seoUrlAlias: {
            type: String,
            default: '',
        },
        attributes: [attributeSchema],
    },
    { timestamps: true }
);

const Topic = mongoose.model('Topic', topicSchema);
export { Topic };
export default Topic;
