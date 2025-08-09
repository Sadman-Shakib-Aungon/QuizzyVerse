import Notification from '../models/Notification.js';

export const getUserNotifications = async (req, res) => {
    const notifications = await Notification.find({ userId: req.params.userId });
    res.json(notifications);
};