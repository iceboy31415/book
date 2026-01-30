const { dbHelpers } = require('./database');

const sampleBooks = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Tiny changes, remarkable results.',
    category: 'Self-Help',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/I/51Tlm0GZTXL.jpg',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    description: 'A groundbreaking tour of the mind that explains the two systems that drive the way we think.',
    category: 'Psychology',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/I/41wI53OEpWL.jpg',
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    description: 'A Brief History of Humankind - From the evolution of archaic human species to the present day.',
    category: 'History',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/I/41eUYvGPakL.jpg',
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    description: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses.',
    category: 'Business',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/I/51Zymoq7UnL.jpg',
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    description: 'Rules for Focused Success in a Distracted World. Professional activities performed in a state of distraction-free concentration.',
    category: 'Productivity',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/I/41gLi5f3Q5L.jpg',
  },
];

const sampleChapters = {
  'Atomic Habits': [
    {
      chapterNumber: 1,
      title: 'The Surprising Power of Atomic Habits',
      summary: 'Small changes can have remarkable results. When you improve by just 1% each day, those gains compound over time. The aggregation of marginal gains leads to significant improvements. Conversely, small negative habits compound into toxic results. Success is the product of daily habits, not once-in-a-lifetime transformations.',
      readTimeMinutes: 5,
    },
    {
      chapterNumber: 2,
      title: 'How Your Habits Shape Your Identity',
      summary: 'There are three levels of change: outcome, process, and identity. The most effective way to change your habits is to focus on who you wish to become, not what you want to achieve. Your identity emerges from your habits. Every action is a vote for the type of person you wish to become.',
      readTimeMinutes: 6,
    },
    {
      chapterNumber: 3,
      title: 'The Four Laws of Behavior Change',
      summary: 'The process of building a habit can be divided into four steps: cue, craving, response, and reward. The Four Laws of Behavior Change: (1) Make it obvious, (2) Make it attractive, (3) Make it easy, (4) Make it satisfying. These laws can be inverted to break bad habits.',
      readTimeMinutes: 5,
    },
  ],
  'Thinking, Fast and Slow': [
    {
      chapterNumber: 1,
      title: 'The Two Systems',
      summary: 'System 1 operates automatically and quickly, with little effort and no sense of voluntary control. System 2 allocates attention to effortful mental activities. System 1 generates impressions and feelings; System 2 turns these into beliefs and voluntary actions.',
      readTimeMinutes: 6,
    },
    {
      chapterNumber: 2,
      title: 'Attention and Effort',
      summary: 'System 2 has limited capacity. Mental effort is required when focusing attention, especially when it must be sustained. The load on System 2 can be measured by pupil dilation. Cognitive effort affects behavior - people are less willing to exert self-control when System 2 is busy.',
      readTimeMinutes: 5,
    },
  ],
  'Sapiens': [
    {
      chapterNumber: 1,
      title: 'The Cognitive Revolution',
      summary: 'About 70,000 years ago, Homo sapiens developed unique cognitive abilities through the Cognitive Revolution. This gave humans the ability to think about things that don\'t exist - fiction, myths, gods, and nations. This ability to create shared myths enabled unprecedented cooperation among large numbers of strangers.',
      readTimeMinutes: 7,
    },
    {
      chapterNumber: 2,
      title: 'The Agricultural Revolution',
      summary: 'The Agricultural Revolution, starting around 10,000 BCE, was humanity\'s biggest fraud. While it increased the total amount of food available, it didn\'t improve individual lives. Farmers worked harder than foragers and had worse diets. The revolution created hierarchies and enabled population growth.',
      readTimeMinutes: 6,
    },
  ],
  'The Lean Startup': [
    {
      chapterNumber: 1,
      title: 'Build-Measure-Learn',
      summary: 'The fundamental activity of a startup is to turn ideas into products, measure customer responses, and learn whether to pivot or persevere. This Build-Measure-Learn feedback loop is at the core of the Lean Startup model. The goal is to minimize the total time through this loop.',
      readTimeMinutes: 5,
    },
    {
      chapterNumber: 2,
      title: 'Minimum Viable Product',
      summary: 'The MVP is the version of a new product that allows a team to collect maximum validated learning with minimum effort. It\'s not about building less; it\'s about learning faster. The MVP helps entrepreneurs test fundamental business hypotheses and begin the learning process as quickly as possible.',
      readTimeMinutes: 6,
    },
  ],
  'Deep Work': [
    {
      chapterNumber: 1,
      title: 'Deep Work is Valuable',
      summary: 'Deep work is the ability to focus without distraction on cognitively demanding tasks. In our economy, three groups will thrive: those who work well with intelligent machines, those who are the best at what they do, and those with access to capital. To join the first two groups, you must master deep work.',
      readTimeMinutes: 6,
    },
    {
      chapterNumber: 2,
      title: 'Deep Work is Rare',
      summary: 'Despite its value, deep work is becoming increasingly rare. Modern business culture has embraced behaviors that actively prevent deep work: open offices, instant messaging, social media. The metric black hole of knowledge work makes it difficult to prove the value of depth, leading to shallow alternatives.',
      readTimeMinutes: 5,
    },
  ],
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    for (const bookData of sampleBooks) {
      console.log(`📚 Adding book: ${bookData.title}`);
      
      const result = await dbHelpers.run(
        'INSERT INTO books (title, author, description, category, coverImage) VALUES (?, ?, ?, ?, ?)',
        [bookData.title, bookData.author, bookData.description, bookData.category, bookData.coverImage]
      );

      const bookId = result.id;
      const chapters = sampleChapters[bookData.title] || [];

      for (const chapter of chapters) {
        await dbHelpers.run(
          'INSERT INTO chapters (bookId, chapterNumber, title, summary, readTimeMinutes) VALUES (?, ?, ?, ?, ?)',
          [bookId, chapter.chapterNumber, chapter.title, chapter.summary, chapter.readTimeMinutes]
        );
        console.log(`   ✓ Added chapter ${chapter.chapterNumber}: ${chapter.title}`);
      }

      await dbHelpers.run(
        'UPDATE books SET totalChapters = ? WHERE id = ?',
        [chapters.length, bookId]
      );

      console.log(`   ✓ Book added with ${chapters.length} chapters\n`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Added ${sampleBooks.length} books with chapters`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
