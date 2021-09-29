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

async function getWsUrl(videoId) {
    let movieId = await getMovieId(videoId);
    let wsUrl = `wss://chat.openrec.tv/socket.io/?movieId=${movieId}&EIO=3&transport=websocket`;
    return wsUrl;
}

export default { getWsUrl }
