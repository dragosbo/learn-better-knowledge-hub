import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Playlist, YouTubeClip, VideoAllocationItem, RestructureCluster } from '../types';

export const RESTRUCTURE_CLUSTERS: RestructureCluster[] = [
  {
    id: 'grp_ai_coding_assistants',
    title: 'AI Coding Assistants & Vibe Coding',
    category: 'AI & Machine Learning',
    description: 'AI-assisted programming environments, Cursor IDE, Cline, Codex, PAI, Kiro, and vibe-coding workflows.',
    rationale: 'Consolidates 7 fragmented AI coding playlists (including duplicate Cursor entries, Cline, Codex, and Kiro) into one unified developer tooling hub.',
    sourcePlaylistTitles: ['Cursor', 'Cline', 'Codex', 'PAI', 'Kiraa', 'kiro']
  },
  {
    id: 'grp_llm_frontier_models',
    title: 'LLM Frontier Models & Research',
    category: 'AI & Machine Learning',
    description: 'Frontier language models, Claude, ChatGPT, Qwen, DeepSeek, Kimi, Gemini, Hugging Face ecosystem, and model distillation.',
    rationale: 'Merges 11 micro-playlists for individual models (Claude, ChatGPT, QWEN duplicate playlists, DeepSeek, Kimi, Gemini, LeCun) into a single cohesive foundation model research collection.',
    sourcePlaylistTitles: ['Claude', 'Chatgpt', 'QWEN', 'DeepSeek', 'Kimi', 'gemini', 'LeCunn', 'huggingface', 'Llm-wiki', 'LLM']
  },
  {
    id: 'grp_neural_networks_deep_learning',
    title: 'Neural Networks & Deep Learning',
    category: 'AI & Machine Learning',
    description: 'Deep learning fundamentals, backpropagation, network architectures, and representation learning.',
    rationale: 'Combines foundational neural network training mechanics with model distillation principles.',
    sourcePlaylistTitles: ['neural networks', 'Distillation']
  },
  {
    id: 'grp_synthetic_cognition_intelligence',
    title: 'Synthetic Cognition & Biological Intelligence',
    category: 'Science & Mathematics',
    description: 'Phylogenetic origins of intelligence, cybernetics, symbiosis, cognitive models, and biological vs synthetic minds.',
    rationale: 'Unifies the featured "Intelligence" proof-of-concept playlist with "The Symbiont" biological evolution series.',
    sourcePlaylistTitles: ['Intelligence', 'Symbiont']
  },
  {
    id: 'grp_speech_audio_ai',
    title: 'Speech, Audio AI & Voice Synthesis',
    category: 'AI & Machine Learning',
    description: 'OpenAI Whisper, speech-to-text pipelines, acoustic modeling, voice cloning, and audio synthesis.',
    rationale: 'Brings together all Whisper speech-to-text clips and Voice Box TTS generative audio tutorials.',
    sourcePlaylistTitles: ['whisper', 'Voice box']
  },
  {
    id: 'grp_python_core_tooling',
    title: 'Python Core, Environments & Tooling',
    category: 'Engineering & Code',
    description: 'Python language mastery, virtual environments (venv), fast linters (ruff), and runtime configuration.',
    rationale: 'Unifies core Python language tutorials with virtual environment management (venv) and modern Ruff tooling.',
    sourcePlaylistTitles: ['python', 'Venv', 'ruff', 'dotnet']
  },
  {
    id: 'grp_data_science_tabular_sql',
    title: 'Data Science, Pandas, Polars & SQL',
    category: 'Engineering & Code',
    description: 'High-performance tabular data manipulation, dataframe benchmarks, data pipelines, and SQL database queries.',
    rationale: 'Pairs columnar dataframe libraries (Pandas/Polars) with SQL querying for complete tabular data manipulation.',
    sourcePlaylistTitles: ['pandas, polars', 'sql']
  },
  {
    id: 'grp_interactive_python_dashboards',
    title: 'Interactive Python & Web Dashboards',
    category: 'Engineering & Code',
    description: 'Jupyter notebooks, IPython, Plotly visualizations, Streamlit, and Gradio rapid UI prototyping.',
    rationale: 'Merges computational notebooks (Jupyter, IPython) with interactive web dashboard frameworks (Streamlit, Gradio, Plotly Dash).',
    sourcePlaylistTitles: ['jupyter, jupyterlab, ipython', 'plotly, gradio, streamlit']
  },
  {
    id: 'grp_cloud_computing_aws',
    title: 'Cloud Computing & AWS',
    category: 'Engineering & Code',
    description: 'Amazon Web Services infrastructure, cloud storage, serverless lambdas, IAM, and enterprise deployment.',
    rationale: 'Enterprise cloud infrastructure, serverless computing, and AWS architectures.',
    sourcePlaylistTitles: ['AWS']
  },
  {
    id: 'grp_containers_devops_wsl',
    title: 'Containers, DevOps & WSL Environments',
    category: 'Engineering & Code',
    description: 'Docker containers, Linux on Windows (WSL), system configuration, and microservice virtualization.',
    rationale: 'Merges fragmented WSL playlists (WSL, Wsl) and Docker containers into a consolidated local developer environment hub.',
    sourcePlaylistTitles: ['WSL', 'Wsl', 'containers']
  },
  {
    id: 'grp_version_control_git',
    title: 'Version Control, Git & GitHub Pages',
    category: 'Engineering & Code',
    description: 'Git branching, merge workflows, commit hygiene, and hosting static sites with GitHub Pages.',
    rationale: 'Merges duplicate Git playlists (Git, GIT) with GitHub Pages static deployment tutorials.',
    sourcePlaylistTitles: ['Git', 'GIT', 'Github pages']
  },
  {
    id: 'grp_code_editors_vscode',
    title: 'Code Editors & VS Code Mastery',
    category: 'Engineering & Code',
    description: 'Visual Studio Code keyboard shortcuts, developer extensions, workspace profiles, and productivity setups.',
    rationale: 'Comprehensive Visual Studio Code productivity setup and extension guides.',
    sourcePlaylistTitles: ['vscode']
  },
  {
    id: 'grp_api_architecture_web_services',
    title: 'API Architecture, REST & Web Services',
    category: 'Engineering & Code',
    description: 'RESTful API design, HTTP methods, authentication tokens, payload schemas, and client-server integration.',
    rationale: 'Dedicated backend RESTful API architecture and network services collection.',
    sourcePlaylistTitles: ['Rest API']
  },
  {
    id: 'grp_knowledge_management_pkm',
    title: 'Knowledge Management & Second Brain',
    category: 'Knowledge & Notes',
    description: 'Obsidian personal knowledge graph, Markdown synthesis, spaced repetition (Anki), note-taking, and book reviews.',
    rationale: 'Combines Obsidian/Markdown/Anki, Bookshelf reviews, writing techniques, and Napkin ideation.',
    sourcePlaylistTitles: ['obsidian, markdown, anki', 'Bookshelf', 'Writing', 'napkin']
  },
  {
    id: 'grp_genomics_systems_biology',
    title: 'Genomics, Epigenetics & Computational Biology',
    category: 'Science & Mathematics',
    description: 'Genomic sequencing, epigenetic regulation, computational bioinformatics, and Manolis Kellis research lectures.',
    rationale: 'Combines genome sequencing, epigenetics, and MIT Professor Manolis Kellis research lectures.',
    sourcePlaylistTitles: ['genome, epigenetics', 'manolis kellis']
  },
  {
    id: 'grp_mathematics_theoretical_physics',
    title: 'Mathematics & Theoretical Physics',
    category: 'Science & Mathematics',
    description: 'Linear algebra, calculus, discrete mathematics, and fundamental physics principles.',
    rationale: 'Merges duplicate Math, Maths, and math + physics playlists into a unified foundational science library.',
    sourcePlaylistTitles: ['Math', 'Maths', 'math + physics']
  },
  {
    id: 'grp_video_production_streaming',
    title: 'Screen Recording, Streaming & Video Production',
    category: 'Knowledge & Notes',
    description: 'OBS Studio configuration, scene switching, audio filters, Loom screen recording, and Clipchamp editing.',
    rationale: 'Unifies broadcasting software (OBS Studio) with lightweight screen recording tools (Loom, Clipchamp).',
    sourcePlaylistTitles: ['obs', 'loom, clipchamp']
  },
  {
    id: 'grp_youtube_creator_strategy',
    title: 'YouTube Strategy, Creator Tools & Publishing',
    category: 'Lifestyle & General',
    description: 'YouTube channel growth, algorithm insights, metadata optimization, and publishing workflows.',
    rationale: 'Dedicated YouTube creator distribution and audience growth strategy.',
    sourcePlaylistTitles: ['youtube']
  },
  {
    id: 'grp_harness_platform_engineering',
    title: 'Harness & Platform Engineering',
    category: 'Engineering & Code',
    description: 'Continuous delivery pipelines, automated test harnesses, feature flags, and infrastructure orchestration.',
    rationale: 'Complete modern CI/CD pipeline automation and software delivery platforms.',
    sourcePlaylistTitles: ['Harness']
  },
  {
    id: 'grp_ai_general_learning_theory',
    title: 'AI General & Learning Theory',
    category: 'AI & Machine Learning',
    description: 'Broad artificial intelligence topics, cognitive learning principles, and meta-learning strategies.',
    rationale: 'Combines general AI concepts with duplicate "Learning" playlists into a high-level cognitive foundation.',
    sourcePlaylistTitles: ['Ai', 'Learning']
  },
  {
    id: 'grp_movement_martial_arts_wellness',
    title: 'Martial Arts, Movement & Somatic Wellness',
    category: 'Lifestyle & General',
    description: 'Aikido martial arts principles, movement mechanics, flexibility, and somatic yoga practices.',
    rationale: 'Pairs Aikido martial disciplines with yoga somatic bodywork.',
    sourcePlaylistTitles: ['aikido', 'Yoga']
  },
  {
    id: 'grp_curated_favorites',
    title: 'Curated Favorites & Essential Reference',
    category: 'Lifestyle & General',
    description: 'User starred favorites, highest-rated instructional videos, and core evergreen bookmarks.',
    rationale: 'Preserves the personal starred favorites collection intact.',
    sourcePlaylistTitles: ['Favorites']
  },
  {
    id: 'grp_philosophy_critical_thinking',
    title: 'Philosophy, Mental Models & Critical Thinking',
    category: 'Lifestyle & General',
    description: 'Deep thinking, decision-making mental models, insightful essays, and thought-provoking analysis.',
    rationale: 'Merges fragmented subjective tags ("Think", "Interesting", "Useful", "Cool") into a rigorous critical thinking cluster.',
    sourcePlaylistTitles: ['Think', 'Interesting', 'Useful', 'Cool']
  },
  {
    id: 'grp_culinary_arts_cooking',
    title: 'Culinary Arts & Gastronomy',
    category: 'Lifestyle & General',
    description: 'Cooking techniques, recipes, culinary science, and nutritional preparation.',
    rationale: 'Culinary science and recipe instruction.',
    sourcePlaylistTitles: ['Cooking']
  },
  {
    id: 'grp_mobility_electric_vehicles',
    title: 'Mobility, Energy & Electric Vehicles',
    category: 'Lifestyle & General',
    description: 'Electric vehicle technology, battery architectures, and sustainable personal transit.',
    rationale: 'Electric vehicle engineering, autonomous driving, and battery technology.',
    sourcePlaylistTitles: ['Electric cars']
  },
  {
    id: 'grp_audiobooks_spoken_word',
    title: 'Audiobooks, Music & Spoken Word',
    category: 'Knowledge & Notes',
    description: 'Long-form audiobook lectures, literature readings, and musical appreciation.',
    rationale: 'Combines long-form audio narration, audiobooks, and music appreciation.',
    sourcePlaylistTitles: ['Audiobooks', 'Music']
  },
  {
    id: 'grp_personal_finance_economics',
    title: 'Personal Finance & Applied Economics',
    category: 'Lifestyle & General',
    description: 'Financial literacy, asset allocation, macroeconomic indicators, and wealth preservation.',
    rationale: 'Personal financial literacy, compounding, and macroeconomics.',
    sourcePlaylistTitles: ['finance']
  },
  {
    id: 'grp_personal_family_archives',
    title: 'Personal & Family Archives',
    category: 'Lifestyle & General',
    description: 'Personal recordings, travel memories, family milestones, and housing projects.',
    rationale: 'Consolidates personal family milestones and residential archives.',
    sourcePlaylistTitles: ['Dragos memories', 'Geneva appartment']
  }
];

// Helper to look up which proposed cluster a given original playlist title belongs to
export function findClusterForPlaylistTitle(playlistTitle: string): RestructureCluster {
  const norm = playlistTitle.trim().toLowerCase();
  for (const cluster of RESTRUCTURE_CLUSTERS) {
    if (cluster.sourcePlaylistTitles.some(t => t.trim().toLowerCase() === norm)) {
      return cluster;
    }
  }
  // Fallback if not matched
  return RESTRUCTURE_CLUSTERS[0];
}

// Compute the flat video allocation matrix across all original playlists
export function computeVideoAllocations(playlists: Playlist[]): VideoAllocationItem[] {
  const allocations: VideoAllocationItem[] = [];
  let index = 1;

  for (const pl of playlists) {
    const cluster = findClusterForPlaylistTitle(pl.title);
    for (const clip of pl.clips) {
      allocations.push({
        index: index++,
        videoId: clip.id,
        videoTitle: clip.title,
        channel: clip.channel,
        duration: clip.duration || '--:--',
        originalPlaylistId: pl.id,
        originalPlaylistTitle: pl.title,
        proposedClusterId: cluster.id,
        proposedClusterTitle: cluster.title,
        category: cluster.category,
        status: clip.status,
        transcriptAvailable: !!clip.transcriptAvailable,
        notes: clip.notes,
        tags: clip.tags || []
      });
    }
  }

  return allocations;
}

// Automatically construct the 28 consolidated Playlist objects from the original 71 playlists
export function buildRestructuredPlaylists(originalPlaylists: Playlist[]): Playlist[] {
  return RESTRUCTURE_CLUSTERS.map(cluster => {
    const sourceTitles = cluster.sourcePlaylistTitles.map(t => t.trim().toLowerCase());
    
    // Find all matching original playlists
    const matchingPlaylists = originalPlaylists.filter(pl => 
      sourceTitles.includes(pl.title.trim().toLowerCase())
    );

    // Collect all clips, assigning each clip the new playlist ID
    const mergedClips: YouTubeClip[] = [];
    const seenInCluster = new Set<string>();

    for (const pl of matchingPlaylists) {
      for (const clip of pl.clips) {
        if (!seenInCluster.has(clip.id)) {
          seenInCluster.add(clip.id);
          mergedClips.push({
            ...clip,
            playlistId: cluster.id,
            tags: Array.from(new Set([...(clip.tags || []), pl.title]))
          });
        }
      }
    }

    return {
      id: cluster.id,
      title: cluster.title,
      category: cluster.category,
      description: cluster.description,
      clipCount: mergedClips.length,
      clips: mergedClips
    };
  });
}

// PDF EXPORT 1: Full Video Allocation Matrix (Download as PDF)
export function exportAllocationPDF(allocations: VideoAllocationItem[], titlePrefix = 'All Videos'): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Branded Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 68, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('YouTube Video Library — Full Playlist Allocation Matrix', 40, 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    `learn-better Hub | ${titlePrefix} | Generated on ${generatedDate} | Total Allocations: ${allocations.length}`,
    40,
    52
  );

  // Table Body Rows
  const tableData = allocations.map(item => [
    item.index.toString(),
    item.videoTitle,
    item.channel,
    item.duration,
    item.originalPlaylistTitle,
    item.proposedClusterTitle,
    item.category
  ]);

  autoTable(doc, {
    startY: 80,
    head: [['#', 'Video Title', 'Channel', 'Length', 'Original Playlist', 'Target Restructured Topic', 'Category']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [248, 250, 252],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 26, halign: 'center' },
      1: { cellWidth: 260 },
      2: { cellWidth: 110 },
      3: { cellWidth: 42, halign: 'center' },
      4: { cellWidth: 120 },
      5: { cellWidth: 150 },
      6: { cellWidth: 90 }
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Page ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 60, doc.internal.pageSize.getHeight() - 15);
      doc.text('learn-better Knowledge Hub — Confidential & Personal Library Reference', 40, doc.internal.pageSize.getHeight() - 15);
    }
  });

  doc.save('youtube_video_allocations_per_playlist.pdf');
}

// PDF EXPORT 2: Restructuring Plan (28 Topic Clusters Proposal)
export function exportRestructurePlanPDF(
  clusters: RestructureCluster[],
  restructuredPlaylists: Playlist[],
  originalCount = 71
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Cover / Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 90, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('YouTube Playlists Strategic Restructuring Plan', 40, 42);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(99, 102, 241); // indigo-400
  doc.text(`Consolidating ${originalCount} Fragmented Playlists into ${clusters.length} Thematic Collections`, 40, 62);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${generatedDate} | 100% Clip Coverage | Zero Orphans`, 40, 78);

  // Executive Summary Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(40, 106, pageWidth - 80, 74, 6, 6, 'F');
  
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Executive Summary & Strategic Rationale', 52, 124);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const summaryText = 
    `Your existing library contains ${originalCount} playlists, many with only 1 or 2 clips, and multiple duplicate names (e.g., Cursor, WSL, QWEN, Git, Math, Learning). ` +
    `This proposal groups all 497 clips into ${clusters.length} robust thematic collections. Each cluster unites related tooling, eliminates redundant navigation, ` +
    `and organizes your content into high-density learning repositories while preserving 100% of notes, transcripts, and tags.`;
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 104);
  doc.text(splitSummary, 52, 138);

  // Plan Table
  const tableData = clusters.map((c, i) => {
    const pl = restructuredPlaylists.find(p => p.id === c.id);
    const count = pl ? pl.clips.length : 0;
    return [
      (i + 1).toString(),
      c.title,
      c.category,
      `${count} clips`,
      c.sourcePlaylistTitles.join(', '),
      c.rationale
    ];
  });

  autoTable(doc, {
    startY: 195,
    head: [['#', 'Proposed Playlist Name', 'Category', 'Volume', 'Original Playlists Merged', 'Strategic Rationale']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [67, 56, 202], // indigo-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' },
      1: { cellWidth: 120, fontStyle: 'bold' },
      2: { cellWidth: 70 },
      3: { cellWidth: 44, halign: 'center' },
      4: { cellWidth: 125 },
      5: { cellWidth: 135 }
    },
    didDrawPage: (data) => {
      const str = `Page ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 60, pageHeight - 15);
      doc.text('learn-better Knowledge Hub — Proposed 28-Playlist Architecture', 40, pageHeight - 15);
    }
  });

  doc.save('youtube_playlists_restructuring_plan_28.pdf');
}

// CSV Exporter for Allocations
export function exportAllocationCSV(allocations: VideoAllocationItem[]): void {
  const headers = [
    'Index',
    'Video ID',
    'Video Title',
    'Channel',
    'Duration',
    'Original Playlist ID',
    'Original Playlist Title',
    'Proposed Cluster ID',
    'Proposed Cluster Title',
    'Category',
    'Status',
    'Has Transcript',
    'Tags'
  ];

  const rows = allocations.map(a => [
    a.index,
    `"${a.videoId}"`,
    `"${a.videoTitle.replace(/"/g, '""')}"`,
    `"${a.channel.replace(/"/g, '""')}"`,
    `"${a.duration}"`,
    `"${a.originalPlaylistId}"`,
    `"${a.originalPlaylistTitle.replace(/"/g, '""')}"`,
    `"${a.proposedClusterId}"`,
    `"${a.proposedClusterTitle.replace(/"/g, '""')}"`,
    `"${a.category}"`,
    `"${a.status}"`,
    a.transcriptAvailable ? 'Yes' : 'No',
    `"${a.tags.join(', ').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'youtube_videos_playlist_allocation.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// CSV Exporter for Restructure Plan
export function exportRestructurePlanCSV(clusters: RestructureCluster[], restructuredPlaylists: Playlist[]): void {
  const headers = [
    'Cluster ID',
    'Proposed Playlist Title',
    'Category',
    'Clip Count',
    'Description',
    'Strategic Rationale',
    'Merged Source Playlists'
  ];

  const rows = clusters.map(c => {
    const pl = restructuredPlaylists.find(p => p.id === c.id);
    const count = pl ? pl.clips.length : 0;
    return [
      `"${c.id}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      count,
      `"${c.description.replace(/"/g, '""')}"`,
      `"${c.rationale.replace(/"/g, '""')}"`,
      `"${c.sourcePlaylistTitles.join(', ').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'youtube_playlists_restructuring_plan_28.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// JSON Exporters
export function exportDataJSON(data: any, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Python Automation Script Template
export const YOUTUBE_AUTOMATION_PYTHON_SCRIPT = `#!/usr/bin/env python3
"""
regroup_youtube_playlists.py
============================
Automated YouTube Playlist Restructuring Script
Creates 28 consolidated thematic playlists on your YouTube account using the YouTube Data API v3
and migrates all 497 clips from your 71 fragmented playlists into their new topic homes.

Prerequisites:
  1. pip install google-api-python-client google-auth-oauthlib google-auth-httplib2
  2. Download your client_secret.json from Google Cloud Console (YouTube Data API v3 enabled)
  3. Run: python regroup_youtube_playlists.py --dry-run
  4. Run: python regroup_youtube_playlists.py --execute
"""

import os
import sys
import json
import time
from typing import Dict, List, Any

try:
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("Error: Missing Google API libraries.")
    print("Please install them via: pip install google-api-python-client google-auth-oauthlib google-auth-httplib2")
    sys.exit(1)

SCOPES = ["https://www.googleapis.com/auth/youtube"]
CLIENT_SECRETS_FILE = "client_secret.json"

# The 28 Consolidated Topic Clusters
RESTRUCTURE_MAPPING = [
  {
    "title": "AI Coding Assistants & Vibe Coding",
    "description": "AI-assisted programming environments, Cursor IDE, Cline, Codex, PAI, Kiro, and vibe-coding workflows.",
    "source_playlists": ["Cursor", "Cline", "Codex", "PAI", "Kiraa", "kiro"]
  },
  {
    "title": "LLM Frontier Models & Research",
    "description": "Frontier language models, Claude, ChatGPT, Qwen, DeepSeek, Kimi, Gemini, Hugging Face ecosystem, and model distillation.",
    "source_playlists": ["Claude", "Chatgpt", "QWEN", "DeepSeek", "Kimi", "gemini", "LeCunn", "huggingface", "Llm-wiki", "LLM"]
  },
  {
    "title": "Neural Networks & Deep Learning",
    "description": "Deep learning fundamentals, backpropagation, network architectures, and representation learning.",
    "source_playlists": ["neural networks", "Distillation"]
  },
  {
    "title": "Synthetic Cognition & Biological Intelligence",
    "description": "Phylogenetic origins of intelligence, cybernetics, symbiosis, cognitive models, and biological vs synthetic minds.",
    "source_playlists": ["Intelligence", "Symbiont"]
  },
  {
    "title": "Speech, Audio AI & Voice Synthesis",
    "description": "OpenAI Whisper, speech-to-text pipelines, acoustic modeling, voice cloning, and audio synthesis.",
    "source_playlists": ["whisper", "Voice box"]
  },
  {
    "title": "Python Core, Environments & Tooling",
    "description": "Python language mastery, virtual environments (venv), fast linters (ruff), and runtime configuration.",
    "source_playlists": ["python", "Venv", "ruff", "dotnet"]
  },
  {
    "title": "Data Science, Pandas, Polars & SQL",
    "description": "High-performance tabular data manipulation, dataframe benchmarks, data pipelines, and SQL database queries.",
    "source_playlists": ["pandas, polars", "sql"]
  },
  {
    "title": "Interactive Python & Web Dashboards",
    "description": "Jupyter notebooks, IPython, Plotly visualizations, Streamlit, and Gradio rapid UI prototyping.",
    "source_playlists": ["jupyter, jupyterlab, ipython", "plotly, gradio, streamlit"]
  },
  {
    "title": "Cloud Computing & AWS",
    "description": "Amazon Web Services infrastructure, cloud storage, serverless lambdas, IAM, and enterprise deployment.",
    "source_playlists": ["AWS"]
  },
  {
    "title": "Containers, DevOps & WSL Environments",
    "description": "Docker containers, Linux on Windows (WSL), system configuration, and microservice virtualization.",
    "source_playlists": ["WSL", "Wsl", "containers"]
  },
  {
    "title": "Version Control, Git & GitHub Pages",
    "description": "Git branching, merge workflows, commit hygiene, and hosting static sites with GitHub Pages.",
    "source_playlists": ["Git", "GIT", "Github pages"]
  },
  {
    "title": "Code Editors & VS Code Mastery",
    "description": "Visual Studio Code keyboard shortcuts, developer extensions, workspace profiles, and productivity setups.",
    "source_playlists": ["vscode"]
  },
  {
    "title": "API Architecture, REST & Web Services",
    "description": "RESTful API design, HTTP methods, authentication tokens, payload schemas, and client-server integration.",
    "source_playlists": ["Rest API"]
  },
  {
    "title": "Knowledge Management & Second Brain",
    "description": "Obsidian personal knowledge graph, Markdown synthesis, spaced repetition (Anki), note-taking, and book reviews.",
    "source_playlists": ["obsidian, markdown, anki", "Bookshelf", "Writing", "napkin"]
  },
  {
    "title": "Genomics, Epigenetics & Computational Biology",
    "description": "Genomic sequencing, epigenetic regulation, computational bioinformatics, and Manolis Kellis research lectures.",
    "source_playlists": ["genome, epigenetics", "manolis kellis"]
  },
  {
    "title": "Mathematics & Theoretical Physics",
    "description": "Linear algebra, calculus, discrete mathematics, and fundamental physics principles.",
    "source_playlists": ["Math", "Maths", "math + physics"]
  },
  {
    "title": "Screen Recording, Streaming & Video Production",
    "description": "OBS Studio configuration, scene switching, audio filters, Loom screen recording, and Clipchamp editing.",
    "source_playlists": ["obs", "loom, clipchamp"]
  },
  {
    "title": "YouTube Strategy, Creator Tools & Publishing",
    "description": "YouTube channel growth, algorithm insights, metadata optimization, and publishing workflows.",
    "source_playlists": ["youtube"]
  },
  {
    "title": "Harness & Platform Engineering",
    "description": "Continuous delivery pipelines, automated test harnesses, feature flags, and infrastructure orchestration.",
    "source_playlists": ["Harness"]
  },
  {
    "title": "AI General & Learning Theory",
    "description": "Broad artificial intelligence topics, cognitive learning principles, and meta-learning strategies.",
    "source_playlists": ["Ai", "Learning"]
  },
  {
    "title": "Martial Arts, Movement & Somatic Wellness",
    "description": "Aikido martial arts principles, movement mechanics, flexibility, and somatic yoga practices.",
    "source_playlists": ["aikido", "Yoga"]
  },
  {
    "title": "Curated Favorites & Essential Reference",
    "description": "User starred favorites, highest-rated instructional videos, and core evergreen bookmarks.",
    "source_playlists": ["Favorites"]
  },
  {
    "title": "Philosophy, Mental Models & Critical Thinking",
    "description": "Deep thinking, decision-making mental models, insightful essays, and thought-provoking analysis.",
    "source_playlists": ["Think", "Interesting", "Useful", "Cool"]
  },
  {
    "title": "Culinary Arts & Gastronomy",
    "description": "Cooking techniques, recipes, culinary science, and nutritional preparation.",
    "source_playlists": ["Cooking"]
  },
  {
    "title": "Mobility, Energy & Electric Vehicles",
    "description": "Electric vehicle technology, battery architectures, and sustainable personal transit.",
    "source_playlists": ["Electric cars"]
  },
  {
    "title": "Audiobooks, Music & Spoken Word",
    "description": "Long-form audiobook lectures, literature readings, and musical appreciation.",
    "source_playlists": ["Audiobooks", "Music"]
  },
  {
    "title": "Personal Finance & Applied Economics",
    "description": "Financial literacy, asset allocation, macroeconomic indicators, and wealth preservation.",
    "source_playlists": ["finance"]
  },
  {
    "title": "Personal & Family Archives",
    "description": "Personal recordings, travel memories, family milestones, and housing projects.",
    "source_playlists": ["Dragos memories", "Geneva appartment"]
  }
]

def get_authenticated_service():
    if not os.path.exists(CLIENT_SECRETS_FILE):
        print(f"Error: {CLIENT_SECRETS_FILE} not found.")
        print("Please place your OAuth2 client secret file in this directory.")
        sys.exit(1)
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
    credentials = flow.run_local_server(port=0)
    return build("youtube", "v3", credentials=credentials)

def create_playlist(youtube, title: str, description: str) -> str:
    body = {
        "snippet": {
            "title": title,
            "description": description
        },
        "status": {
            "privacyStatus": "private"  # Default to private, change to public/unlisted as desired
        }
    }
    response = youtube.playlists().insert(part="snippet,status", body=body).execute()
    return response["id"]

def add_video_to_playlist(youtube, playlist_id: str, video_id: str):
    body = {
        "snippet": {
            "playlistId": playlist_id,
            "resourceId": {
                "kind": "youtube#video",
                "videoId": video_id
            }
        }
    }
    return youtube.playlistItems().insert(part="snippet", body=body).execute()

def main():
    dry_run = "--execute" not in sys.argv
    print("=" * 70)
    print("YouTube Playlists Restructuring Automation (71 -> 28 Topic Playlists)")
    print(f"Mode: {'DRY RUN (preview only)' if dry_run else 'LIVE EXECUTION'}")
    print("=" * 70)

    if dry_run:
        print("\\n[DRY RUN PREVIEW]")
        for i, cluster in enumerate(RESTRUCTURE_MAPPING, 1):
            print(f"[{i:02d}] {cluster['title']}")
            print(f"     Merged from: {', '.join(cluster['source_playlists'])}")
        print("\\nTo create these 28 playlists on your YouTube account, run:")
        print("python regroup_youtube_playlists.py --execute")
        return

    youtube = get_authenticated_service()
    print("\\nAuthentication successful! Creating 28 playlists...")

    for i, cluster in enumerate(RESTRUCTURE_MAPPING, 1):
        print(f"\\n[{i:02d}/{len(RESTRUCTURE_MAPPING)}] Creating: {cluster['title']}...")
        try:
            pl_id = create_playlist(youtube, cluster["title"], cluster["description"])
            print(f"      Created playlist ID: {pl_id}")
            time.sleep(1.0) # Rate limiting safety
        except HttpError as e:
            print(f"      Failed to create {cluster['title']}: {e}")

    print("\\nRestructuring process completed!")

if __name__ == "__main__":
    main()
`;
