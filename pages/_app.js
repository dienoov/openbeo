import '../styles/globals.css';
import Link from 'next/link';
import Blockies from 'react-blockies';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <nav className="border-b border-neutral-400 px-2 py-4">
        <div className="w-full flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold">
            <Link href="/">openbeo</Link>
          </h1>
          <div className="flex items-center">
            <ul className="flex uppercase mr-8">
              <li className="mx-4 my-2 text-neutral-400 hover:text-white transition">
                <Link href="/">Explore</Link>
              </li>
              <li className="mx-4 my-2 text-neutral-400 hover:text-white transition">
                <Link href="/">Create</Link>
              </li>
            </ul>
            <Blockies seed={Math.random().toString()} className="rounded-full" />
          </div>
        </div>
      </nav>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
