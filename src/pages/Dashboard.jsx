import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Briefcase, MapPin, IndianRupee, LogOut, Send, MessageSquare, Trash2, PlusCircle, CheckCircle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase';
import { TEXTS } from '../data';
import { Button } from '../components/UI';

export default function Dashboard({ lang }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('kaamsetu_user')));
  const [jobs, setJobs] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const t = TEXTS[lang];

  useEffect(() => {
    if (!user) navigate('/');
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => setJobs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))));
    return () => unsubscribe();
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kaamsetu_user');
    navigate('/');
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'jobs'), {
      title: e.target.title.value,
      pay: e.target.pay.value,
      location: 'Delhi',
      status: 'open',
      employerPhone: user.phone,
      createdAt: new Date(),
    });
    toast.success('Job Posted!');
    setShowPostModal(false);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Delete?')) {
      await deleteDoc(doc(db, 'jobs', jobId));
      toast.success('Deleted');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative font-sans p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">KaamSetu</h1>
          <p className="text-xs text-slate-500">{user.role} Dashboard</p>
        </div>
        <button onClick={handleLogout} className="p-2 bg-slate-100 rounded-full">
          <LogOut size={16} />
        </button>
      </div>

      {user.role === 'worker' && user.verified && (
        <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500 flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <User />
          </div>
          <div>
            <h3 className="font-bold">Welcome {user.name}</h3>
            <p className="text-xs text-green-600 font-bold flex items-center gap-1">
              <CheckCircle size={10} /> Verified Profile
            </p>
          </div>
        </div>
      )}

      {user.role === 'employer' && (
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-slate-100 mb-6">
          <div>
            <h3 className="font-bold">Post a Job</h3>
            <p className="text-xs text-slate-500">Find workers now</p>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-orange-600 text-white p-3 rounded-full shadow-lg active:scale-95"
          >
            <PlusCircle />
          </button>
        </div>
      )}

      <h3 className="font-bold text-slate-700 mb-3">
        {t.live_jobs} ({jobs.length})
      </h3>
      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between">
              <h3 className="font-bold text-lg text-slate-800">{job.title}</h3>
              {user.role === 'employer' && job.employerPhone === user.phone && (
                <button onClick={() => handleDeleteJob(job.id)} className="text-red-500">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 mb-4 mt-1">
              <span>
                <MapPin size={14} className="inline text-orange-500" /> {job.location || 'Delhi'}
              </span>
              <span>
                <IndianRupee size={14} className="inline text-green-600" /> {job.pay}
              </span>
            </div>
            {user.role === 'worker' ? (
              <Button fullWidth variant="whatsapp" onClick={() => window.open(`https://wa.me/91${job.employerPhone}`)} icon={Send}>
                {t.apply}
              </Button>
            ) : (
              <Button fullWidth variant="ghost" onClick={() => window.open(`https://wa.me/91${user.phone}`)} icon={MessageSquare}>
                View Applicants
              </Button>
            )}
          </div>
        ))}
      </div>

      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm p-6 rounded-2xl animate-slide-up">
            <h2 className="font-bold text-lg mb-4">Post New Job</h2>
            <form onSubmit={handlePostJob}>
              <input name="title" className="w-full p-3 border rounded-lg mb-3" placeholder="Job Title" required />
              <input name="pay" type="number" className="w-full p-3 border rounded-lg mb-4" placeholder="Daily Pay (₹)" required />
              <div className="flex gap-2">
                <Button variant="ghost" fullWidth onClick={() => setShowPostModal(false)}>
                  Cancel
                </Button>
                <Button fullWidth type="submit">
                  Post
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

