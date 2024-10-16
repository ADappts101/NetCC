// backend/routes/comics.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const Comic = require('../models/Comic');
const User = require('../models/User');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'netcc_comics',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const parser = multer({ storage: storage });

// Create a new comic
router.post('/', [auth, parser.single('thumbnail')], async (req, res) => {
    const { title, description, category } = req.body;
    const thumbnail = req.file.path;

    try {
        const newComic = new Comic({
            title,
            description,
            category,
            thumbnail,
            author: req.user.id,
        });

        const comic = await newComic.save();
        res.json(comic);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all comics
router.get('/', async (req, res) => {
    try {
        const comics = await Comic.find().populate('author', ['username']);
        res.json(comics);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get a single comic
router.get('/:id', async (req, res) => {
    try {
        const comic = await Comic.findById(req.params.id).populate('author', ['username']);
        if (!comic) return res.status(404).json({ msg: 'Comic not found' });
        res.json(comic);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Comic not found' });
        }
        res.status(500).send('Server error');
    }
});

// Add a chapter to a comic
router.post('/:id/chapters', [auth, parser.array('episodes', 10)], async (req, res) => {
    const { title } = req.body;
    const episodes = req.files.map(file => file.path);

    try {
        const comic = await Comic.findById(req.params.id);
        if (!comic) return res.status(404).json({ msg: 'Comic not found' });

        // Check if the user is the author
        if (comic.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const newChapter = {
            title,
            episodes,
        };

        comic.chapters.push(newChapter);
        await comic.save();
        res.json(comic);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
