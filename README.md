# 地域分流短链

一个免费的地域分流短链 MVP。用户创建推广短链时填写目标网址，并配置允许访问的国家或地区；命中规则的访问者会跳转到目标网址，其他访问者会跳转到统一备用页。

## 已实现功能

- 创建推广短链
- 为每条短链配置允许访问的国家或地区
- 统一备用页：`/unavailable`
- 服务端跳转路由：`/r/[slug]`
- 通过 `CF-IPCountry`、`x-vercel-ip-country` 或本地测试 Header 识别国家
- URL 安全校验，降低开放跳转滥用风险
- 基础访问事件记录和统计面板
- MVP 阶段使用文件存储：`data/db.json`

## 本地运行

```bash
npm install
npm run dev
```

然后打开 `http://localhost:3000`。

## 生产环境站点地址

如果应用部署在反向代理后面，建议配置：

```bash
APP_BASE_URL=https://link.apax-voting.com
```

这样服务端生成 `/unavailable` 等站内跳转地址时，会固定使用正式域名，避免返回 `localhost:3000`。

## 本地地域测试

跳转接口支持一个内部测试 Header：

```bash
curl -I -H "x-geo-test-country: IN" http://localhost:3000/r/demo
curl -I -H "x-geo-test-country: US" http://localhost:3000/r/demo
```

生产环境建议把 Cloudflare 放在应用前面，并优先使用 `CF-IPCountry`。

## 生产环境注意事项

这个 MVP 暂未包含登录、支付和完整风控审核。正式开放给外部用户前，建议把文件存储替换为 Postgres，并补上认证、限额、用户/域名封禁，以及恶意网址或钓鱼网址信誉检测。
