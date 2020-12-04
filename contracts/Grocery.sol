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