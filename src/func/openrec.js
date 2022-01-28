function getVid(url) {
  let openrecUrl;
  let videoId = null;
  try {
    openrecUrl = new URL(url);
    if (openrecUrl.protocol === "https:") {
      openrecUrl = openrecUrl.origin + openrecUrl.pathname;
    }
    let re = /https:\/\/(?:www\.)?openrec.tv\/(?:m\/)?live\/([\w-]+)/;
    let result = openrecUrl.match(re);
    if (result) {
      videoId = result[1];
    }
  } catch (e) {
    videoId = url;
  }
  return videoId;
}

async function getVideoInfo(videoId) {
  let vid = getVid(videoId);
  let apiUrl = `https://public.openrec.tv/external/api/v5/movies/${vid}`;
  let res = await fetch(apiUrl);
  if (res.ok) {
    let j = await res.json();
    if (j.onair_status !== 0 && j.onair_status !== 1) {
      throw vid + " is not onair now.";
    }
    return {
      vid: j.id,
      mid: j.movie_id,
      title: j.title,
      name: j.channel.name,
      publicType: j.chat_public_type,
    };
  } else {
    throw videoId + " " + res.statusText;
  }
}

async function getUserInfo(userid) {
  let apiUrl = `https://public.openrec.tv/external/api/v5/channels/${userid}`;
  let res = await fetch(apiUrl);
  if (res.ok) {
    return await res.json();
  } else {
    throw `${userid} is not found.`;
  }
}

function getWsUrl(mid) {
  return `wss://chat.openrec.tv/socket.io/?movieId=${mid}&EIO=3&transport=websocket`;
}

function parseWsData(data) {
  if (data.length > 2 && data[0] !== "0") {
    data = JSON.parse(data.slice(2));
    data[1] = JSON.parse(data[1]);
    if (data[1].type === 0) {
      if (
        data[1].data.user_key !== "" &&
        checkBL(data[1].data.user_key, data[1].data.message)
      ) {
        data[1].data = commentFormatter("ws", data[1].data);
      } else {
        return [];
      }
    }
    return data;
  }
  return [];
}

async function getComments(vid) {
  let now = new Date().toISOString();
  let url = `https://public.openrec.tv/external/api/v5/movies/${vid}/chats?to_created_at=${now}&limit=150`;
  let comments = await (await fetch(url)).json();
  let commentData = [];

  for (let comment of comments) {
    if (checkBL(comment.user.id, comment.message)) {
      commentData.push(commentFormatter("rest", comment));
    }
  }
  return commentData;
}

function checkBL(userid, msg) {
  let result = true;
  let bl = localStorage.getItem("blacklist");
  let ngwords = localStorage.getItem("ngwords");
  if (bl && bl.split(",").includes(userid)) {
    result = false;
  } else if (
    ngwords &&
    ngwords != "" &&
    ngwords.split(",").filter((word) => msg.indexOf(word) !== -1).length !== 0
  ) {
    result = false;
  }
  return result;
}

function commentFormatter(mode, comment) {
  let c = {
    id: 0,
    name: "",
    color: "",
    recxuser_id: 0,
    message: comment.message,
    stamp: null,
    capture: null,
    yell: null,
    time: "",
  };
  if (mode == "rest") {
    c.id = comment.id;
    c.color = comment.chat_setting.name_color;
    c.recxuser_id = comment.user.recxuser_id;
    c.time = comment.posted_at.slice(11, -6);
    if (comment.stamp) {
      c.stamp = comment.stamp.l_image_url;
    }

    let name = `${comment.user.nickname} (${comment.user.id})`;
    if (comment.badges.length !== 0) {
      name += `[Lv.${comment.badges[0].subscription.months}]`;
    }
    if (comment.user.is_premium) {
      name = "${name}[P]";
    }
    if (comment.user.is_fresh) {
      name += "[Fresh]";
    }
    if (comment.is_moderating) {
      name += "[Staff]";
    }
    if (comment.is_muted) {
      name += "[Manuke]";
    }
    if (comment.user.is_warned) {
      name += "[Warned]";
    }
    c.name = name;
  } else if (mode === "ws") {
    c.id = comment.chat_id;
    c.color = comment.user_color;
    c.recxuser_id = comment.user_id;
    c.time = comment.cre_dt.slice(-8);

    // stamp, capture, yell
    if (comment.stamp) {
      c.stamp = comment.stamp.image_url;
    } else if (comment.capture) {
      c.capture = {
        id: comment.capture.capture.id,
        title: comment.capture.capture.title,
      };
    } else if (comment.yell) {
      c.yell = comment.yell.yells;
    }

    // name
    let name = `${comment.user_name} (${comment.user_key})`;
    if (comment.badges.length !== 0) {
      name += `[Lv.${comment.badges[0].subscription.months}]`;
    }
    if (comment.is_premium) {
      name += "[P]";
    }
    if (comment.is_fresh) {
      name += "[Fresh]";
    }
    if (comment.is_moderator) {
      name += "[Staff]";
    }
    if (comment.is_muted) {
      name += "[Manuke]";
    }
    if (comment.is_warned) {
      name += "[Warned]";
    }
    c.name = name;
  }
  return c;
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
  if (j.status != 0) {
    throw j.message;
  }
}

export default {
  getVideoInfo,
  getWsUrl,
  getComments,
  getUserInfo,
  parseWsData,
  postComment,
};
