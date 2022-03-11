import Blockies from 'react-blockies';
import { Component } from 'react';
import Image from 'next/image';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import axios from 'axios';
import { nftAddress, nftMarketAddress } from '../address';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nfts: [],
      skeletons: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    const skeletons = [];

    for (let i = 0; i < 8; i += 1) {
      skeletons.push((
        <div className="rounded-2xl overflow-hidden bg-neutral-700" key={i}>
          <div className="animate-pulse">
            <div className="wfull h-48 bg-neutral-600" />
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="rounded w-32 max-w-full h-4 bg-neutral-600" />
                  <div className="rounded w-24 max-w-full h-4 bg-neutral-600 mt-2" />
                </div>
                <div className="rounded-full w-8 h-8 bg-neutral-600" />
              </div>
              <div className="flex justify-between items-center mt-6">
                <div className="rounded w-16 h-4 bg-neutral-600" />
                <div className="rounded-full w-20 h-8 bg-neutral-600" />
              </div>
            </div>
          </div>
        </div>
      ));
    }

    this.setState({ skeletons });

    await this.loadNFTs();
  }

  async loadNFTs() {
    this.setState({ isLoading: true });

    const provider = new ethers.providers.JsonRpcProvider();
    const nftContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftMarketAddress, Market.abi, provider);

    const data = await marketContract.fetchMarketItems();
    const items = await Promise.all(data.map(async (item) => {
      const tokenUri = await nftContract.tokenURI(item.tokenId);
      const meta = await axios.get(tokenUri);
      const price = ethers.utils.parseUnits(item.price.toString(), 'ether');

      return {
        price,
        tokenId: item.tokenId.toNumber(),
        seller: item.seller,
        owner: item.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      };
    }));

    this.setState({ nfts: items, isLoading: false });
  }

  async buyNFT(nft) {
    const web3Modal = new Web3Modal();
    await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider();

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftMarketAddress, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    const transaction = await contract.createMarketSale(nftAddress, nft.tokenId, { value: price });
    await transaction.wait();
    this.loadNFTs();
  }

  render() {
    const { nfts, skeletons, isLoading } = this.state;

    return (
      <div className="px-3 py-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {isLoading || !nfts.length ? skeletons : nfts.map((nft) => (
              <div className="rounded-2xl overflow-hidden bg-neutral-700" key={nft.tokenId}>
                <div className="h-48 flex justify-center items-center overflow-hidden">
                  <Image src={nft.image} alt={nft.name} />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{nft.name}</h3>
                    <Blockies seed={Math.random().toString()} className="rounded-full" />
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <span>{`${nft.price} ETH`}</span>
                    <button
                      type="button"
                      className="rounded-full border border-neutral-400 px-6 py-1 font-semibold
                        hover:bg-blue-600 hover:border-blue-600 transition"
                      onClick={this.buyNFT(nft)}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
