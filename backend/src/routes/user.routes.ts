import express from 'express';
import UserModel, { User } from '../models/User.model';

const router = express.Router();

// 创建新用户
router.post('/', async (req, res) => {
  try {
    const { username, age, grade } = req.body;

    // 验证输入
    if (!username || !age || !grade) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    if (age < 4 || age > 18) {
      return res.status(400).json({ error: '年龄必须在4-18岁之间' });
    }

    if (grade < 1 || grade > 12) {
      return res.status(400).json({ error: '年级必须在1-12之间' });
    }

    // 检查用户名是否已存在
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: '用户名已存在' });
    }

    const userId = await UserModel.create({ username, age, grade });

    res.status(201).json({
      message: '用户创建成功',
      userId,
      user: { id: userId, username, age, grade }
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: '无效的用户ID' });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取所有用户
router.get('/', async (req, res) => {
  try {
    const users = await UserModel.findAll();
    res.json({ users });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
