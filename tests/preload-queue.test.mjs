// Mirrors the preload effect in VisualReasoningStaticAssessment.jsx.
// Asserts: question order, dedupe, concurrency cap, and that a failing image
// does not stall the queue.
const buildQueue = (questions) => {
  const urls = [];
  questions.forEach((q) => {
    if (q.image) urls.push(q.image);
    if (q.optionsType === 'image' && Array.isArray(q.options)) {
      q.options.forEach((opt) => urls.push(opt));
    }
  });
  return [...new Set(urls.filter((u) => typeof u === 'string' && u))];
};

const run = (queue, { fail = new Set(), concurrency = 6 } = {}) =>
  new Promise((resolve) => {
    const started = [];
    let inFlight = 0;
    let peak = 0;
    let cursor = 0;
    let done = 0;

    const loadNext = () => {
      if (cursor >= queue.length) return;
      const src = queue[cursor++];
      started.push(src);
      inFlight++;
      peak = Math.max(peak, inFlight);
      setTimeout(() => {
        inFlight--;
        done++;
        // onload AND onerror both call loadNext
        loadNext();
        if (done === queue.length) resolve({ started, peak });
      }, fail.has(src) ? 5 : 1);
    };
    for (let i = 0; i < Math.min(concurrency, queue.length); i++) loadNext();
  });

const assert = (cond, msg) => { if (!cond) { console.error('FAIL ' + msg); process.exitCode = 1; } };

// 30 questions: image question + 4 image options, with a repeated asset.
const questions = Array.from({ length: 30 }, (_, i) => ({
  image: `https://s3/q${i}.png`,
  optionsType: 'image',
  options: [`https://s3/q${i}-a.png`, `https://s3/q${i}-b.png`, `https://s3/q${i}-c.png`, 'https://s3/shared.png'],
}));

const queue = buildQueue(questions);
assert(queue.length === 30 * 4 + 1, `dedupe: expected 121 unique, got ${queue.length}`);
assert(queue[0] === 'https://s3/q0.png', 'Q1 image must be first in the queue');
assert(queue.indexOf('https://s3/q1.png') > queue.indexOf('https://s3/q0-c.png'), 'queue must be in question order');

// Mixed types: text question with image options, image question with text options.
const mixed = buildQueue([
  { image: null, optionsType: 'image', options: ['https://s3/a.png', 'https://s3/b.png'] },
  { image: 'https://s3/c.png', optionsType: 'text', options: ['yes', 'no'] },
  { image: null, optionsType: 'text', options: ['x', 'y'] },
]);
assert(JSON.stringify(mixed) === JSON.stringify(['https://s3/a.png', 'https://s3/b.png', 'https://s3/c.png']),
  `mixed types: text options must not be queued, got ${JSON.stringify(mixed)}`);

assert(buildQueue([{ image: null, optionsType: 'text', options: ['a'] }]).length === 0, 'all-text assessment queues nothing');

const { started, peak } = await run(queue, { fail: new Set([queue[0], queue[3], queue[50]]) });
assert(peak <= 6, `concurrency cap exceeded: peak ${peak}`);
assert(started.length === queue.length, `a failing image stalled the queue: ${started.length}/${queue.length} started`);
assert(new Set(started).size === queue.length, 'every url started exactly once');

if (!process.exitCode) console.log(`preload queue: all assertions passed (${queue.length} urls, peak concurrency ${peak})`);
