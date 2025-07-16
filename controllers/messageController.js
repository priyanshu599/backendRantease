const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, propertyId } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
      property: propertyId || null
    });

    res.status(201).json({ message: 'Sent', data: message });
  } catch (err) {
    res.status(500).json({ message: 'Send failed', error: err.message });
  }
};

// In messageController.js
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
    .populate('sender', 'name email') // <-- Add this line
    .populate('receiver', 'name email') // <-- Add this line
    .populate('property', 'title') // <-- Add this line
    .sort({ timestamp: -1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};
