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
    const word = rng.pick(['happy', 'quick', 'careful', 'loud', 'bright']);
    const adv = word === 'happy' ? 'happily' : word === 'quick' ? 'quickly' : word === 'careful' ? 'carefully' : word === 'loud' ? 'loudly' : 'brightly';
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
  ];
  return fill(count, (i) => {
    if (i % 3 === 0) {
      const picked = rng.sample(sets, 3);
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

export const ENGLISH_GENERATORS: Record<string, (y: number, r: Rng, c: number) => Question[]> = {
  'en1-phonics': en1Phonics,
  'en1-greetings': en1Greetings,
  'en1-colours-numbers': en1ColoursNumbers,
  'en2-simple-sentences': en2SimpleSentences,
  'en2-vocabulary': en2Vocabulary,
  'en2-language-arts': en2LanguageArts,
  'en2-punctuation': en2Punctuation,
  'en3-grammar-basics': en3GrammarBasics,
  'en3-reading': en3Reading,
  'en3-writing': en3Writing,
  'en4-grammar': en4Grammar,
  'en4-vocabulary': en4Vocabulary,
  'en4-reading': en4ReadingComprehension,
  'en4-writing': en4Writing,
  'en5-grammar-advanced': en5GrammarAdvanced,
  'en5-reading-advanced': en5ReadingAdvanced,
  'en5-writing-purposes': en5WritingPurposes,
  'en5-language-arts': en5LanguageArts,
  'en6-grammar-mastery': en6GrammarMastery,
  'en6-writing-composition': en6WritingComposition,
  'en6-listening-language-arts': en6ListeningLanguageArts,
};
