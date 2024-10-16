// backend/models/Comic.js
const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
    title: String,
    episodes: [String], // URLs to episode images
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ComicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    category: String,
    thumbnail: String, // URL to thumbnail image
    chapters: [ChapterSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Comic', ComicSchema);
