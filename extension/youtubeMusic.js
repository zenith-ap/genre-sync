console.log("YouTube Music Genre Finder loaded!");
const genreCache = new Map();
function getYouTubeMusicSongs() {
    const results = [
        ...document.querySelectorAll(
            "ytmusic-responsive-list-item-renderer"
        )
    ];

    return results
        .map((el) => {
            const links = [...el.querySelectorAll("a")];

            const songLink = links.find(
                (a) =>
                    a.href.includes("/watch") &&
                    a.innerText.trim()
            );

            const artistLink = links.find(
                (a) =>
                    a.href.includes("/channel/") &&
                    a.innerText.trim()
            );

            if (!songLink || !artistLink) {
                return null;
            }

            return {
                song: songLink.innerText.trim(),
                artist: artistLink.innerText.trim()
            };
        })
        .filter(Boolean);
}


// Check songs
const songs = getYouTubeMusicSongs();

console.log("YouTube Music songs:", songs);

async function getGenre(song, artist) {

    const key = `${song.toLowerCase()}|${artist.toLowerCase()}`;

    // Already fetched
    if (genreCache.has(key)) {
        return genreCache.get(key);
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/genre?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`
        );

        const data = await response.json();

        const genres = data.genres || [];

        // Save result
        genreCache.set(key, genres);

        console.log("Genre API response:", data);

        return genres;

    } catch (error) {

        console.error("Genre API error:", error);

        // Also cache failures so we don't repeatedly request them
        genreCache.set(key, []);

        return [];
    }
}


async function testGenres() {
    const songs = getYouTubeMusicSongs();

    for (const item of songs.slice(0, 5)) {
        const genres = await getGenre(
            item.song,
            item.artist
        );

        console.log(
            `${item.song} → ${genres.join(", ") || "Genre unavailable"}`
        );
    }
}

testGenres();


function addGenreBadge(element, genres) {

    if (element.querySelector(".music-genre-badge")) {
        return;
    }

    const badge = document.createElement("span");

    badge.className = "music-genre-badge";

    badge.innerText =
        genres.length > 0
            ? `Genre: ${genres.join(", ")}`
            : "Genre: Unavailable";

    badge.style.cssText = `
        display: inline-block;
        margin-top: 5px;
        padding: 3px 8px;
        border-radius: 12px;
        background: rgba(29, 185, 84, 0.12);
        color: #1db954;
        font-size: 11px;
        font-weight: 600;
        line-height: 1.4;
        white-space: nowrap;
    `;

    const titleContainer =
        element.querySelector(".title-column");

    if (titleContainer) {
        titleContainer.appendChild(badge);
    } else {
        element.appendChild(badge);
    }
}

async function showGenres() {
    const elements = [
        ...document.querySelectorAll(
            "ytmusic-responsive-list-item-renderer"
        )
    ];

    for (const element of elements) {

        const links = [...element.querySelectorAll("a")];

        const songLink = links.find(
            a =>
                a.href.includes("/watch") &&
                a.innerText.trim()
        );

        const artistLink = links.find(
            a =>
                a.href.includes("/channel/") &&
                a.innerText.trim()
        );

        if (!songLink || !artistLink) {
            continue;
        }

        const song = songLink.innerText.trim();
        const artist = artistLink.innerText.trim();

        const genres = await getGenre(song, artist);

        addGenreBadge(element, genres);
    }
}

showGenres();


let genreProcessing = false;

const observer = new MutationObserver(() => {
    if (genreProcessing) return;

    genreProcessing = true;

    setTimeout(async () => {
        await showGenres();
        genreProcessing = false;
    }, 500);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});