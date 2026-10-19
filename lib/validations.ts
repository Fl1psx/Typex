import { z } from "zod";
import { appearanceSchema } from "@/lib/appearance";
import { AVATAR_STYLES } from "@/lib/profile";
import { TEXT_CATEGORIES, TEXT_LANGUAGES } from "@/lib/texts";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Имя пользователя должно быть не короче 3 символов")
    .max(24, "Имя пользователя должно быть не длиннее 24 символов")
    .regex(
      /^[\p{L}\p{N}_-]+$/u,
      "Используйте буквы, цифры, дефис или подчёркивание",
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Введите корректный email"),
  password: z
    .string()
    .min(8, "Пароль должен быть не короче 8 символов")
    .max(72, "Пароль должен быть не длиннее 72 символов"),
});

export const createTextSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Название должно быть не короче 3 символов")
    .max(120, "Название должно быть не длиннее 120 символов"),
  content: z
    .string()
    .trim()
    .min(50, "Текст должен быть не короче 50 символов")
    .max(5000, "Текст должен быть не длиннее 5000 символов"),
  language: z.enum(TEXT_LANGUAGES, {
    errorMap: () => ({ message: "Выберите язык текста" }),
  }),
  category: z.enum(TEXT_CATEGORIES, {
    errorMap: () => ({ message: "Выберите категорию" }),
  }),
  isPublic: z.boolean().default(true),
});

export const profileSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(280, "Описание должно быть не длиннее 280 символов"),
  avatarStyle: z.enum(AVATAR_STYLES, {
    errorMap: () => ({ message: "Выберите стиль аватара" }),
  }),
  settings: appearanceSchema,
});

export const resultSchema = z.object({
  textId: z.string().min(1),
  wpm: z.number().finite().min(0).max(400),
  accuracy: z.number().finite().min(0).max(100),
  durationSec: z.number().int().min(1).max(36000),
});
