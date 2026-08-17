const { z } = require('zod');

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s\-()]{6,20}$/, 'Некорректный номер телефона');

const passwordSchema = z
  .string()
  .min(8, 'Пароль должен быть не короче 8 символов')
  .max(200);

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Укажите имя').max(100),
    lastName: z.string().trim().min(1, 'Укажите фамилию').max(100),
    phone: phoneSchema,
    cafeName: z.string().trim().min(1, 'Укажите название кафе').max(150),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Пароли не совпадают',
    path: ['passwordConfirm'],
  });

const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Укажите пароль'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

module.exports = { registerSchema, loginSchema, refreshSchema, phoneSchema, passwordSchema };
