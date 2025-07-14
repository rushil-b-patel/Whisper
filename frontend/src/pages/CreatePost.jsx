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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
      navigate('/post/'+post.postId);
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
    <div className="min-h-screen py-8 px-4 bg-gray-50 dark:bg-[#0e1113]">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-[#131619] rounded-xl shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white font-mono">
            Post your Confession
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-slate-800 dark:text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your confession a title"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <div className="relative" ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-slate-800 dark:text-white flex justify-between items-center"
                >
                  <span>
                    {category
                      ? categories.find((c) => c.value === category)?.label
                      : 'Select a category'}
                  </span>
                  {categoryDropdownOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow max-h-60 overflow-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          setCategory(cat.value);
                          setCategoryDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <div className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-slate-800 dark:text-white resize-y min-h-[150px]">
                <Editor ref={editorRef} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Optional Image
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-lg flex items-center justify-center">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-48 rounded" />
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
                  <label className="cursor-pointer text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded hover:bg-gray-200 dark:hover:bg-slate-600">
                      Upload Image
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setCategory('');
                  setImage(null);
                  setImagePreview(null);
                  toast.success('Post discarded');
                }}
                className="px-5 py-2 bg-gray-600 text-white rounded hover:bg-gray-800"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-70"
              >
                {isLoading ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
