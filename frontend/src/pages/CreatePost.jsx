import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostService } from '../context/PostContext';
import { ChevronDown } from '../ui/Icons';
import toast from 'react-hot-toast';

function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollQuestion, setPollQuestion] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const token = localStorage.getItem('token');
  const { createPost } = usePostService();

  // Load draft from localStorage if exists
  useEffect(() => {
    const savedDraft = localStorage.getItem('postDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || '');
        setCategory(draft.category || '');
        setPollQuestion(draft.pollQuestion || '');
        setPollOptions(draft.pollOptions || ['', '']);
        setShowPoll(draft.showPoll || false);
        if (draft.content) {
          setContent(draft.content);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  const saveDraft = () => {
    const draft = {
      title,
      category,
      pollQuestion,
      pollOptions,
      showPoll,
      content,
      isDraft: true,
    };

    localStorage.setItem('postDraft', JSON.stringify(draft));
    toast.success('Draft saved successfully', { position: 'bottom-right' });
  };

  const clearDraft = () => {
    localStorage.removeItem('postDraft');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!content.trim() && !showPoll) {
        toast.error('Please add some content to your post', { position: 'bottom-right' });
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', content);
      formData.append('category', category);

      if (showPoll) {
        const pollData = {
          question: pollQuestion,
          options: pollOptions.filter((option) => option.trim() !== ''),
        };
        formData.append('poll', JSON.stringify(pollData));
      }

      if (image) {
        formData.append('image', image);
      }

      formData.append('isDraft', isDraft);

      await createPost(token, formData);

      // Clear form and draft on successful submission
      setTitle('');
      setContent('');
      setCategory('');
      setImage(null);
      setImagePreview(null);
      setShowPoll(false);
      setPollOptions(['', '']);
      setPollQuestion('');
      setIsDraft(false);
      clearDraft();

      if (!isDraft) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  const categories = [
    { value: 'Tech', label: 'Technology' },
    { value: 'Lifestyle', label: 'Lifestyle' },
    { value: 'Education', label: 'Education' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Food', label: 'Food & Cooking' },
    { value: 'Health', label: 'Health & Fitness' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Music', label: 'Music' },
    { value: 'Gaming', label: 'Gaming' },
  ];

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50 dark:bg-[#0e1113]">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#131619] rounded-xl shadow-sm p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 dark:text-white font-mono">
            Create Post
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a catchy title..."
                required
                maxLength={100}
              />
              <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                {title.length}/100
              </p>
            </div>

            {/* Category dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-slate-800 dark:text-white"
                >
                  <span>
                    {category
                      ? categories.find((c) => c.value === category)?.label
                      : 'Select a category'}
                  </span>
                  <ChevronDown className="w-5 h-5" />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg py-1 max-h-60 overflow-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white"
                        onClick={() => {
                          setCategory(cat.value);
                          setCategoryDropdownOpen(false);
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Basic Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 flex flex-wrap gap-2">
                  {['B', 'I', 'U'].map((format) => (
                    <button
                      key={format}
                      type="button"
                      className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-sm font-medium"
                      onClick={() => {
                        // Simple formatting - just add markdown-like symbols
                        let formatChar = '';
                        switch (format) {
                          case 'B':
                            formatChar = '**';
                            break;
                          case 'I':
                            formatChar = '*';
                            break;
                          case 'U':
                            formatChar = '__';
                            break;
                        }
                        setContent(content + ' ' + formatChar + 'text' + formatChar + ' ');
                      }}
                    >
                      {format}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-sm font-medium"
                    onClick={() => setContent(content + '\n- Bullet point')}
                  >
                    • List
                  </button>

                  <button
                    type="button"
                    className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-sm font-medium"
                    onClick={() => setContent(content + '\n\n## Heading')}
                  >
                    H
                  </button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  className="w-full px-4 py-3 dark:bg-slate-800 dark:text-white min-h-[200px] resize-y font-mono"
                  required={!showPoll}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Supports basic markdown: **bold**, *italic*, __underline__, ## heading
              </p>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Image (Optional)
              </label>
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <label className="block">
                      <span className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                        Choose an image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Poll toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="addPoll"
                checked={showPoll}
                onChange={() => setShowPoll(!showPoll)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="addPoll" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Add a poll to your post
              </label>
            </div>

            {/* Poll options (visible only when poll is toggled on) */}
            {showPoll && (
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Poll Question
                  </label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Ask your question..."
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-slate-800 dark:text-white"
                    required={showPoll}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Poll Options
                  </label>
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-grow px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-slate-800 dark:text-white"
                        required={showPoll}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  {pollOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={addPollOption}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      + Add another option
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={saveDraft}
                className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition-colors"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDraft(true);
                  setTimeout(() => document.forms[0].requestSubmit(), 0);
                }}
                className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Save as Draft
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {isLoading ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
