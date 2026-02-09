import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const AppContext = createContext();

const mockWorkers = [
  {
    id: 'w1',
    name: 'Ramesh Kumar',
    skill: 'Mason',
    rating: 4.7,
    reliability: 95,
    location: 'Saket, Delhi',
    phone: '9876543210',
    minPay: 650,
    reviews: [
      { by: 'Site Lead', text: 'On-time, clean finishing.', score: 5 },
      { by: 'Contractor', text: 'Handled extra tasks smoothly.', score: 4.5 },
    ],
    verified: true,
  },
  {
    id: 'w2',
    name: 'Sunita Devi',
    skill: 'Painter',
    rating: 4.8,
    reliability: 92,
    location: 'Noida Sec-62',
    phone: '9822001100',
    minPay: 700,
    reviews: [
      { by: 'Homeowner', text: 'Great with colors & clean-up.', score: 5 },
      { by: 'Architect', text: 'Professional and quick.', score: 4.6 },
    ],
    verified: true,
  },
  {
    id: 'w3',
    name: 'Akash Yadav',
    skill: 'Electrician',
    rating: 4.5,
    reliability: 90,
    location: 'Gurgaon Cybercity',
    phone: '9810098100',
    minPay: 800,
    reviews: [
      { by: 'Cafe Owner', text: 'Solved wiring fast.', score: 4.5 },
      { by: 'Office Admin', text: 'Explained safety well.', score: 4.4 },
    ],
    verified: false,
  },
];

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [user, setUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [workers] = useState(mockWorkers);
  const [identityVerified, setIdentityVerified] = useState(false);

  // Listen to jobs collection in real-time
  useEffect(() => {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobsData);
    }, (error) => {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    });

    return () => unsubscribe();
  }, []);

  const sendOtp = (phone, role) => {
    if (!phone) return toast.error('Enter phone number');
    setPendingUser({ phone, role });
    setOtpSent(true);
    toast.success('OTP sent (1234)');
  };

  const verifyOtp = (code) => {
    if (code === '1234' && pendingUser) {
      setUser(pendingUser);
      setOtpSent(false);
      toast.success('Logged in');
      return true;
    }
    toast.error('Incorrect OTP');
    return false;
  };

  const logout = () => {
    setUser(null);
    setPendingUser(null);
    setOtpSent(false);
  };

  const topMatches = useMemo(
    () => workers.slice().sort((a, b) => b.reliability - a.reliability).slice(0, 3),
    [workers],
  );

  const postJob = async ({ title, pay, location }) => {
    if (!user) return;
    try {
      const newJob = {
        title,
        pay: Number(pay),
        location,
        status: 'open',
        employerPhone: user.phone,
        createdAt: new Date(),
      };
      const docRef = await addDoc(collection(db, 'jobs'), newJob);
      toast.success('Job posted');
      return { id: docRef.id, ...newJob };
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job');
      return null;
    }
  };

  const lockFee = (jobId) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: 'booked', assignedWorker: topMatches[0] } : j,
      ),
    );
    toast.success('Payment successful, worker booked');
  };

  const disputeJob = (jobId, reason = 'No show') => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'dispute', disputeReason: reason } : j)));
    toast.success('Dispute submitted');
  };

  const applyToJob = (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    window.open(`https://wa.me/91${job.employerPhone}`, '_blank');
  };

  const verifyIdentity = () => {
    setIdentityVerified(true);
    toast.success('Aadhaar verified');
  };

  const value = {
    language,
    setLanguage,
    user,
    otpSent,
    sendOtp,
    verifyOtp,
    logout,
    jobs,
    workers,
    topMatches,
    postJob,
    lockFee,
    disputeJob,
    applyToJob,
    identityVerified,
    verifyIdentity,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);





