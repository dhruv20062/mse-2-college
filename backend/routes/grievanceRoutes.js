const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/grievances
// @desc    Submit a grievance
router.post('/', authMiddleware, async (req, res) => {
    const { title, description, category } = req.body;

    try {
        const newGrievance = new Grievance({
            title,
            description,
            category,
            student: req.user.id
        });

        const grievance = await newGrievance.save();
        res.json(grievance);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/grievances
// @desc    View all grievances for the logged-in student
router.get('/', authMiddleware, async (req, res) => {
    try {
        const grievances = await Grievance.find({ student: req.user.id }).sort({ date: -1 });
        res.json(grievances);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/grievances/search?title=xyz
// @desc    Search grievances by title
router.get('/search', authMiddleware, async (req, res) => {
    const { title } = req.query;
    try {
        const grievances = await Grievance.find({ 
            student: req.user.id,
            title: { $regex: title, $options: 'i' } 
        });
        res.json(grievances);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/grievances/:id
// @desc    View grievance by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params.id);
        if (!grievance) return res.status(404).json({ message: 'Grievance not found' });
        
        if (grievance.student.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        
        res.json(grievance);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/grievances/:id
// @desc    Update grievance
router.put('/:id', authMiddleware, async (req, res) => {
    const { title, description, category, status } = req.body;

    try {
        let grievance = await Grievance.findById(req.params.id);
        if (!grievance) return res.status(404).json({ message: 'Grievance not found' });

        if (grievance.student.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        grievance = await Grievance.findByIdAndUpdate(
            req.params.id,
            { $set: { title, description, category, status } },
            { new: true }
        );

        res.json(grievance);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/grievances/:id
// @desc    Delete grievance
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params.id);
        if (!grievance) return res.status(404).json({ message: 'Grievance not found' });

        if (grievance.student.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await Grievance.findByIdAndDelete(req.params.id);
        res.json({ message: 'Grievance removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
