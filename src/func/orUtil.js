function getVideoId(url) {
    let openrecUrl = url;
    if (openrecUrl.lastIndexOf("?") != -1) {
        openrecUrl = openrecUrl.slice(0, openrecUrl.lastIndexOf("?"));
    }
    let re = /https:\/\/(?:www\.)?openrec.tv\/(?:m\/)?live\/([\w-]+)/
    let result = openrecUrl.match(re);
    let videoId = ""
    if (result) {
        videoId = result[1];
    } else {
        videoId = openrecUrl;
    }
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
    let apiUrl = `https://public.openrec.tv/external/api/v5/movies/${videoId}`;
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

async function postComment(videoId, inputComment) {
    let url = `https://apiv5.openrec.tv/api/v5/movies/${videoId}/chats`;
    let data = {
        consented_chat_terms: false,
        message: inputComment,
        quality_type: 2,
        messaged_at: "",
        league_key: "",
        to_user_id: "",
    };
    let param = {
        method: "POST",
        headers: {
            Accept: "application/json,text/plain,*/*",
            "Content-Type": "application/json;charset=utf-8",
            uuid: localStorage.getItem("orUuid"),
            "access-token": localStorage.getItem("orAccessToken"),
        },
        body: JSON.stringify(data),
    };
    let j = await (await fetch(url, param)).json();
    inputComment = "";
    let status = "";
    if (j.status != 0) {
        status = j.message;
    }
    return status;
}

async function updateChatSetting(conf) {
    let url = "https://apiv5.openrec.tv/api/v5/users/me/chat-setting"
    let param = {
        method: "PUT",
        headers: {
            Accept: "application/json,text/plain,*/*",
            "Content-Type": "application/json;charset=utf-8",
            uuid: localStorage.getItem("orUuid"),
            "access-token": localStorage.getItem("orAccessToken"),
        },
        body: JSON.stringify(conf),
    };
    let j = await (await fetch(url, param)).json();
    let status = "";
    if (j.status != 0) {
        status = j.message;
    }
    return status;
}

async function getBL() {
    let url = "https://apiv5.openrec.tv/api/v5/movies/n9ze3m2w184/detail";
    let param = {
        method: "GET",
        headers: {
            Accept: "application/json,text/plain,*/*",
            "Content-Type": "application/json;charset=utf-8",
            uuid: localStorage.getItem("orUuid"),
            "access-token": localStorage.getItem("orAccessToken"),
        }
    };
    let j = await (await fetch(url, param)).json();
    return j;
}

async function getNGwords() {
    let url = "https://apiv5.openrec.tv/api/v5/users/me/banned-words"
    let param = {
        method: "GET",
        headers: {
            Accept: "application/json,text/plain,*/*",
            "Content-Type": "application/json;charset=utf-8",
            uuid: localStorage.getItem("orUuid"),
            "access-token": localStorage.getItem("orAccessToken"),
        }
    };
    let j = await (await fetch(url, param)).json();
    return j;
}

export default { getVideoId, getVideoInfo, getWsUrl, parseWsData, postComment, updateChatSetting, getBL, getNGwords }
