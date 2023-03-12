// 读取header.html，插入到id为header的div中
$("#header").load("header.html");
$("#footer").load("footer.html");

// 1. 查找localStorage中是否有token
// 2. 如果没有，查找cookie中是否有token
// 3. 如果没有，跳转到登录页面
// 4. 如果有，加载数据

// 1. 查找localStorage中是否有token
var token = localStorage.getItem("token");
if (token == null) {
    // 2. 如果没有，查找cookie中是否有token
    token = getCookie("token");
    if (token == null || token == "") {
        // 3. 如果没有，跳转到登录页面
        window.location.href = "login.html";
    } else {
        // 刷新cookie的过期时间
        setCookie("token", token, 7);
        // 4. 如果有，加载数据
        loadData();
    }
} else {
    // 4. 如果有，加载数据
    loadData();
}

function logout() {
    // 1. 清除localStorage中的token
    localStorage.removeItem("token");
    // 2. 清除cookie中的token
    delCookie("token");
    // 3. 跳转到登录页面
    window.location.href = "login.html";
}

// cookie操作
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
