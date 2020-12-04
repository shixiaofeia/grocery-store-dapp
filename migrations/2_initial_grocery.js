const Grocery = artifacts.require("Grocery");

module.exports = function (deployer) {
    deployer.deploy(Grocery);
};
