import type { Node, Edge } from "@xyflow/react";
import type { PipelineNodeData } from "@/lib/types";

export interface PipelineTemplate {
  name: string;
  nodes: Node<PipelineNodeData>[];
  edges: Edge[];
}

export const EXAMPLE_TEMPLATES: PipelineTemplate[] = [
  {
    name: "Text Sentiment",
    nodes: [
      {
        id: "t1",
        type: "trigger",
        position: { x: 100, y: 200 },
        data: {
          label: "Input",
          nodeType: "trigger",
          config: { payload: '{"text": "I love this product!"}' },
        },
      },
      {
        id: "l1",
        type: "llm",
        position: { x: 350, y: 200 },
        data: {
          label: "Sentiment Analysis",
          nodeType: "llm",
          config: {
            system_prompt:
              "You are a sentiment analyzer. Respond with exactly one word: POSITIVE, NEGATIVE, or NEUTRAL.",
            user_prompt: "Analyze the sentiment: {{trigger.text}}",
          },
        },
      },
      {
        id: "w1",
        type: "webhook",
        position: { x: 600, y: 200 },
        data: {
          label: "Output",
          nodeType: "webhook",
          config: { url: "https://httpbin.org/post" },
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "t1", target: "l1" },
      { id: "e2-3", source: "l1", target: "w1" },
    ],
  },
  {
    name: "Weather to Summary",
    nodes: [
      {
        id: "t1",
        type: "trigger",
        position: { x: 50, y: 200 },
        data: {
          label: "Input",
          nodeType: "trigger",
          config: { payload: '{"city": "London"}' },
        },
      },
      {
        id: "h1",
        type: "httpRequest",
        position: { x: 300, y: 200 },
        data: {
          label: "Fetch Weather",
          nodeType: "httpRequest",
          config: {
            method: "GET",
            url: "https://wttr.in/{{trigger.city}}?format=j1",
            headers: "{}",
            body: "",
          },
        },
      },
      {
        id: "l1",
        type: "llm",
        position: { x: 560, y: 200 },
        data: {
          label: "Summarize",
          nodeType: "llm",
          config: {
            system_prompt:
              "You are a weather reporter. Write a friendly 2-sentence weather summary.",
            user_prompt: "Summarize this weather data: {{httpRequest.body}}",
          },
        },
      },
      {
        id: "w1",
        type: "webhook",
        position: { x: 820, y: 200 },
        data: {
          label: "Output",
          nodeType: "webhook",
          config: { url: "https://httpbin.org/post" },
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "t1", target: "h1" },
      { id: "e2-3", source: "h1", target: "l1" },
      { id: "e3-4", source: "l1", target: "w1" },
    ],
  },
];
