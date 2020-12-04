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

