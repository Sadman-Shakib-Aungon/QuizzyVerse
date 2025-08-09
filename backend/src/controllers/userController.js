import User from '../models/User.js';

export const getProfile = async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
};

export const updateProfile = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
};