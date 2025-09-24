const Blog = require('../models/Blog');
const User = require('../models/User');

// Get dashboard overview stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total pageviews (dummy data for now)
    const totalPageViews = 45231;
    
    // Get average time on page (dummy data for now)
    const avgTimeOnPage = 3.2;
    
    // Get bounce rate (dummy data for now)
    const bounceRate = 42.3;
    
    // Get conversion rate (dummy data for now)
    const conversionRate = 3.8;
    
    // Get blogs count
    const blogsCount = await Blog.countDocuments();
    
    // Get users count
    const usersCount = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        pageViews: {
          total: totalPageViews,
          change: 12.5,
        },
        timeOnPage: {
          average: avgTimeOnPage,
          change: 0.5,
        },
        bounceRate: {
          rate: bounceRate,
          change: 2.1,
        },
        conversionRate: {
          rate: conversionRate,
          change: 0.7,
        },
        blogsCount,
        usersCount,
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching dashboard stats'
    });
  }
};

// Get audience analytics
exports.getAudienceAnalytics = async (req, res) => {
  try {
    // Dummy data for now
    const deviceData = {
      labels: ["Desktop", "Mobile", "Tablet"],
      datasets: [
        {
          label: "Device Usage",
          data: [55, 40, 5],
        },
      ],
    };
    
    const trafficSourcesData = {
      labels: ["Organic Search", "Direct", "Social Media", "Referral", "Email"],
      datasets: [
        {
          label: "Traffic Sources",
          data: [45, 25, 15, 10, 5],
        },
      ],
    };
    
    const geoData = {
      labels: ["United States", "India", "United Kingdom", "Germany", "Canada", "Others"],
      datasets: [
        {
          label: "Geographic Distribution",
          data: [35, 20, 15, 10, 8, 12],
        },
      ],
    };
    
    res.status(200).json({
      success: true,
      data: {
        deviceData,
        trafficSourcesData,
        geoData,
      }
    });
  } catch (error) {
    console.error('Error fetching audience analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching audience analytics'
    });
  }
};

// Get content analytics
exports.getContentAnalytics = async (req, res) => {
  try {
    // Get top performing posts from the database
    const topPosts = await Blog.find({ status: 'Published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title views')
      .lean();
      
    // Add dummy engagement and conversion data
    const topPerformingPosts = topPosts.map(post => ({
      title: post.title,
      views: post.views || Math.floor(Math.random() * 3000) + 1000,
      engagement: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      conversionRate: `${(Math.random() * 5 + 1).toFixed(1)}%`,
    }));
    
    // Dummy data for charts
    const categoryPerformance = {
      labels: ["Technology", "Programming", "Design", "Business", "Marketing"],
      datasets: [
        {
          label: "Average Views",
          data: [2100, 1800, 1500, 1200, 900],
        },
        {
          label: "Average Engagement",
          data: [75, 60, 80, 40, 55],
        },
      ],
    };
    
    res.status(200).json({
      success: true,
      data: {
        topPerformingPosts,
        categoryPerformance,
      }
    });
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching content analytics'
    });
  }
};

// Get time-based analytics (page views over time)
exports.getTimeAnalytics = async (req, res) => {
  try {
    // Dummy data for now
    const pageViewsData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Page Views",
          data: [1000, 1500, 2100, 1800, 2500, 3000],
        },
      ],
    };
    
    const engagementData = {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Avg. Time on Page",
          data: [2.5, 3.2, 2.8, 4.1, 3.8, 2.9, 3.5],
        },
      ],
    };
    
    res.status(200).json({
      success: true,
      data: {
        pageViewsData,
        engagementData,
      }
    });
  } catch (error) {
    console.error('Error fetching time analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while fetching time analytics'
    });
  }
}; 