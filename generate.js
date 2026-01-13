const fs = require('fs').promises;
const path = require('path');

const talksFilePath = path.join(__dirname, 'data', 'talks.json');
const cssFilePath = path.join(__dirname, 'src', 'styles.css');
const jsFilePath = path.join(__dirname, 'src', 'script.js');
const outputFilePath = path.join(__dirname, 'dist', 'index.html');

async function generateWebsite() {
  try {
    // Read data and asset files
    const talksData = JSON.parse(await fs.readFile(talksFilePath, 'utf8'));
    const styles = await fs.readFile(cssFilePath, 'utf8');
    const script = await fs.readFile(jsFilePath, 'utf8');

    // --- Schedule Logic ---
    let scheduleHtml = '';
    const startTime = new Date();
    startTime.setHours(10, 0, 0, 0); // 10:00 AM

    const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    for (let i = 0; i < talksData.length; i++) {
      if (i === 3) { // After the 3rd talk, add a lunch break
        const lunchStartTime = new Date(startTime.getTime());
        const lunchEndTime = new Date(lunchStartTime.getTime() + 60 * 60 * 1000);
        scheduleHtml += `
          <li class="break">
            <div class="talk-time">${formatTime(lunchStartTime)} - ${formatTime(lunchEndTime)}</div>
            <div class="talk-details">Lunch Break</div>
          </li>`;
        startTime.setTime(lunchEndTime.getTime()); // Next event starts after lunch
      }

      const talk = talksData[i];
      const talkStartTime = new Date(startTime.getTime());
      const talkEndTime = new Date(talkStartTime.getTime() + 60 * 60 * 1000); // 1 hour duration

      const categories = talk.categories.join(', ');
      scheduleHtml += `
        <li class="talk" data-categories="${categories}">
          <div class="talk-time">${formatTime(talkStartTime)} - ${formatTime(talkEndTime)}</div>
          <div class="talk-details">
            <h2 class="talk-title">${talk.title}</h2>
            <p class="talk-speakers">By: ${talk.speakers.join(', ')}</p>
            <p class="talk-description">${talk.description}</p>
            <div class="talk-categories">
              ${talk.categories.map(cat => `<span class="talk-category">${cat}</span>`).join('')}
            </div>
          </div>
        </li>`;

      // Add 10-minute break after the talk
      if (i < talksData.length - 1) {
          startTime.setTime(talkEndTime.getTime() + 10 * 60 * 1000);
      }
    }


    // --- Final HTML Structure ---
    const finalHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tech Talks Schedule</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="container">
          <h1>Tech Talks Schedule</h1>
          <div class="search-container">
            <input type="text" id="search" placeholder="Search by category...">
          </div>
          <ul class="schedule">
            ${scheduleHtml}
          </ul>
        </div>
        <script>${script}<\/script>
      </body>
      </html>
    `;

    // Write the final HTML file
    await fs.writeFile(outputFilePath, finalHtml, 'utf8');
    console.log('Website generated successfully at dist/index.html');

  } catch (error) {
    console.error('Error generating website:', error);
  }
}

generateWebsite();
