const ForumPost = require('../models/ForumPost');
const Comment = require('../models/Comment');

/** Hide an author's visible posts and comments (used by ban). */
async function hideAuthorContent(authorId) {
  await Promise.all([
    ForumPost.updateMany({ authorId, status: 'active' }, { status: 'hidden' }),
    Comment.updateMany({ authorId, status: 'active' }, { status: 'hidden' }),
  ]);
}

/** True when the user is under an active temp mute. */
function isMuted(user) {
  return !!(user?.mutedUntil && new Date(user.mutedUntil) > new Date());
}

/**
 * Block write actions for muted users. Returns an Express-ready error payload or null.
 */
function muteBlockPayload(user) {
  if (!isMuted(user)) return null;
  const until = new Date(user.mutedUntil).toLocaleString();
  return {
    statusCode: 403,
    body: {
      message: `You are temporarily muted until ${until}. You can still browse, but cannot post, comment, or send messages.`,
      mutedUntil: user.mutedUntil,
    },
  };
}

module.exports = { hideAuthorContent, isMuted, muteBlockPayload };
