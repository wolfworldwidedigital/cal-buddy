-> server IP = localhost

****

git clone --recursive https://github.com/NexaAI/nexa-sdk

If you forget to use --recursive, you can use below command to add submodule

git submodule update --init --recursive

Then you can build and install the package

pip install -e .

*****

however, I want to embed or integrate the Nexa SDK so the endpoint would be localhost I suppose

I have been pleased with:

nexa run llama3.2 
// just need to ensure it runs either with something like pm2 or just simply as a service on my Linux VDS

below are some more instructions on how to get everything done.

Start Local Server

You can start a local server using models on your local computer with the nexa server command. Here's the usage syntax:

usage: nexa server [-h] [--host HOST] [--port PORT] [--reload] model_path

Options:

    -lp, --local_path: Indicate that the model path provided is the local path
    -mt, --model_type: Indicate the model running type, must be used with -lp or -hf or ms, choose from [NLP, COMPUTER_VISION, MULTIMODAL, AUDIO]
    -hf, --huggingface: Load model from Hugging Face Hub
    -ms, --modelscope: Load model from ModelScope Hub
    --host: Host to bind the server to
    --port: Port to bind the server to
    --reload: Enable automatic reloading on code changes
    --nctx: Maximum context length of the model you're using

Example Commands:

nexa server gemma
nexa server llama2-function-calling
nexa server sd1-5
nexa server faster-whipser-large
nexa server ../models/llava-v1.6-vicuna-7b/ -lp -mt MULTIMODAL

By default, nexa server will run gguf models. To run onnx models, simply add onnx after nexa server.
API Endpoints
1. Text Generation: /v1/completions

Generates text based on a single prompt.
Request body:

{
  "prompt": "Tell me a story",
  "temperature": 1,
  "max_new_tokens": 128,
  "top_k": 50,
  "top_p": 1,
  "stop_words": ["string"],
  "stream": false
}

Example Response:

{
  "result": "Once upon a time, in a small village nestled among rolling hills..."
}

2. Chat Completions: /v1/chat/completions

Update: Now supports multimodal inputs when using Multimodal models.

Handles chat completions with support for conversation history.
Request body:

Multimodal models (VLM):

{
  "model": "anything",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What’s in this image?"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
          }
        }
      ]
    }
  ],
  "max_tokens": 300,
  "temperature": 0.7,
  "top_p": 0.95,
  "top_k": 40,
  "stream": false
}

Traditional NLP models:

{
  "messages": [
    {
      "role": "user",
      "content": "Tell me a story"
    }
  ],
  "max_tokens": 128,
  "temperature": 0.1,
  "stream": false,
  "stop_words": []
}

Example Response:

{
  "id": "f83502df-7f5a-4825-a922-f5cece4081de",
  "object": "chat.completion",
  "created": 1723441724.914671,
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "In the heart of a mystical forest..."
      }
    }
  ]
}

3. Function Calling: /v1/function-calling

Call the most appropriate function based on user's prompt.
Request body:

{
  "messages": [
    {
      "role": "user",
      "content": "Extract Jason is 25 years old"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "UserDetail",
        "parameters": {
          "properties": {
            "name": {
              "description": "The user's name",
              "type": "string"
            },
            "age": {
              "description": "The user's age",
              "type": "integer"
            }
          },
          "required": ["name", "age"],
          "type": "object"
        }
      }
    }
  ],
  "tool_choice": "auto"
}

Function format:

{
  "type": "function",
  "function": {
    "name": "function_name",
    "description": "function_description",
    "parameters": {
      "type": "object",
      "properties": {
        "property_name": {
          "type": "string | number | boolean | object | array",
          "description": "string"
        }
      },
      "required": ["array_of_required_property_names"]
    }
  }
}

Example Response:

{
  "id": "chatcmpl-7a9b0dfb-878f-4f75-8dc7-24177081c1d0",
  "object": "chat.completion",
  "created": 1724186442,
  "model": "/home/ubuntu/.cache/nexa/hub/official/Llama2-7b-function-calling/q3_K_M.gguf",
  "choices": [
    {
      "finish_reason": "tool_calls",
      "index": 0,
      "logprobs": null,
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call__0_UserDetail_cmpl-8d5cf645-7f35-4af2-a554-2ccea1a67bdd",
            "type": "function",
            "function": {
              "name": "UserDetail",
              "arguments": "{ \"name\": \"Jason\", \"age\": 25 }"
            }
          }
        ],
        "function_call": {
          "name": "",
          "arguments": "{ \"name\": \"Jason\", \"age\": 25 }"
        }
      }
    }
  ],
  "usage": {
    "completion_tokens": 15,
    "prompt_tokens": 316,
    "total_tokens": 331
  }
}

4. Text-to-Image: /v1/txt2img

Generates images based on a single prompt.
Request body:

{
  "prompt": "A girl, standing in a field of flowers, vivid",
  "image_path": "",
  "cfg_scale": 7,
  "width": 256,
  "height": 256,
  "sample_steps": 20,
  "seed": 0,
  "negative_prompt": ""
}

Example Response:

{
  "created": 1724186615.5426757,
  "data": [
    {
      "base64": "base64_of_generated_image",
      "url": "path/to/generated_image"
    }
  ]
}

5. Image-to-Image: /v1/img2img

Modifies existing images based on a single prompt.
Request body:

{
  "prompt": "A girl, standing in a field of flowers, vivid",
  "image_path": "path/to/image",
  "cfg_scale": 7,
  "width": 256,
  "height": 256,
  "sample_steps": 20,
  "seed": 0,
  "negative_prompt": ""
}

Example Response:

{
  "created": 1724186615.5426757,
  "data": [
    {
      "base64": "base64_of_generated_image",
      "url": "path/to/generated_image"
    }
  ]
}

6. Audio Transcriptions: /v1/audio/transcriptions

Transcribes audio files to text.
Parameters:

    beam_size (integer): Beam size for transcription (default: 5)
    language (string): Language code (e.g., 'en', 'fr')
    temperature (number): Temperature for sampling (default: 0)

Request body:

{
  "file" (form-data): The audio file to transcribe (required)
}

Example Response:

{
  "text": " And so my fellow Americans, ask not what your country can do for you, ask what you can do for your country."
}

7. Audio Translations: /v1/audio/translations

Translates audio files to text in English.
Parameters:

    beam_size (integer): Beam size for transcription (default: 5)
    temperature (number): Temperature for sampling (default: 0)

Request body:

{
  "file" (form-data): The audio file to transcribe (required)
}

Example Response:

{
  "text": " Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"
}

8. Generate Embeddings: /v1/embeddings

Generate embeddings for a given text.
Request body:

{
  "input": "I love Nexa AI.",
  "normalize": false,
  "truncate": true
}

Example Response:

{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [
        -0.006929283495992422,
        -0.005336422007530928,
        ... (omitted for spacing)
        -4.547132266452536e-05,
        -0.024047505110502243
      ],
    }
  ],
  "model": "/home/ubuntu/models/embedding_models/mxbai-embed-large-q4_0.gguf",
  "usage": {
    "prompt_tokens": 5,
    "total_tokens": 5
  }
}

-----

This is the service that is associated with this credential. You'll be able to use this key to authenticate to this type of service only.
Name

-> API

This is a friendly name so you can identify this credential later. You can enter anything you want here, the more descriptive the better.
Key

-> API_sleutels

This is the unique key which will be used to authenticate any requests to the API or the SMTP servers. It will be generated randomly and cannot be changed. If you need a new token, you can create a new one and then delete the old one when you're ready.
Hold

Key => ixRHHKC22xXOHfRBi0RbHPvF

Send as any = enabled

---

hoi@postduif.cusmato.app

welkom@postduif.cusmato.app



We last checked the validity of your DNS records 6 minutes ago.
SPF Record

Good Your SPF record looks good!

You need to add a TXT record at the apex/root of your domain (@) with the following content. If you already send mail from another service, you may just need to add include:spf.postduif.cusmato.app to your existing record.

v=spf1 a mx include:spf.postduif.cusmato.app ~all

DKIM Record

Good Your DKIM record looks good!

You need to add a new TXT record with the name postal-oeCAQL._domainkey with the following content.

v=DKIM1; t=s; h=sha256; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLcXPns1EES45nSAjabrp7tBBI4vXjbwt8xUoMFVYtiqdIw9NG/B37NFmr4myxRUBPkqAQckJBKIy5MH9bl+huOT/kOGISiF8XfMcQhOixEhhoQxye2II8Tjz2EOf8LcMtxbzpd8x0SnhGsWkyU6qoc8BBQ384POFLCCvbRR0TfwIDAQAB;

Return Path

Good Your return path looks good. We'll use this when sending e-mail from this domain.

This is optional but we recommend adding this to improve deliverability. You should add a CNAME record at psrp.postduif.cusmato.app to point to the hostname below.

rp.postduif.cusmato.app

MX Records

Good Your MX records look like they're good to go!

If you wish to receive incoming e-mail for this domain, you need to add the following MX records to the domain. You don't have to do this and we'll only tell you if they're set up or not. Both records should be priority 10.

mx.postduif.cusmato.app

# Cal-Buddy Architecture (Tauri 2.0)

## Core Components

### 1. Frontend (Tauri + Next.js)
- Tauri 2.0 for native app wrapper
- Next.js for UI (keeping existing components)
- SQLite for local storage (via Tauri)
- IPC commands for Python communication

### 2. Python Sidecar
- FastAPI server for Llama 3.2
- Endpoints:
  - `/chat` - Main chat completion
  - `/stream` - Streaming completion
  - `/health` - Service health check
- Auto-start/stop with main app

### 3. Email Service
- Direct Postal API integration via Tauri
- Local email template storage
- Webhook handler for notifications

## Implementation Steps

1. Tauri Setup
```toml
[package]
name = "cal-buddy"
version = "0.1.0"

[dependencies]
tauri = "2.0.0-alpha"
sqlite = "0.1.0"
reqwest = "0.11"
```

2. Python Service
```python
# Requirements
- llama-cpp-python
- fastapi
- uvicorn
```

3. Database Schema (SQLite)
```sql
-- Keep existing schema, accessed via Tauri
```

## Development Flow
1. Initialize Tauri 2.0 project
2. Set up Python sidecar service
3. Implement IPC bridges
4. Migrate existing Next.js components
5. Add notification system

## Advantages
- Native performance
- Better memory management
- Offline-first
- Simple deployment
- Easy updates via Tauri

## Next Steps
1. Set up Tauri 2.0 project structure
2. Create Python FastAPI service for Llama
3. Implement IPC communication
4. Migrate existing UI components