export const idOf = (value) => String(value?._id || value || '');

export const getChatPartner = (conv, myId) => {
  if (conv.isGroup) return null;
  return conv.members.find((m) => idOf(m) !== myId) || null;
};

export const getChatPartnerName = (conv, myId) => {
  if (conv.isGroup) return conv.name || 'Group';
  const otherMember = getChatPartner(conv, myId);
  return otherMember ? otherMember.name : 'Unknown Buddy';
};

/** True when every other member has this message in readBy */
export const isMessageReadByOthers = (msg, conv, myId) => {
  if (!msg?.readBy || !conv?.members) return false;
  const readers = new Set((msg.readBy || []).map(idOf));
  const others = conv.members.map(idOf).filter((id) => id && id !== myId);
  if (others.length === 0) return true;
  return others.every((id) => readers.has(id));
};
