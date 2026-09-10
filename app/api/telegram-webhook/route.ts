import { Bot, webhookCallback } from "grammy";
import type { NextRequest } from "next/server";
import { getAppConfig } from "@/lib/config";

export const runtime = "nodejs";

function buildBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN не задан");

  const bot = new Bot(token);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const appName = getAppConfig().name.ru;

  bot.command("start", async (ctx) => {
    if (!appUrl) {
      await ctx.reply("Приложение ещё настраивается, зайдите чуть позже.");
      return;
    }
    await ctx.reply(`Добро пожаловать в ${appName}!`, {
      reply_markup: {
        inline_keyboard: [[{ text: "Открыть", web_app: { url: appUrl } }]],
      },
    });
  });

  return bot;
}

let handler: ((req: Request) => Promise<Response>) | null = null;

function getHandler() {
  if (!handler) {
    handler = webhookCallback(buildBot(), "std/http", {
      secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
    });
  }
  return handler;
}

export async function POST(req: NextRequest) {
  return getHandler()(req);
}
