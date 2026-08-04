---
title: "Python 示例笔记一：用 Requests 调 GitHub API"
slug: "python-requests-github-api-example"
date: 2026-05-26T17:41:02+08:00
author:
  - "Y'Jie"
categories:
  - 开发
  - Python
tags:
  - Python
  - 技术笔记
  - 代码示例
  - Requests
description: "这是一个用于演示 Python 分类文章排版与代码块展示的示例页面，适合测试站点样式、代码高亮和技术笔记结构。"
summary: "这是一个用于演示 Python 分类文章排版与代码块展示的示例页面，适合测试站点样式、代码高亮和技术笔记结构。"
keywords:
  - Python 技术笔记
  - Requests 示例
  - GitHub API Python
  - 代码高亮示例
series:
  - Python
weight: 1
cover:
  image: ""
  alt: ""
  caption: ""
  relative: false
  hiddenInList: false
  hiddenInSingle: false
showToc: true
TocOpen: false
ShowBreadCrumbs: true
ShowReadingTime: true
ShowWordCount: true
hidemeta: false
draft: false
comments: true
searchHidden: false
mermaid: true
---

---

## 核心观点

PaperMod 是 Hugo 生态中最受欢迎的主题之一，具有以下 *特点*：
- **极致性能**：页面加载快，SEO 友好
- **简约美观**：默认配置即可获得干净的阅读体验
- **功能丰富**：支持搜索、归档、标签、多语言、深色模式等
- **高度可定制**：通过配置文件灵活调整

```python
import requests

def get_github_user_info(username):
    """获取指定 GitHub 用户的公开信息"""
    url = f"https://api.github.com/users/{username}"
    
    try:
        # 发送网络请求
        response = requests.get(url)
        # 如果响应状态码不是 200，抛出异常
        response.raise_for_status()
        
        # 将 JSON 响应转化为 Python 字典
        data = response.json()
        
        # 提取我们需要的数据
        info = {
            "用户名": data.get("login"),
            "姓名": data.get("name"),
            "关注者数量": data.get("followers"),
            "公开仓库数": data.get("public_repos"),
            "个人简介": data.get("bio")
        }
        
        return info

    except requests.exceptions.RequestException as e:
        return f"请求出错: {e}"

# --- 执行演示 ---
if __name__ == "__main__":
    user = "guofei9987"  # 你可以换成任何 GitHub 用户名
    result = get_github_user_info(user)
    
    if isinstance(result, dict):
        print(f"--- {result['用户名']} 的个人资料 ---")
        for key, value in result.items():
            print(f"{key}: {value}")
    else:
        print(result)
```

## 相关链接

- [Hugo 官方文档](https://gohugo.io/)
- [PaperMod 主题仓库](https://github.com/adityatelange/hugo-PaperMod)
- [PaperMod 示例站点](https://adityatelange.github.io/hugo-PaperMod/)
- [Hugo 主题仓库](https://themes.gohugo.io/)

## 备注

- 建议使用 Git Submodule 管理主题，方便更新
- 多语言站点时可配置 `defaultContentLanguage`
- 深色模式会记住用户偏好（localStorage）


## 参考资料

- [Python 官方文档](https://docs.python.org/3/)
- [Requests 官方文档](https://requests.readthedocs.io/en/latest/)
- [GitHub REST API Docs](https://docs.github.com/en/rest)
