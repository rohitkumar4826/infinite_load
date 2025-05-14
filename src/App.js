import React, { useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchPosts = async ({ pageParam = 1 }) => {
  const res = await axios.get(
    `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${pageParam}`
  );
  return res.data;
};

function App() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage, allPages) => {
      // Stop after 100 posts (API limit)
      if (allPages.length * 10 >= 100) return undefined;
      return allPages.length + 1;
    },
  });

  const loaderRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [fetchNextPage, hasNextPage]);

  return (
    <div className="min-h-screen text-white bg-[#040E27] p-6">
      <h1 className="text-3xl font-bold mb-6">Infinite Scroll with React Query</h1>

      <div className="space-y-4">
        {data?.pages.map((page, index) => (
          <React.Fragment key={index}>
            {page.map((post) => (
              <div key={post.id} className="bg-[#1E2A47] p-4 rounded-md shadow-md">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p>{post.body}</p>
              </div>
            ))}
          </React.Fragment>
        ))}
        {isFetchingNextPage && <p className="text-center">Loading more...</p>}
        <div ref={loaderRef} />
      </div>
    </div>
  );
}

export default App;
