import OpenAI from "openai";

// Initialize the OpenAI API with your API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
let chatHistory = [{ role: "system", content: "Can you please provide me with the Design URL." }];
let isFirstMessage = true; // Flag to track if it's the first message
let lastImageUrl = null; // Store the last provided image URL
const defaultMessage = "Guides non-designers in design work to analysis this imqge in topics (Brand Identity , Color Scheme - Balance and Harmony: Typography - Readability:  - Font Pairing:  - Hierarchy ,  Imagery and Graphics - Quality,  - Relevance:  4. Layout and Composition , Whitespace , Contrast - Visual Interest , Legibility:  6. Consistency - Cohesive Elements:  7. Alignment - Structured Appearance:  8. Proportion and Scale - Visual Hierarchy)"; // Define the default message in a variable

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "POST":
      if (req.query.endpoint === "chat") {
        const { message, imageUrl } = req.body;

        // Add user message to the chat history
        chatHistory.push({ role: "user", content: message });

        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                 { type: "text", text: message },
                  ...(lastImageUrl ? [
                    {
                      type: "image_url",
                      image_url: {
                        "url": lastImageUrl,
                      },
                    },
                  ] : []),
                ],
              },
            ],
          });

          const aiResponse = response.choices[0].message.content;
          chatHistory.push({ role: "assistant", content: aiResponse });

          res.status(200).json({ success: true, response: aiResponse });
        } catch (error) {
          console.error("Error with OpenAI call:", error);
          res.status(500).json({ success: false, error: "Error processing the AI response." });
        }

        // After the first message, set isFirstMessage to false
        isFirstMessage = false;

        // Update lastImageUrl if a new imageUrl is provided
        if (imageUrl) {
          lastImageUrl = imageUrl;
        }
      } else if (req.query.endpoint === "reset") {
        chatHistory = [{ role: "system", content: "You are a helpful assistant." }];
        isFirstMessage = true; // Reset the flag when resetting the chat
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: "Not Found" });
      }
      break;
    case "GET":
      if (req.query.endpoint === "history") {
        res.status(200).json(chatHistory);
      } else {
        res.status(404).json({ error: "Not Found" });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
