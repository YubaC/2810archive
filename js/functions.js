const db = {
    owner: "YubaC",
    repo: "2810archive-DB",
    fetch_url: "https://api.github.com/repos/YubaC/2810archive-DB/contents/",
    base: "data/",
};

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
