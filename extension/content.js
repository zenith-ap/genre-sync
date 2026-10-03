console.log("Music Genre Finder is running!");
let lastProcessedSong = "";

function detectSong() {
  const test = [...document.querySelectorAll("span.e-10860-line-clamp")].find(
    (el) => el.innerText.trim().startsWith("Song"),
  );
  if (test) {
    const text = test.parentElement.parentElement.innerText
        .replace(/\s+/g, " ")
        .trim();

    const match = text.match(
        /^(.*?)\s*Song\s*[·•]\s*(.*)$/i
    );

    function removeOldGenreBadges() {
    document.querySelectorAll(".music-genre-badge").forEach(badge => {
        badge.remove();
    });
}

    if (match) {
        const song = match[1].trim();
        const artist = match[2].trim();

           if (song === lastProcessedSong) {
        return;
           }

        lastProcessedSong = song;

        console.log("Song:", song);
        console.log("Artist:", artist);
        const primaryArtist = artist.split(",")[0].trim();


        removeOldGenreBadges();


        getGenre(song, primaryArtist).then(genres => {
    displayGenre(
        test.parentElement.parentElement,
        genres
    );
});
    }
}
  
  
}

const observer = new MutationObserver(() => {
  detectSong();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

function displayGenre(container, genres) {
    if (!genres || genres.length === 0) {
        genres = ["Unavailable"];
    }

    // Don't create duplicate genre badges
    if (container.querySelector(".music-genre-badge")) {
        return;
    }

    const genreBadge = document.createElement("span");

    genreBadge.className = "music-genre-badge";
    genreBadge.innerText = `Genre: ${genres.join(", ")}`;

    genreBadge.style.cssText = `
       display: inline-block;
    margin-top: 6px;
    padding: 3px 8px;
    border-radius: 12px;
    background: rgba(30, 215, 96, 0.12);
    color: #1ed760;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.4; 
    `;

    container.appendChild(genreBadge);
}

async function getGenre(song, artist) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/genre?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`
        );

        const data = await response.json();

        console.log("Genre API response:", data);

        return data.genres;
    } catch (error) {
        console.error("Genre API error:", error);
        return [];
    }
}


detectSong();
