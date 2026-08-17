const { z } = require('zod');
const { ATTR_KEYS, LABEL_KEYS } = require('../repositories/dishRepository');

const uuid = z.string().uuid();

const createDishSchema = z.object({
  categoryId: uuid.nullish(),
  name: z.string().trim().min(1, 'Укажите название блюда').max(150),
  price: z.number().nonnegative().default(0),
  description: z.string().max(2000).nullish(),
  photoUrl: z.string().url().nullish(),
  rating: z.number().int().min(0).max(5).default(0),
  isAvailable: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
  position: z.number().int().nonnegative().optional(),
});

const updateDishSchema = z.object({
  categoryId: uuid.nullish(),
  name: z.string().trim().min(1).max(150).optional(),
  price: z.number().nonnegative().optional(),
  description: z.string().max(2000).nullish(),
  photoUrl: z.string().url().nullish(),
  rating: z.number().int().min(0).max(5).optional(),
  isAvailable: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
  position: z.number().int().nonnegative().optional(),
});

const attributesSchema = z.object({
  attributes: z
    .array(
      z.object({
        key: z.enum(ATTR_KEYS),
        value: z.string().max(1000).nullish(),
        isVisible: z.boolean(),
      })
    )
    .min(1)
    .max(ATTR_KEYS.length),
});

const translationSchema = z.object({
  name: z.string().max(150).nullish(),
  description: z.string().max(2000).nullish(),
});

const labelsSchema = z.object({
  labels: z.array(z.enum(LABEL_KEYS)).max(LABEL_KEYS.length),
});

const reorderSchema = z.object({
  orderedIds: z.array(uuid).min(1),
});

module.exports = {
  createDishSchema,
  updateDishSchema,
  attributesSchema,
  translationSchema,
  labelsSchema,
  reorderSchema,
};
