import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const server = new Server(
  { name: 'gemini-image', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'gemini_generate_image',
      description:
        'Generate an image from a text prompt using Google Gemini. Returns a PNG saved to the specified path.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          prompt: {
            type: 'string',
            description:
              'Detailed text prompt describing the image to generate. Be specific about style, colors, size, etc.',
          },
          outputPath: {
            type: 'string',
            description: 'Absolute file path where the generated PNG will be saved.',
          },
        },
        required: ['prompt', 'outputPath'],
      },
    },
    {
      name: 'gemini_edit_image',
      description:
        'Edit an existing image using Google Gemini with text instructions. Sends the image + instructions and saves the result.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          imagePath: {
            type: 'string',
            description: 'Absolute path to the input image file (PNG, JPG, WebP).',
          },
          instructions: {
            type: 'string',
            description:
              'Text instructions describing how to modify the image. E.g. "Change the weapon color to blue" or "Add a glow effect".',
          },
          outputPath: {
            type: 'string',
            description:
              'Absolute file path where the edited image will be saved. Can be the same as imagePath to overwrite.',
          },
        },
        required: ['imagePath', 'instructions', 'outputPath'],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'gemini_generate_image') {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        // @ts-ignore - responseModalities is valid but not in older type defs
        generationConfig: { responseModalities: ['Text', 'Image'] },
      });

      const result = await model.generateContent(args!.prompt as string);
      const response = result.response;

      if (!response.candidates || response.candidates.length === 0) {
        return {
          content: [{ type: 'text' as const, text: 'Gemini returned no candidates.' }],
        };
      }

      const parts = response.candidates[0].content.parts;
      let savedPath = '';
      let textResponse = '';

      for (const part of parts) {
        if (part.inlineData) {
          const imageData = Buffer.from(part.inlineData.data!, 'base64');
          const outPath = args!.outputPath as string;
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, imageData);
          savedPath = outPath;
        }
        if (part.text) {
          textResponse += part.text;
        }
      }

      if (savedPath) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Image generated and saved to: ${savedPath}\n${textResponse}`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: `No image was generated. Gemini response: ${textResponse || 'empty'}`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          { type: 'text' as const, text: `Error generating image: ${err.message}` },
        ],
      };
    }
  }

  if (name === 'gemini_edit_image') {
    try {
      const imagePath = args!.imagePath as string;
      const instructions = args!.instructions as string;
      const outputPath = args!.outputPath as string;

      if (!fs.existsSync(imagePath)) {
        return {
          content: [{ type: 'text' as const, text: `Input image not found: ${imagePath}` }],
        };
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const ext = path.extname(imagePath).toLowerCase();
      const mimeType =
        ext === '.png'
          ? 'image/png'
          : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : ext === '.webp'
              ? 'image/webp'
              : 'image/png';

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        // @ts-ignore
        generationConfig: { responseModalities: ['Text', 'Image'] },
      });

      const result = await model.generateContent([
        { inlineData: { mimeType, data: base64Image } },
        instructions,
      ]);

      const response = result.response;
      if (!response.candidates || response.candidates.length === 0) {
        return {
          content: [{ type: 'text' as const, text: 'Gemini returned no candidates.' }],
        };
      }

      const parts = response.candidates[0].content.parts;
      let savedPath = '';
      let textResponse = '';

      for (const part of parts) {
        if (part.inlineData) {
          const imageData = Buffer.from(part.inlineData.data!, 'base64');
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, imageData);
          savedPath = outputPath;
        }
        if (part.text) {
          textResponse += part.text;
        }
      }

      if (savedPath) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Image edited and saved to: ${savedPath}\n${textResponse}`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: `No edited image returned. Gemini response: ${textResponse || 'empty'}`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          { type: 'text' as const, text: `Error editing image: ${err.message}` },
        ],
      };
    }
  }

  return {
    content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Failed to start Gemini MCP server:', err);
  process.exit(1);
});
