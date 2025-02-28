- name: Process issue content
  if: github.event_name == 'issues'
  run: |
    # Create issue data file
    echo '${{ toJSON(github.event.issue) }}' > issue_data.json
    cat issue_data.json  # Debug: Print the issue data
    
    # Create processing script
    cat > process-issue.js << 'EOF'
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
    console.log(`Labels: ${JSON.stringify(labels.map(l => l.name))}`);

    // Determine content type from title or labels
    let contentType = 'art'; // Default to art

    // Check title and labels for each content type
    if (title.toLowerCase().includes('[photo]') || labels.some(l => l.name && l.name.toLowerCase() === 'photo')) {
      contentType = 'photos';
    } else if (title.toLowerCase().includes('[journal]') || labels.some(l => l.name && l.name.toLowerCase() === 'journal')) {
      contentType = 'journal';
    } else if (title.toLowerCase().includes('[cat]') || labels.some(l => l.name && l.name.toLowerCase() === 'cat')) {
      contentType = 'cat';
    } else if (title.toLowerCase().includes('[video]') || labels.some(l => l.name && l.name.toLowerCase() === 'video')) {
      contentType = 'videos';
    }

    console.log(`Content type determined: ${contentType}`);

    // Rest of your script...
    EOF
    
    # Rest of your workflow...
