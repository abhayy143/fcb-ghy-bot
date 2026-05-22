// We use a Set to store the URLs of articles we've already posted.
const postedNewsUrls = new Set();

// We cap the cache size at 200 to ensure the bot uses almost zero memory.
const MAX_CACHE_SIZE = 200;

function isPosted(url) {
    return postedNewsUrls.has(url);
}

function markAsPosted(url) {
    postedNewsUrls.add(url);
    
    // If our list gets too big, remove the oldest item to free up memory
    if (postedNewsUrls.size > MAX_CACHE_SIZE) {
        const firstItem = postedNewsUrls.values().next().value;
        postedNewsUrls.delete(firstItem);
    }
}

module.exports = { isPosted, markAsPosted };