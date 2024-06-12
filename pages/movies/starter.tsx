import * as React from 'react';
import * as web3 from '@solana/web3.js';
import * as borsh from '@project-serum/borsh';
import { toast } from 'react-toastify';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ExternalLinkIcon } from '@heroicons/react/outline';

const Starter = () => {
  const [rating, setRating] = React.useState<number | 0>(0);
  const [description, setDescription] = React.useState<string>('');
  const [title, setTitle] = React.useState<string>('');
  const [txSig, setTxSig] = React.useState<string>('');

  const programId = new web3.PublicKey(
    'GWenWxNqXEEM4Cue4jRoYrGuyGb3FTAGu4fZGSwpMU5P'
  );

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // these items need to be in a specific order or it fails
  const movieReviewLayout = borsh.struct([
    borsh.u8('variant'),
    borsh.str('title'),
    borsh.u8('rating'),
    borsh.str('description'),
  ]);

  const sendMovieReview = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!publicKey || !connection) {
      return toast.error('Please connect wallet');
    }

    let buffer = Buffer.alloc(1000);
    const movieTitle = `${title} - (${(Math.random() * 100000000)
      .toString()
      .slice(0, 4)})`;

    movieReviewLayout.encode(
      { variant: 0, title: movieTitle, rating, description },
      buffer
    );

    buffer = buffer.slice(0, movieReviewLayout.getSpan(buffer));

    const [pda] = await web3.PublicKey.findProgramAddress(
      [publicKey!.toBuffer(), Buffer.from(movieTitle)],
      programId
    );

    const transaction = new web3.Transaction();

    const instruction = new web3.TransactionInstruction({
      programId,
      data: buffer,
      keys: [
        {
          pubkey: publicKey,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: pda,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
    });

    transaction.add(instruction);

    try {
      const signature = await sendTransaction(transaction, connection);
      setTxSig(signature);
      toast.success('Success');
    } catch (error) {
      toast.error('Failed');
      throw error;
    } finally {
      setDescription('');
      setRating(0);
      setTitle('');
    }
  };

  const outputs = [
    {
      title: 'Transaction Signature...',
      dependency: txSig,
      href: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
    },
  ];

  return (
    <main className='min-h-screen text-white max-w-7xl'>
      <section className='grid grid-cols-1 sm:grid-cols-6 gap-4 p-4'>
        <form className='rounded-lg min-h-content p-4 bg-[#2a302f] sm:col-span-6 lg:col-start-2 lg:col-end-6'>
          <div className='flex justify-between items-center'>
            <h2 className='font-bold text-2xl text-helius-orange'>
              Movie Review 🎬
            </h2>
            <button
              disabled={!title || !description || !rating}
              onClick={(event) => sendMovieReview(event)}
              className='disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-helius-orange bg-helius-orange rounded-lg w-24 py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-helius-orange'
            >
              Submit
            </button>
          </div>

          <div className='mt-6'>
            <h3 className='italic text-sm'>What is the name of the movie?</h3>
            <input
              id='title'
              type='text'
              placeholder='Movie title'
              className='text-[#9e80ff] py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white'
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          </div>

          <div className='mt-6'>
            <h3 className='italic text-sm'>
              A brief description of the movie?
            </h3>
            <input
              id='description'
              type='text'
              placeholder='Movie description'
              className='text-[#9e80ff] py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white'
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </div>

          <div className='mt-6'>
            <h3 className='italic text-sm'>What is the movie rating?</h3>
            <input
              id='rating'
              type='number'
              max={5}
              min={0}
              placeholder='Movie rating'
              className='text-[#9e80ff] py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white'
              onChange={(event) => setRating(parseInt(event.target.value))}
              value={rating}
            />
          </div>
          <div className='text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2'>
            <ul className='p-2'>
              {outputs.map(({ title, dependency, href }, index) => (
                <li
                  key={title}
                  className={`flex justify-between items-center ${
                    index !== 0 && 'mt-4'
                  }`}
                >
                  <p className='tracking-wider'>{title}</p>
                  {dependency && (
                    <a
                      href={href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex text-[#80ebff] italic hover:text-white transition-all duration-200'
                    >
                      {dependency.toString().slice(0, 25)}...
                      <ExternalLinkIcon className='w-5 ml-1' />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Starter;
