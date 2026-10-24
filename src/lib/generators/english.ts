/**
 * English language exercise generators (KSSR Semakan 2017, CEFR-aligned).
 * Modules: Listening, Speaking, Reading, Writing, Language Arts.
 * Bilingual: prompts use simple English with Bahasa Melayu support on demand.
 */

import type { Question } from '../../data/types';
import type { Rng } from '../rng';
import { fill, fillBlank, match, mcq, order, trueFalse } from './shared';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

const NOUNS: { w: string; e: string; ms: string }[] = [
  { w: 'apple', e: '🍎', ms: 'epal' },
  { w: 'banana', e: '🍌', ms: 'pisang' },
  { w: 'cat', e: '🐱', ms: 'kucing' },
  { w: 'dog', e: '🐶', ms: 'anjing' },
  { w: 'book', e: '📕', ms: 'buku' },
  { w: 'ball', e: '⚽', ms: 'bola' },
  { w: 'house', e: '🏠', ms: 'rumah' },
  { w: 'tree', e: '🌳', ms: 'pokok' },
  { w: 'car', e: '🚗', ms: 'kereta' },
  { w: 'fish', e: '🐟', ms: 'ikan' },
  { w: 'bird', e: '🐦', ms: 'burung' },
  { w: 'flower', e: '🌸', ms: 'bunga' },
  { w: 'chair', e: '🪑', ms: 'kerusi' },
  { w: 'clock', e: '🕐', ms: 'jam' },
  { w: 'shoe', e: '👟', ms: 'kasut' },
];

const COLOURS: { w: string; e: string; ms: string }[] = [
  { w: 'red', e: '🔴', ms: 'merah' },
  { w: 'blue', e: '🔵', ms: 'biru' },
  { w: 'green', e: '🟢', ms: 'hijau' },
  { w: 'yellow', e: '🟡', ms: 'kuning' },
  { w: 'black', e: '⚫', ms: 'hitam' },
  { w: 'white', e: '⚪', ms: 'putih' },
  { w: 'orange', e: '🟠', ms: 'jingga' },
  { w: 'purple', e: '🟣', ms: 'ungu' },
];

const NUMBERS_EN = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty',
];

/* ------------------------------------------------------------------ */
/* Stage 1 — Year 1-3                                                  */
/* ------------------------------------------------------------------ */

function en1Phonics(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const it = rng.pick(NOUNS);
      return mcq(rng, {
        prefix: 'en1-phonics',
        prompt: `What letter does "${it.w}" begin with?`,
        promptSub: `Bahasa Melayu: Perkataan "${it.w}" bermula dengan huruf apa?`,
        answer: it.w[0].toUpperCase(),
        distractors: rng.shuffle(ALPHABET.filter((c) => c !== it.w[0])).slice(0, 3).map((c) => c.toUpperCase()),
        explanation: `"${it.w}" begins with "${it.w[0].toUpperCase()}". / "${it.w}" bermula dengan "${it.w[0].toUpperCase()}".`,
        emoji: '🔤',
        cols: 2,
        speak: `What letter does ${it.w} begin with?`,
      });
    }
    if (mode === 1) {
      const it = rng.pick(NOUNS);
      const idx = rng.int(1, it.w.length - 1);
      const masked = it.w.slice(0, idx) + '_' + it.w.slice(idx + 1);
      return mcq(rng, {
        prefix: 'en1-phonics',
        prompt: `Complete the word: ${masked} ${it.e}`,
        answer: it.w[idx],
        distractors: rng.shuffle(ALPHABET.filter((c) => c !== it.w[idx])).slice(0, 3),
        explanation: `The correct word is "${it.w}" (${it.ms}).`,
        emoji: '✏️',
        cols: 2,
        speak: `Complete the word ${masked}`,
      });
    }
    if (mode === 2) {
      const it = rng.pick(NOUNS);
      return mcq(rng, {
        prefix: 'en1-phonics',
        prompt: `${it.e} What is this?`,
        promptSub: `Bahasa Melayu: Apakah ini?`,
        answer: it.w,
        distractors: rng.shuffle(NOUNS.filter((x) => x.w !== it.w)).slice(0, 3).map((x) => x.w),
        explanation: `This is a ${it.w}. / Ini ialah ${it.ms}.`,
        emoji: '🖼️',
        cols: 2,
        speak: 'What is this?',
      });
    }
    const picked = rng.sample(NOUNS, 3);
    return match({
      prefix: 'en1-phonics',
      prompt: 'Match the word with the correct picture.',
      pairs: picked.map((x) => ({ left: x.w, right: x.e })),
      explanation: 'Match each English word to its picture.',
      emoji: '🔗',
    });
  });
}

function en1Greetings(_y: number, rng: Rng, count: number): Question[] {
  const dialogues = [
    { q: 'Good morning! How are you?', a: "I'm fine, thank you.", d: ['Goodbye!', "I'm a cat.", 'It is red.'] },
    { q: 'What is your name?', a: 'My name is Ali.', d: ['I am seven.', 'It is a book.', 'Thank you.'] },
    { q: 'How old are you?', a: 'I am seven years old.', d: ['My name is Siti.', 'It is blue.', 'Good night.'] },
    { q: 'Thank you very much.', a: "You're welcome.", d: ['Good morning.', 'I am sorry.', 'See you.'] },
    { q: 'Goodbye! See you tomorrow.', a: 'Goodbye! See you.', d: ['Hello!', 'How old are you?', 'Thank you.'] },
    { q: 'Excuse me, may I help you?', a: 'Yes, please.', d: ['No, I am a boy.', 'I am ten.', 'It is a pen.'] },
  ];
  return fill(count, (i) => {
    const it = rng.pick(dialogues);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en1-speaking',
        prompt: `Choose the best reply:\n"${it.q}"`,
        answer: it.a,
        distractors: it.d,
        explanation: `"${it.a}" is the polite and suitable reply.`,
        emoji: '💬',
        cols: 1,
        speak: it.q,
      });
    }
    const pool = dialogues.filter((x) => x.q !== it.q);
    return match({
      prefix: 'en1-speaking',
      prompt: 'Match the question with the correct answer.',
      pairs: [it, ...rng.sample(pool, 2)].map((x) => ({ left: x.q, right: x.a })),
      explanation: 'Each question has a suitable answer.',
      emoji: '🗣️',
    });
  });
}

function en1ColoursNumbers(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const mode = i % 4;
    if (mode === 0) {
      const c = rng.pick(COLOURS);
      return mcq(rng, {
        prefix: 'en1-colours',
        prompt: `${c.e} What colour is this?`,
        answer: c.w,
        distractors: rng.shuffle(COLOURS.filter((x) => x.w !== c.w)).slice(0, 3).map((x) => x.w),
        explanation: `This colour is ${c.w} (${c.ms}).`,
        emoji: '🎨',
        cols: 2,
        speak: 'What colour is this?',
      });
    }
    if (mode === 1) {
      const c = rng.pick(COLOURS);
      return mcq(rng, {
        prefix: 'en1-colours',
        prompt: `Choose the picture for "${c.w}".`,
        answer: c.e,
        distractors: rng.shuffle(COLOURS.filter((x) => x.w !== c.w)).slice(0, 3).map((x) => x.e),
        explanation: `"${c.w}" is ${c.ms}, shown as ${c.e}.`,
        emoji: '🔍',
        cols: 2,
        speak: `Choose the picture for ${c.w}`,
      });
    }
    if (mode === 2) {
      const n = rng.int(1, 20);
      const it = rng.pick(NOUNS);
      const plural = n > 1 ? (it.w.endsWith('s') ? it.w + 'es' : it.w + 's') : it.w;
      return mcq(rng, {
        prefix: 'en1-numbers',
        prompt: `${it.e.repeat(Math.min(n, 5))}${n > 5 ? '…' : ''}\nHow many ${it.w}s are there? (${n})`,
        answer: NUMBERS_EN[n],
        distractors: rng.shuffle(NUMBERS_EN.filter((_, k) => k !== n && k >= 1 && k <= 20)).slice(0, 3),
        explanation: `${n} in English is "${NUMBERS_EN[n]}". There are ${n} ${plural}.`,
        emoji: '🔢',
        cols: 2,
        speak: `How many?`,
      });
    }
    const n = rng.int(1, 12);
    return fillBlank(rng, {
      prefix: 'en1-numbers',
      prompt: `I have ${n} balloons. "I have ____ balloons."`,
      answer: NUMBERS_EN[n],
      options: rng.shuffle(NUMBERS_EN.slice(1, 13).filter((_, k) => k + 1 !== n)).slice(0, 3),
      explanation: `${n} = ${NUMBERS_EN[n]}.`,
      emoji: '🎈',
      cols: 2,
    });
  });
}

function en2SimpleSentences(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { s: 'This is a book.', img: '📕' },
    { s: 'I like apples.', img: '🍎' },
    { s: 'The cat is sleeping.', img: '🐱' },
    { s: 'She has a red bag.', img: '👜' },
    { s: 'We go to school.', img: '🏫' },
    { s: 'He can swim well.', img: '🏊' },
    { s: 'They are playing football.', img: '⚽' },
    { s: 'My father is a teacher.', img: '👨‍🏫' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 3 === 0) {
      return order({
        prefix: 'en2-sentence',
        prompt: 'Arrange the words to make a correct sentence.',
        items: rng.shuffle(it.s.replace('.', '').split(' ')),
        correctOrder: it.s.replace('.', '').split(' '),
        explanation: `The correct sentence is: "${it.s}"`,
        emoji: '🧩',
      });
    }
    if (i % 3 === 1) {
      const words = it.s.replace('.', '').split(' ');
      const idx = rng.int(0, words.length - 1);
      const masked = words.map((w, k) => (k === idx ? '____' : w)).join(' ');
      return mcq(rng, {
        prefix: 'en2-sentence',
        prompt: `Complete the sentence:\n${masked}`,
        answer: words[idx],
        distractors: rng.shuffle(words.filter((w) => w !== words[idx])).slice(0, 3),
        explanation: `The complete sentence is: "${it.s}"`,
        emoji: '✏️',
        cols: 1,
        speak: 'Complete this sentence.',
      });
    }
    return mcq(rng, {
      prefix: 'en2-sentence',
      prompt: `Which sentence matches this picture? ${it.img}`,
      answer: it.s,
      distractors: rng.shuffle(items.filter((x) => x.s !== it.s)).slice(0, 3).map((x) => x.s),
      explanation: `"${it.s}" is the sentence that matches the picture.`,
      emoji: '🖼️',
      cols: 1,
    });
  });
}

function en2Vocabulary(_y: number, rng: Rng, count: number): Question[] {
  const topics = [
    { cat: 'Animals', items: ['cat', 'dog', 'fish', 'bird', 'cow', 'duck'] },
    { cat: 'Fruits', items: ['apple', 'banana', 'orange', 'grape', 'mango', 'papaya'] },
    { cat: 'School Items', items: ['book', 'pencil', 'ruler', 'eraser', 'bag', 'notebook'] },
    { cat: 'Colours', items: COLOURS.map((c) => c.w) },
    { cat: 'Family', items: ['mother', 'father', 'sister', 'brother', 'grandmother', 'grandfather'] },
  ];
  return fill(count, (i) => {
    const t = rng.pick(topics);
    if (i % 2 === 0) {
      const picked = rng.sample(t.items, 3);
      const other = rng.pick(topics.filter((x) => x.cat !== t.cat)).items[0];
      return mcq(rng, {
        prefix: 'en2-vocab',
        prompt: `Which word does NOT belong to "${t.cat}"?\n${[...picked, other].join(', ')}`,
        answer: other,
        distractors: picked,
        explanation: `"${other}" is not in the group "${t.cat}".`,
        emoji: '🧠',
        cols: 2,
        speak: `Which word does not belong to ${t.cat}?`,
      });
    }
    const picked = rng.sample(t.items, 3);
    return mcq(rng, {
      prefix: 'en2-vocab',
      prompt: `Which group do these words belong to?\n${picked.join(', ')}`,
      answer: t.cat,
      distractors: rng.shuffle(topics.filter((x) => x.cat !== t.cat)).slice(0, 3).map((x) => x.cat),
      explanation: `All these words belong to "${t.cat}".`,
      emoji: '🗂️',
      cols: 2,
    });
  });
}

function en3GrammarBasics(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { s: 'She ____ a doctor.', a: 'is', opts: ['is', 'are', 'am'] },
    { s: 'They ____ playing football.', a: 'are', opts: ['is', 'are', 'am'] },
    { s: 'I ____ seven years old.', a: 'am', opts: ['is', 'are', 'am'] },
    { s: 'He ____ two cats.', a: 'has', opts: ['has', 'have', 'having'] },
    { s: 'We ____ a new house.', a: 'have', opts: ['has', 'have', 'is'] },
    { s: 'The children ____ in the park.', a: 'are', opts: ['is', 'are', 'am'] },
    { s: 'My mother ____ cooking now.', a: 'is', opts: ['is', 'are', 'am'] },
    { s: 'You ____ my best friend.', a: 'are', opts: ['is', 'are', 'am'] },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 3 === 0) {
      return mcq(rng, {
        prefix: 'en3-grammar',
        prompt: it.s,
        promptSub: 'Choose the correct verb.',
        answer: it.a,
        distractors: it.opts.filter((o) => o !== it.a),
        explanation: `"${it.s.replace('____', it.a)}" is correct.`,
        emoji: '📝',
        cols: 2,
        speak: it.s.replace('____', 'blank'),
      });
    }
    if (i % 3 === 1) {
      const pluralWord = rng.pick(['cat', 'book', 'ball', 'tree', 'bird', 'car']);
      const plural = pluralWord + 's';
      return mcq(rng, {
        prefix: 'en3-grammar',
        prompt: `What is the plural of "${pluralWord}"?`,
        answer: plural,
        distractors: [pluralWord + 'es', pluralWord + 'ies', pluralWord],
        explanation: `Add "s" to make the plural: ${pluralWord} → ${plural}.`,
        emoji: '🔁',
        cols: 2,
        speak: `What is the plural of ${pluralWord}?`,
      });
    }
    const word = rng.pick(NOUNS);
    return trueFalse({
      prefix: 'en3-grammar',
      lang: 'en',
      prompt: `The word "${word.w}" is a noun.`,
      isTrue: true,
      explanation: `"${word.w}" (${word.ms}) is a noun because it names a thing.`,
      emoji: '🏷️',
    });
  });
}

function en3Reading(_y: number, rng: Rng, count: number): Question[] {
  const passages = [
    {
      t: 'My name is Aina. I am eight years old. I live in Ipoh with my family. I have one brother and two sisters. I like to read storybooks and draw pictures.',
      q: 'How old is Aina?',
      a: 'Eight years old',
      d: ['Seven years old', 'Nine years old', 'Ten years old'],
      why: 'The text says "I am eight years old."',
    },
    {
      t: 'Every Saturday, Ravi goes to the market with his mother. They buy fresh vegetables, fish and fruits. Ravi helps to carry the bags. He likes going to the market.',
      q: 'When does Ravi go to the market?',
      a: 'Every Saturday',
      d: ['Every Sunday', 'Every Monday', 'Every Friday'],
      why: 'The first sentence says "Every Saturday".',
    },
    {
      t: 'The sun gives us light and heat. It rises in the east and sets in the west. Plants need sunlight to grow. Without the sun, there would be no life on Earth.',
      q: 'Why do plants need sunlight?',
      a: 'To grow',
      d: ['To sleep', 'To swim', 'To fly'],
      why: 'The text says plants need sunlight to grow.',
    },
    {
      t: 'Salmah keeps a small garden behind her house. She grows tomatoes, chillies and mint leaves. She waters them every evening. Her mother uses the vegetables to cook delicious food.',
      q: 'What does Salmah grow in her garden?',
      a: 'Tomatoes, chillies and mint leaves',
      d: ['Roses and orchids', 'Rice and corn', 'Mangoes and bananas'],
      why: 'The second sentence lists the plants Salmah grows.',
    },
  ];
  return fill(count, (i) => {
    const p = rng.pick(passages);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en3-reading',
        prompt: `Read the text:\n\n"${p.t}"\n\n${p.q}`,
        answer: p.a,
        distractors: p.d,
        explanation: p.why,
        emoji: '📖',
        cols: 1,
        speak: `${p.t} ${p.q}`,
      });
    }
    return mcq(rng, {
      prefix: 'en3-reading',
      prompt: `Read the text:\n\n"${p.t}"\n\nWhat is the best title for this text?`,
      answer: p.t.split('.')[0].replace('My name is Aina', 'Aina and Her Family').replace('Every Saturday, Ravi goes to the market with his mother', 'A Trip to the Market').replace('The sun gives us light and heat', 'The Sun and Life on Earth').replace('Salmah keeps a small garden behind her house', "Salmah's Little Garden"),
      distractors: ['The Big City', 'A Football Match', 'My Favourite Food', 'At the Zoo'],
      explanation: 'The title should describe the main idea of the text.',
      emoji: '🏷️',
      cols: 1,
    });
  });
}

function en3Writing(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { topic: 'My Family', idea: 'I have a mother, a father and two siblings.' },
    { topic: 'My School', idea: 'My school is big and has a library.' },
    { topic: 'My Favourite Food', idea: 'I like nasi lemak because it is tasty.' },
    { topic: 'My Pet', idea: 'I have a cat named Mimi.' },
    { topic: 'My Hobby', idea: 'I like drawing and reading books.' },
    { topic: 'My Best Friend', idea: 'My best friend is kind and helpful.' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 3 === 0) {
      return mcq(rng, {
        prefix: 'en3-writing',
        prompt: `You are writing about "${it.topic}".\nWhich sentence is the best opening?`,
        answer: it.idea,
        distractors: [
          'The end of my story.',
          'I do not know what to write.',
          'This is a very long sentence that has nothing to do with the topic at all.',
          'Goodbye everyone.',
        ],
        explanation: `A good opening introduces the topic "${it.topic}".`,
        emoji: '✍️',
        cols: 1,
        speak: `Which sentence is the best opening for ${it.topic}?`,
      });
    }
    if (i % 3 === 1) {
      return order({
        prefix: 'en3-writing',
        prompt: `Arrange the parts of a short essay about "${it.topic}".`,
        items: rng.shuffle(['Introduction', 'Body', 'Conclusion']),
        correctOrder: ['Introduction', 'Body', 'Conclusion'],
        explanation: 'An essay has an introduction, a body and a conclusion.',
        emoji: '🗂️',
      });
    }
    return trueFalse({
      prefix: 'en3-writing',
      lang: 'en',
      prompt: `Every English sentence should begin with a capital letter.`,
      isTrue: true,
      explanation: 'Correct! Sentences always start with a capital letter.',
      emoji: '🔠',
    });
  });
}

/* ------------------------------------------------------------------ */
/* Stage 2 — Year 4-6                                                  */
/* ------------------------------------------------------------------ */

function en4Grammar(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { s: 'She ____ to school every day.', a: 'goes', opts: ['go', 'goes', 'going', 'gone'] },
    { s: 'They ____ football yesterday.', a: 'played', opts: ['play', 'plays', 'played', 'playing'] },
    { s: 'I ____ reading a book now.', a: 'am', opts: ['is', 'am', 'are', 'be'] },
    { s: 'He ____ already finished his homework.', a: 'has', opts: ['have', 'has', 'had', 'having'] },
    { s: 'We ____ visit the museum tomorrow.', a: 'will', opts: ['will', 'was', 'were', 'been'] },
    { s: 'The book ____ written by a famous author.', a: 'was', opts: ['is', 'was', 'were', 'are'] },
    { s: 'If it rains, we ____ stay at home.', a: 'will', opts: ['will', 'would', 'were', 'was'] },
    { s: 'She is the ____ student in the class.', a: 'best', opts: ['good', 'better', 'best', 'well'] },
    { s: 'My brother ____ his teeth twice a day.', a: 'brushes', opts: ['brush', 'brushes', 'brushing', 'brushed'] },
    { s: 'The children ____ in the playground now.', a: 'are playing', opts: ['is playing', 'are playing', 'was playing', 'plays'] },
    { s: 'We ____ to the beach last weekend.', a: 'went', opts: ['go', 'goes', 'went', 'going'] },
    { s: 'She has ____ her homework already.', a: 'finished', opts: ['finish', 'finishes', 'finished', 'finishing'] },
    { s: 'This bag is ____ than that one.', a: 'heavier', opts: ['heavy', 'heavier', 'heaviest', 'more heavy'] },
    { s: 'There ____ many books on the shelf.', a: 'are', opts: ['is', 'are', 'was', 'am'] },
    { s: 'He did not ____ to school yesterday.', a: 'come', opts: ['came', 'come', 'comes', 'coming'] },
    { s: 'The sun ____ in the east.', a: 'rises', opts: ['rise', 'rises', 'rising', 'rose'] },
    { s: 'I have lived here ____ 2015.', a: 'since', opts: ['for', 'since', 'from', 'at'] },
    { s: 'The cat is hiding ____ the table.', a: 'under', opts: ['under', 'on', 'in', 'at'] },
    { s: 'She sings ____ than her sister.', a: 'better', opts: ['good', 'well', 'better', 'best'] },
    { s: 'They ____ watching a film when I called.', a: 'were', opts: ['was', 'were', 'is', 'are'] },
    { s: 'Please ____ the door quietly.', a: 'close', opts: ['closes', 'close', 'closing', 'closed'] },
    { s: 'Ali is the ____ boy in the class.', a: 'tallest', opts: ['tall', 'taller', 'tallest', 'more tall'] },
    { s: 'We must ____ our homework every day.', a: 'do', opts: ['does', 'do', 'doing', 'did'] },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en4-grammar',
        prompt: it.s,
        promptSub: 'Choose the correct word.',
        answer: it.a,
        distractors: it.opts.filter((o) => o !== it.a),
        explanation: `"${it.s.replace('____', it.a)}" is correct.`,
        emoji: '📝',
        cols: 2,
        speak: it.s.replace('____', 'blank'),
      });
    }
    const ADV: [string, string][] = [
      ['happy', 'happily'], ['quick', 'quickly'], ['careful', 'carefully'],
      ['loud', 'loudly'], ['bright', 'brightly'], ['quiet', 'quietly'],
      ['slow', 'slowly'], ['polite', 'politely'], ['sudden', 'suddenly'],
      ['gentle', 'gently'], ['angry', 'angrily'], ['brave', 'bravely'],
    ];
    const pair = rng.pick(ADV);
    const word = pair[0];
    const adv = pair[1];
    return mcq(rng, {
      prefix: 'en4-grammar',
      prompt: `What is the adverb form of "${word}"?`,
      answer: adv,
      distractors: [word + 'ness', word + 'ful', word.replace(/y$/, 'iness'), word],
      explanation: `"${word}" becomes the adverb "${adv}".`,
      emoji: '🏃',
      cols: 2,
    });
  });
}

/** Buang kata yang berulang supaya soalan padanan tidak bertindih label. */
function uniqueByWord<T extends { w: string }>(sets: readonly T[]): T[] {
  const seen = new Set<string>();
  return sets.filter((s) => {
    if (seen.has(s.w)) return false;
    seen.add(s.w);
    return true;
  });
}

function en4Vocabulary(_y: number, rng: Rng, count: number): Question[] {
  const sets = [
    { w: 'enormous', m: 'very big', ms: 'sangat besar', d: ['very small', 'very fast', 'very quiet'] },
    { w: 'generous', m: 'willing to give', ms: 'pemurah', d: ['selfish', 'lazy', 'angry'] },
    { w: 'brave', m: 'without fear', ms: 'berani', d: ['afraid', 'weak', 'slow'] },
    { w: 'tidy', m: 'neat and organised', ms: 'kemas', d: ['messy', 'dirty', 'noisy'] },
    { w: 'diligent', m: 'hard-working', ms: 'rajin', d: ['lazy', 'slow', 'careless'] },
    { w: 'ancient', m: 'very old', ms: 'purba', d: ['brand new', 'modern', 'fresh'] },
    { w: 'curious', m: 'wanting to know', ms: 'ingin tahu', d: ['bored', 'sleepy', 'careless'] },
    { w: 'delicious', m: 'tastes very good', ms: 'sedap', d: ['tasteless', 'bitter', 'poisonous'] },
    { w: 'fragile', m: 'easily broken', ms: 'mudah pecah', d: ['very strong', 'very heavy', 'very light'] },
    { w: 'generous', m: 'willing to give to others', ms: 'pemurah', d: ['greedy', 'selfish', 'careless'] },
    { w: 'tranquil', m: 'calm and peaceful', ms: 'tenang', d: ['noisy', 'busy', 'dangerous'] },
    { w: 'enormous', m: 'very large in size', ms: 'sangat besar', d: ['very small', 'very thin', 'very short'] },
    { w: 'gigantic', m: 'extremely big', ms: 'besar sekali', d: ['tiny', 'narrow', 'shallow'] },
    { w: 'polite', m: 'showing good manners', ms: 'beradab', d: ['rude', 'lazy', 'noisy'] },
    { w: 'honest', m: 'always telling the truth', ms: 'jujur', d: ['dishonest', 'silly', 'slow'] },
    { w: 'diligent', m: 'working hard and carefully', ms: 'rajin', d: ['lazy', 'careless', 'slow'] },
    { w: 'brave', m: 'not afraid of danger', ms: 'berani', d: ['afraid', 'weak', 'shy'] },
    { w: 'ancient', m: 'from a very long time ago', ms: 'purba', d: ['modern', 'brand new', 'recent'] },
    { w: 'curious', m: 'eager to know something', ms: 'ingin tahu', d: ['bored', 'sleepy', 'angry'] },
    { w: 'tidy', m: 'neat and in order', ms: 'kemas', d: ['messy', 'dirty', 'crowded'] },
    { w: 'scarce', m: 'not enough or hard to find', ms: 'sukar didapati', d: ['plentiful', 'cheap', 'useless'] },
    { w: 'rapid', m: 'very fast', ms: 'cepat', d: ['slow', 'steady', 'gentle'] },
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      // Buang kata berulang supaya soalan padanan tiada label kiri bertindih.
      const picked = rng.sample(uniqueByWord(sets), 3);
      return match({
        prefix: 'en4-vocab',
        prompt: 'Match each word with its meaning.',
        pairs: picked.map((x) => ({ left: x.w, right: x.m })),
        explanation: 'Learn the meaning of each word.',
        emoji: '📚',
      });
    }
    const it = rng.pick(sets);
    if (i % 3 === 1) {
      return mcq(rng, {
        prefix: 'en4-vocab',
        prompt: `What does "${it.w}" mean?`,
        answer: it.m,
        distractors: it.d,
        explanation: `"${it.w}" means ${it.m} (${it.ms}).`,
        emoji: '💡',
        cols: 1,
        speak: `What does ${it.w} mean?`,
      });
    }
    return mcq(rng, {
      prefix: 'en4-vocab',
      prompt: `Which word means "${it.m}" (${it.ms})?`,
      answer: it.w,
      distractors: rng.shuffle(sets.filter((x) => x.w !== it.w)).slice(0, 3).map((x) => x.w),
      explanation: `"${it.m}" is the meaning of "${it.w}".`,
      emoji: '🔎',
      cols: 2,
    });
  });
}

function en4ReadingComprehension(_y: number, rng: Rng, count: number): Question[] {
  const passages = [
    {
      t: 'Recycling is one of the simplest ways to protect our environment. By recycling paper, plastic and glass, we reduce the amount of waste in landfills. Recycling also saves energy and natural resources. Everyone can help by separating their rubbish at home.',
      q: 'What is one benefit of recycling?',
      a: 'It reduces waste in landfills',
      d: ['It increases pollution', 'It uses more energy', 'It creates more rubbish'],
      why: 'The second sentence says recycling reduces waste in landfills.',
    },
    {
      t: 'Exercise is important for both physical and mental health. Regular exercise strengthens the heart, builds muscles and helps control weight. It also releases chemicals in the brain that improve mood. Even a short walk each day can make a difference.',
      q: 'What does regular exercise strengthen?',
      a: 'The heart',
      d: ['The hair', 'The teeth', 'The nails'],
      why: 'The second sentence mentions that exercise strengthens the heart.',
    },
    {
      t: 'The Internet has changed the way we learn. Students can now access information from anywhere in the world. Online lessons allow learning at your own pace. However, it is important to use the Internet responsibly and avoid unreliable sources.',
      q: 'What advantage of the Internet is mentioned?',
      a: 'Students can access information from anywhere',
      d: ['It replaces all teachers', 'It is always free', 'It makes learning impossible'],
      why: 'The second sentence says students can access information from anywhere.',
    },
    {
      t: 'Malaysia is a country of many cultures. People of different races live together in harmony. They celebrate festivals such as Hari Raya, Chinese New Year and Deepavali together. This unity is the strength of the nation.',
      q: 'What festivals are mentioned in the text?',
      a: 'Hari Raya, Chinese New Year and Deepavali',
      d: ['Christmas and Easter', 'Songkran and Loy Krathong', 'Halloween and Thanksgiving'],
      why: 'The third sentence lists the festivals mentioned.',
    },
    {
      t: 'Reading is a habit that benefits us for life. It improves our vocabulary and strengthens our imagination. Readers also learn to concentrate for longer periods. A good habit is to read for twenty minutes every day.',
      q: 'What does reading improve according to the text?',
      a: 'Vocabulary and imagination',
      d: ['Height and weight', 'Speed and strength', 'Appetite and sleep'],
      why: 'The second sentence says reading improves vocabulary and imagination.',
    },
    {
      t: 'Water is essential for all living things. Plants need water to make food, while animals and humans need it to stay healthy. Saving water means turning off taps and fixing leaks. Every drop we save helps the environment.',
      q: 'Why do plants need water?',
      a: 'To make food',
      d: ['To stay warm', 'To grow taller than trees', 'To change colour'],
      why: 'The text says plants need water to make food.',
    },
    {
      t: 'Road safety begins with good habits. Pedestrians should use zebra crossings and look both ways before crossing. Wearing a helmet protects cyclists from serious injury. Following traffic rules keeps everyone safe.',
      q: 'What should pedestrians use when crossing the road?',
      a: 'Zebra crossings',
      d: ['Any part of the road', 'Bus stops', 'Car parks'],
      why: 'The text states pedestrians should use zebra crossings.',
    },
    {
      t: 'Breakfast is often called the most important meal of the day. It gives us energy to start the morning well. Students who eat breakfast find it easier to concentrate in class. A simple meal of bread and fruit is enough.',
      q: 'Why is breakfast important?',
      a: 'It gives us energy for the morning',
      d: ['It makes us sleepy', 'It replaces lunch', 'It is the cheapest meal'],
      why: 'The second sentence explains that breakfast gives us energy.',
    },
    {
      t: 'Bees play a vital role in nature. As they collect nectar, they carry pollen from flower to flower. This process allows plants to produce fruits and seeds. Without bees, many of our favourite foods would disappear.',
      q: 'What do bees carry from flower to flower?',
      a: 'Pollen',
      d: ['Water', 'Soil', 'Leaves'],
      why: 'The text says bees carry pollen from flower to flower.',
    },
  ];
  return fill(count, (i) => {
    const p = rng.pick(passages);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en4-reading',
        prompt: `Read the text:\n\n"${p.t}"\n\n${p.q}`,
        answer: p.a,
        distractors: p.d,
        explanation: p.why,
        emoji: '📰',
        cols: 1,
        speak: `${p.t} ${p.q}`,
      });
    }
    return mcq(rng, {
      prefix: 'en4-reading',
      prompt: `Read the text:\n\n"${p.t}"\n\nWhat is the main idea of the text?`,
      answer: p.why.split(',')[0].replace('The second sentence says', '').trim() || p.a,
      distractors: ['A story about animals', 'A recipe for cooking', 'A travel advertisement', 'A sports report'],
      explanation: 'The main idea is the central point of the whole text.',
      emoji: '💡',
      cols: 1,
    });
  });
}

function en4Writing(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { t: 'A Visit to the Zoo', o: 'First', b: 'the students arrived at the zoo in the morning' },
    { t: 'My Best Holiday', o: 'In the beginning', b: 'my family and I travelled to Penang' },
    { t: 'An Unforgettable Day', o: 'It started when', b: 'I woke up late for school' },
    { t: 'Cleanliness Campaign', o: 'To begin with', b: 'the pupils gathered at the school hall' },
    { t: 'A Day at the Beach', o: 'Early in the morning', b: 'we set off for the beach with our picnic basket' },
    { t: 'The Lost Wallet', o: 'While walking home', b: 'I noticed a wallet lying on the pavement' },
    { t: 'My First Day at School', o: 'On my first day', b: 'I felt nervous as I entered the classroom' },
    { t: 'A Rainy Afternoon', o: 'The sky turned dark', b: 'and heavy rain began to fall' },
    { t: 'The School Sports Day', o: 'The sports day began', b: 'with a march past by all the houses' },
    { t: 'Helping My Mother', o: 'Last Saturday morning', b: 'I decided to help my mother in the kitchen' },
    { t: 'A Fire in the Neighbourhood', o: 'It was past midnight when', b: 'I heard shouting from the street' },
    { t: 'My Favourite Teacher', o: 'The teacher I admire most', b: 'is always patient and kind to us' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 3 === 0) {
      return mcq(rng, {
        prefix: 'en4-writing',
        prompt: `You are writing a story titled "${it.t}".\nWhich sentence is the best beginning?`,
        answer: `${it.o}, ${it.b}.`,
        distractors: [
          'Finally, that was the end of it.',
          'I do not remember anything at all.',
          'The story has no beginning.',
          'Thank you for reading.',
        ],
        explanation: `A narrative essay begins by setting the scene for "${it.t}".`,
        emoji: '✍️',
        cols: 1,
        speak: `Which sentence is the best beginning for ${it.t}?`,
      });
    }
    if (i % 3 === 1) {
      return order({
        prefix: 'en4-writing',
        prompt: `Arrange the parts of a story titled "${it.t}".`,
        items: rng.shuffle(['Orientation (setting the scene)', 'Complication (the problem)', 'Resolution (how it ends)']),
        correctOrder: ['Orientation (setting the scene)', 'Complication (the problem)', 'Resolution (how it ends)'],
        explanation: 'A narrative has an orientation, a complication and a resolution.',
        emoji: '🗂️',
      });
    }
    return trueFalse({
      prefix: 'en4-writing',
      lang: 'en',
      prompt: 'A paragraph should focus on one main idea.',
      isTrue: true,
      explanation: 'Correct! Each paragraph should develop one main idea.',
      emoji: '📄',
    });
  });
}

function en5GrammarAdvanced(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { s: 'She said that she ____ tired.', a: 'was', opts: ['is', 'was', 'were', 'be'] },
    { s: 'The letter ____ sent yesterday.', a: 'was', opts: ['is', 'was', 'were', 'has'] },
    { s: 'If I ____ rich, I would travel the world.', a: 'were', opts: ['am', 'was', 'were', 'be'] },
    { s: 'He asked me where I ____ from.', a: 'came', opts: ['come', 'came', 'coming', 'comes'] },
    { s: 'Neither Ali ____ Siti was present.', a: 'nor', opts: ['or', 'nor', 'and', 'but'] },
    { s: 'She is used ____ getting up early.', a: 'to', opts: ['to', 'for', 'of', 'at'] },
    { s: 'The more you practise, the ____ you become.', a: 'better', opts: ['good', 'best', 'better', 'well'] },
    { s: 'Hardly ____ he arrived when it started to rain.', a: 'had', opts: ['has', 'had', 'have', 'having'] },
    { s: 'The teacher told us that the earth ____ round.', a: 'is', opts: ['is', 'was', 'were', 'be'] },
    { s: 'She apologised ____ being late.', a: 'for', opts: ['for', 'of', 'to', 'at'] },
    { s: 'This is the house ____ my grandfather built.', a: 'which', opts: ['who', 'which', 'whose', 'whom'] },
    { s: 'He would rather read ____ watch television.', a: 'than', opts: ['then', 'than', 'that', 'to'] },
    { s: 'By next year, she ____ finished her studies.', a: 'will have', opts: ['will has', 'will have', 'has', 'had'] },
    { s: 'The children were excited ____ the trip.', a: 'about', opts: ['about', 'of', 'at', 'for'] },
    { s: 'Not until midnight ____ the rain stop.', a: 'did', opts: ['did', 'does', 'do', 'done'] },
    { s: 'She spoke as if she ____ everything.', a: 'knew', opts: ['know', 'knows', 'knew', 'known'] },
    { s: 'The work must ____ completed today.', a: 'be', opts: ['be', 'is', 'was', 'been'] },
    { s: 'It was the best film ____ I have ever seen.', a: 'that', opts: ['that', 'who', 'whose', 'whom'] },
    { s: 'We had better ____ now before it rains.', a: 'leave', opts: ['leave', 'leaves', 'left', 'leaving'] },
    { s: 'She is the girl ____ bag was stolen.', a: 'whose', opts: ['who', 'whose', 'which', 'whom'] },
    { s: 'The meeting was postponed ____ the flood.', a: 'because of', opts: ['because', 'because of', 'although', 'despite of'] },
    { s: 'No sooner had he sat down ____ the bell rang.', a: 'than', opts: ['then', 'than', 'when', 'that'] },
    { s: 'Neither of the answers ____ correct.', a: 'is', opts: ['is', 'are', 'were', 'be'] },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en5-grammar',
        prompt: it.s,
        promptSub: 'Choose the correct word.',
        answer: it.a,
        distractors: it.opts.filter((o) => o !== it.a),
        explanation: `"${it.s.replace('____', it.a)}" is grammatically correct.`,
        emoji: '📐',
        cols: 2,
        speak: it.s.replace('____', 'blank'),
      });
    }
    const idioms: [string, string][] = [
      ['a piece of cake', 'very easy'],
      ['once in a blue moon', 'very rarely'],
      ['break the ice', 'start a conversation'],
      ['hit the books', 'study hard'],
      ['under the weather', 'feeling unwell'],
      ['cost an arm and a leg', 'very expensive'],
      ['let the cat out of the bag', 'reveal a secret'],
      ['a blessing in disguise', 'something good that seemed bad'],
      ['bite the bullet', 'face something difficult bravely'],
      ['the ball is in your court', 'it is your turn to decide'],
      ['burn the midnight oil', 'study or work late at night'],
      ['a drop in the ocean', 'a very small amount'],
      ['on cloud nine', 'extremely happy'],
      ['pull someone\'s leg', 'tease someone as a joke'],
      ['see eye to eye', 'agree with each other'],
      ['turn a blind eye', 'pretend not to notice'],
      ['keep an eye on', 'watch carefully'],
      ['get cold feet', 'become nervous and hesitant'],
      ['a piece of advice', 'a suggestion to help someone'],
      ['out of the blue', 'suddenly and unexpectedly'],
    ];
    const it2 = rng.pick(idioms);
    return mcq(rng, {
      prefix: 'en5-idiom',
      prompt: `What does the idiom "${it2[0]}" mean?`,
      answer: it2[1],
      distractors: rng.shuffle(idioms.filter((x) => x[0] !== it2[0])).slice(0, 3).map((x) => x[1]),
      explanation: `"${it2[0]}" means ${it2[1]}.`,
      emoji: '🎭',
      cols: 1,
      speak: `What does the idiom ${it2[0]} mean?`,
    });
  });
}

function en5ReadingAdvanced(_y: number, rng: Rng, count: number): Question[] {
  const passages = [
    {
      t: 'Deforestation is the clearing of forests on a large scale. It leads to the loss of habitats for countless species. Without trees, soil erosion increases and the risk of flooding rises. Sustainable logging and reforestation are essential to preserve our forests.',
      q: 'What is one consequence of deforestation?',
      a: 'Loss of habitats',
      d: ['More trees growing', 'Cleaner rivers', 'Lower temperatures'],
      why: 'The second sentence states that deforestation leads to habitat loss.',
    },
    {
      t: 'A balanced diet provides the nutrients our body needs. It includes carbohydrates for energy, proteins for growth, and vitamins for health. Eating too much sugar or fat can lead to health problems. A balanced diet combined with exercise keeps us healthy.',
      q: 'What do carbohydrates provide?',
      a: 'Energy',
      d: ['Growth', 'Vitamins', 'Health problems'],
      why: 'The text says carbohydrates provide energy.',
    },
    {
      t: 'Space exploration has led to many technological advances. Satellites now help with communication, weather forecasting and navigation. Research in space has also improved medical technology. Although expensive, space exploration benefits everyday life.',
      q: 'What do satellites help with according to the text?',
      a: 'Communication, weather forecasting and navigation',
      d: ['Cooking and cleaning', 'Farming and fishing', 'Reading and writing'],
      why: 'The second sentence lists the uses of satellites.',
    },
    {
      t: 'Volunteering benefits both the community and the volunteer. Volunteers develop new skills and gain valuable experience. They also build friendships with people from different backgrounds. Communities with active volunteers tend to be stronger and more caring.',
      q: 'What do volunteers gain according to the text?',
      a: 'New skills and experience',
      d: ['Large salaries', 'Free holidays', 'New houses'],
      why: 'The second sentence says volunteers develop new skills and gain experience.',
    },
    {
      t: 'Public transport reduces traffic congestion and air pollution. A single bus can carry as many passengers as forty cars. Using buses and trains also saves money on fuel and parking. Cities with good public transport are more pleasant to live in.',
      q: 'How many cars can one bus replace?',
      a: 'Forty',
      d: ['Four', 'Fourteen', 'Four hundred'],
      why: 'The text says a single bus can carry as many passengers as forty cars.',
    },
    {
      t: 'Good time management helps students succeed. Planning a timetable allows them to balance study and rest. Breaking large tasks into smaller steps makes work less stressful. Students who plan ahead rarely rush their assignments.',
      q: 'What does a timetable help students balance?',
      a: 'Study and rest',
      d: ['Money and food', 'Friends and family', 'Sport and music'],
      why: 'The text says a timetable balances study and rest.',
    },
    {
      t: 'Coral reefs are among the richest habitats in the sea. They shelter thousands of species of fish and other creatures. Rising sea temperatures, however, cause coral bleaching. Protecting reefs requires reducing pollution and limiting harmful fishing.',
      q: 'What causes coral bleaching?',
      a: 'Rising sea temperatures',
      d: ['Heavy rainfall', 'Strong winds', 'Cold currents'],
      why: 'The text states rising sea temperatures cause coral bleaching.',
    },
  ];
  return fill(count, (i) => {
    const p = rng.pick(passages);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en5-reading',
        prompt: `Read the text:\n\n"${p.t}"\n\n${p.q}`,
        answer: p.a,
        distractors: p.d,
        explanation: p.why,
        emoji: '📰',
        cols: 1,
        speak: `${p.t} ${p.q}`,
      });
    }
    return mcq(rng, {
      prefix: 'en5-reading',
      prompt: `Read the text:\n\n"${p.t}"\n\nWhat is the writer's main purpose?`,
      answer: 'To inform the reader about the topic',
      distractors: ['To entertain with a funny story', 'To sell a product', 'To complain about something'],
      explanation: 'The text presents facts to inform the reader.',
      emoji: '🎯',
      cols: 1,
    });
  });
}

function en6GrammarMastery(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { s: 'By the time we arrived, the film ____ already started.', a: 'had', opts: ['has', 'had', 'have', 'was'] },
    { s: 'The report ____ completed by the team last week.', a: 'was', opts: ['is', 'was', 'were', 'has'] },
    { s: 'She wishes she ____ more time to study.', a: 'had', opts: ['has', 'had', 'have', 'having'] },
    { s: 'It is essential that every student ____ present.', a: 'be', opts: ['is', 'be', 'was', 'were'] },
    { s: 'Not only did he apologise, ____ he also paid for the damage.', a: 'but', opts: ['but', 'and', 'or', 'so'] },
    { s: 'The children, ____ parents were late, waited patiently.', a: 'whose', opts: ['who', 'whose', 'whom', 'which'] },
    { s: 'If she ____ harder, she would have passed.', a: 'had studied', opts: ['studied', 'had studied', 'studies', 'has studied'] },
    { s: 'He is regarded ____ one of the best players.', a: 'as', opts: ['as', 'like', 'for', 'to'] },
    { s: 'The manager insisted that the report ____ submitted on time.', a: 'be', opts: ['is', 'be', 'was', 'were'] },
    { s: 'Scarcely had she spoken ____ everyone applauded.', a: 'when', opts: ['then', 'when', 'than', 'that'] },
    { s: 'The proposal, ____ merits were clear, was approved.', a: 'whose', opts: ['who', 'whose', 'which', 'that'] },
    { s: 'He is accustomed ____ working under pressure.', a: 'to', opts: ['to', 'for', 'of', 'with'] },
    { s: 'Were I ____ the opportunity, I would accept it.', a: 'given', opts: ['give', 'given', 'gave', 'giving'] },
    { s: 'The scientists, together with their assistants, ____ the results.', a: 'published', opts: ['publish', 'published', 'publishing', 'publishes'] },
    { s: 'It was not until dawn ____ the rescue team arrived.', a: 'that', opts: ['that', 'when', 'then', 'which'] },
    { s: 'She would rather ____ the truth than hide it.', a: 'tell', opts: ['tell', 'tells', 'told', 'telling'] },
    { s: 'Little ____ we know about the depth of the ocean.', a: 'do', opts: ['do', 'does', 'did', 'done'] },
    { s: 'The evidence must ____ examined carefully.', a: 'be', opts: ['be', 'is', 'was', 'been'] },
    { s: 'He was promoted ____ virtue of his hard work.', a: 'by', opts: ['by', 'in', 'on', 'at'] },
    { s: 'Such was the noise ____ nobody could hear me.', a: 'that', opts: ['that', 'which', 'when', 'who'] },
    { s: 'The committee has yet ____ reach a decision.', a: 'to', opts: ['to', 'for', 'of', 'at'] },
    { s: 'If only I ____ listened to your advice.', a: 'had', opts: ['have', 'had', 'has', 'having'] },
    { s: 'Hardly ever ____ she complain about her work.', a: 'does', opts: ['do', 'does', 'did', 'doing'] },
    { s: 'The rules require that all forms ____ signed.', a: 'be', opts: ['are', 'be', 'were', 'is'] },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en6-grammar',
        prompt: it.s,
        promptSub: 'Choose the correct word or phrase.',
        answer: it.a,
        distractors: it.opts.filter((o) => o !== it.a),
        explanation: `"${it.s.replace('____', it.a)}" is correct.`,
        emoji: '🏆',
        cols: 1,
        speak: it.s.replace('____', 'blank'),
      });
    }
    const prose: [string, string][] = [
      ['benevolent', 'kind and generous'],
      ['meticulous', 'very careful and precise'],
      ['resilient', 'able to recover quickly'],
      ['ambiguous', 'unclear or having more than one meaning'],
      ['profound', 'very deep or intense'],
      ['inevitable', 'certain to happen'],
      ['tenacious', 'holding on firmly and not giving up'],
      ['eloquent', 'speaking clearly and persuasively'],
      ['prudent', 'acting with care and good judgement'],
      ['vehement', 'showing very strong feeling'],
      ['obsolete', 'no longer used or out of date'],
      ['lucrative', 'producing a lot of money'],
      ['arduous', 'needing much effort and hard work'],
      ['candid', 'honest and direct'],
      ['meticulous', 'very careful about small details'],
      ['resilient', 'able to recover quickly from difficulty'],
      ['ambiguous', 'unclear or having more than one meaning'],
      ['benevolent', 'kind and generous'],
      ['profound', 'very deep or intense'],
      ['abundant', 'existing in large quantities'],
      ['tedious', 'boring because it lasts too long'],
      ['innovative', 'introducing new ideas or methods'],
      ['diligent', 'careful and persistent in work'],
      ['reluctant', 'unwilling and hesitant'],
    ];
    const it2 = rng.pick(prose);
    return mcq(rng, {
      prefix: 'en6-vocab',
      prompt: `What does "${it2[0]}" mean?`,
      answer: it2[1],
      distractors: rng.shuffle(prose.filter((x) => x[0] !== it2[0])).slice(0, 3).map((x) => x[1]),
      explanation: `"${it2[0]}" means ${it2[1]}.`,
      emoji: '📖',
      cols: 1,
      speak: `What does ${it2[0]} mean?`,
    });
  });
}

function en6WritingComposition(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { t: 'The Importance of Discipline', p: 'discipline helps us achieve our goals' },
    { t: 'Environmental Pollution', p: 'we must reduce pollution for a better future' },
    { t: 'Benefits of Reading', p: 'reading broadens our knowledge' },
    { t: 'My Ambition', p: 'I want to become a doctor to help people' },
    { t: 'The Value of Friendship', p: 'true friends support each other' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 3 === 0) {
      return order({
        prefix: 'en6-writing',
        prompt: `Arrange the structure of an essay titled "${it.t}".`,
        items: rng.shuffle([
          'Introduction: state the topic',
          'Body paragraph 1: first point',
          'Body paragraph 2: second point',
          'Conclusion: summarise and give an opinion',
        ]),
        correctOrder: [
          'Introduction: state the topic',
          'Body paragraph 1: first point',
          'Body paragraph 2: second point',
          'Conclusion: summarise and give an opinion',
        ],
        explanation: 'A well-structured essay has an introduction, body paragraphs and a conclusion.',
        emoji: '🏗️',
      });
    }
    if (i % 3 === 1) {
      return mcq(rng, {
        prefix: 'en6-writing',
        prompt: `You are writing an essay titled "${it.t}".\nWhich thesis statement is most suitable?`,
        answer: `This essay will discuss why ${it.p}.`,
        distractors: [
          'I like to play games every day.',
          'This essay has no clear topic.',
          'The weather today is very hot.',
          'I do not enjoy writing essays.',
        ],
        explanation: `A thesis statement should present the main argument about "${it.t}".`,
        emoji: '📌',
        cols: 1,
      });
    }
    return mcq(rng, {
      prefix: 'en6-writing',
      prompt: `Which sentence is the best conclusion for an essay titled "${it.t}"?`,
      answer: `In conclusion, ${it.p}.`,
      distractors: [
        'And that is all I want to say.',
        'I am tired now.',
        'To be continued.',
        'The end of my homework.',
      ],
      explanation: 'A conclusion summarises the main points and restates the argument.',
      emoji: '🎯',
      cols: 1,
    });
  });
}

function en6ListeningLanguageArts(_y: number, rng: Rng, count: number): Question[] {
  const poems: { line: string; q: string; a: string; d: string[] }[] = [
    {
      line: 'The little bird sings in the tree,\nA happy song for you and me.',
      q: 'What is the bird doing?',
      a: 'Singing',
      d: ['Sleeping', 'Flying', 'Eating'],
    },
    {
      line: 'Rain, rain, come again,\nWash the streets and fill the drain.',
      q: 'What does the rain do?',
      a: 'Washes the streets',
      d: ['Builds houses', 'Feeds the birds', 'Paints the sky'],
    },
    {
      line: 'Twinkle, twinkle, little star,\nHow I wonder what you are.',
      q: 'What is the poet wondering about?',
      a: 'What the star is',
      d: ['Where the moon is', 'How the sun shines', 'Why the sky is blue'],
    },
  ];
  const literary: [string, string][] = [
    ['The wind whispered through the trees.', 'Personification'],
    ['He is as brave as a lion.', 'Simile'],
    ['I have told you a million times.', 'Hyperbole'],
    ['The classroom was a zoo.', 'Metaphor'],
  ];
  return fill(count, (i) => {
    if (i % 2 === 0) {
      const p = rng.pick(poems);
      return mcq(rng, {
        prefix: 'en6-languagearts',
        prompt: `Read the poem:\n\n"${p.line}"\n\n${p.q}`,
        answer: p.a,
        distractors: p.d,
        explanation: `The poem says the answer is "${p.a}".`,
        emoji: '🎵',
        cols: 2,
        speak: `${p.line} ${p.q}`,
      });
    }
    const it = rng.pick(literary);
    return mcq(rng, {
      prefix: 'en6-languagearts',
      prompt: `Which literary device is used in:\n"${it[0]}"`,
      answer: it[1],
      distractors: ['Personification', 'Simile', 'Hyperbole', 'Metaphor'].filter((x) => x !== it[1]),
      explanation: `"${it[0]}" uses ${it[1]}.`,
      emoji: '🎨',
      cols: 2,
      speak: it[0],
    });
  });
}

function en2LanguageArts(_y: number, rng: Rng, count: number): Question[] {
  const rhymes = [
    { line: 'Rain, rain, go away', next: 'Come again another day', why: 'The lines rhyme: "away" and "day".' },
    { line: 'Twinkle, twinkle, little star', next: 'How I wonder what you are', why: 'The lines rhyme: "star" and "are".' },
    { line: 'Humpty Dumpty sat on a wall', next: 'Humpty Dumpty had a great fall', why: 'The lines rhyme: "wall" and "fall".' },
    { line: 'One, two, buckle my shoe', next: 'Three, four, knock at the door', why: 'The lines rhyme: "two/shoe" and "four/door".' },
    { line: 'Jack and Jill went up the hill', next: 'To fetch a pail of water', why: '"Jill" and "hill" rhyme at the end of the line.' },
  ];
  const families = [
    { base: 'cat', words: ['hat', 'bat', 'mat'], ms: 'kucing' },
    { base: 'star', words: ['car', 'jar', 'far'], ms: 'bintang' },
    { base: 'blue', words: ['shoe', 'two', 'zoo'], ms: 'biru' },
    { base: 'sun', words: ['run', 'fun', 'bun'], ms: 'matahari' },
    { base: 'bee', words: ['tree', 'see', 'knee'], ms: 'lebah' },
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const r = rng.pick(rhymes);
      return mcq(rng, {
        prefix: 'en2-arts',
        prompt: `Which line comes next in this rhyme?\n\n"${r.line}"`,
        answer: r.next,
        distractors: ['The sun is very hot today', 'I like to eat my rice', 'My school is near the shop', 'Please open the window'],
        explanation: r.why,
        emoji: '🎵',
        cols: 1,
        speak: r.line,
      });
    }
    if (i % 3 === 1) {
      const f = rng.pick(families);
      const w = rng.pick(f.words);
      return mcq(rng, {
        prefix: 'en2-arts',
        prompt: `Which word rhymes with "${f.base}" (${f.ms})?`,
        answer: w,
        distractors: ['book', 'chair', 'pencil', 'table'],
        explanation: `"${w}" rhymes with "${f.base}" because they end with the same sound.`,
        emoji: '🔊',
        cols: 2,
        speak: `Which word rhymes with ${f.base}?`,
      });
    }
    const f = rng.pick(families);
    return match({
      prefix: 'en2-arts',
      prompt: 'Match each word with a word that rhymes with it.',
      pairs: [
        { left: f.base, right: f.words[0] },
        { left: f.words[1], right: f.words[2] },
      ],
      explanation: `Words in a rhyme family end with the same sound.`,
      emoji: '🎶',
    });
  });
}

function en2Punctuation(_y: number, rng: Rng, count: number): Question[] {
  const fix = [
    { bad: 'my name is ali', good: 'My name is Ali.', why: 'A sentence starts with a capital letter, and names need capital letters. It ends with a full stop.' },
    { bad: 'i live in kuala lumpur', good: 'I live in Kuala Lumpur.', why: '"I" is always a capital letter, and place names need capital letters.' },
    { bad: 'where is my bag', good: 'Where is my bag?', why: 'A question ends with a question mark.' },
    { bad: 'what a big fish', good: 'What a big fish!', why: 'A strong feeling ends with an exclamation mark.' },
    { bad: 'we go to school every day', good: 'We go to school every day.', why: 'A statement starts with a capital letter and ends with a full stop.' },
    { bad: 'do you like apples', good: 'Do you like apples?', why: 'A question starts with a capital letter and ends with a question mark.' },
  ];
  const marks = [
    { s: 'I like to read books', mark: 'full stop (.)', why: 'It is a statement, so it ends with a full stop.' },
    { s: 'Is your sister at home', mark: 'question mark (?)', why: 'It is a question, so it ends with a question mark.' },
    { s: 'What a beautiful rainbow', mark: 'exclamation mark (!)', why: 'It shows strong feeling, so it ends with an exclamation mark.' },
    { s: 'The cat is sleeping', mark: 'full stop (.)', why: 'It is a statement, so it ends with a full stop.' },
    { s: 'Can you help me', mark: 'question mark (?)', why: 'It is a question, so it ends with a question mark.' },
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const it = rng.pick(fix);
      return mcq(rng, {
        prefix: 'en2-punct',
        prompt: `Which sentence is written correctly?\n\nWrong: "${it.bad}"`,
        answer: it.good,
        distractors: [it.bad, it.bad + '?', it.bad.charAt(0).toUpperCase() + it.bad.slice(1) + '!'],
        explanation: it.why,
        emoji: '❗',
        cols: 1,
        speak: 'Which sentence is written correctly?',
      });
    }
    if (i % 3 === 1) {
      const m = rng.pick(marks);
      return mcq(rng, {
        prefix: 'en2-punct',
        prompt: `Which end mark should this sentence have?\n\n"${m.s}"`,
        answer: m.mark,
        distractors: ['full stop (.)', 'question mark (?)', 'exclamation mark (!)'],
        explanation: m.why,
        emoji: '🔠',
        cols: 2,
      });
    }
    const it = rng.pick(fix);
    return trueFalse({
      prefix: 'en2-punct',
      lang: 'en',
      prompt: `This sentence is correct: "${it.good}"`,
      isTrue: true,
      explanation: it.why,
      emoji: '✅',
    });
  });
}

function en5WritingPurposes(_y: number, rng: Rng, count: number): Question[] {
  const situations = [
    {
      task: 'Write an email to your friend about your school holiday.',
      best: 'Hi Aina, how are you? I went to the beach last week. It was fun! Best wishes, Danial',
      why: 'An email to a friend is friendly and uses a greeting and a closing.',
      bad: ['To Whom It May Concern, I am writing regarding the beach.', 'Dear Sir, please approve my beach request.', 'The beach was at coordinates 3.1, 101.6.'],
    },
    {
      task: 'Write a short message to thank your teacher.',
      best: 'Dear Cikgu Ros, thank you for helping me with my Maths. I understand it now. Yours sincerely, Mei Ling',
      why: 'A message to a teacher is polite and uses a proper greeting and closing.',
      bad: ['Yo teacher, maths was ok I guess.', 'Give me more homework please.', 'I do not want to say thank you.'],
    },
    {
      task: 'Write a postcard to a friend about your holiday.',
      best: 'Greetings from Penang! The food here is delicious. Wish you were here! See you soon, Amir',
      why: 'A postcard is short, friendly and shares a quick piece of news.',
      bad: ['Dear Sir, I am applying for a holiday permit.', 'This postcard has no message at all.', 'Please find attached my holiday report.'],
    },
    {
      task: 'Describe your favourite place for a school project.',
      best: 'My favourite place is the library. It is quiet and has many books. I go there every Saturday.',
      why: 'A description tells the reader what the place is like using clear details.',
      bad: ['I like it.', 'The place is a place.', 'No comment.'],
    },
  ];
  const features = [
    { part: 'Greeting', ex: 'Dear Aina,', why: 'A greeting starts the message and shows who you are writing to.' },
    { part: 'Opening', ex: 'How are you?', why: 'An opening starts the message in a friendly way.' },
    { part: 'Body', ex: 'I went to the beach last week.', why: 'The body gives the main news or request.' },
    { part: 'Closing', ex: 'Best wishes, Danial', why: 'A closing ends the message politely.' },
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const s = rng.pick(situations);
      return mcq(rng, {
        prefix: 'en5-purpose',
        prompt: `${s.task}\n\nWhich writing is the best?`,
        answer: s.best,
        distractors: s.bad,
        explanation: s.why,
        emoji: '✉️',
        cols: 1,
        speak: s.task,
      });
    }
    if (i % 3 === 1) {
      const f = rng.pick(features);
      return mcq(rng, {
        prefix: 'en5-purpose',
        prompt: `In a letter or email, what is the "${f.part}"?`,
        answer: f.ex,
        distractors: features.filter((x) => x.part !== f.part).map((x) => x.ex),
        explanation: f.why,
        emoji: '📨',
        cols: 1,
      });
    }
    const f = rng.pick(features);
    return trueFalse({
      prefix: 'en5-purpose',
      lang: 'en',
      prompt: `"${f.ex}" is an example of a ${f.part.toLowerCase()}.`,
      isTrue: true,
      explanation: f.why,
      emoji: '✅',
    });
  });
}

function en5LanguageArts(_y: number, rng: Rng, count: number): Question[] {
  const stories = [
    { title: 'The Lost Kitten', character: 'A small kitten', setting: 'A busy market', plot: 'The kitten gets lost and a kind girl helps it find its mother.', lesson: 'We should help others who need us.', feel: 'Worried, then happy' },
    { title: 'The Brave Boy', character: 'A boy named Hafiz', setting: 'A village near a river', plot: 'Hafiz saves a drowning puppy from the river.', lesson: 'Courage means helping even when you are afraid.', feel: 'Afraid, then proud' },
    { title: 'The Greedy Monkey', character: 'A monkey', setting: 'A jungle', plot: 'The monkey takes too many bananas and drops them all.', lesson: 'Do not be greedy.', feel: 'Proud, then sorry' },
    { title: 'The Kind Farmer', character: 'An old farmer', setting: 'A rice field', plot: 'The farmer shares his harvest with hungry neighbours.', lesson: 'Sharing makes everyone happy.', feel: 'Happy and content' },
  ];
  const devices = [
    { s: 'The wind whispered in the trees.', device: 'Personification', why: 'The wind is given a human action: whispering.' },
    { s: 'He is as brave as a lion.', device: 'Simile', why: 'It compares using "as ... as".' },
    { s: 'The stars danced in the sky.', device: 'Personification', why: 'The stars are given a human action: dancing.' },
    { s: 'Her smile was like sunshine.', device: 'Simile', why: 'It compares using "like".' },
    { s: 'I have told you a million times.', device: 'Hyperbole', why: 'It is an extreme exaggeration, not a real number.' },
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const s = rng.pick(stories);
      return mcq(rng, {
        prefix: 'en5-arts',
        prompt: `Story: "${s.title}"\n\nWho is the main character?`,
        answer: s.character,
        distractors: ['The teacher', 'The doctor', 'The driver'],
        explanation: `The main character of "${s.title}" is ${s.character.toLowerCase()}.`,
        emoji: '📖',
        cols: 2,
      });
    }
    if (i % 3 === 1) {
      const s = rng.pick(stories);
      return mcq(rng, {
        prefix: 'en5-arts',
        prompt: `Story: "${s.title}"\n\nWhat is the lesson of this story?`,
        answer: s.lesson,
        distractors: ['Money is everything', 'Never help anyone', 'Always be lazy', 'Books are boring'],
        explanation: `"${s.title}" teaches us: ${s.lesson}`,
        emoji: '💡',
        cols: 1,
      });
    }
    const d = rng.pick(devices);
    return mcq(rng, {
      prefix: 'en5-arts',
      prompt: `Which literary device is used in:\n"${d.s}"`,
      answer: d.device,
      distractors: ['Personification', 'Simile', 'Hyperbole', 'Metaphor'].filter((x) => x !== d.device),
      explanation: d.why,
      emoji: '🎨',
      cols: 2,
      speak: d.s,
    });
  });
}

/* ------------------------------------------------------------------ */
/* Listening (Tahun 1-6)                                               */
/* ------------------------------------------------------------------ */

/**
 * Data bunyi huruf untuk soalan mendengar Tahap I.
 *
 * Setiap entri menyimpan bunyi awal dan akhir yang sebenar, bukan hanya
 * huruf pertama, kerana sesetengah huruf berbunyi lain (cth. "c" dalam
 * "city" berbunyi /s/). Hanya perkataan yang tidak kabur digunakan.
 */
const SOUND_WORDS: { w: string; e: string; ms: string; first: string; last: string }[] = [
  { w: 'sun', e: '☀️', ms: 'matahari', first: 's', last: 'n' },
  { w: 'cat', e: '🐱', ms: 'kucing', first: 'c', last: 't' },
  { w: 'ball', e: '⚽', ms: 'bola', first: 'b', last: 'l' },
  { w: 'dog', e: '🐶', ms: 'anjing', first: 'd', last: 'g' },
  { w: 'hat', e: '🎩', ms: 'topi', first: 'h', last: 't' },
  { w: 'map', e: '🗺️', ms: 'peta', first: 'm', last: 'p' },
  { w: 'pen', e: '🖊️', ms: 'pen', first: 'p', last: 'n' },
  { w: 'cup', e: '🥤', ms: 'cawan', first: 'c', last: 'p' },
  { w: 'bus', e: '🚌', ms: 'bas', first: 'b', last: 's' },
  { w: 'fish', e: '🐟', ms: 'ikan', first: 'f', last: 'sh' },
  { w: 'book', e: '📕', ms: 'buku', first: 'b', last: 'k' },
  { w: 'milk', e: '🥛', ms: 'susu', first: 'm', last: 'k' },
  { w: 'nest', e: '🪹', ms: 'sarang', first: 'n', last: 't' },
  { w: 'kite', e: '🪁', ms: 'layang-layang', first: 'k', last: 't' },
  { w: 'leaf', e: '🍃', ms: 'daun', first: 'l', last: 'f' },
  { w: 'rain', e: '🌧️', ms: 'hujan', first: 'r', last: 'n' },
];

function en1ListeningSounds(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const it = rng.pick(SOUND_WORDS);
    if (i % 3 === 0) {
      const pool = SOUND_WORDS.filter((x) => x.first !== it.first).map((x) => x.first);
      return mcq(rng, {
        prefix: 'en1-listening',
        prompt: `Which sound does "${it.w}" start with?`,
        promptSub: `Bunyi apa pada awal "${it.w}"?`,
        answer: it.first,
        distractors: [...new Set(pool)].slice(0, 3),
        explanation: `"${it.w}" (${it.ms}) starts with the sound "${it.first}".`,
        emoji: '👂',
        cols: 2,
        speak: `Which sound does ${it.w} start with?`,
      });
    }
    if (i % 3 === 1) {
      const pool = SOUND_WORDS.filter((x) => x.last !== it.last).map((x) => x.last);
      return mcq(rng, {
        prefix: 'en1-listening',
        prompt: `Which sound does "${it.w}" end with?`,
        promptSub: `Bunyi apa pada akhir "${it.w}"?`,
        answer: it.last,
        distractors: [...new Set(pool)].slice(0, 3),
        explanation: `"${it.w}" (${it.ms}) ends with the sound "${it.last}".`,
        emoji: '👂',
        cols: 2,
        speak: `Which sound does ${it.w} end with?`,
      });
    }
    // Label kanan mesti unik: dua perkataan berkongsi bunyi pertama yang
    // sama akan menghasilkan pasangan mengelirukan (cth. "cat" dan "cup").
    const usedFirst = new Set([it.first]);
    const others: typeof SOUND_WORDS = [];
    for (const cand of rng.shuffle(SOUND_WORDS)) {
      if (usedFirst.has(cand.first)) continue;
      usedFirst.add(cand.first);
      others.push(cand);
      if (others.length >= 2) break;
    }
    return match({
      prefix: 'en1-listening',
      prompt: 'Match each word with its first sound.',
      promptSub: 'Padankan perkataan dengan bunyi pertamanya.',
      pairs: [it, ...others].map((x) => ({ left: x.w, right: x.first })),
      explanation: 'Listen to the first sound of each word.',
      emoji: '👂',
    });
  });
}

/**
 * Arahan bilik darjah untuk soalan mendengar Tahun 2.
 *
 * `action` ialah jawapan ringkas dalam Bahasa Inggeris supaya pilihan jawapan
 * kekal dalam bahasa yang diuji. `ms` hanya menjadi nota bantuan dwibahasa.
 */
const CLASSROOM_STEPS: { say: string; action: string; ms: string; emoji: string }[] = [
  { say: 'Open your book at page ten.', action: 'Open the book', ms: 'Buka buku kamu.', emoji: '📖' },
  { say: 'Take out your pencil.', action: 'Take out a pencil', ms: 'Keluarkan pensel kamu.', emoji: '✏️' },
  { say: 'Write your name at the top.', action: 'Write your name', ms: 'Tulis nama kamu.', emoji: '📝' },
  { say: 'Close the door, please.', action: 'Close the door', ms: 'Tutup pintu.', emoji: '🚪' },
  { say: 'Put your bag under the table.', action: 'Put the bag under the table', ms: 'Letakkan beg di bawah meja.', emoji: '🎒' },
  { say: 'Stand up and stretch.', action: 'Stand up and stretch', ms: 'Berdiri dan regangkan badan.', emoji: '🧍' },
  { say: 'Sit down quietly.', action: 'Sit down quietly', ms: 'Duduk dengan tenang.', emoji: '🪑' },
  { say: 'Look at the whiteboard.', action: 'Look at the whiteboard', ms: 'Lihat papan putih.', emoji: '📋' },
  { say: 'Raise your hand to answer.', action: 'Raise your hand', ms: 'Angkat tangan kamu.', emoji: '🙋' },
  { say: 'Keep your books in the shelf.', action: 'Keep the books in the shelf', ms: 'Simpan buku di rak.', emoji: '📚' },
];

/**
 * Rutin tetap untuk soalan susun urutan.
 *
 * Tertibnya sengaja ditetapkan (bukan dirawak) kerana arahan bilik darjah
 * yang berbeza tidak mempunyai satu urutan yang betul.
 */
const MORNING_ROUTINE: string[] = [
  'Say good morning to your teacher.',
  'Sit down at your place.',
  'Take out your books and pencil.',
  'Listen to the teacher carefully.',
];

function en2ListeningInstructions(_y: number, rng: Rng, count: number): Question[] {
  const ORDER_WORDS: { w: string; pos: string; ms: string }[] = [
    { w: 'First', pos: 'first', ms: 'mula-mula' },
    { w: 'Then', pos: 'second', ms: 'kemudian' },
    { w: 'Next', pos: 'third', ms: 'selepas itu' },
    { w: 'Finally', pos: 'last', ms: 'akhir sekali' },
  ];
  return fill(count, (i) => {
    if (i % 3 === 2) {
      const start = rng.int(0, MORNING_ROUTINE.length - 3);
      const picks = MORNING_ROUTINE.slice(start, start + 3);
      return order({
        prefix: 'en2-listening',
        prompt: 'Arrange these morning routine steps in the correct order.',
        promptSub: 'Susun langkah rutin pagi ini mengikut urutan yang betul.',
        items: rng.shuffle(picks),
        correctOrder: picks,
        explanation: 'A morning routine follows a clear order from start to finish.',
        emoji: '👂',
      });
    }
    const it = rng.pick(CLASSROOM_STEPS);
    if (i % 3 === 0) {
      const others = CLASSROOM_STEPS.filter((x) => x.action !== it.action);
      return mcq(rng, {
        prefix: 'en2-listening',
        prompt: `Your teacher says:\n\n"${it.say}"\n\nWhat should you do?`,
        promptSub: `Apakah yang perlu kamu lakukan? (${it.ms})`,
        answer: it.action,
        distractors: rng.sample(others, 3).map((x) => x.action),
        explanation: `"${it.say}" means you should ${it.action.charAt(0).toLowerCase()}${it.action.slice(1)}.`,
        emoji: it.emoji,
        cols: 1,
        speak: it.say,
      });
    }
    const it2 = rng.pick(ORDER_WORDS);
    const others = ORDER_WORDS.filter((x) => x.w !== it2.w);
    return mcq(rng, {
      prefix: 'en2-listening',
      prompt: `Your teacher says:\n\n"${it2.w}, open your book."\n\nWhat does "${it2.w}" tell you about the time?`,
      promptSub: `Apakah maksud "${it2.w}"?`,
      answer: `It happens ${it2.pos}`,
      distractors: others.map((x) => `It happens ${x.pos}`),
      explanation: `"${it2.w}" (${it2.ms}) tells you when something happens — here it happens ${it2.pos}.`,
      emoji: '👂',
      cols: 2,
      speak: `${it2.w}, open your book.`,
    });
  });
}

/**
 * Cerita pendek untuk soalan mendengar Tahun 3.
 *
 * `speak` membaca cerita penuh; soalan menyemak kefahaman, bukan hafalan.
 */
const SHORT_STORIES: {
  t: string;
  ms: string;
  q: string;
  a: string;
  d: string[];
  why: string;
  main: string;
}[] = [
  {
    t: 'Nabil found a small kitten under the stairs. It was wet and cold. He took it home and gave it warm milk. Now the kitten sleeps beside his bed every night.',
    ms: 'Nabil menjumpai anak kucing di bawah tangga. Ia basah dan sejuk. Dia membawanya pulang dan memberinya susu suam.',
    q: 'Where did Nabil find the kitten?',
    a: 'Under the stairs',
    d: ['In the garden', 'At the market', 'Behind the school'],
    why: 'The story says he found it under the stairs.',
    main: 'Nabil found a kitten and took care of it',
  },
  {
    t: 'Every morning, Mei Ling walks to school with her neighbour. They pass a bakery and smell fresh bread. Mei Ling saves her pocket money to buy one bun on Friday.',
    ms: 'Setiap pagi, Mei Ling berjalan ke sekolah dengan jirannya. Mereka melalui kedai roti.',
    q: 'When does Mei Ling buy a bun?',
    a: 'On Friday',
    d: ['On Monday', 'Every day', 'On Sunday'],
    why: 'The story says she buys one bun on Friday.',
    main: 'Mei Ling saves money to buy a bun on Friday',
  },
  {
    t: 'The school library was noisy, so the librarian put up a sign. It said, "Please whisper." After that, everyone spoke softly and the library became a calm place to read.',
    ms: 'Perpustakaan sekolah bising, jadi pustakawan meletakkan tanda "Sila berbisik".',
    q: 'Why did the librarian put up a sign?',
    a: 'Because the library was noisy',
    d: ['Because the books were old', 'Because it was raining', 'Because school was closed'],
    why: 'The story says the library was noisy, so she put up a sign.',
    main: 'The librarian asked everyone to whisper',
  },
  {
    t: 'Arif planted a seed in a small pot. He watered it every day and kept it near the window. After two weeks, a tiny green shoot appeared. Arif was very happy.',
    ms: 'Arif menanam biji benih dalam pasu kecil dan menyiramnya setiap hari.',
    q: 'What appeared after two weeks?',
    a: 'A tiny green shoot',
    d: ['A red flower', 'A big tree', 'A ripe fruit'],
    why: 'The story says a tiny green shoot appeared after two weeks.',
    main: 'Arif grew a plant from a seed',
  },
];

function en3ListeningStories(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const s = rng.pick(SHORT_STORIES);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en3-listening',
        prompt: `Listen to the story:\n\n"${s.t}"\n\n${s.q}`,
        promptSub: 'Dengar cerita, kemudian jawab soalan.',
        answer: s.a,
        distractors: s.d,
        explanation: s.why,
        emoji: '📖',
        cols: 1,
        speak: `${s.t} ${s.q}`,
      });
    }
    return trueFalse({
      prefix: 'en3-listening',
      prompt: `Listen to the story:\n\n"${s.t}"\n\nTrue or false: ${s.main}.`,
      promptSub: 'Betul atau salah?',
      isTrue: true,
      explanation: `${s.why} This is the main point of the story.`,
      emoji: '👂',
      speak: `${s.t} True or false: ${s.main}.`,
      lang: 'en',
    });
  });
}

/**
 * Pengumuman sekolah untuk soalan mendengar Tahun 4.
 *
 * Setiap pengumuman menyimpan beberapa `qs` supaya kertas peperiksaan boleh
 * menyoal sudut berbeza daripada bahan yang sama. Tanpa ini, kertas 30 soalan
 * terpaksa mengulang pengumuman yang sama dan menjadi terlalu serupa.
 */
const ANNOUNCEMENTS: {
  t: string;
  ms: string;
  qs: { q: string; a: string; d: string[]; why: string }[];
}[] = [
  {
    t: 'Attention, please. The school library will close at four o\'clock today. Please return your books before then.',
    ms: 'Perhatian. Perpustakaan sekolah akan tutup pada pukul empat hari ini.',
    qs: [
      { q: 'What time will the library close?', a: 'Four o\'clock', d: ['Three o\'clock', 'Five o\'clock', 'Six o\'clock'], why: 'The announcement says the library will close at four o\'clock.' },
      { q: 'What should pupils do before the library closes?', a: 'Return their books', d: ['Buy new books', 'Clean the shelves', 'Pay a fine'], why: 'The announcement asks pupils to return their books before then.' },
    ],
  },
  {
    t: 'Good morning, pupils. The football practice is cancelled today because of heavy rain. It will be held tomorrow at the same time.',
    ms: 'Latihan bola sepak dibatalkan hari ini kerana hujan lebat.',
    qs: [
      { q: 'Why is football practice cancelled?', a: 'Because of heavy rain', d: ['Because the coach is away', 'Because the field is new', 'Because it is a holiday'], why: 'The announcement says it is cancelled because of heavy rain.' },
      { q: 'When will football practice be held?', a: 'Tomorrow', d: ['Today', 'Next week', 'This evening'], why: 'The announcement says it will be held tomorrow at the same time.' },
    ],
  },
  {
    t: 'Please note that the canteen will serve free milk every Wednesday during recess. Bring your own cup.',
    ms: 'Kantin akan memberi susu percuma setiap hari Rabu waktu rehat.',
    qs: [
      { q: 'What must pupils bring?', a: 'Their own cup', d: ['Their own food', 'A football', 'A library book'], why: 'The announcement says, "Bring your own cup."' },
      { q: 'When is free milk served?', a: 'Every Wednesday during recess', d: ['Every Monday morning', 'Every Friday after school', 'Every day at noon'], why: 'The announcement says every Wednesday during recess.' },
    ],
  },
  {
    t: 'This is a reminder that the school bus will leave at seven fifteen tomorrow. Please be at the gate five minutes early.',
    ms: 'Bas sekolah akan bertolak pada pukul tujuh suku esok.',
    qs: [
      { q: 'When should pupils be at the gate?', a: 'Five minutes early', d: ['At seven fifteen', 'After the bell', 'At eight o\'clock'], why: 'The announcement asks pupils to be at the gate five minutes early.' },
      { q: 'What time will the school bus leave?', a: 'Seven fifteen', d: ['Five minutes early', 'Eight o\'clock', 'Seven o\'clock'], why: 'The announcement says the bus will leave at seven fifteen.' },
    ],
  },
  {
    t: 'The book fair will be held in the school hall from Monday to Wednesday. Pupils may visit during recess only. Please bring small notes to buy books.',
    ms: 'Pesta buku akan diadakan di dewan sekolah dari Isnin hingga Rabu.',
    qs: [
      { q: 'Where will the book fair be held?', a: 'In the school hall', d: ['In the library', 'In the canteen', 'On the field'], why: 'The announcement says the book fair will be in the school hall.' },
      { q: 'When may pupils visit the book fair?', a: 'During recess only', d: ['After school', 'Before assembly', 'At any time'], why: 'The announcement says pupils may visit during recess only.' },
    ],
  },
  {
    t: 'Pupils in Year Four will have a dental check-up on Thursday morning. Please bring your health card and wait outside the clinic quietly.',
    ms: 'Murid Tahun Empat akan menjalani pemeriksaan gigi pada pagi Khamis.',
    qs: [
      { q: 'What should pupils bring for the dental check-up?', a: 'Their health card', d: ['Their toothbrush', 'A water bottle', 'Their report card'], why: 'The announcement asks pupils to bring their health card.' },
      { q: 'Where should pupils wait?', a: 'Outside the clinic', d: ['In the classroom', 'In the hall', 'At the gate'], why: 'The announcement says to wait outside the clinic quietly.' },
    ],
  },
];

function en4ListeningAnnouncements(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const a = rng.pick(ANNOUNCEMENTS);
    if (i % 4 === 3) {
      return trueFalse({
        prefix: 'en4-listening',
        prompt: `Listen to the announcement:\n\n"${a.t}"\n\nThe main purpose of this announcement is to give information.`,
        promptSub: 'Betul atau salah?',
        isTrue: true,
        explanation: a.qs[0].why,
        emoji: '📢',
        speak: `${a.t} The main purpose of this announcement is to give information.`,
        lang: 'en',
      });
    }
    const item = rng.pick(a.qs);
    return mcq(rng, {
      prefix: 'en4-listening',
      prompt: `Listen to the announcement:\n\n"${a.t}"\n\n${item.q}`,
      promptSub: 'Dengar pengumuman, kemudian jawab soalan.',
      answer: item.a,
      distractors: item.d,
      explanation: item.why,
      emoji: '📢',
      cols: 1,
      speak: `${a.t} ${item.q}`,
    });
  });
}

/** Laporan ringkas untuk soalan mendengar Tahun 5. */
const REPORTS: { t: string; ms: string; q: string; a: string; d: string[]; why: string }[] = [
  {
    t: 'Malaysia has thirteen states and three federal territories. The largest state is Sarawak, and the smallest is Perlis.',
    ms: 'Malaysia mempunyai tiga belas negeri dan tiga wilayah persekutuan.',
    q: 'Which is the largest state in Malaysia?',
    a: 'Sarawak',
    d: ['Perlis', 'Selangor', 'Johor'],
    why: 'The report says the largest state is Sarawak.',
  },
  {
    t: 'Mount Kinabalu is the tallest mountain in Malaysia. It is about four thousand and ninety-five metres high and is in Sabah.',
    ms: 'Gunung Kinabalu ialah gunung tertinggi di Malaysia, di Sabah.',
    q: 'Where is Mount Kinabalu?',
    a: 'In Sabah',
    d: ['In Sarawak', 'In Pahang', 'In Perak'],
    why: 'The report says Mount Kinabalu is in Sabah.',
  },
  {
    t: 'Recycling reduces waste. Paper, plastic and glass can all be recycled. Recycling also saves energy and keeps the environment clean.',
    ms: 'Kitar semula mengurangkan sisa dan menjaga kebersihan alam.',
    q: 'Which materials can be recycled according to the report?',
    a: 'Paper, plastic and glass',
    d: ['Food and water', 'Sand and stone', 'Wood and leaves'],
    why: 'The report lists paper, plastic and glass.',
  },
  {
    t: 'Malaysia is a tropical country. It is warm all year, with rain in most months. Temperatures usually range from twenty-one to thirty-five degrees Celsius.',
    ms: 'Malaysia ialah negara tropika yang panas sepanjang tahun.',
    q: 'What is the usual temperature range in Malaysia?',
    a: 'Twenty-one to thirty-five degrees',
    d: ['Ten to twenty degrees', 'Forty to fifty degrees', 'Zero to ten degrees'],
    why: 'The report gives the range as twenty-one to thirty-five degrees Celsius.',
  },
];

function en5ListeningReports(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const r = rng.pick(REPORTS);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en5-listening',
        prompt: `Listen to the report:\n\n"${r.t}"\n\n${r.q}`,
        promptSub: 'Dengar laporan, kemudian jawab soalan.',
        answer: r.a,
        distractors: r.d,
        explanation: r.why,
        emoji: '📊',
        cols: 1,
        speak: `${r.t} ${r.q}`,
      });
    }
    const op = rng.pick([
      { s: 'The report states a fact that can be checked.', ok: true },
      { s: 'The report mainly shares the speaker\'s personal feelings.', ok: false },
    ]);
    return trueFalse({
      prefix: 'en5-listening',
      prompt: `Listen to the report:\n\n"${r.t}"\n\nTrue or false: ${op.s}`,
      promptSub: 'Betul atau salah?',
      isTrue: op.ok,
      explanation: op.ok
        ? 'The report gives facts, not personal feelings.'
        : 'The report gives facts, so it is not mainly about feelings.',
      emoji: '📊',
      speak: `${r.t} True or false: ${op.s}`,
      lang: 'en',
    });
  });
}

/** Ceramah ringkas untuk soalan mendengar Tahun 6. */
const TALKS: { t: string; ms: string; main: string; d: string[]; why: string }[] = [
  {
    t: 'Today I will talk about saving water. First, turn off the tap when you brush your teeth. Second, fix leaking pipes quickly. In short, every drop counts.',
    ms: 'Hari ini saya akan bercakap tentang menjimatkan air.',
    main: 'How to save water',
    d: ['How to clean a house', 'Why it rains', 'How to fix a bicycle'],
    why: 'The speaker says, "Today I will talk about saving water."',
  },
  {
    t: 'Good habits help us learn better. Sleep early so you are not tired. Eat a good breakfast before school. Plan your homework so you do not rush.',
    ms: 'Amalan baik membantu kita belajar dengan lebih baik.',
    main: 'Good habits for learning',
    d: ['Favourite foods', 'A school trip', 'How to play football'],
    why: 'The talk is about habits that help us learn better.',
  },
  {
    t: 'Reading opens new worlds. Books let you visit places you have never been. They also teach you new words and new ideas. Start with a short book you enjoy.',
    ms: 'Membaca membuka dunia baharu.',
    main: 'The benefits of reading',
    d: ['How to draw', 'The best sport', 'Cooking at home'],
    why: 'The talk explains what reading gives us.',
  },
  {
    t: 'Teamwork makes hard tasks easier. Share the work fairly. Listen to your friends. When everyone helps, the job finishes faster and everyone feels happy.',
    ms: 'Kerja berpasukan menjadikan tugas sukar lebih mudah.',
    main: 'The importance of teamwork',
    d: ['How to bake a cake', 'The tallest mountain', 'How to save money'],
    why: 'The talk explains why teamwork is important.',
  },
];

function en6ListeningDiscussions(_y: number, rng: Rng, count: number): Question[] {
  return fill(count, (i) => {
    const tk = rng.pick(TALKS);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en6-listening',
        prompt: `Listen to the talk:\n\n"${tk.t}"\n\nWhat is the talk mainly about?`,
        promptSub: 'Apakah isi utama ceramah ini?',
        answer: tk.main,
        distractors: tk.d,
        explanation: tk.why,
        emoji: '🎤',
        cols: 1,
        speak: `${tk.t} What is the talk mainly about?`,
      });
    }
    const others = TALKS.filter((x) => x.main !== tk.main);
    return match({
      prefix: 'en6-listening',
      prompt: 'Match each talk topic with its main idea.',
      promptSub: 'Padankan tajuk ceramah dengan idea utamanya.',
      pairs: [tk, ...rng.sample(others, 2)].map((x) => ({ left: x.t.split('.')[0], right: x.main })),
      explanation: 'The main idea is what the whole talk is about.',
      emoji: '🎤',
    });
  });
}

/* ------------------------------------------------------------------ */
/* Speaking (Tahun 2-6)                                                */
/* ------------------------------------------------------------------ */

function en2SpeakingTalking(_y: number, rng: Rng, count: number): Question[] {
  const prompts = [
    { q: 'How do you start when you talk about yourself?', a: 'My name is …', d: ['The end is …', 'Yesterday was …', 'It is raining …'], why: 'Start with your name, then add your age.' },
    { q: 'Your friend asks, "How old are you?" What do you say?', a: 'I am eight years old.', d: ['I am fine, thank you.', 'It is a blue bag.', 'My name is Siti.'], why: 'The question asks about age, so answer with your age.' },
    { q: 'How do you tell someone your favourite food?', a: 'I like fried rice.', d: ['I have two brothers.', 'I live in Melaka.', 'I am a pupil.'], why: 'Use "I like …" to talk about your favourite food.' },
    { q: 'Your friend asks, "Where do you live?" What do you say?', a: 'I live in Melaka.', d: ['I am eight years old.', 'I like to sing.', 'My father is a teacher.'], why: 'Use "I live in …" to say where you live.' },
    { q: 'How do you talk about your family?', a: 'I have one brother and one sister.', d: ['I like green.', 'I am in Year Two.', 'It is three ringgit.'], why: 'Use "I have …" to talk about your family.' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(prompts);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en2-speaking',
        prompt: it.q,
        promptSub: 'Pilih jawapan yang paling sesuai.',
        answer: it.a,
        distractors: it.d,
        explanation: it.why,
        emoji: '🗣️',
        cols: 1,
        speak: it.q,
      });
    }
    const others = prompts.filter((x) => x.a !== it.a);
    return match({
      prefix: 'en2-speaking',
      prompt: 'Match each question with the best answer.',
      promptSub: 'Padankan soalan dengan jawapan yang betul.',
      pairs: [it, ...rng.sample(others, 2)].map((x) => ({ left: x.q, right: x.a })),
      explanation: 'Each question has a suitable answer about yourself.',
      emoji: '🗣️',
    });
  });
}

function en3SpeakingDescribing(_y: number, rng: Rng, count: number): Question[] {
  const people = [
    { s: 'She has long black hair.', who: 'a girl with long hair', d: ['a boy with short hair', 'a bald man', 'a baby'], why: '"Long black hair" describes a girl with long hair.' },
    { s: 'He is tall and friendly.', who: 'a tall friendly boy', d: ['a short angry boy', 'a small baby', 'an old woman'], why: '"Tall and friendly" describes a tall, friendly boy.' },
    { s: 'My teacher wears glasses.', who: 'a teacher with glasses', d: ['a teacher without glasses', 'a doctor', 'a driver'], why: '"Wears glasses" tells us the teacher has glasses.' },
    { s: 'The old man walks slowly.', who: 'an old man', d: ['a young boy', 'a fast runner', 'a small girl'], why: '"Old man" tells us who is being described.' },
  ];
  const places = [
    { s: 'The library is quiet and clean.', which: 'a library', d: ['a market', 'a playground', 'a canteen'], why: '"Quiet and clean" suits a library.' },
    { s: 'The market is busy and noisy.', which: 'a market', d: ['a library', 'a bedroom', 'a clinic'], why: '"Busy and noisy" describes a market.' },
    { s: 'The beach is hot and sandy.', which: 'a beach', d: ['a classroom', 'a library', 'a hospital'], why: '"Hot and sandy" describes a beach.' },
  ];
  return fill(count, (i) => {
    if (i % 2 === 0) {
      const it = rng.pick(people);
      return mcq(rng, {
        prefix: 'en3-speaking',
        prompt: `Who does this describe?\n\n"${it.s}"`,
        promptSub: 'Siapa yang diterangkan?',
        answer: it.who,
        distractors: it.d,
        explanation: it.why,
        emoji: '🗣️',
        cols: 1,
        speak: it.s,
      });
    }
    const it = rng.pick(places);
    return mcq(rng, {
      prefix: 'en3-speaking',
      prompt: `Which place does this describe?\n\n"${it.s}"`,
      promptSub: 'Tempat mana yang diterangkan?',
      answer: it.which,
      distractors: it.d,
      explanation: it.why,
      emoji: '🏙️',
      cols: 2,
      speak: it.s,
    });
  });
}

function en4SpeakingConversations(_y: number, rng: Rng, count: number): Question[] {
  const scenes = [
    { q: 'You want to borrow a pen from your friend. What do you say?', a: 'May I borrow your pen, please?', d: ['Give me your pen.', 'I have a pen.', 'The pen is blue.'], why: '"May I … please?" is polite when asking for something.' },
    { q: 'You are looking for the toilet. What do you ask?', a: 'Excuse me, where is the toilet?', d: ['The toilet is clean.', 'I like toilets.', 'Toilets are blue.'], why: '"Excuse me, where is …?" is polite when asking for directions.' },
    { q: 'You want to buy a book. What do you ask the shopkeeper?', a: 'How much is this book?', d: ['This book is heavy.', 'I can read.', 'The book has pages.'], why: 'Ask "How much is this?" to find the price.' },
    { q: 'Your friend helps you. What do you say?', a: 'Thank you very much.', d: ['Give me that.', 'It is mine.', 'I do not know.'], why: 'Say "thank you" when someone helps you.' },
    { q: 'You want to join a conversation. What do you say?', a: 'Can I ask a question?', d: ['Be quiet, please.', 'I am leaving now.', 'That is wrong.'], why: 'Ask politely before joining a conversation.' },
    { q: 'You are late to class. What do you say to your teacher?', a: 'I am sorry I am late.', d: ['I am always late.', 'The bell is loud.', 'I like this class.'], why: 'Say sorry politely when you are late.' },
    { q: 'You want to know the way to the library. What do you ask?', a: 'Could you show me the way to the library?', d: ['The library is big.', 'I read books.', 'Books are heavy.'], why: '"Could you show me the way …?" asks for directions politely.' },
    { q: 'Your friend is sad. What do you say?', a: 'Are you all right? Can I help you?', d: ['Stop crying now.', 'It is not my problem.', 'You are always sad.'], why: 'Show care by asking if your friend is all right.' },
    { q: 'You want to leave the table during dinner. What do you say?', a: 'May I be excused, please?', d: ['I am leaving now.', 'Dinner is over.', 'I do not like this food.'], why: '"May I be excused, please?" is polite when leaving the table.' },
    { q: 'Someone gives you a gift. What do you say?', a: 'Thank you. That is very kind of you.', d: ['I do not want it.', 'Give me another one.', 'It is too small.'], why: 'Thank the giver and comment kindly.' },
    { q: 'You did not hear what your friend said. What do you say?', a: 'I am sorry, could you repeat that, please?', d: ['Speak properly.', 'I was not listening.', 'Say it again, now.'], why: 'Ask politely for a repeat when you did not hear.' },
    { q: 'You want to use the phone to call your parents. What do you ask?', a: 'May I use the phone to call my parents, please?', d: ['Give me the phone.', 'The phone is mine.', 'I like phones.'], why: 'Ask politely with "May I … please?" before using something.' },
    { q: 'You step on your friend\'s foot by accident. What do you say?', a: 'I am very sorry. Are you hurt?', d: ['Watch where you stand.', 'It was your fault.', 'Feet are strong.'], why: 'Say sorry and check if your friend is hurt.' },
    { q: 'You want your friend to wait for you. What do you say?', a: 'Could you wait for me, please?', d: ['Wait here.', 'Do not move.', 'I will be long.'], why: '"Could you … please?" is a polite request.' },
    { q: 'You want to ask your teacher a question in class. What do you do?', a: 'Raise your hand and wait to be called.', d: ['Shout the question out.', 'Walk to the front.', 'Ask your friend instead.'], why: 'Raise your hand and wait your turn politely.' },
    { q: 'You want to return a book you borrowed. What do you say?', a: 'Here is the book I borrowed. Thank you.', d: ['Keep the book.', 'I lost your book.', 'Books are boring.'], why: 'Return what you borrowed and thank the owner.' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(scenes);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en4-speaking',
        prompt: it.q,
        promptSub: 'Pilih ayat yang paling sopan.',
        answer: it.a,
        distractors: it.d,
        explanation: it.why,
        emoji: '💬',
        cols: 1,
        speak: it.q,
      });
    }
    const others = scenes.filter((x) => x.a !== it.a);
    return match({
      prefix: 'en4-speaking',
      prompt: 'Match each situation with the right thing to say.',
      promptSub: 'Padankan situasi dengan ayat yang sesuai.',
      pairs: [it, ...rng.sample(others, 2)].map((x) => ({ left: x.q, right: x.a })),
      explanation: 'Choose polite and suitable words for each situation.',
      emoji: '💬',
    });
  });
}

function en5SpeakingPresenting(_y: number, rng: Rng, count: number): Question[] {
  const items = [
    { q: 'You want to share your opinion. Which phrase is best?', a: 'In my opinion, …', d: ['Shut the door.', 'It is raining.', 'I am nine.'], why: '"In my opinion, …" introduces an opinion politely.' },
    { q: 'You agree with your friend. What do you say?', a: 'I agree with you because …', d: ['You are wrong.', 'I do not care.', 'Stop talking.'], why: 'Give your reason when you agree: "I agree with you because …".' },
    { q: 'You disagree politely. What do you say?', a: 'I see your point, but …', d: ['That is silly.', 'You are always wrong.', 'I will not listen.'], why: '"I see your point, but …" disagrees politely.' },
    { q: 'How do you begin a presentation?', a: 'Greet your audience and say your topic.', d: ['Say goodbye and leave.', 'Read the whole essay.', 'Ask for money.'], why: 'Start by greeting the audience and stating your topic.' },
    { q: 'How do you end a presentation?', a: 'Thank your audience.', d: ['Walk away quietly.', 'Start again.', 'Close your book.'], why: 'End politely by thanking your audience.' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(items);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en5-speaking',
        prompt: it.q,
        promptSub: 'Pilih cara yang paling sopan dan sesuai.',
        answer: it.a,
        distractors: it.d,
        explanation: it.why,
        emoji: '🎤',
        cols: 1,
        speak: it.q,
      });
    }
    const others = items.filter((x) => x.a !== it.a);
    return match({
      prefix: 'en5-speaking',
      prompt: 'Match each speaking purpose with the right phrase.',
      promptSub: 'Padankan tujuan bertutur dengan frasa yang betul.',
      pairs: [it, ...rng.sample(others, 2)].map((x) => ({ left: x.q, right: x.a })),
      explanation: 'Each purpose has a suitable polite phrase.',
      emoji: '🎤',
    });
  });
}

function en6SpeakingInterviews(_y: number, rng: Rng, count: number): Question[] {
  const qs = [
    { q: 'You want to know why your friend likes a hobby. Which question is best?', a: 'Why do you like this hobby?', d: ['Do you like it?', 'Is it a hobby?', 'Hobbies exist.'], why: '"Why …?" asks for a reason, which gives a fuller answer.' },
    { q: 'You want to know how long your friend has done something. Which question is best?', a: 'How long have you been doing it?', d: ['Do you do it?', 'Is it long?', 'What is it?'], why: '"How long …?" asks about duration.' },
    { q: 'You want to add an idea in a discussion. What do you say?', a: 'May I add something?', d: ['Be quiet.', 'I am bored.', 'That is enough.'], why: '"May I add something?" asks politely to contribute.' },
    { q: 'A friend has a different view. What do you say?', a: 'I have a different view because …', d: ['You are wrong.', 'I will not listen.', 'Stop it now.'], why: 'State your different view politely with a reason.' },
    { q: 'What should you do while someone is speaking?', a: 'Listen carefully and wait for your turn.', d: ['Talk over them.', 'Look away.', 'Leave the room.'], why: 'Good discussion needs careful listening and taking turns.' },
  ];
  return fill(count, (i) => {
    const it = rng.pick(qs);
    if (i % 2 === 0) {
      return mcq(rng, {
        prefix: 'en6-speaking',
        prompt: it.q,
        promptSub: 'Pilih pilihan yang paling sesuai.',
        answer: it.a,
        distractors: it.d,
        explanation: it.why,
        emoji: '🎙️',
        cols: 1,
        speak: it.q,
      });
    }
    const others = qs.filter((x) => x.a !== it.a);
    return match({
      prefix: 'en6-speaking',
      prompt: 'Match each discussion goal with the best response.',
      promptSub: 'Padankan tujuan perbincangan dengan jawapan terbaik.',
      pairs: [it, ...rng.sample(others, 2)].map((x) => ({ left: x.q, right: x.a })),
      explanation: 'Choose a response that fits the discussion goal.',
      emoji: '🎙️',
    });
  });
}

export const ENGLISH_GENERATORS: Record<string, (y: number, r: Rng, c: number) => Question[]> = {
  'en1-phonics': en1Phonics,
  'en1-greetings': en1Greetings,
  'en1-colours-numbers': en1ColoursNumbers,
  'en1-listening-sounds': en1ListeningSounds,
  'en2-simple-sentences': en2SimpleSentences,
  'en2-vocabulary': en2Vocabulary,
  'en2-language-arts': en2LanguageArts,
  'en2-punctuation': en2Punctuation,
  'en2-listening-instructions': en2ListeningInstructions,
  'en2-speaking-talking': en2SpeakingTalking,
  'en3-grammar-basics': en3GrammarBasics,
  'en3-reading': en3Reading,
  'en3-writing': en3Writing,
  'en3-listening-stories': en3ListeningStories,
  'en3-speaking-describing': en3SpeakingDescribing,
  'en4-grammar': en4Grammar,
  'en4-vocabulary': en4Vocabulary,
  'en4-reading': en4ReadingComprehension,
  'en4-writing': en4Writing,
  'en4-listening-announcements': en4ListeningAnnouncements,
  'en4-speaking-conversations': en4SpeakingConversations,
  'en5-grammar-advanced': en5GrammarAdvanced,
  'en5-reading-advanced': en5ReadingAdvanced,
  'en5-writing-purposes': en5WritingPurposes,
  'en5-language-arts': en5LanguageArts,
  'en5-listening-reports': en5ListeningReports,
  'en5-speaking-presenting': en5SpeakingPresenting,
  'en6-grammar-mastery': en6GrammarMastery,
  'en6-writing-composition': en6WritingComposition,
  'en6-listening-language-arts': en6ListeningLanguageArts,
  'en6-listening-discussions': en6ListeningDiscussions,
  'en6-speaking-interviews': en6SpeakingInterviews,
};
