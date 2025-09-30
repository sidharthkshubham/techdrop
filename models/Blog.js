const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  excerpt: {
    type: String,
    required: [true, 'Please add an excerpt'],
    maxlength: [200, 'Excerpt cannot be more than 200 characters']
  },
  coverImage: {
    type: String,
    default: '/placeholder.svg'
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Technology',
      'Programming',
      'Web Development',
      'Design',
      'Business',
      'AI',
      'Backend',
      'Frontend',
      'DevOps',
      'Career',
      'Other'
    ]
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Scheduled'],
    default: 'Draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  views: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: [100, 'Meta title cannot be more than 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot be more than 160 characters']
    },
    keywords: {
      type: String,
      maxlength: [200, 'Keywords cannot be more than 200 characters']
    },
    ogImage: {
      type: String
    },
    twitterCard: {
      type: String,
      enum: ['summary', 'summary_large_image', 'app', 'player'],
      default: 'summary_large_image'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug from title before saving
BlogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Calculate read time based on content length
BlogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
    this.readTime = `${readingTime} min read`;
  }
  next();
});

module.exports = mongoose.model('Blog', BlogSchema); 