import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { GitBranch, GitCommit, AlertCircle, Loader2, RefreshCw } from 'lucide-react'

interface ContextDTO {
  activeBranch?: string
  isClean?: boolean
  lastCommit?: string
  issues: Array<{
    number: number
    title: string
    state: string
    assignee: string | null
    url: string
  }>
  commits: Array<{
    sha: string
    message: string
    author: string
    date: string
    url: string
  }>
  recentSnapshots: Array<{
    id: string
    timestamp: string
    branch: string
    summary: string
  }>
  timestamp: string
}

function Dashboard() {
  const [branch, setBranch] = useState<string>('')
  const { data, isLoading, error, refetch } = useQuery<ContextDTO>({
    queryKey: ['context', branch],
    queryFn: () => api.getContext(branch),
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          NeuroSync
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Developer Productivity AI Dashboard
        </p>
      </header>

      <div className="mb-4 flex gap-4 items-center">
        <input
          type="text"
          placeholder="Enter branch name (optional)"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Error loading context: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Branch Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Branch</h2>
            </div>
            {data.activeBranch ? (
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.activeBranch}</p>
                {data.lastCommit && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Last commit: {data.lastCommit}
                  </p>
                )}
                {data.isClean !== undefined && (
                  <p className={`text-sm mt-2 ${data.isClean ? 'text-green-600' : 'text-yellow-600'}`}>
                    {data.isClean ? '✓ Clean working directory' : '⚠ Uncommitted changes'}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No branch information available</p>
            )}
          </div>

          {/* Issues Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Open Issues ({data.issues?.length || 0})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.issues && data.issues.length > 0 ? (
                data.issues.map((issue) => (
                  <a
                    key={issue.number}
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">#{issue.number} {issue.title}</p>
                    {issue.assignee && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Assigned to: {issue.assignee}</p>
                    )}
                  </a>
                ))
              ) : (
                <p className="text-gray-500">No open issues</p>
              )}
            </div>
          </div>

          {/* Recent Commits Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <GitCommit className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Commits</h2>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.commits && data.commits.length > 0 ? (
                data.commits.map((commit) => (
                  <a
                    key={commit.sha}
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <p className="font-mono text-sm text-blue-600">{commit.sha}</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{commit.message}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {commit.author} • {new Date(commit.date).toLocaleDateString()}
                    </p>
                  </a>
                ))
              ) : (
                <p className="text-gray-500">No commits found</p>
              )}
            </div>
          </div>

          {/* Recent Snapshots Card */}
          {data.recentSnapshots && data.recentSnapshots.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:col-span-2 lg:col-span-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Context Snapshots
              </h2>
              <div className="space-y-2">
                {data.recentSnapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-blue-600"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{snapshot.branch}</p>
                        {snapshot.summary && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{snapshot.summary}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(snapshot.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default Dashboard

