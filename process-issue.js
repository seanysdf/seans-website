const fs = require('fs');

// Read the issue data
const issueData = JSON.parse(fs.readFileSync('issue_data.json', 'utf8'));

// Get basic info
const title = issueData.title || '';
const body = issueData.body || '';
const createdAt = issueData.created_at;
const labels = issueData.labels || [];

// Debug info
console.log(`Processing issue: ${title}`);
console.log(`Labels: ${JSON.stringify(labels.map(l => l.name || 'unlabeled'))}`);

// Determine content type from title or labels
let contentType = 'art'; // Default to art

// Check title and labels for each content type - using else-if to prevent multiple matches
if (title.toLowerCase().includes('[photo]') || labels.some(l => l.name && l.name.toLowerCase() === 'photo')) {
  contentType = 'photos';
  console.log('Detected content type: photos');
} else if (title.toLowerCase().includes('[journal]') || labels.some(l => l.name && l.name.toLowerCase() === 'journal')) {
  contentType = 'journal';
  console.log('Detected content type: journal');
} else if (title.toLowerCase().includes('[cat]') || labels.some(l => l.name && l.name.toLowerCase() === 'cat')) {
  contentType = 'cat';
  console.log('Detected content type: cat');
} else if (title.toLowerCase().includes('[video]') || labels.some(l => l.name && l.name.toLowerCase() === 'video')) {
  contentType = 'videos';
  console.log('Detected content type: videos');
} else {
  console.log('Defaulting to content type: art');
}

console.log(`Content type determined: ${contentType}`);

// Format date
const date = new Date(createdAt);
const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth()+1).toString().padStart(2, '0')}.${date.getFullYear()}`;

// Create ID from title
const cleanTitle = title.replace(/\[[^\]]+\]/g, '').trim();
const id = cleanTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

// Extract fields from body
function extractField(body, fieldName) {
  const regex = new RegExp(`### ${fieldName}\\s+([^#]*?)(?=###|$)`, 's');
  const match = body.match(regex);
  return match ? match[1].trim() : '';
}

const description = extractField(body, 'Description');
const content = extractField(body, 'Content');
const image = extractField(body, 'Image URL \\(optional\\)');
const videoUrl = extractField(body, 'Video URL \\(optional\\)');

// Process video URL for embedding
function processVideoUrl(url) {
  if (!url) return '';
  
  // Handle local repository paths
  if (url.startsWith('/')) {
    return `<video controls width="100%"><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video>`;
  }
  
  // YouTube
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1].split('&')[0];
    return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
  }
  
  // YouTube short URL
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0];
    return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
  }
  
  // Vimeo
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1].split('?')[0];
    return `<iframe src="https://player.vimeo.com/video/${videoId}" width="100%" height="315" frameborder="0" allowfullscreen></iframe>`;
  }
  
  // Default: assume direct link to video file
  return `<video controls width="100%"><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video>`;
}

// Create the new item
const newItem = {
  id: id,
  title: cleanTitle,
  date: formattedDate,
  description: description || null,
  content: content,
  image: image || null,
  video: videoUrl || null,
  url: `content/${contentType}/${id}.html`
};

// Read existing data
const dataPath = `data/${contentType}.json`;
let data = { items: [] };

if (fs.existsSync(dataPath)) {
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    console.log(`Error reading ${dataPath}. Creating new file.`);
  }
}

// Add new item (or update existing one with same ID)
const existingIndex = data.items.findIndex(item => item.id === id);
if (existingIndex >= 0) {
  data.items[existingIndex] = newItem;
} else {
  data.items.unshift(newItem); // Add to beginning (newest first)
}

// Write updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Updated ${dataPath} with entry: ${cleanTitle}`);

// Create HTML file
const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${cleanTitle} | ART ARCHIVE</title>
    <link rel="stylesheet" href="../../css/style.css">
    <style>
        /* Additional styles specific to content pages */
        .content {
            line-height: 1.6;
            margin-top: 20px;
        }
        
        .image {
            margin: 20px 0;
        }
        
        .video-container {
            margin: 20px 0;
            position: relative;
            padding-bottom: 56.25%; /* 16:9 aspect ratio */
            height: 0;
            overflow: hidden;
        }
        
        .video-container iframe,
        .video-container video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <h1>${cleanTitle}</h1>
    <div class="date">${formattedDate}</div>
    ${description ? `<div class="description">${description}</div>` : ''}
    
    ${image ? `<div class="image"><img src="${image}" alt="${cleanTitle}" style="max-width:100%;"></div>` : ''}
    
    ${videoUrl ? `<div class="video-container">${processVideoUrl(videoUrl)}</div>` : ''}
    
    <div class="content">
        ${content.replace(/\n/g, '<br>')}
    </div>
    <div class="footer">
        <a href="/">← back to archive</a>
    </div>
</body>
</html>`;

fs.writeFileSync(`content/${contentType}/${id}.html`, htmlContent);
console.log(`Created/updated entry: ${cleanTitle} (content/${contentType}/${id}.html)`);
