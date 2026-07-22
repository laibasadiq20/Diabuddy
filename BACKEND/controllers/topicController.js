const Topic = require('../models/Topic');

// GET /api/topics
exports.getTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ postsCount: -1 });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch topics', error: err.message });
  }
};

// GET /api/topics/:id
exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch topic', error: err.message });
  }
};

// POST /api/topics  (admin only)
exports.createTopic = async (req, res) => {
  try {
    const { name, slug, description, icon, color } = req.body;
    const topic = await Topic.create({ name, slug, description, icon, color });
    res.status(201).json(topic);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Topic name or slug already exists' });
    }
    res.status(400).json({ message: 'Failed to create topic', error: err.message });
  }
};

// PUT /api/topics/:id  (admin only)
exports.updateTopic = async (req, res) => {
  try {
    const allowed = ['name', 'slug', 'description', 'icon', 'color'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const topic = await Topic.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.json(topic);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Topic name or slug already exists' });
    }
    res.status(400).json({ message: 'Failed to update topic', error: err.message });
  }
};

// DELETE /api/topics/:id  (admin only)
exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    if ((topic.postsCount || 0) > 0) {
      return res.status(400).json({
        message: 'Cannot delete a topic that still has posts. Move or remove posts first.',
      });
    }
    await topic.deleteOne();
    res.json({ message: 'Topic deleted', id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete topic', error: err.message });
  }
};
