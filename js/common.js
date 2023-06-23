// 读取header.html，插入到id为header的div中
$("#header").load("header.html");
$("#footer").load("footer.html");

// 检查token是否存在
var token = localStorage.getItem("token") || getCookie("token");

if (!token) {
    window.location.href = `login.html?redirct=${b64EncodeUnicode(window.location.href)}`;
} else {
    setCookie("token", token, 7);
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