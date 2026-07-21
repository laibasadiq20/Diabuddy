import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import AppSidebar from '../../components/AppSidebar';
import { API_URL } from '../../config/api';
import { 
  FileText, 
  Image as ImageIcon, 
  BarChart2, 
  Plus, 
  Trash2, 
  HelpCircle,
  Upload,
  Loader,
  ArrowLeft
} from 'lucide-react';

const t = theme;

export default function NewPost() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [topics, setTopics] = useState([]);
  const [postType, setPostType] = useState('text'); // text | image | poll
  
  // Form fields
  const [topicId, setTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // Image Upload state
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  
  // Poll Composer state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollExpiresAt, setPollExpiresAt] = useState('');

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch topics for selector
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_URL}/topics`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTopics(data);
          if (data.length > 0) setTopicId(data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching topics:', err);
      }
    };
    fetchTopics();
  }, []);

  // Handle image upload
  const handleImageFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (uploadedImageUrls.length + files.length > 4) {
      setError('You can upload up to 4 images only.');
      return;
    }

    setUploadingImages(true);
    setError('');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUploadedImageUrls(prev => [...prev, ...(data.urls || [])]);
      } else {
        setError(data.message || 'Image upload failed.');
      }
    } catch (err) {
      setError('Connection error during upload.');
      console.error(err);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeUploadedImage = (indexToRemove) => {
    setUploadedImageUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Poll option updates
  const handlePollOptionChange = (value, idx) => {
    const newOptions = [...pollOptions];
    newOptions[idx] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length >= 6) return;
    setPollOptions(prev => [...prev, '']);
  };

  const removePollOption = (idxToRemove) => {
    if (pollOptions.length <= 2) return;
    setPollOptions(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Submit Handler
  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!topicId) {
      setError('Please select a topic category.');
      setLoading(false);
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const postPayload = {
      topicId,
      title: title.trim(),
      content: content.trim(),
      tags: tagsArray,
      isAnonymous,
      type: postType,
      isDraft: saveAsDraft,
      images: postType === 'image' ? uploadedImageUrls : []
    };

    try {
      // Step 1: Create the Forum Post
      const postRes = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload)
      });
      const postData = await postRes.json();

      if (!postRes.ok) {
        setError(postData.message || 'Failed to create discussion post.');
        setLoading(false);
        return;
      }

      // Step 2: If type is 'poll', create the attached poll
      if (postType === 'poll' && !saveAsDraft) {
        const filteredOptions = pollOptions.map(opt => opt.trim()).filter(opt => opt.length > 0);
        if (filteredOptions.length < 2) {
          setError('A poll requires at least 2 valid non-empty options.');
          setLoading(false);
          return;
        }

        const pollPayload = {
          question: pollQuestion.trim() || title.trim(),
          options: filteredOptions,
          expiresAt: pollExpiresAt || undefined
        };

        const pollRes = await fetch(`${API_URL}/posts/${postData._id}/poll`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pollPayload)
        });

        if (!pollRes.ok) {
          const pollData = await pollRes.json();
          setError(`Post created, but poll attachment failed: ${pollData.message}`);
          setLoading(false);
          return;
        }
      }

      // Success redirects
      navigate(saveAsDraft ? '/dashboard' : `/community/posts/${postData._id}`);

    } catch (err) {
      setError('Connection failure. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: '#E8E0D4' }}>
      <AppSidebar />
      
      <main style={{ flexGrow: 1, minWidth: 0, padding: '28px 20px 72px', fontFamily: t.fontBody }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          
          {/* Back Action */}
          <button 
            type="button"
            onClick={() => navigate('/community')}
            style={{
              background: '#FFF',
              border: `1.5px solid ${t.lineStrong}`,
              color: t.inkSoft,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px',
              padding: '8px 12px',
              borderRadius: 999,
              fontFamily: t.fontBody,
            }}
          >
            <ArrowLeft size={15} /> Back to forum
          </button>

          {/* Heading */}
          <h1 style={{ 
            fontFamily: t.fontDisplay, 
            fontSize: 'clamp(24px, 5vw, 32px)', 
            color: t.ink, 
            fontWeight: '500',
            margin: '0 0 20px 0' 
          }}>
            Compose Discussion
          </h1>

          {error && (
            <div style={{ 
              background: t.clayTint, 
              border: `1.5px solid ${t.clay}30`, 
              borderRadius: '12px', 
              padding: '16px', 
              color: t.clayDeep, 
              fontSize: '14px',
              marginBottom: '24px' 
            }}>
              {error}
            </div>
          )}

          {/* Main Box */}
          <div style={{ 
            background: t.surface, 
            border: `1.5px solid ${t.line}`,
            borderRadius: '24px',
            padding: '32px',
            boxShadow: t.shadowCard
          }}>
            
            {/* Post Type Selector Tabs */}
            <div style={{ 
              display: 'flex', 
              background: t.bg, 
              padding: '6px', 
              borderRadius: '14px',
              border: `1.5px solid ${t.line}`,
              marginBottom: '28px' 
            }}>
              {[
                { type: 'text', label: 'Discussion Thread', icon: FileText },
                { type: 'image', label: 'Photo Upload', icon: ImageIcon },
                { type: 'poll', label: 'Poll / Question', icon: BarChart2 }
              ].map(tab => {
                const Icon = tab.icon;
                const active = postType === tab.type;
                return (
                  <button
                    key={tab.type}
                    type="button"
                    onClick={() => {
                      setPostType(tab.type);
                      setError('');
                    }}
                    style={{
                      flex: 1,
                      background: active ? t.surface : 'none',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: active ? t.ink : t.inkSoft,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: active ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={16} color={active ? t.sageDeep : t.inkFaint} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)}>
              {/* Category Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Select Topic Category
                </label>
                <select
                  value={topicId}
                  onChange={e => setTopicId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: `1.5px solid ${t.line}`,
                    background: t.bg,
                    color: t.ink,
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: t.fontBody
                  }}
                >
                  <option value="" disabled>Choose a Category...</option>
                  {topics.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Discussion Title
                </label>
                <input 
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Summarize your question or insight..."
                  required
                  maxLength={150}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: `1.5px solid ${t.line}`,
                    background: t.bg,
                    color: t.ink,
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: t.fontBody
                  }}
                />
              </div>

              {/* Content body */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Post Content
                </label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Share details of your logging, ask professionals, or explain your recipe..."
                  required
                  rows={8}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: `1.5px solid ${t.line}`,
                    background: t.bg,
                    color: t.ink,
                    fontSize: '14px',
                    outline: 'none',
                    lineHeight: '1.6',
                    fontFamily: t.fontBody
                  }}
                />
              </div>

              {/* IMAGE TYPE FORM */}
              {postType === 'image' && (
                <div style={{ marginBottom: '24px', background: t.bg, borderRadius: '16px', padding: '20px', border: `1px solid ${t.line}` }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                    Attach Pictures (Max 4)
                  </label>
                  
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {uploadedImageUrls.map((url, idx) => (
                      <div key={idx} style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', position: 'relative', border: `1px solid ${t.lineStrong}` }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(idx)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.6)',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {uploadedImageUrls.length < 4 && (
                      <label style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '10px',
                        border: `2px dashed ${t.lineStrong}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: uploadingImages ? 'not-allowed' : 'pointer',
                        color: t.inkSoft,
                        background: '#FFFFFF'
                      }}>
                        {uploadingImages ? (
                          <Loader className="animate-spin" size={18} />
                        ) : (
                          <>
                            <Upload size={18} />
                            <span style={{ fontSize: '10px', marginTop: '4px' }}>Add</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          onChange={handleImageFileChange} 
                          disabled={uploadingImages}
                          style={{ display: 'none' }} 
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* POLL TYPE FORM */}
              {postType === 'poll' && (
                <div style={{ marginBottom: '24px', background: t.bg, borderRadius: '16px', padding: '20px', border: `1px solid ${t.line}` }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: t.ink, margin: '0 0 16px 0' }}>
                    Configure Poll Questions
                  </h4>

                  {/* Poll Question */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: t.inkSoft, marginBottom: '6px' }}>
                      Poll Question / Topic
                    </label>
                    <input 
                      type="text"
                      value={pollQuestion}
                      onChange={e => setPollQuestion(e.target.value)}
                      placeholder="e.g. Which glucose meter is best for exercise?"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: `1.5px solid ${t.line}`,
                        background: '#FFFFFF',
                        color: t.ink,
                        fontSize: '13px',
                        outline: 'none',
                        fontFamily: t.fontBody
                      }}
                    />
                  </div>

                  {/* Options */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: t.inkSoft, marginBottom: '8px' }}>
                      Choices / Options (2 to 6)
                    </label>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pollOptions.map((opt, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="text"
                            value={opt}
                            onChange={e => handlePollOptionChange(e.target.value, idx)}
                            placeholder={`Option ${idx + 1}`}
                            required
                            style={{
                              flexGrow: 1,
                              boxSizing: 'border-box',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: `1.5px solid ${t.line}`,
                              background: '#FFFFFF',
                              color: t.ink,
                              fontSize: '13px',
                              outline: 'none',
                              fontFamily: t.fontBody
                            }}
                          />
                          {pollOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removePollOption(idx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: t.clay,
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {pollOptions.length < 6 && (
                      <button
                        type="button"
                        onClick={addPollOption}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: t.sageDeep,
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '12px',
                          padding: 0
                        }}
                      >
                        <Plus size={14} /> Add option
                      </button>
                    )}
                  </div>

                  {/* Expires At */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: t.inkSoft, marginBottom: '6px' }}>
                      Expiration Date (Optional)
                    </label>
                    <input 
                      type="datetime-local"
                      value={pollExpiresAt}
                      onChange={e => setPollExpiresAt(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: `1.5px solid ${t.line}`,
                        background: '#FFFFFF',
                        color: t.ink,
                        fontSize: '13px',
                        outline: 'none',
                        fontFamily: t.fontBody
                      }}
                    />
                  </div>

                </div>
              )}

              {/* Tags */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Tags (comma separated)
                </label>
                <input 
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="e.g. recipes, Type1, CGM, logs"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: `1.5px solid ${t.line}`,
                    background: t.bg,
                    color: t.ink,
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: t.fontBody
                  }}
                />
              </div>

              {/* Anonymous Checkbox */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)}
                    style={{
                      accentColor: t.sageDeep,
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <span style={{ fontSize: '14px', color: t.inkSoft, fontWeight: '500' }}>
                    Post anonymously to the forum
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px',
                borderTop: `1px solid ${t.line}`,
                paddingTop: '24px'
              }}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={(e) => handleSubmit(e, true)}
                  style={{
                    background: 'none',
                    border: `1.5px solid ${t.line}`,
                    borderRadius: '12px',
                    padding: '12px 22px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: t.inkSoft,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.borderColor = t.inkSoft; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.borderColor = t.line; }}
                >
                  Save Draft
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? t.lineStrong : t.sageDeep,
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 26px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = t.olive; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = t.sageDeep; }}
                >
                  {loading ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>

            </form>

          </div>
        </div>
      </main>
    </div>
  );
}
