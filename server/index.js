import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PORT = process.env.PORT || 3001;

const groq = new Groq({ apiKey: GROQ_API_KEY });

// Helper: fetch repo info from GitHub
async function getRepoData(owner, repo) {
  const headers = { Authorization: `token ${GITHUB_TOKEN}` };
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  const [repoRes, treeRes] = await Promise.all([
    axios.get(base, { headers }),
    axios.get(`${base}/git/trees/HEAD?recursive=1`, { headers }),
  ]);

  const repoInfo = repoRes.data;

  // Get README
  let readme = '';
  try {
    const readmeRes = await axios.get(`${base}/readme`, { headers });
    readme = Buffer.from(readmeRes.data.content, 'base64').toString('utf-8');
    readme = readme.slice(0, 1000);
  } catch {
    readme = 'No README found.';
  }

  // Get file tree
  const files = treeRes.data.tree
    .filter(f => f.type === 'blob' && !f.path.includes('node_modules'))
    .map(f => f.path)
    .slice(0, 30);

  return { repoInfo, files, readme };
}

// Helper: ask Groq to explain the repo
async function explainRepo(repoInfo, files, readme) {
  const prompt = `
You are a senior developer. Analyze this GitHub repository and provide a structured explanation.

Repository: ${repoInfo.full_name}
Description: ${repoInfo.description || 'No description'}
Language: ${repoInfo.language}
Stars: ${repoInfo.stargazers_count}

File structure:
${files.join('\n')}

README:
${readme}

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "summary": "2-3 sentence plain English explanation of what this project does",
  "techStack": ["list", "of", "technologies", "used"],
  "structure": "2-3 sentences explaining how the codebase is organized",
  "howToContribute": "2-3 sentences on how a beginner can start contributing",
  "difficulty": "Beginner / Intermediate / Advanced"
}
`;

  const response = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
  });

  const raw = response.choices[0].message.content;
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// Main route
app.post('/analyze', async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: 'repoUrl is required' });
  }

  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid GitHub URL' });
    }

    const owner = match[1];
    const repo = match[2].replace('.git', '');

    const { repoInfo, files, readme } = await getRepoData(owner, repo);
    const explanation = await explainRepo(repoInfo, files, readme);

    res.json({
      name: repoInfo.full_name,
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      language: repoInfo.language,
      explanation,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Something went wrong. Check the repo URL.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});