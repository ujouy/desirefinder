# Python/ChromaDB Backend Integration Guide

This guide explains how the Python/ChromaDB backend has been integrated into the Perplexica codebase.

## Overview

The integration follows a "surgical injection" approach - we added a new search provider without modifying the core Perplexica architecture. The system now supports calling an external Python API for adult video search while maintaining compatibility with existing search sources.

## Architecture

### 1. Backend Agent (`src/lib/agents/search/researcher/actions/adultSearch.ts`)

**Purpose**: New research action that calls your Python backend API

**Key Features**:
- Calls `http://localhost:8000/search?q={query}` (configurable via `PYTHON_API_URL` env var)
- Converts Python API response format `[{title, url, thumbnail, vibe}]` to Perplexica's `Chunk` format
- Handles errors gracefully (returns empty results instead of crashing)
- Supports all three search modes: speed, balanced, quality
- Integrates with the existing research pipeline

**Response Format Expected from Python API**:
```json
[
  {
    "title": "Video Title",
    "url": "https://example.com/video",
    "thumbnail": "https://example.com/thumb.jpg",
    "vibe": "romantic, sensual",
    "description": "Optional description",
    "platform": "pornhub"
  }
]
```

### 2. Source Registration

**Files Modified**:
- `src/lib/agents/search/types.ts` - Added `'adult'` to `SearchSources` type
- `src/lib/agents/search/researcher/actions/index.ts` - Registered `adultSearchAction`
- `src/components/MessageInputActions/Sources.tsx` - Added "Adult Videos" option to UI

**How It Works**:
- When user selects "Adult Videos" in the source selector, `'adult'` is added to the sources array
- The `Researcher` class automatically includes `adult_search` action when `'adult'` is in sources
- The LLM agent can then call `adult_search` tool when appropriate

### 3. UI Components

**Video Results Display**:
- `src/components/VideoResults.tsx` - Displays video cards with thumbnails
- `src/components/MessageSources.tsx` - Automatically detects video results and uses VideoResults component
- `src/components/AdultVideoCard.tsx` - Individual video card component (available for future use)

**Features**:
- Thumbnail previews
- Hover effects with play overlay
- Vibe/score badges
- Responsive grid layout
- Direct links to videos

## Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Python API URL (defaults to http://localhost:8000)
PYTHON_API_URL=http://localhost:8000
```

### Python Backend Requirements

Your Python backend should:

1. **Run on port 8000** (or update `PYTHON_API_URL`)
2. **Accept GET requests** at `/search?q={query}`
3. **Return JSON** in the format:
   ```json
   [
     {
       "title": "Video Title",
       "url": "https://example.com/video",
       "thumbnail": "https://example.com/thumb.jpg",
       "vibe": "romantic, sensual",
       "description": "Optional",
       "platform": "pornhub"
     }
   ]
   ```

## Usage

### 1. Start Your Python Backend

```bash
# In your Python backend directory
python app.py  # or however you run your server
# Should be running on http://localhost:8000
```

### 2. Start Perplexica

```bash
npm run dev
```

### 3. Use Adult Search

1. Open the app at `http://localhost:3000`
2. Click the source selector (globe icon)
3. Enable "Adult Videos"
4. Type a natural language query: "romantic couple outdoor scene"
5. The system will:
   - Call your Python API
   - Display results with thumbnails
   - Allow the LLM to cite and describe the videos

## How It Works (Flow)

1. **User Query**: "Find me romantic outdoor scenes"
2. **Source Selection**: User enables "Adult Videos"
3. **Classification**: LLM determines this needs adult search
4. **Action Execution**: `adult_search` action is called
5. **API Call**: Fetches from `http://localhost:8000/search?q=romantic%20outdoor%20scenes`
6. **Response Processing**: Converts Python JSON to Chunk format
7. **UI Display**: VideoResults component shows thumbnails
8. **LLM Response**: AI describes the results and cites videos

## Customization

### Changing the API URL

Update the `searchAdultVideos` function in `src/lib/agents/search/researcher/actions/adultSearch.ts`:

```typescript
const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
```

Or set the environment variable:
```bash
PYTHON_API_URL=http://your-api.com npm run dev
```

### Modifying Response Format

If your Python API returns a different format, update the mapping in `adultSearch.ts`:

```typescript
const videos = Array.isArray(data) ? data : data.results || data.videos || [];

const chunks: Chunk[] = videos.map((video: any) => {
  // Customize this mapping based on your API response
  return {
    content: `Title: ${video.title}...`,
    metadata: {
      title: video.title,
      url: video.url,
      // ... add your custom fields
    },
  };
});
```

### Customizing Prompts

Edit the prompts in `adultSearch.ts`:
- `speedModePrompt` - For quick searches
- `balancedModePrompt` - For balanced searches
- `qualityModePrompt` - For comprehensive searches

## Testing

### Test the Integration

1. **Start Python backend**:
   ```bash
   curl http://localhost:8000/search?q=test
   # Should return JSON array
   ```

2. **Test in Perplexica**:
   - Enable "Adult Videos" source
   - Search for "test query"
   - Check browser console for API calls
   - Verify results display with thumbnails

### Debugging

- Check browser console for API errors
- Check Python backend logs
- Verify `PYTHON_API_URL` environment variable
- Ensure CORS is enabled on Python backend if needed

## Troubleshooting

### "Python API returned 404"
- Verify Python backend is running
- Check the URL in `adultSearch.ts`
- Ensure endpoint is `/search?q=...`

### "No results displayed"
- Check Python API response format matches expected format
- Verify thumbnails are valid URLs
- Check browser console for errors

### "CORS errors"
- Add CORS headers to your Python backend:
  ```python
  from flask_cors import CORS
  CORS(app)
  ```

## Next Steps

1. **Add Authentication**: If your Python API requires auth, add headers in `adultSearch.ts`
2. **Add Pagination**: Modify the action to support paginated results
3. **Add Filters**: Extend the schema to support filters (duration, platform, etc.)
4. **Improve Error Handling**: Add retry logic or fallback mechanisms
5. **Add Caching**: Cache results to reduce API calls

## Files Created/Modified

### Created:
- `src/lib/agents/search/researcher/actions/adultSearch.ts` - Main search action
- `src/components/AdultVideoCard.tsx` - Video card component
- `INTEGRATION_GUIDE.md` - This file

### Modified:
- `src/lib/agents/search/types.ts` - Added 'adult' source type
- `src/lib/agents/search/researcher/actions/index.ts` - Registered action
- `src/components/MessageInputActions/Sources.tsx` - Added UI option
- `src/components/MessageSources.tsx` - Enhanced video detection
- `src/components/VideoResults.tsx` - Added vibe badge support
- `src/lib/prompts/search/writer.ts` - Added video formatting instructions

## Summary

The integration is complete and follows Perplexica's existing patterns. The system will automatically:
- Route adult search queries to your Python backend
- Display results with thumbnails
- Allow the LLM to cite and describe videos
- Handle errors gracefully

No changes to core Perplexica functionality were required - this is a clean, modular addition.
