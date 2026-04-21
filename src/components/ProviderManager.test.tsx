import { PassThrough } from 'node:stream'

import { afterEach, expect, mock, test } from 'bun:test'
import React from 'react'
import stripAnsi from 'strip-ansi'

import { createRoot } from '../ink.js'
import { KeybindingSetup } from '../keybindings/KeybindingProviderSetup.js'
import { AppStateProvider } from '../state/AppState.js'

const SYNC_START = '\x1B[?2026h'
const SYNC_END = '\x1B[?2026l'

const ORIGINAL_ENV = {
  CLAUDE_CODE_SIMPLE: process.env.CLAUDE_CODE_SIMPLE,
  CLAUDE_CODE_USE_GITHUB: process.env.CLAUDE_CODE_USE_GITHUB,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GH_TOKEN: process.env.GH_TOKEN,
}

function extractLastFrame(output: string): string {
  let lastFrame: string | null = null
  let cursor = 0

  while (cursor < output.length) {
    const start = output.indexOf(SYNC_START, cursor)
    if (start === -1) {
      break
    }

    const contentStart = start + SYNC_START.length
    const end = output.indexOf(SYNC_END, contentStart)
    if (end === -1) {
      break
    }

    const frame = output.slice(contentStart, end)
    if (frame.trim().length > 0) {
      lastFrame = frame
    }
    cursor = end + SYNC_END.length
  }

  return lastFrame ?? output
}

function createTestStreams(): {
  stdout: PassThrough
  stdin: PassThrough & {
    isTTY: boolean
    setRawMode: (mode: boolean) => void
    ref: () => void
    unref: () => void
  }
  getOutput: () => string
} {
  let output = ''
  const stdout = new PassThrough()
  // Use data-mode stdin: PassThrough.write() triggers 'data' events
  // but not 'readable' events reliably. Ink's default readable-mode
  // handler (handleReadable) would never fire, so stdin writes would be
  // silently dropped. Setting OPENCLAUDE_USE_DATA_STDIN=1 before each
  // mount makes Ink use the 'data' event path instead.
  const stdin = new PassThrough() as PassThrough & {
    isTTY: boolean
    setRawMode: (mode: boolean) => void
    ref: () => void
    unref: () => void
  }

  stdin.isTTY = true
  stdin.setRawMode = () => {}
  stdin.ref = () => {}
  stdin.unref = () => {}
  ;(stdout as unknown as { columns: number }).columns = 120
  stdout.on('data', chunk => {
    output += chunk.toString()
  })

  return {
    stdout,
    stdin,
    getOutput: () => output,
  }
}

async function waitForCondition(
  predicate: () => boolean,
  options?: { timeoutMs?: number; intervalMs?: number; flush?: () => void },
): Promise<void> {
  const timeoutMs = options?.timeoutMs ?? 2000
  const intervalMs = options?.intervalMs ?? 16
  const flush = options?.flush
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    // Phase 1: yield so microtasks/macrotasks run
    await Bun.sleep(0)
    // Phase 2: flush React reconciler + render
    flush?.()
    // Phase 3: yield again so effects triggered by flush can settle
    await Bun.sleep(0)
    if (predicate()) {
      return
    }
    await Bun.sleep(intervalMs)
  }

  throw new Error('Timed out waiting for ProviderManager test condition')
}

/**
 * Two-phase event-loop barrier: yield → flush → yield → flush → yield.
 * Ensures microtasks, React reconciler, effects, and async callbacks
 * have all settled before the caller inspects state.
 *
 * Phase 1 (yield): microtasks/macrotasks run (queueMicrotask, Promise.resolve)
 * Phase 2 (flush): React state updates committed, reconciler flushed
 * Phase 3 (yield): React effects fire (useEffect), async callbacks progress
 * Phase 4 (flush): effect-triggered state updates committed
 * Phase 5 (yield): any cascading microtasks from effect-triggered work settle
 */
/**
 * Send a key to stdin. The caller is responsible for waiting for the
 * resulting render via waitForFrameOutput or waitForCondition.
 */
function sendKey(
  stdin: PassThrough,
  key: string,
): void {
  stdin.write(key)
}

function createDeferred<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
} {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(r => {
    resolve = r
  })
  return { promise, resolve }
}

function mockProviderProfilesModule(options?: {
  addProviderProfile?: (...args: unknown[]) => unknown
  getProviderProfiles?: () => unknown[]
  updateProviderProfile?: (...args: unknown[]) => unknown
  setActiveProviderProfile?: (...args: unknown[]) => unknown
}): void {
  mock.module('../utils/providerProfiles.js', () => ({
    addProviderProfile: options?.addProviderProfile ?? (() => null),
    applyActiveProviderProfileFromConfig: () => {},
    deleteProviderProfile: () => ({ removed: false, activeProfileId: null }),
    getActiveProviderProfile: () => null,
    getProviderPresetDefaults: (preset: string) =>
      preset === 'ollama'
        ? {
            provider: 'openai',
            name: 'Ollama',
            baseUrl: 'http://localhost:11434/v1',
            model: 'llama3.1:8b',
            apiKey: '',
          }
        : {
            provider: 'openai',
            name: 'Mock provider',
            baseUrl: 'http://localhost:11434/v1',
            model: 'mock-model',
            apiKey: '',
          },
    getProviderProfiles: options?.getProviderProfiles ?? (() => []),
    setActiveProviderProfile: options?.setActiveProviderProfile ?? (() => null),
    updateProviderProfile: options?.updateProviderProfile ?? (() => null),
  }))
}

function mockProviderManagerDependencies(
  githubSyncRead: () => string | undefined,
  githubAsyncRead: () => Promise<string | undefined>,
  options?: {
    addProviderProfile?: (...args: unknown[]) => unknown
    applySavedProfileToCurrentSession?: (...args: unknown[]) => Promise<string | null>
    clearCodexCredentials?: () => { success: boolean; warning?: string }
    getProviderProfiles?: () => unknown[]
    probeOllamaGenerationReadiness?: () => Promise<{
      state: 'ready' | 'unreachable' | 'no_models' | 'generation_failed'
      models: Array<
        {
          name: string
          sizeBytes?: number | null
          family?: string | null
          families?: string[]
          parameterSize?: string | null
          quantizationLevel?: string | null
        }
      >
      probeModel?: string
      detail?: string
    }>
    codexSyncRead?: () => unknown
    codexAsyncRead?: () => Promise<unknown>
    updateProviderProfile?: (...args: unknown[]) => unknown
    setActiveProviderProfile?: (...args: unknown[]) => unknown
    useCodexOAuthFlow?: (options: {
      onAuthenticated: (tokens: {
        accessToken: string
        refreshToken: string
        accountId?: string
        idToken?: string
        apiKey?: string
      }, persistCredentials: (options?: { profileId?: string }) => void) =>
        void | Promise<void>
    }) => {
      state: 'starting' | 'waiting' | 'error'
      authUrl?: string
      browserOpened?: boolean | null
      message?: string
    }
  },
): void {
  mockProviderProfilesModule({
    addProviderProfile: options?.addProviderProfile,
    getProviderProfiles: options?.getProviderProfiles,
    updateProviderProfile: options?.updateProviderProfile,
    setActiveProviderProfile: options?.setActiveProviderProfile,
  })

  mock.module('../utils/providerDiscovery.js', () => ({
    probeOllamaGenerationReadiness:
      options?.probeOllamaGenerationReadiness ??
      (async () => ({
        state: 'unreachable' as const,
        models: [],
      })),
  }))

  mock.module('../utils/githubModelsCredentials.js', () => ({
    clearGithubModelsToken: () => ({ success: true }),
    GITHUB_MODELS_HYDRATED_ENV_MARKER: 'CLAUDE_CODE_GITHUB_TOKEN_HYDRATED',
    hydrateGithubModelsTokenFromSecureStorage: () => {},
    readGithubModelsToken: githubSyncRead,
    readGithubModelsTokenAsync: githubAsyncRead,
  }))

  mock.module('../utils/codexCredentials.js', () => ({
    attachCodexProfileIdToStoredCredentials: () => ({ success: true }),
    clearCodexCredentials:
      options?.clearCodexCredentials ?? (() => ({ success: true })),
    readCodexCredentials:
      options?.codexSyncRead ?? (() => undefined),
    readCodexCredentialsAsync:
      options?.codexAsyncRead ?? (async () => undefined),
  }))

  mock.module('../utils/providerProfile.js', () => ({
    applySavedProfileToCurrentSession:
      options?.applySavedProfileToCurrentSession ?? (async () => null),
    buildCodexOAuthProfileEnv: (tokens: {
      accessToken: string
      accountId?: string
      idToken?: string
    }) => {
      const accountId =
        tokens.accountId ??
        (tokens.idToken ? 'acct_from_id_token' : undefined) ??
        (tokens.accessToken ? 'acct_from_access_token' : undefined)

      if (!accountId) {
        return null
      }

      return {
        OPENAI_BASE_URL: 'https://chatgpt.com/backend-api/codex',
        OPENAI_MODEL: 'codexplan',
        CHATGPT_ACCOUNT_ID: accountId,
        CODEX_CREDENTIAL_SOURCE: 'oauth' as const,
      }
    },
    clearPersistedCodexOAuthProfile: () => null,
    createProfileFile: (profile: string, env: Record<string, unknown>) => ({
      profile,
      env,
      createdAt: '2026-04-10T00:00:00.000Z',
    }),
  }))

  mock.module('../utils/settings/settings.js', () => ({
    updateSettingsForSource: () => ({ error: null }),
  }))

  mock.module('./useCodexOAuthFlow.js', () => ({
    useCodexOAuthFlow:
      options?.useCodexOAuthFlow ??
      (() => ({
        state: 'waiting' as const,
        authUrl: 'https://chatgpt.com/codex',
        browserOpened: true,
      })),
  }))
}

async function waitForFrameOutput(
  getOutput: () => string,
  predicate: (output: string) => boolean,
  flush?: () => void,
  timeoutMs = 2500,
): Promise<string> {
  let output = ''

  await waitForCondition(() => {
    output = stripAnsi(extractLastFrame(getOutput()))
    // ProviderManager shows loading state before content, skip loading frames
    if (output.includes('Loading providers') || output.includes('Activating provider')) {
      return false
    }
    return predicate(output)
  }, { timeoutMs, flush })

  return output
}

async function mountProviderManager(
  ProviderManager: React.ComponentType<{
    mode: 'first-run' | 'manage'
    onDone: (result?: unknown) => void
  }>,
  options?: {
    mode?: 'first-run' | 'manage'
    onDone?: (result?: unknown) => void
  },
): Promise<{
  stdin: PassThrough
  getOutput: () => string
  flush: () => void
  dispose: () => Promise<void>
}> {
  const { stdout, stdin, getOutput } = createTestStreams()

  // Ink's App component reads this env at construction time to choose
  // between 'readable' and 'data' stdin modes. PassThrough streams do not
  // reliably emit 'readable' events after write(), so force data mode.
  const prevDataStdin = process.env.OPENCLAUDE_USE_DATA_STDIN
  process.env.OPENCLAUDE_USE_DATA_STDIN = '1'

  const root = await createRoot({
    stdout: stdout as unknown as NodeJS.WriteStream,
    stdin: stdin as unknown as NodeJS.ReadStream,
    patchConsole: false,
  })

  // Restore after Ink instance is created (it already read the env)
  if (prevDataStdin === undefined) {
    delete process.env.OPENCLAUDE_USE_DATA_STDIN
  } else {
    process.env.OPENCLAUDE_USE_DATA_STDIN = prevDataStdin
  }

  root.render(
    <AppStateProvider>
      <KeybindingSetup>
        <ProviderManager
          mode={options?.mode ?? 'manage'}
          onDone={options?.onDone ?? (() => {})}
        />
      </KeybindingSetup>
    </AppStateProvider>,
  )

  return {
    stdin,
    getOutput,
    flush: () => root.flush(),
    dispose: async () => {
      root.unmount()
      stdin.end()
      stdout.end()
      await Bun.sleep(0)
    },
  }
}

async function renderProviderManagerFrame(
  ProviderManager: React.ComponentType<{
    mode: 'first-run' | 'manage'
    onDone: (result?: unknown) => void
  }>,
  options?: {
    mode?: 'first-run' | 'manage'
    waitForOutput?: (output: string) => boolean
    timeoutMs?: number
  },
): Promise<string> {
  const mounted = await mountProviderManager(ProviderManager, {
    mode: options?.mode,
  })

  const output = await waitForFrameOutput(
    mounted.getOutput,
    frame => {
      if (!options?.waitForOutput) {
        return frame.includes('Provider manager') || frame.includes('Set up provider')
      }
      return options.waitForOutput(frame)
    },
    mounted.flush,
    options?.timeoutMs ?? 2500,
  )

  await mounted.dispose()
  return output
}

afterEach(() => {
  mock.restore()

  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) {
      delete process.env[key as keyof typeof ORIGINAL_ENV]
    } else {
      process.env[key as keyof typeof ORIGINAL_ENV] = value
    }
  }
})

test('ProviderManager resolves GitHub virtual provider from async storage without sync reads in render flow', async () => {
  delete process.env.CLAUDE_CODE_USE_GITHUB
  delete process.env.GITHUB_TOKEN
  delete process.env.GH_TOKEN

  const syncRead = mock(() => {
    throw new Error('sync credential read should not run in ProviderManager render flow')
  })
  const asyncRead = mock(async () => 'stored-token')

  mockProviderManagerDependencies(syncRead, asyncRead)

  const nonce = `${Date.now()}-${Math.random()}`
  const { ProviderManager } = await import(`./ProviderManager.js?ts=${nonce}`)
  const output = await renderProviderManagerFrame(ProviderManager, {
    waitForOutput: frame =>
      frame.includes('Provider manager') &&
      frame.includes('GitHub Models') &&
      frame.includes('token stored'),
  })

  expect(output).toContain('Provider manager')
  expect(output).toContain('GitHub Models')
  expect(output).toContain('token stored')
  expect(output).not.toContain('No provider profiles configured yet.')

  expect(syncRead).not.toHaveBeenCalled()
  expect(asyncRead).toHaveBeenCalled()
})

test('ProviderManager avoids first-frame false negative while stored-token lookup is pending', async () => {
  delete process.env.CLAUDE_CODE_USE_GITHUB
  delete process.env.GITHUB_TOKEN
  delete process.env.GH_TOKEN

  const syncRead = mock(() => {
    throw new Error('sync credential read should not run in ProviderManager render flow')
  })
  const deferredStoredToken = createDeferred<string | undefined>()
  const asyncRead = mock(async () => deferredStoredToken.promise)

  mockProviderManagerDependencies(syncRead, asyncRead)

  const nonce = `${Date.now()}-${Math.random()}`
  const { ProviderManager } = await import(`./ProviderManager.js?ts=${nonce}`)
  const mounted = await mountProviderManager(ProviderManager)

  const firstFrame = await waitForFrameOutput(
    mounted.getOutput,
    frame => frame.includes('Provider manager'),
    mounted.flush,
  )

  expect(firstFrame).toContain('Checking GitHub Models credentials...')
  expect(firstFrame).not.toContain('No provider profiles configured yet.')

  deferredStoredToken.resolve('stored-token')

  const resolvedFrame = await waitForFrameOutput(
    mounted.getOutput,
    frame => frame.includes('GitHub Models') && frame.includes('token stored'),
    mounted.flush,
  )

  expect(resolvedFrame).toContain('GitHub Models')
  expect(resolvedFrame).toContain('token stored')

  await mounted.dispose()

  expect(syncRead).not.toHaveBeenCalled()
  expect(asyncRead).toHaveBeenCalled()
})

test('ProviderManager first-run Ollama preset auto-detects installed models', async () => {
  delete process.env.CLAUDE_CODE_USE_GITHUB
  delete process.env.GITHUB_TOKEN
  delete process.env.GH_TOKEN

  const onDone = mock(() => {})
  const addProviderProfile = mock((payload: {
    provider: string
    name: string
    baseUrl: string
    model: string
    apiKey?: string
  }) => ({
    id: 'provider_ollama',
    provider: payload.provider,
    name: payload.name,
    baseUrl: payload.baseUrl,
    model: payload.model,
    apiKey: payload.apiKey,
  }))

  mockProviderManagerDependencies(
    () => undefined,
    async () => undefined,
    {
      addProviderProfile,
      probeOllamaGenerationReadiness: async () => ({
        state: 'ready',
        models: [
          {
            name: 'gemma4:31b-cloud',
            family: 'gemma',
            parameterSize: '31b',
          },
          {
            name: 'kimi-k2.5:cloud',
            family: 'kimi',
            parameterSize: '2.5b',
          },
        ],
        probeModel: 'gemma4:31b-cloud',
      }),
    },
  )

  const nonce = `${Date.now()}-${Math.random()}`
  const { ProviderManager } = await import(`./ProviderManager.js?ts=${nonce}`)
  const mounted = await mountProviderManager(ProviderManager, {
    mode: 'first-run',
    onDone,
  })

  await waitForFrameOutput(
    mounted.getOutput,
    frame => frame.includes('Set up provider') && frame.includes('Ollama'),
    mounted.flush,
  )

  // Navigate down to Ollama preset and select it
  sendKey(mounted.stdin, 'j')
  sendKey(mounted.stdin, '\r')

  const modelFrame = await waitForFrameOutput(
    mounted.getOutput,
    frame =>
      frame.includes('Choose an Ollama model') &&
      frame.includes('gemma4:31b-cloud') &&
      frame.includes('kimi-k2.5:cloud'),
    mounted.flush,
  )

  expect(modelFrame).toContain('Choose an Ollama model')
  expect(modelFrame).toContain('gemma4:31b-cloud')

  // Select the top model
  sendKey(mounted.stdin, '\r')

  await waitForCondition(() => onDone.mock.calls.length > 0, { flush: mounted.flush })

  expect(addProviderProfile).toHaveBeenCalled()
  expect(addProviderProfile.mock.calls[0]?.[0]).toMatchObject({
    name: 'Ollama',
    baseUrl: 'http://localhost:11434/v1',
    model: 'gemma4:31b-cloud',
  })
  expect(onDone).toHaveBeenCalledWith(
    expect.objectContaining({
      action: 'saved',
      message: 'Provider configured: Ollama',
    }),
  )

  await mounted.dispose()
})

test('ProviderManager first-run Codex OAuth switches the current session after login completes', async () => {
  delete process.env.CLAUDE_CODE_SIMPLE
  delete process.env.CLAUDE_CODE_USE_GITHUB
  delete process.env.GITHUB_TOKEN
  delete process.env.GH_TOKEN

  const onDone = mock(() => {})
  const applySavedProfileToCurrentSession = mock(async () => null)
  const persistCredentials = mock(() => {})
  const addProviderProfile = mock((payload: {
    provider: string
    name: string
    baseUrl: string
    model: string
    apiKey?: string
  }) => ({
    id: 'provider_codex_oauth',
    provider: payload.provider,
    name: payload.name,
    baseUrl: payload.baseUrl,
    model: payload.model,
    apiKey: payload.apiKey,
  }))

  mockProviderManagerDependencies(
    () => undefined,
    async () => undefined,
    {
      addProviderProfile,
      applySavedProfileToCurrentSession,
      useCodexOAuthFlow: ({ onAuthenticated }) => {
        const hasAuthenticated = React.useRef(false)

        React.useEffect(() => {
          if (hasAuthenticated.current) {
            return
          }
          hasAuthenticated.current = true
          void onAuthenticated({
            accessToken: 'oauth-access-token',
            refreshToken: 'oauth-refresh-token',
            accountId: 'acct_oauth',
          }, persistCredentials)
        }, [onAuthenticated])

        return {
          state: 'waiting',
          authUrl: 'https://chatgpt.com/codex',
          browserOpened: true,
        }
      },
    },
  )

  const nonce = `${Date.now()}-${Math.random()}`
  const { ProviderManager } = await import(`./ProviderManager.js?ts=${nonce}`)
  const mounted = await mountProviderManager(ProviderManager, {
    mode: 'first-run',
    onDone,
  })

  await waitForFrameOutput(
    mounted.getOutput,
    frame => frame.includes('Set up provider') && frame.includes('Codex OAuth'),
    mounted.flush,
  )

  // Navigate to Codex OAuth option (index 3)
  await sendKey(mounted.stdin, 'j', mounted.flush)
  await sendKey(mounted.stdin, 'j', mounted.flush)
  await sendKey(mounted.stdin, 'j', mounted.flush)
  await sendKey(mounted.stdin, '\r', mounted.flush)

  await waitForCondition(() => onDone.mock.calls.length > 0, { flush: mounted.flush })

  expect(addProviderProfile).toHaveBeenCalledWith(
    expect.objectContaining({
      provider: 'openai',
      name: 'Codex OAuth',
      baseUrl: 'https://chatgpt.com/backend-api/codex',
      model: 'codexplan',
      apiKey: '',
    }),
    expect.objectContaining({ makeActive: true }),
  )
  expect(applySavedProfileToCurrentSession).toHaveBeenCalled()
  expect(persistCredentials).toHaveBeenCalledWith({
    profileId: 'provider_codex_oauth',
  })
  expect(onDone).toHaveBeenCalledWith(
    expect.objectContaining({
      action: 'saved',
      message:
        'Codex OAuth configured. OpenClaude switched to it for this session.',
    }),
  )

  await mounted.dispose()
})

test('ProviderManager first-run Codex OAuth reports next-startup fallback when session activation fails', async () => {
  delete process.env.CLAUDE_CODE_SIMPLE
  delete process.env.CLAUDE_CODE_USE_GITHUB
  delete process.env.GITHUB_TOKEN
  delete process.env.GH_TOKEN

  const onDone = mock(() => {})
  const applySavedProfileToCurrentSession = mock(
    async () => 'validation failed',
  )
  const persistCredentials = mock(() => {})
  const addProviderProfile = mock((payload: {
    provider: string
    name: string
    baseUrl: string
    model: string
    apiKey?: string
  }) => ({
    id: 'provider_codex_oauth',
    provider: payload.provider,
    name: payload.name,
    baseUrl: payload.baseUrl,
    model: payload.model,
    apiKey: payload.apiKey,
  }))

  mockProviderManagerDependencies(
    () => undefined,
    async () => undefined,
    {
      addProviderProfile,
      applySavedProfileToCurrentSession,
      useCodexOAuthFlow: ({ onAuthenticated }) => {
        const hasAuthenticated = React.useRef(false)

        React.useEffect(() => {
          if (hasAuthenticated.current) {
            return
          }
          hasAuthenticated.current = true
          void onAuthenticated({
            accessToken: 'oauth-access-token',
            refreshToken: 'oauth-refresh-token',
            accountId: 'acct_oauth',
          }, persistCredentials)
        }, [onAuthenticated])

        return {
          state: 'waiting',
          authUrl: 'https://chatgpt.com/codex',
          browserOpened: true,
        }
      },
    },
  )

  const nonce = `${Date.now()}-${Math.random()}`
  const { ProviderManager } = await import(`./ProviderManager.js?ts=${nonce}`)
  const mounted = await mountProviderManager(ProviderManager, {
    mode: 'first-run',
    onDone,
  })

  await waitForFrameOutput(
    mounted.getOutput,
    frame => frame.includes('Set up provider') && frame.includes('Codex OAuth'),
    mounted.flush,
  )

  // Navigate to Codex OAuth option (index 3)
  await sendKey(mounted.stdin, 'j', mounted.flush)
  await sendKey(mounted.stdin, 'j', mounted.flush)
  await sendKey(mounted.stdin, 'j', mounted.flush)
  await sendKey(mounted.stdin, '\r', mounted.flush)

  await waitForCondition(() => onDone.mock.calls.length > 0, { flush: mounted.flush })

  expect(persistCredentials).toHaveBeenCalledWith({
    profileId: 'provider_codex_oauth',
  })
  expect(onDone).toHaveBeenCalledWith(
    expect.objectContaining({
      action: 'saved',
      message:
        'Codex OAuth configured. Saved for next startup. Warning: validation failed.',
    }),
  )

  await mounted.dispose()
})

test('ProviderManager does not hijack a manual Codex profile when OAuth credentials are not yet linked', async () => {
  delete process.env.CLAUDE_CODE_SIMPLE
  delete process.env.CLAUDE_CODE_USE_GITHUB
  delete process.env.GITHUB_TOKEN
  delete process.env.GH_TOKEN

  const onDone = mock(() => {})
  const manualProfile = {
    id: 'provider_manual_codex',
    provider: 'openai',
    name: 'Codex OAuth',
    baseUrl: 'https://chatgpt.com/backend-api/codex',
    model: 'gpt-5.4',
    apiKey: 'manual-key',
  }
  const addProviderProfile = mock((payload: {
    provider: string
    name: string
    baseUrl: string
    model: string
    apiKey?: string
  }) => ({
    id: 'provider_codex_oauth',
    provider: payload.provider,
    name: payload.name,
    baseUrl: payload.baseUrl,
    model: payload.model,
    apiKey: payload.apiKey,
  }))
  const updateProviderProfile = mock(() => manualProfile)
  const persistCredentials = mock(() => {})

  mockProviderManagerDependencies(
    () => undefined,
    async () => undefined,
    {
      addProviderProfile,
      getProviderProfiles: () => [manualProfile],
      updateProviderProfile,
      useCodexOAuthFlow: ({ onAuthenticated }) => {
        const hasAuthenticated = React.useRef(false)

        React.useEffect(() => {
          if (hasAuthenticated.current) {
            return
          }
          hasAuthenticated.current = true
          void onAuthenticated({
            accessToken: 'oauth-access-token',
            refreshToken: 'oauth-refresh-token',
            accountId: 'acct_oauth',
          }, persistCredentials)
        }, [onAuthenticated])

        return {
          state: 'waiting',
          authUrl: 'https://chatgpt.com/codex',
          browserOpened: true,
        }
      },
    },
  )

  const nonce = `${Date.now()}-${Math.random()}`
  const { ProviderManager } = await import(`./ProviderManager.js?ts=${nonce}`)
  const mounted = await mountProviderManager(ProviderManager, {
    mode: 'first-run',
    onDone,
  })

  await waitForFrameOutput(
    mounted.getOutput,
    frame => frame.includes('Set up provider') && frame.includes('Codex OAuth'),
    mounted.flush,
  )

  // Navigate to Codex OAuth option (index 3)
  await sendKey(mounted.stdin, 'j', mounted.flush)
  await sendKey(mounted.stdin, 'j', mounted.flush)
  await sendKey(mounted.stdin, 'j', mounted.flush)
  await sendKey(mounted.stdin, '\r', mounted.flush)

  await waitForCondition(() => onDone.mock.calls.length > 0, { flush: mounted.flush })

  expect(addProviderProfile).toHaveBeenCalledTimes(1)
  expect(updateProviderProfile).not.toHaveBeenCalled()
  expect(persistCredentials).toHaveBeenCalledWith({
    profileId: 'provider_codex_oauth',
  })

  await mounted.dispose()
})

test('ProviderManager keeps Codex OAuth as next-startup only when activating the session fails from the menu', async () => {
  delete process.env.CLAUDE_CODE_SIMPLE
  delete process.env.CLAUDE_CODE_USE_GITHUB
  delete process.env.GITHUB_TOKEN
  delete process.env.GH_TOKEN

  const codexProfile = {
    id: 'provider_codex_oauth',
    provider: 'openai',
    name: 'Codex OAuth',
    baseUrl: 'https://chatgpt.com/backend-api/codex',
    model: 'codexplan',
    apiKey: '',
  }

  const applySavedProfileToCurrentSession = mock(
    async () => 'validation failed',
  )
  const setActiveProviderProfile = mock(() => codexProfile)

  mockProviderManagerDependencies(
    () => undefined,
    async () => undefined,
    {
      applySavedProfileToCurrentSession,
      getProviderProfiles: () => [codexProfile],
      setActiveProviderProfile,
      codexAsyncRead: async () => ({
        accessToken: 'oauth-access-token',
        refreshToken: 'oauth-refresh-token',
        accountId: 'acct_oauth',
        profileId: 'provider_codex_oauth',
      }),
    },
  )

  const nonce = `${Date.now()}-${Math.random()}`
  const { ProviderManager } = await import(`./ProviderManager.js?ts=${nonce}`)
  const mounted = await mountProviderManager(ProviderManager)

  await waitForFrameOutput(
    mounted.getOutput,
    frame =>
      frame.includes('Provider manager') &&
      frame.includes('Set active provider') &&
      frame.includes('Log out Codex OAuth'),
    mounted.flush,
  )

  await sendKey(mounted.stdin, 'j', mounted.flush)
  await sendKey(mounted.stdin, '\r', mounted.flush)

  await waitForFrameOutput(
    mounted.getOutput,
    frame => frame.includes('Set active provider') && frame.includes('Codex OAuth'),
    mounted.flush,
  )

  await sendKey(mounted.stdin, '\r', mounted.flush)

  await waitForCondition(() => setActiveProviderProfile.mock.calls.length > 0, { flush: mounted.flush })
  await waitForCondition(
    () => applySavedProfileToCurrentSession.mock.calls.length > 0,
    { flush: mounted.flush },
  )
  mounted.flush()
  const output = stripAnsi(extractLastFrame(mounted.getOutput()))

  expect(output).toContain(
    'Active provider: Codex OAuth. Saved for next startup. Warning: validation failed.',
  )
  expect(applySavedProfileToCurrentSession).toHaveBeenCalled()
  expect(setActiveProviderProfile).toHaveBeenCalledWith('provider_codex_oauth')

  await mounted.dispose()
})

test('ProviderManager resolves Codex OAuth state from async storage without sync reads in render flow', async () => {
  delete process.env.CLAUDE_CODE_SIMPLE
  delete process.env.CLAUDE_CODE_USE_GITHUB
  delete process.env.GITHUB_TOKEN
  delete process.env.GH_TOKEN

  const githubSyncRead = mock(() => undefined)
  const githubAsyncRead = mock(async () => undefined)
  const codexSyncRead = mock(() => {
    throw new Error('sync codex credential read should not run in ProviderManager render flow')
  })
  const codexAsyncRead = mock(async () => ({
    accessToken: 'codex-access-token',
    refreshToken: 'codex-refresh-token',
  }))

  mockProviderManagerDependencies(githubSyncRead, githubAsyncRead, {
    codexSyncRead,
    codexAsyncRead,
  })

  const nonce = `${Date.now()}-${Math.random()}`
  const { ProviderManager } = await import(`./ProviderManager.js?ts=${nonce}`)
  const output = await renderProviderManagerFrame(ProviderManager, {
    waitForOutput: frame =>
      frame.includes('Provider manager') &&
      frame.includes('Log out Codex OAuth'),
  })

  expect(output).toContain('Provider manager')
  expect(output).toContain('Log out Codex OAuth')
  expect(codexSyncRead).not.toHaveBeenCalled()
  expect(codexAsyncRead).toHaveBeenCalled()
})

test('ProviderManager hides Codex OAuth setup in bare mode', async () => {
  process.env.CLAUDE_CODE_SIMPLE = '1'
  delete process.env.CLAUDE_CODE_USE_GITHUB
  delete process.env.GITHUB_TOKEN
  delete process.env.GH_TOKEN

  const githubSyncRead = mock(() => undefined)
  const githubAsyncRead = mock(async () => undefined)

  mockProviderManagerDependencies(githubSyncRead, githubAsyncRead)

  const nonce = `${Date.now()}-${Math.random()}`
  const { ProviderManager } = await import(`./ProviderManager.js?ts=${nonce}`)
  const output = await renderProviderManagerFrame(ProviderManager, {
    mode: 'first-run',
    waitForOutput: frame =>
      frame.includes('Set up provider') && frame.includes('OpenAI'),
  })

  expect(output).toContain('Set up provider')
  expect(output).not.toContain('Codex OAuth')
})
