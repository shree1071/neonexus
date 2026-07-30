import os
import asyncio
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.plugins import openai, deepgram, elevenlabs, tavus
from livekit.agents.voice_assistant import VoiceAssistant

load_dotenv()

async def entrypoint(ctx: JobContext):
    # Connect to the LiveKit Room
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Initialize the Tavus 3D Avatar Session (Pipeline mode must be 'echo' in Tavus portal)
    avatar = tavus.AvatarSession(
        replica_id=os.getenv("TAVUS_REPLICA_ID", "r12345"),
        persona_id=os.getenv("TAVUS_PERSONA_ID", "p12345")
    )
    
    # We mount the Avatar stream into the current LiveKit room
    await avatar.start(ctx.room)

    # We use Groq or Gemini via OpenAI compatibility layer for ultra-fast conversation
    llm_model = openai.LLM(model="gemma-3-8b") 

    # Define the voice assistant pipeline
    assistant = VoiceAssistant(
        vad=None, # Voice Activity Detection handles when user stops speaking
        stt=deepgram.STT(), # Deepgram for blazing fast speech-to-text
        llm=llm_model,
        tts=elevenlabs.TTS(
            model="eleven_turbo_v2_5", 
            # Lower stability introduces "randomness" (stochasticity) to make it sound perfectly human
            # with breathiness, micro-pauses, and natural inflection.
            stability=0.35, 
            similarity_boost=0.75
        ),
        chat_ctx=llm.ChatContext().append(
            role="system",
            text="You are an interactive AI Physics Tutor. Explain concepts clearly. When the user says they circled something, assume the central mind has drawn it on screen."
        ),
    )

    # Bridge the assistant's speech output directly to the Tavus Avatar for lip-sync
    @assistant.on("agent_speech_committed")
    def on_agent_speech(msg):
        # We can pipe audio frames here if needed, but the Tavus plugin handles 
        # auto-bridging the agent's active audio track on the room natively.
        pass

    # Start the voice conversation
    assistant.start(ctx.room)

    # Greeting
    await assistant.say("Hello Rohan! I'm ready to study with you. Let's play the physics lecture.", allow_interruptions=True)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
