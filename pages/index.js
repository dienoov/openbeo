import Blockies from 'react-blockies';
import { Component } from 'react';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cards: [],
      skeletons: [],
      isLoading: true,
    };
  }

  componentDidMount() {
    const skeletons = [];
    const cards = [];

    for (let i = 0; i < 8; i += 1) {
      skeletons.push((
        <div className="rounded-2xl overflow-hidden bg-neutral-700">
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
                <div className="rounded-full w-16 h-8 bg-neutral-600" />
              </div>
            </div>
          </div>
        </div>
      ));

      cards.push((
        <div className="rounded-2xl overflow-hidden bg-neutral-700">
          <div className="h-48 flex justify-center items-center overflow-hidden">
            <Blockies seed={Math.random().toString()} scale={64} />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{Math.random().toString(36).substring(2)}</h3>
              <Blockies seed={Math.random().toString()} className="rounded-full" />
            </div>
            <div className="flex justify-between items-center mt-6">
              <span>{`${Math.random().toFixed(3)} ETH`}</span>
              <button
                type="button"
                className="rounded-full border border-neutral-400 px-4 py-1 font-semibold
                hover:bg-blue-600 hover:border-blue-600 transition"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      ));
    }

    this.setState({ cards, skeletons });

    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 1000);
  }

  render() {
    const { cards, skeletons, isLoading } = this.state;

    return (
      <div className="px-3 py-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {isLoading ? skeletons : cards}
          </div>
        </div>
      </div>
    );
  }
}
