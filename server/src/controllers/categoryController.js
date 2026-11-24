import { getAllCategories } from '../models/categoryModel.js';

export const listCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};