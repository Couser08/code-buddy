import { VISUALIZER_TOPICS } from './predefinedExamples';
import { traceCCode, ExecutionStep } from './cVisualTracer';

// In-memory static cache for instant 0ms retrieval of built-in C topics
const PRECOMPUTED_CACHE: Record<string, ExecutionStep[]> = {};

export function getCachedTopicTrace(topicId: string): ExecutionStep[] | null {
  if (PRECOMPUTED_CACHE[topicId]) {
    return PRECOMPUTED_CACHE[topicId];
  }

  const topic = VISUALIZER_TOPICS.find((t) => t.id === topicId);
  if (!topic) return null;

  const steps = traceCCode(topic.code, topic.id);
  PRECOMPUTED_CACHE[topicId] = steps;
  return steps;
}

export function getTraceForCode(code: string, topicId?: string): ExecutionStep[] {
  if (!code) return [];

  // Check if matches an existing topic
  if (topicId && PRECOMPUTED_CACHE[topicId]) {
    return PRECOMPUTED_CACHE[topicId];
  }

  const matchedTopic = VISUALIZER_TOPICS.find((t) => t.code.trim() === code.trim());
  if (matchedTopic) {
    return getCachedTopicTrace(matchedTopic.id) || traceCCode(code);
  }

  // Custom user code: trace dynamically
  return traceCCode(code, topicId);
}

// Pre-warm the cache lazily during idle browser time (zero main thread stall)
if (typeof window !== 'undefined') {
  const warmCache = () => {
    VISUALIZER_TOPICS.forEach((t) => {
      if (!PRECOMPUTED_CACHE[t.id]) {
        try {
          PRECOMPUTED_CACHE[t.id] = traceCCode(t.code, t.id);
        } catch {}
      }
    });
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(warmCache, { timeout: 2000 });
  } else {
    setTimeout(warmCache, 500);
  }
}
