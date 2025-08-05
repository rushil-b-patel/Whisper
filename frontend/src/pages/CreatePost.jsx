import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostService } from '../context/PostContext';
import { ChevronDown, ChevronUp } from '../ui/Icons';
import toast from 'react-hot-toast';
import Editor from '../components/Editor';

const CATEGORIES = [
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

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allowComments, setAllowComments] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { createPost } = usePostService();

  const editorRef = useRef();
  const titleRef = useRef();
  const dropdownRef = useRef();

  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 50);
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category) {
      toast.error('Title and category are required');
      return;
    }

    try {
      setIsLoading(true);
      const content = await editorRef.current.save();

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', JSON.stringify(content));
      formData.append('category', category);
      formData.append('allowComments', allowComments);
      if (image) formData.append('image', image);

      const res = await createPost(token, formData);
      navigate(`/post/${res.postId}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to publish post');
    } finally {
      setIsLoading(false);
    }
  };

  const discardPost = () => {
    setTitle('');
    setCategory('');
    setImage(null);
    setImagePreview(null);
    toast.success('Post discarded');
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-white dark:bg-[#0e1113] text-black dark:text-white">
      <div className="max-w-3xl mx-auto border border-gray-200 dark:border-[#2A2B30] rounded-md p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10 font-mono border-l-4 pl-4 border-black dark:border-white">
          Create a Post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold mb-2 font-mono">Title</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
              placeholder="Give your post a title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1e1f23] font-mono"
            />
          </div>

          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-semibold mb-2 font-mono">Category</label>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1e1f23] font-mono flex justify-between items-center cursor-pointer"
            >
              {category ? CATEGORIES.find((c) => c.value === category)?.label : 'Select a category'}
              {dropdownOpen ? <ChevronUp /> : <ChevronDown />}
            </div>

            {dropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 z-10 w-full max-w-full bg-white dark:bg-[#1e1f23] border border-gray-300 dark:border-gray-700 rounded-md shadow max-h-60 overflow-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setCategory(cat.value);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 font-mono"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 font-mono">Description</label>
            <div className="border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-[#1e1f23]">
              <Editor ref={editorRef} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 font-mono">Image</label>
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
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <span className="inline-block px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200">
                    Upload Image
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allowComments"
              checked={allowComments}
              onChange={() => setAllowComments((prev) => !prev)}
              className="w-4 h-4 bg-black rounded dark:bg-gray-700"
            />
            <label htmlFor="allowComments" className="text-sm font-mono">
              Allow comments on this post
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={discardPost}
              className="px-6 py-2 bg-white text-black border border-black hover:bg-black hover:text-white transition-all font-mono rounded"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-black text-white border border-black hover:bg-white hover:text-black transition-all font-mono rounded disabled:opacity-60"
            >
              {isLoading ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
