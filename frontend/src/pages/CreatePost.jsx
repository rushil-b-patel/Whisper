import React, { useState } from 'react';
import { usePostService } from '../context/PostContext';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [length, setLength] = useState(300);

  const token = localStorage.getItem('token');
  const { createPost } = usePostService();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }
    await createPost(token, formData);
    setTitle('');
    setDescription('');
    setCategory('');
    setImage(null);
  };

  const handleDescriptionChange = (e) => {
    if (e.target.value.length <= length) {
      setDescription(e.target.value);
    }
  };

  return (
    <div className="dark:bg-black h-[calc(100vh-4em)] flex flex-col justify-center items-center">
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-8 max-w-2xl w-full shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-slate-600 dark:text-gray-400">Create Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-black dark:text-gray-300">Title</label>
            <input
              type="text"
              className="mt-1 p-2 w-full border rounded-lg shadow-sm dark:bg-gray-700 dark:text-gray-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-black dark:text-gray-300">Description</label>
            <textarea
              className="mt-1 p-2 w-full border rounded-lg shadow-sm dark:bg-gray-700 dark:text-gray-300"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter a brief description"
              required
            />
            <p className='flex justify-end text-sm text-gray-500 dark:text-gray-400'>{description.length}/{length} left</p>
          </div>

          <div>
            <label className="block text-lg font-medium text-black dark:text-gray-300">Category</label>
            <select
              className="mt-1 p-2 w-full border rounded-lg shadow-sm dark:bg-gray-700 dark:text-gray-300"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>Select a category</option>
              <option value="Tech">Tech</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Education">Education</option>
            </select>
          </div>

          <div className='flex justify-between content-center'>
            <label className="p-2 pl-0 text-lg font-medium text-black dark:text-gray-300">Upload Image</label>
            <input
              type="file"
              className="p-2 border rounded-lg shadow-sm dark:bg-gray-700 dark:text-gray-300"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Submit Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
