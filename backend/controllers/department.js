import { Department } from '../models/department.js';
import { User } from '../models/user.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    const userCounts = await User.aggregate([
      {
        $match: {
          department: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$department",
          memberCount: { $sum: 1 }
        }
      }
    ]);

    const countMap = {};
    userCounts.forEach((entry) => {
      countMap[entry._id] = entry.memberCount;
    });

    const data = departments.map((dept) => ({
      name: dept.name,
      memberCount: countMap[dept.name] || 0,
    }));

    res.status(200).json({ success: true, departments: data });
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch departments' });
  }
};


export const addDepartment = async (req, res) => {
  const { name } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid department name' });
    }

    const existing = await Department.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(200).json({ success: true, department: existing });
    }

    const department = new Department({ name: name.trim() });
    await department.save();
    res.status(201).json({ success: true, department });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding department' });
  }
};
