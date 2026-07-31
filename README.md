# ScreenAwareTutor

An AI-powered interactive tutoring system that combines real-time screen analysis, visual annotations, and conversational AI to create an immersive learning experience. Built with React, TypeScript, and Google's Gemma AI.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Overview

ScreenAwareTutor is an intelligent tutoring system that watches educational videos or screens alongside students, providing:

- **Visual Analysis**: AI-powered frame analysis using Google's Gemma 4 model
- **Interactive Annotations**: Draw circles on screen to highlight concepts for instant explanations
- **Voice-Enabled Tutoring**: Real-time voice conversation with an AI tutor using LiveKit
- **3D Avatar Integration**: Photorealistic 3D avatars via Tavus for engaging interactions
- **Rich Mathematical Rendering**: LaTeX support for mathematical formulas and equations
- **Browser Extension**: Works on any webpage via Chrome extension side panel

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Content      │  │ Background   │  │  Side Panel      │  │
│  │ Script       │  │ Service      │  │  (React UI)      │  │
│  │ (Capture &   │  │ Worker       │  │  - TutorSidebar  │  │
│  │  Annotate)   │  │              │  │  - VideoPlayer   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Express Backend                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes:                                         │   │
│  │  - /api/analyze-frame (Gemma Vision Analysis)       │   │
│  │  - /api/livekit/token (WebRTC Token Generation)     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  LiveKit Voice Agent (Python)                │
│  - Voice Activity Detection                                  │
│  - Speech-to-Text (Deepgram)                                │
│  - LLM Conversation (Gemma/OpenAI)                          │
│  - Text-to-Speech (ElevenLabs)                              │
│  - 3D Avatar Rendering (Tavus)                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19 + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- tldraw for canvas drawing
- React Markdown + KaTeX for math rendering
- Chrome Extension APIs

**Backend:**
- Node.js + Express
- TypeScript with tsx runtime
- LiveKit SDK for WebRTC
- Google Generative AI SDK
- CORS enabled for cross-origin requests

**AI/ML Services:**
- **Google Gemma 4**: Vision + language understanding
- **LiveKit**: Real-time audio/video infrastructure
- **Deepgram**: Ultra-low latency speech-to-text
- **ElevenLabs**: Natural text-to-speech synthesis
- **Tavus**: Photorealistic 3D avatar generation

## Features

### 1. Intelligent Frame Analysis
- Captures video frames from any browser tab
- Analyzes mathematical equations, diagrams, and visual concepts
- Generates 8-12+ detailed annotations per frame
- Color-coded annotations by concept type:
  - Red: Given values
  - Blue: Formulas
  - Green: Results
  - Orange: Solution steps
  - Violet: Diagrams
  - Yellow: Pro tips and sticky notes

### 2. Visual Annotation System
- **Box annotations**: Group related concepts
- **Arrow annotations**: Point to specific elements
- **Ellipse annotations**: Circle key values
- **Note annotations**: Add teacher tips and next steps

### 3. Conversational AI Tutor
- Real-time voice conversation
- Context-aware responses about circled content
- Natural speech synthesis with humanlike inflection
- Browser-based speech API fallback (no API key required)

### 4. Smart Caching
- Visual cache detection for common problems
- Instant response for frequently asked questions
- File URI caching for lightning-fast follow-ups

### 5. LaTeX Math Rendering
- Full LaTeX support in explanations
- Automatic repair of improperly escaped LaTeX
- KaTeX rendering for beautiful mathematical formulas

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+ (for LiveKit agent)
- **Google AI Studio** account (Gemini API key)
- **LiveKit Cloud** account (for WebRTC)
- *Optional:* Tavus, Deepgram, and ElevenLabs accounts for full voice features

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ScreenAwareTutor
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required: Google Gemini API
GEMINI_API_KEY="your_google_ai_studio_api_key_here"

# Required: LiveKit WebRTC
LIVEKIT_API_KEY="your_livekit_api_key_here"
LIVEKIT_API_SECRET="your_livekit_api_secret_here"
LIVEKIT_URL="wss://your-project-id.livekit.cloud"

# Optional: Voice Features
DEEPGRAM_API_KEY="your_deepgram_api_key_here"
ELEVENLABS_API_KEY="your_elevenlabs_api_key_here"

# Optional: 3D Avatar
TAVUS_API_KEY="your_tavus_api_key_here"
TAVUS_REPLICA_ID="your_tavus_replica_id"
TAVUS_PERSONA_ID="your_tavus_persona_id"
```

#### Getting API Keys

- **Gemini API**: Visit [Google AI Studio](https://aistudio.google.com/) → Get API Key
- **LiveKit**: Sign up at [LiveKit Cloud](https://cloud.livekit.io/) → Create project → Get API credentials
- **Deepgram**: Sign up at [Deepgram](https://deepgram.com/) → Get API key
- **ElevenLabs**: Sign up at [ElevenLabs](https://elevenlabs.io/) → Get API key
- **Tavus**: Contact [Tavus](https://www.tavus.io/) for beta access

### 4. Install Python Dependencies (Optional - For Voice Agent)

```bash
cd livekit-agent
pip install -r requirements.txt
cd ..
```

## Usage

### Development Mode

Run both the backend server and frontend client simultaneously:

```bash
npm run dev
```

This starts:
- **Backend API**: http://localhost:5001
- **Frontend Client**: http://localhost:5173

Or run them separately:

```bash
# Terminal 1: Backend server
npm run dev:server

# Terminal 2: Frontend client
npm run dev:client
```

### Running the LiveKit Voice Agent (Optional)

```bash
cd livekit-agent
python agent.py
```

### Loading the Chrome Extension

1. Build the extension:
   ```bash
   cd client
   npm run build
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked"

5. Select the `client/dist` directory

6. The extension icon should appear in your toolbar

### Using the Extension

1. **Navigate to an educational video** (YouTube, Khan Academy, etc.)

2. **Click the extension icon** to open the side panel

3. **Start AI Tutor Session** to activate the assistant

4. **Pause the video** when you see something you want explained

5. **Draw a circle** around the concept or equation

6. **Wait for AI analysis** - explanations appear in the side panel

7. **Listen to voice explanation** (if voice features enabled)

## Project Structure

```
ScreenAwareTutor/
├── client/                          # Chrome Extension + React Frontend
│   ├── public/
│   │   ├── content.js              # Content script for page interaction
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── DrawingCanvas.tsx   # tldraw canvas for annotations
│   │   │   ├── TutorSidebar.tsx    # Main UI component
│   │   │   └── VideoPlayer.tsx     # Video playback component
│   │   ├── lib/
│   │   │   └── capture.ts          # Screen capture utilities
│   │   ├── App.tsx                 # Root component
│   │   ├── background.ts           # Extension service worker
│   │   ├── content.tsx             # Content script entry
│   │   ├── main.tsx                # React entry point
│   │   └── index.css               # Global styles
│   ├── manifest.json               # Chrome extension manifest
│   ├── vite.config.ts              # Vite configuration
│   └── package.json
│
├── server/                          # Express Backend
│   ├── lib/
│   │   └── gemma-vision.ts         # Gemma AI integration
│   ├── index.ts                    # Server entry point
│   ├── routes.ts                   # API route definitions
│   ├── cached_physics_wallah.json  # Pre-computed responses
│   └── cached_physics_wallah_2.json
│
├── livekit-agent/                  # Python Voice Agent
│   ├── agent.py                    # LiveKit voice assistant
│   └── requirements.txt            # Python dependencies
│
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Environment template
├── package.json                    # Root dependencies
└── tsconfig.json                   # TypeScript configuration
```

## API Reference

### POST `/api/analyze-frame`

Analyzes a video frame and generates annotations.

**Request Body:**
```typescript
{
  imageBase64?: string;          // Base64-encoded JPEG image
  query?: string;                // User's question
  circleCoordinates?: {          // Circle coordinates (0-1000 scale)
    x: number;
    y: number;
  };
  cachedFileUri?: string;        // Gemini File URI for cached frames
  cachedMimeType?: string;       // MIME type of cached file
  title?: string;                // Video title
  timestamp?: number;            // Video timestamp
}
```

**Response:**
```typescript
{
  explanation: string;           // Markdown explanation with LaTeX
  annotations: [                 // Visual annotations
    {
      type: "box" | "arrow" | "ellipse" | "note";
      coordinates: {             // 0-1000 scale
        x: number;
        y: number;
        width?: number;          // For box
        height?: number;         // For box
        toX?: number;            // For arrow
        toY?: number;            // For arrow
      };
      color: string;             // red, blue, green, orange, violet, yellow
      label: string;             // Plain text (no LaTeX)
    }
  ];
  fileUri?: string;              // Gemini File URI (for caching)
  mimeType?: string;             // MIME type
}
```

### GET `/api/livekit/token`

Generates a LiveKit access token for WebRTC connection.

**Query Parameters:**
- `room` (optional): Room name (default: "physics-lab-1")
- `username` (optional): Participant name (default: "student")

**Response:**
```typescript
{
  token: string;                 // JWT access token
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```typescript
{
  status: "ok";
  message: "ScreenAwareTutor API is running.";
}
```

## Annotation System

The AI generates rich visual annotations following these rules:

### Annotation Types

| Type | Use Case | Properties |
|------|----------|------------|
| `box` | Group related content | x, y, width, height |
| `arrow` | Point to specific elements | x, y, toX, toY |
| `ellipse` | Circle individual values | x, y, radiusX, radiusY |
| `note` | Add teacher tips | x, y, text |

### Color Coding

| Color | Concept Type |
|-------|--------------|
| Red | Given values, inputs |
| Blue | Formulas, equations |
| Green | Results, final answers |
| Orange | Solution steps, process |
| Violet | Diagrams, visual aids |
| Yellow | Pro tips, sticky notes |

### Coordinate System

All coordinates use a **0-1000 scale** relative to video dimensions:
- (0, 0): Top-left corner
- (1000, 1000): Bottom-right corner
- (500, 500): Center of frame

## AI Features

### Gemma 4 Integration

The system uses Google's Gemma 4 (26B parameter) model with:
- **Vision understanding** for frame analysis
- **JSON mode** for structured outputs
- **File API** for efficient image caching
- **Smart repair** for LaTeX escaping issues

### Cache Detection

The AI can visually recognize previously seen problems and serve cached responses instantly:

```typescript
// Special cache detection in prompt
if (image matches "projectile motion 6m/s and 8m/s") {
  return CACHED_RESPONSE_1;
}
```

### LaTeX Repair

Automatic repair of improperly escaped LaTeX:
- Detects unescaped backslashes
- Preserves valid JSON escapes (`\n`, `\t`, `\"`)
- Handles unicode escapes (`\uXXXX`)
- Doubles backslashes in LaTeX commands (`\sin` → `\\sin`)

## Voice Features

### Browser Speech API (Default)

No API keys required! Uses built-in browser speech synthesis:
- Automatic voice selection (prefers Google voices)
- Adjustable rate, pitch, and volume
- LaTeX sanitization for natural speech
- Visual speaking indicator

### Advanced Voice Pipeline (Optional)

With full API keys configured:
1. **Deepgram STT**: Transcribes user speech
2. **Gemma LLM**: Generates intelligent responses
3. **ElevenLabs TTS**: Synthesizes natural speech
4. **Tavus Avatar**: Lip-synced 3D avatar

## Security Considerations

- API keys stored in `.env` (gitignored)
- CORS enabled for cross-origin requests
- Content scripts isolated from page context
- File uploads limited to 50MB
- Temporary files cleaned after upload

## Troubleshooting

### Common Issues

**"Gemini API key not found"**
- Ensure `GEMINI_API_KEY` is set in `.env`
- Restart the server after updating `.env`

**"Failed to generate LiveKit token"**
- Check `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`
- Verify LiveKit URL format: `wss://your-project.livekit.cloud`

**"Extension not loading"**
- Build the extension: `cd client && npm run build`
- Check `chrome://extensions/` for error messages
- Ensure manifest.json is valid

**"No voice output"**
- Check browser permissions for audio
- Verify ElevenLabs API key (if using advanced features)
- Ensure audio is not muted in sidebar

**"Annotations not appearing"**
- Check console for API errors
- Verify image is being captured correctly
- Ensure coordinates are in 0-1000 range

## Development Tips

### Hot Reload

The development server supports hot module replacement (HMR):
- Frontend changes reload automatically
- Backend requires manual restart (consider using `nodemon`)

### Debugging

**Backend:**
```bash
# Enable debug logging
DEBUG=* npm run dev:server
```

**Frontend:**
- Open Chrome DevTools
- Go to Sources tab → Content scripts
- Set breakpoints in content.tsx or App.tsx

**Extension:**
- Right-click extension icon → "Inspect popup"
- Open DevTools for side panel debugging

### Testing Prompts

Modify the AI instruction in `server/routes.ts` to:
- Adjust annotation density
- Change color schemes
- Add new annotation types
- Customize explanation style

## Contributing

Contributions welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow existing code formatting
- Add comments for complex logic
- Update README for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Google Gemini** for powerful vision AI
- **LiveKit** for real-time communication infrastructure
- **tldraw** for beautiful canvas drawing
- **React** and **Vite** for excellent developer experience
- **Deepgram** and **ElevenLabs** for voice AI
- **Tavus** for 3D avatar technology

## Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review API provider documentation

## Roadmap

- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Collaborative study sessions
- [ ] Progress tracking and analytics
- [ ] Custom annotation styles
- [ ] Offline mode for cached content
- [ ] Integration with more video platforms
- [ ] Whiteboard mode for problem solving
- [ ] Quiz generation from video content
- [ ] Study note export (PDF/Markdown)

---

**Built with care for learners everywhere**

*Making education more interactive, one frame at a time.*
