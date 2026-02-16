import * as https from 'https';
import { SfConstants } from '../sfConstants';
import { SfExtSettings } from '../sfExtSettings';
import { sfExtSettingsList } from '../sfExtSettings';
import { SfUtility, debugLevel } from '../sfUtility';
import * as bundledManifest from '../treeview/data/bundled-templates.json';

/** Represents a GitHub directory entry (file or folder). */
export interface GitHubEntry {
    name: string;
    path: string;
    type: 'file' | 'dir';
    download_url?: string;
    size?: number;
}

/** Template repository configuration from settings. */
export interface TemplateRepo {
    name: string;
    url: string;
    branch?: string;
    description?: string;
}

/** Bundled template folder info for offline fallback. */
interface BundledTemplate {
    name: string;
    files: string[];
}

interface BundledRepo {
    owner: string;
    repo: string;
    branch: string;
    templates: BundledTemplate[];
}

interface BundledManifest {
    repos: BundledRepo[];
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/**
 * Service for fetching ARM templates from GitHub repositories.
 * Uses the GitHub Contents API with in-memory caching and bundled fallback.
 */
export class TemplateService {
    private static _instance: TemplateService | undefined;
    private readonly _cache = new Map<string, CacheEntry<unknown>>();
    private static readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    static getInstance(): TemplateService {
        if (!TemplateService._instance) {
            TemplateService._instance = new TemplateService();
        }
        return TemplateService._instance;
    }

    /** Get configured template repositories from settings. */
    getConfiguredRepos(): TemplateRepo[] {
        return SfExtSettings.getSetting(sfExtSettingsList.templateRepositories)
            || SfConstants.SF_TEMPLATE_REPOS_DEFAULT;
    }

    /**
     * List template directories in a repository.
     * Falls back to bundled manifest if GitHub API is unreachable.
     */
    async listTemplates(repo: TemplateRepo): Promise<GitHubEntry[]> {
        const { owner, repoName } = this._parseRepoUrl(repo.url);
        const branch = repo.branch || 'master';
        const cacheKey = `templates:${owner}/${repoName}:${branch}`;

        const cached = this._getFromCache<GitHubEntry[]>(cacheKey);
        if (cached) { return cached; }

        try {
            const entries = await this._fetchContents(owner, repoName, '', branch);
            // Only return directories (each template is a folder)
            const dirs = entries.filter(e => e.type === 'dir');
            this._setCache(cacheKey, dirs);
            return dirs;
        } catch (error) {
            SfUtility.outputLog('TemplateService: GitHub API failed, trying bundled fallback', error, debugLevel.warn);
            return this._getBundledTemplateList(owner, repoName, branch);
        }
    }

    /**
     * List files in a specific template directory.
     * Falls back to bundled file list if GitHub API is unreachable.
     */
    async listTemplateFiles(repo: TemplateRepo, templatePath: string): Promise<GitHubEntry[]> {
        const { owner, repoName } = this._parseRepoUrl(repo.url);
        const branch = repo.branch || 'master';
        const cacheKey = `files:${owner}/${repoName}:${branch}:${templatePath}`;

        const cached = this._getFromCache<GitHubEntry[]>(cacheKey);
        if (cached) { return cached; }

        try {
            const entries = await this._fetchContents(owner, repoName, templatePath, branch);
            this._setCache(cacheKey, entries);
            return entries;
        } catch (error) {
            SfUtility.outputLog('TemplateService: GitHub API failed for file list, trying bundled fallback', error, debugLevel.warn);
            return this._getBundledFileList(owner, repoName, branch, templatePath);
        }
    }

    /**
     * Fetch raw file content from GitHub.
     * @returns the raw file content as a string.
     */
    async getFileContent(repo: TemplateRepo, filePath: string): Promise<string> {
        const { owner, repoName } = this._parseRepoUrl(repo.url);
        const branch = repo.branch || 'master';
        const cacheKey = `content:${owner}/${repoName}:${branch}:${filePath}`;

        const cached = this._getFromCache<string>(cacheKey);
        if (cached) { return cached; }

        const url = `${SfConstants.GITHUB_RAW_BASE}/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/${encodeURIComponent(branch)}/${filePath}`;
        const content = await this._httpsGet(url);
        this._setCache(cacheKey, content);
        return content;
    }

    /** Build the raw content URL for a file (for README preview etc.) */
    getRawUrl(repo: TemplateRepo, filePath: string): string {
        const { owner, repoName } = this._parseRepoUrl(repo.url);
        const branch = repo.branch || 'master';
        return `${SfConstants.GITHUB_RAW_BASE}/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/${encodeURIComponent(branch)}/${filePath}`;
    }

    /** Clear all cached data. */
    clearCache(): void {
        this._cache.clear();
    }

    /** Map a file name to a VS Code language ID for editor display. */
    static getLanguageId(fileName: string): string {
        const lower = fileName.toLowerCase();
        if (lower.endsWith('.json')) { return 'json'; }
        if (lower.endsWith('.md')) { return 'markdown'; }
        if (lower.endsWith('.ps1')) { return 'powershell'; }
        if (lower.endsWith('.sh')) { return 'shellscript'; }
        if (lower.endsWith('.bicep')) { return 'bicep'; }
        if (lower.endsWith('.yml') || lower.endsWith('.yaml')) { return 'yaml'; }
        return 'plaintext';
    }

    // ── Private helpers ────────────────────────────────────────────────

    private _parseRepoUrl(url: string): { owner: string; repoName: string } {
        // https://github.com/owner/repo → owner, repo
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            throw new Error(`Invalid GitHub URL: ${url}`);
        }
        return { owner: match[1], repoName: match[2].replace(/\.git$/, '') };
    }

    /** Fetch contents listing from GitHub API. */
    private async _fetchContents(owner: string, repo: string, path: string, ref: string): Promise<GitHubEntry[]> {
        const pathSegment = path ? `/${path}` : '';
        const url = `${SfConstants.GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents${pathSegment}?ref=${encodeURIComponent(ref)}`;
        const json = await this._httpsGet(url, true);
        return JSON.parse(json) as GitHubEntry[];
    }

    /** Get template folder list from bundled manifest (offline fallback). */
    private _getBundledTemplateList(owner: string, repoName: string, branch: string): GitHubEntry[] {
        const manifest = bundledManifest as BundledManifest;
        const repoEntry = manifest.repos.find(
            r => r.owner === owner && r.repo === repoName && r.branch === branch,
        );
        if (!repoEntry) { return []; }

        return repoEntry.templates.map(t => ({
            name: t.name,
            path: t.name,
            type: 'dir' as const,
        }));
    }

    /** Get file list for a template from bundled manifest (offline fallback). */
    private _getBundledFileList(owner: string, repoName: string, branch: string, templatePath: string): GitHubEntry[] {
        const manifest = bundledManifest as BundledManifest;
        const repoEntry = manifest.repos.find(
            r => r.owner === owner && r.repo === repoName && r.branch === branch,
        );
        if (!repoEntry) { return []; }

        const template = repoEntry.templates.find(t => t.name === templatePath);
        if (!template) { return []; }

        return template.files.map(f => ({
            name: f,
            path: `${templatePath}/${f}`,
            type: 'file' as const,
            download_url: `${SfConstants.GITHUB_RAW_BASE}/${owner}/${repoName}/${branch}/${templatePath}/${f}`,
        }));
    }

    private _getFromCache<T>(key: string): T | undefined {
        const entry = this._cache.get(key) as CacheEntry<T> | undefined;
        if (entry && (Date.now() - entry.timestamp) < TemplateService.CACHE_TTL_MS) {
            return entry.data;
        }
        if (entry) { this._cache.delete(key); }
        return undefined;
    }

    private _setCache<T>(key: string, data: T): void {
        this._cache.set(key, { data, timestamp: Date.now() });
    }

    /** Simple HTTPS GET that returns the response body as a string. */
    private _httpsGet(url: string, useGitHubHeaders = false): Promise<string> {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const options: https.RequestOptions = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: {
                    'User-Agent': 'vscode-service-fabric-diagnostic-extension',
                },
            };

            if (useGitHubHeaders) {
                options.headers!['Accept'] = 'application/vnd.github.v3+json';
            }

            const req = https.request(options, (res) => {
                if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                    reject(new Error(`HTTP ${res.statusCode}: ${url}`));
                    res.resume(); // drain
                    return;
                }

                const chunks: Uint8Array[] = [];
                res.on('data', (chunk: Uint8Array) => chunks.push(chunk));
                res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
            });

            req.on('error', reject);
            req.setTimeout(15000, () => {
                req.destroy(new Error('Request timeout'));
            });
            req.end();
        });
    }
}
