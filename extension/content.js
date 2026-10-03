console.log("Music Genre Finder is running!");

const genreCache = new Map();

async function getGenre(song, artist) {
    const key = `${song.toLowerCase()}|${artist.toLowerCase()}`;

    // Don't call API again for the same song
    if (genreCache.has(key)) {
        return genreCache.get(key);
    }

    try {
        const response = await fetch(
            `https://genre-sync-hxiq.onrender.com/api/genre?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`
        );

        const data = await response.json();

        console.log("Genre API response:", data);

        const genres = data.genres || [];

        genreCache.set(key, genres);

        return genres;

    } catch (error) {
        console.error("Genre API error:", error);

        genreCache.set(key, []);

        return [];
    }
}


function displayGenre(container, genres) {

    // Don't create duplicate badge
    if (container.querySelector(".music-genre-badge")) {
        return;
    }

    if (!genres || genres.length === 0) {
        genres = ["Unavailable"];
    }

    const genreBadge = document.createElement("span");

    genreBadge.className = "music-genre-badge";

    genreBadge.innerText =
        `Genre: ${genres.join(", ")}`;

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


async function detectSongs() {

    const rows = [
        ...document.querySelectorAll('[role="row"]')
    ];

    const requests = [];

    for (const row of rows) {

        const artistElement = [
            ...row.querySelectorAll("span.e-10860-line-clamp")
        ].find(el =>
            el.innerText.trim().startsWith("Song")
        );

        if (!artistElement) continue;

        const container = artistElement.parentElement.parentElement;

        if (!container) continue;

        if (container.querySelector(".music-genre-badge")) {
            continue;
        }

        const text = container.innerText
            .replace(/\s+/g, " ")
            .trim();

        const match = text.match(
            /^(.+?)\s+Song\s*[·•]\s*(.+)$/i
        );

        if (!match) continue;

        const song = match[1].trim();
        const artist = match[2].trim();

        if (!song || !artist) continue;

        const primaryArtist = artist
            .split(",")[0]
            .trim();

        requests.push(
            getGenre(song, primaryArtist)
                .then(genres => {
                    displayGenre(container, genres);
                })
        );
    }

    // Fetch all genres at the same time
    await Promise.all(requests);
}


// Spotify dynamically changes the search dropdown,
// so watch for new results.
let observerTimeout;

const observer = new MutationObserver(() => {

    clearTimeout(observerTimeout);

    observerTimeout = setTimeout(() => {
        detectSongs();
    }, 500);

});

observer.observe(document.body, {
    childList: true,
    subtree: true
});