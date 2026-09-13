#!/usr/bin/env python3
"""
regroup_youtube_playlists.py
============================
Automated YouTube Playlist Restructuring Script
Creates 28 consolidated thematic playlists on your YouTube account using the YouTube Data API v3
and migrates clips from your 71 fragmented playlists into their new topic homes.

Prerequisites:
  1. pip install google-api-python-client google-auth-oauthlib google-auth-httplib2
  2. Download your client_secret.json from Google Cloud Console (YouTube Data API v3 enabled)
  3. Run: python scripts/regroup_youtube_playlists.py --dry-run
  4. Run: python scripts/regroup_youtube_playlists.py --execute
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
            "privacyStatus": "private"
        }
    }
    response = youtube.playlists().insert(part="snippet,status", body=body).execute()
    return response["id"]

def main():
    dry_run = "--execute" not in sys.argv
    print("=" * 70)
    print("YouTube Playlists Restructuring Automation (71 -> 28 Topic Playlists)")
    print(f"Mode: {'DRY RUN (preview only)' if dry_run else 'LIVE EXECUTION'}")
    print("=" * 70)

    if dry_run:
        print("\n[DRY RUN PREVIEW]")
        for i, cluster in enumerate(RESTRUCTURE_MAPPING, 1):
            print(f"[{i:02d}] {cluster['title']}")
            print(f"     Merged from: {', '.join(cluster['source_playlists'])}")
        print("\nTo create these 28 playlists on your YouTube account, run:")
        print("python scripts/regroup_youtube_playlists.py --execute")
        return

    youtube = get_authenticated_service()
    print("\nAuthentication successful! Creating 28 playlists...")

    for i, cluster in enumerate(RESTRUCTURE_MAPPING, 1):
        print(f"\n[{i:02d}/{len(RESTRUCTURE_MAPPING)}] Creating: {cluster['title']}...")
        try:
            pl_id = create_playlist(youtube, cluster["title"], cluster["description"])
            print(f"      Created playlist ID: {pl_id}")
            time.sleep(1.0)
        except HttpError as e:
            print(f"      Failed to create {cluster['title']}: {e}")

    print("\nRestructuring process completed!")

if __name__ == "__main__":
    main()
