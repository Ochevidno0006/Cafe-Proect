const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Укажите название категории').max(100),
  imageUrl: z.string().url().nullish(),
  position: z.number().int().nonnegative().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  imageUrl: z.string().url().nullish(),
  position: z.number().int().nonnegative().optional(),
  isEnabled: z.boolean().optional(),
});

module.exports = { createCategorySchema, updateCategorySchema };
