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
$(
    '#details a:not([href^="http"]):not([href^="mailto"]):not([href^="tel"]):not([href^="sms"])'
).on("click", async function (event) {
    event.stopPropagation(); // 终止事件冒泡
    event.preventDefault();
    // 添加加载动画
    // <i class="fas fa-circle-notch fa-spin"></i>
    $(this).html(
        `<i class="fas fa-circle-notch fa-spin" style="margin-right: 5px;"></i>${$(
            this
        ).text()}`
    );
    const href = $(this).attr("href");
    if (href.indexOf("http") !== -1) {
        return true;
    }
    try {
        const { download_url } = await getFileContent(
            decodeURIComponent($(this).attr("data-href"))
        );

        // 报错
        if (!download_url) {
            throw new Error("Invalid download url.");
        }

        // 下载文件
        var a = document.createElement("a");
        a.href = download_url;
        // 添加download属性
        a.download = download_url;
        a.click();
        a.remove();

        // 移除加载动画，显示一个对号
        $(this).html(
            `<i class="fas fa-check text-success" style="margin-right: 5px;"></i>${$(
                this
            ).text()}`
        );

        // 三秒后移除对号
        setTimeout(() => {
            $(this).html($(this).text());
        }, 3000);
    } catch (err) {
        console.error(err);
        window.alert("下载失败，请刷新页面重试。");
        // 移除加载动画，显示一个叉号
        $(this).html(
            `<i class="fas fa-times text-danger" style="margin-right: 5px;"></i>${$(
                this
            ).text()}`
        );
        // 三秒后移除叉号
        setTimeout(() => {
            $(this).html($(this).text());
        }, 3000);
    }
});

// 遍历所有图片
$("#details img").each(async function () {
    const src = $(this).attr("data-src") || $(this).attr("src");
    if (src.indexOf("http") !== -1) {
        return;
    }

    const img = this;
    const { progressBar, updateProgressBar } = addProgressBar(img);
    progressBar.addClass("active-bar");

    try {
        const { download_url } = await getFileContent(decodeURIComponent(src));
        const name = download_url.substring(
            download_url.lastIndexOf("/") + 1,
            download_url.lastIndexOf("?")
        );

        // 报错
        if (!download_url) {
            throw new Error("Invalid image url.");
        }

        const xhr = new XMLHttpRequest();
        xhr.open("GET", download_url, true);
        xhr.responseType = "blob";

        progressBar.removeClass("active-bar");

        // // 添加边框
        // $(img).css("border", "2px solid #ccc");
        xhr.addEventListener("load", async () => {
            if (xhr.status === 200) {
                const blob = xhr.response;
                const objectUrl = URL.createObjectURL(blob);
                $(img).attr("src", objectUrl); // 将URL对象直接设置为图片的src属性
                // 加载完成后移除进度条
                // // 加载完成后移除边框和进度条
                // $(img).css("border", "none");
                progressBar.parent().remove();
            } else {
                const errorMsg = `Failed to fetch image: ${src}`;
                console.error(errorMsg);
                showErrorMsg(
                    img,
                    $(img).attr("alt") || $(img).attr("data-src"),
                    "图片加载失败。请尝试刷新页面并清除浏览器缓存。"
                );
                // 加载失败时移除进度条
                // // 加载失败时移除边框和进度条
                // $(img).css("border", "none");
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
        // 错误处理
        xhr.addEventListener("error", (e) => {
            const errorMsg = "Failed to fetch image.";
            console.error(errorMsg);
            showErrorMsg(
                img,
                $(img).attr("alt") || $(img).attr("data-src"),
                "图片加载失败。请尝试刷新页面并清除浏览器缓存。"
            );
            $(img).remove();
            // 删除进度条
            progressBar.parent().remove();
            throw new Error(errorMsg);
        });

        xhr.send();
    } catch (err) {
        console.error(err);
        progressBar.removeClass("active-bar");

        showErrorMsg(
            img,
            $(img).attr("alt") || $(img).attr("data-src"),
            "无网络连接或图片已失效。请检查网络连接并向我们反馈这个错误。"
        );
        $(img).remove();
        // 删除进度条
        progressBar.parent().remove();
    }
});

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

// 处理音频
$("#details audio").each(async function () {
    const src = $(this).attr("src");
    if (src.indexOf("http") !== -1) {
        return true;
    }

    // 添加加载动画和音频组件
    const $audioWrapper = $("<div class='d-flex align-items-center'></div>");
    const $loadingIcon = $("<i class='fas fa-circle-notch fa-spin me-2'></i>");
    $audioWrapper.append($loadingIcon, $(this).clone());

    $(this).replaceWith($audioWrapper);

    let download_url;
    try {
        // 获取音频文件
        const response = await getFileContent(decodeURIComponent(src));
        download_url = response.download_url;

        // 如果download_url不存在就直接跳到catch
        if (!download_url) {
            throw new Error("Invalid audio url.");
        }

        // 更新音频组件的 src 属性
        $audioWrapper
            .find("audio")
            .attr("src", download_url)

            // 错误处理
            .on("error", (e) => {
                // 报错
                $audioWrapper.find(".fa-circle-notch").remove();

                // 添加差号图标
                $audioWrapper.prepend(
                    "<i class='fas fa-times me-2 text-danger'></i>"
                );

                // 添加加载失败提示
                showErrorMsg(
                    $audioWrapper,
                    $audioWrapper.find("audio").attr("alt") ||
                        $audioWrapper.find("audio").attr("data-src"),
                    "音频加载失败。请尝试刷新页面并清除浏览器缓存。"
                );

                throw new Error("Failed to fetch audio.");
            });

        // 监听 canplay 事件，移除加载动画
        $audioWrapper.find("audio").on("canplay", function () {
            $audioWrapper.find(".fa-circle-notch").remove();

            // 添加对号图标
            $audioWrapper.prepend(
                "<i class='fas fa-check me-2 text-success'></i>"
            );

            // 三秒后移除对号图标
            setTimeout(() => {
                $audioWrapper.find(".fa-check").remove();
            }, 3000);
        });
    } catch (err) {
        // 下载链接为空时，添加差号图标和加载失败提示
        console.error(err);
        // 移除加载动画
        $audioWrapper.find(".fa-circle-notch").remove();

        // 添加差号图标
        $audioWrapper.prepend("<i class='fas fa-times me-2 text-danger'></i>");

        // 添加加载失败提示
        showErrorMsg(
            $audioWrapper,
            $audioWrapper.find("audio").attr("alt") ||
                $audioWrapper.find("audio").attr("data-src"),
            "音频加载失败。请尝试刷新页面并清除浏览器缓存。"
        );
    }
});
