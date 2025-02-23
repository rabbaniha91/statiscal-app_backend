import { ChatCompletionMessage } from "openai/resources";
import Statiscal_learn from "../models/statiscal_learn";

export const create = async (topic: string, content: ChatCompletionMessage, aiModel: string) => {
  return await Statiscal_learn.create({ topic, content, aiModel });
};

export const getContent = async (topic: string) => {
  return await Statiscal_learn.findOne({ topic });
};
