import { supabase } from './supabase';

const samplePosts = [
  {
    title: "The Future of Web Development: What's Coming in 2025",
    summary: "Explore the upcoming trends in web development, from AI-powered development tools to WebAssembly becoming mainstream. Learn how edge computing and serverless architectures are reshaping how we build and deploy web applications.",
    url: "https://medium.com/example/future-web-dev-2025",
    image_url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1600&q=80"
  },
  {
    title: "Understanding System Design: A Practical Guide",
    summary: "A comprehensive guide to system design fundamentals. Dive deep into scalability, load balancing, caching strategies, and database choices. Perfect for developers preparing for senior-level interviews or building large-scale applications.",
    url: "https://medium.com/example/system-design-guide",
    image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80"
  },
  {
    title: "Machine Learning in JavaScript: A Beginner's Journey",
    summary: "Discover how to implement basic machine learning algorithms using JavaScript. This hands-on guide covers linear regression, k-means clustering, and neural networks, all implemented in vanilla JavaScript with clear explanations.",
    url: "https://medium.com/example/ml-javascript",
    image_url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1600&q=80"
  },
  {
    title: "The Art of Code Review: Best Practices",
    summary: "Learn how to conduct effective code reviews that improve code quality without creating team friction. Covers automated checks, review etiquette, and how to give constructive feedback that helps your team grow.",
    url: "https://medium.com/example/code-review-guide",
    image_url: "https://images.unsplash.com/photo-1552308995-2baac1ad5490?w=1600&q=80"
  },
  {
    title: "Building Microservices with Node.js",
    summary: "A practical guide to building and deploying microservices using Node.js. Learn about service discovery, API gateways, message queues, and how to handle distributed logging and monitoring in a microservices architecture.",
    url: "https://medium.com/example/nodejs-microservices",
    image_url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1600&q=80"
  }
];

async function seedPosts() {
  const { error } = await supabase
    .from('blog_posts')
    .insert(samplePosts);

  if (error) {
    console.error('Error seeding posts:', error);
    return;
  }
  
  console.log('Successfully seeded sample posts!');
}

seedPosts();