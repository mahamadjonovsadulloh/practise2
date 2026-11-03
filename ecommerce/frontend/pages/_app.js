import '../styles/globals.css';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>NovaStore — Full-Stack E-Commerce</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Modern Full-Stack E-Commerce platform built with Express, MongoDB Atlas, and Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </>
  );
}

