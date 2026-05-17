import { Flag, Heart, MessageCircle, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState('support');
  const [comments, setComments] = useState({});
  const [publishing, setPublishing] = useState(false);
  const [busyPost, setBusyPost] = useState('');

  useEffect(() => {
    api.get('/community').then(({ data }) => setPosts(data.posts || [])).catch(() => {});
  }, []);

  async function publish() {
    if (!body.trim() || publishing) return;
    setPublishing(true);
    try {
      const { data } = await api.post('/community', { body, topic });
      setPosts([data.post, ...posts]);
      setBody('');
    } finally {
      setPublishing(false);
    }
  }

  async function like(id) {
    setBusyPost(`like-${id}`);
    try {
      const { data } = await api.post(`/community/${id}/like`);
      setPosts(posts.map((post) => (post._id === id ? data.post : post)));
    } finally {
      setBusyPost('');
    }
  }

  async function report(id) {
    setBusyPost(`report-${id}`);
    try {
      await api.post(`/community/${id}/report`, { reason: 'Needs moderation review' });
      setPosts(posts.map((post) => (post._id === id ? { ...post, moderationStatus: 'review' } : post)));
    } finally {
      setBusyPost('');
    }
  }

  async function comment(id) {
    if (!comments[id]?.trim() || busyPost) return;
    setBusyPost(`comment-${id}`);
    try {
      const { data } = await api.post(`/community/${id}/comment`, { body: comments[id] });
      setPosts(posts.map((post) => (post._id === id ? data.post : post)));
      setComments({ ...comments, [id]: '' });
    } finally {
      setBusyPost('');
    }
  }

  return (
    <AnimatedPage className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="panel h-fit">
        <p className="text-sm font-bold text-lagoon dark:text-teal-200">Anonymous community</p>
        <h2 className="text-2xl font-extrabold">Share support safely</h2>
        <select className="field mt-5" value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="support">Support</option>
          <option value="gratitude">Gratitude</option>
          <option value="coping">Coping</option>
          <option value="question">Question</option>
        </select>
        <textarea className="field mt-3 min-h-40" placeholder="Post anonymously..." value={body} onChange={(e) => setBody(e.target.value)} />
        <button className="btn-primary mt-4 w-full" onClick={publish} disabled={publishing || !body.trim()}>
          {publishing ? <LoadingSpinner label="Publishing..." /> : <><Send size={16} /> Publish</>}
        </button>
      </section>
      <section className="grid gap-4">
        {posts.map((post) => (
          <article key={post._id} className="panel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold">{post.displayName || 'Anonymous'}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-lagoon dark:text-teal-200">{post.topic}</p>
              </div>
              {post.moderationStatus === 'review' && <span className="rounded-full bg-amberlight/30 px-3 py-1 text-xs font-bold">In review</span>}
            </div>
            <p className="mt-4 leading-7 text-slate-700 dark:text-slate-200">{post.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-secondary px-4 py-2" onClick={() => like(post._id)} disabled={busyPost === `like-${post._id}`}><Heart size={16} /> {post.likes?.length || 0}</button>
              <button className="btn-secondary px-4 py-2"><MessageCircle size={16} /> {post.comments?.length || 0}</button>
              <button className="btn-secondary px-4 py-2" onClick={() => report(post._id)} disabled={busyPost === `report-${post._id}`}><Flag size={16} /> Report</button>
            </div>
            <div className="mt-4 grid gap-3">
              {(post.comments || []).slice(-2).map((commentItem) => (
                <div key={commentItem._id || commentItem.createdAt} className="rounded-2xl bg-mist px-4 py-3 text-sm dark:bg-white/10">
                  <p className="font-bold">{commentItem.displayName || 'Anonymous'}</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">{commentItem.body}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input className="field" placeholder="Add an anonymous comment" value={comments[post._id] || ''} onChange={(e) => setComments({ ...comments, [post._id]: e.target.value })} />
                <button className="btn-primary px-4 py-2" onClick={() => comment(post._id)} disabled={busyPost === `comment-${post._id}`}>
                  {busyPost === `comment-${post._id}` ? <span className="spinner" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </article>
        ))}
        {posts.length === 0 && (
          <div className="panel text-sm text-slate-600 dark:text-slate-300">
            <p className="text-lg font-extrabold text-ink dark:text-white">No community posts yet.</p>
            <p className="mt-2 leading-6">Start with one small supportive note or a daily reflection. Quiet spaces can still feel welcoming.</p>
          </div>
        )}
      </section>
    </AnimatedPage>
  );
}
