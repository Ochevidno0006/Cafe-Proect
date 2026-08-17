const { z } = require('zod');

const uuid = z.string().uuid();

const createMenuBlockSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название блока').max(100),
  position: z.number().int().nonnegative().optional(),
  isEnabled: z.boolean().optional(),
});

const updateMenuBlockSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  position: z.number().int().nonnegative().optional(),
  isEnabled: z.boolean().optional(),
});

const setBlockDishesSchema = z.object({
  dishIds: z.array(uuid),
});

const reorderSchema = z.object({
  orderedIds: z.array(uuid).min(1),
});

module.exports = { createMenuBlockSchema, updateMenuBlockSchema, setBlockDishesSchema, reorderSchema };
