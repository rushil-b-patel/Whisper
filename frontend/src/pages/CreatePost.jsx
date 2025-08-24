import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostService } from '../context/PostContext';
import toast from 'react-hot-toast';
import Editor from '../components/Editor';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allowComments, setAllowComments] = useState(true);

  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [query, setQuery] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { createPost, getTag, saveTag } = usePostService();

  const editorRef = useRef();
  const titleRef = useRef();

  useEffect(() => {
    titleRef.current?.focus();

    const fetchTags = async () => {
      try {
        const tags = await getTag(token);
        console.log('Fetched tags (frontend):', tags);
        setAllTags(tags || []);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }
    };
    fetchTags();
  }, [token]);

  const filteredTags =
    query === ''
      ? allTags
      : allTags.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

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

    const content = await editorRef.current.save();
    const isDescriptionEmpty =
      !content.blocks ||
      content.blocks.length === 0 ||
      content.blocks.every((block) => !block.data.text?.trim());

    if (!title.trim() || selectedTags.length === 0 || isDescriptionEmpty) {
      toast.error('Title, at least one tag and a description are required');
      return;
    }

    try {
      setIsLoading(true);

      for (let tagName of selectedTags) {
        const already = allTags.some((t) => t.name.toLowerCase() === tagName.toLowerCase());
        if (!already) {
          try {
            const saved = await saveTag(token, tagName);
            const savedTag = saved?.tag ?? saved;
            if (savedTag) {
              setAllTags((prev) => {
                if (prev.some((t) => t.name.toLowerCase() === savedTag.name.toLowerCase()))
                  return prev;
                return [...prev, savedTag];
              });
            }
          } catch (err) {
            console.error('Failed to save tag:', err);
          }
        }
      }

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', JSON.stringify(content));
      formData.append('tags', JSON.stringify(selectedTags));
      formData.append('allowComments', allowComments);
      if (image) formData.append('image', image);

      const res = await createPost(token, formData);
      navigate(`/post/${res.postId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const discardPost = () => {
    setTitle('');
    setSelectedTags([]);
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
              maxLength={300}
              required
              placeholder="Give your post a title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1e1f23] font-mono"
            />
            <p className="text-sm text-gray-400 text-right font-mono mt-1">
              {title.length} / 300 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 font-mono">Tags</label>
            <Combobox
              value={null}
              onChange={(tag) => {
                if (tag && !selectedTags.includes(tag)) {
                  setSelectedTags((prev) => [...prev, tag]);
                }
                setQuery('');
              }}
            >
              <div className="relative">
                <ComboboxInput
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1e1f23] font-mono"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  displayValue={() => ''}
                  placeholder="Search or create tags"
                />

                {(filteredTags.length > 0 || query) && (
                  <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 text-black dark:text-white shadow-lg border border-gray-300 dark:border-gray-700">
                    {filteredTags.map((tag) => (
                      <ComboboxOption
                        key={tag._id}
                        value={tag.name}
                        className={({ active }) =>
                          `cursor-pointer select-none px-4 py-2 ${
                            active ? 'bg-gray-200 dark:bg-gray-700' : ''
                          }`
                        }
                      >
                        {tag.name}
                      </ComboboxOption>
                    ))}

                    {query &&
                      !allTags.some((t) => t.name.toLowerCase() === query.toLowerCase()) && (
                        <ComboboxOption
                          value={query}
                          className="cursor-pointer select-none px-4 py-2 text-indigo-500"
                        >
                          + Create “{query}”
                        </ComboboxOption>
                      )}
                  </ComboboxOptions>
                )}
              </div>
            </Combobox>

            {selectedTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center bg-gray-200 dark:bg-gray-700 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
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
