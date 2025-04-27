const express = require('express');
const router = express.Router();

// مثال على مسارات المراجعات
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Get all reviews' });
});

router.post('/', (req, res) => {
    res.status(201).json({ message: 'Create a new review' });
});

router.get('/:id', (req, res) => {
    res.status(200).json({ message: `Get review with ID ${req.params.id}` });
});

router.put('/:id', (req, res) => {
    res.status(200).json({ message: `Update review with ID ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
    res.status(200).json({ message: `Delete review with ID ${req.params.id}` });
});

module.exports = router;