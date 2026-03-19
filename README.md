# api

## quick start

* 创建新项目

这里都是默认就可以，选择最简单的模板，或者按需

```
npm create cloudflare@latest name-of-worker
```

1. 初始化仓库，与 taro 分支一样

```
git clone git@github.com:lblbk/bagua.git bagua-api
git checkout api
cd bagua-api
```

2. 初始化项目

```
npm install
```

3. 环境变量

在项目根目录创建一个文件名为 .dev.vars (Wrangler会自动忽略它不传到Git上)

```
# .dev.vars
ALIYUN_API_KEY=sk-你的阿里云测试key
VOLCENGINE_API_KEY=你的火山引擎测试key
```

4. 运行项目
```
npm run dev
```

## advance 

1. cf 链接 github rep

其他通常默认就可以

```
构建命令:无
部署命令:npx wrangler deploy
根目录:/
```

2. **cf 线上部署**

cf 网页端 `设置 (Settings) > 变量和机密 (Variables and Secrets)` 只能提供明文保存，链接 rep 后每次重新部署都会被清除，这里需要用下面方案上传

```bash
# 初次设置会要求登录 cf 
npx wrangler secret put VOLCENGINE_API_KEY
```

此时在 `设置 (Settings) > 变量和机密 (Variables and Secrets)` 可以看到一个密钥
