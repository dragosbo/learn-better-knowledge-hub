/**
 * GitHub API Integration Service
 * 
 * Provides client-side and authenticated access to GitHub repositories:
 * - Personal Access Token (PAT) and OAuth Bearer management
 * - Fetching specific file contents or entire folder trees (including recursive traversal)
 * - Automatic Base64 UTF-8 decoding with multi-byte character support
 * - Native transformation of fetched repository assets into KnowledgeHub datasets:
 *   - YouTubeClip objects with extracted tags, summaries, notes, and study prompts
 *   - SummaryData objects for the KnowledgeHub summary viewer
 */

import { YouTubeClip, SummaryData } from '../types/index';

export const GITHUB_TOKEN_STORAGE_KEY = 'learn_better_github_token';
export const GITHUB_USER_STORAGE_KEY = 'learn_better_github_user';
const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name?: string;
  email?: string;
  public_repos: number;
  bio?: string;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  resetDate: string;
}

export interface GitHubContentItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir' | 'submodule' | 'symlink';
  content?: string;
  encoding?: string;
}

export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  downloadUrl: string | null;
  content: string;
  rawBase64?: string;
  extension: string;
}

export interface ParsedGitHubTarget {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  isFolder: boolean;
}

export interface KnowledgeHubImportOptions {
  branch?: string;
  token?: string;
  targetPlaylistId?: string;
  categoryTag?: string;
  allowedExtensions?: string[];
  maxFiles?: number;
  recursive?: boolean;
  status?: 'synthesized' | 'to-watch' | 'in-progress' | 'mastered';
}

export interface KnowledgeHubImportResult {
  clips: YouTubeClip[];
  summaries: SummaryData[];
  importedCount: number;
  sourceRepo: string;
  folderPath: string;
  branch: string;
  importedAt: string;
  files: Array<{ name: string; path: string; size: number }>;
  errors: string[];
}

// ---------------------------------------------------------------------------
// 1. Authentication & Token Management
// ---------------------------------------------------------------------------

/**
 * Store GitHub personal access token or OAuth token in localStorage.
 */
export function setGitHubToken(token: string): void {
  try {
    if (!token || !token.trim()) {
      clearGitHubToken();
      return;
    }
    localStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, token.trim());
  } catch (err) {
    console.warn('Failed to store GitHub token in localStorage', err);
  }
}

/**
 * Retrieve active GitHub token from localStorage.
 */
export function getGitHubToken(): string | null {
  try {
    return localStorage.getItem(GITHUB_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Check if a token is configured.
 */
export function hasGitHubToken(): boolean {
  return !!getGitHubToken();
}

/**
 * Remove stored GitHub token and cached user profile.
 */
export function clearGitHubToken(): void {
  try {
    localStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY);
    localStorage.removeItem(GITHUB_USER_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear GitHub credentials', err);
  }
}

/**
 * Get stored cached user profile.
 */
export function getStoredGitHubUser(): GitHubUser | null {
  try {
    const raw = localStorage.getItem(GITHUB_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Cache user profile in localStorage.
 */
export function setStoredGitHubUser(user: GitHubUser | null): void {
  try {
    if (user) {
      localStorage.setItem(GITHUB_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(GITHUB_USER_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Build request headers with optional GitHub authorization.
 */
export function getGitHubHeaders(customToken?: string): HeadersInit {
  const token = customToken || getGitHubToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token && token.trim()) {
    // Both fine-grained (github_pat_) and classic (ghp_) tokens use Bearer
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  return headers;
}

/**
 * Validate active GitHub token against GitHub's `/user` endpoint.
 */
export async function validateGitHubToken(
  token?: string
): Promise<{ valid: boolean; user?: GitHubUser; scopes: string[]; rateLimit?: GitHubRateLimit; error?: string }> {
  const activeToken = token || getGitHubToken();
  if (!activeToken) {
    return { valid: false, scopes: [], error: 'No GitHub token provided.' };
  }

  try {
    const res = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: getGitHubHeaders(activeToken),
    });

    const scopesHeader = res.headers.get('x-oauth-scopes') || '';
    const scopes = scopesHeader.split(',').map((s) => s.trim()).filter(Boolean);

    const limit = parseInt(res.headers.get('x-ratelimit-limit') || '0', 10);
    const remaining = parseInt(res.headers.get('x-ratelimit-remaining') || '0', 10);
    const reset = parseInt(res.headers.get('x-ratelimit-reset') || '0', 10);
    const used = parseInt(res.headers.get('x-ratelimit-used') || '0', 10);

    const rateLimit: GitHubRateLimit = {
      limit,
      remaining,
      reset,
      used,
      resetDate: reset ? new Date(reset * 1000).toLocaleTimeString() : '',
    };

    if (!res.ok) {
      if (res.status === 401) {
        return { valid: false, scopes: [], rateLimit, error: 'Bad GitHub credentials (HTTP 401 Unauthorized).' };
      }
      if (res.status === 403 && remaining === 0) {
        return { valid: false, scopes: [], rateLimit, error: `GitHub API rate limit exceeded. Resets at ${rateLimit.resetDate}.` };
      }
      return { valid: false, scopes: [], rateLimit, error: `GitHub error: HTTP ${res.status} ${res.statusText}` };
    }

    const userData: GitHubUser = await res.json();
    setStoredGitHubUser(userData);

    return {
      valid: true,
      user: userData,
      scopes,
      rateLimit,
    };
  } catch (err: any) {
    return {
      valid: false,
      scopes: [],
      error: err.message || 'Failed to connect to GitHub API.',
    };
  }
}

/**
 * Fetch current rate limit status (works authenticated or unauthenticated).
 */
export async function fetchRateLimit(token?: string): Promise<GitHubRateLimit> {
  const res = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
    headers: getGitHubHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch rate limit: HTTP ${res.status}`);
  }

  const data = await res.json();
  const core = data.resources?.core || {};
  return {
    limit: core.limit || 60,
    remaining: core.remaining ?? 60,
    reset: core.reset || 0,
    used: core.used || 0,
    resetDate: core.reset ? new Date(core.reset * 1000).toLocaleTimeString() : '',
  };
}

// ---------------------------------------------------------------------------
// 2. URL & Path Parsing Helpers
// ---------------------------------------------------------------------------

/**
 * Parses diverse GitHub URL formats and shorthand notations into structured components.
 * 
 * Supported formats:
 * - https://github.com/owner/repo/tree/main/path/to/folder
 * - https://github.com/owner/repo/blob/main/path/to/file.md
 * - https://raw.githubusercontent.com/owner/repo/main/path/to/file.md
 * - owner/repo/path/to/folder
 * - owner/repo:path/to/folder
 * - owner/repo
 */
export function parseGitHubUrl(urlOrPath: string): ParsedGitHubTarget | null {
  if (!urlOrPath || !urlOrPath.trim()) return null;
  const input = urlOrPath.trim();

  try {
    // 1. Full github.com URL: https://github.com/owner/repo/tree/branch/path...
    if (input.includes('github.com')) {
      const url = new URL(input.startsWith('http') ? input : `https://${input}`);
      const parts = url.pathname.replace(/^\//, '').split('/');
      if (parts.length < 2) return null;

      const owner = parts[0];
      const repo = parts[1].replace(/\.git$/, '');

      if (parts.length >= 4 && (parts[2] === 'tree' || parts[2] === 'blob')) {
        const branch = parts[3];
        const path = parts.slice(4).join('/');
        const isFolder = parts[2] === 'tree' || !path.includes('.');
        return { owner, repo, branch, path, isFolder };
      }

      return { owner, repo, branch: 'main', path: '', isFolder: true };
    }

    // 2. Raw URL: https://raw.githubusercontent.com/owner/repo/branch/path...
    if (input.includes('raw.githubusercontent.com')) {
      const url = new URL(input.startsWith('http') ? input : `https://${input}`);
      const parts = url.pathname.replace(/^\//, '').split('/');
      if (parts.length < 3) return null;

      const owner = parts[0];
      const repo = parts[1];
      const branch = parts[2];
      const path = parts.slice(3).join('/');
      return { owner, repo, branch, path, isFolder: false };
    }

    // 3. Shorthand: owner/repo:path or owner/repo/path
    if (input.includes(':')) {
      const [repoPart, pathPart] = input.split(':');
      const repoTokens = repoPart.split('/');
      if (repoTokens.length >= 2) {
        return {
          owner: repoTokens[0],
          repo: repoTokens[1],
          branch: 'main',
          path: pathPart || '',
          isFolder: !pathPart || !pathPart.includes('.'),
        };
      }
    }

    const segments = input.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const owner = segments[0];
      const repo = segments[1];
      const path = segments.slice(2).join('/');
      return {
        owner,
        repo,
        branch: 'main',
        path,
        isFolder: !path || !path.includes('.'),
      };
    }

    return null;
  } catch (err) {
    console.warn('Error parsing GitHub URL', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 3. UTF-8 Base64 Decoding Utility
// ---------------------------------------------------------------------------

/**
 * Robust Base64 decoder handling UTF-8 multi-byte characters and line breaks.
 */
export function decodeGitHubBase64(base64Str: string): string {
  try {
    const cleaned = base64Str.replace(/\s/g, '');
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  } catch (e) {
    // Fallback using decodeURIComponent / escape trick
    try {
      return decodeURIComponent(escape(atob(base64Str.replace(/\s/g, ''))));
    } catch {
      return atob(base64Str.replace(/\s/g, ''));
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Low-Level Repository File & Folder Fetching
// ---------------------------------------------------------------------------

/**
 * Fetch a file or directory metadata from GitHub's Contents API.
 */
export async function fetchRepositoryItem(
  owner: string,
  repo: string,
  path: string = '',
  branch?: string,
  token?: string
): Promise<GitHubContentItem | GitHubContentItem[]> {
  const cleanPath = path.replace(/^\//, '');
  const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${cleanPath}`);
  if (branch) {
    url.searchParams.set('ref', branch);
  }

  const res = await fetch(url.toString(), {
    headers: getGitHubHeaders(token),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    if (res.status === 404) {
      throw new Error(`Repository item not found: "${owner}/${repo}/${cleanPath}" (branch: ${branch || 'default'})`);
    }
    if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
      const reset = res.headers.get('x-ratelimit-reset');
      const resetTime = reset ? new Date(parseInt(reset, 10) * 1000).toLocaleTimeString() : 'soon';
      throw new Error(`GitHub rate limit exceeded. Resets at ${resetTime}. Add a GitHub token to increase limits to 5,000 req/hr.`);
    }
    throw new Error(errData.message || `GitHub error: HTTP ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Fetch a single file and decode its contents.
 */
export async function fetchRepositoryFile(
  owner: string,
  repo: string,
  filePath: string,
  branch?: string,
  token?: string
): Promise<GitHubFileContent> {
  const item = await fetchRepositoryItem(owner, repo, filePath, branch, token);

  if (Array.isArray(item)) {
    throw new Error(`Path "${filePath}" points to a directory, not a file.`);
  }

  if (item.type !== 'file') {
    throw new Error(`Path "${filePath}" is a ${item.type}, not a regular file.`);
  }

  let textContent = '';
  if (item.content) {
    textContent = decodeGitHubBase64(item.content);
  } else if (item.download_url) {
    // Large files (> 1MB) do not include content in the API response; fetch via raw download_url
    const rawRes = await fetch(item.download_url);
    if (!rawRes.ok) {
      throw new Error(`Failed to fetch raw file from download_url: HTTP ${rawRes.status}`);
    }
    textContent = await rawRes.text();
  }

  const extension = item.name.includes('.') ? `.${item.name.split('.').pop()?.toLowerCase()}` : '';

  return {
    name: item.name,
    path: item.path,
    sha: item.sha,
    size: item.size,
    downloadUrl: item.download_url,
    content: textContent,
    rawBase64: item.content,
    extension,
  };
}

/**
 * Fetch all files in a folder (optionally recursive).
 */
export async function fetchRepositoryFolder(
  owner: string,
  repo: string,
  folderPath: string = '',
  branch?: string,
  recursive: boolean = false,
  token?: string
): Promise<GitHubFileContent[]> {
  const item = await fetchRepositoryItem(owner, repo, folderPath, branch, token);

  if (!Array.isArray(item)) {
    // If the path is actually a single file, return it wrapped in array
    if (item.type === 'file') {
      const singleFile = await fetchRepositoryFile(owner, repo, folderPath, branch, token);
      return [singleFile];
    }
    throw new Error(`Path "${folderPath}" is not a directory.`);
  }

  const results: GitHubFileContent[] = [];

  for (const entry of item) {
    if (entry.type === 'file') {
      try {
        const fileContent = await fetchRepositoryFile(owner, repo, entry.path, branch, token);
        results.push(fileContent);
      } catch (fileErr) {
        console.warn(`Failed to fetch file "${entry.path}"`, fileErr);
      }
    } else if (entry.type === 'dir' && recursive) {
      try {
        const subFiles = await fetchRepositoryFolder(owner, repo, entry.path, branch, true, token);
        results.push(...subFiles);
      } catch (dirErr) {
        console.warn(`Failed to traverse subdirectory "${entry.path}"`, dirErr);
      }
    }
  }

  return results;
}

/**
 * List branches in repository.
 */
export async function fetchRepositoryBranches(owner: string, repo: string, token?: string): Promise<string[]> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?per_page=100`, {
      headers: getGitHubHeaders(token),
    });
    if (!res.ok) return ['main', 'master'];
    const data = await res.json();
    return data.map((b: any) => b.name);
  } catch {
    return ['main', 'master'];
  }
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree' | 'commit';
  sha: string;
  size?: number;
  url: string;
}

/**
 * Fetch the entire repository file tree using GitHub's Git Trees API.
 * This retrieves all repository files in a single network request.
 */
export async function fetchRepositoryTree(
  owner: string,
  repo: string,
  branch: string = 'main',
  token?: string
): Promise<GitHubTreeItem[]> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const res = await fetch(url, {
    headers: getGitHubHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch repository tree: HTTP ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return (data.tree || []) as GitHubTreeItem[];
}

/**
 * Fetch specific file paths from a repository in parallel (with controlled concurrency).
 */
export async function fetchSpecificFiles(
  owner: string,
  repo: string,
  filePaths: string[],
  branch?: string,
  token?: string
): Promise<GitHubFileContent[]> {
  const results: GitHubFileContent[] = [];

  // Batch in chunks of 5 to avoid overwhelming rate limits / concurrent requests
  const chunkSize = 5;
  for (let i = 0; i < filePaths.length; i += chunkSize) {
    const chunk = filePaths.slice(i, i + chunkSize);
    const chunkResults = await Promise.allSettled(
      chunk.map((p) => fetchRepositoryFile(owner, repo, p, branch, token))
    );

    for (const res of chunkResults) {
      if (res.status === 'fulfilled') {
        results.push(res.value);
      } else {
        console.warn('Failed to fetch specific file from GitHub:', res.reason);
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// 5. KnowledgeHub Dataset Transformation & Extraction
// ---------------------------------------------------------------------------

/**
 * Extract structured metadata from Markdown files (headers, tags, takeaways, open questions).
 */
export function extractMetadataFromMarkdown(
  content: string,
  filename: string
): { title: string; summary: string; tags: string[]; questions: string[]; ideas: string[] } {
  const lines = content.split('\n');
  let title = '';
  let summary = '';
  const tagsSet = new Set<string>();
  const questions: string[] = [];
  const ideas: string[] = [];

  let inFrontmatter = false;
  let frontmatterLines: string[] = [];
  let pastFrontmatter = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // Check YAML frontmatter ---
    if (i === 0 && line === '---') {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter) {
      if (line === '---') {
        inFrontmatter = false;
        pastFrontmatter = true;
        continue;
      }
      frontmatterLines.push(line);
      continue;
    }

    // Extract Title from first H1 or H2
    if (!title && (line.startsWith('# ') || line.startsWith('## '))) {
      title = line.replace(/^#+\s*/, '').trim();
      continue;
    }

    // Extract Summary from first non-empty text paragraph or blockquote
    if (!summary && line.length > 20 && !line.startsWith('#') && !line.startsWith('```') && !line.startsWith('-')) {
      summary = line.replace(/^>\s*/, '').trim();
    }

    // Extract Tags from `#tag` syntax
    const hashtagMatches = line.match(/#[a-zA-Z0-9_\-]+/g);
    if (hashtagMatches) {
      hashtagMatches.forEach((t) => tagsSet.add(t.replace('#', '').toLowerCase()));
    }

    // Extract Questions
    if (line.startsWith('? ') || line.toLowerCase().startsWith('question:') || line.toLowerCase().includes('open question:')) {
      questions.push(line.replace(/^\?\s*|^question:\s*/i, '').trim());
    }

    // Extract Ideas / Takeaways
    if (line.toLowerCase().startsWith('idea:') || line.toLowerCase().startsWith('takeaway:') || line.toLowerCase().startsWith('action:')) {
      ideas.push(line.replace(/^idea:\s*|^takeaway:\s*|^action:\s*/i, '').trim());
    }
  }

  // Parse frontmatter if present
  if (frontmatterLines.length > 0) {
    for (const fLine of frontmatterLines) {
      if (fLine.startsWith('title:') && !title) {
        title = fLine.replace('title:', '').replace(/['"]/g, '').trim();
      }
      if (fLine.startsWith('tags:')) {
        const rawTags = fLine.replace('tags:', '').replace(/[\[\]'"]/g, '');
        rawTags.split(',').forEach((t) => {
          if (t.trim()) tagsSet.add(t.trim().toLowerCase());
        });
      }
      if (fLine.startsWith('summary:') && !summary) {
        summary = fLine.replace('summary:', '').replace(/['"]/g, '').trim();
      }
    }
  }

  // Fallbacks if no title/summary found
  if (!title) {
    title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    // Capitalize words
    title = title.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (!summary) {
    summary = `Imported from GitHub repository asset ${filename}.`;
  }

  // Ensure default tags
  if (tagsSet.size === 0) {
    tagsSet.add('github');
    tagsSet.add('knowledge-base');
  }

  return {
    title,
    summary,
    tags: Array.from(tagsSet),
    questions,
    ideas,
  };
}

/**
 * Convert a fetched GitHub file into a structured YouTubeClip knowledge item.
 */
export function convertGitHubFileToKnowledgeClip(
  file: GitHubFileContent,
  owner: string,
  repo: string,
  options?: KnowledgeHubImportOptions
): YouTubeClip {
  const metadata = extractMetadataFromMarkdown(file.content, file.name);

  // Generate deterministic ID
  const cleanPath = file.path.replace(/[^a-zA-Z0-9]/g, '_');
  const clipId = `gh_${owner}_${repo}_${cleanPath}`.slice(0, 48);

  const playlistId = options?.targetPlaylistId || 'PL_github_knowledge_imported';

  // Combine tags
  const combinedTags = [...metadata.tags];
  if (options?.categoryTag && !combinedTags.includes(options.categoryTag.toLowerCase())) {
    combinedTags.push(options.categoryTag.toLowerCase());
  }
  combinedTags.push(repo.toLowerCase());

  return {
    id: clipId,
    title: metadata.title,
    channel: `${owner}/${repo}`,
    duration: `${Math.max(1, Math.round(file.content.length / 800))} min read`,
    playlistId,
    tags: combinedTags,
    status: options?.status || 'synthesized',
    summary: metadata.summary,
    transcriptAvailable: false,
    notes: file.content,
    userQuestions: metadata.questions,
    userIdeas: metadata.ideas,
    addedAt: new Date().toISOString().split('T')[0],
  };
}

/**
 * Convert a fetched GitHub file into a SummaryData record for KnowledgeHub.
 */
export function convertGitHubFileToSummary(
  file: GitHubFileContent,
  owner: string,
  repo: string
): SummaryData {
  const metadata = extractMetadataFromMarkdown(file.content, file.name);
  const cleanPath = file.path.replace(/[^a-zA-Z0-9]/g, '_');
  const id = `sum_gh_${owner}_${repo}_${cleanPath}`.slice(0, 48);

  return {
    id,
    filename: file.name,
    title: metadata.title,
    videoId: `gh_${owner}_${repo}_${cleanPath}`.slice(0, 48),
    topic: `${owner}/${repo}`,
    audience: 'Self-Directed Learners & Engineers',
    oneLineTakeaway: metadata.summary,
    content: file.content,
  };
}

/**
 * Convert an array of GitHub files into KnowledgeHub datasets.
 */
export function convertGitHubFilesToKnowledgeDataset(
  files: GitHubFileContent[],
  owner: string,
  repo: string,
  options?: KnowledgeHubImportOptions
): { clips: YouTubeClip[]; summaries: SummaryData[] } {
  const clips: YouTubeClip[] = [];
  const summaries: SummaryData[] = [];

  for (const file of files) {
    // Filter by extensions if specified
    const allowed = options?.allowedExtensions || ['.md', '.markdown', '.txt', '.json', '.ts', '.py'];
    if (file.extension && !allowed.includes(file.extension.toLowerCase())) {
      continue;
    }

    const clip = convertGitHubFileToKnowledgeClip(file, owner, repo, options);
    const summary = convertGitHubFileToSummary(file, owner, repo);

    clips.push(clip);
    summaries.push(summary);
  }

  return { clips, summaries };
}

// ---------------------------------------------------------------------------
// 6. High-Level Import Orchestrator
// ---------------------------------------------------------------------------

/**
 * High-level orchestration function to fetch files or folders from GitHub
 * and directly output KnowledgeHub datasets.
 * 
 * Usage example:
 * ```ts
 * const result = await importFromGitHubToKnowledgeHub('dragosbo/learn-better/lessons_Claude');
 * console.log(`Imported ${result.importedCount} knowledge items!`);
 * ```
 */
export async function importFromGitHubToKnowledgeHub(
  target: string | { owner: string; repo: string; path?: string; branch?: string },
  options?: KnowledgeHubImportOptions
): Promise<KnowledgeHubImportResult> {
  const errors: string[] = [];

  let owner = '';
  let repo = '';
  let path = '';
  let branch = 'main';

  if (typeof target === 'string') {
    const parsed = parseGitHubUrl(target);
    if (!parsed) {
      throw new Error(`Invalid GitHub repository or URL format: "${target}". Expected "owner/repo" or "owner/repo/folder".`);
    }
    owner = parsed.owner;
    repo = parsed.repo;
    path = parsed.path;
    branch = parsed.branch || 'main';
  } else {
    owner = target.owner;
    repo = target.repo;
    path = target.path || '';
    branch = target.branch || 'main';
  }

  const recursive = options?.recursive !== false;
  const maxFiles = options?.maxFiles || 50;
  const token = options?.token;

  let rawFiles: GitHubFileContent[] = [];

  try {
    rawFiles = await fetchRepositoryFolder(owner, repo, path, branch, recursive, token);
  } catch (err: any) {
    // If folder fetch failed, try fetching as a single file
    try {
      const singleFile = await fetchRepositoryFile(owner, repo, path, branch, token);
      rawFiles = [singleFile];
    } catch {
      throw new Error(`Failed to import from GitHub (${owner}/${repo}/${path}): ${err.message}`);
    }
  }

  if (rawFiles.length === 0) {
    return {
      clips: [],
      summaries: [],
      importedCount: 0,
      sourceRepo: `${owner}/${repo}`,
      folderPath: path,
      branch,
      importedAt: new Date().toISOString(),
      files: [],
      errors: ['No matching files found in target folder.'],
    };
  }

  // Enforce max files limit to avoid browser memory bloat
  const slicedFiles = rawFiles.slice(0, maxFiles);
  const { clips, summaries } = convertGitHubFilesToKnowledgeDataset(slicedFiles, owner, repo, options);

  return {
    clips,
    summaries,
    importedCount: clips.length,
    sourceRepo: `${owner}/${repo}`,
    folderPath: path,
    branch,
    importedAt: new Date().toISOString(),
    files: slicedFiles.map((f) => ({ name: f.name, path: f.path, size: f.size })),
    errors,
  };
}

/**
 * Import specific file paths from a GitHub repository to populate KnowledgeHub datasets.
 * 
 * Usage example:
 * ```ts
 * const result = await importSpecificFilesToKnowledgeHub('owner', 'repo', [
 *   'docs/guide.md',
 *   'lessons/lesson1.md'
 * ]);
 * ```
 */
export async function importSpecificFilesToKnowledgeHub(
  owner: string,
  repo: string,
  filePaths: string[],
  options?: KnowledgeHubImportOptions
): Promise<KnowledgeHubImportResult> {
  const branch = options?.branch || 'main';
  const token = options?.token;
  const maxFiles = options?.maxFiles || 50;

  const targetPaths = filePaths.slice(0, maxFiles);
  const rawFiles = await fetchSpecificFiles(owner, repo, targetPaths, branch, token);

  if (rawFiles.length === 0) {
    return {
      clips: [],
      summaries: [],
      importedCount: 0,
      sourceRepo: `${owner}/${repo}`,
      folderPath: filePaths.length > 0 ? filePaths[0] : '',
      branch,
      importedAt: new Date().toISOString(),
      files: [],
      errors: ['No specified files could be fetched.'],
    };
  }

  const { clips, summaries } = convertGitHubFilesToKnowledgeDataset(rawFiles, owner, repo, options);

  return {
    clips,
    summaries,
    importedCount: clips.length,
    sourceRepo: `${owner}/${repo}`,
    folderPath: `Selective import (${rawFiles.length} files)`,
    branch,
    importedAt: new Date().toISOString(),
    files: rawFiles.map((f) => ({ name: f.name, path: f.path, size: f.size })),
    errors: [],
  };
}

