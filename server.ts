import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// 2. Fetch imported summaries from data/summaries
app.get('/api/content/summaries', (req, res) => {
  try {
    const summariesDir = path.resolve(__dirname, 'imported_repo', 'data', 'summaries');
    if (!fs.existsSync(summariesDir)) {
      return res.json({ summaries: [] });
    }

    const files = fs.readdirSync(summariesDir).filter(f => f.endsWith('.md'));
    const summaries = files.map((filename) => {
      const fullPath = path.join(summariesDir, filename);
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Extract video ID from filename: e.g. "Title [ID].summary.md"
      const idMatch = filename.match(/\[(.*?)\]/);
      const videoId = idMatch ? idMatch[1] : '';
      const cleanTitle = filename.replace(/\s*\[.*?\]\.summary\.md$/, '').trim();

      // Extract basic metadata from first few lines if available
      const lengthMatch = content.match(/\*\*Approx\. length\*\*:\s*(.*)/i);
      const topicMatch = content.match(/\*\*Topic\*\*:\s*(.*)/i);
      const audienceMatch = content.match(/\*\*Audience \/ level\*\*:\s*(.*)/i);
      const takeawayMatch = content.match(/## One-line takeaway\s+([^\n]+)/i);

      return {
        id: videoId || filename,
        filename,
        title: cleanTitle,
        videoId,
        approxLength: lengthMatch ? lengthMatch[1].trim() : '',
        topic: topicMatch ? topicMatch[1].trim() : '',
        audience: audienceMatch ? audienceMatch[1].trim() : '',
        oneLineTakeaway: takeawayMatch ? takeawayMatch[1].trim() : '',
        content,
      };
    });

    res.json({ summaries });
  } catch (err: any) {
    console.error('Error reading summaries:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Fetch lessons from imported_repo (Claude & Kiro series)
app.get('/api/content/lessons', (req, res) => {
  try {
    const claudeDir = path.resolve(__dirname, 'imported_repo', 'lessons_Claude');
    const kiroDir = path.resolve(__dirname, 'imported_repo', 'lessons_Kiro');

    const readLessons = (dir: string, seriesName: 'Claude' | 'Kiro') => {
      if (!fs.existsSync(dir)) return [];
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md' && !f.includes('lessons.md'));
      files.sort();

      return files.map((file) => {
        const fullPath = path.join(dir, file);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const firstHeader = content.match(/^#\s+(.*)/m);
        const title = firstHeader ? firstHeader[1] : file.replace('.md', '');
        return {
          id: `${seriesName.toLowerCase()}-${file}`,
          series: seriesName,
          filename: file,
          title,
          content,
        };
      });
    };

    const claudeLessons = readLessons(claudeDir, 'Claude');
    const kiroLessons = readLessons(kiroDir, 'Kiro');

    res.json({
      claude: claudeLessons,
      kiro: kiroLessons,
    });
  } catch (err: any) {
    console.error('Error reading lessons:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Read prompt log & feedback log
app.get('/api/content/logs', (req, res) => {
  try {
    const promptsFile = path.resolve(__dirname, 'gemini_prompts.md');
    const feedbackFile = path.resolve(__dirname, 'gemini_feedback.md');

    const prompts = fs.existsSync(promptsFile) ? fs.readFileSync(promptsFile, 'utf-8') : '';
    const feedback = fs.existsSync(feedbackFile) ? fs.readFileSync(feedbackFile, 'utf-8') : '';

    res.json({ prompts, feedback });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Append prompt to gemini_prompts.md
app.post('/api/content/append-prompt', (req, res) => {
  try {
    const { promptText, sessionName } = req.body;
    if (!promptText) {
      return res.status(400).json({ error: 'promptText is required' });
    }

    const promptsFile = path.resolve(__dirname, 'gemini_prompts.md');
    const timestamp = new Date().toISOString();
    const entry = `\n---\n\n### User Prompt (${sessionName || 'Interactive Hub'})\n*Timestamp: ${timestamp}*\n\n\`\`\`text\n${promptText.trim()}\n\`\`\`\n`;

    fs.appendFileSync(promptsFile, entry, 'utf-8');
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Gemini API: Extract insights, takeaways, quiz questions & ideas
app.post('/api/gemini/extract-insights', async (req, res) => {
  try {
    const { content, title, userGoal, customPrompt } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const client = getGeminiClient();
    if (!client) {
      // Return structured deterministic analysis if API key is not yet configured
      return res.json({
        source: 'local-heuristic',
        insights: [
          `Key core focus on "${title || 'YouTube Study Clip'}": local workflow, rapid iteration, and verifying code outputs.`,
          'Highlights developer empowerment: reducing dependency on proprietary black-boxes by building minimalist, CPU-friendly utilities.',
          'Emphasizes verifiable checkpoints between prompting and downstream execution.',
        ],
        takeaways: [
          'Store and structure your learning materials locally for high retention.',
          'Always keep a tight feedback loop when coding alongside AI assistants.',
          'Isolate new experimental code into clean subdirectories to prevent repository breakage.',
        ],
        questions: [
          'How can this workflow be extended to automate flashcard generation in Obsidian?',
          'What are the edge cases when transcribing audio with non-standard accents or high noise?',
          'How can multiple AIs collaborate on the same repository without colliding?',
        ],
        mindMap: [
          { node: title || 'Core Video Concept', children: ['Foundational Concepts', 'Practical Workflow', 'Troubleshooting & Verifications'] },
        ],
        note: 'Generated in offline heuristic mode. Configure your GEMINI_API_KEY in AI Studio Secrets for live Gemini 2.5/Flash deep reasoning.',
      });
    }

    const systemPrompt = `You are an elite research assistant and knowledge curator for "learn-better", an ecosystem that turns YouTube content and coding workflows into a personal knowledge hub.
Analyze the following video summary, transcript, or user note.

Format your response as strict JSON with this shape:
{
  "insights": ["3-5 deep, high-value insights"],
  "takeaways": ["3-4 actionable one-sentence rules"],
  "questions": ["3 thought-provoking questions to test comprehension or spark new ideas"],
  "mindMap": [
    {"node": "Central Concept", "children": ["Sub-concept 1", "Sub-concept 2", "Sub-concept 3"]}
  ],
  "suggestedPrompts": ["2-3 ready-to-use prompts the user can give to Claude, Kiro, or Gemini to build related tools"]
}
`;

    const userMessage = `Title: ${title || 'Untitled'}\nUser Goal: ${userGoal || 'Personal Knowledge Hub Extraction'}\n\nContent:\n${content}\n\n${customPrompt ? `Additional Instructions: ${customPrompt}` : ''}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = { raw: text };
    }

    res.json({
      source: 'gemini-3.8-flash',
      ...parsedData,
    });
  } catch (err: any) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Gemini API: Vibe Coding Co-Pilot & Prompt Optimizer
app.post('/api/gemini/vibe-pilot', async (req, res) => {
  try {
    const { idea, currentAssistant, stage } = req.body;
    const client = getGeminiClient();

    if (!client) {
      return res.json({
        optimizedPrompt: `I am developing a new feature for learn-better. Here is my target outcome: ${idea || 'create a new tool'}. Write a single, focused Python or TypeScript script placed strictly inside a new folder. Include test instructions and an explicit verify command.`,
        antiPatternWarning: 'Avoid dumping multiple unverified requests in one prompt. Ensure you verify the file output before proceeding to the next step.',
        suggestedNextSteps: [
          'Verify that input and output file paths match the existing conventions.',
          'Run the script on a single test item before running batch mode.',
          'Commit or stage the changes to a dedicated feature branch.',
        ],
      });
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are a master mentor in "AI-Assisted Vibe Coding". The user wants to build: "${idea}". 
Current assistant targeted: "${currentAssistant || 'Gemini/Claude/Kiro'}". 
Stage of project: "${stage || 'Ideation'}".

Provide a JSON object with:
1. "optimizedPrompt": A crystal-clear, high-leverage prompt with input/output contract, constraints, and verification check.
2. "antiPatternWarning": What common trap or mistake to avoid for this specific task.
3. "suggestedNextSteps": 3 sequential micro-steps.`,
      config: {
        responseMimeType: 'application/json',
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Vibe pilot error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
