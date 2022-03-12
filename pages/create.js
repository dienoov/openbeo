import { Component } from 'react';
import Router from 'next/router';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { create } from 'ipfs-http-client';
import { nftAddress, nftMarketAddress } from '../address';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

const ipfs = create('https://ipfs.infura.io:5001/api/v0');

export default class Create extends Component {
  constructor(props) {
    super(props);

    this.state = {
      file: null,
      form: {
        name: '',
        description: '',
        price: '',
      },
    };
  }

  onChangeInput(ev) {
    const { form } = this.state;
    form[ev.target.id] = ev.target.value;

    this.setState({ form });
  }

  async onChangeFile(ev) {
    const file = ev.target.files[0];

    try {
      const result = await ipfs.add(file, { progress: (prog) => console.log(prog) });
      this.setState({ file: `https://ipfs.infura.io/ipfs/${result.path}` });
    } catch (e) {
      console.error(e);
    }
  }

  async onSubmit(ev) {
    ev.preventDefault();

    const { file, form: { name, description, price } } = this.state;

    if (!name || !description || !price || !file) return;

    const data = JSON.stringify({
      name, description, price, image: file,
    });

    try {
      const result = await ipfs.add(data);
      const url = `https://ipfs.infura.io/ipfs/${result.path}`;
      this.createSale(url);
    } catch (e) {
      console.error(e);
    }
  }

  async createSale(url) {
    const { form: { price } } = this.state;

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    const tx = await transaction.wait();

    const [event] = tx.events;
    const value = event.args[2];
    const tokenId = value.toNumber();

    const ether = ethers.utils.parseUnits(price.toString(), 'ether');

    contract = new ethers.Contract(nftMarketAddress, Market.abi, signer);
    const listingPrice = (await contract.getListingPrice()).toString();

    transaction = await contract.createMarketItem(
      nftAddress,
      tokenId,
      ether,
      { value: listingPrice },
    );
    await transaction.wait();

    Router.push('/');
  }

  render() {
    return (
      <form className="w-full max-w-xl mx-auto my-6" onSubmit={this.onSubmit.bind(this)}>
        <label htmlFor="name" className="block mb-4">
          <span className="block mb-2">Name</span>
          <input type="text" id="name" placeholder="Name..." className="w-full rounded p-2 text-black" onChange={this.onChangeInput.bind(this)} required />
        </label>
        <label htmlFor="description" className="block mb-4">
          <span className="block mb-2">Description</span>
          <input type="text" id="description" placeholder="Description..." className="w-full rounded p-2 text-black" onChange={this.onChangeInput.bind(this)} required />
        </label>
        <label htmlFor="price" className="block mb-4">
          <span className="block mb-2">Price</span>
          <input type="number" step="any" id="price" placeholder="Price..." className="w-full rounded p-2 text-black" onChange={this.onChangeInput.bind(this)} required />
        </label>
        <label htmlFor="file" className="block mb-4">
          <span className="block mb-2">File</span>
          <input type="file" id="file" className="w-full rounded mb-2 file:px-4 file:py-2 file:rounded file:border-0 file:mr-4 file:text-sm file:font-semibold file:cursor-pointer" onChange={this.onChangeFile.bind(this)} />
        </label>
        <button type="submit" className="w-full p-2 bg-white text-black rounded border font-semibold">Submit</button>
      </form>
    );
  }
}
