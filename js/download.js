import { Octokit } from "https://cdn.skypack.dev/octokit";
const octokit = new Octokit({
    auth: token,
});

$("#details a").on("click", function () {
    // 如果使用的是相对路径
    if ($(this).attr("href").indexOf("http") != -1) {
        return true;
    }
    // 阻止默认行为
    event.preventDefault();
    console.log(db.base + url + "/" + $(this).attr("data-href"));
    octokit
        .request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner: db.owner,
            repo: db.repo,
            path:
                db.base +
                url +
                "/" +
                decodeURIComponent($(this).attr("data-href")),
            // path: "data/20181211/20181211升旗.rar",
        })
        .then(function (res) {
            console.log(res);
            console.log(res.data.download_url);
            return res.data.download_url;
        })
        .then(function (url) {
            // 下载文件
            var a = document.createElement("a");
            a.href = url;
            a.download = url;
            a.click();
            a.remove();
        });
});

// 遍历所有图片
$("#details img")
    .each(function () {
        // 如果使用的是相对路径
        if ($(this).attr("src").indexOf("http") != -1) {
            return true;
        }

        var src = $(this).attr("src");
        octokit
            .request("GET /repos/{owner}/{repo}/contents/{path}", {
                owner: db.owner,
                repo: db.repo,
                path: db.base + url + "/" + decodeURIComponent(src),
                // path: "data/20181211/20181211升旗.rar",
            })
            .then(function (res) {
                console.log(res.data.download_url);
                // 从download_url中获取图片的名称，并去掉最后的?
                var name = res.data.download_url.substring(
                    res.data.download_url.lastIndexOf("/") + 1
                );
                name = name.substring(0, name.lastIndexOf("?"));
                // 更换src为下载链接
                // 将#details内src等于name的图片的src属性值替换为download_url
                $("#details img[src='" + src + "']").attr(
                    "src",
                    res.data.download_url
                );
            });
    })
    .on("error", function () {
        // 在加载失败的图片处插入一段文字
        $(this).after(
            '<div class="alert alert-danger"><h6><b>图片加载失败。请尝试刷新页面并清除浏览器缓存。此时下载非网盘链接亦会失败。</b></h6></div>'
        );
    });
