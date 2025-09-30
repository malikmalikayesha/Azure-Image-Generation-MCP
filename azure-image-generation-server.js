#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

class AzureImageGenerationMCPServer {
    constructor() {
        this.server = new Server({
            name: 'Image Generation',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });

        // Azure configuration
        this.azureApiKey = process.env.AZURE_IMAGE_API_KEY;
        this.azureBaseUrl = process.env.AZURE_IMAGE_BASE_URL || 'https://ajaiafoundry.cognitiveservices.azure.com/openai/deployments';

        if (!this.azureApiKey || !this.azureBaseUrl) {
            throw new Error('AZURE_IMAGE_API_KEY and AZURE_IMAGE_BASE_URL environment variables are required');
        }

        this.setupToolHandlers();
    }

    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'generate_image',
                    description: '🎨 Create stunning AI-generated images using Azure DALL-E 3 or FLUX models with intelligent model selection',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            prompt: {
                                type: 'string',
                                description: 'Describe the image you want to create in natural language. Be detailed for best results. Examples: "A serene mountain landscape at sunset", "Modern minimalist logo design", "Cute cartoon mascot for a coffee shop"'
                            },
                            model: {
                                type: 'string',
                                description: 'Choose AI model: "dall-e-3" (photorealistic, artistic), "flux" (creative, flexible), or "auto" (smart selection based on prompt)',
                                enum: ['dall-e-3', 'flux', 'auto'],
                                default: 'auto'
                            },
                            size: {
                                type: 'string',
                                description: 'Image dimensions: Square (1024x1024) for social media, Wide (1792x1024) for banners, Tall (1024x1792) for posters',
                                enum: ['1024x1024', '1792x1024', '1024x1792'],
                                default: '1024x1024'
                            },
                            style: {
                                type: 'string',
                                description: 'Visual style (DALL-E only): "vivid" for dramatic/artistic, "natural" for realistic/subdued',
                                enum: ['vivid', 'natural'],
                                default: 'vivid'
                            },
                            quality: {
                                type: 'string',
                                description: 'Image quality (DALL-E only): "standard" for faster generation, "hd" for higher detail',
                                enum: ['standard', 'hd'],
                                default: 'standard'
                            }
                        },
                        required: ['prompt']
                    }
                }
            ]
        }));

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            if (name === 'generate_image') {
                return await this.generateImage(args);
            }

            throw new Error(`Unknown tool: ${name}`);
        });
    }

    // Simple model selection: FLUX by default, DALL-E when explicitly requested
    selectModel(prompt, requestedModel) {
        if (requestedModel !== 'auto') {
            return requestedModel;
        }

        // Check if user explicitly mentions DALL-E
        const lowerPrompt = prompt.toLowerCase();
        const isDalleRequest = ['dall-e', 'dalle', 'dall e'].some(keyword => lowerPrompt.includes(keyword));

        return isDalleRequest ? 'dall-e-3' : 'flux';
    }

    async generateImage(args) {
        const startTime = Date.now();
        // Starting image generation

        const { prompt, model: requestedModel = 'auto', size = '1024x1024', style = 'vivid', quality = 'standard' } = args;

        if (!prompt) {
            throw new Error('Prompt is required for image generation');
        }

        try {
            const modelSelectionStart = Date.now();
            const selectedModel = this.selectModel(prompt, requestedModel);
            const modelSelectionTime = Date.now() - modelSelectionStart;

            // Model selection and generation setup complete

            const apiCallStart = Date.now();
            let result;
            if (selectedModel === 'dall-e-3') {
                result = await this.generateWithDallE(prompt, size, style, quality);
            } else {
                result = await this.generateWithFlux(prompt, size);
            }
            const apiCallTime = Date.now() - apiCallStart;

            const totalTime = Date.now() - startTime;
            // Image generation completed successfully

            return {
                content: [
                    {
                        type: 'text',
                        text: `🎨 **Your AI-Generated Image is Ready!**\n\n✨ **Created from:** "${prompt}"\n🤖 **AI Model:** ${selectedModel.toUpperCase()} ${selectedModel === 'dall-e-3' ? '(Photorealistic AI)' : '(Creative AI)'}\n📐 **Size:** ${size}\n⏱️ **Generation Time:** ${(totalTime/1000).toFixed(1)}s\n${requestedModel === 'auto' ? `🧠 **Smart Selection:** Chose ${selectedModel.toUpperCase()} based on your prompt\n` : ''}\n🖼️ Your custom image has been generated and is displayed below. Feel free to save, share, or use it however you'd like!`
                    },
                    {
                        type: 'image',
                        mimeType: 'image/png',
                        data: result.imageData
                    }
                ]
            };

        } catch (error) {
            const totalTime = Date.now() - startTime;
            console.error(`❌ [MCP] Error after ${totalTime}ms:`, error);
            throw new Error(`Failed to generate image: ${error.message}`);
        }
    }

    async generateWithDallE(prompt, size, style, quality) {
        const dalleStartTime = Date.now();
        const endpoint = `${this.azureBaseUrl}/dall-e-3/images/generations?api-version=2024-02-01`;

        const requestBody = {
            model: "dall-e-3",
            prompt: prompt,
            size: size,
            style: style,
            quality: quality,
            n: 1
        };

        // Making request to Azure DALL-E 3 API
        // DALL-E endpoint configured
        // DALL-E request body prepared

        const fetchStart = Date.now();
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.azureApiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        const fetchTime = Date.now() - fetchStart;

        // DALL-E response received
        // DALL-E response status received

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`🔵 [DALL-E] Azure API error response: ${errorText}`);
            throw new Error(`Azure DALL-E API error: ${response.status} - ${errorText}`);
        }

        const jsonParseStart = Date.now();
        const result = await response.json();
        const jsonParseTime = Date.now() - jsonParseStart;
        // DALL-E JSON parsing completed
        // DALL-E response structure validated

        // DALL-E returns URL, we need to fetch the image and convert to base64
        if (result.data && result.data[0] && result.data[0].url) {
            const imageUrl = result.data[0].url;
            // Fetching image from DALL-E URL

            const imageFetchStart = Date.now();
            const imageResponse = await fetch(imageUrl, {
                headers: {
                    'Accept': 'image/png, image/jpeg, image/*',
                    'Accept-Encoding': 'gzip, deflate, br'
                },
                timeout: 60000 // 60 second timeout
            });
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image: ${imageResponse.status}`);
            }

            const bufferStart = Date.now();
            // Use arrayBuffer for Node.js fetch compatibility
            const arrayBuffer = await imageResponse.arrayBuffer();
            const imageBuffer = Buffer.from(arrayBuffer);
            const bufferTime = Date.now() - bufferStart;

            const base64Start = Date.now();
            const imageData = imageBuffer.toString('base64');
            const base64Time = Date.now() - base64Start;
            const imageFetchTime = Date.now() - imageFetchStart;

            // Image processing completed
            const totalDalleTime = Date.now() - dalleStartTime;

            return { imageData };
        } else {
            console.error('Could not find image URL in DALL-E response:', JSON.stringify(result, null, 2));
            throw new Error('No image URL returned from Azure DALL-E API');
        }
    }

    async generateWithFlux(prompt, size) {
        const fluxStartTime = Date.now();
        const endpoint = `${this.azureBaseUrl}/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview`;

        const [width, height] = size.split('x').map(Number);

        const requestBody = {
            prompt: prompt,
            size: `${width}x${height}`,
            n: 1,
            model: "flux.1-kontext-pro"
        };

        // Making request to Azure FLUX API
        // FLUX endpoint configured
        // FLUX request body prepared

        const fetchStart = Date.now();
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.azureApiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        const fetchTime = Date.now() - fetchStart;

        // FLUX response received
        // FLUX response status received

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Azure FLUX API error response:', errorText);
            throw new Error(`Azure FLUX API error: ${response.status} - ${errorText}`);
        }

                const jsonParseStart = Date.now();
        const result = await response.json();
        const jsonParseTime = Date.now() - jsonParseStart;

        if (result.data && result.data[0] && result.data[0].b64_json) {
            const imageData = result.data[0].b64_json;
            const totalFluxTime = Date.now() - fluxStartTime;

            // Base64 image data found
            return { imageData };
        } else {
            console.error('Could not find b64_json in FLUX response:', JSON.stringify(result, null, 2));
            throw new Error('No image data returned from Azure FLUX API');
        }
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Azure Image Generation MCP server running on stdio');
    }
}

const server = new AzureImageGenerationMCPServer();
server.run().catch(console.error);
