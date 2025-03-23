import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';

function Home() {
  const [activeElections, setActiveElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchActiveElections = async () => {
      try {
        const response = await axios.get('/api/elections/active');
        setActiveElections(response.data);
      } catch (error) {
        console.error('Failed to fetch active elections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveElections();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to University Voting System
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          A secure and transparent platform for student elections, powered by blockchain technology.
        </p>
      </div>

      <div className="mt-10">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Active Elections
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {loading ? (
              <div className="px-4 py-5 sm:p-6 text-center">
                Loading active elections...
              </div>
            ) : activeElections.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {activeElections.map((election) => (
                  <li key={election.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {election.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {election.description}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Ends: {new Date(election.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      {isAuthenticated && (
                        <div className="ml-4 flex-shrink-0">
                          <Link
                            to={`/vote/${election.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Vote Now
                          </Link>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No active elections at the moment.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Secure Voting</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your vote is encrypted and stored on the blockchain, ensuring transparency and preventing tampering.
            </p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Real-time Results</h3>
            <p className="mt-2 text-sm text-gray-500">
              View election results in real-time as votes are cast and verified on the blockchain.
            </p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Voter Privacy</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your identity is protected while ensuring each eligible voter can only vote once.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 