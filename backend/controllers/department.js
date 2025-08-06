import { Department } from '../models/department.js';
import { User } from '../models/user.js';
import { Post } from '../models/post.js';
import { sendSuccess, sendError } from '../utils/sendResponse.js';

export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });

        const userCounts = await User.aggregate([
            {
                $match: {
                    department: { $exists: true, $ne: null, $ne: '' },
                },
            },
            {
                $group: {
                    _id: '$department',
                    memberCount: { $sum: 1 },
                },
            },
        ]);

        const countMap = {};
        userCounts.forEach(entry => {
            countMap[entry._id] = entry.memberCount;
        });

        const data = departments.map(dept => ({
            name: dept.name,
            memberCount: countMap[dept.name] || 0,
        }));

        return sendSuccess(res, 200, 'Departments fetched successfully', { departments: data });
    } catch (err) {
        console.error('Error fetching departments:', err);
        return sendError(res, 500, 'Failed to fetch departments', { error: err.message });
    }
};

export const addDepartment = async (req, res) => {
    const { name } = req.body;
    try {
        if (!name || !name.trim()) {
            return sendError(res, 400, 'Invalid department name');
        }

        const existing = await Department.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (existing) {
            return sendSuccess(res, 200, 'Department already exists', { department: existing });
        }

        const department = new Department({ name: name.trim() });
        await department.save();

        return sendSuccess(res, 201, 'Department added successfully', { department });
    } catch (err) {
        return sendError(res, 500, 'Error adding department', { error: err.message });
    }
};

export const getPostsByDepartment = async (req, res) => {
    try {
        const { name } = req.params;

        const usersInDepartment = await User.find({ department: name }).select('_id');
        const userIds = usersInDepartment.map(u => u._id);

        const posts = await Post.find({ user: { $in: userIds } })
            .populate('user', 'userName department avatar')
            .sort({ createdAt: -1 });

        return sendSuccess(res, 200, 'Posts fetched successfully', { posts });
    } catch (err) {
        return sendError(res, 500, 'Failed to fetch posts for department', { error: err.message });
    }
};
