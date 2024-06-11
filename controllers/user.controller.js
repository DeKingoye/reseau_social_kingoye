const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
}

module.exports.userInfo = async (req, res) => {
    console.log(req.params);

    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID inconnu : ' + req.params.id);
    }

    try {
        const user = await UserModel.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).send({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.log('Erreur ID inconnu : ' + err);
        res.status(500).send(err);
    }
}

module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID inconnu : ' + req.params.id);
    }

    try {
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { bio: req.body.bio } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(200).json(updatedUser);
    } catch (err) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur : ', err);
        res.status(500).json({ message: err.message });
    }
}

module.exports.deleteUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID inconnu : ' + req.params.id);
    }
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).send({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.follow = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID inconnu : ' + req.params.id);
    }

    if (!ObjectID.isValid(req.body.idToFollow)) {
        return res.status(400).send('ID inconnu : ' + req.body.idToFollow);
    }

    try {
        // add to the follower list
        const user = await UserModel.findByIdAndUpdate(
            req.params.id, 
            { $addToSet: { following: req.body.idToFollow } },
            { new: true, upsert: true }
        );

        // add to following list
        const followedUser = await UserModel.findByIdAndUpdate(
            req.body.idToFollow,
            { $addToSet: { followers: req.params.id } },
            { new: true, upsert: true }
        );

        res.status(201).json({ user, followedUser });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.unfollow = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send('ID inconnu : ' + req.params.id);
    }

    if (!ObjectID.isValid(req.body.idToUnfollow)) {
        return res.status(400).send('ID inconnu : ' + req.body.idToUnfollow);
    }

    try {
        // remove from the follower list
        const user = await UserModel.findByIdAndUpdate(
            req.params.id, 
            { $pull: { following: req.body.idToUnfollow } },
            { new: true }
        );

        // remove from following list
        const unfollowedUser = await UserModel.findByIdAndUpdate(
            req.body.idToUnfollow,
            { $pull: { followers: req.params.id } },
            { new: true }
        );

        res.status(201).json({ user, unfollowedUser });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
