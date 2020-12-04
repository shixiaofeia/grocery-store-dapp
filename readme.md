# 手摸手用Truffle开发自己的第一个DApp
## 前言
简单写个杂货铺的DApp, 每个人可以把自己不用的东西挂在上面, 以获得领取自己需要东西机会, 简单来说就是共享自己无用的东西; 
> 效果图, 请忽略样式, 毕竟我是个后端

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201203192037919.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3l3ZGh6eGY=,size_16,color_FFFFFF,t_70)

[项目源码](https://github.com/shixiaofeia/grocery-store-dapp)

## 环境需求
1. [MetaMask](https://metamask.io/)
2. node
3. yarn
4. [Ganache](https://www.trufflesuite.com/ganache)
5. truffle     (npm install -g truffle)
6. lite-server (yarn add lite-server )
```

## 后端

### 初始化项目
```
truffle init 
npm init
```
> 目录介绍
```
|-- Dapp
    |-- build                 // 合约编译后自动创建
    |-- contracts             // 放置合约文件
    |-- migrations            // 放置部署文件
    |-- test                  // 放置测试文件
```

### 编写合约
> contracts/Grocery.sol 
```solidity
pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;


contract Grocery {
    struct Goods {
        string name;
        string img;
        bool isClaim;
    }

    mapping(uint => address) goodsMap;  // 商品的归属
    Goods[] public goodsList;  // 所有商品列表
    mapping(address => uint[]) claimList;  // 领取列表
    mapping(address => int) claimNum; // 领取统计
    int maxClaim = 10;  // 最大领取数量, 可以用过添加商品来得到更多的机会

    // @notice 添加商品
    function AddGoods(string memory _name, string memory _img) public returns (uint){
        uint id = goodsList.push(Goods(_name, _img, false)) - 1;
        goodsMap[id] = msg.sender;
        claimNum[msg.sender] -= 1;
        return id;
    }

    // @notice 领取商品
    function Claim(uint _id) public {
        require(claimNum[msg.sender] <= maxClaim, "您已经领取的足够多了");
        require(!goodsList[_id].isClaim, "该商品已经被认领");
        goodsMap[_id] = msg.sender;
        goodsList[_id].isClaim = true;
        claimList[msg.sender].push(_id);
        claimNum[msg.sender] += 1;
    }

    // @notice 获取所有的商品
    function GetAllGoods() public view returns (Goods[] memory){
        return goodsList;
    }

    // @notice 获取商品归属地址
    function GoodsOf(uint _id) public view returns (address) {
        return goodsMap[_id];
    }
}
```
代码逻辑也比较简单, 每个人都可以添加商品, 并且获得领取次数, 已经被领取的商品不允许被再次领取;

### 编写部署脚本
> migrations/2_initial_grocery.js
```js
const Grocery = artifacts.require("Grocery");

module.exports = function (deployer) {
    deployer.deploy(Grocery);
};
```

### 配置网络
> 打开ganache, 启动区块链, 默认会生成10个有100个ETH的账户

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201203142317707.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3l3ZGh6eGY=,size_16,color_FFFFFF,t_70)

> 查看配置端口, 默认都是7545, 当前也可以改

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201203142346485.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3l3ZGh6eGY=,size_16,color_FFFFFF,t_70)

> 修改项目truffle-config.js 里面的配置端口, 连通测试区块
```
development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
 }
```

### 部署合约并进行交互
> 进入truffle控制台
```
truffle console
```
可以看到 truffle(development) 连接上了development环境

> 编译合约
```
compile
```
成功后有如下输出, 并且项目会多个build目录, 里面有编译好的json合约文件
```
> Compiled successfully using:
   - solc: 0.5.16+commit.9c3226ce.Emscripten.clang
```

> 部署合约
```
migrate
migrate --reset    // 如果合约修改了需要重新部署, 则需要添加reset参数
```
成功后有如下输出, 创建了两个合约
```
Summary
=======
> Total deployments:   2
> Final cost:           0.02087428 ETH

```
可以在打开的 Ganache 中看到区块变化, 默认花费第一个帐户的ETH
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201203160413414.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3l3ZGh6eGY=,size_16,color_FFFFFF,t_70)

### 测试
> 成功部署后当然要测试一下合约的准确了, 这里可以控制台直接连接测试, 也可以编写js/sol测试文件来测试

#### 控制台测试
```
let accounts = await web3.eth.getAccounts()     // 获取当前所有的账户， 也就是初始化的是个地址
accounts                                       // 打印地址
let instance = await Grocery.deployed()        // 获取合约实列
```
> 用第二个账户去添加商品添加商品 

```
instance.AddGoods("zombie", "https://dss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3994931373,529771369&fm=26&gp=0.jpg", {from: accounts[1]})
```
成功后返会交易详情
```
{
  tx: '0x3433af229a978e5ae61ad42845041e30136bb381e2ca759415bc05e602ffe042',
  receipt: {
    transactionHash: '0x3433af229a978e5ae61ad42845041e30136bb381e2ca759415bc05e602ffe042',
    transactionIndex: 0,
    blockHash: '0xeb67216667d37474859c60ce33c13bcb8654af40b50c14ceed38bd763d673fa1',
    blockNumber: 5,
    from: '0xd1f614d6577df534f5d17d5c9aba14331515436f',
    to: '0xa916c6f1439c77942d26e9317ef401b164d96978',
    gasUsed: 171053,
    cumulativeGasUsed: 171053,
    contractAddress: null,
    logs: [],
    status: true,
    logsBloom: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000000000000000',
    rawLogs: []
  },
  logs: []
}

```

> 用第三个账户取认领
```
instance.Claim(0, {from: accounts[2]})
```
成功后返会交易详情
```
{
  tx: '0x1b264ac1497f03c33a7db0b7f89212fe4537b53801cc34a72afda4a744c02cee',
  receipt: {
    transactionHash: '0x1b264ac1497f03c33a7db0b7f89212fe4537b53801cc34a72afda4a744c02cee',
    transactionIndex: 0,
    blockHash: '0x28c3404ce1007f9b7aba3c06038216697af2afbd6c6a4035cbb59df99f97a248',
    blockNumber: 6,
    from: '0x2e097441b0828c69245dfec4ae970945acba7206',
    to: '0xa916c6f1439c77942d26e9317ef401b164d96978',
    gasUsed: 95538,
    cumulativeGasUsed: 95538,
    contractAddress: null,
    logs: [],
    status: true,
    logsBloom: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000000000000000',
    rawLogs: []
  },
  logs: []
}
```

> 获取商品归属
```
 instance.GoodsOf(0)
```
成功后返回地址
```
'0x2E097441B0828c69245DFec4ae970945acbA7206'
```

> 获取所有商品列表
```
 instance.GetAllGoods()
```
返回
```
[
  [
    'zombie',
    'https://dss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3994931373,529771369&fm=26&gp=0.jpg',
    true,
    name: 'zombie',
    img: 'https://dss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3994931373,529771369&fm=26&gp=0.jpg',
    isClaim: true
  ]
]
```

#### 编写测试文件
> test/TestGrocery.sol
```solidity
pragma solidity ^0.5.0;

import "truffle/Assert.sol";              // 引入的断言
import "truffle/DeployedAddresses.sol";  // 用来获取被测试合约的地址
import "../contracts/Grocery.sol";       // 被测试合约

contract TestGrocery {
    Grocery grocery = Grocery(DeployedAddresses.Grocery());

    //  发布商品测试
    function testAddGoods() public {
        uint id = grocery.AddGoods("GoLang", "https://img-blog.csdnimg.cn/20190629154954578.png?x-oss-process=image/resize,m_fixed,h_64,w_64");
        uint expected = 0;
        Assert.equal(id, expected, "Goods id is not 0");
    }

    // 领取商品测试
    function testClaim() public {
        // 期望领取者的地址就是本合约地址，因为交易是由测试合约发起交易，
        address expected = address(this);
        grocery.Claim(0);
        address claimAddr = grocery.GoodsOf(0);
        Assert.equal(claimAddr, expected, "Owner of goods id 1 should be recorded.");
    }
}
```
在truffle控制台调用test命令, 返回如下
```
  TestGrocery
    √ testAddGoods (379ms)
    √ testClaim (598ms)


  2 passing (14s)
```
测试成功

## 前端

### 目录介绍
```
|-- Dapp
    |-- src             //项目根目录下创建src目录，存放前端文件
        -- index.html
        |-- js
        |-- fonts
        |-- css
    -- bs-config.json    // lite-server的配置文件
```
### 配置 lite-server
> 安装
```
yarn add lite-server
```

> bs-config.json   指定 lite-server 的工作目录
```json
{
  "server": {
    "baseDir": ["./src", "./build/contracts"]
  }
}
```

### 配置启动脚本
> package.json
```
"scripts": {
  "dev": "lite-server"   // 添加这行, 启动 yarn run dev 
}
```

### 代码
前端属实好几年没写过了, 这里是根据参考博客的前端代码改的, 然后js里面的truffle-contract.js 和web3.js 是从node_modules里面copy出来的, 因为合约里面有一个返回数组的, 所以得用较新版本的包; 大家主要看看
app.js里面的代码知道怎么初始化调用合约就可以了;

### 启动
```
yarn run dev
```

## 扩展
> 当然有兴趣的朋友也可以在此之上多添加一些功能, 比如:

1. 新增商品和领取通知(event);
2. 显示当前账户可领取次数;
3. ....

## 参考文档
```
https://learnblockchain.cn/docs/truffle/index.html
https://learnblockchain.cn/2018/01/12/first-dapp/#%E5%88%9B%E5%BB%BA%E7%94%A8%E6%88%B7%E6%8E%A5%E5%8F%A3%E5%92%8C%E6%99%BA%E8%83%BD%E5%90%88%E7%BA%A6%E4%BA%A4%E4%BA%92
https://www.jianshu.com/p/b7be51dd8e84
```