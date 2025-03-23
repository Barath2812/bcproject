import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { ethers } from 'ethers';
import VotingContract from '../contracts/VotingContract.json';

function Admin() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: [{ name: '' }]
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await axios.get('/api/elections');
      setElections(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load elections');
      setLoading(false);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      // Connect to the blockchain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Deploy the contract
      const factory = new ethers.ContractFactory(
        VotingContract.abi,
        VotingContract.bytecode,
        signer
      );
      
      const contract = await factory.deploy();
      await contract.waitForDeployment();
      
      const contractAddress = await contract.getAddress();
      
      // Create election in backend
      const response = await axios.post('/api/elections', {
        ...newElection,
        contractAddress,
        contractABI: VotingContract.abi
      });

      setElections([...elections, response.data]);
      setShowCreateForm(false);
      setNewElection({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        candidates: [{ name: '' }]
      });
    } catch (error) {
      setError(error.message || 'Failed to create election');
      console.error('Error creating election:', error);
    }
  };

  const addCandidate = () => {
    setNewElection(prev => ({
      ...prev,
      candidates: [...prev.candidates, { name: '' }]
    }));
  };

  const updateCandidate = (index, value) => {
    const updatedCandidates = [...newElection.candidates];
    updatedCandidates[index] = { name: value };
    setNewElection(prev => ({
      ...prev,
      candidates: updatedCandidates
    }));
  };

  const removeCandidate = (index) => {
    setNewElection(prev => ({
      ...prev,
      candidates: prev.candidates.filter((_, i) => i !== index)
    }));
  };

  const handleEndElection = async (electionId) => {
    try {
      const election = elections.find(e => e.id === electionId);
      if (!election) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        election.contractAddress,
        election.contractABI,
        signer
      );

      await contract.endElection(electionId);
      
      // Update election status in backend
      await axios.put(`/api/elections/${electionId}`, { status: 'completed' });

      await fetchElections();
    } catch (error) {
      setError(error.message || 'Failed to end election');
      console.error('Error ending election:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Election Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create New Election
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Election</h2>
          <form onSubmit={handleCreateElection}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newElection.title}
                  onChange={(e) => setNewElection(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newElection.description}
                  onChange={(e) => setNewElection(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="datetime-local"
                    value={newElection.startDate}
                    onChange={(e) => setNewElection(prev => ({ ...prev, startDate: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="datetime-local"
                    value={newElection.endDate}
                    onChange={(e) => setNewElection(prev => ({ ...prev, endDate: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Candidates</label>
                <div className="mt-2 space-y-2">
                  {newElection.candidates.map((candidate, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={candidate.name}
                        onChange={(e) => updateCandidate(index, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder={`Candidate ${index + 1}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeCandidate(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCandidate}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    + Add Candidate
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Create Election
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {elections.map((election) => (
            <li key={election.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {election.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {election.description}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Status: {new Date(election.endDate) > new Date() ? 'Active' : 'Completed'}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {new Date(election.endDate) > new Date() && (
                      <button
                        onClick={() => handleEndElection(election.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        End Election
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Admin; 