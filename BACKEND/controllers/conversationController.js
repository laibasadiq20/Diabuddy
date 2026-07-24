const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const memberIds = (conversation) =>
  conversation.members.map((m) => (m._id ? m._id.toString() : m.toString()));

const isMember = (conversation, userId) =>
  memberIds(conversation).includes(userId.toString());

const populateConversation = (query) =>
  query
    .populate('members', 'name username profileImageUrl')
    .populate({
      path: 'lastMessage',
      populate: { path: 'senderId', select: 'name username' },
    });

// GET /api/conversations
exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await populateConversation(
      Conversation.find({ members: req.user.id }).sort({ lastMessageAt: -1 })
    );
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversations', error: err.message });
  }
};

// POST /api/conversations
exports.createConversation = async (req, res) => {
  try {
    const { memberIds: bodyMemberIds, isGroup, name } = req.body;

    if (!Array.isArray(bodyMemberIds) || bodyMemberIds.length === 0) {
      return res.status(400).json({ message: 'memberIds is required' });
    }

    const allMembers = Array.from(new Set([req.user.id, ...bodyMemberIds.map(String)]));
    const group = !!isGroup || allMembers.length > 2;

    if (group && !name) {
      return res.status(400).json({ message: 'Group conversations require a name' });
    }

    if (!group) {
      const existing = await Conversation.findOne({
        isGroup: false,
        members: { $all: allMembers, $size: 2 },
      });
      if (existing) {
        const populated = await populateConversation(Conversation.findById(existing._id));
        return res.json(populated);
      }
    }

    const conversation = await Conversation.create({
      isGroup: group,
      name: group ? name : undefined,
      members: allMembers,
      createdBy: group ? req.user.id : undefined,
    });

    const populated = await populateConversation(Conversation.findById(conversation._id));
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create conversation', error: err.message });
  }
};

// GET /api/conversations/:id
exports.getConversationById = async (req, res) => {
  try {
    const conversation = await populateConversation(Conversation.findById(req.params.id));

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!isMember(conversation, req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversation', error: err.message });
  }
};

// PATCH /api/conversations/:id   body: { name }
exports.updateConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!isMember(conversation, req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }
    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'Only group chats can be renamed' });
    }

    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    conversation.name = String(name).trim();
    await conversation.save();

    const populated = await populateConversation(Conversation.findById(conversation._id));
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update conversation', error: err.message });
  }
};

// POST /api/conversations/:id/members   body: { memberIds: [String] }
exports.addMembers = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!isMember(conversation, req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }
    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'Can only add members to group chats' });
    }

    const { memberIds: toAdd } = req.body;
    if (!Array.isArray(toAdd) || toAdd.length === 0) {
      return res.status(400).json({ message: 'memberIds is required' });
    }

    const existing = new Set(memberIds(conversation));
    const uniqueNew = [...new Set(toAdd.map(String))].filter((id) => !existing.has(id));

    if (uniqueNew.length === 0) {
      return res.status(400).json({ message: 'Those users are already in the group' });
    }

    // Validate users exist
    const found = await User.find({ _id: { $in: uniqueNew } }).select('_id');
    if (found.length !== uniqueNew.length) {
      return res.status(400).json({ message: 'One or more users were not found' });
    }

    conversation.members.push(...uniqueNew);
    await conversation.save();

    const populated = await populateConversation(Conversation.findById(conversation._id));
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add members', error: err.message });
  }
};

// DELETE /api/conversations/:id/members/:userId
exports.removeMember = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!isMember(conversation, req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }
    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'Can only remove members from group chats' });
    }

    const targetId = req.params.userId.toString();
    if (!isMember(conversation, targetId)) {
      return res.status(404).json({ message: 'User is not in this group' });
    }

    const isSelf = targetId === req.user.id.toString();
    const creatorId = (conversation.createdBy || conversation.members[0])?.toString();
    const isCreator = creatorId === req.user.id.toString();
    if (!isSelf && !isCreator) {
      return res.status(403).json({
        message: 'Only the group creator can remove other members. Use Leave to exit yourself.',
      });
    }

    conversation.members = conversation.members.filter(
      (m) => m.toString() !== targetId
    );

    if (conversation.members.length === 0) {
      await Message.deleteMany({ conversationId: conversation._id });
      await conversation.deleteOne();
      return res.json({ message: 'Group deleted', deleted: true });
    }

    await conversation.save();
    const populated = await populateConversation(Conversation.findById(conversation._id));
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to remove member', error: err.message });
  }
};

// POST /api/conversations/:id/leave
exports.leaveConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!isMember(conversation, req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this conversation' });
    }
    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'Leave is only for group chats' });
    }

    conversation.members = conversation.members.filter(
      (m) => m.toString() !== req.user.id.toString()
    );

    if (conversation.members.length === 0) {
      await Message.deleteMany({ conversationId: conversation._id });
      await conversation.deleteOne();
      return res.json({ message: 'Left group', deleted: true });
    }

    await conversation.save();
    res.json({ message: 'Left group', deleted: false });
  } catch (err) {
    res.status(400).json({ message: 'Failed to leave group', error: err.message });
  }
};
