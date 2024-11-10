import React, { useState } from 'react';
import { usePostService } from '../context/PostContext';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);

  const token = localStorage.getItem('token');
  const {createPost} = usePostService();

  const handleSubmit = async (e) =>  {
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

  return (
    <div className="bg-slate-200 dark:bg-black h-[calc(100vh-4em)] flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-black">Create a Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-black">Title</label>
            <input
              type="text"
              className="mt-1 p-2 w-full border rounded-lg shadow-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-black">Description</label>
            <textarea
              className="mt-1 p-2 w-full border rounded-lg shadow-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief description"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-black">Category</label>
            <select
              className="mt-1 p-2 w-full border rounded-lg shadow-sm"
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
            <label className="p-2 pl-0 text-lg font-medium text-black">Upload Image</label>
            <input
              type="file"
              className="p-2 border rounded-lg shadow-sm"
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
