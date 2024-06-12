import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  DocumentTextIcon,
  CubeTransparentIcon,
} from '@heroicons/react/outline';

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const Starter = () => {
  const [parseHistoryUrl, setParseHistoryUrl] = useState<string>('');
  const [listOfTxs, setListOfTxs] = useState<any[]>([]);
  const [displayDetails, setDisplayDetails] = useState<boolean>(false);
  const [transactionDetails, setTransactionDetails] = useState<object>({});

  const { connection } = useConnection();
  const { publicKey } = useWallet();
  console.log('publicKey', publicKey);
  console.log('HELIUS_API_KEY', HELIUS_API_KEY);
  const parseTxHistory = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!connection || !publicKey) return toast.error('Please connect wallet');
    console.log('Url', parseHistoryUrl);
    try {
      const response = await fetch(parseHistoryUrl);
      const data = await response.json();
      setListOfTxs(data);
      console.log('data', data);
    } catch (error) {
      toast.error('Error getting data');
      return console.log('error', error);
    }
  };

  const handleTxDetails = (signature: string) => {
    const transaction = listOfTxs.find((tx) => tx.signature === signature);
    setTransactionDetails(transaction);
    setDisplayDetails(true);
  };

  useEffect(() => {
    setParseHistoryUrl(
      `https://api.helius.xyz/v0/addresses/${publicKey}/transactions?api-key=${HELIUS_API_KEY}`
    );
  }, [connection, publicKey]);

  return (
    <main className='max-w-7xl grid grid-cols-1 sm:grid-cols-6 gap-4 p-4 text-white'>
      <TransactionDetails
        transactionDetails={transactionDetails}
        displayDetails={displayDetails}
        setDisplayDetails={setDisplayDetails}
      />
      <form
        onSubmit={(event) => parseTxHistory(event)}
        className='rounded-lg min-h-content bg-[#2a302f] p-4 sm:col-span-6 lg:col-start-2 lg:col-end-6'
      >
        <div className='flex justify-between items-center'>
          <h2 className='text-lg sm:text-2xl font-semibold'>
            Transaction Viewer 👀
          </h2>
          <button
            type='submit'
            className='bg-helius-orange rounded-lg py-1 sm:py-2 px-4 font-semibold transition-all duration-200 border-2 border-transparent hover:border-helius-orange disabled:opacity-50 disabled:hover:bg-helius-orange hover:bg-transparent disabled:cursor-not-allowed'
          >
            Call Transactions
          </button>
        </div>

        {listOfTxs.length > 0 && (
          <div className='text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2'>
            <ul className='p-2'>
              {listOfTxs.map(({ signature }, index) => (
                <li
                  key={signature}
                  className={`flex justify-between items-center ${
                    index !== 0 && 'mt-4'
                  }`}
                >
                  <p className='tracking-wider'>Transaction:</p>
                  <button
                    className='flex text-[#80ebff] italic hover:text-white transition-all duration-200'
                    onClick={() => handleTxDetails(signature)}
                  >
                    {signature.slice(0, 14)}...
                    <DocumentTextIcon className='w-5 ml-1' />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </main>
  );
};

type TransactionDetailsProps = {
  transactionDetails: any; // Consider defining a more specific type
  displayDetails: boolean;
  setDisplayDetails: (displayDetails: boolean) => void; // Adjust as needed
};

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transactionDetails,
  displayDetails,
  setDisplayDetails,
}) => {
  return (
    <Transition.Root show={displayDetails} as={React.Fragment}>
      <Dialog as='div' className='relative z-10' onClose={setDisplayDetails}>
        <Transition.Child
          as={React.Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity' />
        </Transition.Child>

        <div className='fixed z-10 inset-0 overflow-y-auto'>
          <div className='flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0'>
            <Transition.Child
              as={React.Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative bg-zinc-200 rounded-lg px-4 text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6'>
                <div>
                  <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#eebcb2] border-2 border-[#e44a2a]'>
                    <CubeTransparentIcon
                      className='h-6 w-6 text-helius-orange'
                      aria-hidden='true'
                    />
                  </div>
                  <div className='text-center mt-3'>
                    <Dialog.Title
                      as='h3'
                      className='text-lg leading-6 font-medium text-gray-900'
                    >
                      Scroll to view transaction details
                    </Dialog.Title>
                    <div className='mt-4 text-left h-40 overflow-scroll rounded-lg px-2 pb-2 border-2 border-zinc-300/100'>
                      {Object.entries(transactionDetails).map(
                        ([key, value], index) =>
                          ((value !== null && typeof value !== 'object') ||
                            !Array.isArray(value)) && (
                            <p key={index}>
                              <div className='group border-2 border-[#e49f91] bg-[#eebcb2] rounded-md my-4 p-2'>
                                <div className='flex justify-between items-center'>
                                  <p className='font-bold'>{key}:</p>
                                  <div className='flex items-center'>
                                    <span className='font-bold'>
                                      {value !== null
                                        ? typeof value === 'string' ||
                                          typeof value === 'number'
                                          ? value.toString().length > 10
                                            ? `${value
                                                .toString()
                                                .slice(0, 10)}...`
                                            : value
                                          : 'Not Available'
                                        : 'Not Available'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </p>
                          )
                      )}
                    </div>
                  </div>
                </div>
                <div className='mt-5 sm:mt-6'>
                  <button
                    type='button'
                    className='inline-flex justify-center w-full rounded-md border-2 border-black shadow-sm px-4 py-2 bg-black hover:bg-zinc-800 text-base font-medium text-white sm:text-sm transition-all duration-200'
                    onClick={() => setDisplayDetails(false)}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Starter;
