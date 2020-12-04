App = {
    web3Provider: null,
    contracts: {},

    init: async function () {
        return await App.initWeb3();
    },

    initWeb3: async function () {

        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

        return App.initContract();
    },

    initContract: function () {
        // 加载Grocery.json，保存了Grocery的ABI（接口说明）信息及部署后的网络(地址)信息，它在编译合约的时候生成ABI，在部署的时候追加网络信息
        $.getJSON('Grocery.json', function (data) {
            // 用Grocery.json数据创建一个可交互的TruffleContract合约实例。
            var GroceryArtifact = data;
            App.contracts.Grocery = TruffleContract(GroceryArtifact);

            // Set the provider for our contract
            App.contracts.Grocery.setProvider(App.web3Provider);

            // 初始化刷新商品列表
            return App.refreshGoods();
        });
        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-adopt', App.handleClaim);
        $(document).on('click', '.add-goods', App.AddGoods);
    },

    // 刷新商品列表
    refreshGoods: function () {
        // alert("刷新页面");
        var groceryInstance;

        App.contracts.Grocery.deployed().then(function (instance) {
            groceryInstance = instance;
            // alert("初始化合约");
            // 调用合约的GetAllGoods(), 用call读取信息不用消耗gas
            return groceryInstance.GetAllGoods.call();
        }).then(function (goods) {
            console.log("goods", goods);
            var petsRow = $('#petsRow');
            petsRow.empty();
            var petTemplate = $('#petTemplate');
            for (i = 0; i < goods.length; i++) {
                petTemplate.find('.panel-title').text(goods[i].name);
                petTemplate.find('img').attr('src', goods[i].img);

                petTemplate.find('.btn-adopt').attr('data-id', i);
                if (goods[i].isClaim === true) {
                    $('.panel-pet').eq(i).find('button').text('Already  Claim').attr('disabled', true);
                } else {
                    $('.panel-pet').eq(i).find('button').text('Claim').attr('disabled', false);
                }
                petsRow.append(petTemplate.html());
            }
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    // 添加商品
    AddGoods: function (event) {
        event.preventDefault();
        var goodName = $("#name").val();
        var goodImg = $("#img").val();
        var groceryInstance;
        console.log("AddGoods", goodName, goodImg);

        // 获取用户账号
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];
            App.contracts.Grocery.deployed().then(function (instance) {
                groceryInstance = instance;
                console.log("添加商品:", goodName, goodImg);
                return groceryInstance.AddGoods(goodName, goodImg, {from: account});
            }).then(function (result) {
                console.log("addGood: ", result);
                return App.refreshGoods();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },
    // 领取商品
    handleClaim: function (event) {
        event.preventDefault();
        var goodsId = parseInt($(event.target).data('id'));
        var groceryInstance;
        // 获取用户账号
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];
            App.contracts.Grocery.deployed().then(function (instance) {
                groceryInstance = instance;
                console.log("领取商品:", goodsId);
                return groceryInstance.Claim(goodsId, {from: account});
            }).then(function (result) {
                console.log("claim: ", result);
                return App.refreshGoods();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },
}


$(function () {
    $(window).load(function () {
        App.init();
    });
});
