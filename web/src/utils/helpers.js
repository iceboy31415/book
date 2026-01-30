// Helper functions

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const calculateProgress = (chaptersRead, totalChapters) => {
  if (!totalChapters || totalChapters === 0) return 0;
  return Math.round((chaptersRead.length / totalChapters) * 100);
};

export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const getCategoryColor = (category) => {
  const colors = {
    'Self-Help': '#FF6B6B',
    'Business': '#4ECDC4',
    'Psychology': '#95E1D3',
    'Science': '#F38181',
    'History': '#AA96DA',
    'Technology': '#FCBAD3',
    'Philosophy': '#A8D8EA',
    'Health': '#FFAAA6',
  };
  return colors[category] || '#00D9B6';
};

export default {
  formatDate,
  formatTime,
  calculateProgress,
  truncateText,
  isValidUrl,
  getCategoryColor,
};
