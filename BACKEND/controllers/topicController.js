const Topic = require('../models/Topic');
const ForumPost = require('../models/ForumPost');

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

/**
 * Move all posts from one topic to another, then recount postsCount on both.
 * POST /api/topics/:id/move-posts  body: { toTopicId }
 */
exports.movePosts = async (req, res) => {
  try {
    const fromId = req.params.id;
    const { toTopicId } = req.body;
    if (!toTopicId) {
      return res.status(400).json({ message: 'toTopicId is required' });
    }
    if (String(fromId) === String(toTopicId)) {
      return res.status(400).json({ message: 'Source and destination topics must differ' });
    }

    const [fromTopic, toTopic] = await Promise.all([
      Topic.findById(fromId),
      Topic.findById(toTopicId),
    ]);
    if (!fromTopic) return res.status(404).json({ message: 'Source topic not found' });
    if (!toTopic) return res.status(404).json({ message: 'Destination topic not found' });

    const result = await ForumPost.updateMany(
      { topicId: fromId, status: { $ne: 'deleted' } },
      { topicId: toTopicId }
    );

    const [fromCount, toCount] = await Promise.all([
      ForumPost.countDocuments({ topicId: fromId, status: { $ne: 'deleted' }, isDraft: { $ne: true } }),
      ForumPost.countDocuments({ topicId: toTopicId, status: { $ne: 'deleted' }, isDraft: { $ne: true } }),
    ]);

    fromTopic.postsCount = fromCount;
    toTopic.postsCount = toCount;
    await Promise.all([fromTopic.save(), toTopic.save()]);

    res.json({
      message: `Moved ${result.modifiedCount || 0} posts to “${toTopic.name}”`,
      moved: result.modifiedCount || 0,
      fromTopic,
      toTopic,
    });
  } catch (err) {
    res.status(400).json({ message: 'Failed to move posts', error: err.message });
  }
};
