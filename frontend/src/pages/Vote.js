import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { ethers } from 'ethers';

function Vote() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const response = await axios.get(`/api/elections/${electionId}`);
        setElection(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load election details');
        setLoading(false);
      }
    };

    fetchElection();
  }, [electionId]);

  const handleVote = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Check if user has already voted
      const hasVoted = await axios.get(`/api/elections/${electionId}/has-voted`);
      if (hasVoted.data.hasVoted) {
        setError('You have already voted in this election');
        return;
      }

      // Get the voting contract instance
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        election.contractAddress,
        election.contractABI,
        signer
      );

      // Submit vote to blockchain
      const tx = await contract.vote(selectedCandidate);
      await tx.wait();

      // Record vote in backend
      await axios.post(`/api/elections/${electionId}/vote`, {
        candidateId: selectedCandidate,
        transactionHash: tx.hash
      });

      navigate('/results');
    } catch (error) {
      console.error('Voting error:', error);
      setError(error.message || 'Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Election not found</h2>
        <p className="mt-2 text-gray-600">The election you're looking for doesn't exist or has ended.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {election.title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {election.description}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <form onSubmit={handleVote}>
            <fieldset>
              <legend className="text-base font-medium text-gray-900">
                Select your candidate
              </legend>
              <div className="mt-4 space-y-4">
                {election.candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center">
                    <input
                      id={candidate.id}
                      name="candidate"
                      type="radio"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      value={candidate.id}
                      checked={selectedCandidate === candidate.id}
                      onChange={(e) => setSelectedCandidate(e.target.value)}
                    />
                    <label
                      htmlFor={candidate.id}
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      {candidate.name}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            {error && (
              <div className="mt-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting Vote...' : 'Submit Vote'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Vote; 