import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
  Phone,
  Lock,
  CheckCircle,
  Shield,
  MapPin,
  Wallet,
  Sparkles,
  Users,
  IndianRupee,
  BadgeCheck,
  ChevronRight,
  Home,
  Briefcase,
  User,
  ShieldCheck,
  ScanLine,
  Languages,
  MessageCircle,
  AlertTriangle,
  LogOut,
  Star,
  Clock,
  Award,
} from 'lucide-react';
import { useApp } from './context/AppContext';
import { Button, Card, Modal } from './components/UI';
import WorkerOnboarding from './pages/WorkerOnboarding';
import EmployerOnboarding from './pages/onboarding/EmployerOnboarding';
import { db } from './config/firebase';

const TEXT = {
  en: {
    brand: 'KaamSetu',
    tagline: 'Trusted daily wage talent, on-demand.',
    phone: 'Phone Number',
    otp: 'Enter OTP (1234)',
    login: 'Login',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify & Continue',
    worker: 'Worker',
    employer: 'Employer',
    verifyIdentity: 'Verify Identity',
    postedJobs: 'Posted Jobs',
    lockFee: 'Pay ₹10 & Lock',
    dispute: 'Dispute',
    apply: 'Apply on WhatsApp',
  },
  hi: {
    brand: 'कामसेतु',
    tagline: 'भरोसेमंद दैनिक मजदूर, तुरंत उपलब्ध',
    phone: 'फ़ोन नंबर',
    otp: 'ओटीपी दर्ज करें (1234)',
    login: 'लॉगिन',
    sendOtp: 'ओटीपी भेजें',
    verifyOtp: 'सत्यापित करें',
    worker: 'मज़दूर',
    employer: 'नियोक्ता',
    verifyIdentity: 'पहचान सत्यापित करें',
    postedJobs: 'पोस्ट की गई नौकरियां',
    lockFee: '₹10 भुगतान करें',
    dispute: 'शिकायत',
    apply: 'व्हाट्सएप पर आवेदन',
  },
};

const StatusPill = ({ status }) => {
  const style = {
    open: 'bg-amber-50 text-amber-700 border border-amber-200',
    booked: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dispute: 'bg-red-50 text-red-700 border border-red-200',
  }[status];
  const label = { open: 'Open', booked: 'Booked', dispute: 'Dispute' }[status] || status;
  return <span className={`px-3 py-1 text-xs rounded-full font-semibold ${style}`}>{label}</span>;
};

const LoginView = React.memo(({ 
  phone, 
  otp, 
  role, 
  otpSent, 
  t, 
  language,
  onPhoneChange, 
  onOtpChange, 
  onRoleChange, 
  onSendOtp, 
  onVerifyOtp, 
  onLanguageToggle 
}) => {
  const phoneInputRef = useRef(null);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (otpSent && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [otpSent]);

  const Header = useMemo(() => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-xs text-slate-500">{t.tagline}</p>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles size={18} className="text-orange-500" />
          {t.brand}
        </h1>
      </div>
      <Button
        variant="subtle"
        icon={Languages}
        onClick={onLanguageToggle}
        className="!px-3 !py-2"
      >
        {language === 'en' ? 'हिंदी' : 'English'}
      </Button>
    </div>
  ), [t.tagline, t.brand, language, onLanguageToggle]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-4">
      {Header}
      <Card className="p-5">
        <div className="flex gap-2 mb-4">
          <Button variant={role === 'worker' ? 'primary' : 'ghost'} fullWidth onClick={() => onRoleChange('worker')}>
            {t.worker}
          </Button>
          <Button variant={role === 'employer' ? 'primary' : 'ghost'} fullWidth onClick={() => onRoleChange('employer')}>
            {t.employer}
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500">{t.phone}</label>
            <div className="flex items-center gap-2 mt-1 bg-slate-100 rounded-xl px-3">
              <Phone size={16} className="text-slate-400" />
              <input
                ref={phoneInputRef}
                type="tel"
                className="w-full bg-transparent py-3 outline-none font-semibold"
                placeholder="9876543210"
                value={phone}
                onChange={onPhoneChange}
                autoComplete="tel"
              />
            </div>
          </div>
          {!otpSent && (
            <Button fullWidth onClick={onSendOtp} icon={Lock}>
              {t.sendOtp}
            </Button>
          )}
          {otpSent && (
            <>
              <div>
                <label className="text-xs text-slate-500">{t.otp}</label>
                <input
                  ref={otpInputRef}
                  type="text"
                  maxLength={6}
                  className="w-full border rounded-xl px-4 py-3 font-semibold mt-1"
                  placeholder="123456"
                  value={otp}
                  onChange={onOtpChange}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>
              <Button 
                fullWidth 
                onClick={onVerifyOtp} 
                icon={CheckCircle}
              >
                {t.verifyOtp}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
});

LoginView.displayName = 'LoginView';

export default function App() {
  const {
    language,
    setLanguage,
    user,
    authRoute,
    otpSent,
    sendOtp,
    verifyOtp,
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
  } = useApp();

  const [activeTab, setActiveTab] = useState('home');
  const [role, setRole] = useState('worker');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [appliedJobs, setAppliedJobs] = useState({});
  const [postModal, setPostModal] = useState(false);
  const [paymentJob, setPaymentJob] = useState(null);
  const [workerModal, setWorkerModal] = useState(null);
  const [applicantsJobId, setApplicantsJobId] = useState(null);
  const [disputeJobId, setDisputeJobId] = useState(null);
  const [justPostedJob, setJustPostedJob] = useState(null);
  const [completingJobId, setCompletingJobId] = useState(null);
  const [activeAssignedJob, setActiveAssignedJob] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [jobToComplete, setJobToComplete] = useState(null);

  // Reset form when user logs out
  useEffect(() => {
    if (!user) {
      setPhone('');
      setOtp('');
      setRole('worker');
      setAppliedJobs({});
      setActiveAssignedJob(null);
      setActiveTab('home');
    } else {
      // Reset to home when user logs in
      setActiveTab('home');
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'worker') {
      setActiveAssignedJob(null);
      return;
    }

    const currentUserId = user.firebaseUid || user.phone || user._id;
    if (!currentUserId) {
      setActiveAssignedJob(null);
      return;
    }

    const assignedJobQuery = query(
      collection(db, 'jobs'),
      where('assignedWorkerId', '==', currentUserId),
      where('status', '==', 'assigned')
    );

    const unsubscribe = onSnapshot(
      assignedJobQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setActiveAssignedJob(null);
          return;
        }
        const firstAssignedJob = snapshot.docs[0];
        setActiveAssignedJob({ id: firstAssignedJob.id, ...firstAssignedJob.data() });
      },
      (error) => {
        console.error('Error fetching assigned job:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const t = TEXT[language];
  const onboardingRole = user?.role || role;

  const employerJobs = useMemo(() => jobs.filter((j) => j.employerPhone === user?.phone), [jobs, user]);
  const openJobs = useMemo(() => jobs.filter((j) => j.status === 'open'), [jobs]);

  const handlePhoneChange = useCallback((e) => {
    setPhone(e.target.value);
  }, []);

  const handleOtpChange = useCallback((e) => {
    setOtp(e.target.value.replace(/\D/g, ''));
  }, []);

  const handleRoleChange = useCallback((newRole) => {
    setRole(newRole);
  }, []);

  const handleLanguageToggle = useCallback(() => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  }, [language]);

  const handleOnboardingSuccess = useCallback(async () => {
    const token = localStorage.getItem('kaamsetu_token');
    if (!token) return;

    const res = await fetch('/auth/verify-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    finalizeAuthSession(data.user, '/dashboard');
  }, [finalizeAuthSession]);

  const handleApplyToJob = useCallback(async (jobId) => {
    const applied = await applyToJob(jobId);
    if (applied) {
      setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
    }
  }, [applyToJob]);

  const handleMarkCompleted = useCallback((jobId) => {
    setJobToComplete(jobId);
    setShowRatingModal(true);
  }, []);

  const handleSubmitRating = useCallback(async () => {
    if (!jobToComplete) return;
    setCompletingJobId(jobToComplete);
    await markJobCompleted(jobToComplete, selectedRating || null, reviewText || null);
    setCompletingJobId(null);
    setShowRatingModal(false);
    setJobToComplete(null);
    setSelectedRating(0);
    setReviewText('');
  }, [jobToComplete, selectedRating, reviewText, markJobCompleted]);

  const handleOpenApplicants = useCallback((jobId) => {
    subscribeToJobApplicants(jobId);
    setApplicantsJobId(jobId);
  }, [subscribeToJobApplicants]);

  const handleCloseApplicants = useCallback(() => {
    if (applicantsJobId) {
      unsubscribeFromJobApplicants(applicantsJobId);
    }
    setApplicantsJobId(null);
  }, [applicantsJobId, unsubscribeFromJobApplicants]);

  const handleAssignApplicant = useCallback(async (applicant) => {
    if (!applicantsJobId) return;
    await assignWorkerToJob(applicantsJobId, applicant);
  }, [applicantsJobId, assignWorkerToJob]);

  const formatAppliedDate = useCallback((appliedAt) => {
    if (!appliedAt) return 'Not available';
    const date = typeof appliedAt?.toDate === 'function'
      ? appliedAt.toDate()
      : new Date(appliedAt);
    if (Number.isNaN(date.getTime())) return 'Not available';
    return date.toLocaleString('en-IN');
  }, []);

  const formatAssignedDate = useCallback((assignedAt) => {
    if (!assignedAt) return 'Not available';
    const date = typeof assignedAt?.toDate === 'function'
      ? assignedAt.toDate()
      : new Date(assignedAt);
    if (Number.isNaN(date.getTime())) return 'Not available';
    return date.toLocaleString('en-IN');
  }, []);

  const selectedApplicantsJob = useMemo(
    () => jobs.find((job) => job.id === applicantsJobId),
    [jobs, applicantsJobId]
  );

  const Stat = ({ icon: Icon, label, value, sub }) => (
    <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
      <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-semibold text-slate-900">{value}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );

  const WorkerProfile = ({ worker }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center">
          {worker.name[0]}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{worker.name}</p>
          <p className="text-xs text-slate-500">{worker.skill} • {worker.location}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={BadgeCheck} label="Rating" value={worker.rating} />
        <Stat icon={ShieldCheck} label="Reliability" value={`${worker.reliability}%`} />
        <Stat icon={IndianRupee} label="Min/day" value={`₹${worker.minPay}`} />
      </div>
      <div className="bg-slate-50 rounded-xl p-3">
        <p className="text-sm font-semibold mb-2 text-slate-800">Reviews</p>
        <div className="space-y-2">
          {worker.reviews.map((r, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-lg p-2">
              <p className="text-sm text-slate-800">{r.text}</p>
              <p className="text-[11px] text-slate-500">— {r.by} • {r.score}⭐</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SmartMatches = () => (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">Smart Match (nearby & reliable)</p>
      {topMatches.map((w) => (
        <button
          key={w.id}
          onClick={() => setWorkerModal(w)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between hover:border-orange-300"
        >
          <div>
            <p className="font-semibold text-slate-900">{w.name}</p>
            <p className="text-xs text-slate-500">{w.skill} • {w.location}</p>
          </div>
          <div className="text-right text-xs text-emerald-600 font-semibold">
            {w.rating}⭐<br />{w.reliability}% reliable
          </div>
        </button>
      ))}
    </div>
  );

  const HeaderComponent = () => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-xs text-slate-500">{t.tagline}</p>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles size={18} className="text-orange-500" />
          {t.brand}
        </h1>
      </div>
      <Button
        variant="subtle"
        icon={Languages}
        onClick={handleLanguageToggle}
        className="!px-3 !py-2"
      >
        {language === 'en' ? 'हिंदी' : 'English'}
      </Button>
    </div>
  );

  const EmployerDashboard = () => (
    <div className="space-y-4 pb-24">
      <HeaderComponent />
      <div className="flex gap-3">
        <Stat icon={Briefcase} label="Open Jobs" value={employerJobs.filter((j) => j.status === 'open').length} />
        <Stat icon={Shield} label="Booked" value={employerJobs.filter((j) => j.status === 'booked').length} />
      </div>
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Post a new job</p>
          <p className="text-xs text-slate-500">Get smart matches instantly</p>
        </div>
        <Button onClick={() => setPostModal(true)} icon={Sparkles}>
          Post Job
        </Button>
      </Card>

      <div className="space-y-3">
        <p className="font-semibold text-slate-800">{t.postedJobs}</p>
        {employerJobs.map((job) => (
          <Card key={job.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900 text-lg">{job.title}</p>
                <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
                  <span className="flex items-center gap-1"><IndianRupee size={14} />{job.pay}</span>
                </div>
              </div>
              <StatusPill status={job.status} />
            </div>

            {!job.assignedWorker && <SmartMatches />}

            {job.assignedWorker && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-800 font-semibold">Booked Worker</p>
                  <button className="text-sm font-bold text-emerald-900 underline" onClick={() => setWorkerModal(job.assignedWorker)}>
                    {job.assignedWorker.name}
                  </button>
                </div>
                <BadgeCheck className="text-emerald-600" />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                fullWidth
                variant="outline"
                icon={Users}
                onClick={() => handleOpenApplicants(job.id)}
              >
                View Applicants
              </Button>
              {job.status === 'open' && (
                <Button fullWidth variant="primary" onClick={() => setPaymentJob(job)} icon={Wallet}>
                  {t.lockFee}
                </Button>
              )}
              {job.status === 'booked' && (
                <Button fullWidth variant="danger" onClick={() => { setDisputeJobId(job.id); }} icon={AlertTriangle}>
                  {t.dispute}
                </Button>
              )}
              {job.status === 'assigned' && (
                <Button
                  fullWidth
                  variant="primary"
                  onClick={() => handleMarkCompleted(job.id)}
                  disabled={completingJobId === job.id}
                >
                  Mark Completed
                </Button>
              )}
              {job.status === 'completed' && (
                <Button
                  fullWidth
                  variant="whatsapp"
                  disabled
                >
                  ✔ Job Completed
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const WorkerDashboard = () => (
    <div className="space-y-4 pb-24">
      <HeaderComponent />
      {activeAssignedJob && (
        <Card className="p-4 border-l-4 border-emerald-500">
          <div className="flex items-start justify-between mb-3">
            <p className="text-base font-bold text-slate-900">Active Job</p>
            <span className="px-2 py-1 text-[11px] rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {activeAssignedJob.status}
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900">{activeAssignedJob.title}</p>
          <div className="text-sm text-slate-600 mt-2 space-y-1">
            <p>Pay: ₹{activeAssignedJob.pay}</p>
            <p>Location: {activeAssignedJob.location}</p>
            <p>Employer Phone: {activeAssignedJob.employerPhone || 'Not available'}</p>
            <p>Assigned At: {formatAssignedDate(activeAssignedJob.assignedAt)}</p>
          </div>
        </Card>
      )}
      {!identityVerified && (
        <Card className="p-4 flex items-center gap-3 border-l-4 border-orange-500">
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
            <ScanLine size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">{t.verifyIdentity}</p>
            <p className="text-xs text-slate-500">Scan Aadhaar to boost trust</p>
          </div>
          <Button variant="primary" onClick={verifyIdentity} className="!py-2">
            Start
          </Button>
        </Card>
      )}

      <div className="flex gap-3">
        <Stat icon={Briefcase} label="Open jobs" value={openJobs.length} />
        <Stat icon={Shield} label="Verified" value={identityVerified ? 'Yes' : 'Pending'} />
      </div>

      <div className="space-y-3">
        <p className="font-semibold text-slate-800">Job Feed</p>
        {openJobs.map((job) => (
          <Card key={job.id} className="p-4 space-y-3">
            {(() => {
              const hasApplied = Boolean(appliedJobs[job.id]);
              const hasActiveAssignedJob = Boolean(activeAssignedJob);
              return (
                <>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900 text-lg">{job.title}</p>
                <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
                  <span className="flex items-center gap-1"><IndianRupee size={14} />{job.pay}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasApplied && (
                  <span className="px-2 py-1 text-[11px] rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Applied
                  </span>
                )}
                <StatusPill status={job.status} />
              </div>
            </div>
            <Button
              fullWidth
              variant={hasApplied ? 'whatsapp' : hasActiveAssignedJob ? 'subtle' : 'primary'}
              icon={MessageCircle}
              onClick={() => handleApplyToJob(job.id)}
              disabled={hasApplied || hasActiveAssignedJob}
            >
              {hasApplied ? '✔ Applied' : hasActiveAssignedJob ? 'Active Job In Progress' : 'Apply Now'}
            </Button>
                </>
              );
            })()}
          </Card>
        ))}
      </div>
    </div>
  );

  const ProfileView = () => {
    const currentUserId = user.firebaseUid || user.phone || user._id;

    const workerJobs = useMemo(() => {
      if (user.role !== 'worker' || !currentUserId) return [];
      return jobs.filter(j => j.assignedWorkerId === currentUserId);
    }, [user, jobs, currentUserId]);

    const completedWorkerJobs = useMemo(() => {
      return workerJobs.filter(j => j.status === 'completed');
    }, [workerJobs]);

    const userStats = useMemo(() => {
      if (user.role === 'worker') {
        const ratedJobs = jobs.filter(
          j =>
            j.assignedWorkerId === user.firebaseUid &&
            j.status === 'completed' &&
            j.rating
        );
        const averageRating =
          ratedJobs.length > 0
            ? (ratedJobs.reduce((sum, j) => sum + j.rating, 0) / ratedJobs.length).toFixed(1)
            : 0;
        return {
          totalJobs: workerJobs.length,
          completed: completedWorkerJobs.length,
          rating: averageRating,
        };
      } else {
        return {
          totalJobs: employerJobs.length,
          active: employerJobs.filter(j => j.status === 'open').length,
          completed: employerJobs.filter(j => j.status === 'booked').length,
        };
      }
    }, [user, jobs, employerJobs, workerJobs, completedWorkerJobs]);

    return (
      <div className="space-y-4 pb-24">
        <HeaderComponent />
        
        <Card className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-700 font-bold text-2xl flex items-center justify-center">
              {user.phone[user.phone.length - 1]}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-slate-900">{user.role === 'worker' ? 'Worker' : 'Employer'}</p>
              <p className="text-sm text-slate-500">{user.phone}</p>
              {user.role === 'worker' && identityVerified && (
                <div className="flex items-center gap-1 mt-1">
                  <BadgeCheck size={14} className="text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">Verified</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Total {user.role === 'worker' ? 'Applied' : 'Posted'}</p>
            <p className="text-xl font-bold text-slate-900">{userStats.totalJobs}</p>
          </Card>
          {user.role === 'worker' ? (
            <>
              <Card className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">Completed</p>
                <p className="text-xl font-bold text-slate-900">{userStats.completed}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">Rating</p>
                <p className="text-xl font-bold text-slate-900 flex items-center justify-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  {userStats.rating}
                </p>
              </Card>
            </>
          ) : (
            <>
              <Card className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">Active</p>
                <p className="text-xl font-bold text-slate-900">{userStats.active}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">Booked</p>
                <p className="text-xl font-bold text-slate-900">{userStats.completed}</p>
              </Card>
            </>
          )}
        </div>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100">
                <ShieldCheck size={18} className="text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Account Security</p>
                <p className="text-xs text-slate-500">Phone verified</p>
              </div>
            </div>
            <CheckCircle size={18} className="text-green-600" />
          </div>
        </Card>

        {user.role === 'worker' && (
          <div className="space-y-3">
            <p className="font-semibold text-slate-800">Completed Jobs ({completedWorkerJobs.length})</p>
            {completedWorkerJobs.length === 0 ? (
              <Card className="p-6 text-center">
                <Award size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 font-semibold text-sm">No completed jobs yet</p>
                <p className="text-xs text-slate-400 mt-1">Jobs you finish will appear here</p>
              </Card>
            ) : (
              completedWorkerJobs.map((job) => (
                <Card key={job.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{job.title}</p>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
                        <span className="flex items-center gap-1"><IndianRupee size={14} />{job.pay}/day</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-[11px] rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completed
                    </span>
                  </div>
                  {job.completedAt && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {job.completedAt.toDate ? new Date(job.completedAt.toDate()).toLocaleDateString() : new Date(job.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        <Button 
          fullWidth 
          variant="danger" 
          icon={LogOut}
          onClick={() => {
            logout();
            setPhone('');
            setOtp('');
            setRole('worker');
            setActiveTab('home');
          }}
        >
          Logout
        </Button>
      </div>
    );
  };

  const JobsView = () => {
    if (user.role === 'employer') {
      return (
        <div className="space-y-4 pb-24">
          <HeaderComponent />
          <div className="space-y-3">
            <p className="font-semibold text-slate-800">My Posted Jobs ({employerJobs.length})</p>
            {employerJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-semibold">No jobs posted yet</p>
                <p className="text-xs text-slate-400 mt-1">Post your first job to get started</p>
              </Card>
            ) : (
              employerJobs.map((job) => (
                <Card key={job.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{job.title}</p>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
                        <span className="flex items-center gap-1"><IndianRupee size={14} />{job.pay}</span>
                      </div>
                    </div>
                    <StatusPill status={job.status} />
                  </div>
                  {job.assignedWorker && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="text-sm text-emerald-800 font-semibold">Assigned to: {job.assignedWorker.name}</p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4 pb-24">
          <HeaderComponent />
          <div className="space-y-3">
            <p className="font-semibold text-slate-800">Available Jobs ({openJobs.length})</p>
            {openJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-semibold">No jobs available</p>
                <p className="text-xs text-slate-400 mt-1">Check back later for new opportunities</p>
              </Card>
            ) : (
              openJobs.map((job) => (
                <Card key={job.id} className="p-4 space-y-3">
                  {(() => {
                    const hasApplied = Boolean(appliedJobs[job.id]);
                    const hasActiveAssignedJob = Boolean(activeAssignedJob);
                    return (
                      <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{job.title}</p>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
                        <span className="flex items-center gap-1"><IndianRupee size={14} />{job.pay}/day</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasApplied && (
                        <span className="px-2 py-1 text-[11px] rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Applied
                        </span>
                      )}
                      <StatusPill status={job.status} />
                    </div>
                  </div>
                  <Button
                    fullWidth
                    variant={hasApplied ? 'whatsapp' : hasActiveAssignedJob ? 'subtle' : 'primary'}
                    icon={MessageCircle}
                    onClick={() => handleApplyToJob(job.id)}
                    disabled={hasApplied || hasActiveAssignedJob}
                  >
                    {hasApplied ? '✔ Applied' : hasActiveAssignedJob ? 'Active Job In Progress' : 'Apply Now'}
                  </Button>
                      </>
                    );
                  })()}
                </Card>
              ))
            )}
          </div>
        </div>
      );
    }
  };

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-between max-w-md mx-auto z-10">
      {[
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'jobs', icon: Briefcase, label: 'Jobs' },
        { id: 'profile', icon: User, label: 'Profile' },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
            activeTab === item.id ? 'text-orange-600 bg-orange-50' : 'text-slate-500'
          }`}
        >
          <item.icon size={18} />
          <span className="text-[11px] font-semibold">{item.label}</span>
        </button>
      ))}
    </div>
  );

  if (!user) return (
    <>
      <Toaster position="top-center" />
      <LoginView
        phone={phone}
        otp={otp}
        role={role}
        otpSent={otpSent}
        t={t}
        language={language}
        onPhoneChange={handlePhoneChange}
        onOtpChange={handleOtpChange}
        onRoleChange={handleRoleChange}
        onSendOtp={() => sendOtp(phone, role)}
        onVerifyOtp={() => verifyOtp(otp)}
        onLanguageToggle={handleLanguageToggle}
      />
    </>
  );

  if (authRoute === '/onboarding') {
    return (
      <>
        <Toaster position="top-center" />
        {onboardingRole === 'employer' ? (
          <EmployerOnboarding />
        ) : (
          <WorkerOnboarding onSuccess={handleOnboardingSuccess} />
        )}
      </>
    );
  }

  if (!user || !user.role) {
    return (
      <>
        <Toaster position="top-center" />
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-4 flex items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return user.role === 'employer' ? <EmployerDashboard /> : <WorkerDashboard />;
      case 'jobs':
        return <JobsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return user.role === 'employer' ? <EmployerDashboard /> : <WorkerDashboard />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-4 pb-24">
      <Toaster position="top-center" />

      {renderContent()}

      <BottomNav />

      <Modal 
        open={postModal} 
        onClose={() => {
          setPostModal(false);
          setJustPostedJob(null);
        }} 
        title={justPostedJob ? "Smart Matches Found" : "Post a Job"}
      >
        {!justPostedJob ? (
          <JobForm
            onSubmit={(data) => {
              const job = postJob(data);
              if (job) {
                setJustPostedJob(job);
              }
            }}
            onSuccess={() => {
              // Form resets automatically
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-sm font-semibold text-emerald-800">Job posted successfully!</p>
              <p className="text-xs text-emerald-700 mt-1">Here are your top matches:</p>
            </div>
            <SmartMatches />
            <Button fullWidth onClick={() => { setPostModal(false); setJustPostedJob(null); }}>
              Done
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={!!paymentJob} onClose={() => setPaymentJob(null)} title="Pay ₹10 to lock worker">
        {paymentJob && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Simulated UPI payment for <strong>{paymentJob.title}</strong></p>
            <Button fullWidth onClick={() => { lockFee(paymentJob.id); setPaymentJob(null); }}>
              Pay ₹10
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={!!workerModal} onClose={() => setWorkerModal(null)} title="Worker Profile">
        {workerModal && <WorkerProfile worker={workerModal} />}
      </Modal>

      <Modal open={!!applicantsJobId} onClose={handleCloseApplicants} title="Applicants">
        {applicantsJobId && (
          <div className="space-y-3">
            {isJobApplicantsLoading(applicantsJobId) ? (
              <p className="text-sm text-slate-500">Loading applicants...</p>
            ) : getJobApplicants(applicantsJobId).length === 0 ? (
              <p className="text-sm text-slate-500">No applicants yet</p>
            ) : (
              getJobApplicants(applicantsJobId).map((applicant) => (
                <Card key={applicant.id} className="p-4 space-y-1">
                  <p className="text-base font-semibold text-slate-900">{applicant.workerName || 'Worker'}</p>
                  <p className="text-sm text-slate-600">{applicant.workerPhone || 'No phone available'}</p>
                  <p className="text-xs text-slate-500">Applied: {formatAppliedDate(applicant.appliedAt)}</p>
                  <span className="inline-flex px-2 py-1 text-[11px] rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    {applicant.status || 'pending'}
                  </span>
                  <Button
                    fullWidth
                    className="mt-2"
                    onClick={() => handleAssignApplicant(applicant)}
                    disabled={selectedApplicantsJob?.status === 'assigned' || applicant.status !== 'pending'}
                  >
                    {selectedApplicantsJob?.status === 'assigned'
                      ? 'Assigned'
                      : applicant.status === 'accepted'
                        ? 'Assigned'
                        : 'Assign Worker'}
                  </Button>
                </Card>
              ))
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!disputeJobId} onClose={() => setDisputeJobId(null)} title="Report Issue">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Report if worker did not show up or issue occurred.</p>
          <Button variant="danger" fullWidth onClick={() => { disputeJob(disputeJobId); setDisputeJobId(null); }}>
            Submit Dispute
          </Button>
        </div>
      </Modal>

      <Modal
        open={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setJobToComplete(null);
          setSelectedRating(0);
          setReviewText('');
        }}
        title="Rate Worker"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">How was the worker's performance?</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={star <= selectedRating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-slate-300'}
                  />
                </button>
              ))}
            </div>
            {selectedRating > 0 && (
              <p className="text-center text-sm text-slate-500 mt-1">{selectedRating} / 5</p>
            )}
          </div>
          <div>
            <label className="text-xs text-slate-500">Review (optional)</label>
            <textarea
              className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="How was the worker? Any feedback..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>
          <Button
            fullWidth
            onClick={handleSubmitRating}
            disabled={completingJobId === jobToComplete}
          >
            {completingJobId === jobToComplete ? 'Submitting...' : 'Submit & Complete Job'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

const JobForm = ({ onSubmit, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [pay, setPay] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, pay, location });
    // Reset form after successful submission
    setTitle('');
    setPay('');
    setLocation('');
    if (onSuccess) onSuccess();
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className="text-xs text-slate-500">Job Title</label>
        <input
          key="job-title-input"
          className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Painter for 2BHK"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-slate-500">Daily Pay (₹)</label>
          <input
            key="job-pay-input"
            type="number"
            className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="800"
            value={pay}
            onChange={(e) => setPay(e.target.value.replace(/\D/g, ''))}
            required
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-500">Location</label>
          <input
            key="job-location-input"
            className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Saket"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" fullWidth icon={Sparkles}>
        Post Job
      </Button>
    </form>
  );
};