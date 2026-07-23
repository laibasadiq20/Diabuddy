const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { notify } = require('../utils/notify');

const assertMember = (conversation, userId) => {
  return conversation.members.some((m) => m.toString() === userId.toString());
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
    const { muteBlockPayload } = require('../utils/moderationHelpers');
    const muted = muteBlockPayload(req.user);
    if (muted) return res.status(muted.statusCode).json(muted.body);

    const { content } = req.body;
    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!assertMember(conversation, req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user.id,
      content: String(content).trim(),
      readBy: [req.user.id],
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const populated = await message.populate('senderId', 'name username profileImageUrl');

    const senderName = req.user.name || 'Someone';
    const preview = content.trim().length > 80 ? `${content.trim().slice(0, 80)}…` : content.trim();
    const label = conversation.isGroup
      ? (conversation.name || 'a group')
      : 'you';

    const recipients = conversation.members.filter(
      (m) => m.toString() !== req.user.id.toString()
    );

    await Promise.all(
      recipients.map((recipientId) =>
        notify({
          recipientId,
          senderId: req.user.id,
          type: 'new_message',
          referenceId: conversation._id,
          message: conversation.isGroup
            ? `${senderName} in ${label}: ${preview}`
            : `${senderName}: ${preview}`,
        })
      )
    );

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to send message', error: err.message });
  }
};

// PUT /api/conversations/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!assertMember(conversation, req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }

    await Message.updateMany(
      { conversationId: conversation._id, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );

    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read', error: err.message });
  }
};
