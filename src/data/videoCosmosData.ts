import { Playlist, YouTubeClip, CosmosVideoNode, CosmosTrajectoryVoyage } from '../types';
import { findClusterForPlaylistTitle, RESTRUCTURE_CLUSTERS } from './playlistRestructureData';

export const CATEGORY_COLORS: Record<string, string> = {
  'AI & Machine Learning': '#38bdf8', // Cyan
  'Engineering & Code': '#34d399',    // Emerald
  'Science & Mathematics': '#fbbf24', // Amber
  'Lifestyle & General': '#fb7185',   // Rose
  'Knowledge & Notes': '#c084fc',     // Purple
};

export const CATEGORY_GLOWS: Record<string, string> = {
  'AI & Machine Learning': 'rgba(56, 189, 248, 0.4)',
  'Engineering & Code': 'rgba(52, 211, 153, 0.4)',
  'Science & Mathematics': 'rgba(251, 191, 36, 0.4)',
  'Lifestyle & General': 'rgba(251, 113, 133, 0.4)',
  'Knowledge & Notes': 'rgba(192, 132, 252, 0.4)',
};

// Sector layout for galactic clustering
const CATEGORY_ANGLES: Record<string, number> = {
  'AI & Machine Learning': 0,
  'Engineering & Code': (2 * Math.PI) / 5,
  'Science & Mathematics': (4 * Math.PI) / 5,
  'Lifestyle & General': (6 * Math.PI) / 5,
  'Knowledge & Notes': (8 * Math.PI) / 5,
};

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'or', 'is', 'are', 'was', 'with', 'how', 'what', 'why', 'by', 'from', 'this', 'that', 'your', 'you', 'it', 'part', 'full', 'video', 'episode', 'vs', 'de', 'la', 'tutorial', 'course', 'guide', '|', '-', '&', 'intro', 'overview'
]);

function extractKeywords(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

// Deterministic pseudo-random based on string seed
function seededRandom(seedStr: string): () => number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Generate contextual key insights for a video
function generateInsightsForVideo(
  clip: YouTubeClip,
  clusterTitle: string,
  category: string
): string[] {
  const title = clip.title;
  const channel = clip.channel;
  const insights: string[] = [];

  if (clip.summary && clip.summary.length > 30) {
    insights.push(clip.summary);
  } else {
    insights.push(`Architectural exploration of "${title}" curated by ${channel || 'Specialist'}.`);
  }

  // Domain-specific heuristic insights
  if (category === 'AI & Machine Learning') {
    if (title.toLowerCase().includes('agent') || title.toLowerCase().includes('cursor') || title.toLowerCase().includes('cline') || title.toLowerCase().includes('code')) {
      insights.push('Emphasizes prompt grounding, feedback loops, and automated tool-calling patterns in developer IDE workflows.');
      insights.push('Highlights the reduction of cognitive load by letting models handle boilerplate while engineers supervise architecture.');
    } else if (title.toLowerCase().includes('whisper') || title.toLowerCase().includes('audio') || title.toLowerCase().includes('voice')) {
      insights.push('Explores acoustic tokenization, spectrogram feature extraction, and low-latency speech transcription pipelines.');
      insights.push('Demonstrates the shift from robotic text-to-speech to natural human cadence and vocal inflection.');
    } else {
      insights.push(`Key pillar inside ${clusterTitle}: foundational models, parameter scaling, and transformer attention dynamics.`);
      insights.push('Addresses model distillation, test-time compute, and cost-efficient inference trade-offs.');
    }
  } else if (category === 'Engineering & Code') {
    insights.push('Demonstrates modular codebase structure, strict type safety, and clean separation of concerns.');
    insights.push('Focuses on benchmarked runtime performance, fast tooling pipelines, and reproducible dependency isolation.');
  } else if (category === 'Science & Mathematics') {
    insights.push('Examines foundational principles, emergent complexity, and mathematical abstractions in natural and synthetic systems.');
    insights.push('Bridges biological neuro-computational paradigms with contemporary algorithmic architectures.');
  } else {
    insights.push(`Core conceptual synthesis within the "${clusterTitle}" knowledge domain.`);
    insights.push('Actionable mental models to integrate into daily workflows and strategic problem solving.');
  }

  if (clip.notes) {
    insights.push(`Personal Study Note: "${clip.notes}"`);
  }

  return insights;
}

// Generate contextual key references for a video
function generateReferencesForVideo(
  clip: YouTubeClip,
  clusterTitle: string,
  category: string
): CosmosVideoNode['keyReferences'] {
  const title = clip.title.toLowerCase();
  const refs: CosmosVideoNode['keyReferences'] = [];

  // Thinker / Author references
  if (title.includes('kellis') || title.includes('manolis')) {
    refs.push({
      type: 'Author/Thinker',
      title: 'Prof. Manolis Kellis (MIT)',
      detail: 'Computational Biologist & MIT Computer Science and Artificial Intelligence Lab (CSAIL).'
    });
    refs.push({
      type: 'Concept',
      title: 'Polygenic Architecture & Trait Genetics',
      detail: 'Epigenetic mechanisms and biological networks underlying complex traits.'
    });
  } else if (title.includes('fridman') || title.includes('lex')) {
    refs.push({
      type: 'Author/Thinker',
      title: 'Lex Fridman (MIT)',
      detail: 'Host of the Lex Fridman Podcast, AI and robotics researcher.'
    });
  } else if (title.includes('karpathy') || title.includes('nanogpt')) {
    refs.push({
      type: 'Author/Thinker',
      title: 'Andrej Karpathy (Eureka Labs / ex-Tesla AI)',
      detail: 'Author of nanoGPT, micrograd, and pioneer in accessible deep learning pedagogy.'
    });
    refs.push({
      type: 'Tool/Library',
      title: 'nanoGPT / PyTorch',
      detail: 'Minimalist, fast repository for training/finetuning medium-sized GPTs.'
    });
  } else if (title.includes('lecun') || title.includes('yann')) {
    refs.push({
      type: 'Author/Thinker',
      title: 'Yann LeCun (Meta Chief AI Scientist)',
      detail: 'Turing Award laureate, inventor of CNNs and pioneer of Joint Embedding Predictive Architectures (JEPA).'
    });
  } else if (title.includes('hinton') || title.includes('geoffrey')) {
    refs.push({
      type: 'Author/Thinker',
      title: 'Geoffrey Hinton',
      detail: 'Nobel & Turing Laureate, godfather of backpropagation and deep artificial neural networks.'
    });
  }

  // Tool / Library references
  if (title.includes('cursor') || title.includes('cline') || title.includes('vibe')) {
    refs.push({
      type: 'Tool/Library',
      title: 'Cursor IDE & Model Context Protocol (MCP)',
      detail: 'AI-first code editor built on VS Code with direct codebase indexing.'
    });
    refs.push({
      type: 'Concept',
      title: 'Vibe Coding Methodology',
      detail: 'Spec-first and prompt-guided autonomous scaffolding paired with human architectural oversight.'
    });
  } else if (title.includes('whisper')) {
    refs.push({
      type: 'Paper',
      title: 'Robust Speech Recognition via Large-Scale Weak Supervision (Radford et al., 2022)',
      detail: 'OpenAI Whisper research foundation for multilingual speech-to-text models.'
    });
    refs.push({
      type: 'Tool/Library',
      title: 'faster-whisper / Whisper.cpp',
      detail: 'Optimized C++ & CTranslate2 inference engines for quantized on-device execution.'
    });
  } else if (title.includes('polars') || title.includes('pandas')) {
    refs.push({
      type: 'Tool/Library',
      title: 'Polars (Apache Arrow & Rust)',
      detail: 'Lightning-fast DataFrame library utilizing multithreaded vectorization and query optimization.'
    });
    refs.push({
      type: 'Author/Thinker',
      title: 'Ritchie Vink (Polars Creator)',
      detail: 'Architect of columnar memory memory-efficient dataframes in Rust.'
    });
  } else if (title.includes('ruff') || title.includes('python')) {
    refs.push({
      type: 'Tool/Library',
      title: 'Ruff & uv (Astral Software)',
      detail: 'Extremely fast Python linter and package manager written in Rust, replacing Flake8, Black, and pip.'
    });
  }

  // Foundational domain references
  if (category === 'AI & Machine Learning') {
    refs.push({
      type: 'Paper',
      title: 'Attention Is All You Need (Vaswani et al., 2017)',
      detail: 'The breakthrough paper introducing the Transformer self-attention architecture.'
    });
    refs.push({
      type: 'Concept',
      title: 'The Bitter Lesson (Rich Sutton, 2019)',
      detail: 'General methods that leverage computation (search & learning) ultimately triumph over human-crafted rules.'
    });
  } else if (category === 'Science & Mathematics') {
    refs.push({
      type: 'Concept',
      title: 'Cybernetics & Ashby\'s Law of Requisite Variety',
      detail: 'A system must possess as much internal variety as the disturbances in its operating environment.'
    });
  }

  return refs;
}

// Build the complete cosmic graph from playlists
export function buildVideoCosmosGraph(playlists: Playlist[]): {
  nodes: CosmosVideoNode[];
  categoryClusters: Array<{ category: string; count: number; color: string; angle: number }>;
} {
  const nodesMap = new Map<string, CosmosVideoNode>();
  const categoryCounts: Record<string, number> = {};

  // 1. Deduplicate clips across all playlists and initialize base properties
  playlists.forEach(pl => {
    const cluster = findClusterForPlaylistTitle(pl.title);
    const category = cluster.category;
    const catColor = CATEGORY_COLORS[category] || '#38bdf8';

    categoryCounts[category] = (categoryCounts[category] || 0);

    pl.clips?.forEach(clip => {
      if (!nodesMap.has(clip.id)) {
        categoryCounts[category] += 1;

        const rand = seededRandom(clip.id);
        const catAngle = CATEGORY_ANGLES[category] || 0;
        
        // Arrange in cosmic galaxy quadrants with celestial spread
        const clusterOffsetAngle = (rand() - 0.5) * 0.9;
        const finalAngle = catAngle + clusterOffsetAngle;
        const distance = 420 + rand() * 480; // Distance from galactic center
        
        const initialX = Math.cos(finalAngle) * distance;
        const initialY = Math.sin(finalAngle) * distance;

        nodesMap.set(clip.id, {
          id: clip.id,
          title: clip.title,
          channel: clip.channel || 'Educational Creator',
          duration: clip.duration || '--:--',
          originalPlaylistTitle: pl.title,
          clusterId: cluster.id,
          clusterTitle: cluster.title,
          category,
          categoryColor: catColor,
          tags: Array.from(new Set([...(clip.tags || []), pl.title, cluster.title])),
          status: clip.status || 'to-watch',
          notes: clip.notes,
          summary: clip.summary,
          x: initialX,
          y: initialY,
          vx: (rand() - 0.5) * 0.2,
          vy: (rand() - 0.5) * 0.2,
          radius: 8 + (clip.status === 'synthesized' || clip.status === 'mastered' ? 4 : 0),
          mass: 1,
          relatedVideoIds: [],
          keyInsights: generateInsightsForVideo(clip, cluster.title, category),
          keyReferences: generateReferencesForVideo(clip, cluster.title, category)
        });
      }
    });
  });

  const nodes = Array.from(nodesMap.values());

  // 2. Precompute semantic relationships and top closest related videos
  const nodeKeywords = new Map<string, Set<string>>();
  nodes.forEach(n => {
    nodeKeywords.set(n.id, new Set(extractKeywords(n.title + ' ' + n.tags.join(' '))));
  });

  nodes.forEach(nodeA => {
    const kwA = nodeKeywords.get(nodeA.id)!;
    const scores: Array<{ id: string; score: number }> = [];

    nodes.forEach(nodeB => {
      if (nodeA.id === nodeB.id) return;

      let score = 0;
      // Same cluster bonus
      if (nodeA.clusterId === nodeB.clusterId) score += 45;
      // Same channel bonus
      if (nodeA.channel && nodeA.channel === nodeB.channel) score += 30;
      // Same category bonus
      if (nodeA.category === nodeB.category) score += 12;

      // Title & Tag keywords overlap
      const kwB = nodeKeywords.get(nodeB.id)!;
      let sharedCount = 0;
      kwA.forEach(word => {
        if (kwB.has(word)) sharedCount++;
      });
      score += sharedCount * 18;

      if (score > 15) {
        scores.push({ id: nodeB.id, score });
      }
    });

    // Sort by score descending and take top 5 closest related stars
    scores.sort((a, b) => b.score - a.score);
    nodeA.relatedVideoIds = scores.slice(0, 6).map(s => s.id);
  });

  const categoryClusters = Object.entries(CATEGORY_ANGLES).map(([cat, angle]) => ({
    category: cat,
    count: categoryCounts[cat] || 0,
    color: CATEGORY_COLORS[cat] || '#38bdf8',
    angle
  }));

  return { nodes, categoryClusters };
}

// Pre-packaged Curated Celestial Trajectories to showcase the recording & review engine
export const CURATED_VOYAGES: CosmosTrajectoryVoyage[] = [
  {
    id: 'voyage-synth-mind',
    name: 'Voyage Alpha: Biological & Synthetic Mind',
    description: 'A grand conceptual trajectory through genetics, cybernetics, and neural transformer foundations.',
    createdAt: '2026-09-15T14:30:00Z',
    color: '#fbbf24',
    steps: [
      {
        stepIndex: 1,
        videoId: 'tRZGeaHPoaw',
        videoTitle: 'Does intelligence have a basis in genetics? | Manolis Kellis & Lex Fridman',
        clusterTitle: 'Synthetic Cognition & Biological Intelligence',
        timestamp: 1726410600000,
        customNote: 'Genesis node: Exploring the genetic heritability of computational cognitive architectures.'
      },
      {
        stepIndex: 2,
        videoId: 'W3_O8-B4tXg',
        videoTitle: 'How to build neural networks from first principles',
        clusterTitle: 'Neural Networks & Deep Learning',
        timestamp: 1726410660000,
        customNote: 'Bridging biological synapses to artificial computational graphs and matrix calculus.'
      },
      {
        stepIndex: 3,
        videoId: 'kCc8FmEb1nY',
        videoTitle: 'Let\'s build GPT: from scratch, in code, spelled out.',
        clusterTitle: 'LLM Frontier Models & Research',
        timestamp: 1726410720000,
        customNote: 'Full transformer assembly: Multi-head self attention and causal autoregressive generation.'
      },
      {
        stepIndex: 4,
        videoId: 'pXW6y9XzTio',
        videoTitle: 'Cursor AI & Autonomous Vibe Coding Workflows',
        clusterTitle: 'AI Coding Assistants & Vibe Coding',
        timestamp: 1726410780000,
        customNote: 'The modern synthetic symbiont: Software engineering orchestrated with frontier agents.'
      }
    ]
  },
  {
    id: 'voyage-modern-engineer',
    name: 'Voyage Beta: The High-Performance AI Engineer',
    description: 'Fast Python tooling, Rust-accelerated Polars data pipelines, and local whisper audio synthesis.',
    createdAt: '2026-09-15T18:00:00Z',
    color: '#34d399',
    steps: [
      {
        stepIndex: 1,
        videoId: 'v1_ruff_intro',
        videoTitle: 'Ruff: 100x Faster Python Linting & Formatting in Rust',
        clusterTitle: 'Python Core, Environments & Tooling',
        timestamp: 1726423200000,
        customNote: 'Establishing instant feedback loops and zero-overhead code hygiene.'
      },
      {
        stepIndex: 2,
        videoId: 'v2_polars_bench',
        videoTitle: 'Polars vs Pandas 2.0: Lightning Fast Columnar Processing',
        clusterTitle: 'Data Science, Pandas, Polars & SQL',
        timestamp: 1726423260000,
        customNote: 'Vectorized Apache Arrow memory representation for dataset aggregation.'
      },
      {
        stepIndex: 3,
        videoId: 'v3_whisper_voice',
        videoTitle: 'OpenAI Whisper: Local Audio Transcription & Voice Pipeline',
        clusterTitle: 'Speech, Audio AI & Voice Synthesis',
        timestamp: 1726423320000,
        customNote: 'Offline acoustic inference and human-fidelity voice transcription.'
      }
    ]
  }
];
