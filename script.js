function extractGifUrl(url) {

  url = url.trim();

  // media.giphy.com direct links
  let match = url.match(
    /media\.giphy\.com\/media\/([a-zA-Z0-9]+)\/giphy\.gif/
  );

  if (match) {
    return `https://media.giphy.com/media/${match[1]}/giphy.gif`;
  }

  // i.giphy.com direct links
  match = url.match(
    /i\.giphy\.com\/([a-zA-Z0-9]+)\.gif/
  );

  if (match) {
    return `https://i.giphy.com/${match[1]}.gif`;
  }

  // Standard giphy.com page links
  match = url.match(
    /giphy\.com\/gifs\/(?:.*-)?([a-zA-Z0-9]+)/
  );

  if (match) {
    return `https://media.giphy.com/media/${match[1]}/giphy.gif`;
  }

  return null;
}

async function fetchGif(gifUrl) {

  const response = await fetch(gifUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch GIF");
  }

  return await response.blob();
}

async function startDownload() {

  const textarea = document.getElementById("links");
  const status = document.getElementById("status");
  const log = document.getElementById("log");

  log.innerHTML = "";

  const links = textarea.value
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean);

  if (links.length === 0) {

    status.innerHTML =
      "Please paste at least one Giphy link.";

    return;
  }

  const zip = new JSZip();

  let completed = 0;

  for (let i = 0; i < links.length; i++) {

    const originalLink = links[i];

    const item = document.createElement("div");
    item.className = "item";

    try {

      status.innerHTML =
        `Processing ${i + 1} / ${links.length} GIFs...`;

      const gifUrl = extractGifUrl(originalLink);

      if (!gifUrl) {
        throw new Error("Invalid Giphy link");
      }

      const gifBlob = await fetchGif(gifUrl);

      zip.file(`giphy_${i + 1}.gif`, gifBlob);

      completed++;

      item.innerHTML = `
        <div class="success">
          ✅ Added to ZIP
        </div>
        ${gifUrl}
      `;

    } catch (err) {

      item.innerHTML = `
        <div class="error">
          ❌ ${err.message}
        </div>
        ${originalLink}
      `;
    }

    log.appendChild(item);
  }

  if (completed === 0) {

    status.innerHTML =
      `❌ No valid GIFs were downloaded. ZIP file was not created.`;

    return;
  }

  status.innerHTML =
    `Creating ZIP file (${completed} GIFs)...`;

  const zipBlob = await zip.generateAsync({
    type: "blob"
  });

  const downloadLink = document.createElement("a");

  downloadLink.href =
    URL.createObjectURL(zipBlob);

  downloadLink.download =
    "giphy_collection.zip";

  document.body.appendChild(downloadLink);

  downloadLink.click();

  downloadLink.remove();

  status.innerHTML =
    `✅ Finished downloading ${completed} GIF(s)!`;
}