import { Agent, Team } from '@google/adk';

// We explicitly use the massive 27B model for maximum accuracy since we are querying an API.
const MODEL_NAME = "gemma-4-27b-it";

/**
 * Agent 1: Syllabus Guide Agent
 * Ensures the concept matches the specific board guidelines.
 */
const syllabusAgent = new Agent({
  name: "Syllabus Guide",
  instructions: "You are the curriculum strictness officer. Verify that the physics or math concepts explained are within standard high school board guidelines. Do not output advanced university-level math.",
  model: MODEL_NAME,
});

/**
 * Agent 2: Concept Deep-Dive Agent
 * Handles the actual math and physics problem solving based on the image.
 */
const conceptAgent = new Agent({
  name: "Concept Solver",
  instructions: "You are an expert physics and math tutor. Break down the user's doubt into simple, logical steps based on the provided video frame.",
  model: MODEL_NAME,
});

/**
 * Agent 3: WebGL Parameter Agent
 * Generates the strict JSON coordinate structure for the frontend UI to render 3D models or 2D arrows.
 */
const parameterAgent = new Agent({
  name: "Parameter Architect",
  instructions: `You calculate coordinates for the frontend overlay.
Output MUST be strict JSON.
Format:
{
  "explanation": "Text explaining the concept.",
  "annotations": [
    {
      "type": "arrow",
      "coordinates": { "x": 0.5, "y": 0.5, "toX": 0.6, "toY": 0.6 },
      "color": "#ef4444",
      "label": "Force"
    }
  ],
  "simulation": {
    "type": "wind-turbine",
    "params": { "windSpeed": 45, "pitch": 10 }
  }
}
Note: x and y MUST be normalized floats between 0.0 and 1.0.`,
  model: MODEL_NAME,
});

/**
 * The Central Mind Orchestrator
 * Routes the image and user query to the subagents and compiles the final payload.
 */
export const centralTutorMind = new Agent({
  name: "Central Tutor Mind",
  instructions: "You are the primary AI Tutor. Receive the student's base64 image frame and text query. Delegate tasks to the Syllabus, Concept, and Parameter agents to compile a highly accurate, JSON-formatted visual response payload.",
  model: MODEL_NAME,
  tools: [syllabusAgent, conceptAgent, parameterAgent],
});
