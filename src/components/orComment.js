function getVideoId(url) {
    let openrecUrl = url;
    if (openrecUrl.lastIndexOf("?") != -1) {
        openrecUrl = openrecUrl.slice(0, openrecUrl.lastIndexOf("?"));
    }
    let videoId = openrecUrl.replace("https://www.openrec.tv/live/", "");
    return videoId;
}

async function getMovieId(videoId) {
    let apiUrl =
        `https://public.openrec.tv/external/api/v5/movies/${videoId}`;
    let movieId = "";
    try {
        let res = await (await fetch(apiUrl)).json();
        if (res.onair_status == 0 || res.onair_status == 1) {
            movieId = res.movie_id;
        }
    } catch (e) {
        console.error(e);
    }
    return movieId;
}

async function getVideoInfo(videoId) {
    let apiUrl =
        "https://public.openrec.tv/external/api/v5/movies/" + videoId;
    let resjson = await (await fetch(apiUrl)).json();
    return resjson;
}

async function getWsUrl(videoId) {
    let movieId = await getMovieId(videoId);
    let wsUrl = `wss://chat.openrec.tv/socket.io/?movieId=${movieId}&EIO=3&transport=websocket`;
    return wsUrl;
}

async function parseWsData(data) {
    if (data.length > 2) {
        let pos = data.indexOf("[");
        if (pos == 2) {
            let orig = JSON.parse(data.substr(pos));
            return orig;
        }
    }
    return {}
}

export default { getVideoId, getVideoInfo, getWsUrl, parseWsData }
