
/**
 * Monaco Editor wrapper for shell/bash script editing
 * Provides initialization and configuration for the Monaco Editor component
 * 
 * This module uses dynamic imports to ensure Monaco Editor is only loaded
 * on the client side, avoiding SSR issues with Cloudflare Pages.
 * @type {{ editor: any; default?: any; CancellationTokenSource?: any; Emitter?: any; KeyCode?: any; KeyMod?: any; MarkerSeverity?: any; MarkerTag?: any; Position?: any; Range?: any; Selection?: any; SelectionDirection?: any; Token?: any; languages?: any; Uri?: any; createWebWorker?: any; css?: any; html?: any; json?: any; lsp?: any; typescript?: any; }}
 */
let monaco;

/**
 * Initialize Monaco Editor with shell/bash configuration
 * 
 * @param {HTMLElement} container - The DOM element to mount the editor in
 * @param {string} initialValue - The initial script content to display
 * @param {Object} options - Additional editor options to override defaults
 * @returns {Promise<any>} The initialized editor instance
 */
export async function initializeMonacoEditor(container, initialValue = '', options = {}) {
  if (!container) {
    throw new Error('Container element is required for Monaco Editor initialization');
  }

  // Dynamically import Monaco Editor only on the client side
  if (!monaco) {
    monaco = await import('monaco-editor');
  }

  // Default editor configuration optimized for shell script editing
  /** @type {import('monaco-editor').editor.IStandaloneEditorConstructionOptions} */
  const defaultOptions = {
    value: initialValue,
    language: 'shell',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    tabSize: 2,
    insertSpaces: true,
    renderWhitespace: 'selection',
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10
    },
    readOnly: false,
    contextmenu: true,
    quickSuggestions: false,
    folding: true
  };

  // Merge user options with defaults
  const editorOptions = { ...defaultOptions, ...options };

  // Create and return the editor instance
  const editor = monaco.editor.create(container, editorOptions);

  return editor;
}

/**
 * Get the current value from a Monaco Editor instance
 * 
 * @param {monaco.editor.IStandaloneCodeEditor} editor - The editor instance
 * @returns {string} The current editor content
 */
export function getEditorValue(editor) {
  if (!editor) {
    throw new Error('Editor instance is required');
  }
  return editor.getValue();
}

/**
 * Set the value in a Monaco Editor instance
 * 
 * @param {monaco.editor.IStandaloneCodeEditor} editor - The editor instance
 * @param {string} value - The new content to set
 */
export function setEditorValue(editor, value) {
  if (!editor) {
    throw new Error('Editor instance is required');
  }
  editor.setValue(value || '');
}

/**
 * Dispose of a Monaco Editor instance and clean up resources
 * 
 * @param {monaco.editor.IStandaloneCodeEditor} editor - The editor instance to dispose
 */
export function disposeEditor(editor) {
  if (editor) {
    editor.dispose();
  }
}

/**
 * Configure Monaco Editor theme and language settings
 * This can be called before creating editor instances to set global defaults
 */
export async function configureMonaco() {
  // Dynamically import Monaco Editor if not already loaded
  if (!monaco) {
    monaco = await import('monaco-editor');
  }
  
  // Set default theme
  monaco.editor.setTheme('vs-dark');
  
  // Additional global configuration can be added here if needed
  // For example, custom language definitions or theme customizations
}

/**
 * Get Monaco instance (loads it if not already loaded)
 * @returns {Promise<any>} Monaco editor module
 */
export async function getMonaco() {
  if (!monaco) {
    monaco = await import('monaco-editor');
  }
  return monaco;
}
