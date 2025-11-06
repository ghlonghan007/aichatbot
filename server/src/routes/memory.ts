import express, { Response } from 'express';
import Memory from '../models/Memory.js';
import { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// 创建记忆
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { userId, type, content, metadata } = req.body;

    if (!userId || !type || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const memory = new Memory({
      userId,
      type,
      content,
      metadata: metadata || {},
    });

    await memory.save();

    res.status(201).json(memory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取用户记忆列表
router.get('/:userId', async (req, res: Response) => {
  try {
    const { type, limit = '50', skip = '0' } = req.query;

    const query: any = { userId: req.params.userId };
    if (type) {
      query.type = type;
    }

    const memories = await Memory.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(skip as string));

    const total = await Memory.countDocuments(query);

    res.json({
      memories,
      total,
      limit: parseInt(limit as string),
      skip: parseInt(skip as string),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 搜索记忆
router.get('/:userId/search', async (req, res: Response) => {
  try {
    const { q, type } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const query: any = {
      userId: req.params.userId,
      content: { $regex: q, $options: 'i' },
    };

    if (type) {
      query.type = type;
    }

    const memories = await Memory.find(query)
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({ memories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 删除记忆
router.delete('/:id', async (req, res: Response) => {
  try {
    const memory = await Memory.findByIdAndDelete(req.params.id);

    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json({ message: 'Memory deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 批量删除记忆
router.post('/batch-delete', async (req, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid ids array' });
    }

    await Memory.deleteMany({ _id: { $in: ids } });

    res.json({ message: `Deleted ${ids.length} memories` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

