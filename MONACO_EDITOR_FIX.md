# Monaco Editor Cloudflare Pages Deployment Fix

## Problem
Cloudflare Pages deployment was failing with the error:
```
✘ [ERROR] No loader is configured for ".ttf" files: 
../../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf
```

This occurred because Cloudflare Pages was trying to rebundle the already-built `_worker.js` file and encountering Monaco Editor's font files (`.ttf`) that didn't have a loader configured.

## Root Cause
Monaco Editor was being imported statically in `src/lib/monaco.js`:
```javascript
import * as monaco from 'monaco-editor';
```

This caused Monaco Editor to be included in the server-side bundle (`_worker.js`), which then failed during Cloudflare's rebundling process because:
1. Monaco Editor is a client-only library (requires browser APIs)
2. The `.ttf` font files don't have a loader configured in Cloudflare's bundler
3. Monaco Editor should never be in the server bundle

## Solution
Changed Monaco Editor to use **dynamic imports** so it's only loaded on the client side:

### 1. Updated `src/lib/monaco.js`
Changed from static import to dynamic import:

**Before:**
```javascript
import * as monaco from 'monaco-editor';

export function initializeMonacoEditor(container, initialValue = '', options = {}) {
  // ... code using monaco directly
}
```

**After:**
```javascript
let monaco;

export async function initializeMonacoEditor(container, initialValue = '', options = {}) {
  // Dynamically import Monaco Editor only on the client side
  if (!monaco) {
    monaco = await import('monaco-editor');
  }
  // ... code using monaco
}
```

### 2. Updated `vite.config.js`
Added configuration to exclude Monaco Editor from SSR:

```javascript
export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  ssr: {
    // Exclude Monaco Editor from SSR bundle - it's client-only
    noExternal: []
  },
  optimizeDeps: {
    // Exclude Monaco Editor from dependency pre-bundling
    exclude: ['monaco-editor']
  }
});
```

## Verification
After the fix:

1. **Build succeeds locally**: ✅
   ```bash
   npm run build
   ```

2. **Monaco Editor NOT in worker bundle**: ✅
   ```bash
   grep -i "monaco" .svelte-kit/cloudflare/_worker.js
   # Returns nothing - Monaco is not in the worker
   ```

3. **Font files NOT in worker bundle**: ✅
   ```bash
   grep -i "\.ttf" .svelte-kit/cloudflare/_worker.js
   # Returns nothing - No .ttf references in worker
   ```

4. **Monaco Editor assets in client bundle**: ✅
   ```bash
   ls .svelte-kit/output/client/_app/immutable/assets/
   # Shows: codicon.ngg6Pgfi.ttf (and other Monaco assets)
   ```

## Impact
- Monaco Editor is now properly loaded only on the client side
- The `_worker.js` file no longer contains Monaco Editor code or font files
- Cloudflare Pages deployment should succeed without bundling errors
- The editor page (`/[tool]/edit`) will still work correctly in the browser

## Files Changed
1. `src/lib/monaco.js` - Changed to use dynamic imports
2. `vite.config.js` - Added SSR exclusion configuration

## Testing
The Svelte component (`src/routes/[tool]/edit/+page.svelte`) already uses `onMount` to initialize the editor, which ensures it only runs in the browser. The async nature of `initializeMonacoEditor` is handled correctly with the existing error handling and fallback to textarea.

## Next Steps
1. Commit these changes
2. Push to GitHub
3. Cloudflare Pages will automatically rebuild
4. Deployment should succeed without the `.ttf` loader error
