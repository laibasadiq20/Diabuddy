const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const assertMember = (conversation, userId) => {
  return conversation.members.some((m) => m.toString() === userId);
};

// GET /api/conversations/:id/messages?page=&limit=
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!assertMember(conversation, req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }

    // newest page first for infinite-scroll-up pagination, then reverse for chronological render
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('senderId', 'name username profileImageUrl');

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

// POST /api/conversations/:id/messages   body: { content }
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!assertMember(conversation, req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user.id,
      content,
      readBy: [req.user.id], // sender has implicitly "read" their own message
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const populated = await message.populate('senderId', 'name username profileImageUrl');

    // NOTE: emit via Socket.io here once real-time is wired up, e.g.
    // io.to(conversation._id.toString()).emit('message:new', populated);

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to send message', error: err.message });
  }
};

// PUT /api/conversations/:id/read
// marks every unread message in the conversation as read by the current user
exports.markAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!assertMember(conversation, req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }

    await Message.updateMany(
      { conversationId: conversation._id, readBy: { $ne: req.user.id } },
      { $push: { readBy: req.user.id } }
    );

    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read', error: err.message });
  }
};