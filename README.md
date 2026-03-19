# api

## quick start

* 创建新项目

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
