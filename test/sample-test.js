/* eslint-disable no-undef */
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('NFTMarket', () => {
  it('Should create and execute market sales', async () => {
    const Market = await ethers.getContractFactory('NFTMarket');
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory('NFT');
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftAddress = nft.address;

    const listingPrice = (await market.getListingPrice()).toString();
    const auctionPrice = ethers.utils.parseUnits('1', 'ether');

    await nft.createToken('https://www.mytokenlocation.com');
    await nft.createToken('https://www.mytokenlocation2.com');

    await market.createMarketItem(nftAddress, 1, auctionPrice, { value: listingPrice });
    await market.createMarketItem(nftAddress, 2, auctionPrice, { value: listingPrice });

    const buyerAddress = (await ethers.getSigners())[1];

    await market.connect(buyerAddress).createMarketSale(nftAddress, 1, { value: auctionPrice });

    const items = await Promise.all((await market.fetchMarketItems()).map(async (item) => {
      const tokenUri = await nft.tokenURI(item.tokenId);
      return {
        price: item.price.toString(),
        tokenId: item.tokenId.toString(),
        seller: item.seller,
        owner: item.owner,
        tokenUri,
      };
    }));

    console.log('items: ', items);
  });
});
