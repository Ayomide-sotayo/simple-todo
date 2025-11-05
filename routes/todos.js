// routes/todos.js
const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const protect = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// @route   GET /api/todos
// @desc    Get all todos for logged in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/todos
// @desc    Create new todo
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    const todo = await Todo.create({
      title,
      description,
      user: req.user.id  // Associate todo with logged in user
    });

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/todos/:id
// @desc    Get single todo
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // Check if todo belongs to user
    if (todo.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this todo'
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/todos/:id
// @desc    Update todo
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // Check ownership
    if (todo.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this todo'
      });
    }

    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @route   DELETE /api/todos/:id
// @desc    Delete todo
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // Check ownership
    if (todo.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this todo'
      });
    }

    await todo.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
