# Azure Image Generation MCP

> Model Context Protocol (MCP) server for AI-powered image generation using Azure DALL-E 3 and FLUX models

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

<a href="https://glama.ai/mcp/servers/@malikmalikayesha/Azure-Image-Generation-MCP">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@malikmalikayesha/Azure-Image-Generation-MCP/badge" alt="Azure Image Generation MCP server" />
</a>

## 🎨 Overview

A powerful MCP server that brings professional AI image generation to LibreChat. Generate stunning images using Azure's DALL-E 3 for photorealistic content or FLUX for creative artwork, with intelligent automatic model selection based on your prompts.

Perfect for LibreChat users who want seamless image generation capabilities powered by Azure AI Foundry models.

## ✨ Features

- **🤖 Dual Model Support**
  - DALL-E 3: Photorealistic images, portraits, and artistic content
  - FLUX (FLUX.1-Kontext-pro): Creative illustrations and flexible generation

- **🧠 Intelligent Model Selection**
  - Automatic model selection based on prompt analysis
  - FLUX as default for optimal results
  - DALL-E 3 when explicitly requested or optimal

- **📐 Multiple Image Sizes**
  - Square (1024x1024) - Perfect for social media
  - Wide (1792x1024) - Great for banners and headers
  - Tall (1024x1792) - Ideal for posters and vertical content

- **⚙️ Customization Options**
  - Quality settings (standard/HD) for DALL-E 3
  - Style options (vivid/natural) for DALL-E 3
  - Fast generation times (typically 30-60 seconds)

- **🔌 Easy Integration**
  - Works seamlessly with LibreChat
  - Compatible with MCP clients
  - Simple configuration via environment variables

## 📋 Prerequisites

- Node.js >= 18.0.0
- Azure OpenAI API access with:
  - DALL-E 3 deployment (optional)
  - FLUX deployment (FLUX.1-Kontext-pro)
- LibreChat instance (for LibreChat integration)

## 🚀 Installation

### Option 1: NPM Installation (Recommended)

```bash
npm install -g azure-image-generation-mcp
```

### Option 2: From Source

```bash
git clone https://github.com/malikmalikayesha/azure-image-generation-mcp.git
cd azure-image-generation-mcp
npm install
```

### Option 3: NPX (No Installation)

```bash
npx azure-image-generation-mcp
```

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file or set environment variables:

```bash
AZURE_IMAGE_API_KEY=your_azure_api_key_here
AZURE_IMAGE_BASE_URL=https://your-endpoint.cognitiveservices.azure.com/openai/deployments
```

### 2. LibreChat Integration

Add to your `librechat.yaml`:

```yaml
mcpServers:
  "Image Generation":
    type: stdio
    command: node
    args:
      - /path/to/azure-image-generation-server.js

    name: "Image Generation"
    displayName: "Image Generation"

    timeout: 180000      # 3 minutes for generation
    initTimeout: 60000   # 1 minute startup

    chatMenu: true       # Show in chat tools

    serverInstructions: |
      🎨 AI Image Generation Tool

      Create stunning images using DALL-E 3 or FLUX models.
      Simply describe what you want to see!

    env:
      AZURE_IMAGE_API_KEY: "${AZURE_IMAGE_API_KEY}"
      AZURE_IMAGE_BASE_URL: "${AZURE_IMAGE_BASE_URL}"
```

## 📖 Usage

### In LibreChat

Simply ask the AI to generate an image:

```
"Generate an image of a serene mountain landscape at sunset"
"Create a modern minimalist logo for a tech startup"
"Draw a realistic portrait of a confident businesswoman"
"Make an abstract pattern with geometric shapes"
```

### Model Selection

- **Automatic (Default)**: The system intelligently chooses between DALL-E 3 and FLUX
- **FLUX (Default)**: Used for most requests unless DALL-E is explicitly mentioned
- **DALL-E 3**: Explicitly request by mentioning "DALL-E" in your prompt

### Advanced Options

Specify additional parameters in your request:

```
"Generate a wide landscape image in HD quality using DALL-E"
Size: 1792x1024, Quality: HD, Model: DALL-E 3

"Create a tall poster with vivid colors"
Size: 1024x1792, Style: vivid
```

## 🔧 Docker Deployment (LibreChat)

If using Docker with LibreChat, add to your Dockerfile:

```dockerfile
# Install MCP SDK dependencies
RUN npm install @modelcontextprotocol/sdk@^1.17.2

# Copy Azure image generation files
COPY azure-image-generation-server.js ./
```

Then ensure your `docker-compose.yml` includes the environment variables:

```yaml
services:
  api:
    environment:
      - AZURE_IMAGE_API_KEY=${AZURE_IMAGE_API_KEY}
      - AZURE_IMAGE_BASE_URL=${AZURE_IMAGE_BASE_URL}
```

## 🛠️ API Reference

### Tool: `generate_image`

Generates an AI image based on a text prompt.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | - | Description of the image to generate |
| `model` | string | No | `auto` | Model selection: `dall-e-3`, `flux`, or `auto` |
| `size` | string | No | `1024x1024` | Image dimensions: `1024x1024`, `1792x1024`, `1024x1792` |
| `style` | string | No | `vivid` | DALL-E style: `vivid` or `natural` |
| `quality` | string | No | `standard` | DALL-E quality: `standard` or `hd` |

#### Response

Returns a structured response with:
- Text description of the generated image
- Base64-encoded PNG image data
- Metadata (model used, size, generation time)

## 🐛 Troubleshooting

### Common Issues

**Images not displaying in Azure models:**
- Ensure you're using LibreChat with the MCP image rendering fix (included in LibreChat v0.7.9+)
- Check that your `librechat.yaml` configuration is correct

**MCP server fails to start:**
- Verify environment variables are set correctly
- Check that Node.js version is >= 18.0.0
- Ensure `@modelcontextprotocol/sdk` is installed

**API errors:**
- Verify your Azure API key is valid
- Check that the base URL points to your Azure OpenAI endpoint
- Ensure your Azure deployment has DALL-E 3 or FLUX enabled

**Generation timeout:**
- Increase `timeout` value in `librechat.yaml` (default: 180000ms)
- Check your network connectivity to Azure

### Debug Mode

Enable debug logging by checking LibreChat logs:

```bash
# Docker
docker logs librechat-api

# Local
DEBUG=* npm start
```

## 📝 Example Prompts

### Photorealistic Images
```
"A professional headshot of a software engineer in a modern office"
"Sunset over Tokyo skyline with Mount Fuji in the distance"
"Close-up of fresh vegetables on a wooden cutting board"
```

### Artistic & Creative
```
"Minimalist logo design for a coffee shop called 'Bean Dreams'"
"Watercolor painting of a cottage in a flower garden"
"Abstract geometric pattern in blues and golds"
```

### Marketing & Design
```
"Modern tech startup hero banner image, wide format"
"Instagram post background with pastel gradients"
"Professional LinkedIn banner for a data scientist"
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for [LibreChat](https://librechat.ai) - Open-source ChatGPT alternative
- Uses [Model Context Protocol (MCP)](https://modelcontextprotocol.io) by Anthropic
- Powered by Azure AI Foundry models

## 📬 Support

- **Issues**: [GitHub Issues](https://github.com/malikmalikayesha/azure-image-generation-mcp/issues)
- **LibreChat Discord**: [Join the community](https://discord.librechat.ai)
- **Documentation**: [LibreChat Docs](https://docs.librechat.ai)

---

Made with ❤️ for the LibreChat community