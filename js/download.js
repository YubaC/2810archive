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
$("#details img").each(async function (img) {
    const src = $(this).attr("src");
    if (src.indexOf("http") !== -1) {
        return;
    }
    try {
        const { download_url } = await getFileContent(decodeURIComponent(src));
        // 从 download_url 中获取图片的名称，并去掉最后的 ?
        const name = download_url.substring(
            download_url.lastIndexOf("/") + 1,
            download_url.lastIndexOf("?")
        );
        // 更换 src 为下载链接
        $(this).attr("src", download_url);
        // 下载图片
        // const blob = await fetch(download_url).then((res) => res.blob());
        // const objectUrl = URL.createObjectURL(blob);
        // const a = document.createElement("a");
        // a.href = objectUrl;
        // a.download = name;
        // a.click();
        // a.remove();
    } catch (err) {
        console.error(err);
        // 在加载失败的图片处插入一段文字
        $(this).after(
            '<div class="alert alert-danger"><h6><b>图片加载失败。请尝试刷新页面并清除浏览器缓存。此时下载非网盘链接亦会失败。</b></h6></div>'
        );
    }
});
