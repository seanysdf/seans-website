const fs = require('fs');

// Read the issue data
const issueData = JSON.parse(fs.readFileSync('issue_data.json', 'utf8'));

// Extract important information
const issueTitle = issueData.title;
const issueBody = issueData.body;
const issueLabels = issueData.labels.map(label => label.name);
const issueCreatedAt = issueData.created_at;

// Determine content type from labels
const contentType = issueLabels.find(label => 
  ['art', 'photos', 'journal', 'cat'].includes(label)
);

if (!contentType) {
  console.log('No valid content type label found. Skipping processing.');
  process.exit(0);
}

// Parse the form data from the issue body
function extractField(body, fieldName) {
  const regex = new RegExp(`### ${fieldName}\\s+([^#]*?)(?=###|$)`, 's');
  const match = body.match(regex);
  return match ? match[1].trim() : '';
}

const title = extractField(issueBody, 'Title');
const description = extractField(issueBody, 'Description');
const content = extractField(issueBody, 'Content');
const image = extractField(issueBody, 'Image URL \\(optional\\)');

// Create a URL-friendly ID from the title
const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

// Format the date as DD.MM.YYYY
const date = new Date(issueCreatedAt);
const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth()+1).toString().padStart(2, '0')}.${date.getFullYear()}`;

// Create the new content item
const newItem = {
  id: id,
  title: title,
  date: formattedDate,
  description: description || null,
  content: content,
  image: image || null,
  url: `${contentType}/${id}.html`
};

// Read existing data file or create a new one
const dataPath = `data/${contentType}.json`;
let data = { items: [] };

if (fs.existsSync(dataPath)) {
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    console.log(`Error reading ${dataPath}. Creating new file.`);
  }
}

// Add new item to the data
data.items.unshift(newItem);  // Add to beginning of array (newest first)

// Write updated data back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`Added new ${contentType} item: ${title}`);

// Also create an individual HTML file for this item
const htmlDir = `${contentType}`;
if (!fs.existsSync(htmlDir)) {
  fs.mkdirSync(htmlDir, { recursive: true });
}

const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${title} | ART ARCHIVE</title>
    <style>
        body {
            background-color: #f8f8f8;
            font-family: "Lucida Console", Monaco, monospace;
            margin: 0;
            padding: 20px;
            color: #222222;
            max-width: 800px;
            margin: 0 auto;
        }
        
        h1 {
            font-size: 20px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .date {
            color: #666;
            font-size: 12px;
            margin-bottom: 20px;
        }
        
        .description {
            color: #444;
            font-style: italic;
            margin-bottom: 20px;
        }
        
        .content {
            line-height: 1.6;
        }
        
        .footer {
            margin-top: 30px;
            font-size: 11px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        
        a {
            color: #000;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="date">${formattedDate}</div>
    ${description ? `<div class="description">${description}</div>` : ''}
    ${image ? `<div class="image"><img src="${image}" alt="${title}" style="max-width:100%;"></div>` : ''}
    <div class="content">
        ${content.replace(/\n/g, '<br>')}
    </div>
    <div class="footer">
        <a href="/">← back to archive</a>
    </div>
</body>
</html>`;

fs.writeFileSync(`${htmlDir}/${id}.html`, htmlContent);
console.log(`Created HTML file: ${htmlDir}/${id}.html`);
