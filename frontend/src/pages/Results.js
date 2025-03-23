import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/axios';
import { BrowserProvider, Contract } from 'ethers';

function Results() {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch election details
        const electionResponse = await axios.get(`/api/elections/${electionId}`);
        setElection(electionResponse.data);

        // Get the voting contract instance
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(
          electionResponse.data.contractAddress,
          electionResponse.data.contractABI,
          provider
        );

        // Get results from blockchain
        const voteCounts = await contract.getResults();
        
        // Format results
        const formattedResults = electionResponse.data.candidates.map((candidate, index) => ({
          ...candidate,
          votes: Number(voteCounts[index])
        }));

        setResults(formattedResults);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError(error.message || 'Failed to load election results');
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Error</h2>
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  if (!election || !results) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">No Results Available</h2>
        <p className="mt-2 text-gray-600">The election results are not yet available.</p>
      </div>
    );
  }

  // Calculate total votes
  const totalVotes = results.reduce((sum, candidate) => sum + candidate.votes, 0);

  // Sort results by vote count
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {election.title} - Results
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {election.description}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {sortedResults.map((candidate, index) => {
                const percentage = totalVotes > 0 
                  ? ((candidate.votes / totalVotes) * 100).toFixed(1)
                  : 0;

                return (
                  <div key={candidate.id} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {index + 1}. {candidate.name}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {candidate.votes} votes ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Election Statistics</h4>
              <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="px-4 py-5 bg-gray-50 rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Votes Cast
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {totalVotes}
                  </dd>
                </div>
                <div className="px-4 py-5 bg-gray-50 rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Election Status
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {new Date(election.endDate) > new Date() ? 'Active' : 'Completed'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results; 