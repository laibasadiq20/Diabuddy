const Conversation = require('../models/Conversation');

// GET /api/conversations   (mine, sorted by most recent activity)
exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ members: req.user.id })
      .sort({ lastMessageAt: -1 })
      .populate('members', 'name username profileImageUrl isOnline lastSeen')
      .populate('lastMessage');

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversations', error: err.message });
  }
};

// POST /api/conversations   body: { memberIds: [String], isGroup?, name? }
// For a 1:1 chat, reuses an existing conversation between the same two people instead of duplicating.
exports.createConversation = async (req, res) => {
  try {
    const { memberIds, isGroup, name } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'memberIds is required' });
    }

    const allMembers = Array.from(new Set([req.user.id, ...memberIds]));
    const group = !!isGroup || allMembers.length > 2;

    if (group && !name) {
      return res.status(400).json({ message: 'Group conversations require a name' });
    }

    if (!group) {
      // look for an existing 1:1 conversation between exactly these two people
      const existing = await Conversation.findOne({
        isGroup: false,
        members: { $all: allMembers, $size: 2 },
      });
      if (existing) return res.json(existing);
    }

    const conversation = await Conversation.create({
      isGroup: group,
      name: group ? name : undefined,
      members: allMembers,
    });

    res.status(201).json(conversation);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create conversation', error: err.message });
  }
};

// GET /api/conversations/:id
exports.getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('members', 'name username profileImageUrl isOnline lastSeen');

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.members.some((m) => m._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversation', error: err.message });
  }
};