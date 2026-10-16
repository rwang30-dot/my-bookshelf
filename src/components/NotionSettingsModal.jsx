import React, { useState, useEffect } from 'react';
import { X, Key, Database, CheckCircle2, AlertTriangle, RefreshCw, HelpCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export default function NotionSettingsModal({
  isOpen,
  onClose,
  isDemo,
  setIsDemo,
  onConfigSaved,
}) {
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Load stored keys from localStorage
    const storedKey = localStorage.getItem('notion_api_key') || '';
    const storedDb = localStorage.getItem('notion_database_id') || '';
    setApiKey(storedKey);
    setDatabaseId(storedDb);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim() || undefined,
          databaseId: databaseId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Connection failed.');
      }

      setTestResult(data);
    } catch (err) {
      setTestError(err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('notion_api_key', apiKey.trim());
    localStorage.setItem('notion_database_id', databaseId.trim());
    if (apiKey.trim() && databaseId.trim()) {
      setIsDemo(false);
    }
    onConfigSaved({ apiKey: apiKey.trim(), databaseId: databaseId.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#faf8f5]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100/70 text-amber-800 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">Notion Connection</h3>
              <p className="text-xs text-stone-500">Configured for Notion API 2026-03-11 (Data Sources)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Demo Mode Toggle Banner */}
          <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-stone-900 block">Prototype Mode</span>
              <p className="text-xs text-stone-500 mt-0.5">
                {isDemo
                  ? 'Currently in Demo Mode with sample curated books.'
                  : 'Currently connected to Live Notion database.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDemo(!isDemo)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                isDemo
                  ? 'bg-amber-100/80 text-amber-900 border-amber-300'
                  : 'bg-emerald-100/80 text-emerald-900 border-emerald-300'
              }`}
            >
              {isDemo ? 'Switch to Live Notion' : 'Switch to Demo Mode'}
            </button>
          </div>

          {/* Setup Help Collapsible */}
          <div className="border border-amber-200/80 bg-amber-50/50 rounded-xl p-4 text-xs text-stone-700">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center justify-between w-full font-semibold text-amber-900 text-left"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-700" />
                How to set up your Notion integration in 3 quick steps:
              </span>
              <span className="text-amber-700">{showHelp ? 'Hide' : 'Show'}</span>
            </button>
            {showHelp && (
              <ol className="list-decimal list-inside space-y-1.5 mt-3 pt-3 border-t border-amber-200/60 leading-relaxed text-stone-600">
                <li>
                  Go to{' '}
                  <a
                    href="https://www.notion.so/profile/integrations"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-800 underline inline-flex items-center gap-0.5 font-medium"
                  >
                    notion.so/profile/integrations <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  and click <strong>+ New integration</strong>. Name it "My Bookshelf".
                </li>
                <li>
                  Copy the <strong>Internal Integration Secret</strong> (starts with <code className="bg-amber-100 px-1 rounded">ntn_...</code> or <code className="bg-amber-100 px-1 rounded">secret_...</code>).
                </li>
                <li>
                  Open your Notion Database page, click the <strong>•••</strong> menu at the top-right &gt; <strong>Connections</strong> &gt; Add your integration.
                </li>
                <li>
                  Copy the 32-character <strong>Database ID</strong> from your database URL (the string right before the <code className="bg-amber-100 px-1 rounded">?v=</code>).
                </li>
              </ol>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                <span>Notion Integration Token / Secret</span>
                <span className="text-[10px] text-stone-400 font-normal">Stored locally in browser</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ntn_... or secret_..."
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition font-mono"
                />
                <Key className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Notion Database ID or Full URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={databaseId}
                  onChange={(e) => setDatabaseId(e.target.value)}
                  placeholder="e.g. 1a2b3c4d5e6f... or full notion.so/..."
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition font-mono"
                />
                <Database className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                {testing ? 'Testing...' : 'Test & Validate Database'}
              </button>
            </div>
          </div>

          {/* Test Error */}
          {testError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Connection Test Failed</p>
                <p className="mt-0.5 text-rose-600">{testError}</p>
              </div>
            </div>
          )}

          {/* Test Success / Diagnostics */}
          {testResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Connected to "{testResult.databaseTitle}"</span>
              </div>

              <div className="text-stone-600 space-y-1 pl-6">
                <p>
                  API Version: <span className="font-mono text-emerald-700">{testResult.apiVersion}</span>
                </p>
                {testResult.dataSourceId && (
                  <p>
                    Data Source ID: <span className="font-mono text-emerald-700">{testResult.dataSourceId}</span>
                  </p>
                )}
              </div>

              {/* Property Validation Checklist */}
              <div className="pt-2 border-t border-emerald-200/60 pl-6 space-y-1.5">
                <p className="font-semibold text-emerald-900 mb-1">Required Properties Check:</p>
                {Object.entries(testResult.propertyCheck).map(([propKey, info]) => (
                  <div key={propKey} className="flex items-center justify-between text-[11px]">
                    <span className="capitalize text-stone-700">{info.expected}:</span>
                    {info.found ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {info.propertyName || 'Detected'}
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Missing
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Credentials kept secure</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 rounded-xl hover:bg-stone-200/50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-sm transition"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
