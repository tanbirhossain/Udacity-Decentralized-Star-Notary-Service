const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfowner1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfowner1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfowner1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfowner1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfowner1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfowner1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfowner2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfowner2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests
it('has correct Token Name and Token Symbol', async() => {
    // Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let instance = await StarNotary.deployed(); // Making sure the Smart Contract is deployed and getting the instance.
    let tokenName = await instance.name.call(); // Calling the name property
    assert.equal(tokenName, "Star Token"); // Assert if the starName property was initialized correctly
    let tokenSymbol = await instance.symbol.call();
    assert.equal(tokenSymbol, "STR"); // Assert if the starName property was initialized correctly
});


it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let tokenId1 = 6;
    let tokenId2 = 7;
    // 1. create 2 Stars with different tokenId from 2 different accounts
    await instance.createStar('Awesome Star - 6!', tokenId1, {from: accounts[0]});
    await instance.createStar('Awesome Star - 7!', tokenId2, {from: accounts[1]});
    
    let owner1Before = await instance.ownerOf(tokenId1);
    let owner2Before = await instance.ownerOf(tokenId2);
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2);
    let owner1After = await instance.ownerOf(tokenId1);
    let owner2After = await instance.ownerOf(tokenId2);

    // 3. Verify that the owners changed
    assert.equal(owner1After, owner2Before);
    assert.equal(owner2After, owner1Before);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let tokenId = 8;
    await instance.createStar('Awesome Star - 8!', tokenId, {from: accounts[0]});
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(accounts[1], tokenId);
    // 3. Verify the star owner changed.
    let newOwner = await instance.ownerOf(tokenId)
    assert.equal(newOwner, accounts[1]);
  
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let tokenId = 9;
    await instance.createStar('Awesome Star - 9!', tokenId, {from: accounts[0]});
    // 2. Call your method lookUptokenIdToStarInfo
    let starName = await instance.lookUptokenIdToStarInfo(tokenId);
    // 3. Verify if you Star name is the same
    assert.equal(starName, 'Awesome Star - 9!');
});