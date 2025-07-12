const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  const { receiver, content, property } = req.body;

  if (!receiver || !content || !property) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const message = await Message.create({
      sender: req.user.id,
      receiver,
      content,
      property
    });

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .populate('property', 'title location');

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
};
