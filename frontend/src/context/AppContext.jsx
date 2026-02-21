import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, setDoc, serverTimestamp, where, getDocs, writeBatch, updateDoc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, db } from '../config/firebase';

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
  const [authRoute, setAuthRoute] = useState('/dashboard');
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState({});
  const [jobApplicants, setJobApplicants] = useState({});
  const [jobApplicantsLoading, setJobApplicantsLoading] = useState({});
  const [workers] = useState(mockWorkers);
  const [identityVerified, setIdentityVerified] = useState(false);
  const confirmationResultRef = useRef(null);
  const applicantUnsubscribersRef = useRef({});

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

  const ensureRecaptchaContainer = () => {
    if (typeof window === 'undefined') return null;
    const existing = document.getElementById('recaptcha-container');
    if (existing) return existing;
    const container = document.createElement('div');
    container.id = 'recaptcha-container';
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.opacity = '0';
    document.body.appendChild(container);
    return container;
  };

  const getRecaptchaVerifier = () => {
    if (window.recaptchaVerifier) return window.recaptchaVerifier;

    const container = ensureRecaptchaContainer();
    if (!container) return null;

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      { size: 'invisible' }
    );

    return window.recaptchaVerifier;
  };

  const normalizePhoneNumber = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('+')) return trimmed;
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length > 10) return `+${digits}`;
    return null;
  };

  const verifyUserWithBackend = async (token) => {
    const response = await fetch('http://localhost:5050/auth/verify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('User verification failed');
    }

    const payload = await response.json();
    console.log('Auth verify-user response:', payload);
    return payload;
  };

  const sendOtp = async (phone, role) => {
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      toast.error('Enter a valid phone number');
      return;
    }
    try {
      const verifier = getRecaptchaVerifier();
      if (!verifier) {
        toast.error('reCAPTCHA unavailable');
        return;
      }
      const confirmationResult = await signInWithPhoneNumber(auth, normalizedPhone, verifier);
      confirmationResultRef.current = confirmationResult;
      window.confirmationResult = confirmationResult;
      console.log('Stored confirmationResult globally:', !!window.confirmationResult);
      setPendingUser({ phone: normalizedPhone, role });
      setOtpSent(true);
      toast.success('OTP sent');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpSent(false);
      toast.error('Failed to send OTP');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  const verifyOtp = async (otpInput) => {
    const otp = String(otpInput).trim();
    if (!otp) {
      toast.error('Enter OTP');
      return false;
    }
    console.log('OTP being verified:', otp);
    console.log('confirmationResult exists:', !!window.confirmationResult);
    if (!window.confirmationResult || !pendingUser) {
      toast.error('Please request OTP first');
      return false;
    }
    try {
      const result = await window.confirmationResult.confirm(otp);
      const token = await result.user.getIdToken();
      localStorage.setItem('kaamsetu_token', token);
      const backendData = await verifyUserWithBackend(token);
      const isIncompleteProfile = !backendData?.user?.role;

      const route = (backendData?.isNewUser || isIncompleteProfile)
        ? '/onboarding'
        : '/dashboard';
      console.log("Auth routing decision:", {
        isNewUser: backendData?.isNewUser,
        role: backendData?.user?.role,
        route
      });
      setAuthRoute(route);
      setUser(backendData?.user || pendingUser);
      setPendingUser(null);
      setOtpSent(false);
      toast.success('Logged in');
      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Incorrect OTP');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setPendingUser(null);
    setOtpSent(false);
    setAuthRoute('/dashboard');
    localStorage.removeItem('kaamsetu_token');
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

  const markJobCompleted = async (jobId, rating = null, review = null) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        ...(rating !== null && { rating }),
        ...(review && { review }),
      });

      // Sync worker rating to MongoDB so Profile.rating and reviewCount update
      const job = jobs.find((j) => j.id === jobId);
      const assignedWorkerId = job?.assignedWorkerId;
      if (rating !== null && assignedWorkerId) {
        try {
          const res = await fetch('http://localhost:5050/ratings/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firebaseUid: assignedWorkerId, rating: Number(rating) }),
          });
          if (!res.ok) {
            console.error('Failed to sync worker rating to backend', await res.text());
          }
        } catch (err) {
          console.error('Error syncing worker rating:', err);
        }
      }

      toast.success('Job marked as completed');
      return true;
    } catch (error) {
      console.error('Error completing job:', error);
      toast.error('Failed to complete job');
      return false;
    }
  };

  const applyToJob = async (jobId) => {
    if (!user) return false;
    const workerId = user.firebaseUid || user.phone;
    if (!workerId) {
      toast.error('Unable to identify worker');
      return false;
    }
    console.log('Applying job:', jobId);
    console.log('Worker:', user);
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return false;

    try {
      const applicationRef = doc(db, 'jobs', jobId, 'applications', String(workerId));
      const existingApplication = await getDoc(applicationRef);
      if (existingApplication.exists()) {
        setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
        toast.success('Already applied');
        return true;
      }

      await setDoc(applicationRef, {
        workerId,
        workerName: user.name || 'Worker',
        workerPhone: user.phone,
        appliedAt: serverTimestamp(),
        status: 'pending',
      });

      setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
      toast.success('Applied successfully');
      window.open(`https://wa.me/91${job.employerPhone}`, '_blank');
      return true;
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to apply');
      return false;
    }
  };

  const isJobApplied = (jobId) => Boolean(appliedJobs[jobId]);

  const subscribeToJobApplicants = (jobId) => {
    if (!jobId) return () => {};
    if (applicantUnsubscribersRef.current[jobId]) {
      return applicantUnsubscribersRef.current[jobId];
    }

    setJobApplicantsLoading((prev) => ({ ...prev, [jobId]: true }));
    const applicantsRef = collection(db, 'jobs', jobId, 'applications');
    const unsubscribe = onSnapshot(
      applicantsRef,
      (snapshot) => {
        const applicants = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setJobApplicants((prev) => ({ ...prev, [jobId]: applicants }));
        setJobApplicantsLoading((prev) => ({ ...prev, [jobId]: false }));
      },
      (error) => {
        console.error('Error fetching applicants:', error);
        setJobApplicantsLoading((prev) => ({ ...prev, [jobId]: false }));
        toast.error('Failed to load applicants');
      }
    );

    const wrappedUnsubscribe = () => {
      unsubscribe();
      delete applicantUnsubscribersRef.current[jobId];
    };

    applicantUnsubscribersRef.current[jobId] = wrappedUnsubscribe;
    return wrappedUnsubscribe;
  };

  const unsubscribeFromJobApplicants = (jobId) => {
    if (!jobId) return;
    const unsubscribe = applicantUnsubscribersRef.current[jobId];
    if (unsubscribe) {
      unsubscribe();
    }
  };

  const getJobApplicants = (jobId) => jobApplicants[jobId] || [];
  const isJobApplicantsLoading = (jobId) => Boolean(jobApplicantsLoading[jobId]);

  const assignWorkerToJob = async (jobId, applicant) => {
    if (!jobId || !applicant?.workerId) return false;

    try {
      const activeAssignedJobsQuery = query(
        collection(db, 'jobs'),
        where('assignedWorkerId', '==', applicant.workerId),
        where('status', '==', 'assigned')
      );
      const activeAssignedJobs = await getDocs(activeAssignedJobsQuery);
      const isAssignedElsewhere = activeAssignedJobs.docs.some((jobDoc) => jobDoc.id !== jobId);

      if (isAssignedElsewhere) {
        toast.error('Worker already assigned in another job');
        return false;
      }

      const applicants = getJobApplicants(jobId);
      const batch = writeBatch(db);
      const jobRef = doc(db, 'jobs', jobId);

      batch.update(jobRef, {
        status: 'assigned',
        assignedWorkerId: applicant.workerId,
        assignedWorkerName: applicant.workerName || 'Worker',
        assignedAt: serverTimestamp(),
      });

      applicants.forEach((item) => {
        const applicationRef = doc(db, 'jobs', jobId, 'applications', item.id);
        batch.update(applicationRef, {
          status: item.id === applicant.id ? 'accepted' : 'rejected',
        });
      });

      await batch.commit();
      toast.success('Worker assigned successfully');
      return true;
    } catch (error) {
      console.error('Error assigning worker:', error);
      toast.error('Failed to assign worker');
      return false;
    }
  };

  const verifyIdentity = () => {
    setIdentityVerified(true);
    toast.success('Aadhaar verified');
  };

  const completeOnboarding = () => {
    setAuthRoute('/dashboard');
  };

  const finalizeAuthSession = (nextUser, route) => {
    setUser(nextUser || null);
    setPendingUser(null);
    setOtpSent(false);
    setAuthRoute(route === '/onboarding' ? '/onboarding' : '/dashboard');
  };

  const value = {
    language,
    setLanguage,
    user,
    setUser,
    authRoute,
    otpSent,
    sendOtp,
    verifyOtp,
    completeOnboarding,
    finalizeAuthSession,
    logout,
    jobs,
    workers,
    topMatches,
    postJob,
    lockFee,
    disputeJob,
    markJobCompleted,
    applyToJob,
    subscribeToJobApplicants,
    unsubscribeFromJobApplicants,
    getJobApplicants,
    isJobApplicantsLoading,
    assignWorkerToJob,
    identityVerified,
    verifyIdentity,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);





