
const axios = require("axios");

// Only allow actual musical genres
const ALLOWED_GENRES = [
    "pop",
    "rock",
    "hip-hop",
    "hip hop",
    "rap",
    "r&b",
    "soul",
    "jazz",
    "blues",
    "classical",
    "electronic",
    "edm",
    "house",
    "techno",
    "metal",
    "punk",
    "indie",
    "alternative",
    "folk",
    "country",
    "reggae",
    "disco",
    "funk",
    "gospel",
    "ambient",
    "trap"
];

async function getGenre(song, artist) {
    const url = "https://ws.audioscrobbler.com/2.0/";

    // First: get tags for the exact song
    const trackResponse = await axios.get(url, {
        params: {
            method: "track.getInfo",
            artist: artist,
            track: song,
            api_key: process.env.LASTFM_API_KEY,
            format: "json",
            autocorrect: 1
        }
    });

    let tags = trackResponse.data?.track?.toptags?.tag || [];

    // If the song has no tags, use artist tags as fallback
    if (tags.length === 0) {
        const artistResponse = await axios.get(url, {
            params: {
                method: "artist.getTopTags",
                artist: artist,
                api_key: process.env.LASTFM_API_KEY,
                format: "json",
                autocorrect: 1
            }
        });

        tags = artistResponse.data?.toptags?.tag || [];
    }

    // Keep only actual musical genres
    const genres = tags
        .map(tag => tag.name.toLowerCase().trim())
        .filter(tag => ALLOWED_GENRES.includes(tag));

    return {
        song: song,
        artist: artist,
        genres: [...new Set(genres)].slice(0, 3)
    };
}

module.exports = {
    getGenre
};

