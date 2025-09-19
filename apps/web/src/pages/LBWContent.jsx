import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Video, FileText, Headphones, Download,
  Clock, Star, TrendingUp, Filter, Search, Play, Lock
} from 'lucide-react';

const LBWContent = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Content', icon: '📚' },
    { id: 'articles', name: 'Articles', icon: '📄' },
    { id: 'videos', name: 'Videos', icon: '🎥' },
    { id: 'podcasts', name: 'Podcasts', icon: '🎧' },
    { id: 'exercises', name: 'Exercises', icon: '🧠' },
    { id: 'research', name: 'Research', icon: '🔬' }
  ];

  const contentItems = [
    {
      id: 1,
      type: 'article',
      title: 'Understanding ADHD: A Comprehensive Guide',
      author: 'Dr. Sarah Chen',
      duration: '10 min read',
      category: 'ADHD',
      rating: 4.8,
      views: 1250,
      premium: false,
      thumbnail: '📖',
      description: 'Learn about ADHD symptoms, diagnosis, and management strategies'
    },
    {
      id: 2,
      type: 'video',
      title: 'Mindfulness Meditation for Brain Health',
      author: 'Michael Rodriguez',
      duration: '15 min',
      category: 'Mindfulness',
      rating: 4.9,
      views: 3420,
      premium: false,
      thumbnail: '🎥',
      description: 'Guided meditation session for improving focus and reducing stress'
    },
    {
      id: 3,
      type: 'podcast',
      title: 'The Science of Memory Enhancement',
      author: 'Dr. Lisa Thompson',
      duration: '45 min',
      category: 'Memory',
      rating: 4.7,
      views: 890,
      premium: true,
      thumbnail: '🎙️',
      description: 'Expert insights on improving memory and cognitive function'
    },
    {
      id: 4,
      type: 'exercise',
      title: 'Brain Training: Focus Exercises',
      author: 'Neuro Team',
      duration: '20 min',
      category: 'Training',
      rating: 4.6,
      views: 2100,
      premium: false,
      thumbnail: '🧩',
      description: 'Interactive exercises to improve concentration and attention'
    },
    {
      id: 5,
      type: 'research',
      title: 'Neurofeedback: Latest Research Findings',
      author: 'Dr. James Wilson',
      duration: '25 min read',
      category: 'Research',
      rating: 4.9,
      views: 450,
      premium: true,
      thumbnail: '📊',
      description: 'Recent studies on neurofeedback effectiveness and applications'
    },
    {
      id: 6,
      type: 'article',
      title: 'Nutrition for Brain Health',
      author: 'Emma Martinez',
      duration: '8 min read',
      category: 'Wellness',
      rating: 4.5,
      views: 1780,
      premium: false,
      thumbnail: '🥗',
      description: 'Foods and supplements that support optimal brain function'
    }
  ];

  const collections = [
    {
      title: 'Beginner\'s Brain Wellness Journey',
      items: 5,
      duration: '2 hours',
      color: 'from-blue-500 to-purple-600',
      icon: '🚀'
    },
    {
      title: 'Advanced Neurofeedback Techniques',
      items: 8,
      duration: '4 hours',
      color: 'from-purple-500 to-pink-600',
      icon: '⚡'
    },
    {
      title: 'Stress & Anxiety Management',
      items: 6,
      duration: '3 hours',
      color: 'from-green-500 to-teal-600',
      icon: '🧘'
    },
    {
      title: 'Peak Performance Training',
      items: 10,
      duration: '5 hours',
      color: 'from-orange-500 to-red-600',
      icon: '🏆'
    }
  ];

  const filteredContent = contentItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory.slice(0, -1);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch(type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'podcast': return <Headphones className="h-4 w-4" />;
      case 'exercise': return <TrendingUp className="h-4 w-4" />;
      case 'research': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Header with Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/lbw')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-cyan-600" />
                <span className="text-xl font-bold text-gray-900">Educational Content</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/lbw/dashboard')}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Brain Wellness Library</h1>
            <p className="text-lg text-gray-600">Explore articles, videos, and resources for optimal brain health</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex gap-2">
                {categories.slice(0, 5).map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{category.icon}</span>
                    <span className="hidden md:inline">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Collections */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Collections</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {collections.map((collection, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => alert(`Opening ${collection.title} collection`)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${collection.color} rounded-xl opacity-90`}></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="text-3xl mb-3">{collection.icon}</div>
                    <h3 className="font-bold text-white mb-2">{collection.title}</h3>
                    <div className="flex items-center gap-3 text-white/90 text-sm">
                      <span>{collection.items} items</span>
                      <span>•</span>
                      <span>{collection.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Content</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>Showing {filteredContent.length} items</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                      <span className="text-6xl">{item.thumbnail}</span>
                      {item.premium && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Premium
                        </div>
                      )}
                      {item.type === 'video' && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs font-medium flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">by {item.author}</span>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{item.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">{item.views.toLocaleString()} views</span>
                      </div>
                      <button className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
                        {item.premium ? 'Unlock' : 'View'} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Load More */}
          <div className="text-center">
            <button className="px-8 py-3 bg-white text-cyan-600 border-2 border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors font-medium">
              Load More Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LBWContent;