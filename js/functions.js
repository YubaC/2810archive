const db = {
    owner: "YubaC",
    repo: "2810archive-DB",
    fetch_url: "https://api.github.com/repos/YubaC/2810archive-DB/contents/",
    base: "data/",
};

// !URL处理
function getUrlParam(para) {
    var search = location.search; //页面URL的查询部分字符串
    var arrPara = new Array(); //参数数组。数组单项为包含参数名和参数值的字符串，如“para=value”
    var arrVal = new Array(); //参数值数组。用于存储查找到的参数值

    if (search != "") {
        var index = 0;
        search = search.substr(1); //去除开头的“?”
        arrPara = search.split("&");

        for (i in arrPara) {
            var paraPre = para + "="; //参数前缀。即参数名+“=”，如“para=”
            if (
                arrPara[i].indexOf(paraPre) == 0 &&
                paraPre.length < arrPara[i].length
            ) {
                arrVal[index] = decodeURI(arrPara[i].substr(paraPre.length)); //顺带URI解码避免出现乱码
                index++;
            }
        }
    }

    if (arrVal.length == 0) {
        return [];
    } else {
        return arrVal;
    }
}

/**
 * 返回用于请求的url，去除url中的../和./
 * @param {string} origionUrl The original url
 */
function getRequestUrl(origionUrl) {
    // 处理 url
    let url = origionUrl
        .replace(/\/{2,}/g, "/")
        .replace(/\/\.\//g, "/")
        .replace(/\/\.$/, "");

    // 将 url 分割成路径名和文件名两部分
    let lastSlashIndex = url.lastIndexOf("/");
    let path = url.substring(0, lastSlashIndex + 1);
    let filename = url.substring(lastSlashIndex + 1);

    // 处理路径名，去掉 ../ 和 ./
    let pathArr = path.split("/");
    let resultPathArr = [];
    for (let i = 0; i < pathArr.length; i++) {
        if (pathArr[i] === "..") {
            resultPathArr.pop();
        } else if (pathArr[i] !== "." && pathArr[i] !== "") {
            resultPathArr.push(pathArr[i]);
        }
    }
    let resultPath = resultPathArr.join("/");

    // 返回处理后的 url
    return resultPath + "/" + filename;
}


// !Base64加密解密
// base64加密的函数
function b64EncodeUnicode(str) {
    if (str == null) return null;
    return btoa(
        encodeURIComponent(str).replace(
            /%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode("0x" + p1);
            }
        )
    );
}

// base64解密的函数
function b64DecodeUnicode(str) {
    if (str == null) return null;
    return decodeURIComponent(
        atob(str)
            .split("")
            .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );
}


// !cookie操作
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toGMTString();
    document.cookie =
        cname + "=" + cvalue + "; " + expires + "; SameSite=None; Secure";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null) {
        setCookie(name, cval, -1);
    }
}

// !Github API
// 获取 Github 上的文件内容
async function getFileContent(path) {
    console.log(getRequestUrl(db.base + url + "/" + path));
    const res = await octokit.request(
        `GET /repos/{owner}/{repo}/contents/{path}?t=${new Date().getTime()}`,
        {
            owner: db.owner,
            repo: db.repo,
            path: getRequestUrl(db.base + url + "/" + path),
        }
    );
    const { download_url } = res.data;
    return { download_url };
}

// !其他
function showErrorMsg(element, msg1, msg2) {
    $(element).after(
        `<div class="alert alert-danger">${msg1}<br><h6><b>${msg2}</b></h6></div>`
    );
}

function addProgressBar(element) {
    const progressBar = $(`<div class="progress">
                              <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"></div>
                          </div>`)
        .insertBefore(element)
        .find(".progress-bar");
    const updateProgressBar = (percentage) => {
        progressBar.css("width", `${percentage}%`);
    };
    return { progressBar, updateProgressBar };
}



export { db, getUrlParam, getRequestUrl, b64EncodeUnicode, b64DecodeUnicode, setCookie, getCookie, delCookie, getFileContent, showErrorMsg, addProgressBar };