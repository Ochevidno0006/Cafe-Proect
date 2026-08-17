const { z } = require('zod');
const uuid = z.string().uuid();

const reorderSchema = z.object({ orderedIds: z.array(uuid).min(1) });

const createAdvertisementSchema = z.object({
  imageUrl: z.string().url('Укажите корректную ссылку на изображение'),
  position: z.number().int().nonnegative().optional(),
  isEnabled: z.boolean().optional(),
});
const updateAdvertisementSchema = z.object({
  imageUrl: z.string().url().optional(),
  position: z.number().int().nonnegative().optional(),
  isEnabled: z.boolean().optional(),
});

const GALLERY_CATEGORIES = ['interior', 'hall', 'dishes', 'atmosphere'];
const createGallerySchema = z.object({
  imageUrl: z.string().url('Укажите корректную ссылку на изображение'),
  category: z.enum(GALLERY_CATEGORIES).default('interior'),
  position: z.number().int().nonnegative().optional(),
  isEnabled: z.boolean().optional(),
});
const updateGallerySchema = z.object({
  imageUrl: z.string().url().optional(),
  category: z.enum(GALLERY_CATEGORIES).optional(),
  position: z.number().int().nonnegative().optional(),
  isEnabled: z.boolean().optional(),
});

const CONTACT_TYPES = ['phone', 'whatsapp', 'telegram', 'instagram', 'address', 'delivery', 'email', 'other'];
const createContactSchema = z.object({
  type: z.enum(CONTACT_TYPES),
  value: z.string().trim().min(1, 'Укажите значение контакта').max(300),
  position: z.number().int().nonnegative().optional(),
  isEnabled: z.boolean().optional(),
});
const updateContactSchema = z.object({
  type: z.enum(CONTACT_TYPES).optional(),
  value: z.string().trim().min(1).max(300).optional(),
  position: z.number().int().nonnegative().optional(),
  isEnabled: z.boolean().optional(),
});

module.exports = {
  reorderSchema,
  createAdvertisementSchema,
  updateAdvertisementSchema,
  createGallerySchema,
  updateGallerySchema,
  createContactSchema,
  updateContactSchema,
};
