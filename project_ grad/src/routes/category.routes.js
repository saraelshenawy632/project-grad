const express = require('express');
const router = express.Router();

// مثال على مسارات الفئات
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Get all categories' });
});

router.post('/', (req, res) => {
    res.status(201).json({ message: 'Create a new category' });
});

router.get('/:id', (req, res) => {
    res.status(200).json({ message: `Get category with ID ${req.params.id}` });
});

router.put('/:id', (req, res) => {
    res.status(200).json({ message: `Update category with ID ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
    res.status(200).json({ message: `Delete category with ID ${req.params.id}` });
});

module.exports = router;