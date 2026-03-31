
const Group = require('../models/Group');
const User = require('../models/User');

// 1. Create a new group
const createGroup = async (req, res) => {
    try {
        const { name, memberIds } = req.body;
        if (!name) return res.status(400).json({ message: 'Group name is required' });

        // Ensure creator is in the members list
        const members = Array.from(new Set([req.user.id, ...(memberIds || [])]));

        const group = await Group.create({
            name,
            creator: req.user.id,
            members,
            admins: [req.user.id] // Creator is the first admin
        });

        const populatedGroup = await Group.findById(group._id)
            .populate('members admins creator', 'name designation department profilePic');
            
        res.status(201).json(populatedGroup);
    } catch (error) {
        console.error('Create Group Error:', error);
        res.status(500).json({ message: 'Server error creating group' });
    }
};

// 2. Get my groups (where user is a member)
const getMyGroups = async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user.id })
            .populate('members admins creator', 'name designation department profilePic')
            .sort({ createdAt: -1 });
        res.status(200).json(groups);
    } catch (error) {
        console.error('Get My Groups Error:', error);
        res.status(500).json({ message: 'Server error fetching groups' });
    }
};

// 3. Add members (Admins/Creator only)
const addMembersToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { newMemberIds } = req.body;

        if (!newMemberIds || !Array.isArray(newMemberIds)) {
            return res.status(400).json({ message: 'newMemberIds array is required' });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // RULE 1: STRICT ID COMPARISONS
        const userIdStr = req.user.id.toString();
        const creatorIdStr = group.creator.toString();
        const adminIdStrs = group.admins.map(a => a.toString());

        const isCreator = creatorIdStr === userIdStr;
        const isAdmin = adminIdStrs.includes(userIdStr);

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized. You must be an admin or creator.' });
        }

        // RULE 2: DATA HANDLING (addToSet prevents duplicates)
        group.members.addToSet(...newMemberIds);
        await group.save();

        // Repopulate and return
        const updatedGroup = await Group.findById(groupId)
            .populate('members admins creator', 'name designation department profilePic');

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.error('Add Members Error:', error);
        res.status(500).json({ message: 'Server error adding members', error: error.message });
    }
};

// 4. Promote to admin (Admins/Creator only)
const promoteToAdmin = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        if (!userId) return res.status(400).json({ message: 'userId is required' });

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // RULE 1: STRICT ID COMPARISONS
        const userIdStr = req.user.id.toString();
        const creatorIdStr = group.creator.toString();
        const adminIdStrs = group.admins.map(a => a.toString());

        const isCreator = creatorIdStr === userIdStr;
        const isAdmin = adminIdStrs.includes(userIdStr);

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized. You must be an admin or creator.' });
        }

        // RULE 2: DATA HANDLING
        group.admins.addToSet(userId);
        await group.save();

        // Repopulate and return
        const updatedGroup = await Group.findById(groupId)
            .populate('members admins creator', 'name designation department profilePic');

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.error('Promote Admin Error:', error);
        res.status(500).json({ message: 'Server error promoting member', error: error.message });
    }
};

// 5. Delete group (Creator only)
const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // RULE 3: STRICT AUTH (ONLY CREATOR)
        const userIdStr = req.user.id.toString();
        const creatorIdStr = group.creator.toString();

        if (creatorIdStr !== userIdStr) {
            return res.status(403).json({ message: 'Only the creator can delete this group.' });
        }

        await Group.findByIdAndDelete(groupId);
        res.status(200).json({ message: 'Group deleted successfully.' });
    } catch (error) {
        console.error('Delete Group Error:', error);
        res.status(500).json({ message: 'Server error deleting group', error: error.message });
    }
};

module.exports = { createGroup, getMyGroups, addMembersToGroup, promoteToAdmin, deleteGroup };
