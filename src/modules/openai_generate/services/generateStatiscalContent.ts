import OpenAI from "openai";
import { envs } from "../../../config/env";
const openai = new OpenAI({
  apiKey: "xai-zShiWqSuTl15Ohv2sd7mOiTkhgGhwEOyZT11C5Av9vQged6InGDB9UXAJxnfqRyihlMvMNmdWq5eO5ii",
  baseURL: "https://api.x.ai/v1",
});

export const generateContentInFarsi = async (topic: string, model: string) => {
  return await openai.chat.completions.create({
    model: "grok-2-latest",
    messages: [
      {
        role: "system",
        content:
          "شما یک متخصص آمار هستید که محتوای آموزشی برای یک وب‌سایت تولید می‌کنید. لطفاً توضیحات علمی، مثال‌های عددی و کاربردهای عملی ارائه دهید.",
      },
      {
        role: "user",
        content: `یک مقاله جامع در مورد "${topic}" تولید کن که در قالب Markdown باشد. مقاله باید شامل موارد زیر باشد:
            
- یک عنوان اصلی با علامت #  
- چند زیرعنوان با علامت ## و ###  
- چندین پاراگراف توضیحی  
- مثال‌های عددی و کاربردهای عملی  
- در صورت نیاز، فهرست‌های شماره‌دار یا غیرشماره‌دار  

خروجی باید کاملاً استاندارد باشد تا بدون تغییرات اضافی مستقیماً به HTML تبدیل شود.`,
      },
    ],
    store: true,
  });
};

export const generateContentInEnglish = async (topic: string, model: string) => {
  return await openai.chat.completions.create({
    model: "grok-2-latest",
    messages: [
      {
        role: "system",
        content:
          "You are a statistician producing educational content for a website. Please provide scientific explanations, numerical examples, and practical applications.",
      },
      {
        role: "user",
        content: `Produce a comprehensive article on "${topic}" in Markdown format. The article should include the following:

- A main heading marked with #
- Several subheadings marked with ## and ###
- Several explanatory paragraphs
- Numerical examples and practical applications
- Numbered or unnumbered lists, if needed

The output should be fully standardized so that it can be converted directly to HTML without additional changes.`,
      },
    ],
    store: true,
  });
};
