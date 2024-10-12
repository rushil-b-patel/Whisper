import { useNavigate } from 'react-router-dom';
import { Comment, ChevronDown, ChevronUp } from './Icons'

function PostCard({ post }) {
  const navigate = useNavigate(); // For navigation

  if (!post) return <div>Error: Data is missing...!</div>;

  // Handle redirect to single post
  const handleRedirect = () => {
    navigate(`/posts/${post.id}`);
  };

  return (
    <div 
    className='bg-white dark:bg-slate-800 p-6 cursor-pointer border border-gray-200 hover:bg-gray-50 mb-6 rounded-lg'  // Reduced width and added margin
    onClick={handleRedirect}
    >
      <div className="flex items-center mb-4">
        <img 
          src={post.avatar} 
          alt={post.author} 
          className='w-10 h-10 rounded-full mr-4'
        />
        <div>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-white'>author name</h2>
          <p className='text-sm text-gray-500 dark:text-gray-400'>username & designation</p>
        </div>
      </div>

      <p className='text-black font-semibold text-xl dark:text-white mb-4'>
        {post.title}
      </p>
      <p className='text-black dark:text-white mb-4'>
        {post.description}
      </p>

      {post.image && (
        <img 
          src={post.image} 
          alt={post.title} 
          className='w-full object-cover rounded-md mb-4' 
        />
      )}

      <div className="flex justify-between items-center">
        <div className='flex items-center text-black dark:text-white space-x-3'>
          <button className='flex items-center hover:text-blue-500'>
            <ChevronUp />
          </button>
          {/* votes(number) */}
          <button className='flex items-center'>
            <ChevronDown />
          </button>
          <button className='flex items-center'>
            <Comment />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
