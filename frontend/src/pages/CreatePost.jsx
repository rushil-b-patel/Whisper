import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostService } from '../context/PostContext';
import { ChevronDown, ChevronUp } from '../ui/Icons';
import toast from 'react-hot-toast';
import Editor from '../components/Editor';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { createPost } = usePostService();
  const categoryRef = useRef(null);
  const editorRef = useRef();
  const titleRef = useRef(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const editorContent = await editorRef.current.save();
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', JSON.stringify(editorContent));
      formData.append('category', category);
      if (image) formData.append('image', image);
      const post = await createPost(token, formData);
      navigate('/post/' + post.id);
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
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
    <div className="min-h-screen py-10 px-4 bg-white dark:bg-[#0e1113] text-black dark:text-white">
      <div className="max-w-3xl mx-auto border border-gray-200 dark:border-[#2A2B30] rounded-md p-6 sm:p-10 transition-all">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10 font-mono border-l-4 pl-4 border-black dark:border-white">
          Create a Post
        </h1>
        <div className="h-[1px] w-full bg-gray-300 dark:bg-slate-700 mb-6" />

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold mb-2 font-mono">Title</label>
            <input
              ref={titleRef}
              type="text"
              className="w-full px-4 py-2 bg-white dark:bg-[#1e1f23] border border-gray-300 dark:border-gray-700 rounded-md font-mono transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title"
              maxLength={100}
              required
            />
          </div>

          <div ref={categoryRef}>
            <label className="block text-sm font-semibold mb-2 font-mono">Category</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full px-4 py-2 border-b border-gray-300 dark:border-gray-700 bg-transparent flex justify-between items-center font-mono"
              >
                <span>
                  {category
                    ? categories.find((c) => c.value === category)?.label
                    : 'Select a category'}
                </span>
                {categoryDropdownOpen ? <ChevronUp /> : <ChevronDown />}
              </button>

              {categoryDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow max-h-60 overflow-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setCategory(cat.value);
                        setCategoryDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 font-mono"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 font-mono">Description</label>
            <div className="w-full border-b border-gray-300 dark:border-gray-700">
              <Editor ref={editorRef} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 font-mono">Optional Image</label>
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 flex items-center justify-center">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-48 rounded shadow" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer text-sm font-mono text-gray-600 dark:text-gray-300">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <span className="inline-block px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200">
                    Upload Image
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => {
                setTitle('');
                setCategory('');
                setImage(null);
                setImagePreview(null);
                toast.success('Post discarded');
              }}
              className="px-6 py-2 bg-white text-black border border-black hover:bg-black hover:text-white transition-all duration-300 font-mono rounded"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-black text-white border border-black hover:bg-white hover:text-black transition-all duration-300 font-mono rounded disabled:opacity-60"
            >
              {isLoading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
