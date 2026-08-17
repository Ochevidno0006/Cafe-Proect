const { z } = require('zod');
const { THEME_PRESETS } = require('../repositories/cafeSettingsRepository');

const hexColor = z.string().regex(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, 'Некорректный HEX-цвет');

const updateCafeSettingsSchema = z.object({
  searchEnabled: z.boolean().optional(),
  favoritesEnabled: z.boolean().optional(),
  shareEnabled: z.boolean().optional(),
  labelsEnabled: z.boolean().optional(),
  status: z.enum(['open', 'closed', 'temporarily_closed']).optional(),
  sectionOrder: z.array(z.string()).min(1).optional(),
});

const updateThemeSchema = z.object({
  preset: z.enum(THEME_PRESETS).optional(),
  primaryColor: hexColor.nullish(),
  buttonColor: hexColor.nullish(),
  backgroundColor: hexColor.nullish(),
  textColor: hexColor.nullish(),
  cardRadius: z.number().int().min(0).max(40).optional(),
  cardStyle: z.enum(['rounded', 'square', 'soft']).optional(),
});

const workingHoursSchema = z.object({
  days: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        mode: z.enum(['workday', 'day_off', '24h']),
        openTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullish(),
        closeTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullish(),
      })
    )
    .min(1)
    .max(7),
});

const languagesSchema = z.object({
  languages: z
    .array(
      z.object({
        code: z.enum(['ru', 'tg', 'en']),
        isEnabled: z.boolean(),
      })
    )
    .min(1)
    .max(3),
});

module.exports = { updateCafeSettingsSchema, updateThemeSchema, workingHoursSchema, languagesSchema };
