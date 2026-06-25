import { AnimatePresence, motion } from 'framer-motion';
import { Flag, Heart, MessageCircle, Send, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const TOPICS = [
  { value: 'support',   label: '💙 Support',   color: '#818cf8' },
  { value: 'gratitude', label: '🌟 Gratitude', color: '#34d399' },
  { value: 'coping',    label: '🧘 Coping',    color: '#f472b6' },
  { value: 'question',  label: '❓ Question',  color: '#fb923c' },
];

const s = {
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 24, padding: 20,
    backdropFilter: 'blur(24px)',
  },
};

function TopicBadge({ topic }) {
  const t = TOPICS.find(x => x.value === topic) || TOPICS[0];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
      background: `${t.color}18`, border: `1px solid ${t.color}30`, color: t.color,
    }}>
      {t.label}
    </span>
  );
}

function TimeAgo({ date }) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  const label = diff < 60 ? 'just now'
    : diff < 3600   ? `${Math.floor(diff/60)}m ago`
    : diff < 86400  ? `${Math.floor(diff/3600)}h ago`
    : `${Math.floor(diff/86400)}d ago`;
  return <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)' }}>{label}</span>;
}

export default function Community() {
  const [posts, setPosts]         = useState([]);
  const [body, setBody]           = useState('');
  const [topic, setTopic]         = useState('support');
  const [comments, setComments]   = useState({});
  const [openComments, setOpenComments] = useState({});
  const [publishing, setPublishing] = useState(false);
  const [busy, setBusy]           = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/community')
      .then(({ data }) => setPosts(data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function publish() {
    if (!body.trim() || publishing) return;
    setPublishing(true);
    try {
      const { data } = await api.post('/community', { body, topic });
      setPosts([data.post, ...posts]);
      setBody('');
    } finally { setPublishing(false); }
  }

  async function like(id) {
    setBusy(`like-${id}`);
    try {
      const { data } = await api.post(`/community/${id}/like`);
      setPosts(posts.map(p => p._id === id ? data.post : p));
    } finally { setBusy(''); }
  }

  async function report(id) {
    setBusy(`report-${id}`);
    try {
      await api.post(`/community/${id}/report`, { reason: 'Needs moderation review' });
      setPosts(posts.map(p => p._id === id ? { ...p, moderationStatus: 'review' } : p));
    } finally { setBusy(''); }
  }

  async function postComment(id) {
    if (!comments[id]?.trim() || busy) return;
    setBusy(`comment-${id}`);
    try {
      const { data } = await api.post(`/community/${id}/comment`, { body: comments[id] });
      setPosts(posts.map(p => p._id === id ? data.post : p));
      setComments({ ...comments, [id]: '' });
    } finally { setBusy(''); }
  }

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', alignItems: 'start', paddingBottom: 24 }}>

      {/* ── LEFT: Compose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Header card */}
        <div style={{ ...s.card, background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(20,184,166,0.08))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Users size={20} style={{ color: '#818cf8' }} aria-hidden />
            <h1 style={{ fontSize: 18, fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
              Anonymous Community
            </h1>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.50)', margin: 0 }}>
            Share freely — no names, no judgment. Just humans supporting each other.
          </p>
        </div>

        {/* Compose */}
        <div style={s.card}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: '0 0 12px' }}>Share something</p>

          {/* Topic selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {TOPICS.map(t => (
              <button key={t.value} onClick={() => setTopic(t.value)}
                style={{
                  padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  ...(topic === t.value
                    ? { background: `${t.color}25`, border: `1px solid ${t.color}40`, color: t.color }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)' }
                  ),
                }}>
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Post anonymously… what's on your mind?"
            maxLength={600}
            style={{
              width: '100%', minHeight: 120, padding: '12px 14px',
              borderRadius: 16, fontSize: 13, lineHeight: 1.7, resize: 'vertical',
              background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.85)', outline: 'none', fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.50)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{body.length}/600</span>
            <button onClick={publish} disabled={publishing || !body.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 14, fontSize: 13, fontWeight: 700,
                cursor: body.trim() && !publishing ? 'pointer' : 'not-allowed',
                border: 'none', color: 'white',
                background: body.trim() && !publishing
                  ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                  : 'rgba(255,255,255,0.10)',
                opacity: !body.trim() ? 0.5 : 1,
                boxShadow: body.trim() ? '0 4px 14px rgba(99,102,241,0.30)' : 'none',
                transition: 'all 0.2s',
              }}>
              {publishing
                ? <><span style={{ width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',animation:'spin 0.8s linear infinite',display:'inline-block' }} />Publishing…</>
                : <><Send size={14} />Publish</>
              }
            </button>
          </div>
        </div>

        {/* Safety notice */}
        <div style={{ ...s.card, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Shield size={15} style={{ color: '#34d399' }} aria-hidden />
            <p style={{ fontWeight: 700, color: '#6ee7b7', fontSize: 13, margin: 0 }}>Safe space rules</p>
          </div>
          {['All posts are anonymous — no identity shared.','Be kind. Uplift, don\'t judge.','Flag anything that feels harmful.','For crisis support, call 988 or 112.'].map(r => (
            <p key={r} style={{ fontSize: 12, color: 'rgba(110,231,183,0.60)', margin: '3px 0 0', lineHeight: 1.6 }}>• {r}</p>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Feed ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {loading && [1,2,3].map(i => (
          <div key={i} style={{ ...s.card, height: 120 }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, height: '100%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}

        {!loading && posts.length === 0 && (
          <div style={{ ...s.card, textAlign: 'center', padding: 40 }}>
            <Users size={36} style={{ color: 'rgba(255,255,255,0.20)', margin: '0 auto 12px' }} aria-hidden />
            <p style={{ fontWeight: 800, color: 'white', fontSize: 16, margin: '0 0 6px' }}>No posts yet</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', margin: 0 }}>
              Be the first to share something kind. Quiet spaces can still feel welcoming.
            </p>
          </div>
        )}

        <AnimatePresence>
          {posts.map((post, i) => {
            const commentsOpen = openComments[post._id];
            return (
              <motion.article key={post._id}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={s.card}
              >
                {/* Post header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      display: 'grid', placeItems: 'center',
                      fontSize: 13, fontWeight: 800, color: 'white',
                    }}>
                      {(post.displayName || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: 0 }}>
                        {post.displayName || 'Anonymous'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <TopicBadge topic={post.topic} />
                        <TimeAgo date={post.createdAt} />
                      </div>
                    </div>
                  </div>
                  {post.moderationStatus === 'review' && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', padding: '3px 8px', borderRadius: 999 }}>
                      In review
                    </span>
                  )}
                </div>

                {/* Body */}
                <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,0.80)', margin: '0 0 14px' }}>
                  {post.body}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => like(post._id)} disabled={busy === `like-${post._id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', border: '1px solid rgba(255,255,255,0.09)',
                      background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.60)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(244,114,182,0.15)'; e.currentTarget.style.color='#f472b6'; e.currentTarget.style.borderColor='rgba(244,114,182,0.30)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.60)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
                  >
                    <Heart size={13} /> {post.likes?.length || 0}
                  </button>
                  <button onClick={() => setOpenComments(o => ({ ...o, [post._id]: !o[post._id] }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', border: '1px solid rgba(255,255,255,0.09)',
                      background: commentsOpen ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                      color: commentsOpen ? '#818cf8' : 'rgba(255,255,255,0.60)',
                      transition: 'all 0.2s',
                    }}>
                    <MessageCircle size={13} /> {post.comments?.length || 0}
                  </button>
                  <button onClick={() => report(post._id)} disabled={busy === `report-${post._id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', border: '1px solid rgba(255,255,255,0.09)',
                      background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)',
                      transition: 'all 0.2s', marginLeft: 'auto',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color='#f87171'; e.currentTarget.style.borderColor='rgba(248,113,113,0.30)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.40)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
                  >
                    <Flag size={12} /> Report
                  </button>
                </div>

                {/* Comments section */}
                <AnimatePresence>
                  {commentsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(post.comments || []).slice(-3).map((c, ci) => (
                          <div key={c._id || ci} style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 14, padding: '10px 14px',
                          }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.50)', margin: '0 0 3px' }}>
                              {c.displayName || 'Anonymous'}
                            </p>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
                              {c.body}
                            </p>
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                          <input
                            value={comments[post._id] || ''}
                            onChange={e => setComments({ ...comments, [post._id]: e.target.value })}
                            placeholder="Add an anonymous comment…"
                            onKeyDown={e => e.key === 'Enter' && postComment(post._id)}
                            style={{
                              flex: 1, padding: '9px 14px', borderRadius: 14, fontSize: 13,
                              background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.09)',
                              color: 'rgba(255,255,255,0.85)', outline: 'none', fontFamily: 'inherit',
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.50)'}
                            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
                          />
                          <button onClick={() => postComment(post._id)}
                            disabled={busy === `comment-${post._id}` || !comments[post._id]?.trim()}
                            style={{
                              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                              display: 'grid', placeItems: 'center', cursor: 'pointer', border: 'none',
                              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white',
                            }}>
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>
    </div>
  );
}