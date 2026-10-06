# ollama-api
- Basic express gateway to locally running Ollama server

## Steps:
1. Download and install Ollama. This will perform better with more GPU power. The M Series Macs are typically powerful enough without running into problems; I have not personally tested on a Windows machine.
2. Start the Ollama server locally
3. Clone the repo and cd into the directory
`git clone https://github.com/jdetok/ollama-api.git && cd ollama-api`
4. Install npm packages and start express
`npm i && npm run dev`
5. Send a POST request **NOTE: must have model installed locally**
```json
{
    "model": "llama3.2",
    "prompt": "example prompt
}
```
- Example response:
```json
{
    "status": "succes",
    "model": "llama3.2",
    "reply": "Hello! It's nice to meet you. Is there something I can help you with or would you like to chat?"
}
```
