import {
  CopilotRuntime,
  LlamaAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const Llama = new Llama({ apiKey: process.env["LLAMA_API_KEY"] });

const copilotKit = new CopilotRuntime();

const serviceAdapter = new LlamaAdapter({
  // @ts-ignore
  groq,
  model: "llama3.2",
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: copilotKit,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
