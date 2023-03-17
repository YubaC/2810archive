import { Octokit } from "https://cdn.skypack.dev/octokit";
const octokit = new Octokit({
    auth: token,
});

// 获取 Github 上的文件内容
async function getFileContent(path) {
    const res = await octokit.request(
        `GET /repos/{owner}/{repo}/contents/{path}?t=${new Date().getTime()}`,
        {
            owner: db.owner,
            repo: db.repo,
            path: db.base + url + "/" + path,
        }
    );
    const { download_url } = res.data;
    return { download_url };
}

// 点击链接下载文件
$("#details a:not([href^='http']").on("click", async function (event) {
    event.stopPropagation(); // 终止事件冒泡
    event.preventDefault();
    const href = $(this).attr("href");
    if (href.indexOf("http") !== -1) {
        return true;
    }
    try {
        const { download_url } = await getFileContent(
            decodeURIComponent($(this).attr("data-href"))
        );
        // 下载文件
        var a = document.createElement("a");
        a.href = download_url;
        a.download = download_url;
        a.click();
        a.remove();
    } catch (err) {
        console.error(err);
    }
});

// 遍历所有图片
$("#details img").each(async function () {
    const src = $(this).attr("data-src") || $(this).attr("src");
    if (src.indexOf("http") !== -1) {
        return;
    }
    try {
        const { download_url } = await getFileContent(decodeURIComponent(src));
        const name = download_url.substring(
            download_url.lastIndexOf("/") + 1,
            download_url.lastIndexOf("?")
        );
        const xhr = new XMLHttpRequest();
        xhr.open("GET", download_url, true);
        xhr.responseType = "blob";
        const img = this;
        // 添加边框
        $(img).css("border", "2px solid #ccc");
        xhr.addEventListener("load", async () => {
            if (xhr.status === 200) {
                const blob = xhr.response;
                const objectUrl = URL.createObjectURL(blob);
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = function () {
                    const base64data = reader.result;
                    $(img).attr("src", base64data);
                    // 加载完成后移除边框和进度条
                    $(img).css("border", "none");
                    progressBar.parent().remove();
                };
            } else {
                console.error(`Failed to fetch image: ${src}`);
                $(img).after(
                    `<div class="alert alert-danger">${
                        $(img).attr("alt") || $(img).attr("data-src")
                    }<br><h6><b>图片加载失败。请尝试刷新页面并清除浏览器缓存。</b></h6></div>`
                );
                // 加载失败时移除边框和进度条
                $(img).css("border", "none");
                progressBar.parent().remove();
                $(img).remove();
            }
        });
        xhr.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                const percentage = (e.loaded / e.total) * 100;
                updateProgressBar(percentage);
            }
        });
        xhr.send();
        const progressBar = $(`<div class="progress">
                              <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"></div>
                          </div>`)
            .insertBefore(this)
            .find(".progress-bar");
        const updateProgressBar = (percentage) => {
            progressBar.css("width", `${percentage}%`);
        };
    } catch (err) {
        console.error(err);
        $(this).after(
            `<div class="alert alert-danger">${
                $(this).attr("alt") || $(this).attr("data-src")
            }<br><h6><b>图片加载失败。请尝试刷新页面并清除浏览器缓存。</b></h6></div>`
        );
        $(this).remove();
        // 删除进度条
        progressBar.parent().remove();
    }
});

// 处理音频
$("#details audio").each(async function () {
    const src = $(this).attr("src");
    if (src.indexOf("http") !== -1) {
        return true;
    }
    try {
        const { download_url } = await getFileContent(decodeURIComponent(src));

        $(this).attr("data-src", $(this).attr("src"));
        $(this).attr("src", download_url);
    } catch (err) {
        console.error(err);
        $(this).after(
            `<div class="alert alert-danger">${
                $(this).attr("alt") || $(this).attr("data-src")
            }<br><h6><b>音频加载失败。请尝试刷新页面并清除浏览器缓存。</b></h6></div>`
        );
        $(this).remove();
    }
});
