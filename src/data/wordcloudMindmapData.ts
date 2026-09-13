import { MindMapNode, PlaylistWordCloudData, Playlist } from '../types';

export const INTELLIGENCE_WORD_CLOUD: PlaylistWordCloudData = {
  source: 'playlist:PL_intelligence_proof_of_concept (12 clips merged)',
  playlistId: 'PL_intelligence_proof_of_concept',
  playlistTitle: 'Intelligence',
  totalTokens: 42680,
  uniqueWords: 3840,
  clipCount: 12,
  generatedAt: new Date().toISOString(),
  words: [
    { text: 'intelligence', weight: 248, category: 'Core Domain', context: 'Synthetic and biological intelligence systems', clipCount: 12 },
    { text: 'neural', weight: 215, category: 'Architecture', context: 'Neural network layers, weights, and artificial neuron models', clipCount: 10 },
    { text: 'models', weight: 198, category: 'Architecture', context: 'Large language models and open weight foundation models', clipCount: 9 },
    { text: 'learning', weight: 184, category: 'Algorithms', context: 'Deep learning, reinforcement learning, and representation', clipCount: 11 },
    { text: 'weights', weight: 162, category: 'Architecture', context: 'Parameter matrices, quantization, and open weight distribution', clipCount: 8 },
    { text: 'tokens', weight: 149, category: 'NLP & LLMs', context: 'Tokenization, context window capacity, and token throughput', clipCount: 7 },
    { text: 'network', weight: 141, category: 'Architecture', context: 'Computational graph topology and interconnected nodes', clipCount: 10 },
    { text: 'training', weight: 135, category: 'Algorithms', context: 'Gradient descent convergence, pretraining, and fine-tuning', clipCount: 8 },
    { text: 'transformer', weight: 128, category: 'NLP & LLMs', context: 'Causal self-attention, encoder-decoder, and nanoGPT', clipCount: 6 },
    { text: 'data', weight: 122, category: 'Foundations', context: 'Curated corpora, synthetic training distributions, and benchmarks', clipCount: 9 },
    { text: 'attention', weight: 114, category: 'NLP & LLMs', context: 'Scaled dot-product attention and multi-head key-query-value', clipCount: 5 },
    { text: 'reasoning', weight: 109, category: 'Cognition', context: 'Chain-of-thought, test-time compute, and formal logic', clipCount: 7 },
    { text: 'artificial', weight: 105, category: 'Core Domain', context: 'Artificial general intelligence and synthetic cognition', clipCount: 11 },
    { text: 'compute', weight: 98, category: 'Hardware', context: 'FLOPs scaling, training cluster efficiency, and power bounds', clipCount: 8 },
    { text: 'agents', weight: 94, category: 'Cognition', context: 'Autonomous cyclical graph agents, tool execution, and loops', clipCount: 6 },
    { text: 'human', weight: 91, category: 'Cognition', context: 'Human cognitive symbiosis, biological brain, and intuition', clipCount: 9 },
    { text: 'parameters', weight: 87, category: 'Architecture', context: 'Billion-scale parameter counts and low-rank adaptation', clipCount: 7 },
    { text: 'layers', weight: 83, category: 'Architecture', context: 'Residual depth, normalization layers, and feedforward blocks', clipCount: 7 },
    { text: 'inference', weight: 79, category: 'Hardware', context: 'Low-latency token generation, KV caching, and batching', clipCount: 8 },
    { text: 'genetics', weight: 76, category: 'Biology', context: 'Polygenic trait scores, heritability, and biological wiring', clipCount: 4 },
    { text: 'gradient', weight: 74, category: 'Algorithms', context: 'Vanishing gradient dynamics, backpropagation, and clipping', clipCount: 6 },
    { text: 'chips', weight: 71, category: 'Hardware', context: 'Silicon processors, wafer-scale engines, and microarchitecture', clipCount: 5 },
    { text: 'loss', weight: 68, category: 'Algorithms', context: 'Cross-entropy loss landscape, regularization, and convergence', clipCount: 6 },
    { text: 'optimization', weight: 65, category: 'Algorithms', context: 'AdamW optimizer, learning rate schedules, and warmup', clipCount: 6 },
    { text: 'biological', weight: 63, category: 'Biology', context: 'Synaptic plasticity, biological plausibility, and evolution', clipCount: 5 },
    { text: 'cognition', weight: 61, category: 'Cognition', context: 'Mental representation, perceptual grounding, and synthesis', clipCount: 7 },
    { text: 'recurrent', weight: 59, category: 'Architecture', context: 'Hidden state feedback, sequence modeling, and time steps', clipCount: 4 },
    { text: 'economics', weight: 58, category: 'Economics', context: 'Capital deepening, labor substitution, and productivity gains', clipCount: 4 },
    { text: 'silicon', weight: 56, category: 'Hardware', context: 'Semiconductor fabrication, thermal limits, and lithography', clipCount: 5 },
    { text: 'groq', weight: 54, category: 'Hardware', context: 'LPU Tensor Streaming Processors and SRAM deterministic latency', clipCount: 3 },
    { text: 'architecture', weight: 52, category: 'Architecture', context: 'System layout, modular components, and pipeline topology', clipCount: 7 },
    { text: 'context', weight: 51, category: 'NLP & LLMs', context: 'In-context learning, prompt conditioning, and recall', clipCount: 6 },
    { text: 'generation', weight: 49, category: 'NLP & LLMs', context: 'Autoregressive sampling, temperature, and top-p decoding', clipCount: 6 },
    { text: 'backpropagation', weight: 48, category: 'Algorithms', context: 'Chain rule derivative propagation through computational graph', clipCount: 5 },
    { text: 'graph', weight: 46, category: 'Cognition', context: 'State machines, control flow graphs, and cyclic agent trees', clipCount: 4 },
    { text: 'embedding', weight: 45, category: 'NLP & LLMs', context: 'High-dimensional vector space, cosine similarity, and semantics', clipCount: 5 },
    { text: 'hinton', weight: 43, category: 'Foundations', context: 'Geoffrey Hinton, capsule networks, and forward-forward algorithms', clipCount: 3 },
    { text: 'neurons', weight: 42, category: 'Architecture', context: 'Artificial and biological nodes, non-linear firing thresholds', clipCount: 5 },
    { text: 'tpu', weight: 40, category: 'Hardware', context: 'Google Tensor Processing Units and systolic array matrix multipliers', clipCount: 4 },
    { text: 'gpu', weight: 39, category: 'Hardware', context: 'Nvidia CUDA architecture, tensor cores, and SIMD parallel threads', clipCount: 5 },
    { text: 'memory', weight: 38, category: 'Hardware', context: 'High bandwidth memory (HBM3), SRAM capacity, and memory bus', clipCount: 5 },
    { text: 'evolution', weight: 37, category: 'Biology', context: 'Phylogenetic origins of intelligence and natural selection', clipCount: 3 },
    { text: 'symbiont', weight: 36, category: 'Cognition', context: 'Co-evolutionary intelligence, human-in-the-loop, and synergy', clipCount: 3 },
    { text: 'cost', weight: 35, category: 'Economics', context: 'Token pricing, capital expenditure per gigawatt, and ROI', clipCount: 4 },
    { text: 'scale', weight: 34, category: 'Foundations', context: 'Chinchilla scaling laws, compute budgets, and parameter volume', clipCount: 5 },
    { text: 'deep', weight: 33, category: 'Architecture', context: 'Hierarchical deep representations and feature abstraction', clipCount: 6 },
    { text: 'activation', weight: 32, category: 'Algorithms', context: 'GELU, SwiGLU, and non-linear activation functions', clipCount: 4 },
    { text: 'scratch', weight: 31, category: 'Foundations', context: 'First-principles implementation of tokenizers and transformer code', clipCount: 3 },
    { text: 'skills', weight: 30, category: 'Cognition', context: 'Modular tool capabilities, prompt skills, and MCP servers', clipCount: 3 },
    { text: 'synthesis', weight: 29, category: 'Core Domain', context: 'Integrating multi-modal evidence into unified insights', clipCount: 5 }
  ]
};

export const INTELLIGENCE_MINDMAP: MindMapNode = {
  id: 'root-intelligence',
  label: 'Intelligence: Biological to Synthetic',
  level: 1,
  description: 'A 3-tier synthesis spanning evolutionary biology, neural mathematics, transformer architectures, hardware silicon, and macroeconomic cognitive labor.',
  color: '#6366f1',
  children: [
    {
      id: 'branch-origins',
      label: 'Origins & Biological Foundations',
      level: 2,
      description: 'Phylogenetic emergence, genetics, synaptic plasticity, and biological constraints on intelligence.',
      color: '#10b981',
      children: [
        {
          id: 'node-chemotaxis',
          label: 'Cellular Chemotaxis to Neural Simulation',
          level: 3,
          description: 'How predictive internal modeling emerged from primitive stimulus-response loops in living organisms.',
          clipId: 'G5sxVf9K-_c',
          clipTitle: 'Chapter 1: When Did Intelligence Begin',
          channel: 'The Symbiont',
          duration: '18:24',
          keyTakeaway: 'Intelligence evolved not as abstract logic, but as an energy-efficient predictive engine to anticipate environmental shifts.',
          keywords: ['intelligence', 'evolution', 'biological', 'cognition']
        },
        {
          id: 'node-genetics',
          label: 'Genetic Heritability & Polygenic Scores',
          level: 3,
          description: 'The genomic architecture of brain development, synapse density, and cognitive plasticity.',
          clipId: 'X847teCz1pQ',
          clipTitle: 'Does intelligence have a basis in genetics? | Manolis Kellis & Lex Fridman',
          channel: 'Lex Clips',
          duration: '14:35',
          keyTakeaway: 'Cognitive traits are polygenic, shaped by thousands of minor-effect regulatory variants governing synaptic pruning and axonal insulation.',
          keywords: ['genetics', 'biological', 'human', 'evolution']
        },
        {
          id: 'node-symbiosis',
          label: 'Living Intelligence & Cognitive Symbiosis',
          level: 3,
          description: 'Coupling organic brain heuristics with synthetic reasoning into an integrated extended cognitive organ.',
          clipId: '0Vg7DWNc694',
          clipTitle: 'The Symbiont: Rise of Living Intelligence',
          channel: 'The Symbiont',
          duration: '22:15',
          keyTakeaway: 'Synthetic intelligence will not stand isolated as an alien entity; it forms a symbiotic cognitive prosthesis with human intent.',
          keywords: ['symbiont', 'cognition', 'human', 'synthesis']
        }
      ]
    },
    {
      id: 'branch-neural-math',
      label: 'Mathematical & Neural Architectures',
      level: 2,
      description: 'From gradient descent and loss surfaces to recurrent sequence dynamics and capsule routing.',
      color: '#3b82f6',
      children: [
        {
          id: 'node-deep-foundations',
          label: 'Deep Learning & Loss Surface Topography',
          level: 3,
          description: 'Perceptrons, backpropagation gradients, AdamW optimization, and escaping saddle points in high dimensions.',
          clipId: 'O5xeyoRL95U',
          clipTitle: 'Deep Learning Basics: Introduction and Overview',
          channel: 'Lex Fridman',
          duration: '68:40',
          keyTakeaway: 'Overparameterized networks reshape catastrophic local minima into connected valleys, enabling SGD to reliably converge.',
          keywords: ['learning', 'neural', 'gradient', 'loss', 'optimization']
        },
        {
          id: 'node-recurrent-math',
          label: 'Recurrent Neural Dynamics & Hidden Vectors',
          level: 3,
          description: 'Mathematical derivation of hidden state vector propagation over discrete time steps and gating dynamics.',
          clipId: 'BwmddtPFWtA',
          clipTitle: 'Recurrent Neural Network - The Math of Intelligence',
          channel: 'Siraj Raval',
          duration: '12:48',
          keyTakeaway: 'Recurrence computes temporal state transitions, but suffers from exponential gradient decay that paved the way for attention.',
          keywords: ['recurrent', 'network', 'math', 'gradient']
        },
        {
          id: 'node-hinton-capsules',
          label: 'Capsule Networks & Biological Plausibility',
          level: 3,
          description: 'Geoffrey Hinton critique of backpropagation and vector capsules with coordinate frame routing.',
          clipId: 'AyzOUbkUf3M',
          clipTitle: 'The Next Generation of Neural Networks | Geoffrey Hinton',
          channel: 'Google Tech Talks',
          duration: '58:10',
          keyTakeaway: 'Routing-by-agreement preserves rotational equivariance and spatial part-whole relationships without exhaustive data augmentation.',
          keywords: ['hinton', 'neurons', 'backpropagation', 'layers']
        }
      ]
    },
    {
      id: 'branch-llm-agents',
      label: 'Generative Foundation Models & Agents',
      level: 2,
      description: 'Causal self-attention, first-principles nanoGPT, open weight distribution, and cyclic agent graphs.',
      color: '#8b5cf6',
      children: [
        {
          id: 'node-nanogpt',
          label: 'nanoGPT: Transformers from First Principles',
          level: 3,
          description: 'Coding token embeddings, scaled dot-product attention (QKV), and residual layernorms in PyTorch.',
          clipId: 'YmLp8qe87A0',
          clipTitle: 'I Built an LLM From Scratch',
          channel: 'Andrej Karpathy',
          duration: '31:05',
          keyTakeaway: 'Self-attention allows every token to broadcast its query and pool representations from relevant keys in parallel tensor operations.',
          keywords: ['transformer', 'scratch', 'tokens', 'attention', 'weights']
        },
        {
          id: 'node-open-weights',
          label: 'Open Weight Democratization & Quantization',
          level: 3,
          description: 'Taxonomy of open weights vs closed API blackboxes: GGUF/AWQ quantization and local consumer execution.',
          clipId: 'a-Lj9moBlqE',
          clipTitle: 'Open Weight AI Models Explained for Everyone',
          channel: 'AI Explained',
          duration: '19:40',
          keyTakeaway: 'Quantizing 16-bit floating point weights into 4-bit integers compresses memory footprint by 75% with under 1% loss in reasoning fidelity.',
          keywords: ['models', 'weights', 'parameters', 'scale']
        },
        {
          id: 'node-agent-graphs',
          label: 'Cyclic Agent Graphs & State Machines',
          level: 3,
          description: 'Replacing brittle linear prompt chains with directed cyclic graphs, persistent state, and self-correcting routers.',
          clipId: 'IMLwvK08JVc',
          clipTitle: 'You Can Learn AI Agent Graph Engineering In 21 Min',
          channel: 'IndyDevDan',
          duration: '21:18',
          keyTakeaway: 'Reliable agentic execution requires finite state machines and deterministic evaluators to bound non-deterministic LLM drift.',
          keywords: ['agents', 'graph', 'reasoning', 'skills']
        },
        {
          id: 'node-modular-skills',
          label: 'Modular Skill Tooling vs Prompt Bloat',
          level: 3,
          description: 'Architecting dynamic context loading and sandboxed execution tools rather than oversized monolithic prompts.',
          clipId: 'up0Bsf3f0Xc',
          clipTitle: "Claude Skills: I Stopped Installing Them. Here's What I Do Instead",
          channel: 'Prompt Engineering',
          duration: '16:32',
          keyTakeaway: 'Targeted CLI tools and surgical schema definitions outperform passive context dumps in reasoning tasks.',
          keywords: ['skills', 'context', 'synthesis', 'generation']
        }
      ]
    },
    {
      id: 'branch-hardware',
      label: 'Hardware, Silicon & Compute Scaling',
      level: 2,
      description: 'Semiconductor architecture, memory bandwidth wall (SRAM vs HBM), Groq LPUs, and parallel FLOPs.',
      color: '#f59e0b',
      children: [
        {
          id: 'node-memory-wall',
          label: 'The Memory Bandwidth Wall: SRAM vs HBM',
          level: 3,
          description: 'Why token generation speed is bottlenecked by byte-per-second memory bandwidth rather than peak FLOP calculations.',
          clipId: 'gE8SvBqMf8o',
          clipTitle: 'AI Chip Wars: LPUs, TPUs & GPUs w/ Jonathan Ross',
          channel: 'The AI Breakdown',
          duration: '26:15',
          keyTakeaway: 'Inference requires streaming entire model weight tensors per token; on-chip SRAM eliminates memory bus transfer latency.',
          keywords: ['memory', 'inference', 'silicon', 'chips', 'compute']
        },
        {
          id: 'node-deterministic-lpu',
          label: 'Deterministic LPUs vs GPU SIMD Pipelines',
          level: 3,
          description: 'Compiler-orchestrated instruction scheduling on Groq LPUs providing sub-second token streaming for voice and real-time agents.',
          clipId: 'gE8SvBqMf8o',
          clipTitle: 'AI Chip Wars: LPUs, TPUs & GPUs w/ Jonathan Ross',
          channel: 'The AI Breakdown',
          duration: '26:15',
          keyTakeaway: 'Removing speculative execution and hardware caches yields deterministic microsecond token intervals essential for conversational voice.',
          keywords: ['groq', 'chips', 'tpu', 'gpu', 'compute']
        }
      ]
    },
    {
      id: 'branch-economics',
      label: 'Macro-Economics & Societal Impact',
      level: 2,
      description: 'Capital deepening, labor displacement vs augmentation, Baumol cost disease, and rent capture in foundation models.',
      color: '#ec4899',
      children: [
        {
          id: 'node-capital-deepening',
          label: 'Productivity Paradoxes & Capital Deepening',
          level: 3,
          description: 'Tyler Cowen analysis of adoption curves, institutional restructuring delays, and returns to cognitive variance.',
          clipId: 'XSy7ry-x5pA',
          clipTitle: 'The Economics of Artificial Intelligence | Tyler Cowen',
          channel: 'Conversations with Tyler',
          duration: '44:12',
          keyTakeaway: 'General purpose technologies (GPTs) require decades of structural workflow reorganization before showing up in aggregate GDP stats.',
          keywords: ['economics', 'cost', 'human', 'scale']
        },
        {
          id: 'node-ip-distribution',
          label: 'Intellectual Rent Capture & Training Corpora',
          level: 3,
          description: 'The conflict between public domain / creator data ingestion and centralized model weight capitalization.',
          clipId: 'mudigpnq4yk',
          clipTitle: 'AI Is Stealing From You',
          channel: 'AI Explained',
          duration: '20:10',
          keyTakeaway: 'Capturing human cultural output into model weights shifts economic leverage from labor creators to compute infrastructure owners.',
          keywords: ['economics', 'cost', 'synthesis', 'data']
        }
      ]
    }
  ]
};

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while',
  'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  // Common video/noise words
  'video', 'watch', 'like', 'subscribe', 'channel', 'part', 'episode', 'youtube', 'clip', 'tutorial', 'full', 'guide',
  'using', 'make', 'get', 'use', 'new', 'one', 'two', 'also', 'just', 'see', 'way', 'need', 'well', 'first', 'let'
]);

export function computePlaylistWordCloud(playlist: Playlist): PlaylistWordCloudData {
  if (playlist.id === 'PL_intelligence_proof_of_concept' || playlist.title.toLowerCase() === 'intelligence') {
    return INTELLIGENCE_WORD_CLOUD;
  }

  // Aggregate text from title, description, and all clips
  const textCorpus: string[] = [
    playlist.title,
    playlist.description || '',
    ...playlist.clips.map(c => `${c.title} ${c.tags.join(' ')} ${c.notes || ''} ${(c.userQuestions || []).join(' ')}`)
  ];

  const fullText = textCorpus.join(' ').toLowerCase();
  const tokens = fullText.match(/[a-zA-Z]{3,}/g) || [];
  const frequencies = new Map<string, number>();

  tokens.forEach(token => {
    if (!STOP_WORDS.has(token) && token.length > 2) {
      frequencies.set(token, (frequencies.get(token) || 0) + 1);
    }
  });

  const sortedWords = Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([text, rawCount]) => {
      // Find how many clips mention this word
      const clipCount = playlist.clips.filter(c => 
        (c.title + ' ' + (c.notes || '') + ' ' + c.tags.join(' ')).toLowerCase().includes(text)
      ).length || 1;

      return {
        text,
        weight: Math.max(12, Math.min(240, rawCount * 8 + clipCount * 5)),
        category: 'Keyword',
        context: `Appears across ${clipCount} clip(s) in "${playlist.title}"`,
        clipCount
      };
    });

  // If fewer than 10 words, backfill with meaningful terms from clips
  if (sortedWords.length < 10) {
    playlist.clips.forEach(c => {
      c.tags.forEach(tag => {
        if (!sortedWords.some(w => w.text === tag.toLowerCase()) && tag.length > 2) {
          sortedWords.push({
            text: tag.toLowerCase(),
            weight: 35,
            category: 'Tag',
            context: `Tag from ${c.title}`,
            clipCount: 1
          });
        }
      });
    });
  }

  return {
    source: `playlist:${playlist.id} (${playlist.clips.length} clips merged)`,
    playlistId: playlist.id,
    playlistTitle: playlist.title,
    totalTokens: tokens.length || 150,
    uniqueWords: frequencies.size || sortedWords.length,
    clipCount: playlist.clips.length,
    generatedAt: new Date().toISOString(),
    words: sortedWords.slice(0, 50)
  };
}

export function generatePlaylistMindMap(playlist: Playlist): MindMapNode {
  if (playlist.id === 'PL_intelligence_proof_of_concept' || playlist.title.toLowerCase() === 'intelligence') {
    return INTELLIGENCE_MINDMAP;
  }

  // Partition clips into 3-4 thematic buckets based on tags or sequence
  const clips = playlist.clips;
  const bucketSize = Math.max(1, Math.ceil(clips.length / 3));
  
  const pillars = [
    { title: 'Foundational Overview & Prerequisites', color: '#10b981', clips: clips.slice(0, bucketSize) },
    { title: 'Core Mechanics & Practical Applications', color: '#3b82f6', clips: clips.slice(bucketSize, bucketSize * 2) },
    { title: 'Advanced Workflows & Synthesis', color: '#8b5cf6', clips: clips.slice(bucketSize * 2) }
  ].filter(p => p.clips.length > 0);

  return {
    id: `root-${playlist.id}`,
    label: playlist.title,
    level: 1,
    description: playlist.description || `Comprehensive 3-tier study mindmap for playlist "${playlist.title}" containing ${clips.length} clip(s).`,
    color: '#6366f1',
    children: pillars.map((pillar, pIdx) => ({
      id: `pillar-${playlist.id}-${pIdx}`,
      label: pillar.title,
      level: 2 as const,
      description: `Thematic grouping containing ${pillar.clips.length} video module(s).`,
      color: pillar.color,
      children: pillar.clips.map((clip, cIdx) => ({
        id: `node-${clip.id}-${cIdx}`,
        label: clip.title.length > 48 ? clip.title.slice(0, 45) + '...' : clip.title,
        level: 3 as const,
        description: clip.notes || `Curriculum lesson by ${clip.channel} focusing on ${clip.tags.join(', ') || playlist.title}.`,
        clipId: clip.id,
        clipTitle: clip.title,
        channel: clip.channel,
        duration: clip.duration || '10:00',
        keyTakeaway: clip.notes ? clip.notes.slice(0, 140) : `Key study material on ${clip.tags.join(', ') || playlist.title}.`,
        keywords: clip.tags.length ? clip.tags : [playlist.title.toLowerCase()]
      }))
    }))
  };
}
